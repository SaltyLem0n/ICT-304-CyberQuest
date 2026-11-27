const assert = require('assert');
const data = require('../cli-trainer-data.js');
const { evaluateCliSubmission, CliTrainerApp } = require('../cli-trainer.js');

let checks = 0;
function ok(cond, msg) {
  assert(cond, msg);
  checks++;
}

// 1. Data & honest source-status inventory checks
ok(Array.isArray(data.ACTIVITIES) && data.ACTIVITIES.length === 11, 'All 11 .pka activities inventoried');
ok(data.ACTIVITIES.filter(a => a.sourceStatus === 'reviewed').length === 11, 'All student-visible instructions reviewed');
ok(data.ACTIVITIES.filter(a => a.sourceStatus === 'partial').length === 0, 'No partial source reviews remain');
ok(data.ACTIVITIES.filter(a => a.sourceStatus === 'filename_only').length === 0, 'No filename-only source reviews remain');
ok(Array.isArray(data.PATTERNS) && data.PATTERNS.length === 6, 'All 6 reusable patterns defined');
ok(data.MEMORY_ROUTINE.length === 5 && data.DEVICE_WORKFLOW.length === 5, '5-step memory routine and 5-step workflow defined');

// 2. All 6 worked examples and all 6 coherent variants pass semantic evaluation
for (const p of data.PATTERNS) {
  const wRes = evaluateCliSubmission(p.workedExample.solution.join('\n'), p.workedExample.spec);
  ok(wRes.passed, `Pattern ${p.number} worked example passes (${wRes.errors.join('; ')})`);
  const vRes = evaluateCliSubmission(p.variant.solution.join('\n'), p.variant.spec);
  ok(vRes.passed, `Pattern ${p.number} variant passes (${vRes.errors.join('; ')})`);
  ok(p.variant.isVariant === true && p.variant.id !== p.workedExample.id, `Pattern ${p.number} has distinct labeled variant`);
}

// 3. Semantic error checks: prompt prefix, wrong mode, wrong interface, missing no shutdown
const p1 = data.PATTERNS[0];
ok(!evaluateCliSubmission('R1(config)# interface g0/0\nip address 192.168.10.1 255.255.255.0', p1.workedExample.spec).passed, 'Rejects typed prompt prefix');
ok(!evaluateCliSubmission('enable\nconfigure terminal\nip address 192.168.10.1 255.255.255.0\nno shutdown\nend\nshow ip interface brief\ncopy running-config startup-config', p1.workedExample.spec).passed, 'Rejects ip address in global config instead of config-if');
ok(!evaluateCliSubmission('enable\nconfigure terminal\ninterface g0/1\nip address 192.168.10.1 255.255.255.0\nno shutdown\nend\nshow ip interface brief\ncopy running-config startup-config', p1.workedExample.spec).passed, 'Rejects wrong interface g0/1 when g0/0 required');
ok(!evaluateCliSubmission('enable\nconfigure terminal\ninterface g0/0\nip address 192.168.10.1 255.255.255.0\nend\nshow ip interface brief\ncopy running-config startup-config', p1.workedExample.spec).passed, 'Rejects missing no shutdown on router interface');

// 4. VLAN case-sensitivity & Trunk overwrite vs add
const p2 = data.PATTERNS[1];
ok(!evaluateCliSubmission('enable\nconfigure terminal\nvlan 10\nname staff\nexit\ninterface f0/6\nswitchport mode access\nswitchport access vlan 10\nend\nshow vlan brief', p2.workedExample.spec).passed, 'Rejects wrong VLAN name case (staff vs Staff)');

const p3 = data.PATTERNS[2];
ok(!evaluateCliSubmission('enable\nconfigure terminal\ninterface g0/1\nswitchport mode trunk\nswitchport trunk native vlan 99\nswitchport trunk allowed vlan 10,20\nswitchport trunk allowed vlan 99\nend\nshow interfaces trunk', p3.workedExample.spec).passed, 'Rejects reissuing allowed vlan without add');
ok(evaluateCliSubmission('enable\nconfigure terminal\ninterface g0/1\nswitchport mode trunk\nswitchport trunk native vlan 99\nswitchport trunk allowed vlan 10,20\nswitchport trunk allowed vlan add 99\nend\nshow interfaces trunk', p3.workedExample.spec).passed, 'Accepts allowed vlan add 99');

