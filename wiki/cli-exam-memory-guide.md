# CLI-only Packet Tracer exam memory guide

Prepared: 2026-11-26 (Asia/Bangkok).

## Scope and evidence

The professor requires CLI configuration. The user identified `lab/Labs for exams no GUI/` as the likely exam-practice set. It contains 11 `.pka` activities. Filenames establish topic coverage, not the exact exam questions or their weightings.

After the user signed in, Packet Tracer 9.0.1 was used to read the complete displayed instruction text for Exercises 1 and 11, and portions of Exercises 2 and 10. The remaining activities have been inventoried by filename, not fully inspected internally. UI automation then became unstable; no device configurations were entered, completed activities submitted, or original activity files saved. The templates below are study patterns, not a claim of completed validation in each local activity.

## Learn six patterns

| Pattern | Supplied activities | Memory cue | What to prove |
| --- | --- | --- | --- |
| Basic device setup and interface addressing | 1: Connect a Router to a LAN; 2: Configure Initial Switch Settings | Inspect → identify → configure → bring up → save | Correct device identity, addressing and interface state; configuration saved |
| VLAN access ports | 3: VLAN Configuration | Create VLAN → name it → assign access port | VLAN exists and the correct port belongs to it |
| Trunks | 4: Configure Trunks | Carry VLANs → match native VLAN → verify | Link is actually trunking and carries the required VLANs |
| SSH and password security | 5: Configure Secure Passwords and SSH; 6: Configure SSH | Reachability → identity → keys → user → VTY → test | SSH works with the required authentication and Telnet is excluded when required |
| ACL policy and modification | 7: ACL Demonstration; 8: Numbered Standard IPv4 ACLs; 9: Named Standard IPv4 ACLs; 10: Configure and Modify Standard IPv4 ACLs | Who → rules → order → interface/direction → test | Intended sources permitted and denied along the actual packet path |
| Port security | 11: Implement Port Security | Access → enable → maximum → learning → violation → verify | Correct secure MAC policy and observed violation behavior |

Use the instructor's device names, interfaces, masks, VLAN names, credentials and policy values. Learn the command skeleton; read the variable values from each new task.

## The same workflow for every attempt

1. **Read:** write a small task table: device, interface, network/mask, VLAN, permitted traffic, security requirement.
2. **Inspect:** establish what is already configured. Do not rebuild provided routing or erase working configuration.
3. **Configure:** make one logical change at a time, in the correct IOS mode.
4. **Verify:** choose a command and state what result would prove the requirement. For filters, test an allowed case and a denied case.
5. **Save:** save the running configuration after checking it. Keep an untouched original activity and practise on a separate copy.

Before each command, answer: **Which device? Which mode? Which interface? Why this command? How will I check it?**

## Mode navigation to recall first

```text
Switch> enable
Switch# configure terminal
Switch(config)# interface <PORT>
Switch(config-if)# exit
Switch(config)# line console 0
Switch(config-line)# end
Switch# copy running-config startup-config
```

`exit` leaves one mode. `end` returns to privileged EXEC. Prompt text such as `Switch(config)#` identifies the mode; do not type it as part of the command. At the copy destination prompt, accept the default startup-config filename when that is the intended destination.

Practise full command names before relying on abbreviations. In Packet Tracer, use `?` to check supported syntax if the exam permits help. Do not substitute a Windows terminal for a simulated router or switch CLI.

## Pattern 1: device setup and router interfaces

For a basic switch setup, recall these separate jobs rather than one unbroken script:

```text
enable
configure terminal
hostname <SWITCH_NAME>
enable secret <ENABLE_SECRET>
line console 0
password <CONSOLE_PASSWORD>
login
exit
banner motd #<REQUIRED_MESSAGE>#
end
show running-config
copy running-config startup-config
```

Apply extra password settings only when required and supported. The documented IOS command for minimum length is `security passwords min-length <LENGTH>` (plural **passwords**). `service password-encryption` obfuscates applicable plaintext configuration passwords; it is not the same protection as SSH encryption. [Cisco minimum-password-length reference](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/security/s1/sec-s1-cr-book/sec-cr-s1.html).

Router interface skeleton:

```text
enable
show ip interface brief
show ip route
configure terminal
interface <ROUTER_LAN_INTERFACE>
description <CONNECTED_NETWORK_OR_DEVICE>
ip address <INTERFACE_IP> <SUBNET_MASK>
no shutdown
end
show ip interface brief
show interfaces <ROUTER_LAN_INTERFACE>
ping <REACHABLE_HOST_IP>
copy running-config startup-config
```

