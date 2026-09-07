/**
 * Checks on admin authentication and the endpoints it guards.
 *
 * No network and no blob store — the point is the auth boundary: who gets in,
 * who does not, and whether a route can be reached without a session.
 *
 * Run with: npm run check:admin
 */
process.env.ADMIN_SESSION_SECRET = 'a-test-session-secret-long-enough-to-pass-32'
process.env.ADMIN_PASSWORD_HASH = ''  // set below, once we have hashed one

const A = await import('../api/_auth.mjs')

let fails = 0
const check = (name, cond, detail = '') => {
  if (!cond) { fails++; console.log(`  FAIL  ${name} ${detail}`) }
  else console.log(`  ok    ${name} ${detail}`)
}

const PASSWORD = 'correct horse battery staple'
const hash = await A.hashPassword(PASSWORD)
process.env.ADMIN_PASSWORD_HASH = hash

console.log('\n— passwords —')
check('the right password verifies', await A.verifyPassword(PASSWORD, hash))
check('a wrong password does not', !(await A.verifyPassword('wrong', hash)))
check('case matters', !(await A.verifyPassword(PASSWORD.toUpperCase(), hash)))
check('a trailing space matters', !(await A.verifyPassword(PASSWORD + ' ', hash)))
check('an empty password does not verify', !(await A.verifyPassword('', hash)))
check('the hash is not the password', !hash.includes(PASSWORD))
check('the hash is salted', hash.split('$').length === 3 && hash.startsWith('scrypt$'))

// Two hashes of the same password must differ, or the salt is not doing its job.
const hash2 = await A.hashPassword(PASSWORD)
check('the same password hashes differently each time', hash !== hash2)
check('but both still verify', await A.verifyPassword(PASSWORD, hash2))

console.log('\n— garbage stored hashes are refused, not crashed on —')
for (const bad of ['', 'plaintext', 'scrypt$only-two', 'bcrypt$aa$bb', 'scrypt$zz$zz', null, undefined, 42]) {
  check(`rejects stored hash ${JSON.stringify(bad)}`, !(await A.verifyPassword(PASSWORD, bad)))
}

console.log('\n— sessions —')
const token = A.makeSession()
check('a fresh session reads back', A.readSession(token) !== null)
check('a missing token is refused', A.readSession('') === null)
check('a null token is refused', A.readSession(null) === null)
check('garbage is refused', A.readSession('nonsense') === null)
check('a token with no signature is refused', A.readSession(`${Date.now() + 10000}.`) === null)

// The attack that matters: keep the shape, forge the signature.
const [exp] = token.split('.')
check('a forged signature is refused', A.readSession(`${exp}.${'a'.repeat(64)}`) === null)
check('a truncated signature is refused', A.readSession(token.slice(0, -2)) === null)

// Extending your own session by editing the expiry must fail the signature.
const farFuture = String(Date.now() + 999 * 86400_000)
check('an edited expiry is refused', A.readSession(`${farFuture}.${token.split('.')[1]}`) === null)

// An expired but correctly signed token.
const expired = A.makeSession(-1)
check('an expired session is refused', A.readSession(expired) === null)

// Re-signing under a different secret is how access gets revoked.
const other = A.makeSession()
process.env.ADMIN_SESSION_SECRET = 'a-different-test-secret-also-long-enough-32'
check('changing the secret invalidates sessions', A.readSession(other) === null)
process.env.ADMIN_SESSION_SECRET = 'a-test-session-secret-long-enough-to-pass-32'
check('restoring the secret makes it valid again', A.readSession(other) !== null)

// A short secret must fail loudly rather than sign with something weak.
process.env.ADMIN_SESSION_SECRET = 'tooshort'
check('a short secret refuses to sign', (() => { try { A.makeSession(); return false } catch { return true } })())
check('a short secret refuses to verify', A.readSession(other) === null)
process.env.ADMIN_SESSION_SECRET = 'a-test-session-secret-long-enough-to-pass-32'

console.log('\n— cookies —')
const cookieReq = h => ({ headers: { cookie: h } })
check('reads the session cookie', A.sessionFromRequest(cookieReq(`${A.ADMIN_COOKIE}=${token}`)) !== null)
check('ignores other cookies', A.sessionFromRequest(cookieReq(`other=1; ${A.ADMIN_COOKIE}=${token}; x=2`)) !== null)
check('no cookie means no session', A.sessionFromRequest(cookieReq('')) === null)
check('a missing header means no session', A.sessionFromRequest({ headers: {} }) === null)
check('a forged cookie means no session',
  A.sessionFromRequest(cookieReq(`${A.ADMIN_COOKIE}=${exp}.${'b'.repeat(64)}`)) === null)

