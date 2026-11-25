'use strict';
const assert = require('node:assert/strict');
const M = require('../chapter5.js');
let checks = 0;
function check(fn) { fn(); checks++; }
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// 1. Friendly start: p=5, q=7, e=5, m=12
const friendly = M.validateEasyChoice(M.FRIENDLY_START);
check(() => {
  assert.equal(friendly.ok, true);
  assert.deepEqual([friendly.p, friendly.q, friendly.n, friendly.z, friendly.e, friendly.d, friendly.m], [5n, 7n, 35n, 24n, 5n, 5n, 12n]);
  const enc = M.trace(12, 5, 35), dec = M.trace(enc.result, 5, 35);
  assert.equal(enc.result, 17n);
  assert.equal(dec.result, 12n);
});

// 2. All prime pairs in {2, 3, 5, 7, 11} and all e in 2..12 + message bounds
for (const p of M.EASY_PRIMES) {
  check(() => {
    const same = M.validateEasyChoice({ p, q: p, e: 5, m: 1 });
    assert.equal(same.ok, false);
    assert.match(same.error, /different primes/);
  });
  for (const q of M.EASY_PRIMES) {
    if (p === q) continue;
    const n = BigInt(p * q), z = BigInt((p - 1) * (q - 1));
    for (const e of M.EASY_EXPONENTS) {
      const res = M.validateEasyChoice({ p, q, e, m: 1 });
      const expectedValid = BigInt(e) < n && M.gcd(e, z) === 1n;
      check(() => assert.equal(res.ok, expectedValid));
      if (!expectedValid) {
        check(() => assert.match(res.error, BigInt(e) >= n ? /1 < e < n/ : /GCD/));
      }
    }
    // Message bounds: -1 and n invalid; 0, 1, n-1 valid and round-trip
    const validE = M.EASY_EXPONENTS.find(e => BigInt(e) < n && M.gcd(e, z) === 1n);
    check(() => {
      assert.equal(M.validateEasyChoice({ p, q, e: validE, m: -1 }).ok, false);
      assert.equal(M.validateEasyChoice({ p, q, e: validE, m: n }).ok, false);
    });
    for (const m of [0n, 1n, n - 1n]) {
      const v = M.validateEasyChoice({ p, q, e: validE, m });
      check(() => {
        assert.equal(v.ok, true);
        const enc = M.trace(m, v.e, n), dec = M.trace(enc.result, v.d, n);
        assert.equal(enc.result, m ** v.e % n);
        assert.equal(dec.result, m);
      });
    }
  }
}

// Reject primes >= 13 and e >= 13 or e <= 1
check(() => {
  assert.equal(M.validateEasyChoice({ p: 13, q: 7, e: 5, m: 2 }).ok, false);
  assert.equal(M.validateEasyChoice({ p: 5, q: 7, e: 13, m: 2 }).ok, false);
  assert.equal(M.validateEasyChoice({ p: 5, q: 7, e: 1, m: 2 }).ok, false);
});

// 3. Generated 'easy' mode
for (let i = 0; i < 100; i++) {
  let seed = i + 1;
  const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const ex = M.generate('easy', 'generated', rng);
  const r = M.solve(ex);
  check(() => {
    assert(M.EASY_PRIMES.includes(ex.p));
    assert(M.EASY_PRIMES.includes(ex.q));
    assert.notEqual(ex.p, ex.q);
    assert(ex.e > 1 && ex.e < 13 && BigInt(ex.e) < r.n);
    assert.equal(M.gcd(ex.e, r.z), 1n);
    assert(ex.messages[0] >= 0 && BigInt(ex.messages[0]) < r.n);
    assert.equal(r.messages[0].c, BigInt(ex.messages[0]) ** BigInt(ex.e) % r.n);
    assert.equal(r.messages[0].decryption.result, BigInt(ex.messages[0]));
  });
}

// 4. Modular inverse by trial: e=31, z=24 -> r=7 -> k=2 -> d=7
const inv31 = M.inverseByTrial(31, 24);
check(() => {
  assert.deepEqual([inv31.r, inv31.k, inv31.d, inv31.checkProduct, inv31.checkQuotient, inv31.checkMultiple, inv31.checkRemainder], [7n, 2n, 7n, 217n, 9n, 216n, 1n]);
});

// 5. Shortcuts for 0, 1, n-1
for (const [base, exp, mod, expected] of [
  [0, 5, 35, 0n],
  [1, 17, 35, 1n],
  [34, 2, 35, 1n],
  [34, 5, 35, 34n],
  [20, 4, 21, 1n],
  [20, 7, 21, 20n]
]) {
  const sc = M.powerShortcut(base, exp, mod);
  check(() => {
    assert(sc);
    assert.equal(sc.result, expected);
    assert.equal(sc.result, BigInt(base) ** BigInt(exp) % BigInt(mod));
  });
}

// 6. Squaring trace never computes 12^5 = 248832 directly, and shows 12^2 = 144 -> 4
const sqHtml = text(M.renderTrace(M.trace(12, 5, 35), { method: 'squaring' }));
check(() => {
  assert(!sqHtml.includes('248832'));
  assert(sqHtml.includes('12² = 144'));
  assert(sqHtml.includes('144 ÷ 35 = 4.11'));
  assert(sqHtml.includes('Q = 4'));
  assert(sqHtml.includes('144 − 140 = 4'));
  assert(sqHtml.includes('Final answer: c = 17'));
});

console.log(`${checks} Easy numbers & basic-calculator checks passed.`);