// 5. SSH errors: plain login, missing transport input ssh, RSA before domain-name
const p4 = data.PATTERNS[3];
ok(!evaluateCliSubmission('enable\nconfigure terminal\nhostname S1\nip domain-name cisco.local\nusername admin secret cisco123\ncrypto key generate rsa\n1024\nip ssh version 2\nline vty 0 4\nlogin\ntransport input ssh\nend\nshow ip ssh', p4.workedExample.spec).passed, 'Rejects plain login instead of login local on VTY');
ok(!evaluateCliSubmission('enable\nconfigure terminal\nhostname S1\nip domain-name cisco.local\nusername admin secret cisco123\ncrypto key generate rsa\n1024\nip ssh version 2\nline vty 0 4\nlogin local\ntransport input telnet\nend\nshow ip ssh', p4.workedExample.spec).passed, 'Rejects Telnet transport on VTY');
ok(!evaluateCliSubmission('enable\nconfigure terminal\ncrypto key generate rsa\n1024\nhostname S1\nip domain-name cisco.local\nusername admin secret cisco123\nip ssh version 2\nline vty 0 4\nlogin local\ntransport input ssh\nend\nshow ip ssh', p4.workedExample.spec).passed, 'Rejects RSA keygen before hostname + domain-name');

// 6. ACL errors: unattached, wrong direction, subnet mask instead of wildcard, ineffective rule order
const p5 = data.PATTERNS[4];
ok(!evaluateCliSubmission('enable\nconfigure terminal\naccess-list 10 deny host 192.168.10.50\naccess-list 10 permit 192.168.10.0 0.0.0.255\nend\nshow access-lists', p5.workedExample.spec).passed, 'Rejects unattached ACL');
ok(!evaluateCliSubmission('enable\nconfigure terminal\naccess-list 10 deny host 192.168.10.50\naccess-list 10 permit 192.168.10.0 0.0.0.255\ninterface g0/1\nip access-group 10 in\nend\nshow access-lists', p5.workedExample.spec).passed, 'Rejects wrong ACL direction (in vs out)');
ok(!evaluateCliSubmission('enable\nconfigure terminal\naccess-list 10 deny host 192.168.10.50\naccess-list 10 permit 192.168.10.0 255.255.255.0\ninterface g0/1\nip access-group 10 out\nend\nshow access-lists', p5.workedExample.spec).passed, 'Rejects subnet mask in ACL instead of wildcard mask');
ok(!evaluateCliSubmission('enable\nconfigure terminal\naccess-list 10 permit 192.168.10.0 0.0.0.255\naccess-list 10 deny host 192.168.10.50\ninterface g0/1\nip access-group 10 out\nend\nshow access-lists', p5.workedExample.spec).passed, 'Rejects ineffective ACL rule order (permit before deny)');

// 7. Port security order & violation mode
const p6 = data.PATTERNS[5];
ok(!evaluateCliSubmission('enable\nconfigure terminal\ninterface range f0/1 - 2\nswitchport port-security\nswitchport mode access\nswitchport port-security maximum 1\nswitchport port-security mac-address sticky\nswitchport port-security violation restrict\nend\nshow port-security', p6.workedExample.spec).passed, 'Rejects port-security enabled before switchport mode access');
ok(!evaluateCliSubmission('enable\nconfigure terminal\ninterface range f0/1 - 2\nswitchport mode access\nswitchport port-security\nswitchport port-security maximum 1\nswitchport port-security mac-address sticky\nswitchport port-security violation protect\nend\nshow port-security', p6.workedExample.spec).passed, 'Rejects wrong violation mode (protect vs restrict)');

// 8. Controller persistence: exposure -> reload -> submit stays helped; duplicate submit; variant independence; real PT separation
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};

const app1 = new CliTrainerApp(data);
const k1 = app1.scenarioKey('p1_basic_lan', 'p1_worked', 'configure');
app1.markExposed(k1, 'solutionRevealed');
const appReloaded = new CliTrainerApp(data);
const resAfterReveal = appReloaded.evaluateConfigureInput(p1.workedExample.solution.join('\n'));
ok(resAfterReveal.passed && resAfterReveal.outcome === 'helped', 'Solution revealed -> reload -> submit stays helped, not independent');

// Switch to coherent variant -> unassisted first pass earns independent once
appReloaded.useVariant = true;
const resVar1 = appReloaded.evaluateConfigureInput(p1.variant.solution.join('\n'));
ok(resVar1.passed && resVar1.outcome === 'independent' && !resVar1.alreadyCredited, 'Coherent variant earns independent credit once');
const resVar2 = appReloaded.evaluateConfigureInput(p1.variant.solution.join('\n'));
ok(resVar2.passed && resVar2.alreadyCredited === true, 'Repeated submission of same variant does not award new credit');

// Real PT status is tracked separately from website evidence
appReloaded.setRealPtStatus(11, 'passed_independently_in_pt', 'Verified in PT 9.0.1');
const appReloaded2 = new CliTrainerApp(data);
ok(appReloaded2.state.realPt['11'].status === 'passed_independently_in_pt', 'Real PT status persists separately from website checks');

