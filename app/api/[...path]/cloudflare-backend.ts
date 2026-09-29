import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { compare, hash } from "bcryptjs";

type Sql = NeonQueryFunction<false, false>;
// Neon rows are runtime data with a schema validated by the existing Flyway migrations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const COOKIE = "RANBANK_SESSION_V2";
const SESSION_SECONDS = 30 * 60;
const noStore = { "cache-control": "no-store" };

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { ...noStore, ...headers } });
const error = (message: string, status = 400) => json({ message }, status);
const money = (value: unknown) => Number(value ?? 0);
const digits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

function cookieValue(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  return raw.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) ?? "";
}

function sessionCookie(token: string, maxAge = SESSION_SECONDS) {
  return `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function token() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function body(request: Request): Promise<Row> {
  try { return await request.json() as Row; } catch { return {}; }
}

async function accountForSession(sql: Sql, request: Request) {
  const raw = cookieValue(request);
  if (!raw) return null;
  const hash = await sha256(raw);
  const rows = await sql.query(
    `SELECT a.* FROM bank_sessions s JOIN bank_accounts a ON a.id=s.account_id
     WHERE s.token_hash=$1 AND s.expires_at>CURRENT_TIMESTAMP AND a.active=TRUE`, [hash]);
  if (!rows[0]) return null;
  await sql.query(`UPDATE bank_sessions SET expires_at=CURRENT_TIMESTAMP + INTERVAL '30 minutes' WHERE token_hash=$1`, [hash]);
  return { account: rows[0] as Row, raw };
}

function withSession(response: Response, raw: string) {
  const headers = new Headers(response.headers);
  headers.append("set-cookie", sessionCookie(raw));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function transaction(row: Row) {
  return { id: Number(row.id), title: row.title, detail: row.detail, amount: money(row.amount), type: row.type, occurredAt: row.occurred_at };
}

function accountView(row: Row) {
  const document = String(row.document_id ?? "");
  return {
    id: Number(row.id), customerName: row.customer_name, accountNumber: row.account_number,
    email: row.email, phoneNumber: row.phone_number,
    maskedDocument: /^\d{11}$/.test(document) ? `•••.•••.•••-${document.slice(9)}` : "Não disponível",
    role: row.role, active: Boolean(row.active), deleted: Boolean(row.deleted_at),
    balance: money(row.balance), createdAt: row.created_at,
  };
}

async function dashboard(sql: Sql, account: Row) {
  const tx = await sql.query(`SELECT * FROM bank_transactions WHERE account_id=$1 ORDER BY occurred_at DESC NULLS LAST,id DESC`, [account.id]);
  const document = String(account.document_id ?? "");
  const number = digits(account.account_number);
  return {
    customerName: account.customer_name, balance: money(account.balance), account: account.account_number,
    email: account.email, phoneNumber: formatPhone(account.phone_number),
    maskedDocument: document.length >= 4 ? `•••.•••.•••-${document.slice(-2)}` : "Não informado",
    role: account.role, createdAt: account.created_at,
    card: {
      lastFour: number.slice(-4).padStart(4, "0"), blocked: Boolean(account.card_blocked),
      limit: money(account.card_limit), spent: money(account.card_spent),
      available: Math.max(0, money(account.card_limit) - money(account.card_spent)),
    },
    transactions: tx.map(transaction),
  };
}

async function bankingOverview(sql: Sql, account: Row) {
  const [tx, schedules] = await Promise.all([
    sql.query(`SELECT * FROM bank_transactions WHERE account_id=$1 ORDER BY occurred_at DESC NULLS LAST,id DESC`, [account.id]),
    sql.query(`SELECT * FROM scheduled_operation WHERE account_id=$1 ORDER BY scheduled_date,id`, [account.id]),
  ]);
  const number = digits(account.account_number);
  return {
    customerName: account.customer_name, cardLastFour: number.slice(-4).padStart(4, "0"),
    balance: money(account.balance), savingsBalance: money(account.savings_balance), savingsGoal: money(account.savings_goal),
    card: { blocked: Boolean(account.card_blocked), limit: money(account.card_limit), spent: money(account.card_spent), available: Math.max(0, money(account.card_limit) - money(account.card_spent)) },
    statement: tx.map(transaction),
    schedules: schedules.map(row => ({ id: Number(row.id), kind: row.kind, recipient: row.recipient, amount: money(row.amount), scheduledDate: row.scheduled_date, status: row.status })),
  };
}

function formatPhone(phone: unknown) {
  const value = digits(phone);
  if (value.length !== 10 && value.length !== 11) return null;
  const split = value.length === 11 ? 7 : 6;
  return `(${value.slice(0, 2)}) ${value.slice(2, split)}-${value.slice(split)}`;
}

function normalizePixKey(value: unknown) {
  const raw = String(value ?? "").trim();
  return raw.includes("@") ? raw.toLowerCase() : digits(raw) || raw.toLowerCase();
}

async function createDemoAccount(sql: Sql, request: Request) {
  const data = await body(request);
  const customerName = String(data.customerName ?? "").trim();
  const documentId = digits(data.documentId); const email = String(data.email ?? "").trim().toLowerCase();
  const phone = digits(data.phoneNumber); const accessPin = String(data.accessPin ?? ""); const transactionPin = String(data.transactionPin ?? "");
  if (!customerName || documentId.length !== 11 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10,11}$/.test(phone) || !/^\d{4}$/.test(accessPin) || !/^\d{4}$/.test(transactionPin)) {
    return error("Confira nome, CPF, e-mail, telefone e os PINs de quatro dígitos.", 400);
  }
  const conflicts = await sql.query(`SELECT 1 FROM bank_accounts WHERE document_id=$1 OR LOWER(email)=$2 OR phone_number=$3 UNION ALL SELECT 1 FROM pix_keys WHERE normalized_key IN ($1,$2,$3) LIMIT 1`, [documentId, email, phone]);
  if (conflicts.length) return error("CPF, e-mail ou telefone já está vinculado a uma conta.", 409);
  const id = crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000;
  const accountNumber = `${String(id).padStart(6, "0")}-${id % 10}`;
  const [accessHash, transactionHash] = await Promise.all([hash(accessPin, 10), hash(transactionPin, 10)]);
  await sql.query(`INSERT INTO bank_accounts(id,customer_name,account_number,account_number_normalized,email,phone_number,balance,document_id,access_pin_hash,transaction_pin_hash,savings_balance,savings_goal,card_limit,card_spent,card_blocked,role,created_at,active,version) VALUES($1,$2,$3,$4,$5,$6,2500,$7,$8,$9,0,5000,6000,0,FALSE,'CUSTOMER',CURRENT_TIMESTAMP,TRUE,0)`, [id, customerName, accountNumber, digits(accountNumber), email, phone, documentId, accessHash, transactionHash]);
  await sql.query(`INSERT INTO pix_keys(account_id,key_type,normalized_key,display_key,created_at) VALUES($1,'EMAIL',$2,$2,CURRENT_TIMESTAMP),($1,'CPF',$3,$4,CURRENT_TIMESTAMP),($1,'PHONE',$5,$6,CURRENT_TIMESTAMP)`, [id, email, documentId, `${documentId.slice(0,3)}.${documentId.slice(3,6)}.${documentId.slice(6,9)}-${documentId.slice(9)}`, phone, formatPhone(phone)]);
  const raw = token(); await sql.query(`INSERT INTO bank_sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,CURRENT_TIMESTAMP + INTERVAL '30 minutes',CURRENT_TIMESTAMP)`, [await sha256(raw), id]);
  return json({ accountId: id, customerName, accountNumber, pixKey: email, balance: 2500, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000).toISOString() }, 201, { "set-cookie": sessionCookie(raw) });
}

async function recoverPin(sql: Sql, request: Request) {
  const data = await body(request); const identification = String(data.identification ?? "").trim();
  const rows = await sql.query(`SELECT * FROM bank_accounts WHERE deleted_at IS NULL AND (document_id=$1 OR account_number_normalized=$1 OR LOWER(email)=LOWER($2)) LIMIT 1`, [digits(identification), identification]);
  const account = rows[0] as Row | undefined;
  if (!account || String(account.email).toLowerCase() !== String(data.email ?? "").trim().toLowerCase() || !account.transaction_pin_hash || !(await compare(String(data.transactionPin ?? ""), account.transaction_pin_hash))) return error("Não foi possível validar os dados informados.", 401);
  if (!/^\d{4}$/.test(String(data.newAccessPin ?? ""))) return error("O novo PIN deve ter quatro dígitos.", 400);
  await sql.query(`UPDATE bank_accounts SET access_pin_hash=$2,version=version+1 WHERE id=$1`, [account.id, await hash(String(data.newAccessPin), 10)]);
  await sql.query(`DELETE FROM bank_sessions WHERE account_id=$1`, [account.id]);
  return json({ message: "PIN de acesso redefinido. Entre novamente com o novo PIN." });
}

async function login(sql: Sql, request: Request) {
  const data = await body(request);
  const identification = String(data.identification ?? "").trim();
  const pin = String(data.pin ?? "");
  if (!identification || !/^\d{4}$/.test(pin)) return error("Informe seu CPF ou sua conta e um PIN de quatro dígitos.", 400);
  const normalized = digits(identification);
  const rows = await sql.query(
    `SELECT * FROM bank_accounts WHERE deleted_at IS NULL AND
     (document_id=$1 OR account_number_normalized=$1 OR LOWER(email)=LOWER($2)) LIMIT 1`, [normalized, identification]);
  const account = rows[0] as Row | undefined;
  if (!account || !account.active || !account.access_pin_hash || !(await compare(pin, account.access_pin_hash))) {
    return error(account && !account.active ? "Esta conta está desativada. Procure o administrador." : "CPF, conta ou PIN inválido.", account && !account.active ? 403 : 401);
  }
  const raw = token();
  const hash = await sha256(raw);
  await sql.query(`DELETE FROM bank_sessions WHERE account_id=$1 OR expires_at<=CURRENT_TIMESTAMP`, [account.id]);
  await sql.query(`INSERT INTO bank_sessions(token_hash,account_id,expires_at,created_at) VALUES($1,$2,CURRENT_TIMESTAMP + INTERVAL '30 minutes',CURRENT_TIMESTAMP)`, [hash, account.id]);
  return json({ customerName: account.customer_name, accountNumber: account.account_number, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000).toISOString() }, 200, { "set-cookie": sessionCookie(raw) });
}

async function verifyTransactionPin(data: Row, account: Row) {
  const pin = String(data.transactionPin ?? "");
  return /^\d{4}$/.test(pin) && account.transaction_pin_hash && await compare(pin, account.transaction_pin_hash);
}

async function authenticated(sql: Sql, request: Request, path: string) {
  const session = await accountForSession(sql, request);
  if (!session) return error("Entre no RanBank para continuar.", 401);
  const { account, raw } = session;
  const method = request.method.toUpperCase();
  let response: Response;

  if (method === "GET" && path === "auth/session") {
    response = json({ customerName: account.customer_name, accountNumber: account.account_number });
  } else if (method === "GET" && path === "dashboard") {
    response = json(await dashboard(sql, account));
  } else if (method === "GET" && path === "banking/overview") {
    response = json(await bankingOverview(sql, account));
  } else if (method === "PATCH" && path === "banking/card/toggle") {
    const rows = await sql.query(`UPDATE bank_accounts SET card_blocked=NOT card_blocked,version=version+1 WHERE id=$1 RETURNING card_blocked,card_limit,card_spent`, [account.id]);
    const row = rows[0] as Row;
    response = json({ blocked: row.card_blocked, limit: money(row.card_limit), spent: money(row.card_spent), available: Math.max(0, money(row.card_limit) - money(row.card_spent)) });
  } else if (method === "PUT" && path === "banking/card/limit") {
    const data = await body(request); const limit = money(data.limit);
    if (!(await verifyTransactionPin(data, account))) return error("PIN transacional inválido.", 401);
    if (limit < money(account.card_spent) || limit > 20000) return error("O limite deve cobrir a fatura atual e não pode ultrapassar R$ 20.000,00.", 422);
    const rows = await sql.query(`UPDATE bank_accounts SET card_limit=$2,version=version+1 WHERE id=$1 RETURNING card_blocked,card_limit,card_spent`, [account.id, limit]);
    const row = rows[0] as Row;
    response = json({ blocked: row.card_blocked, limit: money(row.card_limit), spent: money(row.card_spent), available: Math.max(0, money(row.card_limit) - money(row.card_spent)) });
  } else if (method === "POST" && (path === "banking/savings/deposit" || path === "banking/savings/withdraw")) {
    const data = await body(request); const amount = money(data.amount); const deposit = path.endsWith("deposit");
    if (!(await verifyTransactionPin(data, account))) return error("PIN transacional inválido.", 401);
    if (amount <= 0) return error("Informe um valor positivo.", 422);
    if (deposit && amount > money(account.balance)) return error("Saldo insuficiente para realizar esta operação.", 422);
    if (!deposit && amount > money(account.savings_balance)) return error("Saldo insuficiente no cofrinho.", 422);
    const rows = await sql.query(
      `UPDATE bank_accounts SET balance=balance+$2,savings_balance=savings_balance+$3,version=version+1 WHERE id=$1 RETURNING *`,
      [account.id, deposit ? -amount : amount, deposit ? amount : -amount]);
    await sql.query(`INSERT INTO bank_transactions(account_id,title,detail,amount,type,occurred_at,status) VALUES($1,$2,'Reserva Future · agora',$3,$4,CURRENT_TIMESTAMP,'COMPLETED')`,
      [account.id, deposit ? "Aplicação no cofrinho" : "Resgate do cofrinho", deposit ? -amount : amount, deposit ? "debit" : "credit"]);
    response = json(await bankingOverview(sql, rows[0] as Row));
  } else if (method === "POST" && path === "banking/bills") {
    const data = await body(request); const amount = money(data.amount); const barcode = digits(data.barcode); const payee = String(data.payee ?? "").trim();
    if (barcode.length < 44 || barcode.length > 48) return error("O código de barras deve ter entre 44 e 48 dígitos.", 422);
    if (!(await verifyTransactionPin(data, account))) return error("PIN transacional inválido.", 401);
    if (amount <= 0 || amount > money(account.balance)) return error(amount <= 0 ? "Informe um valor positivo." : "Saldo insuficiente para realizar esta operação.", 422);
    await sql.query(`UPDATE bank_accounts SET balance=balance-$2,version=version+1 WHERE id=$1`, [account.id, amount]);
    const rows = await sql.query(`INSERT INTO bank_transactions(account_id,title,detail,amount,type,occurred_at,status) VALUES($1,'Boleto pago',$2,$3,'debit',CURRENT_TIMESTAMP,'COMPLETED') RETURNING *`, [account.id, `${payee} · cód. ${barcode.slice(-6)}`, -amount]);
    const row = rows[0] as Row; response = json({ transactionId: Number(row.id), operation: "Boleto", recipient: payee, amount, detail: row.detail, timestamp: new Date().toISOString(), authentication: "PIN transacional + sessão protegida" }, 201);
  } else if (method === "POST" && path === "banking/schedules") {
    const data = await body(request); const amount = money(data.amount); const date = String(data.scheduledDate ?? ""); const key = String(data.pixKey ?? "").trim();
    if (!(await verifyTransactionPin(data, account))) return error("PIN transacional inválido.", 401);
    if (amount <= 0 || amount > money(account.balance)) return error(amount <= 0 ? "Informe um valor positivo." : "O valor agendado ultrapassa o saldo atual.", 422);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < new Date().toISOString().slice(0, 10)) return error("Escolha hoje ou uma data futura.", 422);
    const masked = key.includes("@") ? key : `Chave Pix ****${normalizePixKey(key).slice(-4)}`;
    const rows = await sql.query(`INSERT INTO scheduled_operation(account_id,kind,recipient,amount,scheduled_date,status) VALUES($1,'PIX',$2,$3,$4,'AGENDADO') RETURNING *`, [account.id, masked, amount, date]);
    const row = rows[0] as Row; response = json({ id: Number(row.id), kind: row.kind, recipient: row.recipient, amount: money(row.amount), scheduledDate: row.scheduled_date, status: row.status }, 201);
  } else if (method === "GET" && path === "analytics/summary") {
    const rows = await sql.query(`SELECT amount FROM bank_transactions WHERE account_id=$1 ORDER BY id`, [account.id]);
    const series = rows.map(row => money(row.amount)); const credits = series.filter(v => v > 0); const debits = series.filter(v => v < 0).map(Math.abs);
    const totalIn = credits.reduce((a, b) => a + b, 0); const totalOut = debits.reduce((a, b) => a + b, 0);
    response = json({ totalTransactions: series.length, creditCount: credits.length, debitCount: debits.length, totalIn, totalOut, averageOut: debits.length ? Math.round(totalOut / debits.length * 100) / 100 : 0, largestOut: Math.max(0, ...debits), series });
  } else if (method === "GET" && path === "devices") {
    const rows = await sql.query(`SELECT * FROM connected_devices WHERE account_id=$1 ORDER BY id`, [account.id]);
    response = json(rows.map(row => ({ id: Number(row.id), name: row.name, type: row.type, location: row.location, lastAccess: row.last_access, trusted: row.trusted, blocked: row.blocked })));
  } else if (method === "PATCH" && /^devices\/\d+\/block$/.test(path)) {
    const id = Number(path.split("/")[1]);
    const rows = await sql.query(`UPDATE connected_devices SET blocked=NOT blocked WHERE id=$1 AND account_id=$2 RETURNING *`, [id, account.id]);
    if (!rows[0]) return error("Dispositivo não encontrado.", 404);
    const row = rows[0] as Row; response = json({ id: Number(row.id), name: row.name, type: row.type, location: row.location, lastAccess: row.last_access, trusted: row.trusted, blocked: row.blocked });
  } else if (method === "GET" && path === "notifications") {
    const rows = await sql.query(`SELECT * FROM notifications WHERE account_id=$1 ORDER BY created_at DESC`, [account.id]);
    response = json(rows.map(row => ({ id: Number(row.id), type: row.notification_type, title: row.title, message: row.message, referenceId: row.reference_id, createdAt: row.created_at, read: Boolean(row.read_at) })));
  } else if (method === "PATCH" && path === "notifications/read-all") {
    await sql.query(`UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE account_id=$1`, [account.id]);
    response = json({ message: "Notificações marcadas como lidas." });
  } else if (method === "GET" && path === "notifications/stream") {
    response = new Response(null, { status: 204, headers: noStore });
  } else if (method === "PATCH" && /^notifications\/\d+\/read$/.test(path)) {
    const id = Number(path.split("/")[1]); const rows = await sql.query(`UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=$1 AND account_id=$2 RETURNING *`, [id, account.id]);
    if (!rows[0]) return error("Notificação não encontrada.", 404);
    const row = rows[0] as Row; response = json({ id: Number(row.id), type: row.notification_type, title: row.title, message: row.message, referenceId: row.reference_id, createdAt: row.created_at, read: true });
  } else if (method === "GET" && path === "admin/accounts") {
    if (account.role !== "ADMIN") return error("Acesso restrito à administração.", 403);
    const rows = await sql.query(`SELECT * FROM bank_accounts ORDER BY created_at`);
    response = json(rows.map(accountView));
  } else if (method === "PATCH" && /^admin\/accounts\/\d+\/status$/.test(path)) {
    if (account.role !== "ADMIN") return error("Acesso restrito à administração.", 403);
    const id = Number(path.split("/")[2]); if (id === 1) return error("A conta principal da apresentação é protegida.", 403);
    const data = await body(request); const rows = await sql.query(`UPDATE bank_accounts SET active=$2,version=version+1 WHERE id=$1 AND deleted_at IS NULL RETURNING *`, [id, Boolean(data.active)]);
    if (!rows[0]) return error("Conta não encontrada.", 403); if (!data.active) await sql.query(`DELETE FROM bank_sessions WHERE account_id=$1`, [id]);
    response = json(accountView(rows[0] as Row));
  } else if (method === "DELETE" && /^admin\/accounts\/\d+$/.test(path)) {
    if (account.role !== "ADMIN") return error("Acesso restrito à administração.", 403);
    const id = Number(path.split("/")[2]); if (id === 1) return error("A conta principal da apresentação é protegida.", 403);
    await sql.query(`DELETE FROM bank_sessions WHERE account_id=$1`, [id]); await sql.query(`DELETE FROM pix_keys WHERE account_id=$1`, [id]);
    const rows = await sql.query(`UPDATE bank_accounts SET active=FALSE,deleted_at=CURRENT_TIMESTAMP,customer_name='Conta removida',document_id='deleted-'||id,email='deleted-'||id||'@ranbank.invalid',phone_number=NULL,access_pin_hash=NULL,transaction_pin_hash=NULL,card_blocked=TRUE,version=version+1 WHERE id=$1 RETURNING id`, [id]);
    if (!rows[0]) return error("Conta não encontrada.", 403); response = json({ message: "Conta removida e dados pessoais anonimizados. O histórico financeiro foi preservado." });
  } else if (method === "GET" && path === "admin/insights/summary") {
    if (account.role !== "ADMIN") return error("Acesso restrito ao Insights administrativo.", 403);
    const rows = await sql.query(`SELECT (SELECT COUNT(*) FROM bank_accounts) total_accounts,(SELECT COUNT(*) FROM bank_accounts WHERE active) active_accounts,(SELECT COALESCE(SUM(balance),0) FROM bank_accounts) total_deposits,(SELECT COUNT(*) FROM bank_transactions) total_transactions,(SELECT COALESCE(SUM(ABS(amount)),0) FROM bank_transactions) transaction_volume,(SELECT COUNT(*) FROM pix_transfers) pix_transfers,(SELECT COUNT(*) FROM notifications WHERE read_at IS NULL) unread_notifications,(SELECT COUNT(*) FROM flow_executions) flow_executions`);
    const row = rows[0] as Row; response = json({ generatedAt: new Date().toISOString(), totalAccounts: Number(row.total_accounts), activeAccounts: Number(row.active_accounts), totalDeposits: money(row.total_deposits), totalTransactions: Number(row.total_transactions), transactionVolume: money(row.transaction_volume), pixTransfers: Number(row.pix_transfers), unreadNotifications: Number(row.unread_notifications), flowExecutions: Number(row.flow_executions) });
  } else if (method === "GET" && path === "pix/keys") {
    const rows = await sql.query(`SELECT * FROM pix_keys WHERE account_id=$1 ORDER BY id`, [account.id]);
    response = json(rows.map(row => ({ id: Number(row.id), type: row.key_type, value: row.display_key, createdAt: row.created_at })));
  } else if (method === "POST" && path === "pix/keys") {
    const data = await body(request); const type = String(data.type ?? "").trim().toUpperCase(); let normalized = ""; let display = "";
    if (type === "EMAIL") { normalized = String(data.value ?? "").trim().toLowerCase(); display = normalized; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return error("Informe um e-mail válido.", 422); }
    else if (type === "CPF") { normalized = digits(data.value); display = normalized; if (normalized !== account.document_id) return error("A chave CPF deve pertencer ao titular da conta.", 422); }
    else if (type === "PHONE") { normalized = digits(data.value); display = formatPhone(normalized) ?? normalized; if (account.phone_number && normalized !== account.phone_number) return error("A chave telefone deve usar o número cadastrado no perfil.", 422); }
    else if (type === "RANDOM") { normalized = crypto.randomUUID(); display = normalized; }
    else return error("Tipo de chave inválido. Use EMAIL, CPF, PHONE ou RANDOM.", 422);
    const exists = await sql.query(`SELECT 1 FROM pix_keys WHERE normalized_key=$1`, [normalized]); if (exists.length) return error("Esta chave Pix já está cadastrada.", 422);
    const rows = await sql.query(`INSERT INTO pix_keys(account_id,key_type,normalized_key,display_key,created_at) VALUES($1,$2,$3,$4,CURRENT_TIMESTAMP) RETURNING *`, [account.id, type, normalized, display]);
    const row = rows[0] as Row; response = json({ id: Number(row.id), type: row.key_type, value: row.display_key, createdAt: row.created_at }, 201);
  } else if (method === "DELETE" && /^pix\/keys\/\d+$/.test(path)) {
    const id = Number(path.split("/")[2]); const count = await sql.query(`SELECT COUNT(*) count FROM pix_keys WHERE account_id=$1`, [account.id]);
    if (Number(count[0].count) <= 1) return error("Mantenha pelo menos uma chave Pix ativa.", 422);
    const rows = await sql.query(`DELETE FROM pix_keys WHERE id=$1 AND account_id=$2 RETURNING id`, [id, account.id]); if (!rows[0]) return error("Chave Pix não encontrada.", 422);
    response = json({ message: "Chave Pix removida." });
  } else if (method === "GET" && path === "pix/recipients/resolve") {
    const key = new URL(request.url).searchParams.get("key")?.trim() ?? "";
    const normalized = key.includes("@") ? key.toLowerCase() : digits(key) || key.toLowerCase();
    const rows = await sql.query(`SELECT a.id,a.customer_name,a.account_number,k.display_key,k.key_type FROM pix_keys k JOIN bank_accounts a ON a.id=k.account_id WHERE k.normalized_key=$1 AND a.active=TRUE`, [normalized]);
    const row = rows[0] as Row | undefined;
    if (!row || Number(row.id) === Number(account.id)) return error(row ? "Não é possível enviar Pix para a própria conta." : "Chave Pix não encontrada.", 422);
    response = json({ accountId: Number(row.id), name: row.customer_name, accountNumber: row.account_number, keyType: row.key_type, maskedKey: row.display_key });
  } else if (method === "POST" && (path === "pix/transfers" || path === "transactions")) {
    const data = await body(request); const amount = money(data.amount); const normalized = normalizePixKey(data.pixKey); const idempotency = (request.headers.get("idempotency-key") || crypto.randomUUID()).slice(0, 64);
    if (!(await verifyTransactionPin(data, account))) return error("PIN transacional inválido.", 401);
    if (amount <= 0 || amount > money(account.balance)) return error(amount <= 0 ? "Informe um valor positivo." : "Saldo insuficiente para realizar este Pix.", 422);
    const existing = await sql.query(`SELECT p.*,a.customer_name,a.account_number,t.id transaction_id FROM pix_transfers p JOIN bank_accounts a ON a.id=p.recipient_account_id LEFT JOIN bank_transactions t ON t.account_id=p.sender_account_id AND t.transfer_id=p.id WHERE p.sender_account_id=$1 AND p.idempotency_key=$2 LIMIT 1`, [account.id, idempotency]);
    let receipt: Row;
    if (existing[0]) receipt = existing[0] as Row;
    else {
      const recipients = await sql.query(`SELECT a.* FROM pix_keys k JOIN bank_accounts a ON a.id=k.account_id WHERE k.normalized_key=$1 AND a.active=TRUE`, [normalized]); const recipient = recipients[0] as Row | undefined;
      if (!recipient || Number(recipient.id) === Number(account.id)) return error(recipient ? "Não é possível enviar Pix para a própria conta." : "Chave Pix não encontrada.", 422);
      const transferId = crypto.randomUUID();
      await sql.query(`UPDATE bank_accounts SET balance=balance-$2,version=version+1 WHERE id=$1`, [account.id, amount]);
      await sql.query(`UPDATE bank_accounts SET balance=balance+$2,version=version+1 WHERE id=$1`, [recipient.id, amount]);
      await sql.query(`INSERT INTO pix_transfers(id,sender_account_id,recipient_account_id,pix_key,amount,idempotency_key,status,created_at) VALUES($1,$2,$3,$4,$5,$6,'COMPLETED',CURRENT_TIMESTAMP)`, [transferId, account.id, recipient.id, normalized, amount, idempotency]);
      const tx = await sql.query(`INSERT INTO bank_transactions(account_id,title,detail,amount,type,transfer_id,counterparty_account_id,occurred_at,status,idempotency_key) VALUES($1,'Pix enviado',$2,$3,'debit',$4,$5,CURRENT_TIMESTAMP,'COMPLETED',$6) RETURNING id`, [account.id, `${recipient.customer_name} · agora`, -amount, transferId, recipient.id, idempotency]);
      await sql.query(`INSERT INTO bank_transactions(account_id,title,detail,amount,type,transfer_id,counterparty_account_id,occurred_at,status) VALUES($1,'Pix recebido',$2,$3,'credit',$4,$5,CURRENT_TIMESTAMP,'COMPLETED')`, [recipient.id, `${account.customer_name} · agora`, amount, transferId, account.id]);
      await sql.query(`INSERT INTO notifications(account_id,notification_type,title,message,reference_id,created_at) VALUES($1,'PIX_SENT','Pix enviado',$2,$3,CURRENT_TIMESTAMP),($4,'PIX_RECEIVED','Pix recebido',$5,$3,CURRENT_TIMESTAMP)`, [account.id, `Seu Pix de R$ ${amount.toFixed(2)} para ${recipient.customer_name} foi concluído.`, transferId, recipient.id, `Você recebeu R$ ${amount.toFixed(2)} de ${account.customer_name}.`]);
      receipt = { id: transferId, transaction_id: tx[0].id, status: "COMPLETED", amount, created_at: new Date().toISOString(), customer_name: recipient.customer_name, account_number: recipient.account_number, pix_key: normalized, idempotency_key: idempotency };
    }
    const pixReceipt = { transferId: receipt.id, transactionId: Number(receipt.transaction_id), status: receipt.status, amount: money(receipt.amount), timestamp: receipt.created_at, recipientName: receipt.customer_name, recipientAccount: receipt.account_number, maskedPixKey: `••••${String(receipt.pix_key).slice(-4)}`, idempotencyKey: receipt.idempotency_key };
    response = path === "transactions" ? json({ id: pixReceipt.transactionId, title: "Pix enviado", detail: `${pixReceipt.recipientName} · agora`, amount: -pixReceipt.amount, type: "debit" }, 201) : json(pixReceipt, 201);
  } else if (method === "POST" && path === "automation/run") {
    const steps = [
      { order: 1, title: "Receber alerta", description: "Evento recebido e validado.", responsibility: "AUTOMATIC", duration: "35 ms" },
      { order: 2, title: "Enriquecer contexto", description: "Conta, dispositivo e histórico correlacionados.", responsibility: "AUTOMATIC", duration: "82 ms" },
      { order: 3, title: "Aplicar regras", description: "Risco e prioridade calculados.", responsibility: "AUTOMATIC", duration: "41 ms" },
      { order: 4, title: "Revisão humana", description: "Caso disponibilizado para decisão do analista.", responsibility: "HUMAN", duration: "1,2 s" },
      { order: 5, title: "Notificar e auditar", description: "Resultado persistido e comunicado.", responsibility: "AUTOMATIC", duration: "64 ms" },
    ];
    const id = crypto.randomUUID(); const startedAt = new Date().toISOString();
    await sql.query(`INSERT INTO flow_executions(id,account_id,flow_type,trigger_type,status,steps_json,started_at,completed_at) VALUES($1,$2,'INCIDENT_RESPONSE','MANUAL','COMPLETED',$3,$4,CURRENT_TIMESTAMP)`, [id, account.id, JSON.stringify(steps), startedAt]);
    response = json({ incidentId: `INC-${id.slice(0,8).toUpperCase()}`, startedAt, status: "CONCLUÍDO COM REVISÃO HUMANA", steps: steps.map(step => ({ ...step, responsibility: step.responsibility === "HUMAN" ? "Humano" : "Automático" })), limitation: "O fluxo organiza a resposta, mas não substitui antivírus, autenticação, firewall ou julgamento humano." });
  } else if (method === "GET" && path === "automation/executions") {
    const rows = await sql.query(`SELECT * FROM flow_executions WHERE account_id=$1 ORDER BY started_at DESC`, [account.id]);
    response = json(rows.map(row => ({ id: row.id, flowType: row.flow_type, triggerType: row.trigger_type, referenceId: row.reference_id, status: row.status, startedAt: row.started_at, completedAt: row.completed_at, steps: JSON.parse(row.steps_json) })));
  } else if (method === "POST" && path === "demo/reset") {
    if (Number(account.id) !== 1) return error("A restauração existe apenas para a conta de apresentação.", 403);
    for (const table of ["scheduled_operation", "bank_transactions", "connected_devices", "notifications", "flow_executions", "audit_events"]) {
      await sql.query(`DELETE FROM ${table} WHERE account_id=1`);
    }
    await sql.query(`UPDATE bank_accounts SET balance=8540.75,savings_balance=0,savings_goal=5000,card_limit=6000,card_spent=1248.90,card_blocked=FALSE,version=version+1 WHERE id=1`);
    await sql.query(`INSERT INTO bank_transactions(account_id,title,detail,amount,type,occurred_at,status) VALUES (1,'Pix recebido','Maria Silva',250,'credit',CURRENT_TIMESTAMP-INTERVAL '18 minutes','COMPLETED'),(1,'Transferência enviada','João Pereira',-120,'debit',CURRENT_TIMESTAMP-INTERVAL '127 minutes','COMPLETED'),(1,'Pagamento','Supermercado Bom Preço',-89.90,'debit',CURRENT_TIMESTAMP-INTERVAL '27 hours','COMPLETED'),(1,'Compra no cartão','Livraria Cultura',-45.60,'debit',CURRENT_TIMESTAMP-INTERVAL '30 hours 12 minutes','COMPLETED')`);
    await sql.query(`INSERT INTO connected_devices(account_id,name,type,location,last_access,trusted,blocked) VALUES(1,'iPhone de Ana','Celular','Brasília - DF','Agora',TRUE,FALSE),(1,'Notebook pessoal','Computador','Brasília - DF','Hoje, 20:14',TRUE,FALSE),(1,'Galaxy S24','Celular','Taguatinga, DF','Hoje, 03:18',FALSE,FALSE),(1,'Caixa eletrônico 0842','Terminal IoT','Asa Sul, Brasília - DF','Ontem, 17:42',TRUE,FALSE)`);
    response = json({ message: "Demonstração restaurada com sucesso." });
  } else {
    response = error("Esta função ainda não foi migrada para a nova API.", 501);
  }
  return withSession(response, raw);
}

async function publicSimulation(path: string, request: Request): Promise<Response | null> {
  if (request.method === "POST" && path === "fraud/analyze") {
    const data = await body(request); let score = 5; const signals: Row[] = [];
    if (money(data.amount) >= 2000) { score += 30; signals.push({ name: "Valor fora do padrão", weight: "+30", explanation: "A compra supera o limite habitual da conta demonstrativa." }); }
    if (data.newDevice) { score += 25; signals.push({ name: "Dispositivo não reconhecido", weight: "+25", explanation: "A transação veio de um aparelho ainda não autorizado." }); }
    if (data.unusualLocation) { score += 20; signals.push({ name: "Localização incomum", weight: "+20", explanation: "A região difere dos acessos recentes da conta." }); }
    if (data.unusualTime) { score += 15; signals.push({ name: "Horário incomum", weight: "+15", explanation: "A operação ocorreu fora do padrão de uso observado." }); }
    score = Math.min(score, 100); return json({ score, level: score >= 70 ? "ALTO" : score >= 40 ? "MÉDIO" : "BAIXO", recommendation: score >= 70 ? "Bloquear temporariamente e solicitar confirmação adicional." : score >= 40 ? "Solicitar autenticação adicional antes de aprovar." : "Aprovar e manter o monitoramento da conta.", signals, method: "SIMULAÇÃO POR REGRAS" });
  }
  if (request.method === "POST" && path === "chat") {
    const message = String((await body(request)).message ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let topic = "Posso ajudar", answer = "Não encontrei uma resposta direta. Tente perguntar sobre Pix, cartão, extrato, segurança, privacidade, projetos sociais ou sobre o próprio RanBank.";
    if (/^(oi|ola|opa|bom dia|boa tarde|boa noite)/.test(message)) { topic = "Boas-vindas"; answer = "Olá! Eu sou a Ran. Posso ajudar com Pix, cartão, extrato, segurança, privacidade e projetos do RanBank."; }
    else if (message.includes("ajuda") || message.includes("menu") || message.includes("perguntar")) { topic = "Ajuda"; answer = "Você pode perguntar como fazer um Pix, como controlar o cartão, como a conta é protegida, se o projeto é real ou quais são as propostas sociais e ambientais."; }
    else if (message.includes("banco real") || message.includes("dinheiro real") || message.includes("ranbank e real")) { topic = "Sobre o projeto"; answer = "O RanBank é um projeto educacional. Saldos, cartões e transferências são fictícios e não movimentam dinheiro real."; }
    else if (message.includes("social") || message.includes("indigena") || message.includes("comunidade") || message.includes("meio ambiente")) { topic = "Impacto positivo"; answer = "O projeto apresenta propostas de educação financeira, crédito com propósito, acessibilidade e apoio construído com comunidades. São ideias demonstrativas."; }
    else if (message.includes("privacidade") || message.includes("cookie") || message.includes("dados pessoais")) { topic = "Privacidade"; answer = "Use somente dados fictícios. O site guarda apenas o necessário para a sessão e para suas preferências de navegação."; }
    else if (message.includes("pix") || message.includes("transferencia")) { topic = "Pix"; answer = "Informe a chave e o valor, confira quem vai receber e confirme com a senha de quatro dígitos do cartão. Tudo acontece entre contas demonstrativas."; }
    else if (message.includes("cartao") || message.includes("fatura") || message.includes("limite")) { topic = "Cartão"; answer = "Na área Cartões você consulta a fatura e o limite, além de bloquear ou desbloquear o cartão demonstrativo."; }
    else if (message.includes("extrato") || message.includes("movimentacao") || message.includes("comprovante")) { topic = "Extrato"; answer = "O extrato reúne entradas e saídas e permite abrir o comprovante de cada movimentação demonstrativa."; }
    else if (message.includes("segur") || message.includes("golpe") || message.includes("phishing")) { topic = "Segurança"; answer = "Confira o endereço do site e nunca compartilhe senhas ou códigos. O RanBank pede uma confirmação extra quando encontra algo fora do padrão."; }
    else if (message.includes("nuvem") || message.includes("cloud") || message.includes("sistema")) { topic = "Como o sistema funciona"; answer = "A versão publicada usa Cloudflare para o site e os serviços do banco, enquanto o Neon guarda contas e movimentações."; }
    return json({ answer, topic, mode: "LOCAL", generatedByAi: false });
  }
  if (request.method === "POST" && path === "authentication/simulate") {
    const suspicious = new URL(request.url).searchParams.get("scenario") === "suspicious";
    const status = suspicious ? ["aprovado", "aprovado", "revisar", "bloqueado"] : ["aprovado", "aprovado", "aprovado", "aprovado"];
    return json({ context: suspicious ? "Novo aparelho e localização incomum" : "Aparelho e localização reconhecidos", risk: suspicious ? 82 : 14, decision: suspicious ? "ACESSO BLOQUEADO" : "IDENTIDADE CONFIRMADA", explanation: suspicious ? "Uma pessoa deve revisar a tentativa antes de liberar a conta." : "Os fatores concordam e o acesso demonstrativo foi autorizado.", factors: ["Senha", "Código temporário", "Biometria facial", "Comportamento"].map((name, i) => ({ name, status: status[i], category: ["Conhecimento", "Posse", "Inerência", "Risco adaptativo"][i] })) });
  }
  if (request.method === "GET" && path === "innovation/open-finance") return json({ customer: "Ana Ribeiro", consentExpires: new Date(Date.now() + 90 * 86400000).toISOString().slice(0,10), institutions: [{ name: "RanBank", scope: "Conta principal", balance: 8540.75, connected: true }, { name: "Banco Horizonte", scope: "Conta e cartão", balance: 3260.40, connected: true }, { name: "Cooperativa Cerrado", scope: "Investimentos", balance: 4180, connected: false }] });
  if (request.method === "POST" && path === "innovation/open-finance/toggle") return json({ customer: "Ana Ribeiro", consentExpires: new Date(Date.now() + 90 * 86400000).toISOString().slice(0,10), institutions: [{ name: "RanBank", scope: "Conta principal", balance: 8540.75, connected: true }, { name: "Banco Horizonte", scope: "Conta e cartão", balance: 3260.40, connected: true }, { name: "Cooperativa Cerrado", scope: "Investimentos", balance: 4180, connected: true }] });
  if (request.method === "GET" && path === "innovation/audit") return json({ algorithm: "SHA-256", integrityVerified: true, entries: ["Sessão autenticada", "Consentimento consultado", "Chave Pix validada", "Risco calculado", "Decisão registrada"].map((event, index) => ({ block: index + 1, event, previousHash: index ? `hash-${index}` : "GENESIS-RANBANK", hash: `hash-${index + 1}`, status: "ÍNTEGRO" })) });
  if (request.method === "GET" && path === "innovation/fraud-journey") return json({ scenario: "Compra de R$ 2.950,00 em novo dispositivo", riskScore: 68, decision: "REVISÃO NECESSÁRIA", steps: ["Coleta de contexto", "Comparação histórica", "Cálculo de risco", "Orquestração da resposta", "Continuidade e registro", "Decisão responsável"].map((title, index) => ({ order: index + 1, technology: ["IoT", "Big Data", "IA explicável", "Automação", "Nuvem", "Pessoa"][index], title, explanation: "Etapa demonstrativa do fluxo antifraude.", status: index === 5 ? "AGUARDANDO" : "CONCLUÍDO" })) });
  if (path.startsWith("cloud/")) {
    const failed = path.endsWith("simulate-failure"); return json({ systemStatus: failed ? "DEGRADADO" : "SAUDÁVEL", availability: failed ? "99,98%" : "100%", activeRegion: failed ? "Goiânia" : "Brasília", failureActive: failed, regions: [{ name: "Brasília", code: "br-central", status: failed ? "INDISPONÍVEL" : "ATIVA", trafficPercent: failed ? 0 : 60, latencyMs: failed ? 0 : 12 }, { name: "Goiânia", code: "br-central-2", status: "ATIVA", trafficPercent: failed ? 62 : 25, latencyMs: 24 }, { name: "Fortaleza", code: "br-northeast", status: failed ? "ATIVA" : "STANDBY", trafficPercent: failed ? 38 : 15, latencyMs: 44 }], timeline: [{ time: "Agora", title: failed ? "Tráfego redirecionado" : "Operação normal", description: failed ? "As regiões secundárias assumiram as requisições." : "As regiões estão sincronizadas e monitoradas." }] });
  }
  if (path.startsWith("sustainability/")) {
    const active = path.endsWith("optimize"); return json({ optimized: active, powerKw: active ? 42.6 : 58.4, renewablePercent: active ? 78 : 54, carbonKgHour: active ? 8.7 : 14.2, pue: active ? 1.18 : 1.42, savingsPercent: active ? 27 : 0, sources: [{ name: "Solar", percentage: active ? 46 : 32, type: "RENOVÁVEL" }, { name: "Eólica", percentage: active ? 32 : 22, type: "RENOVÁVEL" }, { name: "Rede elétrica", percentage: active ? 22 : 46, type: "MISTA" }], actions: active ? ["Cargas não críticas migradas", "Servidores ociosos consolidados", "Maior uso de energia renovável"] : ["Consumo acima da meta", "Capacidade ociosa identificada", "Otimização disponível"] });
  }
  if (request.method === "GET" && path === "comparison") {
    const goal = new URL(request.url).searchParams.get("goal") || "seguranca"; const scores: Record<string, Record<string, number>> = { seguranca: { IA: 94, "Big Data": 86, IoT: 65, Nuvem: 82, "Automação": 90, Sustentabilidade: 52 }, escala: { IA: 78, "Big Data": 96, IoT: 84, Nuvem: 98, "Automação": 88, Sustentabilidade: 72 }, eficiencia: { IA: 85, "Big Data": 82, IoT: 76, Nuvem: 91, "Automação": 96, Sustentabilidade: 94 } }; const selected = scores[goal] ? goal : "seguranca";
    const details: Record<string, [string,string,string,string]> = { IA: ["Alto","Em evolução","Reconhecimento de padrões","Exige dados de qualidade e supervisão."], "Big Data": ["Alto","Maduro","Análise de grandes volumes","Infraestrutura e governança são complexas."], IoT: ["Médio","Maduro","Telemetria de dispositivos","Amplia a superfície de ataque."], Nuvem: ["Médio","Muito maduro","Escala e disponibilidade","Depende de configuração e conectividade."], "Automação": ["Baixo","Maduro","Orquestração de processos","Automatizar uma regra ruim amplia o erro."], Sustentabilidade: ["Médio","Em expansão","Eficiência energética","Métricas ambientais exigem contexto."] };
    const results = Object.entries(scores[selected]).map(([name, score]) => ({ name, score, cost: details[name][0], maturity: details[name][1], bestUse: details[name][2], limitation: details[name][3] })).sort((a,b) => b.score-a.score);
    return json({ goal: selected, goalLabel: selected === "escala" ? "Escalabilidade" : selected === "eficiencia" ? "Eficiência operacional" : "Segurança digital", results, disclaimer: "A maior pontuação indica aderência ao objetivo escolhido, não uma tecnologia universalmente melhor." });
  }
  if (request.method === "GET" && path === "security/simulate") {
    const threat = new URL(request.url).searchParams.get("threat") || "phishing"; const scenarios: Record<string, Row> = { phishing: { name: "Phishing", category: "Engenharia social", risk: 78, description: "Um e-mail falso tenta roubar a senha e o código de verificação.", indicators: ["Remetente imita uma empresa conhecida", "Link aponta para domínio diferente", "Mensagem cria senso de urgência"] }, ransomware: { name: "Ransomware", category: "Malware de extorsão", risk: 96, description: "Um arquivo malicioso tenta criptografar dados e exigir pagamento.", indicators: ["Muitas alterações de arquivos", "Processo desconhecido solicita privilégios", "Tentativa de desativar backups"] }, trojan: { name: "Trojan bancário", category: "Malware disfarçado", risk: 88, description: "Um aplicativo aparentemente legítimo tenta capturar dados bancários.", indicators: ["Instalação fora da loja oficial", "Permissões incompatíveis", "Sobreposição na tela do banco"] } }; const scenario = scenarios[threat] || scenarios.phishing;
    return json({ ...scenario, defenses: [{ name: "Análise preventiva", result: "Evento suspeito identificado", responsibility: "automatica" }, { name: "MFA", result: "Validação adicional exigida", responsibility: "automatica" }, { name: "Revisão", result: "Pessoa confirma a decisão", responsibility: "humana" }] });
  }
  if (request.method === "GET" && path === "immersive") {
    const vr = new URL(request.url).searchParams.get("mode") === "vr"; return json(vr ? { code: "VR", name: "Realidade Virtual", title: "Treinamento antifraude", definition: "O usuário entra em um ambiente digital imersivo, separado do espaço real.", steps: ["Cenário simula uma agência bancária", "Personagens apresentam tentativas de golpe", "Escolhas geram feedback sem risco real"], equipment: "Óculos VR e controles", strength: "Treinamento seguro", limitation: "Custo dos equipamentos e possível desconforto" } : { code: "RA", name: "Realidade Aumentada", title: "Agência inteligente", definition: "Informações digitais são sobrepostas à visão do ambiente real.", steps: ["Câmera reconhece o caixa eletrônico", "Setas orientam onde inserir o cartão", "Alertas destacam sinais de adulteração"], equipment: "Celular ou óculos de RA", strength: "Orientação contextual", limitation: "Privacidade da câmera e precisão do reconhecimento" });
  }
  if (request.method === "GET" && path === "robotics/mission") {
    const type = new URL(request.url).searchParams.get("type") || "reception"; const mission: Record<string, [string,string,number,string]> = { reception: ["Recepção inteligente","Orientar cliente até o atendimento correto",87,"O robô orienta, mas um atendente assume dúvidas complexas."], accessibility: ["Apoio à acessibilidade","Acompanhar uma pessoa com baixa visão",94,"A pessoa escolhe se deseja ajuda; acessibilidade não deve retirar autonomia."], security: ["Alerta de segurança","Responder a um objeto esquecido na agência",72,"O robô não determina sozinho se existe ameaça; a decisão final é humana."] }; const item = mission[type] || mission.reception;
    return json({ name: item[0], objective: item[1], autonomy: item[2], steps: ["Sensor", "Análise", "Navegação", "Entrega humana"].map((title,index) => ({ title, result: "Etapa demonstrativa concluída", technology: ["sensor","ia","robotica","humano"][index] })), humanRole: item[3] });
  }
  return null;
}

export async function handleCloudflareApi(request: Request, pathSegments: string[]) {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return null;
  const sql = neon(databaseUrl);
  const path = pathSegments.join("/");
  try {
    if (request.method === "GET" && path === "health") {
      await sql`SELECT 1`; return json({ status: "UP" }, 200, { "x-ranbank-runtime": "cloudflare" });
    }
    if (request.method === "POST" && path === "auth/login") return login(sql, request);
    if (request.method === "POST" && path === "auth/recover-pin") return recoverPin(sql, request);
    if (request.method === "POST" && path === "demo-accounts") return createDemoAccount(sql, request);
    if (request.method === "POST" && path === "auth/logout") {
      const raw = cookieValue(request); if (raw) await sql.query(`DELETE FROM bank_sessions WHERE token_hash=$1`, [await sha256(raw)]);
      return json({ message: "Sessão encerrada." }, 200, { "set-cookie": sessionCookie("", 0) });
    }
    const simulation = await publicSimulation(path, request); if (simulation) return simulation;
    return await authenticated(sql, request, path);
  } catch (cause) {
    console.error("[RanBank Cloudflare API]", cause instanceof Error ? cause.message : String(cause));
    return error("A API encontrou um erro temporário. Tente novamente.", 500);
  }
}
