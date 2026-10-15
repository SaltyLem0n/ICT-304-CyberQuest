(function () {
  'use strict';
  const D = window.Chapter3PracticeData;
  if (!D) return;
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const attempts = new Map();
  let index = 0, printTrigger = null, printScroll = 0;
  function state(q) {
    if (!attempts.has(q.id)) attempts.set(q.id, { draft: {}, hint: false, solution: false });
    return attempts.get(q.id);
  }
  function table(caption, headers, rows, className = '') {
    return `<div class="table-wrap" tabindex="0" role="region" aria-label="${escape(caption)}"><table class="${className}"><caption>${escape(caption)}</caption><thead><tr>${headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td class="code">${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function glyph(shape, label = shape.replace(/-/g, ' ')) {
    const dotted = shape.endsWith('-dot'), base = shape.replace(/-dot$/, '');
    const paths = { 'bottom-right': 'M28 4V28H4', 'open-top': 'M4 4V28H28V4', 'bottom-left': 'M4 4V28H28', 'open-left': 'M4 4H28V28H4', square: 'M4 4H28V28H4Z', 'open-right': 'M28 4H4V28H28', 'top-right': 'M4 4H28V28', 'open-bottom': 'M4 28V4H28V28', 'top-left': 'M4 28V4H28', down: 'M4 4L16 27L28 4', right: 'M4 4L27 16L4 28', left: 'M28 4L5 16L28 28', up: 'M4 28L16 5L28 28' };
    return `<svg class="glyph" role="img" aria-label="${escape(label)}" viewBox="0 0 32 32"><path d="${paths[base]}"></path>${dotted ? '<circle cx="16" cy="16" r="2.5" fill="currentColor" stroke="none"></circle>' : ''}</svg>`;
  }
  function pigpenKey() {
    return `<div class="glyph-key">${D.pigpen.map((shape, i) => `<span>${glyph(shape, `${D.alphabet[i]}: ${shape.replace(/-/g, ' ')}`)}<b>${D.alphabet[i]}</b></span>`).join('')}</div><p class="field-note">Corner names describe the visible ink. “Open top” is a three-sided box with its top edge missing; up/down/left/right describe the direction a chevron points. A dot selects the second grid or X.</p>`;
  }
  function asciiTemplate() {
    return table('Original character-table template: column gives the high hex digit; row gives the low hex digit', ['Low hex / bits', ...Array.from({ length: 8 }, (_, i) => `${i} / ${i.toString(2).padStart(3, '0')}`)], Array.from({ length: 16 }, (_, i) => [`${i.toString(16).toUpperCase()} / ${i.toString(2).padStart(4, '0')}`, ...Array(8).fill('')]), 'ascii-template');
  }
  function figure(name, alt, caption) {
    return `<figure class="source-figure"><img src="assets/chapter3-practice/${name}" alt="${escape(alt)}" loading="lazy"><figcaption>${escape(caption)}</figcaption></figure>`;
  }
  function questionBody(q, forPrint = false) {
    let html = `<p>${escape(q.prompt)}</p>`;
    if (q.known) html += `<p>Known plaintext: <strong>${escape(q.known.text)}</strong></p><div class="ciphertext" aria-label="Known encoded bytes">${escape(q.known.hex)}</div><p>Intercepted message:</p>`;
    if (q.ciphertext) html += `<div class="ciphertext" aria-label="${q.id === 1 ? 'Phrase to encode' : 'Ciphertext'}">${escape(q.ciphertext)}</div>`;
    if (q.key) html += `<p>Key: <strong class="code">${escape(q.key)}</strong></p>`;
    if (q.figure) html += figure(q.figure, q.figureAlt, `Original figure · practice paper, page ${q.page}`);
    if (q.keyGrid) html += table('Supplied Playfair key grid (I/J share the I cell)', ['1', '2', '3', '4', '5'], q.keyGrid, 'key-grid');
    if (q.clues) html += figure('q7-clues.png', 'Supplied clues: square means V; dotted open-top means B; top-left corner means Z; dotted top-right corner means G; right-pointing chevron means K; dotted up-pointing chevron means Q.', 'The six supplied clues · preserve this modified mapping');
    if (q.symbols && !forPrint) html += `<details class="reference"><summary>Accessible symbol transcription</summary><p class="field-note">These names describe outlines, not decoded letters. Use the key to identify each letter.</p>${q.symbols.map((line, i) => `<p class="symbol-description"><strong>Line ${i + 1}:</strong> ${line.map(s => escape(s.replace(/-/g, ' '))).join(' · ')}</p>`).join('')}${q.clues ? `<p class="symbol-description"><strong>Given clues:</strong> ${q.clues.map(([shape, letter]) => `${escape(shape.replace(/-/g, ' '))} → ${letter}`).join('; ')}</p>` : ''}</details>`;
    if (q.reference === 'ascii') html += forPrint ? asciiTemplate() : `<details class="reference"><summary>Original character-table template</summary>${asciiTemplate()}</details>`;
    return html;
  }
  function columnarStage(t, caption) {
    return `<p>Alphabetic column order: <strong class="code">${escape(t.order)}</strong>.</p>${table(caption, Array.from(t.key, (c, i) => `${c} (${t.ranks[i]})`), t.grid, 'route-grid')}<p>Read across rows:</p><div class="formula">${escape(t.plaintext)}</div>`;
  }
  function trace(q) {
    const t = q.trace;
    switch (t.type) {
      case 'ascii': return table('Each character, including the space, occupies one byte', ['Character', 'ASCII decimal', '8-bit binary', 'Hex'], t.rows.map(r => [r.character, r.decimal, r.binary, r.hex]));
      case 'substitution': return table('Backward Caesar shift', ['Cipher', 'Value (A=0)', 'Calculation', 'Plain'], t.rows);
      case 'atbash': return table('Mirror each letter', ['Cipher', 'P = 25 − C', 'Plain'], t.rows);
      case 'playfair': return table('Literal Playfair decryption of the original ciphertext', ['Pair', 'Positions (row,col)', 'Rule', 'Output'], t.rows.map(r => [r.pair, r.positions, r.rule, r.output]));
      case 'pigpen': {
        const mapping = t.shifted ? table('The six clues all fit the same backward shift of 9', ['Shape', 'Standard letter', 'Provided letter'], q.clues.map(([shape, letter]) => [shape.replace(/-/g, ' '), D.alphabet[D.pigpen.indexOf(shape)], letter])) : '';
        return `${mapping}<h4>${t.shifted ? 'Complete modified key' : 'Standard Pigpen key'}</h4><div class="glyph-key">${D.pigpen.map((shape, i) => `<span>${glyph(shape)}<b>${D.alphabet[(i + (t.shifted ? 17 : 0)) % 26]}</b></span>`).join('')}</div>${table('Decoded lines, in the order shown in the figure', ['Line', 'Letters'], t.decoded.map((line, i) => [i + 1, line]))}`;
      }
      case 'vigenere': return table('Repeat CHICAGO; subtract key values modulo 26', ['Position', 'Cipher', 'Key', 'Calculation', 'Plain'], t.rows.map(r => [r.position, r.cipher, r.key, r.calculation, r.plaintext]));
      case 'rail': return `${table('Split the ciphertext by the actual rail lengths', ['Rail', 'Letters', 'Count'], t.strips.map((s, i) => [i + 1, s, s.length]))}${table('Filled rails: follow the zigzag from the top-left letter', Array.from({ length: t.plaintext.length }, (_, i) => i + 1), t.grid, 'rail-table')}`;
      case 'route': return `${table('Filled 5×5 route grid; read rows left to right', ['Column 1 ↑', 'Column 2 ↓', 'Column 3 ↑', 'Column 4 ↓', 'Column 5 ↑'], t.grid, 'route-grid')}<p>Raw row reading:</p><div class="formula">${escape(t.raw)}</div>`;
      case 'blocks': return table('Undo the right rotation: ciphertext positions 5,6,1,2,3,4', ['Block', 'Received', 'Recovered'], t.rows.map(r => [r.block, r.ciphertext, r.plaintext]));
      case 'columnar': return columnarStage(t, `Reconstructed grid under ${t.key}`);
      case 'double-columnar': return t.stages.map((stage, i) => `<h4>Stage ${i + 1} · Undo ${stage.key}</h4>${columnarStage(stage, `Stage ${i + 1}: grid under ${stage.key}`)}`).join('');
      case 'hex-offset': return table('Convert each intercepted hex byte, subtract 5, then read ASCII', ['Position', 'Received hex', 'Decimal calculation', 'Character'], t.rows.map(r => [r.position, r.hex, r.calculation, r.character]));
      default: return '';
    }
  }
  function workedSolution(q) {
    return `<h3>${q.selfCheck ? 'Literal worked decryption · self-check' : 'Worked solution'}</h3><ol>${q.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>${trace(q)}${q.fields.map(f => `<h4>${escape(q.selfCheck ? 'Literal result from the printed data' : f.label)}</h4><div class="answer">${escape(f.answer)}</div>`).join('')}${q.answerNote ? `<p class="field-note">${escape(q.answerNote)}</p>` : ''}`;
  }
  function render(focus = false) {
    const q = D.questions[index], s = state(q);
    $('question-select').value = String(index);
    $('question-list').querySelectorAll('button').forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    $('previous-question').disabled = index === 0;
    $('next-question').disabled = index === D.questions.length - 1;
    $('question-position').textContent = `Question ${index + 1} of ${D.questions.length}`;
    $('question-panel').innerHTML = `<div class="eyebrow">Question ${q.id} / ${escape(q.topic)}</div><h2 id="question-title" tabindex="-1">${escape(q.title)}</h2><p class="source"><a href="${D.source}#page=${q.page}" target="_blank" rel="noopener">Original practice paper · page ${q.page} ↗</a></p><section class="method" aria-labelledby="method-title"><h3 id="method-title">How to approach it</h3><p>${escape(q.method)}</p></section>${q.sourceIssue ? `<div class="callout"><strong>Check the source data</strong><p>${escape(q.sourceIssue)}</p></div>` : ''}${questionBody(q)}${q.reference === 'pigpen' ? `<details class="reference"><summary>Standard Pigpen reference key</summary>${pigpenKey()}</details>` : ''}<form id="answer-form" novalidate><h3>Your paper answer</h3><p class="field-note">${q.id === 1 ? 'Keep 8 bits in each binary byte. Hexadecimal letter case and whitespace between bytes are ignored.' : 'Case, word spacing, and sentence punctuation are ignored. Digits and underscores are preserved unless a specific padding/separator variant is documented.'}</p>${q.answerNote ? `<p class="field-note">${escape(q.answerNote)}</p>` : ''}${q.fields.map(f => `<label for="answer-${f.id}">${escape(q.selfCheck ? 'Your decoded message (self-check)' : f.label)}</label><textarea id="answer-${f.id}" name="${f.id}" rows="${q.id === 2 ? 7 : f.kind === 'binary' ? 5 : 3}" maxlength="6000" autocomplete="off" spellcheck="false" aria-describedby="feedback-${f.id}">${escape(s.draft[f.id] || '')}</textarea><p id="feedback-${f.id}" class="feedback" aria-live="polite"></p>`).join('')}<div class="actions">${q.selfCheck ? '' : '<button type="submit" class="primary">Check answer</button>'}<button type="button" id="hint-button" aria-expanded="${s.hint}" aria-controls="hint">${s.hint ? 'Hide hint' : 'Show hint'}</button><button type="button" id="solution-button" aria-expanded="${s.solution}" aria-controls="worked-solution">${s.solution ? 'Hide worked solution' : 'Show worked solution'}</button></div></form><div id="hint" class="hint" ${s.hint ? '' : 'hidden'}>${escape(q.hint)}</div><section id="worked-solution" class="solution" ${s.solution ? '' : 'hidden'}>${s.solution ? workedSolution(q) : ''}</section>`;
    $('answer-form').addEventListener('input', event => {
      if (!event.target.matches('textarea')) return;
      const id = event.target.name; s.draft[id] = event.target.value;
      event.target.removeAttribute('aria-invalid'); event.target.classList.remove('good');
      $(`feedback-${id}`).textContent = ''; $(`feedback-${id}`).className = 'feedback';
    });
    $('answer-form').addEventListener('submit', event => {
      event.preventDefault();
      if (q.selfCheck) return;
      for (const f of q.fields) {
        const input = $(`answer-${f.id}`), feedback = $(`feedback-${f.id}`), result = D.checkAnswer(q, f.id, input.value);
        feedback.textContent = result.message; feedback.className = `feedback ${result.status}`;
        input.setAttribute('aria-invalid', String(result.status !== 'correct')); input.classList.toggle('good', result.status === 'correct');
      }
    });
    $('hint-button').addEventListener('click', () => {
      s.hint = !s.hint; $('hint').hidden = !s.hint;
      $('hint-button').textContent = s.hint ? 'Hide hint' : 'Show hint'; $('hint-button').setAttribute('aria-expanded', String(s.hint));
    });
    $('solution-button').addEventListener('click', () => {
      s.solution = !s.solution; $('worked-solution').hidden = !s.solution;
      $('worked-solution').innerHTML = s.solution ? workedSolution(q) : '';
      $('solution-button').textContent = s.solution ? 'Hide worked solution' : 'Show worked solution'; $('solution-button').setAttribute('aria-expanded', String(s.solution));
    });
    if (focus) { $('question-title').focus({ preventScroll: true }); $('question-title').scrollIntoView({ block: 'start' }); }
  }
  function selectQuestion(next) { if (next >= 0 && next < D.questions.length) { index = next; render(true); } }
  function printPreview(withAnswers, trigger) {
    printTrigger = trigger; printScroll = window.scrollY;
    $('print-area').innerHTML = `<div class="print-controls"><button id="close-print">← Back to practice</button><button id="print-now">Print / Save as PDF</button></div><h1>Chapter 3 · ${withAnswers ? 'Worked answers' : 'Blank practice worksheet'}</h1><p>ICT 304 · Original practice paper · 15 questions</p><p>${withAnswers ? 'The original Playfair source issue is preserved as self-check. Padding interpretations are identified in the relevant solutions.' : 'Work on paper. Show the key, transformation, and recovered message. Question 5 is self-check because of a source-data issue.'}</p>${D.questions.map(q => `<section class="print-question"><h2>${q.id}. ${escape(q.title)}</h2><p class="source">Source: original practice paper, page ${q.page}</p>${questionBody(q, true)}${q.sourceIssue ? `<div class="callout">${escape(q.sourceIssue)}</div>` : ''}${withAnswers ? workedSolution(q) : `${q.fields.map(f => `<p>${escape(f.label)}:</p><div class="answer-line" aria-hidden="true"></div>`).join('')}<div class="work-box" aria-label="Space for paper working"></div>`}</section>`).join('')}`;
    document.body.classList.add('print-preview'); window.scrollTo({ top: 0 });
    $('close-print').addEventListener('click', () => { document.body.classList.remove('print-preview'); $('print-area').innerHTML = ''; window.scrollTo({ top: printScroll }); printTrigger.focus({ preventScroll: true }); });
    $('print-now').addEventListener('click', () => window.print());
    $('close-print').focus({ preventScroll: true });
  }
  $('question-select').innerHTML = D.questions.map((q, i) => `<option value="${i}">${q.id}. ${escape(q.title)}</option>`).join('');
  $('question-list').innerHTML = D.questions.map((q, i) => `<button type="button" data-question="${i}"><span class="nav-number">${String(q.id).padStart(2, '0')}</span>${escape(q.title)}</button>`).join('');
  $('question-select').addEventListener('change', event => selectQuestion(Number(event.target.value)));
  $('question-list').addEventListener('click', event => { const button = event.target.closest('button[data-question]'); if (button) selectQuestion(Number(button.dataset.question)); });
  $('previous-question').addEventListener('click', () => selectQuestion(index - 1));
  $('next-question').addEventListener('click', () => selectQuestion(index + 1));
  $('print-worksheet').addEventListener('click', event => printPreview(false, event.currentTarget));
  $('print-answers').addEventListener('click', event => printPreview(true, event.currentTarget));
  render();
})();