// 9. Review Defect 1 regressions: shutdown after no shutdown, dirtySinceSave, and unparsed lines
const p1WithShutdown = `${p1.workedExample.solution.join('\n')}\nconfigure terminal\ninterface g0/0\nshutdown\nend`;
ok(!evaluateCliSubmission(p1WithShutdown, p1.workedExample.spec).passed, 'Review Defect 1A: rejects shutdown reversing earlier no shutdown');

const p1DirtyAfterSave = `${p1.workedExample.solution.join('\n')}\nconfigure terminal\ninterface g0/0\ndescription changed\nend`;
ok(!evaluateCliSubmission(p1DirtyAfterSave, p1.workedExample.spec).passed, 'Review Defect 1B: rejects config modified after copy running-config startup-config');

const p1TypoCmd = p1.workedExample.solution.join('\n').replace('ip address 192.168.10.1 255.255.255.0', 'ip adres 192.168.10.1 255.255.255.0');
ok(!evaluateCliSubmission(p1TypoCmd, p1.workedExample.spec).passed, 'Review Defect 1C: rejects unrecognized/typo IOS command instead of skipping');

// 10. Review Defect 2 regression: SSH settings placed on console 0 instead of VTY 0 4
const p4ConsoleNotVty = p4.workedExample.solution
  .join('\n')
  .replace('line vty 0 4', 'line vty 0 4\nexit\nline console 0');
ok(!evaluateCliSubmission(p4ConsoleNotVty, p4.workedExample.spec).passed, 'Review Defect 2: rejects login local / transport input ssh placed on console 0 instead of VTY');

// 11. Expanded coverage: Switch basic setup (Ex 2 template) & Named ACL sequence modification (Ex 10 template)
const p1Switch = p1.extraScenarios.find(s => s.id === 'p1_switch_setup');
ok(evaluateCliSubmission(p1Switch.solution.join('\n'), p1Switch.spec).passed, 'Switch basic setup template passes');
ok(!evaluateCliSubmission(p1Switch.solution.join('\n').replace('banner motd #Authorized Only#\n', ''), p1Switch.spec).passed, 'Switch basic setup rejects missing banner');

const p5Modify = p5.extraScenarios.find(s => s.id === 'p5_modify_acl');
ok(evaluateCliSubmission(p5Modify.solution.join('\n'), p5Modify.spec).passed, 'Named ACL sequence modification (no 10 + 10 deny ...) passes');
ok(!evaluateCliSubmission('enable\nconfigure terminal\nip access-list standard BRANCH_FILTER\n30 deny 192.168.20.0 0.0.0.255\nend\nshow access-lists', p5Modify.spec).passed, 'Named ACL modification rejects unremoved seq 10 / wrong order');

// 12. Professor Update: VTY ACL (access-class) semantic checks
const p5Vty = p5.extraScenarios.find(s => s.id === 'p5_vty_acl');
ok(evaluateCliSubmission(p5Vty.solution.join('\n'), p5Vty.spec).passed, 'VTY ACL authored example (host 192.168.10.10 + access-class 10 in) passes');
ok(!evaluateCliSubmission(p5Vty.solution.join('\n').replace('access-list 10 permit host 192.168.10.10', 'access-list 10 permit 192.168.10.0 0.0.0.255'), p5Vty.spec).passed, 'VTY ACL rejects subnet-wide permit 192.168.10.0/24 that would allow PC2');
ok(!evaluateCliSubmission(p5Vty.solution.join('\n').replace('access-class 10 in\n', ''), p5Vty.spec).passed, 'VTY ACL rejects unattached ACL (missing access-class)');
ok(!evaluateCliSubmission(p5Vty.solution.join('\n').replace('access-class 10 in', 'access-class 10 out'), p5Vty.spec).passed, 'VTY ACL rejects wrong direction (out instead of in)');
ok(!evaluateCliSubmission(p5Vty.solution.join('\n').replace('line vty 0 4\nlogin local\ntransport input telnet\naccess-class 10 in', 'line vty 0 4\nlogin local\ntransport input telnet\nexit\ninterface g0/0\nip access-group 10 in'), p5Vty.spec).passed, 'VTY ACL rejects interface ip access-group used instead of VTY access-class');
ok(!evaluateCliSubmission('enable\nconfigure terminal\nusername admin secret cisco123\naccess-list 10 permit any\naccess-list 10 permit host 192.168.10.10\nline vty 0 4\nlogin local\ntransport input telnet\naccess-class 10 in\nend\nshow access-lists\nshow running-config', p5Vty.spec).passed, 'VTY ACL rejects permit any before host restriction');
ok(!evaluateCliSubmission(p5Vty.solution.join('\n').replace('line vty 0 4', 'line vty 0 1'), p5Vty.spec).passed, 'VTY ACL rejects partial VTY range (0 1 when 0 4 required)');

