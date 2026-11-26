(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./cli-walkthrough-data.js'));
  } else {
    root.CLI_TRAINER_DATA = factory(root.CLI_WALKTHROUGHS);
  }
}(typeof self !== 'undefined' ? self : this, function (WALKTHROUGHS) {
  'use strict';

  const SOURCE_META = {
    folder: 'lab/Labs for exams no GUI/',
    reviewedNote: 'All 11 student-visible activity instructions reviewed in Packet Tracer 9.0.1. Exact activity guides and authored practice scenarios are separate; full device execution of the guides is not verified.',
    pendingNote: 'Course Lab 5 (.pkt/.txt) and Ch 8 Wireshark (.pcap) remain missing. Exercise 7 is confirmed standard ACL 11; Exercises 8–10 configure standard IPv4 ACLs.'
  };

  const MEMORY_ROUTINE = [
    { step: 1, title: 'Follow once', desc: 'Manually type one worked example and explain each command and IOS mode.' },
    { step: 2, title: 'Recall', desc: 'Hide the commands and reconstruct them from the requirements and prompt.' },
    { step: 3, title: 'Apply', desc: 'Repeat with coherent new addresses, VLANs, ports, or policies without copying.' },
    { step: 4, title: 'Troubleshoot', desc: 'Find an intentional fault using CLI verification commands and explain the fix.' },
    { step: 5, title: 'Record mistakes', desc: 'Log symptom -> cause -> verification command -> fix.' }
  ];

  const DEVICE_WORKFLOW = [
    { step: 'Read', desc: 'List device, interface, subnet/mask, VLAN, permitted/denied traffic, and security rule.' },
    { step: 'Inspect', desc: 'Run show commands first; never erase working routing or prebuilt configuration.' },
    { step: 'Configure', desc: 'Enter the exact IOS mode and apply one logical block at a time.' },
    { step: 'Verify', desc: 'Run a show/ping/ssh test and check both allowed and denied cases.' },
    { step: 'Save', desc: 'Save to NVRAM (copy running-config startup-config) on an untouched-original practice copy.' }
  ];

  const ACTIVITIES = [
    {
      ex: 1,
      filename: 'Exercise 1 - Connect a Router to a LAN.pka',
      patternId: 'p1_basic_lan',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Switch management SVIs are not configured in this activity; inability to ping switches is expected, not a router failure.'],
      notes: 'Configure R1/R2 GigabitEthernet LAN interfaces (e.g., R1 G0/0 192.168.10.1/24), add descriptions, inspect OSPF/interfaces without reconfiguring OSPF, test connectivity, and save to NVRAM.'
    },
    {
      ex: 2,
      filename: 'Exercise 2 -Configure Initial Switch Settings.pka',
      patternId: 'p1_basic_lan',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Check whether PC IP addressing or console cable connection is required via GUI/topology before CLI terminal access.'],
      notes: 'Initial switch hostname, enable secret, console password/login, MOTD banner, optional SVI/default-gateway if tasked, and save running-config.'
    },
    {
      ex: 3,
      filename: 'Exercise 3 - VLAN Configuration.pka',
      patternId: 'p2_vlans',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Verify exact VLAN IDs, case-sensitive VLAN names, and PC-facing access ports in Packet Tracer before grading.'],
      notes: 'Create and name VLANs, assign access ports, verify with show vlan brief.'
    },
    {
      ex: 4,
      filename: 'Exercise 4 - Configure Trunks.pka',
      patternId: 'p3_trunks',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Verify native VLAN ID and whether an allowed-VLAN list is required on both trunk ends.'],
      notes: 'Configure switchport mode trunk, native VLAN, optional allowed VLAN list, verify with show interfaces trunk.'
    },
    {
      ex: 5,
      filename: 'Exercise 5 - Packet Tracer - Configure Secure Passwords and SSH.pka',
      patternId: 'p4_ssh',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Check whether the image requires specific RSA modulus size (e.g., 1024) and security passwords min-length.'],
      notes: 'Configure hostname, domain-name, strong passwords, local user, RSA keys, SSH v2, VTY login local + transport input ssh.'
    },
    {
      ex: 6,
      filename: 'Exercise 6 - Configure SSH.pka',
      patternId: 'p4_ssh',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Verify management IP/SVI reachability and supported client SSH syntax (ssh -l <user> <ip>).'],
      notes: 'Focused SSH setup and VTY restriction (no Telnet), tested with show ip ssh and client SSH login.'
    },
    {
      ex: 7,
      filename: 'Exercise 7 - ACL Demonstration.pka',
      patternId: 'p5_acls',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Confirmed standard ACL 11 on R1 Serial0/0/0 out. Preserve supplied WAN addressing/routing.'],
      notes: 'ACL observation/demonstration activity; trace packet path and verify permitted vs denied flows.'
    },
    {
      ex: 8,
      filename: 'Exercise 8 - Configure Numbered Standard IPv4 ACLs.pka',
      patternId: 'p5_acls',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Check exact topology interfaces and allowed/blocked subnets inside Packet Tracer.'],
      notes: 'Numbered standard IPv4 ACL (1–99), wildcard mask, interface attachment (in/out), verification with show access-lists.'
    },
    {
      ex: 9,
      filename: 'Exercise 9 - Configure Named Standard IPv4 ACLs.pka',
      patternId: 'p5_acls',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Verify exact case-sensitive ACL name required by Packet Tracer grading.'],
      notes: 'Named standard IPv4 ACL (ip access-list standard <NAME>), ordered rules, interface attachment, verification.'
    },
    {
      ex: 10,
      filename: 'Exercise 10 - Configure and Modify Standard IPv4 ACLs.pka',
      patternId: 'p5_acls',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Inspect existing sequence numbers with show access-lists before removing or inserting entries.'],
      notes: 'Create/apply standard ACL and modify existing entries by sequence number without breaking rule order.'
    },
    {
      ex: 11,
      filename: 'Exercise 11 - Implement Port Security.pka',
      patternId: 'p6_port_security',
      sourceStatus: 'reviewed',
      sourceDetail: 'Student-visible instructions reviewed in Packet Tracer 9.0.1; device execution unverified.',
      nonCliFlags: ['Disconnecting/reconnecting a rogue PC cable is a physical/GUI test action, not an IOS CLI command; flag for professor accommodation if GUI is restricted.'],
      notes: 'F0/1 and F0/2: access mode, port-security, max 1, sticky MAC, violation restrict; shut down unused ports f0/3 - 24, g0/1 - 2; verify with show port-security.'
    }
  ];

  const PATTERNS = [
    {
      id: 'p1_basic_lan',
      number: 1,
      title: 'Basic Device Setup & Router LAN Addressing',
      activities: [1, 2],
      goal: 'Set device identity/access passwords cleanly and bring up router LAN interfaces (or switch management SVI) with verified IPv4 addressing and saved NVRAM config.',
      memoryCue: 'Inspect -> Identity & Passwords -> Interface IP + no shutdown -> Verify -> Save',
      nonCliFlags: [
        'Console cabling or PC IP/gateway entry in Packet Tracer Desktop/Config is a GUI/topology action, not an IOS command.',
        'In Exercise 1, switches have no management SVI configured; failing to ping switches is normal.'
      ],
      requiredValues: [
        { param: 'Device & Mode', meaning: 'Router or Switch + exact IOS mode', example: 'R1: (config)# / (config-if)#' },
        { param: 'Interface', meaning: 'LAN port or Switch SVI', example: 'g0/0 (router) or vlan 1 (switch)' },
        { param: 'IPv4 & Mask', meaning: 'Host/gateway IP + dotted subnet mask', example: '192.168.10.1 255.255.255.0' },
        { param: 'Credentials/Banner', meaning: 'Only as tasked (secret, console, motd)', example: 'enable secret class' }
      ],
      commandBlocks: [
        {
          mode: 'Global & Line Config',
          prompt: 'Switch(config)# / Switch(config-line)#',
          commands: [
            { cmd: 'enable -> configure terminal', why: 'Enter privileged EXEC (#) then global config ((config)#).' },
            { cmd: 'hostname S1', why: 'Sets device identity for prompts and SSH/keys.' },
            { cmd: 'enable secret <SECRET>', why: 'Protects privileged EXEC with salted/hashed secret (preferred over enable password).' },
            { cmd: 'line console 0 -> password <PW> -> login -> exit', why: 'Requires console password at login prompt.' },
            { cmd: 'banner motd #<MSG>#', why: 'Displays legal/authorized-access warning banner.' }
          ],
          verify: { cmd: 'show running-config', expected: 'Hostname, hashed enable secret, console login, and banner appear.' }
        },
        {
          mode: 'Router Interface Config',
          prompt: 'R1(config)# -> R1(config-if)#',
          commands: [
            { cmd: 'interface g0/0', why: 'Enters interface configuration mode for the target LAN port.' },
            { cmd: 'description LAN_192.168.10.0', why: 'Documents connected LAN for troubleshooting.' },
            { cmd: 'ip address 192.168.10.1 255.255.255.0', why: 'Assigns gateway IP and subnet mask (never a wildcard mask here).' },
            { cmd: 'no shutdown', why: 'Administratively enables the router interface (routers default to shutdown).' },
            { cmd: 'end -> copy running-config startup-config', why: 'Returns to # and saves active config to NVRAM.' }
          ],
          verify: { cmd: 'show ip interface brief', expected: 'GigabitEthernet0/0 shows 192.168.10.1, Status up, Protocol up.' }
        }
      ],
      commonErrors: [
        { mistake: 'Forgetting no shutdown on a router interface', symptom: 'Status is administratively down / down', check: 'show ip interface brief', fix: 'Enter interface <if> and run no shutdown' },
        { mistake: 'Putting an IP address on a Layer 2 access switchport', symptom: 'IOS rejects ip address on switchport', check: 'show running-config', fix: 'Use interface vlan <id> (SVI) + ip default-gateway <gw> on L2 switches' },
        { mistake: 'Typing prompt text (e.g. R1(config)#) as part of the command', symptom: '% Invalid input detected', check: 'Check current prompt', fix: 'Type only the command after #' }
      ],
      workedExample: {
        id: 'p1_worked',
        label: 'Local Exercise 1 Worked Example (R1 G0/0)',
        isVariant: false,
        promptText: 'Configure R1 interface g0/0 with IP 192.168.10.1, subnet mask 255.255.255.0, description "LAN1", bring it up, verify interfaces, and save.',
        solution: [
          'enable',
          'configure terminal',
          'interface g0/0',
          'description LAN1',
          'ip address 192.168.10.1 255.255.255.0',
          'no shutdown',
          'end',
          'show ip interface brief',
          'copy running-config startup-config'
        ],
        recallBlanks: [
          { prompt: 'R1>', answer: 'enable', hint: 'Enter privileged EXEC mode' },
          { prompt: 'R1#', answer: 'configure terminal', hint: 'Enter global configuration mode' },
          { prompt: 'R1(config)#', answer: 'interface g0/0', hint: 'Select GigabitEthernet0/0' },
          { prompt: 'R1(config-if)#', answer: 'ip address 192.168.10.1 255.255.255.0', hint: 'Assign IP and /24 subnet mask' },
          { prompt: 'R1(config-if)#', answer: 'no shutdown', hint: 'Enable the interface' },
          { prompt: 'R1#', answer: 'show ip interface brief', hint: 'Verify Status up / Protocol up' },
          { prompt: 'R1#', answer: 'copy running-config startup-config', hint: 'Save config to NVRAM' }
        ],
        spec: {
          deviceType: 'router',
          requireEnable: true,
          requiredInterface: 'g0/0',
          requiredIp: '192.168.10.1',
          requiredMask: '255.255.255.0',
          requireNoShutdown: true,
          requireVerifyCmds: ['show ip interface brief'],
          requireSave: true
        }
      },
      variant: {
        id: 'p1_variant',
        label: 'Website-authored variant (R2 G0/1, 10.20.30.1/25)',
        isVariant: true,
        promptText: 'Configure R2 interface g0/1 for subnet 10.20.30.0/25 using the first usable host IP (10.20.30.1, mask 255.255.255.128), bring the link up, verify with show ip interface brief, and save.',
        solution: [
          'enable',
          'configure terminal',
          'interface g0/1',
          'ip address 10.20.30.1 255.255.255.128',
          'no shutdown',
          'end',
          'show ip interface brief',
          'copy running-config startup-config'
        ],
        recallBlanks: [
          { prompt: 'R2(config)#', answer: 'interface g0/1', hint: 'Select GigabitEthernet0/1' },
          { prompt: 'R2(config-if)#', answer: 'ip address 10.20.30.1 255.255.255.128', hint: '/25 mask ends in .128' },
          { prompt: 'R2(config-if)#', answer: 'no shutdown', hint: 'Enable the interface' },
          { prompt: 'R2#', answer: 'show ip interface brief', hint: 'Inspect interface status' }
        ],
        spec: {
          deviceType: 'router',
          requireEnable: true,
          requiredInterface: 'g0/1',
          requiredIp: '10.20.30.1',
          requiredMask: '255.255.255.128',
          requireNoShutdown: true,
          requireVerifyCmds: ['show ip interface brief'],
          requireSave: true
        }
      },
      extraScenarios: [
        {
          id: 'p1_switch_setup',
          label: 'Authored Switch Setup Template (for Ex 2)',
          isVariant: true,
          promptText: 'On switch S1, set hostname S1, enable secret class, console 0 password cisco with login, banner motd #Authorized Only#, verify with show running-config, and save.',
          solution: [
            'enable',
            'configure terminal',
            'hostname S1',
            'enable secret class',
            'line console 0',
            'password cisco',
            'login',
            'exit',
            'banner motd #Authorized Only#',
            'end',
            'show running-config',
            'copy running-config startup-config'
          ],
          recallBlanks: [
            { prompt: 'S1(config)#', answer: 'enable secret class', hint: 'Protect privileged EXEC' },
            { prompt: 'S1(config-line)#', answer: 'password cisco', hint: 'Set console password' },
            { prompt: 'S1(config-line)#', answer: 'login', hint: 'Require console login' },
            { prompt: 'S1(config)#', answer: 'banner motd #Authorized Only#', hint: 'Set MOTD banner' }
          ],
          spec: {
            deviceType: 'switch',
            requireEnable: true,
            requiredHostname: 'S1',
            requireEnableSecret: true,
            requireConsoleLogin: true,
            requireBanner: true,
            requireVerifyCmds: ['show running-config'],
            requireSave: true
          }
        }
      ],
      troubleshoot: {
        simulated: true,
        output: `R1# show ip interface brief\nInterface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     192.168.10.1    YES manual administratively down down\nGigabitEthernet0/1     unassigned      YES unset  administratively down down`,
        question: 'PCs on 192.168.10.0/24 cannot ping their default gateway 192.168.10.1. Based on the simulated output, what is the fault and fix?',
        options: [
          'Wrong subnet mask configured; re-enter ip address with 0.0.0.255',
          'G0/0 is administratively down because no shutdown was omitted; run interface g0/0 -> no shutdown',
          'OSPF is disabled on G0/0; reconfigure OSPF area 0',
          'Switchport access VLAN is missing on R1 G0/0'
        ],
        correctIndex: 1,
        explanation: 'The IP 192.168.10.1 is assigned, but Status/Protocol are "administratively down / down", which means no shutdown was not issued on R1 G0/0.'
      }
    },
    {
      id: 'p2_vlans',
      number: 2,
      title: 'VLAN Creation & Access Port Assignment',
      activities: [3],
      goal: 'Create a Layer 2 VLAN with its exact required name, then assign the target host-facing switchport as an access port in that VLAN.',
      memoryCue: 'Create the room (vlan + name) -> Put the port in the room (access mode + access vlan) -> Verify',
      nonCliFlags: [
        'Inter-VLAN communication requires a router/L3 SVI; creating VLANs alone does not route between them.'
      ],
      requiredValues: [
        { param: 'VLAN ID', meaning: 'Numeric VLAN identifier', example: '10' },
        { param: 'VLAN Name', meaning: 'Exact case-sensitive name if graded', example: 'Staff' },
        { param: 'Access Port', meaning: 'PC-facing switchport', example: 'f0/6' }
      ],
      commandBlocks: [
        {
          mode: 'VLAN Config Mode',
          prompt: 'S1(config)# -> S1(config-vlan)#',
          commands: [
            { cmd: 'vlan 10', why: 'Creates VLAN 10 and enters VLAN sub-mode.' },
            { cmd: 'name Staff', why: 'Assigns exact required VLAN name (case-sensitive in grading).' },
            { cmd: 'exit', why: 'Returns to global config mode and commits VLAN.' }
          ],
          verify: { cmd: 'show vlan brief', expected: 'VLAN 10 appears as active with name Staff.' }
        },
        {
          mode: 'Interface Config Mode',
          prompt: 'S1(config)# -> S1(config-if)#',
          commands: [
            { cmd: 'interface f0/6', why: 'Selects the host-facing port.' },
            { cmd: 'switchport mode access', why: 'Forces static access mode (disables DTP trunk negotiation).' },
            { cmd: 'switchport access vlan 10', why: 'Places port f0/6 into VLAN 10.' },
            { cmd: 'end', why: 'Returns to privileged EXEC (#).' }
          ],
          verify: { cmd: 'show vlan brief', expected: 'Fa0/6 is listed under VLAN 10 (Staff).' }
        }
      ],
      commonErrors: [
        { mistake: 'Misspelling or wrong capitalization on VLAN name', symptom: 'Grading fails on VLAN name mismatch', check: 'show vlan brief', fix: 'vlan <id> -> name <ExactName>' },
        { mistake: 'Creating VLAN without assigning the port', symptom: 'Port stays in default VLAN 1', check: 'show vlan brief', fix: 'interface <port> -> switchport mode access -> switchport access vlan <id>' }
      ],
      workedExample: {
        id: 'p2_worked',
        label: 'Template Example (VLAN 10 Staff on f0/6)',
        isVariant: false,
        promptText: 'On switch S1, create VLAN 10 named Staff (exact case), assign port f0/6 as an access port in VLAN 10, and verify with show vlan brief.',
        solution: [
          'enable',
          'configure terminal',
          'vlan 10',
          'name Staff',
          'exit',
          'interface f0/6',
          'switchport mode access',
          'switchport access vlan 10',
          'end',
          'show vlan brief'
        ],
        recallBlanks: [
          { prompt: 'S1(config)#', answer: 'vlan 10', hint: 'Create VLAN 10' },
          { prompt: 'S1(config-vlan)#', answer: 'name Staff', hint: 'Exact case-sensitive name' },
          { prompt: 'S1(config-if)#', answer: 'switchport mode access', hint: 'Set static access mode' },
          { prompt: 'S1(config-if)#', answer: 'switchport access vlan 10', hint: 'Assign port to VLAN 10' },
          { prompt: 'S1#', answer: 'show vlan brief', hint: 'Verify VLAN and port membership' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredVlanId: '10',
          requiredVlanName: 'Staff',
          requiredInterface: 'f0/6',
          requireSwitchportAccess: true,
          requiredAccessVlan: '10',
          requireVerifyCmds: ['show vlan brief']
        }
      },
      variant: {
        id: 'p2_variant',
        label: 'Website-authored variant (VLAN 30 Guest on f0/11)',
        isVariant: true,
        promptText: 'On switch S2, create VLAN 30 named Guest (exact case), assign port f0/11 as an access port in VLAN 30, and verify with show vlan brief.',
        solution: [
          'enable',
          'configure terminal',
          'vlan 30',
          'name Guest',
          'exit',
          'interface f0/11',
          'switchport mode access',
          'switchport access vlan 30',
          'end',
          'show vlan brief'
        ],
        recallBlanks: [
          { prompt: 'S2(config)#', answer: 'vlan 30', hint: 'Create VLAN 30' },
          { prompt: 'S2(config-vlan)#', answer: 'name Guest', hint: 'Exact case-sensitive name' },
          { prompt: 'S2(config-if)#', answer: 'switchport mode access', hint: 'Static access mode' },
          { prompt: 'S2(config-if)#', answer: 'switchport access vlan 30', hint: 'Assign port to VLAN 30' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredVlanId: '30',
          requiredVlanName: 'Guest',
          requiredInterface: 'f0/11',
          requireSwitchportAccess: true,
          requiredAccessVlan: '30',
          requireVerifyCmds: ['show vlan brief']
        }
      },
      troubleshoot: {
        simulated: true,
        output: `S1# show vlan brief\nVLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n1    default                          active    Fa0/1, Fa0/2, Fa0/6\n10   Staff                            active`,
        question: 'VLAN 10 exists, but PC-A on Fa0/6 cannot reach other VLAN 10 hosts. What does the simulated output show?',
        options: [
          'VLAN 10 is shut down; run no shutdown in config-vlan',
          'Fa0/6 is still in VLAN 1; assign interface f0/6 -> switchport mode access -> switchport access vlan 10',
          'A trunk is missing on Fa0/6',
          'VLAN 10 needs an IP address on Fa0/6'
        ],
        correctIndex: 1,
        explanation: 'show vlan brief shows Fa0/6 is still listed under VLAN 1 (default), while VLAN 10 (Staff) has no ports assigned.'
      }
    },
    {
      id: 'p3_trunks',
      number: 3,
      title: 'Trunk Links & Native VLAN',
      activities: [4],
      goal: 'Configure an inter-switch uplink as an 802.1Q trunk with matching native VLAN (and allowed list only if tasked) and verify both ends.',
      memoryCue: 'Trunk mode -> Match native VLAN -> Allowed list (only if tasked; watch add vs replace) -> Verify both ends',
      nonCliFlags: [
        'Verify whether the switch model requires encapsulation dot1q (2960s only support dot1q; L3 3560s may need it).'
      ],
      requiredValues: [
        { param: 'Uplink Port', meaning: 'Inter-switch or router-on-a-stick link', example: 'g0/1' },
        { param: 'Native VLAN', meaning: 'Must match on both trunk ends', example: '99' },
        { param: 'Allowed VLANs', meaning: 'Optional restriction; reissuing replaces unless "add" is used', example: '10,20,99' }
      ],
      commandBlocks: [
        {
          mode: 'Interface Config Mode',
          prompt: 'S1(config)# -> S1(config-if)#',
          commands: [
            { cmd: 'interface g0/1', why: 'Selects the switch-to-switch uplink port.' },
            { cmd: 'switchport mode trunk', why: 'Forces 802.1Q trunking.' },
            { cmd: 'switchport trunk native vlan 99', why: 'Sets untagged native VLAN (must match peer switch).' },
            { cmd: 'switchport trunk allowed vlan 10,20,99', why: 'Optional: restricts carried VLANs. Use "add <id>" later to avoid overwriting!' },
            { cmd: 'end', why: 'Returns to privileged EXEC.' }
          ],
          verify: { cmd: 'show interfaces trunk', expected: 'G0/1 shows Mode on, Status trunking, Native vlan 99, and all required VLANs allowed.' }
        }
      ],
      commonErrors: [
        { mistake: 'Native VLAN mismatch between S1 and S2', symptom: 'CDP native VLAN mismatch warnings / leaky untagged traffic', check: 'show interfaces trunk', fix: 'Set identical switchport trunk native vlan <id> on both ends' },
        { mistake: 'Re-running switchport trunk allowed vlan 30 without "add"', symptom: 'Previously allowed VLANs (10,20,99) are overwritten and dropped', check: 'show interfaces trunk', fix: 'Use switchport trunk allowed vlan add 30' }
      ],
      workedExample: {
        id: 'p3_worked',
        label: 'Template Example (g0/1 trunk, native VLAN 99, allowed 10,20,99)',
        isVariant: false,
        promptText: 'Configure uplink g0/1 as a trunk with native VLAN 99 and allowed VLANs 10,20,99, then verify with show interfaces trunk.',
        solution: [
          'enable',
          'configure terminal',
          'interface g0/1',
          'switchport mode trunk',
          'switchport trunk native vlan 99',
          'switchport trunk allowed vlan 10,20,99',
          'end',
          'show interfaces trunk'
        ],
        recallBlanks: [
          { prompt: 'S1(config)#', answer: 'interface g0/1', hint: 'Select uplink port' },
          { prompt: 'S1(config-if)#', answer: 'switchport mode trunk', hint: 'Force trunking' },
          { prompt: 'S1(config-if)#', answer: 'switchport trunk native vlan 99', hint: 'Set native VLAN 99' },
          { prompt: 'S1(config-if)#', answer: 'switchport trunk allowed vlan 10,20,99', hint: 'Restrict allowed VLANs' },
          { prompt: 'S1#', answer: 'show interfaces trunk', hint: 'Verify trunk mode, native VLAN, and allowed list' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredInterface: 'g0/1',
          requireTrunk: true,
          requiredNativeVlan: '99',
          requiredAllowedVlans: '10,20,99',
          requireVerifyCmds: ['show interfaces trunk']
        }
      },
      variant: {
        id: 'p3_variant',
        label: 'Website-authored variant (g0/2 trunk, native VLAN 88, allowed 10,30,88)',
        isVariant: true,
        promptText: 'Configure uplink g0/2 as a trunk with native VLAN 88 and allowed VLANs 10,30,88, then verify with show interfaces trunk.',
        solution: [
          'enable',
          'configure terminal',
          'interface g0/2',
          'switchport mode trunk',
          'switchport trunk native vlan 88',
          'switchport trunk allowed vlan 10,30,88',
          'end',
          'show interfaces trunk'
        ],
        recallBlanks: [
          { prompt: 'S1(config)#', answer: 'interface g0/2', hint: 'Select uplink g0/2' },
          { prompt: 'S1(config-if)#', answer: 'switchport mode trunk', hint: 'Force trunking' },
          { prompt: 'S1(config-if)#', answer: 'switchport trunk native vlan 88', hint: 'Set native VLAN 88' },
          { prompt: 'S1(config-if)#', answer: 'switchport trunk allowed vlan 10,30,88', hint: 'Set allowed VLANs' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredInterface: 'g0/2',
          requireTrunk: true,
          requiredNativeVlan: '88',
          requiredAllowedVlans: '10,30,88',
          requireVerifyCmds: ['show interfaces trunk']
        }
      },
      troubleshoot: {
        simulated: true,
        output: `S1# show interfaces trunk\nPort        Mode             Encapsulation  Status        Native vlan\nGi0/1       on               802.1q         trunking      99\nPort        Vlans allowed on trunk\nGi0/1       30`,
        question: 'After an administrator tried to add VLAN 30 to Gi0/1, VLANs 10, 20, and 99 stopped crossing the trunk. Why?',
        options: [
          'Native VLAN 99 blocks VLAN 10 and 20',
          'They ran "switchport trunk allowed vlan 30" without "add", replacing the entire allowed list',
          '802.1q encapsulation only carries one VLAN at a time',
          'Gi0/1 needs switchport mode access'
        ],
        correctIndex: 1,
        explanation: 'Vlans allowed on trunk shows only 30. Omitting "add" replaces the allowed list instead of appending to it.'
      }
    },
    {
      id: 'p4_ssh',
      number: 4,
      title: 'SSH & Secure VTY Access',
      activities: [5, 6],
      goal: 'Enable SSH v2 remote management using hostname + domain, RSA keys, local credentials, and VTY lines restricted to SSH only.',
      memoryCue: 'Reachable IP -> Hostname + Domain -> Local User -> RSA Keys -> SSH v2 -> VTY (login local + transport input ssh)',
      nonCliFlags: [
        'Client SSH test (ssh -l <user> <ip>) is run from a simulated PC/device terminal, not inside global config.'
      ],
      requiredValues: [
        { param: 'Hostname & Domain', meaning: 'Prerequisites before RSA keygen', example: 'S1 + netacad.pka' },
        { param: 'Local User', meaning: 'Username + hashed secret', example: 'username admin secret cisco123' },
        { param: 'RSA Key Size', meaning: 'Modulus length supported by image', example: '1024' },
        { param: 'VTY Lines', meaning: 'Exact range + login local + ssh', example: 'line vty 0 4 (or 0 15)' }
      ],
      commandBlocks: [
        {
          mode: 'Global Config Mode',
          prompt: 'S1(config)#',
          commands: [
            { cmd: 'hostname S1', why: 'Non-default hostname is required for RSA key generation.' },
            { cmd: 'ip domain-name cisco.local', why: 'Domain name is required for RSA keypair naming.' },
            { cmd: 'username admin secret S3cr3t!', why: 'Creates local user account with hashed secret.' },
            { cmd: 'crypto key generate rsa', why: 'Generates RSA keys; enter required modulus (e.g. 1024) at prompt.' },
            { cmd: 'ip ssh version 2', why: 'Enforces SSHv2 instead of fallback to v1.' }
          ],
          verify: { cmd: 'show ip ssh', expected: 'SSH Enabled - version 2.0.' }
        },
        {
          mode: 'Line Config Mode',
          prompt: 'S1(config)# -> S1(config-line)#',
          commands: [
            { cmd: 'line vty 0 4', why: 'Enters VTY virtual terminal line config.' },
            { cmd: 'login local', why: 'Authenticates VTY sessions against local username database (NOT plain "login").' },
            { cmd: 'transport input ssh', why: 'Permits SSH and blocks insecure Telnet on VTY lines.' },
            { cmd: 'end', why: 'Returns to privileged EXEC.' }
          ],
          verify: { cmd: 'show ip ssh', expected: 'SSH v2 active; test from client with ssh -l admin <ip>.' }
        }
      ],
      commonErrors: [
        { mistake: 'Using "login" instead of "login local" on line vty', symptom: 'Username is ignored or VTY prompts for line password only / fails SSH auth', check: 'show running-config | section line vty', fix: 'Use login local inside line vty' },
        { mistake: 'Forgetting transport input ssh', symptom: 'Telnet remains open or SSH is rejected if transport input none', check: 'show running-config', fix: 'Run transport input ssh under line vty' },
        { mistake: 'Running crypto key generate rsa before setting hostname + ip domain-name', symptom: '% Please define a domain-name first', check: 'show running-config', fix: 'Set hostname and ip domain-name first' }
      ],
      workedExample: {
        id: 'p4_worked',
        label: 'Template Example (S1, domain cisco.local, user admin, VTY 0 4)',
        isVariant: false,
        promptText: 'Configure S1 for SSH v2: hostname S1, domain cisco.local, username admin secret cisco123, RSA keys (1024), ip ssh version 2, VTY 0 4 with login local and transport input ssh, and verify with show ip ssh.',
        solution: [
          'enable',
          'configure terminal',
          'hostname S1',
          'ip domain-name cisco.local',
          'username admin secret cisco123',
          'crypto key generate rsa',
          '1024',
          'ip ssh version 2',
          'line vty 0 4',
          'login local',
          'transport input ssh',
          'end',
          'show ip ssh'
        ],
        recallBlanks: [
          { prompt: 'S1(config)#', answer: 'ip domain-name cisco.local', hint: 'Domain prerequisite for RSA keys' },
          { prompt: 'S1(config)#', answer: 'username admin secret cisco123', hint: 'Local account' },
          { prompt: 'S1(config)#', answer: 'crypto key generate rsa', hint: 'Generate RSA keypair' },
          { prompt: 'S1(config)#', answer: 'ip ssh version 2', hint: 'Enforce SSH v2' },
          { prompt: 'S1(config-line)#', answer: 'login local', hint: 'Use local user database' },
          { prompt: 'S1(config-line)#', answer: 'transport input ssh', hint: 'Allow SSH only (block Telnet)' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredHostname: 'S1',
          requiredDomain: 'cisco.local',
          requiredUsername: 'admin',
          requireRsaKeygen: true,
          requireSshV2: true,
          requiredVtyRange: '0 4',
          requireLoginLocal: true,
          requireTransportSsh: true,
          requireVerifyCmds: ['show ip ssh']
        }
      },
      variant: {
        id: 'p4_variant',
        label: 'Website-authored variant (R1, domain lab.edu, user netops, VTY 0 15)',
        isVariant: true,
        promptText: 'Configure R1 for SSH v2: hostname R1, domain lab.edu, username netops secret Rsu304!, RSA keys, ip ssh version 2, VTY 0 15 with login local and transport input ssh, and verify with show ip ssh.',
        solution: [
          'enable',
          'configure terminal',
          'hostname R1',
          'ip domain-name lab.edu',
          'username netops secret Rsu304!',
          'crypto key generate rsa',
          '1024',
          'ip ssh version 2',
          'line vty 0 15',
          'login local',
          'transport input ssh',
          'end',
          'show ip ssh'
        ],
        recallBlanks: [
          { prompt: 'R1(config)#', answer: 'ip domain-name lab.edu', hint: 'Domain prerequisite' },
          { prompt: 'R1(config)#', answer: 'username netops secret Rsu304!', hint: 'Local user netops' },
          { prompt: 'R1(config-line)#', answer: 'login local', hint: 'Authenticate against local users' },
          { prompt: 'R1(config-line)#', answer: 'transport input ssh', hint: 'SSH only on VTY' }
        ],
        spec: {
          deviceType: 'router',
          requireEnable: true,
          requiredHostname: 'R1',
          requiredDomain: 'lab.edu',
          requiredUsername: 'netops',
          requireRsaKeygen: true,
          requireSshV2: true,
          requiredVtyRange: '0 15',
          requireLoginLocal: true,
          requireTransportSsh: true,
          requireVerifyCmds: ['show ip ssh']
        }
      },
      troubleshoot: {
        simulated: true,
        output: `S1# show running-config | section line vty\nline vty 0 4\n password cisco\n login\n transport input telnet ssh`,
        question: 'SSH v2 is enabled, and "username admin secret cisco123" exists, yet "ssh -l admin 192.168.1.2" fails with authentication/Telnet policy issues. What two things are wrong?',
        options: [
          'VTY uses "login" instead of "login local", and "transport input telnet ssh" still permits Telnet',
          'RSA key size must be 512 instead of 1024',
          'VTY lines need no shutdown',
          'show ip ssh must be run from line config mode'
        ],
        correctIndex: 0,
        explanation: 'VTY has "login" (line password) instead of "login local" (local username DB), and Telnet is still enabled alongside SSH.'
      }
    },
    {
      id: 'p5_acls',
      number: 5,
      title: 'Standard IPv4 ACLs & Modification',
      activities: [7, 8, 9, 10],
      goal: 'Translate a source-filtering policy into ordered numbered/named standard ACL statements using wildcard masks, apply in/out on the correct interface, and verify allowed/denied traffic.',
      memoryCue: 'Source -> Ingress -> Router -> Egress -> Destination | Standard = Source IP only, Wildcard = 255.255.255.255 - Mask, Implicit deny at end',
      nonCliFlags: [
        'Test both an allowed host/subnet and a denied host/subnet from PCs (router-originated pings use a different source IP!).',
        'Exercise 7 scope (standard vs extended) should be confirmed inside Packet Tracer.'
      ],
      requiredValues: [
        { param: 'ACL ID / Name', meaning: '1–99 (numbered) or case-sensitive name', example: '10 or BLOCK_GUEST' },
        { param: 'Wildcard Mask', meaning: 'Inverted subnet mask (/24 = 0.0.0.255)', example: '0.0.0.255 or host <ip>' },
        { param: 'Direction', meaning: 'in (entering router) or out (leaving router)', example: 'ip access-group 10 out' }
      ],
      commandBlocks: [
        {
          mode: 'Numbered / Named ACL Config',
          prompt: 'R1(config)# / R1(config-std-nacl)#',
          commands: [
            { cmd: 'access-list 10 deny host 192.168.10.50', why: 'Numbered standard ACL: denies specific source host first.' },
            { cmd: 'access-list 10 permit 192.168.10.0 0.0.0.255', why: 'Permits rest of 192.168.10.0/24 (wildcard 0.0.0.255). Do NOT add permit any unless policy requires it!' },
            { cmd: 'ip access-list standard <NAME>', why: 'Named standard ACL mode (config-std-nacl)#; supports sequence numbers like "10 deny ..." and "no 10".' }
          ],
          verify: { cmd: 'show access-lists', expected: 'Entries appear in intended sequence order with hit counters.' }
        },
        {
          mode: 'Interface Attachment',
          prompt: 'R1(config)# -> R1(config-if)#',
          commands: [
            { cmd: 'interface g0/1', why: 'Standard ACLs are placed closest to the destination.' },
            { cmd: 'ip access-group 10 out', why: 'Attaches ACL 10 outbound on g0/1. Defining an ACL without ip access-group does nothing!' },
            { cmd: 'end', why: 'Returns to privileged EXEC.' }
          ],
          verify: { cmd: 'show ip interface g0/1', expected: 'Outgoing access list is 10.' }
        }
      ],
      commonErrors: [
        { mistake: 'Using subnet mask 255.255.255.0 instead of wildcard 0.0.0.255', symptom: 'Wildcard bits are inverted — wrong hosts matched', check: 'show access-lists', fix: 'Invert mask: /24 -> 0.0.0.255, /25 -> 0.0.0.127' },
        { mistake: 'Putting permit any or permit subnet BEFORE deny host', symptom: 'First-match rule permits traffic before deny is ever reached', check: 'show access-lists', fix: 'Place specific deny rules before broader permit rules' },
        { mistake: 'Creating ACL without ip access-group on an interface, or wrong direction (in vs out)', symptom: 'Traffic is not filtered at all or wrong traffic is blocked', check: 'show ip interface <if>', fix: 'Attach with ip access-group <id|name> {in|out}' }
      ],
      workedExample: {
        id: 'p5_worked',
        label: 'Standard ACL Example (Block 192.168.10.50, Permit 192.168.10.0/24 outbound on g0/1)',
        isVariant: false,
        promptText: 'Create numbered standard ACL 10 that denies host 192.168.10.50 and permits the rest of 192.168.10.0/24 (wildcard 0.0.0.255), attach it outbound on g0/1, and verify with show access-lists.',
        solution: [
          'enable',
          'configure terminal',
          'access-list 10 deny host 192.168.10.50',
          'access-list 10 permit 192.168.10.0 0.0.0.255',
          'interface g0/1',
          'ip access-group 10 out',
          'end',
          'show access-lists'
        ],
        recallBlanks: [
          { prompt: 'R1(config)#', answer: 'access-list 10 deny host 192.168.10.50', hint: 'Specific deny must come first' },
          { prompt: 'R1(config)#', answer: 'access-list 10 permit 192.168.10.0 0.0.0.255', hint: 'Use /24 wildcard 0.0.0.255' },
          { prompt: 'R1(config-if)#', answer: 'ip access-group 10 out', hint: 'Attach ACL 10 outbound on g0/1' },
          { prompt: 'R1#', answer: 'show access-lists', hint: 'Verify rule order and match counters' }
        ],
        spec: {
          deviceType: 'router',
          requireEnable: true,
          aclType: 'numbered',
          aclId: '10',
          orderedAclRules: [
            { action: 'deny', target: 'host 192.168.10.50' },
            { action: 'permit', target: '192.168.10.0 0.0.0.255' }
          ],
          requiredInterface: 'g0/1',
          requiredAclDirection: 'out',
          requireVerifyCmds: ['show access-lists']
        }
      },
      variant: {
        id: 'p5_variant',
        label: 'Website-authored variant (Named ACL NO_HR on g0/0 inbound)',
        isVariant: true,
        promptText: 'Create named standard ACL NO_HR (exact case) that denies 172.16.20.0/25 (wildcard 0.0.0.127) and permits 172.16.0.0/16 (wildcard 0.0.255.255), attach it inbound on g0/0, and verify with show access-lists.',
        solution: [
          'enable',
          'configure terminal',
          'ip access-list standard NO_HR',
          'deny 172.16.20.0 0.0.0.127',
          'permit 172.16.0.0 0.0.255.255',
          'exit',
          'interface g0/0',
          'ip access-group NO_HR in',
          'end',
          'show access-lists'
        ],
        recallBlanks: [
          { prompt: 'R1(config)#', answer: 'ip access-list standard NO_HR', hint: 'Enter named standard ACL mode' },
          { prompt: 'R1(config-std-nacl)#', answer: 'deny 172.16.20.0 0.0.0.127', hint: '/25 wildcard is 0.0.0.127' },
          { prompt: 'R1(config-std-nacl)#', answer: 'permit 172.16.0.0 0.0.255.255', hint: '/16 wildcard is 0.0.255.255' },
          { prompt: 'R1(config-if)#', answer: 'ip access-group NO_HR in', hint: 'Attach NO_HR inbound on g0/0' }
        ],
        spec: {
          deviceType: 'router',
          requireEnable: true,
          aclType: 'named',
          aclId: 'NO_HR',
          orderedAclRules: [
            { action: 'deny', target: '172.16.20.0 0.0.0.127' },
            { action: 'permit', target: '172.16.0.0 0.0.255.255' }
          ],
          requiredInterface: 'g0/0',
          requiredAclDirection: 'in',
          requireVerifyCmds: ['show access-lists']
        }
      },
      extraScenarios: [
        {
          id: 'p5_modify_acl',
          label: 'Authored Named ACL Modification (for Ex 10)',
          isVariant: true,
          promptText: 'Named ACL BRANCH_FILTER already has: 10 deny host 192.168.10.99 and 20 permit any. Modify BRANCH_FILTER: remove sequence 10 (no 10), insert "10 deny 192.168.20.0 0.0.0.255" before sequence 20, and verify with show access-lists.',
          solution: [
            'enable',
            'configure terminal',
            'ip access-list standard BRANCH_FILTER',
            'no 10',
            '10 deny 192.168.20.0 0.0.0.255',
            'end',
            'show access-lists'
          ],
          recallBlanks: [
            { prompt: 'R1(config)#', answer: 'ip access-list standard BRANCH_FILTER', hint: 'Re-enter named standard ACL mode' },
            { prompt: 'R1(config-std-nacl)#', answer: 'no 10', hint: 'Delete sequence 10' },
            { prompt: 'R1(config-std-nacl)#', answer: '10 deny 192.168.20.0 0.0.0.255', hint: 'Insert new rule at sequence 10' },
            { prompt: 'R1#', answer: 'show access-lists', hint: 'Verify updated sequence order' }
          ],
          spec: {
            deviceType: 'router',
            requireEnable: true,
            aclType: 'named',
            aclId: 'BRANCH_FILTER',
            initialAclRules: [
              { aclId: 'BRANCH_FILTER', seq: 10, action: 'deny', target: 'host 192.168.10.99' },
              { aclId: 'BRANCH_FILTER', seq: 20, action: 'permit', target: 'any' }
            ],
            orderedAclRules: [
              { action: 'deny', target: '192.168.20.0 0.0.0.255' },
              { action: 'permit', target: 'any' }
            ],
            requireVerifyCmds: ['show access-lists']
          }
        }
      ],
      troubleshoot: {
        simulated: true,
        output: `R1# show access-lists\nStandard IP access list 10\n    10 permit 192.168.10.0 0.0.0.255 (12 matches)\n    20 deny host 192.168.10.50`,
        question: 'Host 192.168.10.50 is still able to reach the destination network! Based on the simulated show access-lists output, why?',
        options: [
          'The wildcard mask should be 255.255.255.0',
          'Sequence 10 (permit 192.168.10.0 0.0.0.255) matches 192.168.10.50 first, so sequence 20 is never reached',
          'Standard ACLs cannot deny a single host',
          'Implicit deny overrides sequence 20'
        ],
        correctIndex: 1,
        explanation: 'ACLs are evaluated top-down (first match wins). Putting permit 192.168.10.0/24 before deny host 192.168.10.50 shadows the deny rule.'
      }
    },
    {
      id: 'p6_port_security',
      number: 6,
      title: 'Port Security — Local Exercise 11',
      activities: [11],
      goal: 'Lock access switchports to a maximum secure MAC count with sticky/static learning and explicit violation action, shut down unused ports, and verify MAC/violation state.',
      memoryCue: 'Access mode -> Enable port-security -> Maximum -> Sticky/Static MAC -> Violation (protect/restrict/shutdown) -> Unused ports shutdown -> Verify',
      nonCliFlags: [
        'Disconnecting/reconnecting the rogue PC cable in Exercise 11 is a physical/GUI test action, not an IOS CLI command.'
      ],
      requiredValues: [
        { param: 'Secure Ports', meaning: 'Host-facing ports to lock', example: 'f0/1 - 2 (Ex 11)' },
        { param: 'Maximum & Learning', meaning: 'Max MACs + sticky/static', example: 'maximum 1 + mac-address sticky' },
        { param: 'Violation Mode', meaning: 'protect (drop) | restrict (drop+log) | shutdown (err-disable)', example: 'restrict (Ex 11)' },
        { param: 'Unused Ports', meaning: 'Shut down only confirmed unused ports', example: 'f0/3 - 24, g0/1 - 2' }
      ],
      commandBlocks: [
        {
          mode: 'Interface Range Config',
          prompt: 'S1(config)# -> S1(config-if-range)#',
          commands: [
            { cmd: 'interface range f0/1 - 2', why: 'Selects target access ports together.' },
            { cmd: 'switchport mode access', why: 'Port security requires static access mode.' },
            { cmd: 'switchport port-security', why: 'Enables port security on the ports.' },
            { cmd: 'switchport port-security maximum 1', why: 'Limits each port to 1 secure MAC address.' },
            { cmd: 'switchport port-security mac-address sticky', why: 'Dynamically learns MAC and writes it to running-config.' },
            { cmd: 'switchport port-security violation restrict', why: 'Drops unauthorized frames and increments violation counter/syslog without err-disabling.' }
          ],
          verify: { cmd: 'show port-security interface f0/2', expected: 'Port Security: Enabled, Violation Mode: Restrict, Maximum MAC Addresses: 1.' }
        }
      ],
      commonErrors: [
        { mistake: 'Enabling switchport port-security before switchport mode access', symptom: 'Command rejected: dynamic/trunk port cannot run port security', check: 'show interfaces f0/1 switchport', fix: 'Run switchport mode access first' },
        { mistake: 'Shutting down an active uplink port (e.g., g0/1) blindly', symptom: 'Switch loses connectivity to router/peer switch', check: 'show ip interface brief / topology', fix: 'Only shut down confirmed unused ports' },
        { mistake: 'Confusing protect vs restrict vs shutdown', symptom: 'Wrong violation count or unexpected err-disabled port', check: 'show port-security interface <if>', fix: 'protect=drop; restrict=drop+report; shutdown=err-disable (recover with shutdown -> no shutdown)' }
      ],
      workedExample: {
        id: 'p6_worked',
        label: 'Local Exercise 11 Worked Example (f0/1 - 2, max 1, sticky, restrict)',
        isVariant: false,
        promptText: 'On switch S1 ports f0/1 - 2, set access mode, enable port security with maximum 1, sticky MAC learning, and violation restrict; verify with show port-security.',
        solution: [
          'enable',
          'configure terminal',
          'interface range f0/1 - 2',
          'switchport mode access',
          'switchport port-security',
          'switchport port-security maximum 1',
          'switchport port-security mac-address sticky',
          'switchport port-security violation restrict',
          'end',
          'show port-security'
        ],
        recallBlanks: [
          { prompt: 'S1(config-if-range)#', answer: 'switchport mode access', hint: 'Required before port-security' },
          { prompt: 'S1(config-if-range)#', answer: 'switchport port-security', hint: 'Enable port security' },
          { prompt: 'S1(config-if-range)#', answer: 'switchport port-security maximum 1', hint: 'Max 1 MAC' },
          { prompt: 'S1(config-if-range)#', answer: 'switchport port-security mac-address sticky', hint: 'Enable sticky MAC learning' },
          { prompt: 'S1(config-if-range)#', answer: 'switchport port-security violation restrict', hint: 'Drop + report violation' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredInterface: 'f0/1 - 2',
          requireSwitchportAccess: true,
          requirePortSecurity: true,
          requiredMaxMac: '1',
          requireSticky: true,
          requiredViolation: 'restrict',
          requireVerifyCmds: ['show port-security']
        }
      },
      variant: {
        id: 'p6_variant',
        label: 'Website-authored variant (f0/5 - 6, max 2, sticky, shutdown)',
        isVariant: true,
        promptText: 'On switch S2 ports f0/5 - 6, set access mode, enable port security with maximum 2, sticky MAC learning, and violation shutdown; verify with show port-security.',
        solution: [
          'enable',
          'configure terminal',
          'interface range f0/5 - 6',
          'switchport mode access',
          'switchport port-security',
          'switchport port-security maximum 2',
          'switchport port-security mac-address sticky',
          'switchport port-security violation shutdown',
          'end',
          'show port-security'
        ],
        recallBlanks: [
          { prompt: 'S2(config)#', answer: 'interface range f0/5 - 6', hint: 'Select range f0/5 - 6' },
          { prompt: 'S2(config-if-range)#', answer: 'switchport port-security maximum 2', hint: 'Max 2 MACs' },
          { prompt: 'S2(config-if-range)#', answer: 'switchport port-security violation shutdown', hint: 'Err-disable on violation' }
        ],
        spec: {
          deviceType: 'switch',
          requireEnable: true,
          requiredInterface: 'f0/5 - 6',
          requireSwitchportAccess: true,
          requirePortSecurity: true,
          requiredMaxMac: '2',
          requireSticky: true,
          requiredViolation: 'shutdown',
          requireVerifyCmds: ['show port-security']
        }
      },
      troubleshoot: {
        simulated: true,
        output: `S1# show port-security interface f0/2\nPort Security              : Enabled\nPort Status                : Secure-up\nViolation Mode             : Restrict\nMaximum MAC Addresses      : 1\nTotal MAC Addresses        : 1\nSecurity Violation Count   : 4`,
        question: 'A rogue laptop was plugged into Fa0/2. Based on the simulated output, why is Security Violation Count 4 while Port Status remains Secure-up?',
        options: [
          'Violation mode Restrict drops unauthorized frames and increments the violation counter without shutting down the port',
          'Port security is not actually enabled',
          'Maximum MAC Addresses is set to 4',
          'Sticky learning automatically added the rogue laptop'
        ],
        correctIndex: 0,
        explanation: 'In Restrict mode, unauthorized MAC traffic is dropped and Security Violation Count increments, while Port Status stays Secure-up (unlike Shutdown mode, which transitions to Secure-shutdown / err-disabled).'
      }
    }
  ];

  ACTIVITIES.forEach(a => {
    a.notes = WALKTHROUGHS.find(g => g.ex === a.ex).scope;
  });
  return {
    WALKTHROUGHS,
    SOURCE_META,
    MEMORY_ROUTINE,
    DEVICE_WORKFLOW,
    ACTIVITIES,
    PATTERNS
  };
}));
