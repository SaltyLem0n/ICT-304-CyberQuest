const assert = require('assert');
const data = require('../chapters6-10-data.js');
const {
  ExamStudyApp,
  EvidenceTracker,
  modPow,
  gcdBigInt,
  isPrimeBigInt,
  modInverseBigInt,
  validateRsaInputs
} = require('../chapters6-10.js');
const SmartSearch = require('../smart-search.js');

let checks = 0;
function ok(cond, msg) {
  assert(cond, msg);
  checks++;
}

// 1. Structural, microlearning, & concept-explainer checks
ok(Array.isArray(data.CHAPTERS) && data.CHAPTERS.length === 5, 'Should contain Chapters 6-10');
const chapterIds = new Set(data.CHAPTERS.map(c => c.id));
const lessonIds = new Set();

for (const ch of data.CHAPTERS) {
  ok(Boolean(ch.sourcePdf), `${ch.id} missing sourcePdf`);
  ok(Array.isArray(ch.lessons) && ch.lessons.length >= 3, `${ch.id} should have >=3 lessons`);
  let chWorkedExamples = 0;
  for (const l of ch.lessons) {
    lessonIds.add(l.id);
    if (l.workedExample) chWorkedExamples++;
    ok(Boolean(l.id && l.title && l.ref), `Lesson ${l.id} missing metadata`);
    ok(Boolean(l.objective), `Lesson ${l.id} missing learning objective`);
    ok(Array.isArray(l.prerequisites) && l.prerequisites.length >= 1, `Lesson ${l.id} missing prerequisites`);
    ok(Boolean(l.simpleExplanation && l.simpleExplanation.summary && l.simpleExplanation.analogy && l.simpleExplanation.limitation), `Lesson ${l.id} missing simpleExplanation/analogy/limitation`);
    ok(Boolean(l.immediatePractice && Array.isArray(l.immediatePractice.hints) && l.immediatePractice.hints.length >= 2), `Lesson ${l.id} missing progressive hints`);
    ok(Array.isArray(l.immediatePractice.options) && l.immediatePractice.options.length === 3, `Lesson ${l.id} immediatePractice should have 3 options`);
    ok(Array.isArray(l.immediatePractice.optionFeedback) && l.immediatePractice.optionFeedback.length === 3, `Lesson ${l.id} immediatePractice missing optionFeedback`);
  }
  ok(chWorkedExamples >= 1, `${ch.id} should have at least one structured workedExample`);
}

// 2. Question bank integrity & Bloom/objective mapping
const validBlooms = new Set(['Recall', 'Calculation', 'Application', 'Troubleshooting']);
const bloomCounts = { Recall: 0, Calculation: 0, Application: 0, Troubleshooting: 0 };
const qIds = new Set();

for (const q of data.QUESTIONS) {
  ok(!qIds.has(q.id), `Duplicate question ID ${q.id}`);
  qIds.add(q.id);
  ok(chapterIds.has(q.chapter), `Invalid chapter ${q.chapter} in ${q.id}`);
  ok(lessonIds.has(q.objectiveId), `Question ${q.id} maps to unknown objectiveId ${q.objectiveId}`);
  ok(validBlooms.has(q.bloom), `Question ${q.id} invalid bloom ${q.bloom}`);
  bloomCounts[q.bloom]++;
  ok(Array.isArray(q.options) && q.options.length === 4, `${q.id} should have 4 options`);
  ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, `${q.id} invalid correctIndex`);
  ok(Array.isArray(q.optionFeedback) && q.optionFeedback.length === 4, `${q.id} should have 4 optionFeedback entries`);
  ok(Boolean(q.hint && q.ref), `${q.id} missing hint or ref`);
}
ok(bloomCounts.Recall >= 4 && bloomCounts.Calculation >= 3 && bloomCounts.Application >= 5 && bloomCounts.Troubleshooting >= 3, 'Balanced Bloom mix');

