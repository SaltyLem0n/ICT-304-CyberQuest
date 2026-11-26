# AGY implementation brief: CLI-only exam practice

Prepared: 2026-11-26 (Asia/Bangkok).

**Implementation update (2026-11-27):** the original brief below is historical. All 11 instruction documents have now been reviewed, and the step-by-step trainer is implemented. See [current delivery, tests and remaining real-device verification](cli-walkthroughs.md).

Revised before handoff: the user confirmed this CLI-practice brief **has not yet been sent to AGY**. This version consolidates the website trainer and the requested cheat-sheet additions. Earlier CyberQuest work is separate; do not infer that this follow-up has already been implemented.

```text
Goal: Extend the existing ICT 304 CyberQuest website with a CLI-only Packet Tracer memory guide and practical recall trainer based on the professor's 11 likely exam activities, then update the existing one-sided A4 cheat sheet with the same memory routine and the useful configuration/verification command patterns.

Workspace: D:\SCHOOL DOCs\ICT 304
Authoritative practice folder: lab\Labs for exams no GUI
Read first: wiki/cli-exam-memory-guide.md, wiki/exam-preparation.md, wiki/teaching-agent-skills.md, and the current source/tests. Preserve the existing website and RSA teaching fixes. The user plans to practise the real activities themselves; the trainer must prepare them to reconstruct configurations from requirements.

Constraint: configuration must use CLI, not Config-tab controls or graphical configuration tutorials. Opening an activity or accessing a terminal is separate from configuring it. Do not assume every physical/topology action in an original activity is permitted by the professor. Flag PC-addressing steps, cable swaps and other non-CLI actions for an explicit accommodation rather than inventing an IOS equivalent.

FIRST — Ground the activity coverage

Inventory all 11 .pka files in the named folder, using their exact filenames and exercise numbers:
1 router-to-LAN; 2 initial switch settings; 3 VLANs; 4 trunks;
5 secure passwords/SSH; 6 SSH; 7 ACL demonstration;
8 numbered standard ACLs; 9 named standard ACLs;
10 configure/modify standard ACLs; 11 port security.

Read each activity's student-visible instructions in Packet Tracer. Record objectives, provided configuration, device models, port mappings, addressing, exact task values, required commands, verification tests, and GUI-dependent physical actions. Preserve original activity files; use separate practice copies for any execution.

The current guide fully read the displayed instruction text for Exercises 1 and 11, partially read 2 and 10, and inventoried the rest by filename. Do not claim all 11 were internally reviewed based on that guide. Treat reference templates as templates until checked in the relevant activity. Record unread or untested parts honestly. Do not extract hidden answer configurations or alter activity grading/locks to obtain the guide.

The new folder supplies standard-ACL practice; distinguish it from the previously missing course Lab 5 and from extended ACL coverage. Review old Pending Lab flags individually rather than blindly removing them. Wireshark capture availability is a separate matter.

SECOND — Design around six reusable patterns

1. Basic setup and interface addressing: modes, identity, passwords/banner as required, router interfaces versus switch management SVI, no shutdown, inspection and saving.
2. VLANs: create/name VLAN, assign access ports, verify membership.
3. Trunks: trunk mode, native VLAN, allowed list when required, verification on both ends.
4. SSH: reachable management IP, hostname/domain, RSA keys, local user, VTY login local and SSH transport, client verification.
5. ACLs: translate policy, source/wildcard, ordered rules, attach to correct interface/direction, modify entries, test permitted and denied traffic.
6. Port security: access mode, enable, max MAC count, learning method, violation behavior, unused ports, traffic/secure MAC/violation verification.

Every pattern needs: plain-language goal; short memory cue; required values table; command blocks with IOS modes; why each block exists; verification command and expected property; common errors; one worked local example; and an independent variant. Use Read → Inspect → Configure → Verify → Save consistently. Avoid teaching only a long script to copy.

Use this five-step learning routine consistently in the website, full guide, worksheets and cheat sheet:
1. Follow once: manually type a worked example and explain each command.
2. Recall: hide commands and reconstruct them from the requirements.
3. Apply: repeat with different, consistent addresses or ports.
4. Troubleshoot: find an intentional mistake using CLI verification commands.
5. Record mistakes: symptom → cause → verification command → fix.

Distinguish this learning routine from the task-execution workflow Read → Inspect → Configure → Verify → Save. The former trains memory; the latter is the checklist used while configuring a device.

THIRD — Implement practical learning modes

Learn: explanation, one requirement at a time, worked example and command/mode annotations.
Recall: fill missing commands and parameters without revealing the next answer.
Configure from requirements: type a small configuration block using the shown topology/task values, with hints and solution available on request. A task-specific command checker is sufficient; a full IOS emulator is not required.
Troubleshoot: interpret explicitly authored simulated show-command output, choose the next diagnostic command, identify the fault, and propose a correction. Label simulated output and separately track any real Packet Tracer execution evidence.

Cover all 11 activities in the index, including those awaiting source review. Do not present an unverified activity as complete. Link the practice index from the dashboard and existing labs hub. Preserve responsive, keyboard-accessible behavior and the current static GitHub Pages architecture.

FOURTH — Grade meaning and maintain honest progress

Check mode, device, interface, parameters, effective configuration and task-required verification. Support documented equivalent syntax and harmless independent ordering; do not accept a command merely because it appears somewhere in the submission. ACL order, packet direction, credentials/case, VLAN names required by grading and interface selection can matter. Never normalize those differences away. Keep valid command-mode transitions explicit.

Use coherent scenario variants: changing a subnet must update host/router addresses, gateway values, wildcard masks, policies and expected results together. Label variants as website-authored. Never claim generated activity files were tested unless they were opened and exercised in Packet Tracer.

Persist per-scenario assistance/exposure and attempts. Hiding hints, retrying a revealed answer, reloading, or resubmitting the same task must not create fresh independent credit. Record identity, first-pass result, hints used, verification completed, mistakes and time if tracked. Distinguish website practice evidence from a user-reported successful real Packet Tracer attempt. Offer a genuinely different scenario for later independent practice.

FIFTH — Update the existing exam cheat sheet

This is a required deliverable in this goal, after the lab source review and teaching implementation. Update cheatsheet.html and regenerate ICT304_A4_CheatSheet.pdf rather than leaving the prior draft unchanged. Preserve coverage of Chapters 5–10 and the Chapter 5 RSA calculations; the CLI section shares the same permitted page with them.

Hard print constraint: exactly ONE A4 page (210 × 297 mm), front side only. The full guide and practice worksheets can be longer; they are separate study resources, not additional exam-reference pages.

Include a compact memory-routine strip, preserving the meaning of all five steps:
Follow/explain → Recall hidden commands → Apply new values → Troubleshoot → Log symptom/cause/check/fix.

Include a compact configuration workflow:
Read → Inspect → Configure → Verify → Save.

Add useful command skeletons for all six patterns, selecting exact syntax and required options from the inspected local activities. Pair each configuration group with its most useful verification command. The following is the required coverage checklist, not text to copy wholesale onto the A4 page:

- Mode navigation and save: enable; configure terminal; exit; end; copy running-config startup-config. Show a small prompt/mode key for privileged EXEC, global config, interface config, line config and named ACL config. Make it clear that prompt labels are not typed commands.
- Basic setup/addressing: hostname, enable secret, console password/login, banner where required; interface <IF>, ip address <IP> <MASK>, no shutdown; show ip interface brief, show running-config and show ip route. Include a brief switch-management SVI/default-gateway reminder if required by the reviewed activities. Include additional password-policy commands only if in scope and supported.
- VLANs: vlan <ID>, name <NAME>, interface <PORT>, switchport mode access, switchport access vlan <ID>; show vlan brief.
- Trunks: interface <UPLINK>, switchport mode trunk, switchport trunk native vlan <ID>; allowed-vlan syntax when required; show interfaces trunk. Distinguish replacing an allowed list from adding to it.
- SSH: hostname/domain prerequisites, username <USER> secret <PW>, crypto key generate rsa with the activity's supported key-size prompt/syntax, ip ssh version 2, line vty <RANGE>, login local, transport input ssh; show ip ssh and the supported client SSH test syntax.
- ACLs: numbered access-list <N> permit/deny <SOURCE> <WILDCARD>; named ip access-list standard <NAME> and sequence-numbered entries; interface attachment using ip access-group <ACL> in/out; show access-lists and show ip interface <IF>. Include source-only matching for standard ACLs, first match, implicit deny, a /24 wildcard example, and direction relative to the device interface. Include named-entry modification syntax if verified in Exercise 10. Never add permit any unless the intended policy requires it.
- Port security: access mode, switchport port-security, maximum <N>, mac-address sticky or required static MAC, violation <MODE>; show port-security, show port-security address, show port-security interface <IF>. Include protect/drop, restrict/drop+report, shutdown/disable as a compact meaning key. Include unused-port shutdown or recovery only with the task conditions made clear.

Use labelled placeholders for values that change. Prefer reusable templates and tiny memory cues to 11 complete scripts. Distinguish subnet masks from ACL wildcard masks, a router interface from an SVI, and login from login local. Use valid command line breaks and visible mode labels; do not print a misleading pasteable script assembled from unrelated tasks. Any semicolon used solely to save print space must be explicitly a visual separator, not literal IOS input.

Prioritize readability and exam utility. Reduce repetition, verbose explanations and decorative elements before shrinking type. Keep the RSA procedure and a checked compact example readable. Track coverage so no chapter or lab pattern silently disappears while fitting the page. If the scope cannot fit legibly, document the specific tradeoff instead of producing clipped text or an extra page.

Render the regenerated PDF and inspect it at actual print size. Check one-page count, A4 dimensions, margins, wrapping, grayscale readability and no clipping/overlap. Update draft/gap labels based on the inspected sources; do not leave an obsolete blanket statement that all ACL practice is missing now that the new folder supplies standard-ACL activities. Keep genuinely unresolved gaps visible.

SIXTH — Verify and hand off

Add meaningful tests for correct and incorrect submissions, wrong IOS mode, wrong interface, missing no shutdown where required, missing VTY authentication, unattached/wrong-direction ACLs, wildcard mistakes, ineffective rule order, VLAN/trunk errors and port-security behavior. Add tests for coherent variants and reload/assistance/duplicate-credit protection. Run existing relevant suites and verify representative desktop/mobile flows.

Have at least one reviewed example per pattern. Document every activity's source-review and real-execution status. Provide the five-step study routine, printable multi-page practice worksheets, and the updated single-front-side A4 cheat sheet. Check that the website's cheat-sheet links open the revised HTML/PDF.

Deliver: activity coverage/source report; website trainer and its validation; full memory guide/worksheets; revised cheatsheet.html and ICT304_A4_CheatSheet.pdf with print-verification evidence; wiki updates and unresolved gaps. Clearly distinguish local changes from publication.

Update the wiki with coverage, sources, tests, limitations, concrete before/after examples and actual publication status. First make the implementation locally reviewable; do not assume this brief by itself requests public deployment.
```
