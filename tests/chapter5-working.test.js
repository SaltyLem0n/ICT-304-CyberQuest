'use strict';
const assert = require('node:assert/strict');
const M = require('../chapter5.js');
let checks = 0;
function check(fn) { fn(); checks++; }
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const example = M.trace(12, 5, 323);
check(() => assert.deepEqual(M.directReduction(example), { dividend: 248832n, quotient: 770n, multiple: 248710n, remainder: 122n }));
const encryption = text(M.renderTrace(example));
for (const line of [
  '1. Calculate: A = 12 5 = 248832',
  '2. Divide: Q = whole-number part of 248832 ÷ 323 = 770',
  '3. Multiply: B = 770 × 323 = 248710',
  '4. Subtract: c = 248832 − 248710 = 122',
  '5. Answer: c = 122'
]) check(() => assert(encryption.includes(line), line));

const decryption = M.trace(122, 173, 323);
check(() => assert.equal(M.directReduction(decryption), null));
const large = text(M.renderTrace(decryption, { baseSymbol: 'c', resultSymbol: 'm' }));
check(() => assert(large.includes('173 = 128 + 32 + 8 + 4 + 1')));
check(() => assert(large.includes('R is an intermediate remainder')));
check(() => assert(large.includes('Final answer: m = 12')));
check(() => assert(!large.includes('5. Answer: m =')));
check(() => assert.equal((large.match(/5\. Answer: R =/g) || []).length, decryption.squares.length - 1 + decryption.products.length));

// Check the 12-digit boundary before a full power is formed.
for (const [base, exponent, modulus, expected] of [
  [10n, 11n, 100000000001n, 100000000000n],
  [10n, 12n, 1000000000001n, null],
  [999999n, 2n, 1000000n, 999998000001n],
  [1000000n, 2n, 1000001n, null],
  [999999999999n, 1n, 1000000000000n, 999999999999n],
  [1000000000000n, 1n, 1000000000001n, null]
]) check(() => {
  const result = M.directReduction({ base, exponent, modulus });
  assert.equal(result?.dividend ?? null, expected);
  if (result) assert.equal(result.remainder, base ** exponent % modulus);
});
const hugeExponent = '999999999999999999999999999999';
check(() => assert.equal(M.directReduction({ base: 2, exponent: hugeExponent, modulus: 323 }), null));
check(() => assert.deepEqual(M.directReduction({ base: 0, exponent: hugeExponent, modulus: 323 }), { dividend: 0n, quotient: 0n, multiple: 0n, remainder: 0n }));
check(() => assert.deepEqual(M.directReduction({ base: 1, exponent: hugeExponent, modulus: 323 }), { dividend: 1n, quotient: 0n, multiple: 0n, remainder: 1n }));
check(() => assert.throws(() => M.directReduction({ base: 1, exponent: 0, modulus: 323 }), /valid/));
check(() => assert.throws(() => M.renderTrace(example, { resultSymbol: '<script>' }), /symbols/));

for (const [base, exponent, modulus] of [[0, 5, 323], [1, 173, 323], [17, 5, 323], [2, 2, 4], [12, 5, 35], [17, 5, 35]]) {
  const t = M.trace(base, exponent, modulus), result = M.directReduction(t);
  check(() => {
    assert(result);
    assert.equal(result.dividend, BigInt(base) ** BigInt(exponent));
    assert.equal(result.remainder, t.result);
    assert.equal(result.dividend - result.multiple, result.remainder);
    assert(result.remainder >= 0n && result.remainder < t.modulus);
  });
}
const zeroRemainder = text(M.renderTrace(M.trace(2, 2, 4)));
check(() => assert(zeroRemainder.includes('4. Subtract: c = 4 − 4 = 0')));
const recovered = text(M.renderTrace(M.trace(17, 5, 35), { baseSymbol: 'c', resultSymbol: 'm' }));
check(() => assert(recovered.includes('5. Answer: m = 12')));
console.log(`${checks} worked-explanation checks passed: direct calculation, bounded powers, grouped decryption, symbols, and zero remainders.`);