// 3. Simulated Lab Drills
ok(Array.isArray(data.LAB_DRILLS) && data.LAB_DRILLS.length === 4, 'Should have 4 simulated Lab 1-4 drills');
for (const d of data.LAB_DRILLS) {
  ok(Boolean(d.simulatedOutput && d.ref && d.prompt), `Drill ${d.id} missing simulatedOutput/ref/prompt`);
  ok(Array.isArray(d.hints) && d.hints.length >= 2, `Drill ${d.id} needs progressive hints`);
  ok(Array.isArray(d.options) && d.options.length === 3 && d.optionFeedback.length === 3, `Drill ${d.id} needs 3 options + feedback`);
}

// 4. Independent math & Base64 verification
ok(modPow(180n, 55n, 221n) === 158n, 'Ch 6 p. 17 RSA signature = 158');
ok(modPow(158n, 7n, 221n) === 180n, 'Ch 6 p. 17 RSA verification = 180');
ok(Buffer.from('OK', 'utf8').toString('base64') === 'T0s=', 'Ch 7 immediatePractice Base64("OK") = T0s=');

const encPairs = [['Base64', 'QmFzZTY0'], ['Hacker', 'SGFja2Vy'], ['INFOSEC', 'SU5GT1NFQw=='], ['Encrypt', 'RW5jcnlwdA==']];
for (const [plain, b64] of encPairs) ok(Buffer.from(plain, 'utf8').toString('base64') === b64, `Base64 encode mismatch for ${plain}`);
const decPairs = [['RnV0dXJl', 'Future'], ['QW5nZWw=', 'Angel'], ['SW1hZ2luZQ==', 'Imagine'], ['RGllSGFyZA==', 'DieHard']];
for (const [b64, plain] of decPairs) ok(Buffer.from(b64, 'base64').toString('utf8') === plain, `Base64 decode mismatch for ${b64}`);

// 5. RSA Validation Unit Checks (Review Defect #2)
ok(isPrimeBigInt(13n) && isPrimeBigInt(17n) && !isPrimeBigInt(4n) && !isPrimeBigInt(1n), 'Prime checker');
ok(gcdBigInt(6n, 192n) === 6n && gcdBigInt(7n, 192n) === 1n, 'GCD checker');
ok(modInverseBigInt(7n, 192n) === 55n && modInverseBigInt(6n, 192n) === null, 'Modular inverse checker');

const rev2a = validateRsaInputs({ p: '4', q: '5', e: '5', h: '2' });
ok(!rev2a.ok && /not prime/i.test(rev2a.error), 'Rejects composite p=4 (Review Repro 2A)');

const rev2b = validateRsaInputs({ p: '13', q: '17', e: '6', h: '180' });
ok(!rev2b.ok && /not invertible/i.test(rev2b.error), 'Rejects non-invertible e=6 mod 192 (Review Repro 2B)');

const rev2eq = validateRsaInputs({ p: '17', q: '17', e: '5', h: '10' });
ok(!rev2eq.ok && /distinct/i.test(rev2eq.error), 'Rejects equal primes p=q');

const rev2range = validateRsaInputs({ p: '13', q: '17', e: '7', h: '221' });
ok(!rev2range.ok && /0 ≤ H < n/i.test(rev2range.error), 'Rejects H >= n');

const rev2big = validateRsaInputs({ p: '999999999999', q: '17', e: '7', h: '10' });
ok(!rev2big.ok && /between 2 and 10000/i.test(rev2big.error), 'Rejects oversized prime without hanging');

// 6. Behavioral Controller Tests with DOM + localStorage Stub (Review Defect #1 & #2)
function makeDomStub(initialValues = {}) {
  const store = {};
  global.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); }
  };
  const elements = {};
  function getEl(id) {
    if (!elements[id]) {
      elements[id] = {
        id,
        value: initialValues[id] ?? '',
        innerHTML: '',
        textContent: '',
        className: '',
        hidden: false,
        listeners: {},
        addEventListener(ev, fn) { this.listeners[ev] = fn; },
        querySelectorAll() { return []; },
        setAttribute() {}
      };
    }
    return elements[id];
  }
  global.document = {
    getElementById: getEl,
    querySelectorAll: () => []
  };
  return { store, elements, getEl };
}