**From local Exercise 1:** configure the GigabitEthernet LAN interfaces on R1/R2, add descriptions, inspect interface/routing information, test connectivity, and save to NVRAM. The first supplied example uses R1 G0/0 `192.168.10.1 255.255.255.0`. Routing is partially provided; inspecting OSPF routes is not an instruction to reconfigure OSPF. The activity notes that switch management is not configured, so inability to ping those switches is not by itself a failed router task.

Memory trap: assigning an IP does not replace `no shutdown`. An administratively down interface and a link/protocol fault need different investigation. On a Layer 2 switch, management addressing uses an SVI such as `interface vlan <ID>`; do not blindly put a routed IP address on an access switchport. Verify the exact management VLAN and gateway required by the activity.

## Pattern 2: VLANs

```text
configure terminal
vlan <VLAN_ID>
name <VLAN_NAME>
exit
interface <PC_FACING_PORT>
switchport mode access
switchport access vlan <VLAN_ID>
end
show vlan brief
show interfaces <PC_FACING_PORT> switchport
```

Memory cue: **create the room, then put the port in the room**. A VLAN can exist while the PC is still on the wrong access VLAN. Separate VLANs also require routing if they are meant to communicate across VLAN boundaries; creating a trunk alone does not provide that routing.

## Pattern 3: trunks

```text
configure terminal
interface <SWITCH_UPLINK>
switchport mode trunk
switchport trunk native vlan <NATIVE_VLAN>
end
show interfaces trunk
```

