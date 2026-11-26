# ICT 304 exam preparation and AGY handoff

Recorded: 2026-11-26 (Asia/Bangkok).

## Agreed objective and order

Prepare for the ICT 304 exam covering Chapters 5–10, practical labs, and the Chapter 5 encryption calculations previously practised. The permitted reference is exactly **one A4 sheet, front side only**.

Follow this order: **audit the PDFs and calculations → research useful GitHub study repositories → update CyberQuest → create the cheat sheet**.

The user said they would give the prompt below to AGY. This records the intended handoff; it does not establish that AGY has received it or started work. Do not duplicate AGY's implementation or advance phases based only on this plan. Review actual outputs and evidence when they become available.

## Current evidence and status

### Follow-up on 2026-11-26

The user supplied an AGY transcript and clarified that they want **AI agent skills from GitHub that improve teaching in the website**. The earlier Phase 2 shortlist was mainly study software and libraries, so a teaching-skill review is now the immediate focus. See [Teaching skills from GitHub](teaching-agent-skills.md).

The supplied transcript reports all four phases completed locally, including an audit, Chapters 6–10 pages, regression tests, and a draft one-page cheat sheet. Read-only inspection confirmed that the new website and cheat-sheet files exist and that the audit report exists at `C:\Users\Sutee\.gemini\antigravity\brain\9bd27c7b-84ef-4545-998c-98eef4717190\phase1_audit_report.md`. This is **reported completion with files observed**, not an independent verification of audit accuracy, all test results, page layout, or deployment. Preserve the existing implementation while preparing the teaching follow-up. No new implementation was made during the skill review.

### Initial handoff baseline

- Workspace: `D:\SCHOOL DOCs\ICT 304`.
- Existing repository: <https://github.com/SaltyLem0n/ICT-304-CyberQuest>.
- Website address recorded in the project README: <https://saltylem0n.github.io/ICT-304-CyberQuest/>. Live behavior has not been checked for this handoff.
- Original lecture PDFs for Chapters 5–10 are present.
- The Chapter 5 CyberQuest PDF export contains a worked Assignment 3 RSA example and is a derived source.
- Chapter 9 Part 1 exists in two different files: the unnumbered Part 1 PDF has 62 pages and the Chapter 9.1 PDF has 71 pages. Their full contents have not yet been compared. Chapter 9.2 Part 2 has 19 pages.
- `lab/` already contains Packet Tracer files labelled Labs 1–4, plus a Lab 4 port-security configuration text file. Their filenames indicate IOS basics, IP addressing/password security, VLANs/trunks, and port security. Actual lab contents and execution remain unverified. The user indicated additional lab materials may be missing.
- The existing README describes Chapter 3–5 lessons and practice, including RSA worked steps, printable worksheets, and regression tests. Those claims were not independently retested for this handoff.
- **No full PDF accuracy audit, GitHub study-repository research, website implementation, or final cheat-sheet creation has been completed as part of this handoff.**

## Progress checklist

- [x] Inspect the folder and identify the existing project and key source ambiguities.
- [x] Draft the AGY goal prompt and save it in this wiki.
- [x] Phase 1: Complete the source inventory, page-level audit, independent calculation checks, and lab inventory. (See `phase1_audit_report.md`.)
- [x] Phase 1: Report findings, corrected working, citations, and unresolved gaps.
- [x] Phase 2: Verify and compare 3–5 useful GitHub study repositories (and 5 teaching-design skills in `wiki/teaching-agent-skills.md`).
- [x] Phase 3: Extend the existing CyberQuest site with verified content (`chapters6-10.html`, `chapters6-10-data.js`, `chapters6-10.js`, `index.html`) and validate via `tests/chapters6-10.test.js` (334 checks) + existing Ch 3–5 tests (8,032 checks). **Local only; not pushed to GitHub Pages.**
- [x] Phase 4: Produce an editable cheat-sheet source (`cheatsheet.html`) and a verified single-page A4 PDF (`ICT304_A4_CheatSheet.pdf`, 1 page, 209.9 × 297.0 mm, labeled DRAFT due to missing Lab 5 `.pkt`/`.txt` & Ch 8 `.pcap`).

When recording progress, link the actual reports, files, test results, and deployment evidence. A checked box or an agent's assertion alone does not verify the underlying result. Keep missing lab coverage explicit; do not invent exam weightings.

## Full AGY goal prompt

