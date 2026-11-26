# Teaching implementation review

Reviewed: 2026-11-26 (Asia/Bangkok).

## Latest independent verification after AGY's fixes

### Publication readiness recheck

The latest source now persists RSA exposure/evidence by normalized exercise identity and guards repeated credit. The added regression cases cover solution → reload → submit, repeated submissions, and cycling back to exposed exercises. Independently reran all seven suites: **8,393 checks passed** (8,032 existing checks plus 361 new checks). The dashboard links to the new Chapters 6–10 hub, lab view, mixed quiz, and draft cheat sheet; the new hub references the existing Chapter 5 RSA page and its required JavaScript files are present.

The previously reported implementation issues are resolved for the reviewed cases. The local site is ready for a publication step with the missing Lab 5 and Wireshark capture materials still flagged, and the cheat sheet retained as a draft. This recheck did not commit, push, or verify a live deployment. Older review findings below are retained as history.

All seven suites were rerun after the fixes: **8,387 checks passed** (8,032 Chapter 3–5 checks plus 355 Chapter 6–10 checks). Separate checks invoked the actual registered quiz hint/answer handlers using a DOM stub and confirmed that show → hide → correct, wrong → retry correct, and reload now retain helped status. Both previously invalid RSA examples are rejected, and the valid `(13,17,7,180)` example succeeds. The original two reported defects are resolved for those reproduced flows. This was controller-level verification, not a new browser or live deployment check.

One remaining defect affects the newly added RSA independence tracking:

- `guidedSigExposed` is an in-memory Boolean reset to false in the constructor. Reveal the default RSA solution, reload, then enter `n=221, φ(n)=192, d=55, S=158`: the checker reports **independently** even though the same solution was already revealed.
- Each successful submission of that same exercise increments the persisted `freshRsaIndependentCount` again. In the reproduction, pressing Check again advanced the count from 2 to 3 without loading or solving a different exercise.
- These are RSA progress-credit defects; the reproduced RSA arithmetic and invalid-key rejection now pass.

Focused follow-up: persist RSA exposure and completion by a stable exercise identity (normalized p, q, e, H), credit an unassisted exercise only once, and retain its exposure when cycling back to it or reloading. Do not clear exposure solely because New RSA Exercise was clicked if it selects a previously exposed tuple. Add regression tests for solution → reload → submit and repeated submission, while preserving the original successful fixes.

Application source remains unchanged by this independent review. Publication is still reported as local only by AGY; no live deployment was verified here.

## Outcome

AGY's teaching additions are present. Independently reran all seven current Node test suites: 8,366 assertions passed (8,032 existing Chapter 3–5 checks plus 334 new checks). Passing these tests does not establish correct learner-flow behavior: the new EvidenceTracker tests check status ranking, not the actual answer/hint transitions.

Targeted Node checks invoked the actual controller methods with a small DOM stub and captured click handlers. These were controller-level reproductions, not a new browser or Packet Tracer run. Two implementation defects were confirmed. No application source was changed during this review.

## 1. Independent/mastery credit can follow exposed assistance

Source: `chapters6-10.js`, lesson answer handling around lines 428–436 and quiz answer/hint handling around lines 677–697.

Quiz reproduction A:

1. Show a question's hint.
2. Hide the hint.
3. Select the correct answer.
4. The current visibility flag is zero, so the answer is recorded as `independent`. If the mapped lesson evidence is already independent, the quiz displays `Mastered (2+ independent)`.

Quiz reproduction B:

1. Select a wrong answer. Feedback identifies the correct answer and the option is highlighted.
2. Click that correct answer.
3. With no hint visibly open, the answer is recorded as `independent` and can contribute to mastery.

Both paths were reproduced through the actual registered handlers. The lesson and drill handlers use the same current-hint-only approach to independence and allow retrying revealed choices. In addition, hint/attempt information is in memory while credit persists, so refresh can erase exposure history.

Required correction: distinguish hint visibility from durable hint/solution/feedback exposure. A later click on the exposed answer is helped practice, not new independent evidence. Preserve exposure across reloads for the same item; offer genuinely fresh checks for new independent credit. Test the full state transitions through handlers, including show → hide → answer and wrong → revealed correct answer → retry.

## 2. RSA checker and solution can report invalid exercises as successful

