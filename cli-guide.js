(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CLI_GUIDE_UI = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const map = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  function normalizeCommand(raw) {
    return String(raw).trim().replace(/\s+/g, ' ')
      .replace(/^(sh)\b/i, 'show').replace(/^(int)\b/i, 'interface')
      .replace(/\bGigabitEthernet(?=\d)/ig, 'g').replace(/\bGi(?=\d)/ig, 'g')
      .replace(/\bFastEthernet(?=\d)/ig, 'f').replace(/\bFa(?=\d)/ig, 'f')
      .replace(/\bSerial\s*(?=\d)/ig, 's').replace(/\s*-\s*/g, '-');
  }
  function checkStep(step, input) {
    if (step.kind === 'task') return { passed: false, message: 'Confirm this action in Packet Tracer, then use Next.' };
    const raw = String(input);
    if (step.kind === 'response') {
      const passed = raw.trim() === step.command;
      return { passed, message: passed ? 'Response matches this prompt. This is guided practice.' : 'Use the response shown for this interactive prompt; leave the box empty for Enter.' };
    }
    if (/[\r\n]/.test(raw) || /^[\w-]+(?:\([\w-]+\))?[#>]/.test(raw.trim())) {
      return { passed: false, message: 'Type one command only, without the device prompt.' };
    }
    // Preserve case for task-specific names, secrets and banner text. Only IOS keywords
    // and interface spellings in other commands are case-insensitive here.
    const sensitive = /^(?:name |hostname |username |password |enable (?:secret|password) |banner |ip access-list standard |ip access-group [A-Za-z])/i.test(step.command);
    const canonical = x => sensitive ? normalizeCommand(x) : normalizeCommand(x).toLowerCase();
    const passed = [step.command, ...(step.aliases || [])].some(x => canonical(x) === canonical(raw));
    return { passed, message: passed ? 'Command matches this device and step. Run it in Packet Tracer and inspect the result.' : 'That does not match this step. Check the device, mode, interface, addresses and rule order shown above.' };
  }
  function install(App) {
    App.prototype.guideRecord = function () {
      this.state.walkthroughs = map(this.state.walkthroughs);
      const g = this.data.WALKTHROUGHS.find(x => x.ex === this.activeExercise) || this.data.WALKTHROUGHS[0];
      this.activeExercise = g.ex;
      const r = map(this.state.walkthroughs[g.ex]);
      r.index = Number.isInteger(r.index) ? Math.max(0, Math.min(r.index, g.steps.length - 1)) : 0;
      r.done = map(r.done); r.typed = map(r.typed); r.checklist = map(r.checklist);
      this.state.walkthroughs[g.ex] = r;
      return { g, r, step: g.steps[r.index] };
    };
    App.prototype.chooseGuide = function (ex) {
      if (!this.data.WALKTHROUGHS.some(x => x.ex === Number(ex))) return;
      this.activeExercise = Number(ex); this.state.lastGuide = this.activeExercise;
      this.guideRecord(); this.saveState();
    };
    App.prototype.moveGuide = function (direction) {
      const { g, r } = this.guideRecord();
      if (direction > 0) {
        r.done[r.index] = true;
        if (r.index === g.steps.length - 1) r.completed = true;
      }
      r.index = Math.max(0, Math.min(g.steps.length - 1, r.index + direction));
      this.saveState();
    };
    App.prototype.checkGuideInput = function (input) {
      const { r, step } = this.guideRecord();
      const result = checkStep(step, input);
      if (result.passed) r.typed[r.index] = true;
      // Deliberately never call recordOutcome: the answer is visible throughout.
      this.saveState(); return result;
    };
    App.prototype.restartGuide = function () {
      this.state.walkthroughs[this.activeExercise] = { index: 0, done: {}, typed: {}, checklist: {} };
      this.saveState();
    };
    App.prototype.renderGuide = function (host) {
      const { g, r, step } = this.guideRecord();
      const esc = x => this.esc(x);
      const done = g.steps.filter((_, i) => r.done[i]).length;
      host.innerHTML = `<section class="card guide-card" aria-labelledby="guide-title">
        <label for="cli-guide-select"><strong>Choose your Packet Tracer exercise</strong></label>
        <select id="cli-guide-select">${this.data.WALKTHROUGHS.map(x => `<option value="${x.ex}" ${x.ex === g.ex ? 'selected' : ''}>Exercise ${x.ex} · ${esc(x.title)}</option>`).join('')}</select>
        <h2 id="guide-title">Exercise ${g.ex} · ${esc(g.title)}</h2><p>${esc(g.scope)}</p>
        <details><summary>Source and verification status</summary><p class="mini">${esc(g.source)}. ${esc(g.executionStatus)} Expected results below are teaching guidance. The website does not run IOS or observe Packet Tracer.</p></details>
        <p class="guide-progress">Step ${r.index + 1} of ${g.steps.length} · ${done} confirmed · ${Object.keys(r.typed).length} typed checks ${r.completed ? '· Guided walkthrough complete' : ''}</p>
        <progress max="${g.steps.length}" value="${done}" aria-label="Steps you confirmed"></progress>
        <article class="guide-step" aria-labelledby="guide-step-title">
          <p class="mini">${esc(step.section)}</p>
          <h3 id="guide-step-title">Step ${r.index + 1} · ${step.kind === 'task' ? 'Do this in Packet Tracer' : step.kind === 'response' ? 'Answer the prompt' : 'Type this command'}</h3>
          <div class="guide-context"><span class="badge info">Device: ${esc(step.device)}</span><span>Current prompt: <code>${esc(step.prompt)}</code></span></div>
          <pre class="ios-pre guide-command">${esc(step.command || 'Press Enter (empty response)')}</pre>
          <p><strong>Because:</strong> ${esc(step.why)}</p>
          <p><strong>Look for:</strong> ${esc(step.expected)}</p>
          <p class="mini">Next prompt: <code>${esc(step.nextPrompt)}</code></p>
          <details><summary>If it does not work</summary><p>${esc(step.trouble)}</p></details>
          ${step.kind !== 'task' ? `<form id="cli-guide-form"><label for="cli-guide-input">Optional: type ${step.kind === 'response' ? 'the response' : 'the command'} here to check it</label><input id="cli-guide-input" class="cli-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="cli-guide-feedback"><button type="submit" class="button small">Check ${step.kind === 'response' ? 'Response' : 'Command'}</button></form>` : ''}
          <div id="cli-guide-feedback" role="status" aria-live="polite">${r.typed[r.index] ? 'Previously matched in guided practice.' : ''}</div>
        </article>
        <p class="mini">Follow along in Packet Tracer and use Next when you have checked the result. Typing here is optional. Confirmations are self-reported guided progress, not independent exam credit.</p>
        <div class="btn-row"><button class="button" id="cli-guide-back" ${r.index === 0 ? 'disabled' : ''}>← Back</button><button class="button primary" id="cli-guide-next">${r.index === g.steps.length - 1 ? 'Finish guided walkthrough' : 'Confirmed in Packet Tracer · Next →'}</button><button class="button small" id="cli-guide-restart">Restart this guide</button></div>
        <h3>Completion checklist (self-reported)</h3><div class="guide-checklist">${g.checklist.map((item, i) => `<label><input type="checkbox" data-guide-check="${i}" ${r.checklist[i] ? 'checked' : ''}> ${esc(item)}</label>`).join('')}</div>
        ${r.completed ? '<p class="notice ok">Guided walkthrough complete. Next, use Recall Blanks or Configure from Requirements in the pattern trainer, and practise a fresh copy without looking.</p>' : ''}
      </section>`;
      host.querySelector('#cli-guide-select').addEventListener('change', e => { this.chooseGuide(e.target.value); this.renderAll(); });
      for (const [id, direction] of [['back', -1], ['next', 1]]) host.querySelector(`#cli-guide-${id}`).addEventListener('click', () => {
        this.moveGuide(direction); this.renderAll();
        document.getElementById('guide-step-title').setAttribute('tabindex', '-1');
        document.getElementById('guide-step-title').focus();
      });
      host.querySelector('#cli-guide-restart').addEventListener('click', () => { this.restartGuide(); this.renderAll(); });
      host.querySelectorAll('[data-guide-check]').forEach(input => input.addEventListener('change', () => { r.checklist[input.dataset.guideCheck] = input.checked; this.saveState(); }));
      const form = host.querySelector('#cli-guide-form');
      if (form) form.addEventListener('submit', e => {
        e.preventDefault(); const result = this.checkGuideInput(host.querySelector('#cli-guide-input').value);
        const feedback = host.querySelector('#cli-guide-feedback'); feedback.textContent = result.message;
        feedback.className = `feedback ${result.passed ? 'ok' : 'err'}`;
      });
    };
  }
  return { install, checkStep };
}));
