'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../chapter4-math.js');
const D = require('../chapter4-content.js');
// Fixtures came from an independent Python integer implementation. It reads
// IP/E/PC-1/PC-2/P and all S-boxes directly from the supplied Chapter 4.2 PDF.
// Canonical DES block/key also checked against OpenSSL below.
const fixtures = require('./fixtures/chapter4.json');
let checks = 0;
function equal(actual, expected, label) { assert.deepEqual(actual, expected, label); checks++; }
function throws(fn) { assert.throws(fn); checks++; }
for (const [name, data, key] of [['paper', '436F6D7075746572', '4142434431323334'], ['canonical', '0123456789ABCDEF', '133457799BBCDFF1']]) {
  const t = M.firstRound(M.fromHex(data), M.fromHex(key)), expected = fixtures[name];
  for (const name of ['initial', 'L0', 'R0', 'expanded', 'mixed', 'substituted', 'permuted', 'L1', 'R1']) equal(M.toHex(t[name]), expected[name], name);
  for (let i = 0; i < 2; i++) {
    equal(M.toHex(t.schedule.rounds[i].state), expected[`state${i + 1}`]);
    equal(M.toHex(t.schedule.rounds[i].subkey), expected[`K${i + 1}`]);
  }
  equal(t.boxes.map(b => [b.row, b.column, b.value]), expected.lookups);
}
// Check all 64 inputs of every box against source-extracted table entries.
for (let box = 0; box < 8; box++) for (let n = 0; n < 64; n++) {
  const input = n.toString(2).padStart(6, '0'), trace = M.sBox(box, input);
  const row = ((n & 32) >> 4) | (n & 1), column = (n >> 1) & 15;
  equal(trace.value, fixtures.S[box][row][column]);
  equal(trace.output, fixtures.S[box][row][column].toString(2).padStart(4, '0'));
}
for (const [name, length, max, unique] of [['IP', 64, 64, true], ['FP', 64, 64, true], ['E', 48, 32, false], ['P', 32, 32, true], ['PC1', 56, 64, true], ['PC2', 48, 56, true]]) {
  equal(M.tables[name].length, length); equal(M.tables[name].every(n => n >= 1 && n <= max), true);
  if (unique) equal(new Set(M.tables[name]).size, length);
}
equal(M.tables.PC1.some(n => n % 8 === 0), false);
equal(M.tables.FP.slice(-8), [33, 1, 41, 9, 49, 17, 57, 25]);
for (let i = 0; i < 64; i++) {
  const one = '0'.repeat(i) + '1' + '0'.repeat(63 - i);
  equal(M.permute(M.permute(one, M.tables.IP), M.tables.FP), one);
}
const parityFlipped = M.asciiBits('ABCD1234').split('').map((b, i) => (i + 1) % 8 === 0 ? b === '0' ? '1' : '0' : b).join('');
equal(M.keySchedule(parityFlipped).rounds, D.desTrace.schedule.rounds);
equal(M.rotateLeft('10011', 1), '00111'); equal(M.rotateLeft('00111', 1), '01110'); equal(M.rotateLeft('101', 3), '101');
equal(D.desTrace.schedule.rounds[15].state, D.desTrace.schedule.selected); // Total 28 shifts.
equal(M.firstRound('0'.repeat(64), '0'.repeat(64)).L1, '0'.repeat(32));
// Independently check the combined round operations against Node/OpenSSL 3DES
// with all three keys equal, which reduces to single DES. No full DES UI added.
function blockEncrypt(data, key) {
  let block = M.permute(M.fromHex(data), M.tables.IP), left = block.slice(0, 32), right = block.slice(32);
  for (const round of M.keySchedule(M.fromHex(key)).rounds) [left, right] = [right, M.xor(left, M.feistel(right, round.subkey).permuted)];
  return M.toHex(M.permute(right + left, M.tables.FP));
}
for (const [data, key] of [['0123456789ABCDEF', '133457799BBCDFF1'], ['436F6D7075746572', '4142434431323334'], ['0000000000000000', '0000000000000000'], ['FFFFFFFFFFFFFFFF', 'FFFFFFFFFFFFFFFF'], ['8000000000000001', '0101010101010101']]) {
  const cipher = crypto.createCipheriv('des-ede3', Buffer.from(key.repeat(3), 'hex'), null); cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(data, 'hex')), cipher.final()]).toString('hex').toUpperCase();
  equal(blockEncrypt(data, key), encrypted);
}
equal(blockEncrypt('0123456789ABCDEF', '133457799BBCDFF1'), '85E813540F0AB405');
equal(M.toHex(M.asciiBits('Computer')), '436F6D7075746572'); equal(M.toHex(M.asciiBits('ABCD1234')), '4142434431323334');
equal(M.asciiBits('Computer') === M.asciiBits('computer'), false);
equal(M.xor('01000011', '01010110'), '00010101');
for (const value of ['00000000', '10101010', '11111111']) equal(M.xor(M.xor(value, '01001101'), '01001101'), value);
equal(M.transposeByte('00100101'), '00001011');
equal(M.asciiRows('Security').map(r => M.toHex(M.transposeByte(r.binary))).join(' '), 'E8 2B AA 6B E2 3A 63 7A');
// Independent right-numbered source->destination permutation over every byte.
for (let n = 0; n < 256; n++) {
  const destinations = [4, 8, 1, 5, 7, 2, 6, 3]; let expected = 0;
  for (let bit = 0; bit < 8; bit++) if (n & (1 << bit)) expected |= 1 << (destinations[bit] - 1);
  equal(parseInt(M.transposeByte(n.toString(2).padStart(8, '0')), 2), expected);
}
const hello = Array.from(Buffer.from('HELLO'));
equal(M.padBytes(hello, 8, 'spaces'), [...hello, 32, 32, 32]);
equal(M.padBytes(hello, 8, 'zero-count'), [...hello, 0, 0, 3]);
equal(M.padBytes(hello, 8, 'count'), [...hello, 3, 3, 3]);
for (const length of [0, 1, 7, 8, 9, 16]) {
  const data = Array(length).fill(0);
  for (const method of ['count', 'zero-count']) {
    const padded = M.padBytes(data, 8, method); equal(padded.length % 8, 0); equal(padded.at(-1), 8 - length % 8); equal(padded.slice(0, length), data);
  }
}
equal(M.padBytes(Array(8).fill(65), 8, 'spaces').length, 8);
equal(D.passwords.total, 839299365868340224n); equal(D.passwords.remaining, 839299365868340162n);
equal(D.passwords.manualSeconds, 4196496829341700810n); equal(D.passwords.manualYears, '133070041518.95'); equal(D.passwords.computerYears, '266.14');
equal(M.roundFixed(1n, 8n), '0.13'); equal(M.roundFixed(1n, 1n), '1.00'); equal(M.roundFixed(0n, 1n), '0.00');
equal(M.roundFixed(999n, 100n, 1), '10.0'); equal(M.roundFixed(5n, 2n, 0), '3');
for (const q of D.questions) {
  equal(q.fields.length > 0, true);
  for (const field of q.fields) {
    equal(D.checkAnswer(q, field.id, field.answer).status, 'correct');
    equal(D.checkAnswer(q, field.id, '').status, 'empty');
    equal(D.checkAnswer(q, field.id, '<script>').status, 'format');
    if (field.kind === 'binary') {
      equal(D.checkAnswer(q, field.id, M.group(field.answer, 6)).status, 'correct');
      equal(D.checkAnswer(q, field.id, field.answer.slice(1)).status, 'format');
      equal(D.checkAnswer(q, field.id, (field.answer[0] === '0' ? '1' : '0') + field.answer.slice(1)).status, 'incorrect');
    } else {
      equal(D.checkAnswer(q, field.id, field.answer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')).status, 'correct');
      equal(D.checkAnswer(q, field.id, '8,39').status, 'format');
      equal(D.checkAnswer(q, field.id, field.kind === 'integer' ? '1' : '1.00').status, 'incorrect');
    }
  }
}
equal(D.checkAnswer(D.questions[2], 'years', '133070041518.9').status, 'format');
equal(D.questions.length, 7); equal(D.lessons.length, 11);
equal(D.questions.map(q => `${q.part}.${q.number}`), ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3']);
for (const name of ['Chapter 4.1 - Secret Key Cryptography.pdf', 'Chapter 4.2 - Data Encryption Standard.pdf', 'ICT304 Chapter 4 Practice Questions.pdf']) equal(fs.existsSync(path.join(__dirname, '..', name)), true);
for (const bad of [() => M.firstRound('0', '0'.repeat(64)), () => M.keySchedule('0'.repeat(56)), () => M.sBox(8, '000000'), () => M.sBox(0, '10001'), () => M.xor('00', '0'), () => M.permute('0', [2]), () => M.transposeByte('2'.repeat(8)), () => M.asciiRows('ก'), () => M.padBytes([256], 8, 'count'), () => M.padBytes([], 0, 'count'), () => M.rotateLeft('101', -1), () => M.roundFixed(-1n, 1n)]) throws(bad);
console.log(`${checks} Chapter 4 checks passed: source-derived DES fixtures, all S-box inputs, independent OpenSSL vectors, exact counts, padding and grading.`);
