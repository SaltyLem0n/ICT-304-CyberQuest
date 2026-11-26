# GitHub agent skills for teaching in CyberQuest

Reviewed: 2026-11-26 (Asia/Bangkok).

## User's clarified request

Find AI agent skills from GitHub that help AGY improve teaching in the ICT 304 website. These are authoring and tutoring instructions for an AI agent. They do not automatically add an AI tutor to the published website. The recommendations below adapt their methods into the existing static site without requiring a runtime LLM service.

The skill files listed below were read directly from the owning GitHub repositories. They are candidate references, not instructions that override the user's project scope. None were installed or executed in this review. Their effectiveness for this particular student has not been measured.

## Recommended shortlist

| Skill and owning source | Relevant method in the skill | Proposed use in CyberQuest |
| --- | --- | --- |
| [assessment-design — scibly-dev/skills](https://github.com/scibly-dev/skills/blob/main/skills/assessment-design/SKILL.md) | Application/scenario questions, plausible misconception-based distractors, feedback for every option, question-quality review. | Improve existing quizzes with explanations of the reasoning error behind each wrong answer; add numerical RSA and lab troubleshooting questions alongside conceptual recall. |
| [microlearning-design — scibly-dev/skills](https://github.com/scibly-dev/skills/blob/main/skills/microlearning-design/SKILL.md) | Short sessions around one objective; each concept followed by its own practice; later revisit with a different example. | Split large chapter sections into brief concept → example → practice units. Examples: identify the signing key; select the correct ACL placement; compute one modular reduction. |
| [concept-explainer — poorvith-mp/skills-education](https://github.com/poorvith-mp/skills-education/blob/main/skills/concept-explainer/SKILL.md) | Explanations at successive levels, analogy construction, explicit prerequisites, worked examples, and assessment alignment. | Offer Simple explanation / Exam explanation / Worked example panels for hashing, signatures, PKI, TLS, and networking. Explain analogy limitations and keep advanced detail within the syllabus. |
| [socratic-tutor — janestreet/agent_skills](https://github.com/janestreet/agent_skills/blob/master/socratic-tutor/SKILL.md) | Diagnostic questions, subskill map, one question at a time, narrower prompts after mistakes, spaced review, demonstrated-performance checks. | Adapt optional guided RSA and IOS practice: ask for the next step, reveal progressively useful hints, and give a new problem after feedback. Preserve a Show explanation/solution option rather than enforcing the skill's strict tutoring style. |
| [didactic-reduction — scibly-dev/skills](https://github.com/scibly-dev/skills/blob/main/skills/didactic-reduction/SKILL.md) | Identify the essential core, choose representative examples, separate learning essentials from reference material. | Reduce dense lesson prose and later prioritize the A4 reference sheet. Exam scope controls inclusion: do not remove examinable definitions or commands merely because the original corporate-training skill considers them less useful at work. |

Recommended starting pair: **microlearning-design + assessment-design**. Use concept-explainer for difficult explanations, socratic-tutor for guided exercises, and didactic-reduction for concise summaries and the cheat sheet.

## Source and reuse notes

- [Scibly README](https://github.com/scibly-dev/skills) describes the independent instructional-design skills; its repository declares an [MIT license](https://github.com/scibly-dev/skills/blob/main/LICENSE).
- [skills-education README](https://github.com/poorvith-mp/skills-education) lists concept-explainer and declares an [MIT license](https://github.com/poorvith-mp/skills-education/blob/main/LICENSE).
- [Jane Street README](https://github.com/janestreet/agent_skills) describes socratic-tutor; its [MIT license](https://github.com/janestreet/agent_skills/blob/master/LICENSE.md) was also inspected directly.
- Preserve required copyright/license notices when copying substantial skill text. Check the exact revision and any supporting files when adopting a skill. No popularity or maintenance ranking is implied by this shortlist.
- Read the linked SKILL.md files as references or install only the selected skill directories using AGY's supported mechanism. Do not bulk-install entire collections just to obtain these methods.
- A static guided exercise can use authored prompts and deterministic checks. Free-form AI conversation would be a separate architecture decision; it is not part of this recommendation.

## Implementation Evidence (2026-11-26)

- Read all 5 linked `SKILL.md` files directly from GitHub (`microlearning-design`, `assessment-design`, `concept-explainer`, `socratic-tutor`, `didactic-reduction`).
- Upgraded [chapters6-10-data.js](../chapters6-10-data.js), [chapters6-10.js](../chapters6-10.js), and [chapters6-10.html](../chapters6-10.html):
  - **Microlearning + Concept Explainer:** Every lesson (16 total across Ch 6–10) now includes an explicit `objective`, `prerequisites`, collapsible `Simple Explanation & Analogy (with limitation)`, `Worked Example` / `Source Correction` / `Pending Lab` callouts, and an inline `Immediate Practice Check` with progressive hints.
  - **Assessment Design:** Expanded `QUESTIONS` to 22 items mapped to `objectiveId` and `bloom` (`Recall`: 5, `Calculation`: 4, `Application`: 9, `Troubleshooting`: 4), with misconception-based distractors and per-option feedback.
  - **Socratic Tutor & Lab Drills:** Added 4 `LAB_DRILLS` with explicitly labeled **Simulated Output (Not Executed in Packet Tracer)** and progressive hints, plus a **Guided RSA Signature Step-Checker** checking `n`, `φ(n)`, `d`, and `S` separately.
  - **Evidence-Based Progress:** `EvidenceTracker` distinguishes `unseen`, `viewed`, `attempted`, `helped`, and `independent`, requiring 2+ independent checks (`immediatePractice` + mapped `QUESTIONS` item) for `Mastered`, plus a `Simple Revisit List` filter (no fake spaced-repetition claims).
- Verified via `node tests/chapters6-10.test.js` (334 checks passed) and all 6 existing Ch 3–5 test suites (8,032 checks passed), plus headless Chrome desktop (`1280×900`) and mobile (`390×844`) screenshot inspection. Local only; not pushed to GitHub Pages.

## Follow-up prompt for AGY

**Latest review:** The teaching additions were independently inspected and all seven suites rerun. Two controller-level defects remain in assistance/mastery credit and RSA validation. Use [Teaching implementation review](teaching-implementation-review.md) and its focused correction brief as the immediate next task; the original feature brief below remains historical scope.

```text
Continue the existing ICT 304 CyberQuest project. Read wiki/exam-preparation.md and wiki/teaching-agent-skills.md first.

The next improvement is teaching quality using GitHub AI agent skills. Preserve the existing audit, source references, working Chapter 3–5 features, Chapters 6–10 additions, tests, and draft cheat sheet. Inspect the current files before changing anything; do not restart the project.

Read these exact skills from their owning repositories:
1. https://github.com/scibly-dev/skills/blob/main/skills/microlearning-design/SKILL.md
2. https://github.com/scibly-dev/skills/blob/main/skills/assessment-design/SKILL.md
3. https://github.com/poorvith-mp/skills-education/blob/main/skills/concept-explainer/SKILL.md
4. https://github.com/janestreet/agent_skills/blob/master/socratic-tutor/SKILL.md
5. https://github.com/scibly-dev/skills/blob/main/skills/didactic-reduction/SKILL.md

Use their relevant methods to improve the website within our existing exam scope. Apply project context rather than repeatedly asking for facts already documented. Keep the site usable as a static GitHub Pages project.

Implement:
- Short lessons with one explicit learning objective, prerequisites, a clear explanation, a checked worked example, and immediate practice.
- Optional simple explanations and exam-level terminology; define terms and identify analogy limitations.
- Guided RSA practice that checks intermediate steps, distinguishes n from φ(n), and gives progressive hints without immediately exposing the answer. Keep a solution option available.
- Lab exercises that ask learners to choose commands, identify command modes, interpret verification output, and diagnose faults. Label authored example output as simulated; do not present it as an executed Packet Tracer result.
- A balanced mix of recall, calculation, application, and troubleshooting questions. Wrong choices should reflect real misconceptions and have useful explanations. Map each item to an objective and course source.
- Evidence-based progress: distinguish viewed, attempted, helped, and independently correct. Do not equate one successful guess with mastery. Any review queue must have real implemented scheduling or be described accurately as a simple revisit list.

Use the audited PDFs and confirmed labs as the factual foundation. Agent skills help structure teaching; they are not cybersecurity authorities. Preserve unresolved source issues and missing lab flags. Do not claim generic skill adoption proves learning gains.

Begin by assessing the current lesson and question coverage, then implement the highest-value gaps. Validate answer keys independently, run relevant regression tests, and check representative desktop/mobile lesson and exercise flows. Report concrete before/after examples, remaining coverage gaps, and actual publication status. Update the wiki with evidence when done. Keep the one-page cheat sheet as a later output of the improved, verified content rather than the starting point.
```