// Effective VTY state: later overlapping selections, equivalent ranges and directions.
const vtySolution = p5Vty.solution.join('\n');
const insertBeforeEnd = commands => vtySolution.replace('\nend\n', '\n' + commands + '\nend\n');
const overridingAcl = 'exit\naccess-list 11 permit any\nline vty 0 3\nlogin local\ntransport input telnet\naccess-class 11 in';
ok(!evaluateCliSubmission(insertBeforeEnd(overridingAcl), p5Vty.spec).passed, 'Later overlapping VTY range cannot bypass the incoming ACL');
const splitVty = vtySolution.replace('line vty 0 4\nlogin local\ntransport input telnet\naccess-class 10 in', 'line vty 0 1\nlogin local\ntransport input telnet\naccess-class 10 in\nexit\nline vty 2 4\nlogin local\ntransport input telnet\naccess-class 10 in');
ok(evaluateCliSubmission(splitVty, p5Vty.spec).passed, 'Equivalent split ranges cover every required line');
const overlapRestored = insertBeforeEnd(overridingAcl + '\nline vty 0 3\naccess-class 10 in');
ok(evaluateCliSubmission(overlapRestored, p5Vty.spec).passed, 'Restoring the restricted incoming ACL on the changed lines passes');
const bothDirections = evaluateCliSubmission(insertBeforeEnd('access-class 11 out'), p5Vty.spec);
ok(bothDirections.passed && bothDirections.state.lines['vty 0'].accessClass.in === '10' && bothDirections.state.lines['vty 0'].accessClass.out === '11', 'Outgoing ACL does not replace the incoming ACL');
ok(!evaluateCliSubmission(insertBeforeEnd('line vty 2\nno access-class 10 in'), p5Vty.spec).passed, 'Removing incoming ACL on one selected line is detected');
ok(!evaluateCliSubmission(insertBeforeEnd('line vty 2\nlogin'), p5Vty.spec).passed, 'Later plain login replaces login local on that single line');
ok(!evaluateCliSubmission(insertBeforeEnd('line vty 2 3\ntransport input ssh'), p5Vty.spec).passed, 'Later transport change affects overlapping lines');
ok(evaluateCliSubmission(insertBeforeEnd('line vty 2\naccess-class 10 in'), p5Vty.spec).passed, 'Single-line selection is valid and preserves other settings');
ok(!evaluateCliSubmission(vtySolution.replace('line vty 0 4', 'line vty 4 0'), p5Vty.spec).passed, 'Reversed VTY range rejected');
ok(!evaluateCliSubmission(vtySolution.replace('line vty 0 4', 'line console 0'), p5Vty.spec).passed, 'Console access-class cannot substitute for VTY filtering');
const repair = p5.extraTroubleshoot.find(c => c.id === 'vty_ts_1');
const brokenRules = [{ aclId: '10', seq: 10, action: 'permit', target: '192.168.10.0 0.0.0.255' }, { aclId: '10', seq: 20, action: 'deny', target: 'any' }];
const repairSpec = { requireEnable: true, initialAclRules: brokenRules, aclId: '10', orderedAclRules: p5Vty.spec.orderedAclRules, requireVerifyCmds: ['show access-lists', 'show running-config'] };
const repaired = evaluateCliSubmission(repair.repairCommands.join('\n'), repairSpec);
ok(repaired.passed && repaired.state.aclRules.length === 2 && !repaired.state.aclRules.some(r => r.target === '192.168.10.0 0.0.0.255'), 'Published repair removes the broad rule and preserves deny any');
ok(!evaluateCliSubmission(repair.repairCommands.filter(c => c !== 'no 10').join('\n').replace('10 permit host', 'permit host'), repairSpec).passed, 'Adding a host permit without removing the broad rule is not a repair');

const anyRepair = p5.extraTroubleshoot.find(c => c.id === 'vty_ts_4');
const anyRepairResult = evaluateCliSubmission(anyRepair.repairCommands.join('\n'), { ...repairSpec, initialAclRules: [{ aclId: '10', seq: 10, action: 'permit', target: 'any' }, { aclId: '10', seq: 20, action: 'permit', target: 'host 192.168.10.10' }], orderedAclRules: [p5Vty.spec.orderedAclRules[0]] });
ok(anyRepairResult.passed && anyRepairResult.state.aclRules.length === 1 && anyRepairResult.state.aclRules[0].target === 'host 192.168.10.10', 'Permit-any repair preserves only the existing host permit and implicit deny');

console.log(`${checks} CLI-trainer checks passed: 11 activities, 6 patterns, semantic IOS modes/ACLs/VTY-access-class/trunks/SSH/port-security, coherent variants, and reload/credit protection.`);
