(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CLI_WALKTHROUGHS = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // Authored teaching steps transcribed from student-visible local activity instructions.
  // These are expected observations, not captured device output or hidden assessment answers.
  const guides = [];
  function guide(ex, title, scope) {
    const g = { ex, title, scope, source: `Local Exercise ${ex}: student-visible Instructions, Packet Tracer 9.0.1`,
      executionStatus: 'Instructions reviewed; Packet Tracer guide: user-validated (automated PT run not captured).', steps: [], checklist: [] };
    let device = '', prompt = '', section = '';
    const b = {
      g,
      section(s) { section = s; return b; },
      device(d, p) { device = d; prompt = p || `${d}>`; return b; },
      command(command, why, next, expected, aliases) {
        g.steps.push({ device, section, kind: 'command', prompt, command, why,
          nextPrompt: next || prompt, expected: expected || `Return to ${next || prompt} without an IOS error.`,
          trouble: 'Check the device and prompt first. Type only the command, without the prompt. Use ? in Packet Tracer to inspect supported syntax.', aliases: aliases || [] });
        prompt = next || prompt; return b;
      },
      reply(command, why, next, expected, at) {
        g.steps.push({ device, section, kind: 'response', prompt: at || prompt, command, why, nextPrompt: next,
          expected: expected || `Continue to ${next}.`, trouble: 'This is a response to an interactive prompt, not an IOS command. Passwords do not echo.' });
        prompt = next; return b;
      },
      task(title, why, expected) {
        g.steps.push({ device, section, kind: 'task', prompt, command: title, why, expected,
          nextPrompt: prompt, trouble: 'Use the provided topology and current activity instructions. Next records your own confirmation; the website cannot observe Packet Tracer.' }); return b;
      },
      enable(password) {
        const privilegedPrompt = prompt.replace(/>$/, '#');
        b.command('enable', 'Enter privileged EXEC so show and configuration commands are available.', password ? 'Password:' : prompt.replace(/>$/, '#'), undefined, ['en']);
        if (password) b.reply(password, 'Supply the activity enable password; input stays invisible.', privilegedPrompt);
        return b;
      },
      config() { return b.command('configure terminal', 'Enter global configuration mode.', prompt.replace(/#$/, '(config)#'), undefined, ['conf t', 'config t']); },
      end() { return b.command('end', 'Return directly to privileged EXEC from any configuration submode.', `${device}#`); },
      iface(name, range) { return b.command(`interface ${range ? 'range ' : ''}${name}`, 'Select the exact port(s) named in the task before changing settings.', `${device}(config-if${range ? '-range' : ''})#`); },
      save() {
        b.command('copy running-config startup-config', 'Save the current working configuration to NVRAM so it survives a restart.', 'Destination filename [startup-config]?', undefined, ['copy run start']);
        return b.reply('', 'Press Enter to accept the default destination filename.', `${device}#`, 'Building configuration… [OK].');
      },
      ping(ip, expected) { return b.command(`ping ${ip}`, 'Test actual reachability against the policy; a deliberate denial is a successful security test.', undefined, expected); },
      finish(checklist) { g.checklist = checklist; guides.push(g); return g; }
    };
    return b;
  }
  function lan(b, port, ip, description) {
    b.iface(port).command(`ip address ${ip} 255.255.255.0`, 'Assign the LAN gateway address and /24 subnet mask.')
      .command(`description ${description}`, 'Label the physical connection for later troubleshooting.')
      .command('no shutdown', 'Administratively enable the router interface.', undefined, 'The interface can become up/up when its cable and peer are active.', ['no shut']);
  }
  function vty(b, range) {
    b.command(`line vty ${range}`, 'Select the remote-access lines, rather than the console line.', `${b.g.steps[b.g.steps.length - 1].device}(config-line)#`)
      .command('login local', 'Authenticate SSH sessions using the local username database.')
      .command('transport input ssh', 'Accept SSH remote access and reject Telnet.');
  }
  function rsa(b, d) {
    b.command('crypto key generate rsa', 'Create the RSA host keys required by this SSH activity.', 'How many bits in the modulus [512]:');
    b.reply('1024', 'Answer the key-size question with the activity-required 1024 bits (lab requirement).', `${d}(config)#`, 'Keys are generated. This number is not a standalone IOS command.');
  }
  function aclAttach(b, port, name) {
    b.iface(port).command(`ip access-group ${name} out`, 'Filter packets leaving this interface toward the protected destination LAN.').end()
      .command(`show ip interface ${port}`, 'Verify the ACL is attached to the correct interface and direction.', undefined, `Outgoing access list is ${name}.`);
  }

  let b = guide(1, 'Connect a Router to a LAN', 'Configure four LAN interfaces. Preserve the supplied serial links and OSPF. Console password cisco; enable password class.');
  for (const [d, ips, switches] of [['R1', ['192.168.10.1', '192.168.11.1'], ['S1', 'S2']], ['R2', ['10.1.1.1', '10.1.2.1'], ['S3', 'S4']]]) {
    b.section('Part 1 · Inspect existing configuration').device(d, 'Password:')
      .reply('cisco', 'Log in through the provided console session.', `${d}>`).enable('class')
      .command('show interfaces serial 0/0/0', 'Inspect the supplied WAN interface without changing its settings.')
      .command('show interfaces g0/0', 'Read the LAN port IP, MAC address and bandwidth before configuration.')
      .command('show ip interface brief', 'Compare addresses and administrative/link states.')
      .command('show ip route', 'Inspect connected and OSPF routes; absent connected LAN routes are expected before enabling their interfaces.')
      .section('Part 2 · Configure the LAN interfaces').config();
    lan(b, 'g0/0', ips[0], `LAN connection to ${switches[0]}`);
    b.command('exit', 'Leave the first interface before selecting the second.', `${d}(config)#`);
    lan(b, 'g0/1', ips[1], `LAN connection to ${switches[1]}`);
    b.end().command('show ip interface brief', 'Verify both LAN ports have the correct IP and are up/up.', undefined, 'G0/0 and G0/1 match the addressing table; both should be up/up.')
      .command('show interfaces', 'Confirm the interface descriptions and operational details.')
      .command('show ip route', 'Confirm connected LAN routes and supplied OSPF routes after convergence.').save();
  }
  b.section('Part 3 · Verify end-to-end connectivity').device('PC1', 'C:\\>').ping('10.1.2.10', 'PC1 → PC4 should succeed after ARP/routing convergence.')
    .device('R2', 'R2#').ping('192.168.11.10', 'R2 → PC2 should succeed.')
    .task('Test all PCs using the addressing table', 'Check every configured LAN rather than just one successful path.', 'All PCs can communicate; switch management pings can fail because no management SVI was configured.')
    .finish(['Both routers: four LAN interfaces addressed, described and up/up.', 'Existing serial and OSPF configuration preserved.', 'PC1→PC4 and R2→PC2 pass; both routers saved.']);

  b = guide(2, 'Configure Initial Switch Settings', 'Follow the activity’s password comparison, banner and save sequence on S1, then repeat on S2. These are provided classroom credentials.');
  for (const d of ['S1', 'S2']) {
    b.section(d === 'S1' ? 'Parts 1–4 · Initial configuration' : 'Part 5 · Repeat on S2').device(d, 'Switch>').enable()
      .command('show running-config', 'Inspect the default interfaces, VTY ranges and current passwords. Use Space at --More--.')
      .command('show startup-config', 'Inspect NVRAM before the first save.', undefined, 'A new switch can report startup-config is not present.').config()
      .command(`hostname ${d}`, 'Set the required device name.', `${d}(config)#`)
      .command('line console 0', 'Select the physical console login line.', `${d}(config-line)#`)
      .command('password letmein', 'Set the activity-required console password.')
      .command('login', 'Require the console password when a console session starts.')
      .command('exit', 'Return to global configuration.', `${d}(config)#`)
      .command('enable password c1$c0', 'Set the older plain-text enable password for the comparison task.');
    if (d === 'S1') {
      b.end().command('exit', 'Log out to verify console and enable protection.', 'Press RETURN to get started.')
        .reply('', 'Press Enter to start the console login.', 'Password:')
        .reply('letmein', 'Use the console password, not the enable password.', `${d}>`).enable('c1$c0')
        .command('show running-config', 'Observe the two plain-text passwords before adding a secret.').config();
    }
    b.command('enable secret itsasecret', 'Set the secret that takes precedence over enable password.').end()
      .command('show running-config', 'Observe that enable secret is stored as a hash, unlike the earlier clear-text passwords.').config()
      .command('service password-encryption', 'Obfuscate the remaining plain-text line/enable passwords; this is not equivalent to strong password hashing.')
      .command('banner motd "This is a secure system. Authorized Access Only!"', 'Display the activity warning before login. The quotes delimit the message.').end()
      .command('show running-config', 'Verify hostname, console login, secret, encrypted passwords and banner.').save()
      .command('show startup-config', 'Confirm the saved file contains the final configuration.');
  }
  b.finish(['S1 and S2 have the required names, console password and enable credentials.', 'Know that itsasecret overrides c1$c0.', 'Warning banner and password encryption configured; both switches saved.']);

  b = guide(3, 'VLAN Configuration', 'Create the five exact VLAN names on all switches, then assign access/voice ports. Cross-switch pings fail at the end until trunks are configured in Exercise 4.');
  b.section('Part 1 · Baseline').device('S1').enable().command('show vlan brief', 'Observe the initial VLAN 1 membership.')
    .device('PC1', 'C:\\>').ping('172.17.10.24', 'Before VLAN segmentation, PC1→PC4 succeeds. Likewise test PC2→PC5 and PC3→PC6.');
  for (const d of ['S1', 'S2', 'S3']) {
    b.section('Part 2 · Create VLANs on every switch').device(d, d === 'S1' ? 'S1#' : `${d}>`);
    if (d !== 'S1') b.enable();
    b.config();
    for (const [id, name] of [[10, 'Faculty/Staff'], [20, 'Students'], [30, 'Guest(Default)'], [99, 'Management&Native'], [150, 'VOICE']]) {
      b.command(`vlan ${id}`, 'Create/select this VLAN in the local switch database.', `${d}(config-vlan)#`)
        .command(`name ${name}`, 'Use the exact capitalization and spelling from the activity.')
        .command('exit', 'Leave VLAN configuration.', `${d}(config)#`);
    }
    b.end().command('show vlan brief', 'Verify all five VLAN IDs and names.');
  }
  for (const d of ['S2', 'S3']) {
    b.section('Part 3 · Assign access ports').device(d, `${d}#`).config();
    for (const [port, vlan] of [['f0/11', 10], ['f0/18', 20], ['f0/6', 30]]) {
      b.iface(port).command('switchport mode access', 'Make this endpoint-facing interface an access port.')
        .command(`switchport access vlan ${vlan}`, 'Place untagged endpoint traffic into the required data VLAN.')
        .command('exit', 'Return to global configuration.', `${d}(config)#`);
    }
    if (d === 'S3') b.iface('f0/11').command('mls qos trust cos', 'Trust the phone’s CoS markings on the task-specified phone port.')
      .command('switchport voice vlan 150', 'Carry the phone voice traffic in VLAN 150 while keeping data VLAN 10.');
    b.end().command('show vlan brief', 'Check access membership and voice VLAN assignment.');
  }
  b.device('PC1', 'C:\\>').ping('172.17.10.24', 'Expected to FAIL at this stage: the inter-switch uplinks still use VLAN 1. Do not undo the access VLANs.')
    .finish(['Five exact VLANs on S1/S2/S3.', 'S2/S3 F0/11→10, F0/18→20, F0/6→30.', 'S3 F0/11 retains data VLAN 10 plus voice VLAN 150 and CoS trust.', 'Understand the expected cross-switch ping failure before trunking.']);

  b = guide(4, 'Configure Trunks', 'Use the prebuilt VLANs. Make the two S1 uplinks trunks and align native VLAN 99 at both ends. No allowed-VLAN restriction is requested.');
  for (const d of ['S1', 'S2', 'S3']) b.section('Part 1 · Inspect VLANs').device(d).enable().command('show vlan brief', 'Confirm the supplied VLANs and endpoint access ports.');
  b.device('PC1', 'C:\\>').ping('172.17.10.24', 'Before trunking, this same-VLAN cross-switch ping fails.')
    .section('Part 2 · Configure S1 trunks').device('S1', 'S1#').config().iface('g0/1 - 2', true)
    .command('switchport mode trunk', 'Force both uplinks to carry multiple VLANs; peers can negotiate their trunk state.')
    .command('switchport trunk native vlan 99', 'Use VLAN 99 for untagged traffic on the S1 end. A temporary CDP mismatch is expected until peers match.').end()
    .command('show interfaces trunk', 'Verify trunk state and native VLAN 99.');
  for (const [d, port] of [['S2', 'g0/1'], ['S3', 'g0/2']]) b.section('Part 2 · Match peer native VLAN').device(d, `${d}#`)
    .command('show interfaces trunk', 'Check the negotiated trunk and current native VLAN before changing it.').config().iface(port)
    .command('switchport trunk native vlan 99', 'Match the S1 native VLAN and clear the CDP mismatch.').end()
    .command(`show interfaces ${port} switchport`, 'Verify operational trunking and native VLAN 99.')
    .command('show vlan brief', 'Trunk ports are no longer listed as access members of VLAN 1.');
  b.device('PC1', 'C:\\>').ping('172.17.10.24', 'After spanning-tree convergence, PC1→PC4 succeeds.')
    .device('PC2', 'C:\\>').ping('172.17.20.25', 'PC2→PC5 succeeds.')
    .device('PC3', 'C:\\>').ping('172.17.30.26', 'PC3→PC6 succeeds.')
    .finish(['S1 G0/1 and G0/2 are trunks.', 'Native VLAN 99 matches S2 G0/1 and S3 G0/2.', 'All three same-VLAN PC pairs pass after convergence.']);

  b = guide(5, 'Configure Secure Passwords and SSH', 'The activity lets you choose strong secrets. This guide consistently uses examadmin / ExamLogin27! and enable secret ExamEnable27! as lab examples. PCA must already be 172.16.1.10/24, gateway 172.16.1.1.');
  for (const [d, ip] of [['RTA', '172.16.1.1'], ['SW1', '172.16.1.2']]) {
    b.section(`Secure ${d}`).device(d, d === 'RTA' ? 'Router>' : 'Switch>').enable().config()
      .command(`hostname ${d}`, 'Set a non-default hostname before RSA key generation.', `${d}(config)#`)
      .iface(d === 'RTA' ? 'g0/0' : 'vlan 1')
      .command(`ip address ${ip} 255.255.255.0`, 'Configure the router gateway or switch management SVI.')
      .command('no shutdown', 'Enable the interface; an SVI also needs an active member port.').end().config();
    if (d === 'RTA') b.command('security passwords min-length 10', 'Require at least ten characters for newly configured passwords. IOS uses the plural passwords; the source contains a singular-word typo.');
    else b.command('ip default-gateway 172.16.1.1', 'Provide the Layer 2 switch management return path.').iface('f0/2 - 24, g0/2', true)
      .command('shutdown', 'Disable unused switch ports; keep F0/1 and G0/1 active.').end().config();
    b.command('service password-encryption', 'Obfuscate plain-text passwords in configuration output.')
      .command('enable secret ExamEnable27!', 'Choose the guide’s example secret, which meets the ten-character minimum.')
      .command('no ip domain-lookup', 'Stop IOS trying DNS for mistyped commands.')
      .command('ip domain-name CCNA.com', 'Set the activity domain needed to identify the RSA keys.')
      .command('username examadmin secret ExamLogin27!', 'Create the local SSH account using the same chosen example throughout.');
    rsa(b, d);
    if (d === 'RTA') b.command('login block-for 180 attempts 4 within 120', 'Block logins for 180 seconds after four failures within 120 seconds.');
    vty(b, d === 'RTA' ? '0 4' : '0 15');
    b.command('exec-timeout 6 0', 'Disconnect idle remote sessions after six minutes.').end()
      .command('show running-config', 'Verify all VTY lines, authentication, timeout and the required security settings.').save()
      .device('PCA', 'C:\\>').command(`ssh -l examadmin ${ip}`, 'Test remote login from PCA using the configured local account.', 'Password:')
      .reply('ExamLogin27!', 'Use the SSH user secret, not the enable secret.', `${d}>`)
      .device(d, `${d}>`).enable('ExamEnable27!').command('exit', 'Close the remote session after verifying privileged access.', 'C:\\>');
  }
  b.finish(['RTA and SW1 management addresses reachable from PCA.', 'RTA minimum length and login blocking set; both devices use local SSH login and six-minute VTY timeout.', 'Unused SW1 ports shut; all SW1 VTY lines protected; both configurations saved.']);

  b = guide(6, 'Configure SSH', 'S1 is already 10.10.10.2/24; PC1 is 10.10.10.10/24. Initial Telnet and enable passwords are cisco. Change remote authentication without losing the saved recovery configuration.');
  b.section('Part 1 · Inspect and encrypt').device('PC1 → S1', 'C:\\>')
    .command('telnet 10.10.10.2', 'Open the initially permitted remote session.', 'Password:')
    .reply('cisco', 'Use the initial VTY password.', 'S1>');
  b.device('S1', 'S1>').enable('cisco').save().command('show running-config', 'Observe the original clear-text passwords and the actual VTY ranges.').config()
    .command('service password-encryption', 'Obfuscate the existing clear-text line passwords.').end()
    .command('show running-config', 'Verify the passwords are no longer shown as clear text.').config()
    .section('Part 2 · Configure SSH').command('ip domain-name netacad.pka', 'Use the activity-specific domain for RSA key generation.');
  rsa(b, 'S1');
  b.command('username administrator secret cisco', 'Create the exact local account required by this activity.');
  vty(b, '0 15');
  b.command('no password', 'Remove the obsolete shared VTY line password; login local now uses the username database.').end()
    .command('exit', 'Close the existing Telnet session before testing new-session restrictions.', 'C:\\>')
    .section('Part 3 · Test new sessions').device('PC1', 'C:\\>').command('telnet 10.10.10.2', 'Verify that a NEW Telnet session is rejected.', undefined, 'Telnet connection fails because VTY transport permits SSH only.')
    .command('ssh -l administrator 10.10.10.2', 'Connect using the new SSH account.', 'Password:')
    .reply('cisco', 'Authenticate as administrator.', 'S1>')
    .device('S1', 'S1>').enable('cisco').command('show ip ssh', 'Verify the device SSH server is enabled.').save()
    .finish(['New Telnet sessions fail; SSH succeeds as administrator/cisco.', 'All VTY lines use login local and transport input ssh, with no shared line password.', 'Final configuration saved only after successful SSH login.']);

  b = guide(7, 'ACL Demonstration', 'Inspect and remove the existing standard ACL 11 on R1. Preserve all supplied addressing and routing; some addressing-table WAN entries are inconsistent.');
  b.section('Part 1 · Observe filtering').device('PC1', 'C:\\>').ping('192.168.10.11', 'Local PC2 succeeds.').ping('192.168.11.10', 'PC3 on the other R1 LAN succeeds.')
    .ping('192.168.30.12', 'Remote PC4 fails while ACL 11 blocks source 192.168.10.0/24.').ping('192.168.31.12', 'Remote DNS server also fails.')
    .section('Part 2 · Inspect and remove ACL').device('R1').enable()
    .command('show running-config', 'Find ACL 11: deny 192.168.10.0 0.0.0.255 then permit any; identify its serial attachment.')
    .command('show access-lists', 'Confirm this is a standard source-address ACL, not an extended ACL.')
    .config().iface('s0/0/0').command('no ip access-group 11 out', 'Detach ACL 11 from the outgoing serial interface before deleting its definition.')
    .command('exit', 'Return to global configuration.', 'R1(config)#')
    .command('no access-list 11', 'Remove only ACL 11; do not delete unrelated configuration.').end()
    .command('show ip interface s0/0/0', 'Verify there is no outgoing ACL on this interface.')
    .command('show access-lists', 'Verify ACL 11 is gone.').device('PC1', 'C:\\>')
    .ping('192.168.30.12', 'PC4 now succeeds.').ping('192.168.31.12', 'DNS server now succeeds.')
    .finish(['Explained why local pings passed while remote pings failed.', 'ACL 11 detached from Serial0/0/0 out and deleted.', 'Previously blocked PC4 and DNS pings now pass.']);

  b = guide(8, 'Configure Numbered Standard IPv4 ACLs', 'Preserve supplied EIGRP and addressing. ACL 1 on R2 protects the server LAN; a separate ACL 1 on R3 protects its PC LAN.');
  b.section('Part 1 · Baseline').device('PC1', 'C:\\>').ping('192.168.20.254', 'Server reachable before filtering.').ping('192.168.30.10', 'PC3 reachable before filtering.');
  for (const [d, subnet] of [['R2', '192.168.11.0'], ['R3', '192.168.10.0']]) {
    b.section('Part 2 · Configure source filtering').device(d).enable().config()
      .command(`access-list 1 deny ${subnet} 0.0.0.255`, 'Deny this source subnet first. The final value is a wildcard, not a subnet mask.')
      .command('access-list 1 permit any', 'Allow other sources before the implicit deny.');
    aclAttach(b, 'g0/0', '1');
    b.command('show access-lists', 'Verify rule order and examine hit counters after traffic tests; counts depend on actual traffic.');
  }
  b.section('Part 3 · Verify policy').device('PC1', 'C:\\>').ping('192.168.11.10', 'PC1→PC2 succeeds.').ping('192.168.20.254', 'PC1→server succeeds.').ping('192.168.30.10', 'PC1→PC3 fails.')
    .device('PC2', 'C:\\>').ping('192.168.20.254', 'PC2→server fails.').ping('192.168.30.10', 'PC2→PC3 succeeds.')
    .device('PC3', 'C:\\>').ping('192.168.20.254', 'PC3→server succeeds.')
    .finish(['R2 ACL 1 denies 192.168.11.0/24 then permits any, attached G0/0 out.', 'R3 ACL 1 denies 192.168.10.0/24 then permits any, attached G0/0 out.', 'All six permitted/denied ping outcomes match the policy.']);

  b = guide(9, 'Configure Named Standard IPv4 ACLs', 'Protect the File Server 192.168.200.100. Permit only PC1 (Web Manager) 192.168.20.4 and Web Server 192.168.100.100; the ACL name is case-sensitive.');
  b.section('Part 1 · Baseline').device('PC0', 'C:\\>').ping('192.168.100.100', 'Web Server reachable before filtering.').ping('192.168.200.100', 'File Server reachable before filtering.')
    .task('Repeat baseline pings from PC1 and PC2', 'Establish that routing works before adding the ACL.', 'Both servers are initially reachable from all three PCs.')
    .section('Part 2 · Named ACL').device('R1').enable().config()
    .command('ip access-list standard File_Server_Restrictions', 'Create the exact named standard ACL from the task.', 'R1(config-std-nacl)#')
    .command('permit host 192.168.20.4', 'Allow the Web Manager PC as one exact source host.')
    .command('permit host 192.168.100.100', 'Allow the Web Server as the second exact source host.')
    .command('deny any', 'Explicitly deny every other source after the two permits.').end()
    .command('show access-lists', 'Verify the name and rule order.').config();
  aclAttach(b, 'f0/1', 'File_Server_Restrictions');
  b.save().section('Part 3 · Verify').device('PC0', 'C:\\>').ping('192.168.200.100', 'PC0→File Server fails.').ping('192.168.100.100', 'PC0→Web Server still succeeds.')
    .device('PC1', 'C:\\>').ping('192.168.200.100', 'Web Manager→File Server succeeds.')
    .device('PC2', 'C:\\>').ping('192.168.200.100', 'PC2→File Server fails.')
    .device('Web Server', 'Command Prompt>').ping('192.168.200.100', 'Web Server→File Server succeeds.')
    .task('Verify every PC can still ping the Web Server', 'The ACL protects the File Server LAN, not every R1 destination.', 'PC0, PC1 and PC2 can all reach 192.168.100.100.')
    .finish(['File_Server_Restrictions has the two host permits then deny any.', 'Attached to R1 FastEthernet0/1 out and saved.', 'Only Web Manager and Web Server reach File Server; Web Server access otherwise preserved.']);

  b = guide(10, 'Configure and Modify Standard IPv4 ACLs', 'R1/R3 ports are G0/0/0, not the shorter G0/0 names used in other activities. Leave ISP Edge untouched. Modify the named ACL in place, as requested by Option 2.');
  b.section('Part 1 · Baseline').device('PC-A', 'C:\\>').ping('192.168.30.3', 'PC-A→PC-C succeeds before ACLs.').ping('192.168.40.3', 'PC-A→PC-D succeeds.').ping('209.165.200.254', 'Internet server initially succeeds.')
    .task('Repeat the baseline from PC-C and routers R1/R3', 'Check opposite-direction routing before filtering.', 'PC-C can reach PC-A/PC-B; R1 and R3 can reach the opposite LANs; all PCs can reach the Internet server.')
    .section('Part 2 · Numbered ACL on R3').device('R3').enable().config()
    .command('access-list 1 remark Allow R1 LANs Access', 'Document the intended policy in ACL 1.')
    .command('access-list 1 permit 192.168.10.0 0.0.0.255', 'Permit the first R1 source LAN.')
    .command('access-list 1 permit 192.168.20.0 0.0.0.255', 'Permit the second R1 source LAN.')
    .command('access-list 1 deny any', 'Add the explicit final deny required by the task.');
  aclAttach(b, 'g0/0/0', '1');
  b.device('PC-A', 'C:\\>').ping('192.168.30.3', 'PC-A→PC-C passes.').device('PC-B', 'C:\\>').ping('192.168.30.3', 'PC-B→PC-C passes.')
    .device('PC-D', 'C:\\>').ping('192.168.30.3', 'PC-D→PC-C fails because source 192.168.40.0/24 is not permitted.')
    .device('R1', 'R1#').ping('192.168.30.3', 'Default router-originated ping can fail because its WAN source address is not one of the permitted LANs.')
    .section('Part 2 · Named ACL on R1').device('R1', 'R1#').config()
    .command('ip access-list standard BRANCH-OFFICE-POLICY', 'Create the exact named ACL.', 'R1(config-std-nacl)#')
    .command('permit host 192.168.30.3', 'Allow only PC-C from the 192.168.30.0/24 LAN.')
    .command('permit 192.168.40.0 0.0.0.255', 'Allow the whole 192.168.40.0/24 LAN. Other traffic is initially denied implicitly.').end().config();
  aclAttach(b, 'g0/0/0', 'BRANCH-OFFICE-POLICY');
  b.device('PC-C', 'C:\\>').ping('192.168.10.3', 'PC-C→PC-A passes.').device('PC-D', 'C:\\>').ping('192.168.10.3', 'PC-D→PC-A passes.')
    .section('Part 2 · Extended ping tests source selection').device('R3', 'R3#')
    .command('ping', 'Start interactive extended ping to control the source address.', 'Protocol [ip]:')
    .reply('', 'Accept IPv4.', 'Target IP address:').reply('192.168.10.3', 'Set PC-A as the destination.', 'Repeat count [5]:')
    .reply('', 'Accept five echo requests.', 'Datagram size [100]:').reply('', 'Accept the default size.', 'Timeout in seconds [2]:')
    .reply('', 'Accept the default timeout.', 'Extended commands [n]:').reply('y', 'Enable extended options.', 'Source address or interface:')
    .reply('192.168.30.1', 'Use the R3 LAN interface address; it is not the permitted host .30.3.', 'Type of service [0]:');
  for (const [at, next] of [['Type of service [0]:', 'Set DF bit in IP header? [no]:'], ['Set DF bit in IP header? [no]:', 'Validate reply data? [no]:'], ['Validate reply data? [no]:', 'Data pattern [0xABCD]:'], ['Data pattern [0xABCD]:', 'Loose, Strict, Record, Timestamp, Verbose[none]:'], ['Loose, Strict, Record, Timestamp, Verbose[none]:', 'Sweep range of sizes [n]:']]) b.reply('', 'Accept this default extended-ping option.', next, undefined, at);
  b.reply('', 'Keep the default size and run the test.', 'R3#', 'The source 192.168.30.1 is denied by R1, even though PC-C .30.3 is permitted.')
    .section('Part 3 · Modify the existing named ACL').device('PC-A', 'C:\\>').ping('209.165.200.254', 'Fails now: returning Internet-server packets are denied by the R1 ACL.')
    .device('R1', 'R1#').command('show access-lists', 'Inspect existing sequence numbers 10 and 20 before adding rules.').config()
    .command('ip access-list standard BRANCH-OFFICE-POLICY', 'Re-enter the existing ACL without deleting it or its attachment.', 'R1(config-std-nacl)#')
    .command('30 permit 209.165.200.224 0.0.0.31', 'Permit the Internet server subnet BEFORE the new explicit deny; /27 uses wildcard 0.0.0.31.')
    .command('40 deny any', 'Make the final denial explicit after all three permits.').end()
    .command('show access-lists', 'Verify four ordered entries at 10, 20, 30 and 40.')
    .command('show ip interface g0/0/0', 'Confirm the original named ACL attachment is still present.')
    .device('PC-A', 'C:\\>').ping('209.165.200.254', 'Internet-server access now succeeds because return traffic is permitted.')
    .finish(['R3 numbered ACL 1 protects its G0/0/0 destination LAN.', 'R1 named ACL permits PC-C and the .40 LAN, attached G0/0/0 out.', 'Extended ping illustrates why the source IP matters.', 'Named ACL modified in place with sequences 30 and 40; Internet access restored.']);

  b = guide(11, 'Implement Port Security', 'Secure S1 F0/1 and F0/2: one sticky MAC each, violation restrict. Physical cable moves are explicit test actions; IOS cannot move a cable.');
  b.section('Part 1 · Configure port security').device('S1').enable().config().iface('f0/1 - 2', true)
    .command('switchport mode access', 'Use static access mode before enabling port security.')
    .command('switchport port-security', 'Enable port security on the two endpoint ports.')
    .command('switchport port-security maximum 1', 'Allow one secure MAC address per port.')
    .command('switchport port-security mac-address sticky', 'Learn the first legitimate source MAC and add it to the running configuration.')
    .command('switchport port-security violation restrict', 'Drop unauthorized source frames and count violations while keeping the interface up.').end().config()
    .iface('f0/3 - 24, g0/1 - 2', true).command('shutdown', 'Disable all task-specified unused ports.').end()
    .device('PC1', 'C:\\>').ping('10.10.10.11', 'Legitimate PC1→PC2 succeeds and teaches both sticky addresses.')
    .device('S1', 'S1#').command('show running-config', 'Confirm the learned sticky MAC addresses under F0/1 and F0/2.')
    .command('show port-security', 'Summarize enabled secure ports, limits and violation mode.')
    .command('show port-security address', 'Inspect learned secure MAC addresses.')
    .command('show port-security interface f0/2', 'Record secure-up, maximum 1 and restrict mode before the rogue test.')
    .section('Part 2 · Physical and security tests').task('Connect Rogue Laptop to an unused port', 'This is a cable action in the supplied lab, not a Config-tab configuration step.', 'The unused port is administratively down; no connectivity.')
    .config().iface('f0/3').command('no shutdown', 'Temporarily enable the chosen unused test port only if the rogue cable was placed on F0/3.').end()
    .device('Rogue Laptop', 'C:\\>').ping('10.10.10.10', 'On the temporarily enabled unsecured port, the rogue can reach PC1.')
    .device('S1', 'S1#').config().iface('f0/3').command('shutdown', 'Restore the unused-port shutdown after the temporary test.').end()
    .task('Replace PC2 with Rogue Laptop on F0/2', 'Keep PC2’s previously learned sticky MAC in place to test an unauthorized source.', 'The link can stay up in restrict mode; this does not mean rogue traffic is permitted.')
    .device('Rogue Laptop', 'C:\\>').ping('10.10.10.10', 'Fails: the rogue MAC is not the sticky PC2 MAC.')
    .device('S1', 'S1#').command('show port-security interface f0/2', 'Check that the violation counter increases while the secure port remains up.', undefined, 'Restrict mode drops unauthorized frames without error-disabling the port.')
    .task('Reconnect PC2 to F0/2', 'Restore the legitimate endpoint; no shutdown/no shutdown recovery is needed for restrict mode.', 'PC2 uses the original secure MAC.')
    .device('PC2', 'C:\\>').ping('10.10.10.10', 'Legitimate connectivity returns.')
    .device('S1', 'S1#').section('Additional exam habit · Save learned sticky entries').save()
    .finish(['F0/1/F0/2: static access, maximum 1, sticky, restrict.', 'Unused ports disabled again after testing.', 'Legitimate pings pass; rogue on secured port fails and increments counter.', 'Saved after legitimate sticky MAC learning.']);

  // Supplementary Lesson: Professor's VTY ACL Update (distinct from Ex 1–11; no invented Exercise 12)
  const supplementary = [];
  function supGuide(id, title, scope) {
    const g = {
      ex: id,
      title,
      scope,
      isSupplementary: true,
      revision: 2,
      source: 'Professor update + topology/terminal screenshots (ACL #10, masks, router IF IPs, and practice password are authored/inferred to reproduce observed PC1/PC2/PC3 Telnet behavior)',
      executionStatus: 'Authored practice reproduction; Packet Tracer guide: user-validated (automated PT run not captured).',
      topologyTable: [
        { device: 'R1 (Cisco 2811)', iface: 'Fa0/0 (toward SW1)', ip: '192.168.10.1 /24 (inferred from Telnet target)', status: 'Inferred / Authored' },
        { device: 'R1 (Cisco 2811)', iface: 'Fa0/1 (toward SW2)', ip: '192.168.11.1 /24 (inferred from Telnet target)', status: 'Inferred / Authored' },
        { device: 'PC1 (via SW1 2960)', iface: 'NIC', ip: '192.168.10.10 /24 (mask inferred)', gateway: '192.168.10.1 (authored)', status: 'Screenshot + Inferred mask' },
        { device: 'PC2 (via SW1 2960)', iface: 'NIC', ip: '192.168.10.20 /24 (mask inferred)', gateway: '192.168.10.1 (authored)', status: 'Screenshot + Inferred mask' },
        { device: 'PC3 (via SW2 2960)', iface: 'NIC', ip: '192.168.11.10 /24 (mask inferred)', gateway: '192.168.11.1 (authored)', status: 'Screenshot + Inferred mask' }
      ],
      steps: [],
      checklist: []
    };
    let device = '', prompt = '', section = '';
    const sb = {
      g,
      section(s) { section = s; return sb; },
      device(d, p) { device = d; prompt = p || `${d}>`; return sb; },
      command(command, why, next, expected, aliases) {
        g.steps.push({ device, section, kind: 'command', prompt, command, why,
          nextPrompt: next || prompt, expected: expected || `Return to ${next || prompt} without an IOS error.`,
          trouble: 'Check device, IOS mode, and whether you are using access-class (VTY) vs ip access-group (interface).', aliases: aliases || [] });
        prompt = next || prompt; return sb;
      },
      reply(command, why, next, expected, at) {
        g.steps.push({ device, section, kind: 'response', prompt: at || prompt, command, why, nextPrompt: next,
          expected: expected || `Continue to ${next}.`, trouble: 'This is an interactive login/save response, not an IOS command.' });
        prompt = next; return sb;
      },
      task(title, why, expected) {
        g.steps.push({ device, section, kind: 'task', prompt, command: title, why, expected,
          nextPrompt: prompt, trouble: 'Perform this baseline/verification check in Packet Tracer.' }); return sb;
      },
      finish(checklist) { g.checklist = checklist; supplementary.push(g); return g; }
    };
    return sb;
  }

  const sb = supGuide(
    'prof-vty-acl',
    'Professor Update: Control Device Access with VTY ACLs',
    'Authored reproduction of the screenshot demo: allow only PC1 (192.168.10.10) to Telnet to R1 using numbered standard ACL 10 + access-class 10 in, while denying PC2 and PC3 without blocking ordinary routed pings.'
  );
  sb.section('Part 1 · Prepare the isolated practice topology').device('R1', 'R1>')
    .task('Use an isolated practice copy with the pictured links and prepared PCs',
      'This is an authored reproduction, not a supplied Exercise 12. PC addressing and physical cable preparation are separate from IOS configuration.',
      'PC1/PC2 use /24 with gateway 192.168.10.1; PC3 uses /24 with gateway 192.168.11.1. Have endpoints prepared when the exam prohibits PC GUI setup. Use R1 console access; do not alter the original activities.')
    .command('enable', 'Enter privileged EXEC through the console (hostname text may differ on a fresh router).', 'R1#', undefined, ['en'])
    .command('show running-config', 'Inspect the practice copy before changes. Baseline assumes no existing VTY access-class or interface ACL blocks the test PCs.', 'R1#', 'Use a fresh practice configuration if unrelated ACLs or login policies are present; do not erase an original activity.')
    .command('show line', 'Identify all supported VTY lines. The numbered commands below illustrate 0–4; repeat the same settings on any additional supported VTY lines.')
    .section('Part 2 · Configure connectivity and login BEFORE baseline tests')
    .command('configure terminal', 'Enter global configuration mode.', 'R1(config)#', undefined, ['conf t'])
    .command('hostname R1', 'Use the router name from the screenshot.', 'R1(config)#');
  for (const [port, ip] of [['fa0/0', '192.168.10.1'], ['fa0/1', '192.168.11.1']]) {
    sb.command(`interface ${port}`, 'Select the authored LAN interface from the topology table.', 'R1(config-if)#')
      .command(`ip address ${ip} 255.255.255.0`, 'Set the authored router address and inferred /24 mask.')
      .command('no shutdown', 'Enable the connected LAN interface.')
      .command('exit', 'Return to global configuration.', 'R1(config)#');
  }
  sb.command('username admin secret cisco123', 'Create screenshot username admin with our chosen practice password; the professor’s actual password is hidden.')
    .command('line vty 0 4', 'Select VTY lines 0–4 for this authored example.', 'R1(config-line)#')
    .command('login local', 'Require username/password authentication using the local account database.')
    .command('transport input telnet', 'Enable Telnet for this isolated screenshot demonstration before testing it. Existing SSH exercises stay separate.')
    .command('end', 'Return to privileged EXEC.', 'R1#')
    .task('Apply the same login/transport block to any additional supported VTY lines', 'Use the actual ranges reported by show line; do not leave another range with different authentication or transport.', 'Every supported VTY line has login local and transport input telnet. No incoming VTY ACL has been applied yet.')
    .command('show ip interface brief', 'Verify both authored gateway interfaces before attempting remote login.', 'R1#', 'Fa0/0 = 192.168.10.1 and Fa0/1 = 192.168.11.1; both up/up.')
    .device('PC2', 'C:\\>').command('ping 192.168.11.10', 'Establish routed PC2→PC3 connectivity before the ACL so the later comparison is meaningful.', 'C:\\>', 'PC3 responds after ARP convergence. If not, check addressing, masks, gateways and link state first.');

  function loginTest(pc, target, keepOpen) {
    sb.device(pc, 'C:\\>').command(`telnet ${target}`, 'Open a NEW session. Compare the result with the current baseline or restricted policy.', 'Username:', 'Telnet opens and requests the local username.')
      .reply('admin', 'Use the screenshot username and our authored account.', 'Password:')
      .reply('cisco123', 'Enter the chosen practice password; password characters do not echo.', 'R1>', 'Authentication succeeds and the remote R1> prompt appears.');
    if (!keepOpen) sb.command('exit', 'Close the test session so it does not consume a VTY line.', 'C:\\>', 'Returned to the PC command prompt.');
  }
  sb.section('Part 3 · Confirm ALL clients can log in before filtering');
  for (const [pc, target] of [['PC1', '192.168.10.1'], ['PC2', '192.168.10.1'], ['PC3', '192.168.11.1']]) loginTest(pc, target, false);
  sb.section('Part 4 · Apply the host-only VTY ACL from the console').device('R1 console', 'R1#')
    .command('configure terminal', 'Use the independent console session to avoid locking out the setup session.', 'R1(config)#', undefined, ['conf t'])
    .command('access-list 10 permit host 192.168.10.10', 'Allow PC1 only. A subnet-wide permit would also allow PC2.')
    .command('access-list 10 deny any', 'Explicitly illustrate the final denial of every other source; implicit deny also exists.')
    .command('line vty 0 4', 'Select the example VTY lines again.', 'R1(config-line)#')
    .command('access-class 10 in', 'Filter incoming terminal sessions. This is separate from login local and transport input.')
    .command('end', 'Return to privileged EXEC.', 'R1#')
    .task('Apply access-class 10 in to any additional supported VTY lines', 'Repeat on every extra range found during setup, while retaining its login and transport settings.', 'All supported VTY lines have the same incoming source restriction. The example uses no interface ip access-group.')
    .command('show access-lists', 'Verify host 192.168.10.10 is permitted before deny any.')
    .command('show running-config', 'Check the effective ACL, local user, login, transport and incoming access-class on every VTY range.');
  sb.section('Part 5 · Test NEW sessions after filtering');
  loginTest('PC1', '192.168.10.1', true);
  sb.device('R1 console', 'R1#').command('show users', 'Now that PC1 is logged in, verify its active VTY session from the console.', 'R1#', 'An active remote session from PC1 appears; exact line numbers vary.')
    .device('PC1 remote session', 'R1>').command('exit', 'Close PC1’s successful session before testing another destination.', 'C:\\>');
  loginTest('PC1', '192.168.11.1', false);
  for (const [pc, target] of [['PC2', '192.168.10.1'], ['PC2', '192.168.11.1'], ['PC3', '192.168.11.1'], ['PC3', '192.168.10.1']]) {
    sb.device(pc, 'C:\\>').command(`telnet ${target}`, 'Open a new connection from a denied source to a reachable R1 address.', 'C:\\>', 'Connection is rejected; exact wording can vary. A refusal alone is not proof of an ACL fault: compare the successful pre-ACL baseline and show output.');
  }
  sb.device('PC2', 'C:\\>').command('ping 192.168.11.10', 'Compare with the earlier successful ping: a VTY ACL does not itself filter routed ICMP.', 'C:\\>', 'PC3 still responds; troubleshoot unrelated interface ACLs or addressing if it does not.')
    .section('Part 6 · Save from the console').device('R1 console', 'R1#')
    .command('copy running-config startup-config', 'Save the final verified configuration to NVRAM.', 'Destination filename [startup-config]?', undefined, ['copy run start'])
    .reply('', 'Press Enter to accept startup-config.', 'R1#', 'Building configuration… [OK].')
    .finish([
      'Prepared endpoint addresses, masks and default gateways; verified both router LAN interfaces up/up.',
      'PC1, PC2 and PC3 all authenticated before filtering; each baseline session was closed.',
      'ACL 10 permits host 192.168.10.10, then denies any; applied incoming access-class on every supported VTY line.',
      'Only PC1 opens new Telnet sessions to either R1 address; PC2/PC3 are rejected; routed pings still pass; saved.'
    ]);

  guides.supplementary = supplementary;
  return guides;
}));