Set `switchport trunk allowed vlan <LIST>` only when the task calls for a restricted list. Make sure each required VLAN can traverse both ends. A native-VLAN mismatch needs correction; an asymmetric allowed list is not automatically a syntax error. Reissuing an allowed list replaces the list unless an appropriate modifier such as `add` is used. Check device support rather than adding an encapsulation command to every switch. [Cisco trunk activity](https://www.netacad.com/content/srwe/1.0/courses/content/m3/en-US/assets/3.4.5-packet-tracer---configure-trunks.pdf).

## Pattern 4: SSH

First establish management IP reachability. Then configure:

```text
configure terminal
hostname <DEVICE_NAME>
ip domain-name <DOMAIN>
username <USER> secret <PASSWORD>
crypto key generate rsa
```

Respond to the key-size prompt with the size required by the activity and supported by that image. Continue:

```text
ip ssh version 2
line vty <FIRST_LINE> <LAST_LINE>
login local
transport input ssh
end
show ip ssh
```

Use the activity's actual VTY range. Test from a reachable simulated CLI client using its supported SSH syntax, commonly `ssh -l <USER> <MANAGEMENT_IP>`. A configured user is not enough without local VTY authentication. `login` with a line password is a different login arrangement from `login local`. Hostname/domain prerequisites, key generation, VTY authentication and SSH-only transport are described in [Cisco's SSH guide](https://www.cisco.com/c/en/us/support/docs/security-vpn/secure-shell-ssh/4145-ssh.html).

## Pattern 5: standard IPv4 ACLs

Before typing, draw one packet's journey: **source → ingress interface → router → egress interface → destination**. `in` and `out` refer to the router interface, not to whether the user considers the traffic incoming or outgoing overall.

Numbered standard ACL skeleton:

```text
configure terminal
access-list <NUMBER> permit <SOURCE_NETWORK> <WILDCARD_MASK>
interface <CHOSEN_INTERFACE>
ip access-group <NUMBER> <in_OR_out>
end
show access-lists
show ip interface <CHOSEN_INTERFACE>
```

Named standard ACL skeleton:

```text
configure terminal
ip access-list standard <ACL_NAME>
10 deny host <BLOCKED_SOURCE_IP>
20 permit <ALLOWED_SOURCE_NETWORK> <WILDCARD_MASK>
exit
interface <CHOSEN_INTERFACE>
ip access-group <ACL_NAME> <in_OR_out>
end
```

These are example policies, not the solutions to every activity. Standard ACLs match source IPv4 addresses. First matching entry decides; unmatched traffic encounters implicit deny. Do not append `permit any` unless the policy permits all other sources. For a conventional contiguous subnet, invert its subnet-mask bits to obtain the wildcard (e.g. `/24`: `0.0.0.255`). Verify ordered entries and the attachment; defining an ACL alone does not attach it. When modifying a supported named ACL, inspect sequence numbers before removing or inserting an entry. [Cisco ACL configuration guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/configuration/guide/scg2960/swacl.pdf).

For every ACL practice problem, predict and check at least one permitted flow and one denied flow. Router-originated pings can use a different source and path from a PC's traffic; use the specified endpoints. Exercises 8–10 explicitly concern standard ACLs; determine Exercise 7's actual scope from its instructions rather than assuming it is another standard-only exercise.

## Pattern 6: port security — local Exercise 11

The local activity requires F0/1 and F0/2, a maximum of one secure MAC each, sticky learning, and **restrict** behavior. It also asks that the other unused ports be shut down. Its verification includes normal PC communication and a rogue-device scenario.

Recall the block in this order:

```text
enable
configure terminal
interface range f0/1 - 2
switchport mode access
switchport port-security
switchport port-security maximum 1
switchport port-security mac-address sticky
switchport port-security violation restrict
end
show port-security
show port-security address
show port-security interface f0/2
```

The explicit access-mode step establishes a suitable port mode if it is not already provided. For this activity, the listed unused range is `f0/3 - 24, g0/1 - 2`; check the topology before applying it to any other task. Do not shut down a required uplink on a changed topology.

Remember violation intent: **protect = drop; restrict = drop and report; shutdown = disable the secure port**. Sticky learning needs traffic from the intended host; saving afterward preserves learned sticky configuration. Correct the cause before recovering an error-disabled port with shutdown/no shutdown. [Cisco port-security guide](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-2_2_e/configuration/guide/b_1522e_2960_2960c_2960s_2960sf_2960p_cg/m_1522e_sec_port_based_traffic_ctrl_2960_cg.html).

The original Exercise 11 instructions include disconnecting/reconnecting cables. This is a physical/topology test action, not an IOS configuration command. Keep it separate from the CLI-only configuration procedure; use professor-provided topology changes or clearly labelled prepared output to rehearse interpreting the result when GUI manipulation is prohibited.

## How to practise remembering

Use five steps for each pattern:

1. **Follow:** type one worked example manually and explain every command. Check the actual device output.
2. **Recall:** hide selected commands and reconstruct them from the requirement and the IOS prompt.
3. **Apply:** use a fresh practice copy or coherent new scenario, with different addresses/ports/policy values. Work from the requirements alone and verify the result.
4. **Troubleshoot:** find an intentional fault using CLI verification commands, then explain the correction.
5. **Record mistakes:** write symptom → cause → verification command → fix.

A suggested 25-minute session: 3 minutes writing the pattern from memory, 12 minutes practising in Packet Tracer, 5 minutes finding a fault, and 5 minutes reviewing mistakes. Adjust the duration to the task rather than rushing unfinished verification. Revisit a pattern the following day and mix it with another topic later. This is a suggested practice routine, not a measured optimum for this student.

Keep an error log: **symptom → missed command/reason → verification command → corrected explanation**. Mark attempts as followed, helped, or independent. Aim to complete two different unassisted tasks on separate occasions, including verification, before considering a pattern comfortable. Reading or repeating a revealed answer is practice, not new independent evidence.

## Website recommendation

Build a CLI Exam Practice section with six pattern cards and an 11-activity index. Each card should offer Learn → Fill missing commands → Type from requirements → Diagnose output. Keep the real Packet Tracer activity alongside it: the website coaches recall, while Packet Tracer checks the actual network behavior. A command-submission checker is enough initially; do not delay useful practice by attempting a complete IOS emulator.

A full study guide can be several pages. Only the eventual exam reference must fit the single front side of A4, sharing space with Chapters 5–10 and RSA.

## Required cheat-sheet update

The user requested that the five-step memory routine and useful CLI configuration/verification command patterns be included on that one-sided A4 sheet. Include a compact routine strip and six pattern templates with mode cues, variable placeholders, key checks and common traps. Keep Read → Inspect → Configure → Verify → Save as the separate configuration workflow. Preserve Chapters 5–10 and the RSA procedure on the same page. The [revised AGY goal](agy-cli-exam-brief.md) specifies the content checklist and print verification. This is a requested update for AGY; the cheat-sheet HTML/PDF were not edited while revising this goal.