Source: `chapters6-10.js`, `checkGuidedSignatureSteps` around lines 548–585 and `showGuidedSigSolution` around lines 601–613.

Reproduction A, enter:

```text
p=4, q=5, e=5, H=2
Your n=20, φ(n)=12, d=5, S=12
```

Observed output: success and `All steps verified`, ending with `12^5 mod 20 = 12 = H`. In fact H is 2. The checker does not reject the composite p and never asserts that verification recovers H. `(p−1)(q−1)` is not the totient formula for this input.

Reproduction B:

```text
p=13, q=17, e=6, H=180
Click Show solution.
```

Observed output: success with `d=192` and `S=1`. Since gcd(6,192)=6, no modular inverse exists. The brute-force search exits at z and incorrectly treats that value as a valid private exponent.

Required correction: validate distinct primes, permitted integer/exponent ranges, gcd(e,φ(n))=1, a valid positive private exponent, and 0≤H<n for these textbook exercises. Reject invalid inputs before checking or revealing answers; verify S^e mod n equals the supplied H before claiming success. Use a bounded, efficient modular-inverse routine rather than an unbounded linear search for editable inputs. Hints must use the current field values or clearly identify themselves as the fixed lecture example.

## Coverage observation

The actual data contains 17 lessons. Only two contain a structured `workedExample` field: one each in Chapters 6 and 7. Chapters 8–10 have none in that field. This is a structured-field observation, not a claim that every lesson body lacks any example. AGY should check each objective for an adequate worked calculation, decision, or troubleshooting example, rather than treating the presence of an objective and analogy as complete teaching coverage.

## Focused follow-up for AGY

```text
Read wiki/teaching-implementation-review.md. Preserve the existing teaching improvements and fix its two reproduced defects before marking this update complete.

1. Make assisted/exposed attempts ineligible for independent or mastery credit on that same item. Cover show/hide hint, wrong-answer feedback then retry, and reload behavior. Provide fresh checks to earn new independent credit.
2. Validate RSA inputs consistently in Check steps and Show solution; reject composite/equal primes and non-invertible exponents, validate exercise ranges, and verify recovery of H before success. Make hints consistent with editable inputs. Prevent large invalid inputs from hanging the page.
3. Add behavioral regression checks that reproduce both failures first and pass after the fixes. Keep the existing seven suites passing. Check the actual browser interactions afterward.
4. Review worked-example coverage across all 17 lessons, especially Chapters 8–10, and record any remaining gaps honestly.

Update the wiki with reproduction/fix evidence and state the real publication status. Do not claim that test counts alone prove teaching effectiveness or complete factual accuracy.
```

## Resolution Evidence (2026-11-26)

1. **Durable Exposure & Mastery Protection ([chapters6-10.js](../chapters6-10.js)):**
   - Replaced current-hint-visibility checks with durable `state.exposure` (`hintUsed`, `wrongAttempted`, `solutionRevealed`) persisted in `localStorage` across reloads for lessons, quiz questions, and lab drills.
   - `recordChoiceOutcome` ensures any exposed/assisted or previously wrong item can only earn `helped`, never `independent`, including across show→hide→answer, wrong→retry, and page-reload flows.
   - Added a `New RSA Exercise` button (`loadFreshRsaExercise`) in `03 · Guided RSA & Base64` for genuinely fresh unassisted checks.
2. **Strict RSA Validation & Dynamic Hints ([chapters6-10.js](../chapters6-10.js), [chapters6-10.html](../chapters6-10.html)):**
   - Added `isPrimeBigInt`, `gcdBigInt`, `modInverseBigInt` (Extended Euclidean Algorithm), and `validateRsaInputs` (distinct primes `2..10000`, `1 < e < φ(n)`, `gcd(e, φ(n)) = 1`, `0 ≤ H < n`).
   - Both `checkGuidedSignatureSteps` and `showGuidedSigSolution` validate inputs first (rejecting `p=4, q=5, e=5, H=2` and `p=13, q=17, e=6, H=180`), and `checkGuidedSignatureSteps` verifies `S^e mod n === H`.
   - `showNextGuidedSigHint` now computes hints from the current editable `p, q, e, H` inputs.