// The cookie must not be readable by scripts or sent cross-site.
const rec = () => {
  const headers = {}
  return { headers, setHeader(k, v) { headers[k] = v }, status() { return this }, end() {} }
}
const res1 = rec()
A.setSessionCookie(res1, token)
const setCookie = res1.headers['Set-Cookie']
check('cookie is HttpOnly', /HttpOnly/.test(setCookie))
check('cookie is Secure', /Secure/.test(setCookie))
check('cookie is SameSite=Lax', /SameSite=Lax/.test(setCookie))
const res2 = rec()
A.clearSessionCookie(res2)
check('logout expires the cookie', /Max-Age=0/.test(res2.headers['Set-Cookie']))

console.log('\n— every admin route refuses an anonymous caller —')
const routes = [
  ['settings', '../api/admin/settings.mjs', 'GET'],
  ['settings (save)', '../api/admin/settings.mjs', 'POST'],
  ['blocks', '../api/admin/blocks.mjs', 'GET'],
  ['blocks (add)', '../api/admin/blocks.mjs', 'POST'],
  ['blocks (delete)', '../api/admin/blocks.mjs', 'DELETE'],
  ['bookings', '../api/admin/bookings.mjs', 'GET'],
  ['bookings (status)', '../api/admin/bookings.mjs', 'POST'],
]

for (const [name, path, method] of routes) {
  const { default: handler } = await import(path)
  let status = 0
  const res = {
    status(s) { status = s; return res },
    setHeader() { return res },
    end() {},
  }
  await handler({ method, headers: {}, body: {}, query: {} }, res)
  check(`${name} refuses without a session`, status === 401, `got ${status}`)
}

// And with a session, they get past the gate — a 401 here would mean the guard
// rejects even valid callers.
console.log('\n— a signed-in caller gets past the gate —')
{
  const { default: handler } = await import('../api/admin/bookings.mjs')
  let status = 0
  const res = { status(s) { status = s; return res }, setHeader() { return res }, end() {} }
  await handler(
    { method: 'POST', headers: { cookie: `${A.ADMIN_COOKIE}=${token}` }, body: { id: 'x', status: 'nonsense' }, query: {} },
    res,
  )
  check('reaches validation rather than the auth wall', status === 400, `got ${status}`)
}

console.log('\n— login —')
{
  const { default: login } = await import('../api/admin/login.mjs')
  const call = async body => {
    let status = 0, payload = null, cookie = null
    const res = {
      status(s) { status = s; return res },
      setHeader(k, v) { if (k === 'Set-Cookie') cookie = v; return res },
      end(t) { payload = t ? JSON.parse(t) : null },
    }
    await login({ method: 'POST', headers: {}, body }, res)
    return { status, payload, cookie }
  }

  const good = await call({ password: PASSWORD })
  check('the right password signs in', good.status === 200, `got ${good.status}`)
  check('and sets a session cookie', Boolean(good.cookie) && /HttpOnly/.test(good.cookie || ''))
  check('the cookie it sets is valid',
    A.sessionFromRequest({ headers: { cookie: (good.cookie || '').split(';')[0] } }) !== null)

  for (const [label, body] of [
    ['a wrong password', { password: 'nope' }],
    ['an empty password', { password: '' }],
    ['a missing password', {}],
    ['a non-string password', { password: { toString: () => PASSWORD } }],
    ['an over-long password', { password: 'x'.repeat(5000) }],
  ]) {
    const r = await call(body)
    check(`${label} is refused`, r.status === 401, `got ${r.status}`)
    check(`${label} sets no cookie`, !r.cookie)
  }

  // GET must not sign anyone in.
  let status = 0
  const res = { status(s) { status = s; return res }, setHeader() { return res }, end() {} }
  await login({ method: 'GET', headers: {}, body: { password: PASSWORD } }, res)
  check('GET cannot sign in', status === 405, `got ${status}`)
}

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall admin checks passed\n')
process.exit(fails ? 1 : 0)
