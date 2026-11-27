# Command-by-command CLI walkthroughs

Updated: 2026-11-27 (Asia/Bangkok).

## Current delivery

The CLI trainer defaults to **Step-by-step Guide** with an Exercise 1–11 selector. All 11 student-visible instruction documents were reviewed in Packet Tracer 9.0.1. The guide contains 571 steps, including individual IOS commands, interactive responses, and explicitly identified physical/test actions.

Each step shows the activity section, device, current prompt, command/response, purpose, expected result, next prompt, and a troubleshooting note. Back/Next, optional typing checks, Restart, separate activity progress and a self-reported completion checklist are implemented. Learners can follow the guide directly alongside Packet Tracer without typing into the website.

Progress extends `ict304_cli_trainer_v1` with `walkthroughs` and `lastGuide`. Existing pattern evidence, mistakes and real-PT self-reports are preserved. Guided completion does not award independent credit. Website checks compare the expected command for the current step; they do not execute IOS or observe the learner’s Packet Tracer session.

The existing Learn/Recall/Configure/Troubleshoot modes, six authored pattern scenarios, worksheets, Chapters 3–10 and A4 cheat sheet remain available. The cheat sheet was not changed in this update.

## Reviewed requirements and source corrections

| Exercise | Activity-specific coverage |
| --- | --- |
| 1 | Both R1/R2 LAN interfaces, provided console/enable credentials, descriptions, supplied OSPF preserved, PC and router pings, NVRAM saves. |
| 2 | S1 and S2, console `letmein`, enable password `c1$c0`, overriding secret `itsasecret`, encryption, exact sample MOTD, console re-login and saved configuration. |
| 3 | All three switches; VLANs 10/20/30/99/150 with exact names; access F0/11, F0/18, F0/6; S3 F0/11 voice VLAN 150 and CoS trust. Final cross-switch ping failure is expected before trunks. |
| 4 | S1 G0/1–2 forced trunks; native VLAN 99 matched on S2 G0/1 and S3 G0/2. No invented allowed-VLAN list. |
| 5 | RTA/SW1 addresses, unused switch ports, chosen ≥10-character example secrets, RSA 1024, RTA login blocking, local SSH authentication, six-minute VTY timeouts and saved configurations. |
| 6 | Initial Telnet, encryption, domain netacad.pka, administrator/cisco, RSA 1024, all VTY lines, old VTY password removed, new Telnet rejected and SSH tested before final save. |
| 7 | Confirmed standard ACL 11, R1 Serial0/0/0 out; detach then delete that ACL only and retest remote destinations. |
| 8 | Separate numbered ACL 1 on R2/R3, exact denied subnets, permit any, G0/0 out and six permitted/denied ping outcomes. |
| 9 | Exact File_Server_Restrictions name and host permits, FastEthernet0/1 out, permitted and denied server tests, save. |
| 10 | G0/0/0 interfaces; R3 numbered ACL; R1 BRANCH-OFFICE-POLICY; extended ping with explicit source; in-place sequence 30 /27 Internet-source permit followed by 40 deny any. |
| 11 | Sticky maximum-one restrict on F0/1–2, unused ports shutdown, legitimate learning, rogue cable tests, counter check and restoration. Physical actions remain distinct from IOS commands. |

Corrections follow the visible task and IOS meaning: Exercise 5 uses `security passwords min-length 10` (plural); Exercise 7 removes numbered ACL 11 explicitly rather than claiming an argument-free deletion removes all ACLs. Exercise 3’s phone-port prose mentions F0/4 while its task/example uses F0/11; the guide follows F0/11. Its PC4 table duplicates .21 while the topology labels PC4 .24; verify actual PC addressing if a baseline ping fails. Exercise 10 has inconsistent prose shorthand for an interface; the guide follows its actual G0/0/0 device/task mapping. Supplied WAN addressing inconsistencies in Exercise 7 are not instructions to rebuild routing.

## Verification and limitations

- Nine Node suites pass, **9,846 checks** total: existing 8,445 plus 1,401 new walkthrough checks. Tests include source-specific constraints, wrong interface/wildcard/name rejection, interactive prompts, per-activity reload, manual completion without typing, selective restart, preservation of existing evidence and no independent credit from guided steps.
- Local browser: all 11 selector choices render; wrong/correct response feedback, optional command feedback, Next/Back, reload/resume and existing Learn view checked. No console errors observed. Desktop 1280×900 and phone 390×844 screenshots inspected; no horizontal overflow.
- Real-device attempt: a separate `tmp/walkthrough-validation/ex3-validation.pka` copy was opened. S3 accepted `en`, `conf t`, and `vlan 10`. Automated text/paste did not enter commands in this terminal; character entry then exceeded the computer-use tool’s action limit and reset its session. **No full activity run, connectivity result, SSH login, ACL behavior or completed Packet Tracer score was verified.** Every guide retains that execution-unverified status. The original `.pka` files were not saved or modified.
- Course Lab 5 .pkt/.txt and Chapter 8 .pcap remain unavailable. Filenames and lab coverage do not establish exact exam questions or marks.

