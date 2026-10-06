'use strict';
const assert = require('node:assert/strict');
const M = require('../chapter5.js');
let checks = 0;
function check(fn) { fn(); checks++; }
// A deliberately different oracle: direct integer exponentiation on bounded toy inputs.
function direct(base, e, n) { return BigInt(base) ** BigInt(e) % BigInt(n); }
check(() => assert.equal(M.gcd(24,5), 1n));
check(() => assert.equal(M.gcd(72,12), 12n));
check(() => assert.equal(M.inverse(5,72), 29n));
check(() => assert.throws(() => M.inverse(6,24), /inverse/));
check(() => assert.throws(() => M.integer('5.5'), /whole/));
check(() => assert.throws(() => M.integer(''), /whole/));
check(() => assert.throws(() => M.keys(4,7,5), /prime/));
check(() => assert.throws(() => M.keys(5,5,3), /different/));
check(() => assert.throws(() => M.keys(5,7,6), /relatively/));
check(() => assert.throws(() => M.keys(5,7,1), /1 < e/));
check(() => assert.throws(() => M.keys(5,7,35), /1 < e/));
check(() => assert.throws(() => M.keys(5,7,5,3), /ed mod/));
check(() => assert.throws(() => M.trace(35,5,35), /block/));
check(() => assert.throws(() => M.trace(-1,5,35), /block/));
check(() => assert.throws(() => M.trace(1,0,35), /positive/));
const expected = { q4a: [39n,24n,5n,4n], q4b: [91n,72n,29n,8n], q4c: [77n,60n,11n,7n], q4d: [155n,120n,37n,5n] };
for (const [id, [n,z,d,c]] of Object.entries(expected)) {
  const r = M.solve(M.exercises.find(ex => ex.id === id));
  check(() => assert.deepEqual([r.n,r.z,r.d,r.messages[0].c], [n,z,d,c]));
  check(() => assert.equal(r.messages[0].decryption.result, r.messages[0].m));
}
const q3 = M.solve(M.exercises.find(ex => ex.id === 'q3'));
check(() => assert.equal(q3.messages[0].c,128n));
check(() => assert.equal(q3.messages[0].decryption.result,24n));
check(() => assert.deepEqual(q3.messages[0].encryption.squares.map(row => row.remainder),[24n,4n,16n,113n,42n,48n]));
const q2 = M.solve(M.exercises.find(ex => ex.id === 'q2'));
check(() => assert.deepEqual(q2.messages.map(row => row.c), [17n,15n,22n,10n]));
check(() => assert.deepEqual(q2.messages.map(row => row.decryption.result), [12n,15n,22n,5n]));
check(() => assert.equal(M.keys(5,7,7,7).d,7n));
check(() => assert.equal(M.keys(5,7,5,29).d,29n));
check(() => assert.deepEqual(M.encode('How are you?','blocks').blockStrings,['3314','2262','0017','0462','2414','2066']));
check(() => assert.deepEqual(M.encode('a','blocks').blockStrings,['0062']));
check(() => assert.equal(M.encode('a','blocks').padded,true));
check(() => assert.deepEqual(M.encode('aA','blocks').blockStrings,['0026']));
check(() => assert.throws(() => M.encode('a b'), /letters only/));
check(() => assert.throws(() => M.encode('!','blocks'), /supports/));
check(() => assert.throws(() => M.validateBlocks([3314],35), /too large/));
check(() => assert.equal(M.validateBlocks([3314,17],3315),true));
for (const [p,q] of [[3,5],[5,7],[7,11],[11,13],[5,31]]) {
  const n=p*q,z=(p-1)*(q-1);
  for (const e of [3,5,7,11,13,37].filter(e=>e<n && M.gcd(e,z)===1n)) {
    const d=M.inverse(e,z);
    // Include 0,1 and messages sharing factors with n, without imposing GCD(m,n)=1.
    for(let m=0;m<n;m++) {
      const enc=M.trace(m,e,n),dec=M.trace(enc.result,d,n);
      check(()=>assert.equal(enc.result,direct(m,e,n)));
      check(()=>assert.equal(dec.result,BigInt(m)));
      check(()=>{
        for(const row of [...enc.squares,...enc.products,...dec.squares,...dec.products]) {
          assert.equal(row.dividend,row.quotient*BigInt(n)+row.remainder);
          assert(row.remainder>=0n && row.remainder<BigInt(n));
        }
      });
    }
  }
}
for(let i=0;i<150;i++) {
  let seed=i+1; const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const difficulty=i%2?'beginner':'mixed', ex=M.generate(difficulty,'generated',rng),r=M.solve(ex);
  check(()=>{assert(r.n<=BigInt(difficulty==='beginner'?77:200));assert.equal(r.messages[0].c,direct(ex.messages[0],ex.e,r.n));assert.equal(r.messages[0].decryption.result,BigInt(ex.messages[0]));});
}
console.log(`${checks} exact-arithmetic checks passed, including all slide exercises and independent RSA round trips.`);
