(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./cli-guide.js'));
  } else {
    root.CliTrainerModule = factory(root.CLI_GUIDE_UI);
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', () => {
        if (root.CLI_TRAINER_DATA) {
          root.cliApp = new root.CliTrainerModule.CliTrainerApp(root.CLI_TRAINER_DATA);
          root.cliApp.init();
        }
      });
    }
  }
}(typeof self !== 'undefined' ? self : this, function (guideUI) {
  'use strict';

  const STORAGE_KEY = 'ict304_cli_trainer_v1';

  function normalizeIfName(raw) {
    let s = String(raw || '').trim().toLowerCase();
    s = s.replace(/^range\s+/, '');
    s = s.replace(/\s*-\s*/g, '-');
    s = s.replace(/gigabitethernet/g, 'g').replace(/gi(?=\d)/g, 'g');
    s = s.replace(/fastethernet/g, 'f').replace(/fa(?=\d)/g, 'f');
    return s;
  }

  function normalizeSpaces(raw) {
    return String(raw || '').trim().replace(/\s+/g, ' ');
  }

  function isPromptLine(line) {
    return /^[A-Za-z0-9_-]+(?:\([a-z0-9-]+\))?[#>]\s*/i.test(line);
  }

  function isCopySaveCmd(low) {
    return (
      low === 'copy running-config startup-config' ||
      low === 'copy run start' ||
      low === 'wr' ||
      low === 'write' ||
      low === 'write memory'
    );
  }

  function matchesVerifyCmd(low, expectedCmd) {
    const exp = expectedCmd.toLowerCase();
    if (low === exp) return true;
    const aliases = {
      'show ip interface brief': ['sh ip int br', 'sh ip int brief', 'show ip int br'],
      'show vlan brief': ['sh vlan br', 'sh vl br', 'show vl br'],
      'show interfaces trunk': ['sh int trunk', 'sh int tr', 'show int tr'],
      'show ip ssh': ['sh ip ssh'],
      'show access-lists': ['sh access-lists', 'sh access-list', 'show access-list'],
      'show port-security': ['sh port-security', 'sh port-sec']
    };
    return (aliases[exp] || []).includes(low) || low.startsWith(exp + ' ');
  }

  function evaluateCliSubmission(submissionText, spec) {
    const lines = String(submissionText || '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const errors = [];
    const warnings = [];
    if (!lines.length) {
      return { passed: false, errors: ['No commands entered.'], warnings, state: {} };
    }

    let mode = 'user';
    let currentIf = null;
    let currentVlan = null;
    let currentAclName = null;
    let currentLine = null;
    let enteredEnable = false;

    const state = {
      hostname: null,
      enableSecret: null,
      bannerMotd: false,
      defaultGateway: null,
      domain: null,
      users: [],
      rsaKeygen: false,
      rsaKeygenBeforePrereqs: false,
      sshV2: false,
      lines: {},
      vlans: {},
      interfaces: {},
      aclRules: Array.isArray(spec.initialAclRules)
        ? spec.initialAclRules.map(r => ({ ...r }))
        : [],
      aclAttachments: [],
      verifyCmds: [],
      saved: false,
      dirtySinceSave: false
    };

    const ensureLine = (lineName) => {
      if (!state.lines[lineName]) {
        state.lines[lineName] = {
          password: null,
          loginLocal: false,
          loginPlain: false,
          transportInput: null
        };
      }
      return state.lines[lineName];
    };

    const ensureIf = (ifName) => {
      if (!state.interfaces[ifName]) {
        state.interfaces[ifName] = {
          ip: null,
          mask: null,
          noShutdown: false,
          accessMode: false,
          accessVlan: null,
          trunkMode: false,
          nativeVlan: null,
          allowedVlans: null,
          allowedOverwriteCount: 0,
          portSecurity: false,
          portSecBeforeAccess: false,
          maxMac: null,
          sticky: false,
          violation: null
        };
      }
      return state.interfaces[ifName];
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (isPromptLine(raw)) {
        errors.push(`Line ${i + 1}: "${raw}" includes a CLI prompt label (such as R1(config)#). Type only the command, not the prompt.`);
        continue;
      }

      const cmd = normalizeSpaces(raw);
      const low = cmd.toLowerCase();

      // Mode navigation
      if (low === 'enable' || low === 'en') {
        mode = 'priv';
        enteredEnable = true;
        continue;
      }
      if (low === 'configure terminal' || low === 'conf t') {
        if (mode === 'user' && spec.requireEnable) {
          errors.push(`Line ${i + 1}: Entered "configure terminal" from user EXEC without running "enable" first.`);
        }
        mode = 'config';
        continue;
      }
      if (low === 'end') {
        mode = 'priv';
        currentIf = null;
        currentVlan = null;
        currentAclName = null;
        currentLine = null;
        continue;
      }
      if (low === 'exit') {
        if (['config-if', 'config-line', 'config-vlan', 'config-std-nacl'].includes(mode)) {
          mode = 'config';
          currentIf = null;
          currentVlan = null;
          currentAclName = null;
          currentLine = null;
        } else if (mode === 'config') {
          mode = 'priv';
        }
        continue;
      }

      // RSA key size prompt response (e.g. "1024" or "2048")
      if (/^\d{3,4}$/.test(low) && state.rsaKeygen) {
        continue;
      }

      // Privileged EXEC verify / save commands
      if (low.startsWith('show ') || low.startsWith('sh ') || isCopySaveCmd(low)) {
        if (mode !== 'priv') {
          errors.push(`Line ${i + 1}: "${cmd}" was run in ${mode} mode instead of privileged EXEC (#). Run "end" first.`);
        } else {
          if (isCopySaveCmd(low)) {
            state.saved = true;
            state.dirtySinceSave = false;
          } else {
            state.verifyCmds.push(low);
          }
        }
        continue;
      }

      // Global config transitions
      const ifMatch = low.match(/^(?:interface|int)\s+(.+)$/);
      if (ifMatch) {
        if (mode !== 'config' && !mode.startsWith('config-')) {
          errors.push(`Line ${i + 1}: "${cmd}" requires global config mode ((config)#).`);
        } else {
          mode = 'config-if';
          currentIf = normalizeIfName(ifMatch[1]);
          currentLine = null;
          ensureIf(currentIf);
        }
        continue;
      }

      const lineMatch = low.match(/^line\s+vty\s+(\d+\s+\d+)$/);
      if (lineMatch) {
        if (mode !== 'config' && !mode.startsWith('config-')) {
          errors.push(`Line ${i + 1}: "${cmd}" requires global config mode.`);
        } else {
          mode = 'config-line';
          currentLine = `vty ${lineMatch[1]}`;
          currentIf = null;
          ensureLine(currentLine);
        }
        continue;
      }
      const conMatch = low.match(/^line\s+console\s+(\d+)$/);
      if (conMatch) {
        if (mode !== 'config' && !mode.startsWith('config-')) {
          errors.push(`Line ${i + 1}: "${cmd}" requires global config mode.`);
        } else {
          mode = 'config-line';
          currentLine = `console ${conMatch[1]}`;
          currentIf = null;
          ensureLine(currentLine);
        }
        continue;
      }

      const vlanMatch = low.match(/^vlan\s+(\d+)$/);
      if (vlanMatch) {
        if (mode !== 'config' && !mode.startsWith('config-')) {
          errors.push(`Line ${i + 1}: "${cmd}" requires global config mode.`);
        } else {
          mode = 'config-vlan';
          currentVlan = vlanMatch[1];
          if (!state.vlans[currentVlan]) state.vlans[currentVlan] = { name: null };
        }
        continue;
      }

      const naclMatch = cmd.match(/^ip\s+access-list\s+standard\s+(\S+)$/i);
      if (naclMatch) {
        if (mode !== 'config' && !mode.startsWith('config-')) {
          errors.push(`Line ${i + 1}: "${cmd}" requires global config mode.`);
        } else {
          mode = 'config-std-nacl';
          currentAclName = naclMatch[1];
        }
        continue;
      }

      // Config-vlan commands
      const nameMatch = cmd.match(/^name\s+(.+)$/i);
      if (nameMatch) {
        if (mode !== 'config-vlan' || !currentVlan) {
          errors.push(`Line ${i + 1}: "${cmd}" must be inside VLAN config mode ((config-vlan)#).`);
        } else {
          state.vlans[currentVlan].name = nameMatch[1].trim();
        }
        continue;
      }

      // Global config commands
      const hostMatch = cmd.match(/^hostname\s+(\S+)$/i);
      if (hostMatch) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "hostname" must be run in global config ((config)#).`);
        else { state.hostname = hostMatch[1]; state.dirtySinceSave = true; }
        continue;
      }

      const secMatch = cmd.match(/^enable\s+secret\s+(\S+)$/i);
      if (secMatch) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "enable secret" must be run in global config ((config)#).`);
        else { state.enableSecret = secMatch[1]; state.dirtySinceSave = true; }
        continue;
      }

      if (/^banner\s+motd\s+.+$/i.test(cmd)) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "banner motd" must be run in global config ((config)#).`);
        else { state.bannerMotd = true; state.dirtySinceSave = true; }
        continue;
      }

      if (low === 'service password-encryption' || /^security\s+passwords\s+min-length\s+\d+$/.test(low)) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "${cmd}" must be run in global config ((config)#).`);
        else state.dirtySinceSave = true;
        continue;
      }

      const gwMatch = low.match(/^ip\s+default-gateway\s+(\d+\.\d+\.\d+\.\d+)$/);
      if (gwMatch) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "ip default-gateway" must be run in global config ((config)#).`);
        else { state.defaultGateway = gwMatch[1]; state.dirtySinceSave = true; }
        continue;
      }

      const domMatch = cmd.match(/^ip\s+domain-name\s+(\S+)$/i);
      if (domMatch) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "ip domain-name" must be run in global config ((config)#).`);
        else { state.domain = domMatch[1]; state.dirtySinceSave = true; }
        continue;
      }

      const userMatch = cmd.match(/^username\s+(\S+)\s+(secret|password)\s+(\S+)$/i);
      if (userMatch) {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "username" must be run in global config ((config)#).`);
        else { state.users.push({ user: userMatch[1], type: userMatch[2].toLowerCase(), pass: userMatch[3] }); state.dirtySinceSave = true; }
        continue;
      }

      if (low === 'crypto key generate rsa') {
        if (mode !== 'config') {
          errors.push(`Line ${i + 1}: "crypto key generate rsa" must be run in global config ((config)#).`);
        } else {
          if (!state.hostname || !state.domain) state.rsaKeygenBeforePrereqs = true;
          state.rsaKeygen = true;
          state.dirtySinceSave = true;
        }
        continue;
      }

      if (low === 'ip ssh version 2') {
        if (mode !== 'config') errors.push(`Line ${i + 1}: "ip ssh version 2" must be run in global config ((config)#).`);
        else { state.sshV2 = true; state.dirtySinceSave = true; }
        continue;
      }

      // Line config commands (scoped to currentLine!)
      if (low === 'login local') {
        if (mode !== 'config-line' || !currentLine) errors.push(`Line ${i + 1}: "login local" must be inside line config mode ((config-line)#).`);
        else { ensureLine(currentLine).loginLocal = true; state.dirtySinceSave = true; }
        continue;
      }
      if (low === 'login') {
        if (mode !== 'config-line' || !currentLine) errors.push(`Line ${i + 1}: "login" must be inside line config mode ((config-line)#).`);
        else { ensureLine(currentLine).loginPlain = true; state.dirtySinceSave = true; }
        continue;
      }
      const linePwMatch = cmd.match(/^password\s+(\S+)$/i);
      if (linePwMatch) {
        if (mode !== 'config-line' || !currentLine) errors.push(`Line ${i + 1}: "password" must be inside line config mode ((config-line)#).`);
        else { ensureLine(currentLine).password = linePwMatch[1]; state.dirtySinceSave = true; }
        continue;
      }
      const transMatch = low.match(/^transport\s+input\s+(.+)$/);
      if (transMatch) {
        if (mode !== 'config-line' || !currentLine) errors.push(`Line ${i + 1}: "${cmd}" must be inside line config mode ((config-line)#).`);
        else { ensureLine(currentLine).transportInput = transMatch[1].trim(); state.dirtySinceSave = true; }
        continue;
      }

      // Interface config commands
      const ipMatch = low.match(/^ip\s+address\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)$/);
      if (ipMatch) {
        if (mode !== 'config-if' || !currentIf) {
          errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode ((config-if)#).`);
        } else {
          const iface = ensureIf(currentIf);
          iface.ip = ipMatch[1];
          iface.mask = ipMatch[2];
          if (ipMatch[2].startsWith('0.')) {
            errors.push(`Line ${i + 1}: "${ipMatch[2]}" looks like an ACL wildcard mask. "ip address" requires a subnet mask (e.g. 255.255.255.0).`);
          }
        }
        continue;
      }

      if (/^description\s+.+$/i.test(cmd)) {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "description" must be inside interface config mode.`);
        else state.dirtySinceSave = true;
        continue;
      }

      if (low === 'no shutdown' || low === 'no shut') {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "no shutdown" must be inside interface config mode.`);
        else { ensureIf(currentIf).noShutdown = true; state.dirtySinceSave = true; }
        continue;
      }

      if (low === 'shutdown' || low === 'shut') {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "shutdown" must be inside interface config mode.`);
        else { ensureIf(currentIf).noShutdown = false; state.dirtySinceSave = true; }
        continue;
      }

      if (low === 'switchport mode access') {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "switchport mode access" must be inside interface config mode.`);
        else ensureIf(currentIf).accessMode = true;
        continue;
      }

      const accVlanMatch = low.match(/^switchport\s+access\s+vlan\s+(\d+)$/);
      if (accVlanMatch) {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode.`);
        else ensureIf(currentIf).accessVlan = accVlanMatch[1];
        continue;
      }

      if (low === 'switchport mode trunk') {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "switchport mode trunk" must be inside interface config mode.`);
        else ensureIf(currentIf).trunkMode = true;
        continue;
      }

      const natVlanMatch = low.match(/^switchport\s+trunk\s+native\s+vlan\s+(\d+)$/);
      if (natVlanMatch) {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode.`);
        else ensureIf(currentIf).nativeVlan = natVlanMatch[1];
        continue;
      }

      const allowMatch = low.match(/^switchport\s+trunk\s+allowed\s+vlan\s+(.+)$/);
      if (allowMatch) {
        if (mode !== 'config-if' || !currentIf) {
          errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode.`);
        } else {
          const iface = ensureIf(currentIf);
          const val = allowMatch[1].trim();
          if (val.startsWith('add ')) {
            const added = val.slice(4).trim();
            iface.allowedVlans = iface.allowedVlans ? `${iface.allowedVlans},${added}` : added;
          } else {
            if (iface.allowedVlans !== null) iface.allowedOverwriteCount++;
            iface.allowedVlans = val;
          }
        }
        continue;
      }

      if (low === 'switchport port-security') {
        if (mode !== 'config-if' || !currentIf) {
          errors.push(`Line ${i + 1}: "switchport port-security" must be inside interface config mode.`);
        } else {
          const iface = ensureIf(currentIf);
          if (!iface.accessMode) iface.portSecBeforeAccess = true;
          iface.portSecurity = true;
        }
        continue;
      }

      const psMaxMatch = low.match(/^switchport\s+port-security\s+maximum\s+(\d+)$/);
      if (psMaxMatch) {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode.`);
        else ensureIf(currentIf).maxMac = psMaxMatch[1];
        continue;
      }

      if (low === 'switchport port-security mac-address sticky') {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode.`);
        else ensureIf(currentIf).sticky = true;
        continue;
      }

      const psViolMatch = low.match(/^switchport\s+port-security\s+violation\s+(protect|restrict|shutdown)$/);
      if (psViolMatch) {
        if (mode !== 'config-if' || !currentIf) errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode.`);
        else ensureIf(currentIf).violation = psViolMatch[1];
        continue;
      }

      // ACL rules & attachment
      const numAclMatch = low.match(/^access-list\s+(\d+)\s+(permit|deny)\s+(.+)$/);
      if (numAclMatch) {
        if (mode !== 'config') {
          errors.push(`Line ${i + 1}: Numbered ACL "${cmd}" must be entered in global config ((config)#), not ${mode}.`);
        } else {
          state.aclRules.push({ aclId: numAclMatch[1], action: numAclMatch[2], target: normalizeSpaces(numAclMatch[3]) });
        }
        continue;
      }

      const noSeqMatch = low.match(/^no\s+(\d+)$/);
      if (noSeqMatch && mode === 'config-std-nacl') {
        const seqNum = Number(noSeqMatch[1]);
        state.aclRules = state.aclRules.filter(r => !(r.aclId === currentAclName && r.seq === seqNum));
        state.dirtySinceSave = true;
        continue;
      }

      const namedRuleMatch = low.match(/^(?:(\d+)\s+)?(permit|deny)\s+(.+)$/);
      if (namedRuleMatch && mode === 'config-std-nacl') {
        const seqNum = namedRuleMatch[1] ? Number(namedRuleMatch[1]) : null;
        if (seqNum !== null) {
          state.aclRules = state.aclRules.filter(r => !(r.aclId === currentAclName && r.seq === seqNum));
        }
        state.aclRules.push({
          aclId: currentAclName,
          seq: seqNum,
          action: namedRuleMatch[2],
          target: normalizeSpaces(namedRuleMatch[3])
        });
        state.aclRules.sort((a, b) => (a.seq ?? 999999) - (b.seq ?? 999999));
        state.dirtySinceSave = true;
        continue;
      }

      const aclGrpMatch = cmd.match(/^ip\s+access-group\s+(\S+)\s+(in|out)$/i);
      if (aclGrpMatch) {
        if (mode !== 'config-if' || !currentIf) {
          errors.push(`Line ${i + 1}: "${cmd}" must be inside interface config mode ((config-if)#).`);
        } else {
          state.aclAttachments.push({ iface: currentIf, aclId: aclGrpMatch[1], direction: aclGrpMatch[2].toLowerCase() });
          state.dirtySinceSave = true;
        }
        continue;
      }

      // Reject any unrecognized or unsupported line rather than silently skipping it
      errors.push(`Line ${i + 1}: Unrecognized or unsupported IOS command "${cmd}" in ${mode} mode.`);
    }

    // Spec assertions
    if (spec.requireEnable && !enteredEnable) {
      warnings.push('Include "enable" from user EXEC (>) if starting from >.');
    }

    if (spec.requiredInterface) {
      const targetIf = normalizeIfName(spec.requiredInterface);
      const iface = state.interfaces[targetIf];
      if (!iface) {
        errors.push(`Missing configuration on required interface "${spec.requiredInterface}".`);
      } else {
        if (spec.requiredIp && iface.ip !== spec.requiredIp) {
          errors.push(`Expected IP ${spec.requiredIp} on ${spec.requiredInterface}, got ${iface.ip || 'none'}.`);
        }
        if (spec.requiredMask && iface.mask !== spec.requiredMask) {
          errors.push(`Expected subnet mask ${spec.requiredMask} on ${spec.requiredInterface}, got ${iface.mask || 'none'}.`);
        }
        if (spec.requireNoShutdown && !iface.noShutdown) {
          errors.push(`Missing "no shutdown" on ${spec.requiredInterface}; router interface remains administratively down.`);
        }
        if (spec.requireSwitchportAccess && !iface.accessMode) {
          errors.push(`Missing "switchport mode access" on ${spec.requiredInterface}.`);
        }
        if (spec.requiredAccessVlan && iface.accessVlan !== spec.requiredAccessVlan) {
          errors.push(`Expected "switchport access vlan ${spec.requiredAccessVlan}" on ${spec.requiredInterface}.`);
        }
        if (spec.requireTrunk && !iface.trunkMode) {
          errors.push(`Missing "switchport mode trunk" on ${spec.requiredInterface}.`);
        }
        if (spec.requiredNativeVlan && iface.nativeVlan !== spec.requiredNativeVlan) {
          errors.push(`Expected "switchport trunk native vlan ${spec.requiredNativeVlan}" on ${spec.requiredInterface}, got ${iface.nativeVlan || 'default'}.`);
        }
        if (spec.requiredAllowedVlans) {
          if (iface.allowedOverwriteCount > 0) {
            errors.push(`"switchport trunk allowed vlan" was reissued without "add", overwriting earlier allowed VLANs.`);
          }
          if (iface.allowedVlans !== spec.requiredAllowedVlans) {
            errors.push(`Expected allowed VLANs "${spec.requiredAllowedVlans}" on ${spec.requiredInterface}, got "${iface.allowedVlans || 'all'}".`);
          }
        }
        if (spec.requirePortSecurity) {
          if (!iface.portSecurity) errors.push(`Missing "switchport port-security" on ${spec.requiredInterface}.`);
          if (iface.portSecBeforeAccess) errors.push(`Set "switchport mode access" BEFORE "switchport port-security" on ${spec.requiredInterface}.`);
          if (spec.requiredMaxMac && iface.maxMac !== spec.requiredMaxMac) {
            errors.push(`Expected "switchport port-security maximum ${spec.requiredMaxMac}" on ${spec.requiredInterface}.`);
          }
          if (spec.requireSticky && !iface.sticky) {
            errors.push(`Missing "switchport port-security mac-address sticky" on ${spec.requiredInterface}.`);
          }
          if (spec.requiredViolation && iface.violation !== spec.requiredViolation) {
            errors.push(`Expected "switchport port-security violation ${spec.requiredViolation}" on ${spec.requiredInterface}.`);
          }
        }
      }
    }

    if (spec.requiredVlanId) {
      const v = state.vlans[spec.requiredVlanId];
      if (!v) {
        errors.push(`Missing VLAN ${spec.requiredVlanId} creation ("vlan ${spec.requiredVlanId}").`);
      } else if (spec.requiredVlanName && v.name !== spec.requiredVlanName) {
        errors.push(`Expected exact case-sensitive VLAN name "${spec.requiredVlanName}", got "${v.name || 'none'}".`);
      }
    }

    if (spec.requiredHostname && state.hostname !== spec.requiredHostname) {
      errors.push(`Expected "hostname ${spec.requiredHostname}", got "${state.hostname || 'none'}".`);
    }
    if (spec.requiredDomain && state.domain !== spec.requiredDomain) {
      errors.push(`Expected "ip domain-name ${spec.requiredDomain}", got "${state.domain || 'none'}".`);
    }
    if (spec.requiredUsername && !state.users.some(u => u.user === spec.requiredUsername && u.type === 'secret')) {
      errors.push(`Expected "username ${spec.requiredUsername} secret <password>".`);
    }
    if (spec.requireRsaKeygen) {
      if (!state.rsaKeygen) errors.push('Missing "crypto key generate rsa".');
      else if (state.rsaKeygenBeforePrereqs) errors.push('Set hostname and ip domain-name BEFORE running "crypto key generate rsa".');
    }
    if (spec.requireSshV2 && !state.sshV2) {
      errors.push('Missing "ip ssh version 2".');
    }
    if (spec.requireEnableSecret && !state.enableSecret) {
      errors.push('Missing "enable secret <password>" in global config.');
    }
    if (spec.requireBanner && !state.bannerMotd) {
      errors.push('Missing "banner motd #<message>#" in global config.');
    }
    if (spec.requireConsoleLogin) {
      const con = state.lines['console 0'];
      if (!con || !con.password || (!con.loginPlain && !con.loginLocal)) {
        errors.push('Missing console 0 password and login ("line console 0 -> password <pw> -> login").');
      }
    }
    if (spec.requiredVtyRange) {
      const vtyKey = `vty ${spec.requiredVtyRange}`;
      const vty = state.lines[vtyKey];
      if (!vty) {
        errors.push(`Expected "line ${vtyKey}", but that VTY range was not configured.`);
      } else {
        if (spec.requireLoginLocal && !vty.loginLocal) {
          errors.push(vty.loginPlain
            ? `Used "login" (line password) instead of "login local" on line ${vtyKey}.`
            : `Missing "login local" on line ${vtyKey} (settings on console 0 do not apply to VTY).`);
        }
        if (spec.requireTransportSsh && vty.transportInput !== 'ssh') {
          errors.push(`Expected "transport input ssh" on line ${vtyKey} (no Telnet), got "${vty.transportInput || 'default'}".`);
        }
      }
    }

    if (spec.orderedAclRules) {
      for (const r of state.aclRules) {
        if (/255\.255\.\d+\.\d+/.test(r.target)) {
          errors.push(`ACL rule "${r.action} ${r.target}" uses a subnet mask instead of a wildcard mask (e.g. 0.0.0.255 for /24).`);
        }
      }
      const matchingRules = state.aclRules.filter(r => r.aclId === spec.aclId);
      if (matchingRules.length < spec.orderedAclRules.length) {
        errors.push(`Expected ${spec.orderedAclRules.length} ordered ACL rules for ACL "${spec.aclId}", found ${matchingRules.length}.`);
      } else {
        for (let idx = 0; idx < spec.orderedAclRules.length; idx++) {
          const exp = spec.orderedAclRules[idx];
          const got = matchingRules[idx];
          if (!got || got.action !== exp.action || got.target !== exp.target) {
            errors.push(`ACL rule #${idx + 1} order/policy mismatch: expected "${exp.action} ${exp.target}", got "${got ? `${got.action} ${got.target}` : 'none'}".`);
          }
        }
      }
      if (spec.requiredAclDirection) {
        const targetIf = normalizeIfName(spec.requiredInterface);
        const att = state.aclAttachments.find(a => a.iface === targetIf && a.aclId === spec.aclId);
        if (!att) {
          errors.push(`ACL "${spec.aclId}" was not attached to ${spec.requiredInterface} with "ip access-group ${spec.aclId} ${spec.requiredAclDirection}".`);
        } else if (att.direction !== spec.requiredAclDirection) {
          errors.push(`Wrong ACL direction on ${spec.requiredInterface}: expected "${spec.requiredAclDirection}", got "${att.direction}".`);
        }
      }
    }

    if (spec.requireVerifyCmds) {
      for (const vc of spec.requireVerifyCmds) {
        if (!state.verifyCmds.some(c => matchesVerifyCmd(c, vc))) {
          errors.push(`Missing required verification command in # mode: "${vc}".`);
        }
      }
    }
    if (spec.requireSave) {
      if (!state.saved) {
        errors.push('Missing "copy running-config startup-config" in privileged EXEC (#) to save configuration.');
      } else if (state.dirtySinceSave) {
        errors.push('Configuration was modified after the last "copy running-config startup-config". Save again after your final change.');
      }
    }

    return { passed: errors.length === 0, errors, warnings, state };
  }

  class CliTrainerApp {
    constructor(data) {
      this.data = data;
      this.activePatternId = data.PATTERNS[0].id;
      this.activeMode = 'guide';
      this.useVariant = false;
      this.scenarioIndex = 0;
      this.state = this.loadState();
      this.activeExercise = this.state.lastGuide || 1;
    }

    loadState() {
      const def = {
        exposure: {},
        evidence: {},
        firstPass: {},
        attempts: {},
        verified: {},
        mistakes: [],
        realPt: {},
        walkthroughs: {},
        lastGuide: 1
      };
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return def;
        const parsed = JSON.parse(raw);
        return {
          exposure: parsed.exposure || {},
          evidence: parsed.evidence || {},
          firstPass: parsed.firstPass || {},
          attempts: parsed.attempts || {},
          verified: parsed.verified || {},
          mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
          realPt: parsed.realPt || {},
          walkthroughs: parsed.walkthroughs || {},
          lastGuide: Number(parsed.lastGuide) || 1
        };
      } catch (_) {
        return def;
      }
    }

    saveState() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
      } catch (_) {}
    }

    getActivePattern() {
      return this.data.PATTERNS.find(p => p.id === this.activePatternId) || this.data.PATTERNS[0];
    }

    getScenarios(pattern) {
      const p = pattern || this.getActivePattern();
      return [p.workedExample, p.variant, ...(p.extraScenarios || [])];
    }

    getActiveScenario() {
      const list = this.getScenarios(this.getActivePattern());
      if (this.useVariant && this.scenarioIndex === 0) return list[1];
      return list[this.scenarioIndex % list.length];
    }

    scenarioKey(patternId, scenarioId, mode) {
      return `${patternId}:${scenarioId}:${mode}`;
    }

    markExposed(key, kind) {
      if (!this.state.exposure[key]) this.state.exposure[key] = {};
      this.state.exposure[key][kind] = true;
      this.saveState();
    }

    isExposed(key) {
      const e = this.state.exposure[key] || {};
      return Boolean(e.hintUsed || e.solutionRevealed || e.wrongAttempted);
    }

    recordOutcome(key, passed, verifyDone) {
      this.state.attempts[key] = (this.state.attempts[key] || 0) + 1;
      const prior = this.state.evidence[key];
      let outcome;
      if (!passed) {
        this.markExposed(key, 'wrongAttempted');
        outcome = prior === 'independent' ? 'independent' : (prior === 'helped' ? 'helped' : 'attempted');
      } else if (prior === 'independent') {
        outcome = 'independent'; // already credited once
      } else if (this.isExposed(key) || prior === 'helped' || prior === 'attempted') {
        outcome = 'helped';
      } else {
        outcome = 'independent';
      }
      this.state.evidence[key] = outcome;
      if (!this.state.firstPass[key]) {
        this.state.firstPass[key] = outcome;
      }
      if (passed && verifyDone) {
        this.state.verified[key] = true;
      }
      this.saveState();
      return outcome;
    }

    setRealPtStatus(exNum, status, note) {
      const allowed = ['untested_in_pt', 'practised_with_help', 'passed_independently_in_pt'];
      if (!allowed.includes(status)) return;
      this.state.realPt[String(exNum)] = {
        status,
        note: String(note || '').trim(),
        updatedAt: new Date().toISOString().slice(0, 10)
      };
      this.saveState();
    }

    addMistake(patternId, symptom, cause, check, fix) {
      if (!symptom || !cause) return false;
      this.state.mistakes.unshift({
        id: `m_${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        patternId,
        symptom: symptom.trim(),
        cause: cause.trim(),
        check: (check || '').trim(),
        fix: (fix || '').trim()
      });
      this.saveState();
      return true;
    }

    clearProgress() {
      this.state = {
        exposure: {},
        evidence: {},
        firstPass: {},
        attempts: {},
        verified: {},
        mistakes: [],
        realPt: {},
        walkthroughs: {},
        lastGuide: 1
      };
      this.saveState();
    }

    evaluateConfigureInput(text) {
      const p = this.getActivePattern();
      const sc = this.getActiveScenario();
      const key = this.scenarioKey(p.id, sc.id, 'configure');
      const prior = this.state.evidence[key];
      const res = evaluateCliSubmission(text, sc.spec);
      const verifyDone = Boolean(res.state.verifyCmds && res.state.verifyCmds.length > 0);
      const outcome = this.recordOutcome(key, res.passed, verifyDone);
      return {
        ...res,
        key,
        outcome,
        alreadyCredited: res.passed && prior === 'independent'
      };
    }

    evaluateTroubleshootChoice(selectedIndex) {
      const p = this.getActivePattern();
      const key = this.scenarioKey(p.id, p.id, 'troubleshoot');
      const prior = this.state.evidence[key];
      const passed = Number(selectedIndex) === p.troubleshoot.correctIndex;
      const outcome = this.recordOutcome(key, passed, passed);
      return {
        passed,
        outcome,
        alreadyCredited: passed && prior === 'independent',
        explanation: p.troubleshoot.explanation
      };
    }

    // Browser UI binding (only runs when DOM elements exist)
    init() {
      this.renderAll();
      this.bindEvents();
    }

    esc(s) {
      return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    bindEvents() {
      const modeTabs = document.querySelectorAll('[data-cli-mode]');
      modeTabs.forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeMode = btn.getAttribute('data-cli-mode');
          this.renderAll();
        });
      });

      const resetBtn = document.getElementById('cli-reset-progress');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.clearProgress();
          this.renderAll();
        });
      }
    }

    renderAll() {
      this.renderStats();
      this.renderPatternNav();
      this.renderModeTabs();
      this.renderWorkspace();
    }

    renderStats() {
      const el = document.getElementById('cli-stats-bar');
      if (!el) return;
      const indCount = Object.values(this.state.evidence).filter(v => v === 'independent').length;
      const helpedCount = Object.values(this.state.evidence).filter(v => v === 'helped').length;
      const ptPassed = Object.values(this.state.realPt).filter(v => v.status === 'passed_independently_in_pt').length;
      el.innerHTML = `
        <span class="badge ok">${indCount} independent web checks</span>
        <span class="badge warn">${helpedCount} assisted web checks</span>
        <span class="badge info">${ptPassed} / 11 real Packet Tracer passed (self-reported)</span>
        <span class="badge">${this.state.mistakes.length} logged mistakes</span>
      `;
    }

    renderPatternNav() {
      const nav = document.getElementById('cli-pattern-nav');
      if (!nav) return;
      nav.hidden = this.activeMode === 'guide';
      nav.innerHTML = this.data.PATTERNS.map(p => {
        const active = p.id === this.activePatternId ? 'active' : '';
        return `<button type="button" class="pill-btn ${active}" data-pattern-id="${p.id}">
          <strong>P${p.number}</strong> ${this.esc(p.title)} <span class="mini">Ex ${p.activities.join(', ')}</span>
        </button>`;
      }).join('');
      nav.querySelectorAll('[data-pattern-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activePatternId = btn.getAttribute('data-pattern-id');
          this.useVariant = false;
          this.scenarioIndex = 0;
          this.renderAll();
        });
      });
    }

    renderModeTabs() {
      document.querySelectorAll('[data-cli-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cli-mode') === this.activeMode);
      });
    }

    renderWorkspace() {
      const host = document.getElementById('cli-workspace');
      if (!host) return;
      if (this.activeMode === 'guide') { this.renderGuide(host); return; }
      const p = this.getActivePattern();
      const sc = this.getActiveScenario();

      if (this.activeMode === 'index') {
        host.innerHTML = this.renderActivityIndex();
        this.bindIndexEvents(host);
        return;
      }
      if (this.activeMode === 'worksheets') {
        host.innerHTML = this.renderWorksheets();
        this.bindWorksheetEvents(host);
        return;
      }

      const list = this.getScenarios(p);
      const variantBanner = `
        <div class="scenario-bar">
          <div>
            <span class="badge ${sc.isVariant ? 'warn' : 'info'}">${this.esc(sc.label)}</span>
            <span class="mini">Pattern ${p.number} · Exercises ${p.activities.join(', ')} (${(this.scenarioIndex % list.length) + 1}/${list.length})</span>
          </div>
          <button type="button" id="cli-toggle-variant" class="button small">
            Next Scenario (${list.length} available) →
          </button>
        </div>
      `;

      let body = '';
      if (this.activeMode === 'learn') body = this.renderLearn(p, sc);
      else if (this.activeMode === 'recall') body = this.renderRecall(p, sc);
      else if (this.activeMode === 'configure') body = this.renderConfigure(p, sc);
      else if (this.activeMode === 'troubleshoot') body = this.renderTroubleshoot(p);

      host.innerHTML = variantBanner + body + this.renderMistakeLogger(p);
      const toggleBtn = document.getElementById('cli-toggle-variant');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.scenarioIndex = (this.scenarioIndex + 1) % list.length;
          this.useVariant = this.scenarioIndex > 0;
          this.renderAll();
        });
      }
      this.bindModeEvents(p, sc);
    }

    renderLearn(p, sc) {
      return `
        <div class="card">
          <h3>Pattern ${p.number}: ${this.esc(p.title)}</h3>
          <p><strong>Goal:</strong> ${this.esc(p.goal)}</p>
          <p class="cue"><strong>Memory cue:</strong> ${this.esc(p.memoryCue)}</p>
          ${p.nonCliFlags.length ? `<div class="notice warn"><strong>Non-CLI / Scope Notes:</strong><ul>${p.nonCliFlags.map(n => `<li>${this.esc(n)}</li>`).join('')}</ul></div>` : ''}
          <h4>Required Values Table</h4>
          <div class="table-wrap"><table><thead><tr><th>Parameter</th><th>Meaning</th><th>Example</th></tr></thead>
            <tbody>${p.requiredValues.map(r => `<tr><td><strong>${this.esc(r.param)}</strong></td><td>${this.esc(r.meaning)}</td><td><code>${this.esc(r.example)}</code></td></tr>`).join('')}</tbody>
          </table></div>
          <h4>Command Blocks &amp; IOS Modes</h4>
          ${p.commandBlocks.map(b => `
            <div class="cmd-block">
              <div class="cmd-head"><strong>${this.esc(b.mode)}</strong> <code>${this.esc(b.prompt)}</code></div>
              <ul>${b.commands.map(c => `<li><code>${this.esc(c.cmd)}</code> — ${this.esc(c.why)}</li>`).join('')}</ul>
              <p class="verify-line"><strong>Verify:</strong> <code>${this.esc(b.verify.cmd)}</code> → ${this.esc(b.verify.expected)}</p>
            </div>
          `).join('')}
          <h4>Common Errors</h4>
          <div class="table-wrap"><table><thead><tr><th>Mistake</th><th>Symptom</th><th>Check</th><th>Fix</th></tr></thead>
            <tbody>${p.commonErrors.map(e => `<tr><td>${this.esc(e.mistake)}</td><td>${this.esc(e.symptom)}</td><td><code>${this.esc(e.check)}</code></td><td><code>${this.esc(e.fix)}</code></td></tr>`).join('')}</tbody>
          </table></div>
          <h4>${this.esc(sc.label)}</h4>
          <p>${this.esc(sc.promptText)}</p>
          <pre class="ios-pre">${this.esc(sc.solution.join('\n'))}</pre>
        </div>
      `;
    }

    renderRecall(p, sc) {
      const key = this.scenarioKey(p.id, sc.id, 'recall');
      const status = this.state.evidence[key] || 'unattempted';
      return `
        <div class="card">
          <h3>Step 2 · Recall Hidden Commands (${this.esc(sc.label)})</h3>
          <p>${this.esc(sc.promptText)}</p>
          <p class="mini">Status: <strong>${this.esc(status)}</strong> · Fill each command without typing the prompt label.</p>
          <div id="recall-blanks" class="recall-list">
            ${sc.recallBlanks.map((b, idx) => `
              <div class="recall-row">
                <label for="recall-in-${idx}"><code>${this.esc(b.prompt)}</code></label>
                <input id="recall-in-${idx}" type="text" class="cli-input" data-idx="${idx}" placeholder="Type IOS command..." autocomplete="off" spellcheck="false" />
                <button type="button" class="button small recall-hint-btn" data-idx="${idx}">Hint</button>
                <span class="mini hint-text" id="recall-hint-${idx}" hidden>${this.esc(b.hint)}</span>
              </div>
            `).join('')}
          </div>
          <div class="btn-row">
            <button type="button" id="recall-check-btn" class="button primary">Check Recall</button>
            <button type="button" id="recall-reveal-btn" class="button">Reveal Answers (Marks Helped)</button>
          </div>
          <div id="recall-feedback" class="feedback"></div>
        </div>
      `;
    }

    renderConfigure(p, sc) {
      const key = this.scenarioKey(p.id, sc.id, 'configure');
      const status = this.state.evidence[key] || 'unattempted';
      return `
        <div class="card">
          <h3>Step 3 · Configure from Requirements (${this.esc(sc.label)})</h3>
          <p>${this.esc(sc.promptText)}</p>
          <p class="mini">Follow <strong>Read → Inspect → Configure → Verify → Save</strong>. Do not include prompt labels like <code>R1(config)#</code>. Status: <strong>${this.esc(status)}</strong></p>
          <textarea id="cli-config-input" rows="11" class="cli-textarea" spellcheck="false" placeholder="enable&#10;configure terminal&#10;..."></textarea>
          <div class="btn-row">
            <button type="button" id="cli-config-check" class="button primary">Check Configuration</button>
            <button type="button" id="cli-config-hint" class="button">Show Memory Cue</button>
            <button type="button" id="cli-config-solution" class="button">Show Solution (Marks Helped)</button>
          </div>
          <div id="cli-config-hint-box" class="notice info" hidden><strong>Cue:</strong> ${this.esc(p.memoryCue)}</div>
          <div id="cli-config-feedback" class="feedback"></div>
        </div>
      `;
    }

    renderTroubleshoot(p) {
      const ts = p.troubleshoot;
      const key = this.scenarioKey(p.id, p.id, 'troubleshoot');
      const status = this.state.evidence[key] || 'unattempted';
      return `
        <div class="card">
          <h3>Step 4 · Troubleshoot Simulated CLI Output</h3>
          <div class="notice warn"><strong>Website-authored simulated output</strong> (not live Packet Tracer execution). Status: <strong>${this.esc(status)}</strong></div>
          <pre class="ios-pre">${this.esc(ts.output)}</pre>
          <p><strong>${this.esc(ts.question)}</strong></p>
          <div class="ts-options">
            ${ts.options.map((opt, idx) => `
              <button type="button" class="ts-opt-btn" data-ts-idx="${idx}">${String.fromCharCode(65 + idx)}. ${this.esc(opt)}</button>
            `).join('')}
          </div>
          <div id="ts-feedback" class="feedback"></div>
        </div>
      `;
    }

    renderActivityIndex() {
      const rows = this.data.ACTIVITIES.map(a => {
        const pt = this.state.realPt[String(a.ex)] || { status: 'untested_in_pt', note: '' };
        const badgeClass = a.sourceStatus === 'reviewed' ? 'ok' : (a.sourceStatus === 'partial' ? 'warn' : '');
        const badgeLabel = a.sourceStatus === 'reviewed' ? 'Full PT instructions read' : (a.sourceStatus === 'partial' ? 'Partial PT instructions read' : 'Inventoried by filename only');
        return `
          <tr>
            <td><strong>Ex ${a.ex}</strong></td>
            <td><code>${this.esc(a.filename)}</code><br><span class="mini">${this.esc(a.notes)}</span>
              ${a.nonCliFlags.length ? `<div class="mini flag-note">⚠ ${this.esc(a.nonCliFlags.join(' '))}</div>` : ''}
            </td>
            <td><span class="badge ${badgeClass}">${badgeLabel}</span><br><span class="mini">${this.esc(a.sourceDetail)}</span></td>
            <td>
              <select class="pt-status-select" data-ex="${a.ex}">
                <option value="untested_in_pt" ${pt.status === 'untested_in_pt' ? 'selected' : ''}>Not yet run in PT</option>
                <option value="practised_with_help" ${pt.status === 'practised_with_help' ? 'selected' : ''}>PT practised with help</option>
                <option value="passed_independently_in_pt" ${pt.status === 'passed_independently_in_pt' ? 'selected' : ''}>Passed independently in PT</option>
              </select>
            </td>
          </tr>
        `;
      }).join('');
      return `
        <div class="card">
          <h3>11-Activity Coverage &amp; Packet Tracer Execution Index</h3>
          <div class="notice info">
            <strong>Honest Source Status:</strong> ${this.esc(this.data.SOURCE_META.reviewedNote)}<br>
            <strong>Pending Gaps:</strong> ${this.esc(this.data.SOURCE_META.pendingNote)}
          </div>
          <div class="table-wrap"><table>
            <thead><tr><th>#</th><th>Activity File &amp; Non-CLI Flags</th><th>Source Review Status</th><th>Real PT Attempt (Self-Reported)</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
      `;
    }

    renderWorksheets() {
      return `
        <div class="card">
          <div class="scenario-bar">
            <h3>Printable Multi-Page Practice Worksheets</h3>
            <button type="button" id="cli-print-worksheets" class="button primary">Print Worksheets ↗</button>
          </div>
          <p class="mini">These practice worksheets are multi-page study sheets (separate from the single-page A4 exam cheat sheet). Complete each pattern using the 5-step memory routine.</p>
          ${this.data.PATTERNS.map(p => `
            <div class="worksheet-block">
              <h4>Pattern ${p.number}: ${this.esc(p.title)} (Ex ${p.activities.join(', ')})</h4>
              <p><strong>Task A (Local):</strong> ${this.esc(p.workedExample.promptText)}</p>
              <p><strong>Task B (Variant):</strong> ${this.esc(p.variant.promptText)}</p>
              <div class="write-box">Write IOS commands (with mode transitions &amp; verification):</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    renderMistakeLogger(p) {
      const items = this.state.mistakes.slice(0, 6).map(m => `
        <li><strong>[${this.esc(m.date)}]</strong> ${this.esc(m.symptom)} → <em>Cause:</em> ${this.esc(m.cause)} ${m.check ? `| <code>${this.esc(m.check)}</code>` : ''} ${m.fix ? `| <em>Fix:</em> ${this.esc(m.fix)}` : ''}</li>
      `).join('');
      return `
        <div class="card mistake-card">
          <h4>Step 5 · Mistake Log (Symptom → Cause → Check → Fix)</h4>
          <div class="mistake-grid">
            <input id="mk-symptom" type="text" placeholder="Symptom (e.g. ping fails)" />
            <input id="mk-cause" type="text" placeholder="Cause (e.g. forgot no shutdown)" />
            <input id="mk-check" type="text" placeholder="Verify cmd (e.g. show ip int br)" />
            <input id="mk-fix" type="text" placeholder="Fix (e.g. int g0/0 -> no shut)" />
          </div>
          <button type="button" id="mk-add-btn" class="button small">Log Mistake</button>
          <ul class="mini">${items || '<li>No mistakes logged yet.</li>'}</ul>
        </div>
      `;
    }

    bindIndexEvents(host) {
      host.querySelectorAll('.pt-status-select').forEach(sel => {
        sel.addEventListener('change', () => {
          this.setRealPtStatus(sel.getAttribute('data-ex'), sel.value, '');
          this.renderStats();
        });
      });
    }

    bindWorksheetEvents() {
      const btn = document.getElementById('cli-print-worksheets');
      if (btn && typeof window !== 'undefined' && window.print) {
        btn.addEventListener('click', () => window.print());
      }
    }

    bindModeEvents(p, sc) {
      const mkBtn = document.getElementById('mk-add-btn');
      if (mkBtn) {
        mkBtn.addEventListener('click', () => {
          const s = document.getElementById('mk-symptom').value;
          const c = document.getElementById('mk-cause').value;
          const chk = document.getElementById('mk-check').value;
          const f = document.getElementById('mk-fix').value;
          if (this.addMistake(p.id, s, c, chk, f)) this.renderAll();
        });
      }

      if (this.activeMode === 'recall') {
        const key = this.scenarioKey(p.id, sc.id, 'recall');
        document.querySelectorAll('.recall-hint-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            this.markExposed(key, 'hintUsed');
            const h = document.getElementById(`recall-hint-${btn.getAttribute('data-idx')}`);
            if (h) h.hidden = false;
          });
        });
        const checkBtn = document.getElementById('recall-check-btn');
        if (checkBtn) {
          checkBtn.addEventListener('click', () => {
            let allOk = true;
            sc.recallBlanks.forEach((b, idx) => {
              const inp = document.getElementById(`recall-in-${idx}`);
              const val = normalizeSpaces(inp ? inp.value : '');
              const ok = val === b.answer;
              if (!ok) allOk = false;
              if (inp) inp.style.borderColor = ok ? '#10b981' : '#ef4444';
            });
            const prior = this.state.evidence[key];
            const outcome = this.recordOutcome(key, allOk, allOk);
            const fb = document.getElementById('recall-feedback');
            if (fb) {
              fb.className = `feedback ${allOk ? 'ok' : 'err'}`;
              fb.textContent = allOk
                ? (prior === 'independent' ? 'All blanks match! (Already credited for this scenario.)' : `All blanks match! Recorded as ${outcome}.`)
                : 'Some commands do not match exact syntax/case. Check highlighted boxes.';
            }
            this.renderStats();
          });
        }
        const revBtn = document.getElementById('recall-reveal-btn');
        if (revBtn) {
          revBtn.addEventListener('click', () => {
            this.markExposed(key, 'solutionRevealed');
            sc.recallBlanks.forEach((b, idx) => {
              const inp = document.getElementById(`recall-in-${idx}`);
              if (inp) inp.value = b.answer;
            });
            const fb = document.getElementById('recall-feedback');
            if (fb) {
              fb.className = 'feedback warn';
              fb.textContent = 'Answers revealed (this scenario is now marked assisted/helped).';
            }
          });
        }
      }

      if (this.activeMode === 'configure') {
        const key = this.scenarioKey(p.id, sc.id, 'configure');
        const hBtn = document.getElementById('cli-config-hint');
        if (hBtn) {
          hBtn.addEventListener('click', () => {
            this.markExposed(key, 'hintUsed');
            const box = document.getElementById('cli-config-hint-box');
            if (box) box.hidden = false;
          });
        }
        const sBtn = document.getElementById('cli-config-solution');
        if (sBtn) {
          sBtn.addEventListener('click', () => {
            this.markExposed(key, 'solutionRevealed');
            const ta = document.getElementById('cli-config-input');
            if (ta) ta.value = sc.solution.join('\n');
            const fb = document.getElementById('cli-config-feedback');
            if (fb) {
              fb.className = 'feedback warn';
              fb.textContent = 'Solution loaded (marked assisted/helped; switch to Variant for fresh independent credit).';
            }
          });
        }
        const cBtn = document.getElementById('cli-config-check');
        if (cBtn) {
          cBtn.addEventListener('click', () => {
            const ta = document.getElementById('cli-config-input');
            const res = this.evaluateConfigureInput(ta ? ta.value : '');
            const fb = document.getElementById('cli-config-feedback');
            if (fb) {
              fb.className = `feedback ${res.passed ? 'ok' : 'err'}`;
              fb.innerHTML = res.passed
                ? `<strong>✓ Configuration verified (${this.esc(res.outcome)}).</strong>${res.alreadyCredited ? ' Already credited once for this scenario.' : ''}`
                : `<strong>✗ Needs fixes:</strong><ul>${res.errors.map(e => `<li>${this.esc(e)}</li>`).join('')}</ul>`;
            }
            this.renderStats();
          });
        }
      }

      if (this.activeMode === 'troubleshoot') {
        document.querySelectorAll('.ts-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const res = this.evaluateTroubleshootChoice(btn.getAttribute('data-ts-idx'));
            const fb = document.getElementById('ts-feedback');
            if (fb) {
              fb.className = `feedback ${res.passed ? 'ok' : 'err'}`;
              fb.innerHTML = `<strong>${res.passed ? '✓ Correct' : '✗ Incorrect'} (${this.esc(res.outcome)}):</strong> ${this.esc(res.explanation)}`;
            }
            this.renderStats();
          });
        });
      }
    }
  }

  guideUI.install(CliTrainerApp);

  return {
    STORAGE_KEY,
    normalizeIfName,
    evaluateCliSubmission,
    CliTrainerApp
  };
}));
