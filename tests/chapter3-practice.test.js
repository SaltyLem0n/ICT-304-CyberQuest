'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const D = require('../chapter3-practice-data.js');
let checks = 0;
function check(fn) { fn(); checks++; }
const q = id => D.questions.find(q => q.id === id);
const letters = s => s.toUpperCase().replace(/[^A-Z]/g, '');
const existingSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const context = vm.createContext({});
vm.runInContext(existingSource.slice(existingSource.indexOf('    class CaesarCipher {'), existingSource.indexOf('    class ScratchpadEngine {')) + '\nthis.ciphers={caesar:new CaesarCipher(),atbash:new AtbashCipher(),vigenere:new VigenereCipher(),playfair:new PlayfairCipher()};', context);

check(() => assert.deepEqual(D.questions.map(q => q.id), Array.from({ length: 15 }, (_, i) => i + 1)));
check(() => assert.deepEqual(D.questions.filter(q => q.selfCheck).map(q => q.id), [5]));
check(() => assert.equal(q(1).fields[1].answer, '49 4E 46 4F 52 4D 41 54 49 4F 4E 20 53 45 43 55 52 49 54 59'));
check(() => {
  const bytes = q(1).fields[0].answer.split(' ');
  assert.equal(bytes.length, 20);
  assert(bytes.every(b => /^[01]{8}$/.test(b)));
  assert.equal(bytes.map(b => String.fromCharCode(parseInt(b, 2))).join(''), 'INFORMATION SECURITY');
});
check(() => assert.equal(context.ciphers.caesar.encrypt(q(2).fields[0].answer, 3), q(2).ciphertext));
check(() => assert.equal(context.ciphers.caesar.decrypt(q(3).ciphertext, 4), letters(q(3).fields[0].answer)));
check(() => assert.equal(context.ciphers.atbash.decrypt(q(4).ciphertext), letters(q(4).fields[0].answer)));
check(() => {
  const result = context.ciphers.playfair.decrypt(q(5).ciphertext, 'TMPQSZVWXYEOCURFNABDLGHIK');
  assert.equal(result.plaintext, q(5).fields[0].answer);
  assert.equal(result.plaintext, q(5).trace.plaintext);
  assert.equal(result.steps.length, 28);
  assert(q(5).sourceIssue.includes('self-check'));
});
for (const id of [6, 7]) check(() => assert.equal(q(id).trace.decoded.join(''), letters(q(id).fields[0].answer)));
for (const [shape, provided] of q(7).clues) check(() => {
  const index = D.pigpen.indexOf(shape);
  assert(index >= 0);
  assert.equal(D.alphabet[(index + 17) % 26], provided);
});
check(() => assert.equal(context.ciphers.vigenere.decrypt(q(8).ciphertext, 'CHICAGO').plaintext, letters(q(8).fields[0].answer)));

// Independent forward encryptions must recover the exact supplied ciphertexts.
function encryptRail(text, count) {
  const rails = Array.from({ length: count }, () => []), cycle = 2 * (count - 1);
  Array.from(text).forEach((c, i) => rails[count - 1 - Math.abs(i % cycle - (count - 1))].push(c));
  return rails.flat().join('');
}
for (const [id, count] of [[9, 2], [10, 3]]) check(() => assert.equal(encryptRail(letters(q(id).fields[0].answer), count), q(id).ciphertext));
check(() => assert.deepEqual(q(9).trace.strips.map(r => r.length), [19, 18]));
check(() => assert.deepEqual(q(10).trace.strips.map(r => r.length), [9, 18, 9]));
check(() => {
  const raw = 'THEENEMYWILLATTACKATDAWNX'; let cipher = '';
  for (let k = 0; k < 25; k++) {
    const column = 4 - Math.floor(k / 5), row = Math.floor(k / 5) % 2 ? k % 5 : 4 - k % 5;
    cipher += raw[row * 5 + column];
  }
  assert.equal(cipher, q(11).ciphertext);
  assert.equal(q(11).trace.raw, raw);
});
check(() => {
  const raw = q(12).fields[0].answer;
  assert.equal(raw.length, 54);
  assert.equal(raw.match(/.{6}/g).map(b => b.slice(2) + b.slice(0, 2)).join(''), q(12).ciphertext);
  assert.equal(q(12).trace.rows.map(r => r.plaintext).join(''), raw);
});
function encryptColumnar(text, key) {
  assert.equal(text.length % key.length, 0);
  return Array.from(key, (c, i) => [c, i]).sort((a, b) => a[0].localeCompare(b[0]) || a[1] - b[1]).map(([, i]) => Array.from({ length: text.length / key.length }, (_, r) => text[r * key.length + i]).join('')).join('');
}
check(() => assert.equal(encryptColumnar('MEETXMEXAFTERXMIDNIGHTXATXOURXBASEX', 'JOURNEY'), q(13).ciphertext));
check(() => assert.equal(encryptColumnar(encryptColumnar('ACTIONISTHEFOUNDATIONALKEYTOALLSUCCESSABCD', 'WONDER'), 'PICTURE'), q(14).ciphertext));
check(() => assert.deepEqual(q(14).trace.stages[1].ranks, [6, 4, 3, 1, 2, 5]));
const offsetEncode = s => Array.from(s, c => (c.charCodeAt(0) + 5).toString(16).toUpperCase().padStart(2, '0')).join(' ');
check(() => assert.equal(offsetEncode(q(15).known.text), q(15).known.hex));
check(() => assert.equal(offsetEncode(q(15).fields[0].answer), q(15).ciphertext));

for (const question of D.questions) {
  check(() => {
    assert(question.page >= 1 && question.page <= 4);
    assert(question.prompt && question.method && question.hint && question.steps.length);
    if (question.figure) assert(fs.existsSync(path.join(__dirname, '..', 'assets', 'chapter3-practice', question.figure)));
  });
  for (const field of question.fields) {
    const expectedStatus = question.selfCheck ? 'self-check' : 'correct';
    check(() => assert.equal(D.checkAnswer(question, field.id, field.answer).status, expectedStatus));
    check(() => assert.equal(D.checkAnswer(question, field.id, field.answer.toLowerCase().replace(/ /g, '\n')).status, expectedStatus));
    for (const variant of field.accepted || []) check(() => assert.equal(D.checkAnswer(question, field.id, variant).status, expectedStatus));
    if (!question.selfCheck) {
      check(() => assert.equal(D.checkAnswer(question, field.id, '').status, 'empty'));
      check(() => assert.notEqual(D.checkAnswer(question, field.id, 'WRONG123').status, 'correct'));
    }
  }
}
check(() => assert.equal(D.checkAnswer(q(1), 'binary', q(1).fields[0].answer.replace('01001001', '1001001')).status, 'format'));
check(() => assert.equal(D.checkAnswer(q(1), 'hex', '49 4G').status, 'format'));
check(() => assert.equal(D.checkAnswer(q(1), 'hex', q(1).fields[1].answer.replace(' 20 ', ' ')).status, 'incorrect'));
check(() => assert.equal(D.checkAnswer(q(2), 'plaintext', q(2).fields[0].answer.replace('5 pm', '6 pm')).status, 'incorrect'));
check(() => assert.equal(D.checkAnswer(q(13), 'plaintext', 'MEET ME AFTER MIDNIGHT AT OUR BASE XXXX').status, 'incorrect'));
check(() => assert.equal(D.checkAnswer(q(5), 'plaintext', 'any attempt').status, 'self-check'));
console.log(`${checks} Chapter 3 checks passed: independent cipher/round-trip fixtures, source figures, padding, formats, and answer feedback.`);
