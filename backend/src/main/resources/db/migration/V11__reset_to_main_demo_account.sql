-- Limpeza única para a apresentação de 03/09/2026.
-- O histórico do Flyway garante que este bloco não volte a executar após esta publicação.
DELETE FROM pix_transfers;
DELETE FROM bank_transactions;
DELETE FROM connected_devices;
DELETE FROM scheduled_operation;
DELETE FROM notifications;
DELETE FROM flow_executions;
DELETE FROM audit_events;
DELETE FROM pix_keys;
DELETE FROM bank_sessions;
DELETE FROM bank_accounts WHERE id <> 1;

UPDATE bank_accounts
SET balance = 8540.75,
    savings_balance = 0.00,
    savings_goal = 5000.00,
    card_limit = 6000.00,
    card_spent = 1248.90,
    card_blocked = FALSE,
    active = TRUE,
    deleted_at = NULL,
    version = version + 1
WHERE id = 1;