const dom = makeDomStub({
  'sig-p': '4', 'sig-q': '5', 'sig-e': '5', 'sig-h': '2',
  'sig-ans-n': '20', 'sig-ans-z': '12', 'sig-ans-d': '5', 'sig-ans-s': '12'
});
const app = new ExamStudyApp(data);

// Test Review Defect 1A: Show hint -> Hide hint -> Answer correctly => MUST be 'helped', NOT 'independent'
const q0 = data.QUESTIONS[0];
app.markExposed('question', q0.id, 'hintUsed');
app.quizHintOpen[q0.id] = false; // hidden again
const outcome1a = app.recordChoiceOutcome('questionEvidence', 'question', q0.id, true);
ok(outcome1a === 'helped', 'Show hint -> hide hint -> correct answer must be helped, not independent');
ok(app.state.questionEvidence[q0.id] === 'helped', 'State persisted as helped');

// Test Review Defect 1B: Wrong attempt -> Retry correct answer => MUST be 'helped', NOT 'independent'
const q1 = data.QUESTIONS[1];
const outWrong = app.recordChoiceOutcome('questionEvidence', 'question', q1.id, false);
ok(outWrong === 'attempted', 'Wrong answer records attempted');
const outRetry = app.recordChoiceOutcome('questionEvidence', 'question', q1.id, true);
ok(outRetry === 'helped', 'Retrying after wrong answer must record helped, not independent');

// Test Review Defect 1C: Reload preserves exposure -> retrying q0 or q1 after reload STILL cannot earn independent
const appReloaded = new ExamStudyApp(data);
const outAfterReload = appReloaded.recordChoiceOutcome('questionEvidence', 'question', q0.id, true);
ok(outAfterReload === 'helped', 'Exposure persists across reload; cannot upgrade to independent');

// Test unassisted first-try correct answer earns independent
const q2 = data.QUESTIONS[2];
const outClean = appReloaded.recordChoiceOutcome('questionEvidence', 'question', q2.id, true);
ok(outClean === 'independent', 'Unassisted first-try correct answer earns independent');

// Test Review Defect 2A in controller: p=4, q=5, e=5, H=2
app.checkGuidedSignatureSteps();
ok(dom.elements['sig-output'].className.includes('error'), 'Controller rejects p=4,q=5,e=5,H=2');

// Test Review Defect 2B in controller: p=13, q=17, e=6, H=180 Show Solution
dom.elements['sig-p'].value = '13';
dom.elements['sig-q'].value = '17';
dom.elements['sig-e'].value = '6';
dom.elements['sig-h'].value = '180';
app.showGuidedSigSolution();
ok(dom.elements['sig-output'].className.includes('error'), 'Controller rejects e=6 mod 192 in Show Solution');

// Test valid RSA check succeeds and verifies H (note: Show Solution above was for invalid e=6, so (13,17,7,180) is unexposed)
dom.getEl('sig-e').value = '7';
dom.getEl('sig-ans-n').value = '221';
dom.getEl('sig-ans-z').value = '192';
dom.getEl('sig-ans-d').value = '55';
dom.getEl('sig-ans-s').value = '158';
app.checkGuidedSignatureSteps();
ok(dom.getEl('sig-output').className.includes('success') && dom.getEl('sig-output').innerHTML.includes('180 = H'), 'Valid RSA steps succeed and verify H=180');

// Test repeated submission of the same exercise does NOT increment freshRsaIndependentCount twice
const countAfterFirst = app.state.freshRsaIndependentCount;
app.checkGuidedSignatureSteps();
ok(app.state.freshRsaIndependentCount === countAfterFirst && dom.getEl('sig-output').innerHTML.toLowerCase().includes('already credited'), 'Repeated submission of same RSA exercise does not double-count');

