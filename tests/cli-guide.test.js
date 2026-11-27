const assert = require('assert');
const data = require('../cli-trainer-data');
const { CliTrainerApp, STORAGE_KEY } = require('../cli-trainer');
const { checkStep } = require('../cli-guide');
let count = 0;
function check(value, message) { assert(value, message); count++; }
const store = new Map();
global.localStorage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, value) };
const prior = { evidence: { existing: 'independent' }, mistakes: [{ symptom: 'saved note' }], realPt: { 1: { status: 'practised_with_help' } } };
store.set(STORAGE_KEY, JSON.stringify(prior));
let app = new CliTrainerApp(data);
check(app.activeMode === 'guide', 'Guide is the default view');
check(data.WALKTHROUGHS.length === 11, 'Every exact activity has a guide');
for (const guide of data.WALKTHROUGHS) {
  check(guide.checklist.length > 0 && guide.source.includes('student-visible'), 'Checklist and provenance exist');
  for (const step of guide.steps) {
    check(step.device && step.prompt && step.nextPrompt && step.why && step.expected && step.trouble && step.section, 'Step has teaching context');
    if (step.kind === 'command') check(!step.command.includes('\n'), 'Exactly one command per step');
    if (step.kind !== 'task') check(checkStep(step, step.command).passed, 'Canonical answer accepted');
  }
}
const g = n => data.WALKTHROUGHS[n - 1];
const find = (n, command) => g(n).steps.find(s => s.command === command);
check(checkStep(find(1, 'interface g0/0'), 'int GigabitEthernet0/0').passed, 'Explicit interface alias accepted');
check(!checkStep(find(1, 'interface g0/0'), 'interface g0/1').passed, 'Wrong interface rejected');
check(!checkStep(find(1, 'interface g0/0'), 'R1(config)# interface g0/0').passed, 'Prompt rejected');
check(!checkStep(find(1, 'interface g0/0'), 'interface g0/0\nno shutdown').passed, 'Multiple commands rejected');
check(!checkStep(find(3, 'name Faculty/Staff'), 'name faculty/staff').passed, 'Exact VLAN name preserved');
check(!checkStep(find(9, 'ip access-list standard File_Server_Restrictions'), 'ip access-list standard file_server_restrictions').passed, 'Exact ACL name preserved');
check(!checkStep(find(8, 'access-list 1 deny 192.168.11.0 0.0.0.255'), 'access-list 1 deny 192.168.11.0 255.255.255.0').passed, 'Subnet mask cannot replace wildcard');
check(!checkStep(find(5, 'ExamLogin27!'), 'examlogin27!').passed, 'Password responses remain case-sensitive');
check(checkStep(g(10).steps.find(s => s.kind === 'response' && s.command === ''), '').passed, 'Empty Enter response accepted');
check(!checkStep(find(5, '1024'), 'crypto key generate rsa 1024').passed, 'Interactive RSA response is separate from command');
check(find(3, 'switchport voice vlan 150').device === 'S3', 'Voice VLAN on S3');
check(find(4, 'interface g0/2').device === 'S3', 'Exact S3 trunk port');
check(!g(4).steps.some(s => s.command.includes('allowed vlan')), 'No invented allowed-VLAN restriction');
check(find(5, 'login block-for 180 attempts 4 within 120').device === 'RTA', 'RTA lockout included');
check(find(5, 'enable').nextPrompt === 'Router#', 'Before hostname, preserve Router prompt');
check(find(7, 'no ip access-group 11 out').prompt === 'R1(config-if)#', 'ACL detached in interface mode');
check(find(9, 'ip access-group File_Server_Restrictions out').prompt === 'R1(config-if)#', 'Named ACL correct attachment mode');
check(find(10, '30 permit 209.165.200.224 0.0.0.31').prompt === 'R1(config-std-nacl)#', 'Sequence insertion in named ACL mode');
check(find(10, '40 deny any'), 'Explicit final deny after return-traffic permit');
check(find(11, 'switchport port-security violation restrict'), 'Restrict mode retained');
app.chooseGuide(1);
app.moveGuide(1); app.checkGuideInput('enable');
app.chooseGuide(10); app.moveGuide(1);
app = new CliTrainerApp(data);
check(app.activeExercise === 10 && app.guideRecord().r.index === 1, 'Last activity and step survive reload');
app.chooseGuide(1);
check(app.guideRecord().r.index === 1, 'Each guide resumes separately');
app.chooseGuide(11);
for (let i = 0; i < g(11).steps.length; i++) app.moveGuide(1);
check(app.guideRecord().r.completed && Object.keys(app.guideRecord().r.done).length === g(11).steps.length, 'Manual confirmations finish guide without typing');
check(Object.keys(app.state.evidence).length === 1 && app.state.evidence.existing === 'independent', 'Guided completion awards no independent evidence and preserves old evidence');
check(app.state.mistakes[0].symptom === 'saved note' && app.state.realPt[1].status === 'practised_with_help', 'Existing learner records preserved');
app.restartGuide();
check(!app.guideRecord().r.completed && app.guideRecord().r.index === 0, 'Restart clears current guide only');
check(app.state.walkthroughs[1].index === 1 && app.state.evidence.existing === 'independent', 'Other guides and pattern evidence survive restart');
app.chooseGuide(999);
check(app.activeExercise === 11, 'Invalid activity cannot change selection');
check(Array.isArray(data.WALKTHROUGHS.supplementary) && data.WALKTHROUGHS.supplementary.length === 1, 'Supplementary guide is separate from Ex 1-11');
const sup = data.WALKTHROUGHS.supplementary[0];
check(sup.ex === 'prof-vty-acl' && sup.topologyTable.length === 5, 'Supplementary VTY ACL guide has stable ID and topology table');
const commands = sup.steps.map(s => s.command);
const baselineStart = sup.steps.findIndex(s => s.section.startsWith('Part 3'));
const firstFilter = commands.indexOf('access-class 10 in');
check(commands.indexOf('transport input telnet') < baselineStart && commands.indexOf('username admin secret cisco123') < baselineStart, 'Login and transport are configured before baseline');
for (const pc of ['PC1', 'PC2', 'PC3']) {
  const baseline = sup.steps.slice(baselineStart, firstFilter).filter(s => s.device === pc);
  check(baseline.some(s => s.command.startsWith('telnet ')) && baseline.some(s => s.command === 'admin') && baseline.some(s => s.command === 'cisco123') && baseline.some(s => s.command === 'exit'), `${pc} baseline authenticates and closes its session`);
  check(sup.topologyTable.find(r => r.device.startsWith(pc)).gateway, `${pc} gateway is specified`);
}
check(commands.indexOf('show users') > commands.indexOf('access-class 10 in') && sup.steps[commands.indexOf('show users') - 1].command === 'cisco123', 'show users follows an authenticated permitted session');
app.state.walkthroughs['prof-vty-acl'] = { index: 12, done: { 0: true }, typed: {}, checklist: {} };
app.chooseGuide('prof-vty-acl');
app.moveGuide(1);
app = new CliTrainerApp(data);
check(app.activeExercise === 'prof-vty-acl' && app.guideRecord().r.index === 1, 'Supplementary guide ID and step survive reload');
check(app.state.walkthroughs['prof-vty-acl'].index === 12 && app.state.walkthroughs['prof-vty-acl'].done[0], 'Earlier supplementary progress retained separately after reordering');
check(app.state.walkthroughs['prof-vty-acl@2'].index === 1, 'Revised guide progress uses a separate persisted revision');
store.set(STORAGE_KEY, '{bad json');
check(new CliTrainerApp(data).guideRecord().r.index === 0, 'Corrupt storage recovers safely');
app.clearProgress();
check(Object.keys(app.state.walkthroughs).length === 0, 'Global reset includes guides');
delete global.localStorage;
console.log(`${count} walkthrough checks passed.`);