```text
Goal: Turn my ICT 304 materials into an accurate, easy-to-study exam resource, then create my permitted cheat sheet.

Workspace: D:\SCHOOL DOCs\ICT 304
Existing repository: https://github.com/SaltyLem0n/ICT-304-CyberQuest
Existing website: https://saltylem0n.github.io/ICT-304-CyberQuest/

Exam scope:
- Chapters 5–10.
- Practical labs; some materials may still be missing.
- Chapter 5 encryption calculations we practised, including RSA.
- Exactly ONE A4 sheet, FRONT SIDE ONLY. All final cheat-sheet content must fit on one printed page.

Complete the following phases IN ORDER. Ground later work in the verified results of earlier phases.

PHASE 1 — Audit the course materials first

1. Inspect the current folder, repository instructions, README, existing website, tests, PDFs, and lab materials. Preserve my existing work and original PDFs.
2. Build a source inventory and chapter/topic coverage map. Record filenames, page counts, and missing material.
3. Resolve the overlap between:
   - Chapter 9 - Network Security Configurations Part 1.pdf
   - Chapter 9.1 - Network Security Configurations Part 1.pdf
   - Chapter 9.2 - Network Security Configurations Part 2.pdf
   Compare their contents; do not assume similarly named PDFs are duplicates or that the longest is authoritative.
4. Distinguish the original Chapter 5 lecture PDF from the CyberQuest PDF export containing worked Assignment 3 RSA calculations. The website and its export are derived resources, not independent proof.
5. Review every in-scope PDF page, including diagrams, formulas, tables, examples, and answer keys. Use text extraction and visual inspection where needed. Track reviewed coverage so nothing is silently skipped.
6. Check technical claims against authoritative primary sources, such as relevant standards, RFCs, NIST publications, and official Cisco documentation. Separate:
   - Correct.
   - Correct within a stated classroom simplification.
   - Incorrect or inconsistent.
   - Unclear or not independently verified.
   Distinguish historical/course conventions from current security guidance.
7. Recalculate the Chapter 5 worked exercises independently, using exact integer arithmetic rather than trusting the existing website or its tests. Check:
   - Prime selection, n and φ(n).
   - Valid public exponent and modular inverse.
   - Public/private key notation and which key is used.
   - Letter mappings, message blocks, and permitted message ranges.
   - Modular exponentiation, repeated squaring, intermediate remainders.
   - Encryption/decryption round trips.
   - The supplied Assignment 3 worked example.
   Preserve the instructor’s notation where valid and explain discrepancies.
8. Inventory lab/ and other supplied folders. Labs 1–4 appear to include IOS basics, IP addressing/password security, VLANs/trunks, and port security. Verify this from the actual materials. Do not invent missing lab instructions or claim Packet Tracer execution without running it.

Deliver an audit report with:
Source filename + PDF page/slide | Original claim/calculation | Finding | Correct explanation/working | Supporting source.

Report the audit findings before beginning repository research. Unresolved material must remain visibly flagged in later outputs.

PHASE 2 — Find useful GitHub study repositories

Search GitHub for tools that address the verified syllabus and help me understand, recall, and practise the material.

Consider active recall, spaced repetition, flashcards, exam quizzes, visual explanations, RSA practice, and relevant networking labs.

Shortlist 3–5 strong matches. For each, verify and report:
- Repository link and specific relevant features.
- Which exam topics it supports.
- Maintenance status, license, setup effort, and dependencies.
- Local/offline usability and any account, API, payment, or upload requirements.
- Whether we should use it separately or adapt an idea into CyberQuest.

Explain practical fit rather than ranking by stars. Do not install large stacks or replace the existing website merely to use a repository. Verify licenses before reusing code or content.

PHASE 3 — Update the existing CyberQuest website

Extend the current site using the verified materials and useful findings from Phase 2.

- Preserve existing working features and the lightweight GitHub Pages architecture.
- Add Chapters 5–10 coverage with clear source references.
- Provide concise explanations, comparison tables, active-recall questions, optional hints, worked answers, and explanations for incorrect answers.
- Include paper-first RSA exercises with full intermediate calculations.
- Add lab command practice and troubleshooting based on supplied materials, showing command modes, purposes, verification commands, and common mistakes.
- Clearly distinguish verified material, source corrections, and pending lab coverage.
- Support focused revision by chapter and mixed practice.
- Validate new content independently and run relevant existing regression tests.
- Check navigation, mobile usability, answer checking, and print views.
- State precisely what changed locally and whether anything was actually published.

PHASE 4 — Create the one-sided A4 cheat sheet

Only compress material after the audit and study content are established.

- Produce an editable source and a print-ready PDF.
- Exactly one A4 page: 210 × 297 mm, front only.
- Prioritize useful formulas, decision rules, easily confused concepts, lab commands, and compact calculation procedures.
- Reserve useful space for RSA key generation, modular inverse, repeated squaring, and one checked miniature example.
- Allocate space across Chapters 5–10 and the confirmed labs according to coverage and practical usefulness. Do not invent exam weightings.
- Use readable typography, strong grouping, and grayscale-friendly formatting. Reduce low-value content before shrinking text excessively.
- Render and visually inspect the final PDF. Verify page size, page count, margins, legibility, and absence of clipping or overflow at actual print size.
- If required lab materials are still missing, label the sheet as a draft and identify the coverage gap.

Completion report:
Provide the audit, repository shortlist, website changes and validation results, cheat-sheet files, and any unresolved gaps. Clearly distinguish verified results from assumptions and work that could not be checked.

Start with Phase 1.
```
