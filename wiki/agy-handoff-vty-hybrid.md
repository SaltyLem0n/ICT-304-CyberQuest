# AGY handoff: accepted VTY guide and hybrid cheat sheet

Updated: 2026-11-27 (Asia/Bangkok).

## User acceptance

The user has now reported completing the Packet Tracer practice and confirmed: **“i have done it, your guide is good to go.”** Accept this as user validation of the guide. The earlier blanket statement that Packet Tracer practice remains unverified is superseded by this confirmation.

Evidence labels still matter: this is user-confirmed practice, not a newly captured automated Packet Tracer run. No per-exercise scores, independence claims, packet captures or detailed execution logs were supplied. Do not invent those, and do not ask the user to repeat completed practice merely because automated device execution was not recorded.

## Current workspace

`D:\SCHOOL DOCs\ICT 304`

Read this handoff, `wiki/cli-walkthroughs.md` (especially the latest Codex follow-up), and the current files before continuing. Preserve the accepted work and unrelated dirty files. The last committed site version is `581b224`; the VTY/hybrid work below is local and uncommitted.

## Completed fixes to preserve

- The semantic checker stores effective settings per individual VTY number, rather than independent range labels. Later overlapping selections update the affected lines. Equivalent split ranges are accepted.
- Incoming and outgoing access-class settings are separate. Single-line selection, ACL removal, authentication overrides and transport overrides are covered by behavioral tests.
- The previously accepted bypass—valid ACL 10 on VTY 0–4, then permit-all ACL 11 on VTY 0–3—is now rejected. Restoring the correct incoming ACL passes.
- Supplementary guide `prof-vty-acl`, revision 2, has 59 steps: isolated topology preparation, authored router interface/login/transport setup, baseline authentication from all three PCs, ACL application, new session tests to both router addresses, routed ICMP comparison, and console save. PC default gateways are included.
- Original Exercises 1–11 retain their identities. Supplementary progress uses `prof-vty-acl@2`, keeping older `prof-vty-acl` records separately. Preserve original activity progress and mastery evidence.
- Troubleshooting Cases 1 and 4 show executable console repair sequences, including removing the offending ACL entry before adding/preserving the host permit.
- The hybrid sheet includes vocabulary meanings, RSA calculations, Chapters 5–10 reminders, reusable CLI patterns and the professor's VTY ACL update. Command modes and port-security/SVI syntax were clarified; shorthand placeholders are explained.
- The sheet was rebalanced across three columns. Normal body text is 7.3 pt; glossary/command/table text is about 6.9 pt; labels about 6.5 pt. Subscripts are smaller. It remains exactly one A4 front side.

## Verified results

- All nine Node suites passed: **9,879 checks** (CLI trainer 72; walkthrough 1,414; other suites 8,393).
- Local browser verified rejection of the reproduced VTY bypass, revised guide feedback, reload/resume, visible repair commands and the mobile table layout. No console errors were observed during those checks.
- Current `ICT304_A4_CheatSheet.pdf`: **1 page**, **594.96 × 841.92 pt**, **281,659 bytes**. HTML/PDF extracted character content matched. Grayscale render inspected without clipping or overlap.
- Latest print preview: `tmp/pdfs/ICT304_A4_CheatSheet-final-gray.png`.
- Before-fix copies: `tmp/pdfs/before-codex-vty-fixes.html` and `.pdf`. Preserve the user's existing dated backups too.

## Key files

- `cli-trainer.js`: effective VTY checker and troubleshooting rendering.
- `cli-trainer-data.js`: VTY scenario and executable repair commands.
- `cli-walkthrough-data.js`: original guides and supplementary revision 2.
- `cli-guide.js`: revision-aware guided progress and topology table.
- `cli-trainer.html`: scrollable mobile addressing table styles.
- `tests/cli-trainer.test.js`, `tests/cli-guide.test.js`: regression checks.
- `cheatsheet.html`, `ICT304_A4_CheatSheet.pdf`: editable and printable hybrid sheet.
- `wiki/cli-walkthroughs.md`: history and latest validation evidence.

## Continue from here

1. Reconcile current-status wording with the user's acceptance: use **“Packet Tracer guide: user-validated”** or equivalent. Keep earlier unverified statements as dated history where appropriate, with a clear current update. Preserve the distinction between user confirmation and automated execution.
2. If updating status text in the website or cheat sheet, regenerate the PDF from final HTML and recheck one A4 page, text consistency and grayscale rendering. Preserve the accepted teaching content and layout.
3. Keep missing-material facts accurate: Course Lab 5 .pkt/.txt and Chapter 8 .pcap remain absent; Extended ACL theory exists in Chapter 9.2, but no Extended ACL activity execution was established by the supplied evidence.
4. Do not reopen the completed implementation or introduce unrelated features. Run relevant checks if changes justify them; do not repeat tests or practice mechanically.
5. Report final handoff/readiness and publication status clearly.

**Publication boundary:** The latest local fixes have not been committed, pushed or deployed. This handoff does not add publication authorization. Keep them local unless the user explicitly requests publication. If later authorized, stage only intended site/test/wiki files, exclude raw course PDFs, activity binaries, backups and temporary profiles/previews, wait for Pages to finish, and verify the public assets and controls.
