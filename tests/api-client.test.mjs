import assert from 'node:assert/strict';
import test from 'node:test';
let sequence = 0;
const fresh = () => import(`../app/bank/api.ts?test=${sequence++}`);
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers });

test('concurrent access uses one health request and retains no credentials', async t => {
  const api = await fresh(); let calls = 0; let release;
  t.mock.method(globalThis, 'fetch', () => { calls++; return new Promise(resolve => { release = resolve; }); });
  const a = api.warmBackend(); const b = api.warmBackend();
  assert.equal(calls, 1); release(json({ status: 'UP' })); await Promise.all([a,b]);
  await api.warmBackend(); assert.equal(calls, 1);
});
test('health failure does not block a working login; PIN error is not retried', async t => {
  const api = await fresh(); const paths = [];
  t.mock.method(globalThis, 'fetch', async url => { paths.push(url); return url.endsWith('/health') ? json({},503) : json({ message:'PIN inválido' },401); });
  const result = await api.apiFetch('/auth/login', { method:'POST', body:'{}' });
  assert.equal(result.status,401); assert.deepEqual(paths,['/api/health','/api/auth/login']);
});
test('money operations are never replayed after an uncertain response', async t => {
  const api = await fresh(); let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new TypeError('network failed'); });
  await assert.rejects(api.apiFetch('/banking/bills', {method:'POST',body:'{}'})); assert.equal(calls,1);
});
test('dashboard mismatch blocks display without replaying login credentials', async t => {
  const api = await fresh(); const paths = [];
  t.mock.method(globalThis, 'fetch', async url => { paths.push(url); return json(url.endsWith('/auth/login') ? { customerName:'Ana', accountNumber:'1' } : url.endsWith('/dashboard') ? {account:'2'} : {status:'UP'}); });
  await api.apiFetch('/auth/login',{method:'POST',body:'{}'});
  await assert.rejects(api.apiFetch('/dashboard'),/conta da sessão mudou/);
  assert.equal(api.getAccountLoadSnapshot().status,'error'); assert.equal(paths.filter(p=>p.endsWith('/auth/login')).length,1);
});
test('transient reads recover and update the account guard', async t => {
  const api = await fresh(); let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => ++calls === 1 ? json({},503) : json({account:'1'}));
  assert.equal((await api.apiFetch('/dashboard')).status,200);
  assert.equal(calls,2); assert.equal(api.getAccountLoadSnapshot().status,'ready');
});
test('logout skips health and clears a blocked account immediately', async t => {
  const api = await fresh(); const paths=[];
  t.mock.method(globalThis,'fetch',async url=>{paths.push(url);return json({});});
  await api.apiFetch('/auth/logout',{method:'POST'});
  assert.deepEqual(paths,['/api/auth/logout']);assert.equal(api.getAccountLoadSnapshot().status,'idle');
});
test('caller cancellation remains active and is not retried', async t => {
  const api = await fresh();const controller=new AbortController();controller.abort();let calls=0;
  t.mock.method(globalThis,'fetch',async (_url,init)=>{calls++;init.signal.throwIfAborted();});
  await assert.rejects(api.apiFetch('/notifications',{signal:controller.signal}));assert.equal(calls,1);
});
test('response bodies remain inside the request deadline', async t => {
  const api = await fresh();const controller=new AbortController();
  t.mock.method(globalThis,'fetch',async (_url,init)=>({ status:200,headers:new Headers(),arrayBuffer:()=>new Promise((_,reject)=>init.signal.addEventListener('abort',()=>reject(init.signal.reason),{once:true})) }));
  const pending=api.apiFetch('/banking/bills',{method:'POST',signal:controller.signal});
  await new Promise(resolve=>setTimeout(resolve,5));controller.abort();await assert.rejects(pending);
});
test('late dashboard responses cannot restore data after logout', async t => {
  const api = await fresh(); let release;
  t.mock.method(globalThis,'fetch',async url=>url.endsWith('/dashboard') ? new Promise(resolve=>{release=resolve;}) : json({}));
  const pending=api.apiFetch('/dashboard');
  await api.apiFetch('/auth/logout',{method:'POST'}); release(json({account:'1'}));
  await assert.rejects(pending,/sessão mudou/); assert.equal(api.getAccountLoadSnapshot().status,'idle');
});
