# CLI trainer and cheat-sheet study-readiness review

Reviewed: 2026-11-26 (Asia/Bangkok).

## Latest independent recheck after fixes

All eight current Node suites were independently rerun: **8,445 checks passed** (CLI trainer: 52). Both original counterexamples were rerun against the actual exported checker: the post-configuration shutdown is rejected, and console-local authentication no longer satisfies required VTY settings. The TLS qualification appears in the regenerated PDF. Its page count/dimensions were rechecked and a fresh Poppler rendering inspected: one A4 page, no obvious clipping or overflow, with enlarged typography.

The reported specific fixes are confirmed for these cases. Guided study can proceed. Source coverage remains **2 reviewed, 2 partial, 7 filename-only**; a template must not be represented as a fully verified solution to an unread activity. Use the actual .pka requirements and Packet Tracer show/traffic results while practising. No new browser or Packet Tracer execution was performed during this recheck; public deployment was not verified. Earlier findings below remain as review history rather than current assertions that the original bugs are still present.

## Outcome for the student

Start studying the memory guide and practising real Packet Tracer activities now. The website is useful for guided rehearsal, but its configuration checker is not yet dependable enough to certify an exercise as correct. The existing cheat sheet is a draft reference with a confirmed technical correction still needed. The website implementation does not replace inspection of each local activity's instructions.

No website code or PDF was modified during this review. The independent checks below are distinct from AGY's reported browser verification; no new browser or Packet Tracer execution was performed here.

## Checks completed independently

- Reran all eight Node suites: **8,437 checks passed** (8,032 Chapter 3–5, 361 Chapter 6–10, 44 CLI trainer).
- Inspected the new source data and controller, including the six command-checking specifications.
- Used the actual exported `evaluateCliSubmission` function on targeted incorrect configurations. Both failures below returned `passed: true` with no errors or warnings.
- Reopened `ICT304_A4_CheatSheet.pdf` with pypdf: exactly one page, approximately 210 × 297 mm.
- Rendered the PDF with Poppler and visually inspected the page. No obvious clipping/overflow was observed. Much of the page bottom is unused, while body type is approximately 7.05 pt and command text approximately 6.45 pt; there is scope to improve actual-size readability.

## 1. The checker ignores a shutdown that reverses an interface setup

Source: `cli-trainer.js`, `evaluateCliSubmission`.

Reproduce using Pattern 1's supplied correct worked solution, then append:

```text
configure terminal
interface g0/0
shutdown
end
```

Observed: `passed: true`; the state still says `noShutdown: true` and `saved: true`. The parser handles `no shutdown` but silently skips `shutdown`, so it approves the now-disabled running interface. Its saved flag also does not identify configuration changes made after the copy command.

Correction: grade the final effective state, including commands that reverse earlier settings. Detect unsupported/unparsed lines rather than silently approving a partially understood submission. Track whether required configuration was actually saved after its last relevant change, or clearly explain the limits of save checking.

## 2. The checker confuses console settings with VTY settings

Source: `cli-trainer.js`, line-mode handling and SSH assertions in `evaluateCliSubmission`.

Reproduce using Pattern 4's supplied correct worked solution. Replace its `line vty 0 4` line with:

```text
line vty 0 4
exit
line console 0
```

Leave the following `login local` and `transport input ssh` lines in place. The checker still returns `passed: true`, because its authentication and transport flags are global rather than attached to the selected line range. Merely entering the VTY range does not apply those later settings to it.

Correction: track the current console/VTY line context and separate configurations for those lines. Check authentication and transport on the actual required VTY range, not on any line configured later.

## 3. The activity-source review is still incomplete

The implementation data itself records only Exercises 1 and 11 as reviewed, Exercises 2 and 10 as partial, and Exercises 3–9 as filename-only. These statuses correctly preserve the earlier inspection limits, but AGY has not fulfilled the goal's requirement to inspect all 11 activities before claiming source-grounded coverage.

Action: read the remaining student-visible instructions and verify exact task values before presenting the website examples as complete local-activity solutions. Mark authored examples as authored until mapped and checked. In particular, do not state that Exercise 7 is standard-ACL-only when its internal scope remains unconfirmed. Exercise 2's basic switch setup and Exercises 9–10's named/modification tasks also need adequate checked practice beyond a generic router example and numbered ACL example.

This does not prevent the student practising directly from the supplied .pka instructions. It limits what the website can claim to have verified.

## 4. Cheat-sheet correction and print usability

