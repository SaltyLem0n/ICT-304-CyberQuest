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

Pending final Pages deployment verification.