// Test dynamic hint reflects current editable inputs (p=17, q=19 -> n=323, phi=288)
dom.getEl('sig-p').value = '17';
dom.getEl('sig-q').value = '19';
dom.getEl('sig-e').value = '5';
dom.getEl('sig-h').value = '42';
app.guidedSigHintLevel = 0;
app.showNextGuidedSigHint();
ok(dom.getEl('sig-hints').innerHTML.includes('323') && dom.getEl('sig-hints').innerHTML.includes('288'), 'Dynamic hint uses current inputs');

// Test solution revealed -> reload -> submit stays helped and awards 0 independent credit
for (const k of Object.keys(dom.store)) delete dom.store[k];
const cleanApp = new ExamStudyApp(data);
dom.getEl('sig-p').value = '13';
dom.getEl('sig-q').value = '17';
dom.getEl('sig-e').value = '7';
dom.getEl('sig-h').value = '180';
cleanApp.showGuidedSigSolution();
const reloadedApp = new ExamStudyApp(data);
dom.getEl('sig-p').value = '13';
dom.getEl('sig-q').value = '17';
dom.getEl('sig-e').value = '7';
dom.getEl('sig-h').value = '180';
dom.getEl('sig-ans-n').value = '221';
dom.getEl('sig-ans-z').value = '192';
dom.getEl('sig-ans-d').value = '55';
dom.getEl('sig-ans-s').value = '158';
reloadedApp.checkGuidedSignatureSteps();
ok(reloadedApp.state.freshRsaIndependentCount === 0 && !reloadedApp.state.rsaEvidence['13|17|7|180']?.includes('independent'), 'Solution -> reload -> submit does not award independent credit');
ok(dom.getEl('sig-output').innerHTML.toLowerCase().includes('help'), 'Solution -> reload -> submit reports assisted completion');

// Test unassisted fresh exercise (17, 19, 5, 42) awards 1 independent credit once
dom.getEl('sig-p').value = '17';
dom.getEl('sig-q').value = '19';
dom.getEl('sig-e').value = '5';
dom.getEl('sig-h').value = '42';
dom.getEl('sig-ans-n').value = '323';
dom.getEl('sig-ans-z').value = '288';
dom.getEl('sig-ans-d').value = '173';
dom.getEl('sig-ans-s').value = String(modPow(42n, 173n, 323n));
reloadedApp.checkGuidedSignatureSteps();
ok(reloadedApp.state.freshRsaIndependentCount === 1, 'Unassisted fresh RSA exercise awards 1 independent credit');
reloadedApp.checkGuidedSignatureSteps();
ok(reloadedApp.state.freshRsaIndependentCount === 1 && dom.getEl('sig-output').innerHTML.toLowerCase().includes('already credited'), 'Repeated unassisted submission stays at 1 independent credit');

// Test cycling loadFreshRsaExercise back to (13, 17, 7, 180) retains helped exposure
reloadedApp.rsaExerciseIndex = -1;
reloadedApp.loadFreshRsaExercise();
dom.getEl('sig-ans-n').value = '221';
dom.getEl('sig-ans-z').value = '192';
dom.getEl('sig-ans-d').value = '55';
dom.getEl('sig-ans-s').value = '158';
reloadedApp.checkGuidedSignatureSteps();
ok(reloadedApp.state.freshRsaIndependentCount === 1, 'Cycling New RSA Exercise back to exposed tuple does not reset exposure');

// Test SmartSearch
ok(SmartSearch.filter('sticky', data.LAB_COMMANDS, r => `${r.lab} ${r.cmd} ${r.purpose}`).length === 1, 'SmartSearch finds sticky');

console.log(`${checks} Chapters 6-10 & Labs checks passed (including behavioral regression tests for exposure, reload, RSA validation, and dynamic hints).`);