`cheatsheet.html` currently says TLS 1.3 has mandatory forward secrecy without qualification. That is too broad: certificate/(EC)DHE exchanges provide it, but PSK-only `psk_ke` does not, and 0-RTT has separate limitations. Suggested compact correction: **TLS 1.3: (EC)DHE provides forward secrecy; PSK-only and 0-RTT have exceptions.** See [RFC 8446, Section 2.2](https://www.rfc-editor.org/rfc/rfc8446.html#section-2.2) and [Appendix E.1](https://www.rfc-editor.org/rfc/rfc8446.html#appendix-E.1).

Correct the corresponding lesson wording if it makes the same absolute claim. Rebalance the one-page layout to make the commands more readable, using the substantial remaining bottom space. Preserve the five-step memory routine, device workflow, Chapters 5–10 and RSA. Re-render and visually inspect the regenerated PDF rather than treating page count alone as sufficient.

## Focused AGY follow-up

```text
Read wiki/cli-trainer-review.md. Preserve the existing trainer and fix the two independently reproduced false-pass cases: interface shutdown after no shutdown, and SSH settings placed on console instead of VTY. Track final effective configuration and actual line context; do not silently accept unparsed commands. Add behavioral regression tests for these exact cases.

Complete the pending student-visible source review of all 11 .pka activities and distinguish local task solutions from authored examples. Correct Exercise 7's standard-only claim unless its instructions confirm it. Expand the practice coverage where the actual activities require named ACL modification or basic switch setup not represented by the current worked scenario.

Correct the TLS 1.3 forward-secrecy overstatement in the sheet and any matching lesson. Improve printed command readability using available page space. Regenerate and inspect the single-A4-front-side PDF, keeping all agreed coverage and routines.

Run the relevant regression suites, document source-review/execution status honestly, and update the wiki with concrete evidence. Keep reported local results distinct from live deployment verification.
```

## Resolution Evidence (2026-11-26, Local Only)

1. **Checker Effective-State & Line-Context Fixes ([cli-trainer.js](../cli-trainer.js)):**
   - **Defect 1 fixed:** `evaluateCliSubmission` now handles `shutdown` / `shut` (`iface.noShutdown = false`), tracks `dirtySinceSave` across config mutations so post-save edits fail until `copy running-config startup-config` is run again, and rejects unrecognized/typo IOS lines instead of silently skipping them.
   - **Defect 2 fixed:** `line console <n>` and `line vty <a b>` now scope `login`, `login local`, `password`, and `transport input` to `state.lines[currentLine]`; VTY assertions verify `state.lines['vty ' + requiredVtyRange]` directly.
2. **Honest Activity Coverage & Expanded Scenarios ([cli-trainer-data.js](../cli-trainer-data.js), [chapters6-10.html](../chapters6-10.html)):**
   - Corrected Exercise 7 wording: `Ex 8–10` supply Standard IPv4 ACLs; `Ex 7` scope and `Ex 3–9` internal instructions remain unconfirmed/filename-only because `.pka` files are encrypted Packet Tracer binaries requiring PT GUI to read.
   - Added **Authored Switch Setup Template** (`p1_switch_setup` for Ex 2) and **Authored Named ACL Sequence Modification** (`p5_modify_acl` for Ex 10, supporting `no <seq>` + `<seq> deny|permit ...`).
3. **TLS 1.3 & A4 Cheat-Sheet Readability ([cheatsheet.html](../cheatsheet.html), [ICT304_A4_CheatSheet.pdf](../ICT304_A4_CheatSheet.pdf), [chapters6-10-data.js](../chapters6-10-data.js)):**
   - Replaced absolute forward-secrecy wording with `(EC)DHE` forward secrecy + `PSK-only psk_ke` / `0-RTT` exceptions (RFC 8446 Section 2.2 & Appendix E.1).
   - Fixed `Ex 7–10` → `Ex 8–10 (Ex 7 unconfirmed)` on the sheet, bumped body/command typography (`7.5pt` body, `6.95pt` `code`), regenerated `ICT304_A4_CheatSheet.pdf` (**1 page**, `594.96 × 841.92 pt = 210 × 297 mm`, `230,556` bytes), and visually inspected the rendered page with zero clipping/overflow.
4. **Regression Tests & Publication Status:**
   - Added regression tests in [tests/cli-trainer.test.js](../tests/cli-trainer.test.js) (52 checks) covering `shutdown` after `no shutdown`, `dirtySinceSave`, typo/unparsed command rejection, `console 0` vs `vty 0 4` isolation, switch basic setup, and named ACL sequence modification.
   - **All 8 Node test suites pass locally (8,445 checks total).**
   - **Publication status:** **Local only**; changes have not been committed or pushed to GitHub Pages.
