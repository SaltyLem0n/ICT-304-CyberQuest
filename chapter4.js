(function () {
  'use strict';
  const D = window.Chapter4Content, M = window.Chapter4Math;
  if (!D || !M) return;
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let lessonIndex = 0, questionIndex = 0, printTrigger = null, printScroll = 0;
  const attempts = new Map();
  function state(q) {
    if (!attempts.has(q.id)) attempts.set(q.id, { draft: {}, hint: false, solution: false });
    return attempts.get(q.id);
  }
  function table(block) {
    return `<div class="table-wrap" tabindex="0" role="region" aria-label="${escape(block.caption)}"><table><caption>${escape(block.caption)}</caption><thead><tr>${block.headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(c => `<td class="code">${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function blocks(items, forPrint = false) {
    return items.map(block => {
      switch (block.type) {
        case 'paragraph': return `<p>${escape(block.text)}</p>`;
        case 'note': return `<div class="callout"><p>${escape(block.text)}</p></div>`;
        case 'steps': return `<ol>${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ol>`;
        case 'table': return table(block);
        case 'flow': return `<ol class="flow" aria-label="Process in order">${block.items.map(item => `<li>${escape(item)}</li>`).join('')}</ol>`;
        case 'link': return `<p><a href="${escape(block.url)}" target="_blank" rel="noopener">${escape(block.text)} ↗</a></p>`;
        case 'detail': return forPrint ? `<section class="calculation"><h4>${escape(block.title)}</h4>${blocks(block.blocks, true)}</section>` : `<details class="reference"><summary>${escape(block.title)}</summary>${blocks(block.blocks)}</details>`;
        default: throw new Error('Unknown content block.');
      }
    }).join('');
  }
  function markNavigation(id, index) {
    $(id).querySelectorAll('button').forEach((button, i) => { if (i === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
  }
  function renderLesson(focus = false) {
    const lesson = D.lessons[lessonIndex];
    $('lesson-select').value = String(lessonIndex); markNavigation('lesson-list', lessonIndex);
    $('previous-lesson').disabled = lessonIndex === 0; $('next-lesson').disabled = lessonIndex === D.lessons.length - 1;
    $('lesson-position').textContent = `Lesson ${lessonIndex + 1} of ${D.lessons.length}`;
    $('lesson-panel').innerHTML = `<div class="eyebrow">Lesson ${lessonIndex + 1} / ${lesson.source === 'secret' ? 'Secret Key Cryptography' : 'Data Encryption Standard'}</div><h2 id="lesson-title" tabindex="-1">${escape(lesson.title)}</h2><p class="source"><a href="${D.sources[lesson.source]}#page=${lesson.page}" target="_blank" rel="noopener">Class slides ${lesson.source === 'secret' ? '4.1' : '4.2'} · pages ${escape(lesson.pages)} ↗</a></p>${blocks(lesson.blocks)}`;
    if (focus) focusTitle('lesson-title');
  }
  function desReferences(forPrint = false) {
    const references = [D.permutationReference('IP'), D.permutationReference('E', 6), D.permutationReference('PC1', 7), D.permutationReference('PC2', 6), D.permutationReference('P'), ...Array.from({ length: 8 }, (_, i) => D.sBoxReference(i))];
    if (forPrint) return `<section class="reference-appendix"><h2>DES reference tables</h2><p>Bit 1 is at the left. Table entries give input positions. S-box rows and columns start at 0. These tables contain the algorithm, not the worked practice values.</p>${blocks(references, true)}</section>`;
    return `<details class="reference"><summary>DES reference tables: IP, E, PC-1, PC-2, P and S1–S8</summary><p>Bit 1 is at the left. Scroll wide tables sideways. S-box row and column numbers start at 0.</p>${blocks(references)}</details>`;
  }
  function conventions() {
    return `<details class="reference"><summary>DES source clarifications and bit conventions</summary>${D.desNotes.map(text => `<p>${escape(text)}</p>`).join('')}<p><a href="${D.sources.nist}" target="_blank" rel="noopener">Compare the NIST DES tables ↗</a></p></details>`;
  }
  function questionBody(q) {
    return `<p class="exercise-prompt">${escape(q.prompt)}</p>${q.part === 2 ? `<div class="given"><strong>Given for Part 2</strong><p>Plaintext: <code>Computer</code> · Initial ASCII key: <code>ABCD1234</code></p><p class="field-note">Case matters. Use 64 key input bits and 56 effective bits after PC-1. Begin round one after IP.</p></div>` : '<p class="field-note">Use 365 days per year for the time questions. Questions 3 and 4 use the candidate count from question 2.</p>'}`;
  }
  function workedSolution(q, forPrint = false) {
    return `<h3>Worked solution</h3>${blocks(q.working, forPrint)}${q.fields.map(f => `<h4>${escape(f.label)}</h4><div class="answer">${escape(f.kind === 'binary' ? M.group(f.answer) : f.answer)}${f.kind === 'binary' ? `<br><span class="field-note">Hex: ${escape(M.group(M.toHex(f.answer), 2))}</span>` : ''}</div>`).join('')}`;
  }
  function renderQuestion(focus = false) {
    const q = D.questions[questionIndex], s = state(q);
    $('question-select').value = String(questionIndex); markNavigation('question-list', questionIndex);
    $('previous-question').disabled = questionIndex === 0; $('next-question').disabled = questionIndex === D.questions.length - 1;
    $('question-position').textContent = `Question ${questionIndex + 1} of ${D.questions.length}`;
    $('question-panel').innerHTML = `<div class="eyebrow">Part ${q.part} · Question ${q.number} / ${q.part === 1 ? 'Brute force' : 'DES round one'}</div><h2 id="question-title" tabindex="-1">${escape(q.title)}</h2><p class="source"><a href="${D.sources.practice}#page=${q.page}" target="_blank" rel="noopener">Original practice paper · page ${q.page} ↗</a></p><section class="method" aria-labelledby="method-title"><h3 id="method-title">How to approach it</h3><p>${escape(q.method)}</p></section>${questionBody(q)}${q.part === 2 ? conventions() + desReferences() : ''}<form id="answer-form" novalidate><h3>Your paper answer</h3><p class="field-note">${q.part === 2 ? 'Enter binary bits only. Spaces and line breaks are allowed. Keep every leading zero; hexadecimal is shown in the worked solution.' : 'Enter the exact count, or years rounded to two decimal places as labeled. Commas may separate thousands.'}</p>${q.fields.map(f => `<label for="answer-${f.id}">${escape(f.label)}</label><textarea id="answer-${f.id}" name="${f.id}" rows="${f.kind === 'binary' ? 2 : 1}" maxlength="1000" autocomplete="off" spellcheck="false" aria-describedby="feedback-${f.id}">${escape(s.draft[f.id] || '')}</textarea><p id="feedback-${f.id}" class="feedback" aria-live="polite"></p>`).join('')}<div class="actions"><button type="submit" class="primary">Check answer</button><button type="button" id="hint-button" aria-expanded="${s.hint}" aria-controls="hint">${s.hint ? 'Hide hint' : 'Show hint'}</button><button type="button" id="solution-button" aria-expanded="${s.solution}" aria-controls="worked-solution">${s.solution ? 'Hide worked solution' : 'Show worked solution'}</button></div></form><div id="hint" class="hint" ${s.hint ? '' : 'hidden'}>${escape(q.hint)}</div><section id="worked-solution" class="solution" ${s.solution ? '' : 'hidden'}>${s.solution ? workedSolution(q) : ''}</section>`;
    $('answer-form').addEventListener('input', event => {
      if (!event.target.matches('textarea')) return;
      s.draft[event.target.name] = event.target.value; event.target.removeAttribute('aria-invalid'); event.target.classList.remove('good');
      const feedback = $(`feedback-${event.target.name}`); feedback.textContent = ''; feedback.className = 'feedback';
    });
    $('answer-form').addEventListener('submit', event => {
      event.preventDefault();
      q.fields.forEach(f => { const input = $(`answer-${f.id}`), result = D.checkAnswer(q, f.id, input.value), feedback = $(`feedback-${f.id}`); feedback.textContent = result.message; feedback.className = `feedback ${result.status}`; input.setAttribute('aria-invalid', String(result.status !== 'correct')); input.classList.toggle('good', result.status === 'correct'); });
    });
    $('hint-button').addEventListener('click', () => { s.hint = !s.hint; $('hint').hidden = !s.hint; $('hint-button').textContent = s.hint ? 'Hide hint' : 'Show hint'; $('hint-button').setAttribute('aria-expanded', String(s.hint)); });
    $('solution-button').addEventListener('click', () => { s.solution = !s.solution; $('worked-solution').hidden = !s.solution; $('worked-solution').innerHTML = s.solution ? workedSolution(q) : ''; $('solution-button').textContent = s.solution ? 'Hide worked solution' : 'Show worked solution'; $('solution-button').setAttribute('aria-expanded', String(s.solution)); });
    if (focus) focusTitle('question-title');
  }
  function focusTitle(id) { $(id).focus({ preventScroll: true }); $(id).scrollIntoView({ block: 'start' }); }
  function showView(practice, focus = true) {
    $('lessons-view').hidden = practice; $('practice-view').hidden = !practice;
    $('show-lessons').setAttribute('aria-pressed', String(!practice)); $('show-practice').setAttribute('aria-pressed', String(practice));
    if (focus) focusTitle(practice ? 'question-title' : 'lesson-title');
  }
  function printPreview(withAnswers, trigger) {
    printTrigger = trigger; printScroll = window.scrollY;
    $('print-area').innerHTML = `<div class="print-controls"><button id="close-print">← Back to Chapter 4</button><button id="print-now">Print / Save as PDF</button></div><h1>Chapter 4 · ${withAnswers ? 'Worked answers' : 'Blank practice worksheet'}</h1><p>ICT 304 · 7 questions from the original practice paper</p><p>Conventions: 365 days per year; exhaustive search times. DES: bit 1 at the left; apply IP before round one; use PC-1 on the original 64 key bits. Key state (56 bits) and round subkey (48 bits) are different.</p>${D.questions.map(q => `<section class="print-question"><h2>Part ${q.part} · ${q.number}) ${escape(q.title)}</h2><p class="source">Original practice paper · page ${q.page}</p>${questionBody(q)}${withAnswers ? workedSolution(q, true) : q.fields.map(f => `<p>${escape(f.label)}</p><div class="answer-line" aria-hidden="true"></div>`).join('') + '<div class="work-box" aria-label="Space for paper working"></div>'}</section>`).join('')}<section class="print-notes"><h2>Source clarifications</h2>${D.desNotes.map(text => `<p>${escape(text)}</p>`).join('')}<p>DES tables checked against NIST FIPS 46-3. The original class PDFs are unchanged.</p></section>${desReferences(true)}`;
    document.body.classList.add('print-preview'); window.scrollTo({ top: 0 });
    $('close-print').addEventListener('click', () => { document.body.classList.remove('print-preview'); $('print-area').innerHTML = ''; window.scrollTo({ top: printScroll }); printTrigger.focus({ preventScroll: true }); });
    $('print-now').addEventListener('click', () => window.print()); $('close-print').focus({ preventScroll: true });
  }
  function setupNavigation(prefix, entries, label, select) {
    $(`${prefix}-select`).innerHTML = entries.map((entry, i) => `<option value="${i}">${escape(label(entry, i))}</option>`).join('');
    $(`${prefix}-list`).innerHTML = entries.map((entry, i) => `<button type="button" data-index="${i}">${escape(label(entry, i))}</button>`).join('');
    $(`${prefix}-select`).addEventListener('change', event => select(Number(event.target.value)));
    $(`${prefix}-list`).addEventListener('click', event => { const button = event.target.closest('button[data-index]'); if (button) select(Number(button.dataset.index)); });
  }
  const selectLesson = next => { if (next >= 0 && next < D.lessons.length) { lessonIndex = next; renderLesson(true); } };
  const selectQuestion = next => { if (next >= 0 && next < D.questions.length) { questionIndex = next; renderQuestion(true); } };
  setupNavigation('lesson', D.lessons, (entry, i) => `${i + 1}. ${entry.title}`, selectLesson);
  setupNavigation('question', D.questions, entry => `Part ${entry.part} · ${entry.number}) ${entry.title}`, selectQuestion);
  $('previous-lesson').addEventListener('click', () => selectLesson(lessonIndex - 1)); $('next-lesson').addEventListener('click', () => selectLesson(lessonIndex + 1));
  $('previous-question').addEventListener('click', () => selectQuestion(questionIndex - 1)); $('next-question').addEventListener('click', () => selectQuestion(questionIndex + 1));
  $('show-lessons').addEventListener('click', () => showView(false)); $('show-practice').addEventListener('click', () => showView(true)); $('start-practice').addEventListener('click', () => showView(true));
  $('print-worksheet').addEventListener('click', event => printPreview(false, event.currentTarget)); $('print-answers').addEventListener('click', event => printPreview(true, event.currentTarget));
  renderLesson(); renderQuestion();
})();