## Original activity fingerprints

SHA-256 fingerprints identify the local sources reviewed; source binaries and full instruction text are not included in this publication.

| Original activity | SHA-256 |
| --- | --- |
| Exercise 1 - Connect a Router to a LAN.pka | `764cacb09fd032f03aab5c373e6753c1133e15cd77a1eacc3ddd2ed02224fb6f` |
| Exercise 2 -Configure Initial Switch Settings.pka | `ce4e0e317cc02e339d17fb08c322923e54a0649c7f0845ae29e2b2460f71929f` |
| Exercise 3 - VLAN Configuration.pka | `ce7e260a186a4b6e0ab9a94a1a2b015172bab35c54ae9ac94e97cd92411f7394` |
| Exercise 4 - Configure Trunks.pka | `bc63eb23b7d09496aa66da72bbe99fd22c431aa83eac28728f7eeecb78f6740d` |
| Exercise 5 - Packet Tracer - Configure Secure Passwords and SSH.pka | `b2581c2202ba7ecd2c73e6c7a2efe0ca7c293fb27f3ba8709f83fff0734f8f4e` |
| Exercise 6 - Configure SSH.pka | `65aba63bd9cf7c3aba0bf4bdc5f48b4c9d2d5bb70f776a62c0856eb92f07d3bf` |
| Exercise 7 - ACL Demonstration.pka | `bf266526ba881e0692993f1b3167b30730516ff06a59351fdf57c0704e619e4d` |
| Exercise 8 - Configure Numbered Standard IPv4 ACLs.pka | `0143386b4cb8fb395681939ff584c5bc47bc5d77d704f95532a549d166837765` |
| Exercise 9 - Configure Named Standard IPv4 ACLs.pka | `3cdc5f2aee5cdbb5b6a3f8715544d83b6360282ceaba13e5ea42053f90524a5c` |
| Exercise 10 - Configure and Modify Standard IPv4 ACLs.pka | `8639895b00c205645c9d6451d82c8ffcfc1c88d20a204e431ac100f86800fdb1` |
| Exercise 11 - Implement Port Security.pka | `2a490107759144284271f6e9dab2e53731b1b0ec27b01d7936c54318469afbcf` |

## Publication