3. **Worked-Example Coverage ([chapters6-10-data.js](../chapters6-10-data.js)):**
   - Added structured `workedExample` blocks to Chapter 8 (`ch8-vpn-ipsec`), Chapter 9 (`ch9-acl`), and Chapter 10 (`ch10-ha-ft`) so all five chapters (Ch 6–10) now include structured worked examples. Remaining gap: Lab 5 (ACLs) `.pkt`/`.txt` and Ch 8 `.pcap` are still absent from `lab/`.
4. **Behavioral Regression Tests ([tests/chapters6-10.test.js](../tests/chapters6-10.test.js)):**
   - Added controller-level DOM + `localStorage` tests reproducing and verifying fixes for all review defects, alongside all 6 existing Chapter 3–5 test suites.
   - Publication status: **Local only**; nothing committed or pushed to GitHub Pages.

### Follow-Up RSA Identity & Persistence Verification (2026-11-26)
- **Persisted RSA Exercise Identity ([chapters6-10.js](../chapters6-10.js)):** Replaced in-memory `guidedSigExposed` with `rsaExerciseKey({ p, q, e, h })` (`${min(p,q)}|${max(p,q)}|${e}|${h}`) persisted in `state.exposure.rsa` and `state.rsaEvidence`.
- **Single-Credit & Reload Protection:** `checkGuidedSignatureSteps()` awards `independent` credit at most once per distinct `rsaExerciseKey` (`freshRsaIndependentCount` recomputed from `state.rsaEvidence`), prevents `helped`/`attempted` exercises from upgrading after page reload, and `loadFreshRsaExercise()` preserves prior exposure when cycling back to a previously seen tuple.
- **Test Verification (all 7 suites passing locally):**
  - `tests/chapter3-practice.test.js`: 115 checks passed
  - `tests/chapter4.test.js`: 1548 checks passed
  - `tests/chapter5-assignment.test.js`: 438 checks passed
  - `tests/chapter5-easy.test.js`: 567 checks passed
  - `tests/chapter5-math.test.js`: 5333 checks passed
  - `tests/chapter5-working.test.js`: 31 checks passed
  - `tests/chapters6-10.test.js`: 361 checks passed (including solution→reload→submit, repeated-submission single-credit, and `New RSA Exercise` cycling tests)
- **Publication status:** Published to `origin/main` (`afc3b6b`) and verified live on GitHub Pages.

### Live GitHub Pages Verification (2026-11-26)
- **Commit & Remote:** `afc3b6b` (`afc3b6b5624ae5fdbec7d4c61f95ba5ccd11caf0`) pushed to `https://github.com/SaltyLem0n/ICT-304-CyberQuest.git` (`main`). Excluded unrelated downloads (`drive-download-20261126T061943Z-1-001.zip`), handoff doc (`agy_handoff_architecture_documentation.md`), course PDFs (`Chapter 6–10` / CyberQuest export), and raw `lab/` binaries.
- **Live URL:** `https://saltylem0n.github.io/ICT-304-CyberQuest/` (verified in headless browser, zero console errors, zero 404s / failed network requests):
  - **Dashboard (`index.html`):** Verified `CHAPTERS 06–10 & LABS` and `EXAM CHEAT SHEET` cards alongside existing Chapter 3–5 cards, with `"Labs 1–4 verified, Lab 5 pending"` and `"Draft (Lab 5 Pending)"` flags preserved.
  - **Chapters 6–10 & Labs (`chapters6-10.html`):** Verified all 5 chapter tabs (17 lessons), preserved missing-material banner (`Lab 5 (ACLs) has no .pkt / .txt in lab/; Ch 8 Wireshark has no .pcap`), Lab CLI search/filter (`"sticky"` → 1 row, `"acl"` → 2 rows, clear → 20 rows) and 4 simulated drills, Mixed Quiz (22 questions, immediate correct/incorrect feedback & revisit counter), Guided RSA checker (`(13, 17, 7, 180)` → `n=221, φ(n)=192, d=55, S=158` verified, `New RSA Exercise` → `(17, 19, 5, 42)`), and Base64 encoder (`INFOSEC` → `SU5GT1NFQw==`).
  - **Draft Cheat-Sheet Links:** Verified `cheatsheet.html` (HTTP 200, `"DRAFT · Pending: Lab 5 (ACLs) .pkt/.txt & Ch 8 .pcap"`) and `ICT304_A4_CheatSheet.pdf` (`application/pdf`, 250,869 bytes, no 404).
