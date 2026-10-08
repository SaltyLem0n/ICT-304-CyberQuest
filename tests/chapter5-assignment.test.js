'use strict';
const assert = require('node:assert/strict');
const A = require('../chapter5-assignment.js');
const M = require('../chapter5.js');
let checks = 0;
function check(fn) { fn(); checks++; }
const options = { name: 'Anna Bell', p: 17, q: 19, mapping: A.mapping('one') };
const r = A.prepare(options);
check(() => assert.deepEqual([r.name, r.n, r.z, r.e, r.d, r.recoveredName], ['ANNABELL', 323n, 288n, 5n, 173n, 'ANNABELL']));
check(() => assert.deepEqual(r.blocks.map(b => b.m), [1n, 14n, 14n, 1n, 2n, 5n, 12n, 12n]));
check(() => assert.deepEqual(r.unique.find(b => b.letter === 'N').positions, [2, 3]));
check(() => assert.equal(r.unique.length, 5));
for (const kind of ['one', 'zero', 'reverse', 'shifted']) {
  const result = A.prepare({ ...options, name: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', mapping: A.mapping(kind) });
  for (const row of result.unique) {
    // Independent bounded exponentiation checks encryption AND decryption.
    check(() => assert.equal(row.c, row.m ** result.e % result.n));
    check(() => assert.equal(row.decryption.result, row.c ** result.d % result.n));
    check(() => assert.equal(row.recoveredLetter, row.letter));
  }
}
check(() => assert.deepEqual(A.mapping('shifted', [], 25).slice(0, 3), [25n, 0n, 1n]));
check(() => assert.equal(A.mapping('one', [], '').length, 26));
check(() => assert.equal(A.prepare({ ...options, name: '\tAnna\nBell  ' }).name, 'ANNABELL'));
for (const [patch, pattern] of [
  [{ name: '' }, /full name/], [{ name: '   ' }, /full name/], [{ name: 'A-Name' }, /English/],
  [{ name: 'ß' }, /English/], [{ name: '<script>' }, /English/], [{ name: 'A'.repeat(121) }, /120/],
  [{ p: 13 }, /greater than 13/], [{ q: 11 }, /greater than 13/], [{ p: 15 }, /prime/],
  [{ q: 17 }, /different/], [{ p: 10007 }, /10,000/], [{ e: 1 }, /1 < e/],
  [{ e: 288 }, /1 < e/], [{ e: 6 }, /GCD 1/], [{ e: '2.5' }, /whole/],
  [{ mapping: Array(26).fill(1) }, /different number/], [{ mapping: [1, 2] }, /26 values/],
  [{ mapping: Array.from({ length: 26 }, (_, i) => i - 1) }, /non-negative/],
  [{ mapping: Array.from({ length: 26 }, (_, i) => i + 323) }, /too large/]
]) check(() => assert.throws(() => A.prepare({ ...options, ...patch }), pattern));
check(() => assert.throws(() => A.mapping('shifted', [], 26), /0 to 25/));
check(() => assert.throws(() => A.mapping('shifted', [], -1), /0 to 25/));
check(() => assert.throws(() => A.mapping('invalid'), /supported/));
// A custom mapping covers zero, numbers sharing p/q factors, and n-1.
const custom = A.mapping('one'); custom[0] = 0n; custom[25] = 322n;
const edge = A.prepare({ ...options, name: 'AZQSA', mapping: custom });
check(() => assert.deepEqual(edge.blocks.map(b => b.decryption.result), [0n, 322n, 17n, 19n, 0n]));
for (const [p, q] of [[17, 19], [17, 23], [19, 29], [97, 101]]) {
  const z = BigInt((p - 1) * (q - 1));
  for (let e = 2n; e < 40n; e++) {
    if (M.gcd(e, z) !== 1n) continue;
    const inv = A.inverseSteps(e, z);
    check(() => {
      assert.equal(inv.s * z + inv.t * e, 1n);
      assert.equal(e * inv.d % z, 1n);
      for (const row of inv.rows) {
        assert.equal(row.a, row.quotient * row.b + row.remainder);
        assert.equal(row.remainder, row.s * z + row.t * e);
      }
    });
    const result = A.prepare({ p, q, e, name: 'ZARA ALI', mapping: A.mapping('shifted', [], 13) });
    check(() => assert.equal(result.recoveredName, 'ZARAALI'));
  }
}
console.log(`${checks} Assignment 3 checks passed, including independent exponentiation, custom mappings, inverse derivations, and invalid inputs.`);