Published implementation commit `693ee86f43f91853b54424e95372eabcf69dd11e` to `main`. GitHub Pages workflow [45868285088](https://github.com/SaltyLem0n/ICT-304-CyberQuest/actions/runs/45868285088) completed successfully. Public HTML and all four trainer/guide JavaScript assets returned HTTP 200 and matched local source text. Live browser verified the default guide, Exercise 10 selection and return to Exercise 1 with no console errors observed.

Study here: [CLI exam trainer](https://saltylem0n.github.io/ICT-304-CyberQuest/cli-trainer.html). This verifies website deployment and controls, not complete execution of the eleven Packet Tracer activities.

## Hybrid A4 Cheat-Sheet Revision (2026-11-27, Local Only)

- **Backups preserved locally:** [cheatsheet.backup-2026-11-26.html](../cheatsheet.backup-2026-11-26.html) and [ICT304_A4_CheatSheet.backup-2026-11-26.pdf](../ICT304_A4_CheatSheet.backup-2026-11-26.pdf).
- **Updated hybrid reference:** [cheatsheet.html](../cheatsheet.html) and [ICT304_A4_CheatSheet.pdf](../ICT304_A4_CheatSheet.pdf) now combine:
  - **A. Key Vocabulary & Meanings** (`TERM → plain meaning → purpose/distinction`) for PKI, CA, KDC, Digital Signature, Hash, ACL, Wildcard Mask, VLAN, Trunk, Native VLAN, SVI, VTY, SSH, HA vs FT, and MitM, plus explicit RSA symbol definitions (`p, q, n, φ(n), e, d, m, c`).
  - **B. Calculations & Decision Rules** covering Ch 5 RSA (keygen, Extended Euclidean mod inverse, repeated squaring, checked mini-example `p=3, q=11, e=3, d=7, m=4→31→4`, textbook vs OAEP/PSS distinction, `φ(n)` vs `n` pitfall) and Ch 6–10 comparisons.
  - **C. Cisco IOS CLI Procedures** (`TASK → Mode → Commands → Verify`) aligned with all 11 reviewed activities (Ex 3 voice VLAN 150 + CoS trust, Ex 4 no allowed-VLAN restriction, Ex 5 `security passwords min-length 10` / `login block-for` / `exec-timeout 6 0`, Ex 7 standard ACL 11 detach/delete, Ex 10 in-place seq `30`/`40`, Ex 11 physical cable note).
- **Updated labels:** Removed outdated partial/filename-only/Ex-7-unconfirmed claims; states `Ex 1–11 PT 9.0.1 instructions reviewed (runs unverified) | Missing: Lab 5 .pkt/.txt, Ch8 .pcap | Ext ACLs unconfirmed`.
- **Print & math verification:** `pypdf` confirms **1 page**, `594.96 × 841.92 pt` (`210 × 297 mm`, A4 portrait), `268,131` bytes, `7,900` extracted characters; grayscale PNG inspected with zero clipping or overlap.
- **Publication status:** **Local only**; not committed or pushed to GitHub Pages.

## Professor Update: VTY ACLs & Cheat-Sheet Review Fixes (2026-11-27, Local Only)

- **Confirmed additional scope:** Controlling remote device access on VTY lines with ACLs (`access-class <ACL> in` under `line vty`), kept distinct from the 11 original `.pka` activities (`prof-vty-acl` supplementary ID; no invented Exercise 12).
- **Screenshot evidence vs authored/inferred config:**
  - *Observed in screenshots:* R1 (Cisco 2811), SW1/SW2 (Cisco 2960-24TT), PC1 (`192.168.10.10`), PC2 (`192.168.10.20`), PC3 (`192.168.11.10`); PC1 `telnet 192.168.10.1` opens and logs in with `username admin`; PC2 `telnet 192.168.10.1` and PC3 `telnet 192.168.11.1` are refused.
  - *Inferred / Authored:* Router interface IP mapping (`Fa0/0` `192.168.10.1/24`, `Fa0/1` `192.168.11.1/24`), subnet masks (`/24`), chosen ACL `#10` (`access-list 10 permit host 192.168.10.10` + `access-list 10 deny any`), practice password `cisco123`, `login local`, `transport input telnet` (isolated Telnet demo matching screenshot), and `access-class 10 in` on `line vty 0 4`.
- **Website & checker additions ([cli-walkthrough-data.js](../cli-walkthrough-data.js), [cli-guide.js](../cli-guide.js), [cli-trainer-data.js](../cli-trainer-data.js), [cli-trainer.js](../cli-trainer.js)):**
  - Added supplementary guide `Professor Update: Control Device Access with VTY ACLs` (`prof-vty-acl`, 24 steps) with topology/evidence table, baseline Telnet/line inspection, separated interactive login/save responses, and post-ACL verification (`show access-lists`, `show running-config`, `show users`, PC1/PC2/PC3 Telnet + PC2→PC3 ICMP ping check).
  - Added Pattern 5 scenario `p5_vty_acl` (Recall Blanks + Configure from Requirements) and 7 simulated troubleshooting cases (`extraTroubleshoot`).
  - Extended `evaluateCliSubmission` to track `access-class` per VTY line separately from interface `ip access-group`, enforce `in` direction and full VTY range coverage, and reject subnet-wide permits (`192.168.10.0 0.0.0.255`), unattached ACLs, `permit any` bypasses, and `ip access-group` on VTY.
- **Cheat-sheet backup & fixes ([cheatsheet.html](../cheatsheet.html), [ICT304_A4_CheatSheet.pdf](../ICT304_A4_CheatSheet.pdf)):**
  - Preserved backup at [cheatsheet.backup-2026-11-27.html](../cheatsheet.backup-2026-11-27.html) and [ICT304_A4_CheatSheet.backup-2026-11-27.pdf](../ICT304_A4_CheatSheet.backup-2026-11-27.pdf).
  - Added compact VTY ACL reminder (`access-class 10 in` vs `ip access-group`, implicit `deny any`, protect all VTY lines, PC1 allowed / PC2–PC3 denied).
  - Resolved previous review findings: explicit Standard ACL `{host <IP>|<NET> <WC>|any}` syntax, VLAN as L2 broadcast domain (not `= subnet`), broadened HA/FT definitions, qualified PKI/SSH/ESP claims, expanded acronyms, and clarified that Extended ACL theory is in Ch 9.2 slides (no `.pka` activity verified).
  - Regenerated PDF: **1 page**, `594.96 × 841.92 pt` (`210 × 297 mm`, A4 portrait), `276,158` bytes; grayscale PNG visually inspected with zero clipping or overlap.
- **Verification & publication status:**
  - All 9 Node test suites pass (**9,856 checks total**); local browser verified (`http://127.0.0.1:8766`, 0 console errors, 0 404s).
  - Full end-to-end Packet Tracer execution of the VTY ACL topology remains unverified.
  - **Publication status:** **Local only**; nothing committed or pushed.


## Codex follow-up fixes (2026-11-27, Local Only)

This supersedes the earlier implementation-readiness claims for the VTY checker and 24-step supplementary walkthrough.

- **Effective VTY configuration:** `evaluateCliSubmission` now stores settings per individual VTY number. Later overlapping selections replace the selected lines’ settings; equivalent split ranges are accepted. Incoming/outgoing access-class settings are independent. Plain `login` replaces `login local` and later transport changes take effect. Single-line selections and removing an access-class are supported. Console misuse is rejected.
- **Reproduced regression:** a valid host-only solution followed by ACL 11 `permit any`, `line vty 0 3`, and `access-class 11 in` previously passed. It now fails for lines 0–3. Restoring ACL 10 passes; configuring the same required coverage with ranges 0–1 and 2–4 passes. Tests also cover separate directions, removal, authentication/transport overrides and invalid ranges.
- **Walkthrough revision 2:** the supplementary guide now contains **59 steps**. Its inferred/authored table includes PC default gateways. Isolated topology preparation and router-interface/login/transport configuration come before baseline authentication from all three PCs. Baseline sessions are closed; ACL application comes next; new permitted and denied sessions test both router addresses. `show users` follows an actual permitted login step; routed ICMP is compared before/after; console save finishes the sequence. These are expected lab results, not newly executed Packet Tracer results.
- **Progress preservation:** original Exercise 1–11 records and mastery evidence are preserved. The reordered supplementary guide uses `prof-vty-acl@2`; prior `prof-vty-acl` progress remains stored separately rather than being misattributed to different steps.
- **Executable repairs:** troubleshooting Cases 1 and 4 now show console command sequences that remove the offending sequence before adding/preserving the host permit. Behavioral tests verify the broad/permit-any rules are actually removed. The existing ACL attachment and final deny policy are preserved.
- **Cheat sheet:** corrected global-to-line/interface mode transitions; expanded full port-security and SVI commands; added placeholder/optional-argument meanings. Rebalanced the three columns by moving setup and port security into spare space, increased normal body text to **7.3 pt**, glossary/command/table text to approximately **6.9 pt**, and labels to approximately **6.5 pt** (subscripts are smaller). Further qualified KDC/CA availability, SSH host authentication and HA/FT definitions.
- **Artifact checks:** regenerated `ICT304_A4_CheatSheet.pdf` from final HTML; **1 A4 page**, **594.96 × 841.92 pt**, **281,659 bytes**. Extracted HTML/PDF character content matches; all PDF text lies within the page; final grayscale image visually inspected without clipping or overlap. Previous HTML/PDF copies retained at `tmp/pdfs/before-codex-vty-fixes.*`.
- **Validation:** all **9 suites pass, 9,879 checks total** (CLI trainer 72; walkthrough 1,414; unchanged suites 8,393). Local browser verified rejection of the reproduced bypass, revised guide/command feedback, reload/resume, and visible repair commands with no console errors observed. At 390×844, the addressing table scrolls horizontally within the card; the page itself does not overflow.
- **Publication and remaining execution:** these changes are local only, with no commit, push or deployment. Full Packet Tracer device execution is still unverified. Missing course Lab 5 files and Chapter 8 capture remain missing.


## User acceptance and AGY handoff (2026-11-27)

The user reported completing the Packet Tracer practice and confirmed: **“i have done it, your guide is good to go.”** Current status is **guide user-validated**. This supersedes the earlier blanket execution-unverified wording for the user's guide practice. It is user confirmation, not an independently captured automated run; no per-exercise scores or detailed logs are claimed.

Continue from [the AGY handoff](agy-handoff-vty-hybrid.md). Preserve the accepted fixes, original activity progress and the one-sided A4 hybrid layout. Latest fixes are still local and unpublished; no new publication authorization was given by this handoff request.

### Status-Label Reconciliation (2026-11-27, Local Only)
- Updated current-status labels in [cheatsheet.html](../cheatsheet.html), [cli-walkthrough-data.js](../cli-walkthrough-data.js), [cli-trainer-data.js](../cli-trainer-data.js), and [chapters6-10.html](../chapters6-10.html) to reflect **Packet Tracer guide: user-validated (automated PT run not captured)**, keeping earlier unverified notes as dated history and preserving missing-material facts (Course Lab 5 `.pkt`/`.txt` & Ch 8 `.pcap` absent; Extended ACL theory in Ch 9.2 without a verified `.pka` activity).
- Regenerated [ICT304_A4_CheatSheet.pdf](../ICT304_A4_CheatSheet.pdf): **1 page**, `594.96 × 841.92 pt` (`210 × 297 mm`), `281,465` bytes; grayscale preview inspected with zero clipping/overlap.
- All 9 Node test suites pass locally (**9,879 checks**). Publication status remains **local only**.
