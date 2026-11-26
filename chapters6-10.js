/**
 * chapters6-10.js
 * OOP Controller for ICT 304 Chapters 6-10, Labs 1-5, and Mixed Exam Practice.
 * Implements durable exposure tracking (assisted/exposed attempts cannot earn
 * independent credit), strict RSA validation, simulated lab drills, and
 * dynamic progressive hints.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'cyberquest_ch6_10_state_v3';
  const MAX_TEXTBOOK_PRIME = 10000n;

  const I18N = {
    en: {
      dashboard: 'Dashboard',
      back: '← Back',
      translate: 'TH / EN',
      lessonsTab: '01 · Micro-Lessons (Ch 6–10)',
      labsTab: '02 · Lab CLI & Simulated Drills',
      toolsTab: '03 · Guided RSA & Base64',
      quizTab: '04 · Active Recall & Revisit List',
      printBlank: 'Print blank worksheet',
      printKey: 'Print worked key',
      resetBtn: 'Reset progress'
    },
    th: {
      dashboard: 'หน้าหลัก',
      back: '← ย้อนกลับ',
      translate: 'EN / TH',
      lessonsTab: '01 · บทเรียนย่อย (บทที่ 6–10)',
      labsTab: '02 · แล็บ CLI และฝึกแก้ปัญหาจำลอง',
      toolsTab: '03 · ฝึกคำนวณ RSA และ Base64',
      quizTab: '04 · แบบฝึกทบทวนและรายการทบทวนซ้ำ',
      printBlank: 'พิมพ์ใบงานเปล่า',
      printKey: 'พิมพ์เฉลยละเอียด',
      resetBtn: 'รีเซ็ตความคืบหน้า'
    }
  };

  function modPow(base, exp, mod) {
    let b = ((BigInt(base) % BigInt(mod)) + BigInt(mod)) % BigInt(mod);
    let e = BigInt(exp);
    const m = BigInt(mod);
    if (m === 1n) return 0n;
    let res = 1n;
    while (e > 0n) {
      if (e & 1n) res = (res * b) % m;
      b = (b * b) % m;
      e >>= 1n;
    }
    return res;
  }

  function gcdBigInt(a, b) {
    let x = a < 0n ? -a : a;
    let y = b < 0n ? -b : b;
    while (y !== 0n) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x;
  }

  function isPrimeBigInt(n) {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n || n % 3n === 0n) return false;
    for (let i = 5n; i * i <= n; i += 6n) {
      if (n % i === 0n || n % (i + 2n) === 0n) return false;
    }
    return true;
  }

  function modInverseBigInt(e, z) {
    if (z <= 1n) return null;
    let oldR = z;
    let r = ((e % z) + z) % z;
    let oldT = 0n;
    let t = 1n;
    while (r !== 0n) {
      const q = oldR / r;
      [oldR, r] = [r, oldR - q * r];
      [oldT, t] = [t, oldT - q * t];
    }
    if (oldR !== 1n) return null;
    return oldT < 0n ? oldT + z : oldT;
  }

  function parseBigIntStrict(val) {
    const s = String(val ?? '').trim();
    if (!/^-?\d+$/.test(s)) return null;
    return BigInt(s);
  }

  function validateRsaInputs({ p, q, e, h }) {
    const pVal = parseBigIntStrict(p);
    const qVal = parseBigIntStrict(q);
    const eVal = parseBigIntStrict(e);
    const hVal = parseBigIntStrict(h);

    if (pVal === null || qVal === null || eVal === null || hVal === null) {
      return { ok: false, error: 'All RSA fields (p, q, e, H) must be whole integers.' };
    }
    if (pVal < 2n || pVal > MAX_TEXTBOOK_PRIME || qVal < 2n || qVal > MAX_TEXTBOOK_PRIME) {
      return { ok: false, error: `Primes p and q must be between 2 and ${MAX_TEXTBOOK_PRIME} for textbook exercises.` };
    }
    if (!isPrimeBigInt(pVal)) {
      return { ok: false, error: `p = ${pVal} is not prime. Select a prime number.` };
    }
    if (!isPrimeBigInt(qVal)) {
      return { ok: false, error: `q = ${qVal} is not prime. Select a prime number.` };
    }
    if (pVal === qVal) {
      return { ok: false, error: `p and q must be distinct primes (both are ${pVal}).` };
    }

    const n = pVal * qVal;
    const z = (pVal - 1n) * (qVal - 1n);

    if (eVal <= 1n || eVal >= z) {
      return { ok: false, error: `Public exponent e = ${eVal} must satisfy 1 < e < φ(n) (${z}).` };
    }
    const g = gcdBigInt(eVal, z);
    if (g !== 1n) {
      return { ok: false, error: `e = ${eVal} is not invertible modulo φ(n) = ${z} because gcd(${eVal}, ${z}) = ${g} ≠ 1.` };
    }
    if (hVal < 0n || hVal >= n) {
      return { ok: false, error: `Hash H = ${hVal} must satisfy 0 ≤ H < n (${n}).` };
    }

    const d = modInverseBigInt(eVal, z);
    if (d === null || d <= 0n || d >= z || (eVal * d) % z !== 1n) {
      return { ok: false, error: 'Failed to derive a valid positive modular inverse d.' };
    }

    return { ok: true, p: pVal, q: qVal, e: eVal, h: hVal, n, z, d };
  }

  function rsaExerciseKey({ p, q, e, h }) {
    const a = p <= q ? p : q;
    const b = p <= q ? q : p;
    return `${a}|${b}|${e}|${h}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class EvidenceTracker {
    static statusRank(status) {
      const ranks = { unseen: 0, viewed: 1, attempted: 2, helped: 3, independent: 4 };
      return ranks[status] || 0;
    }

    static badgeText(status) {
      const map = {
        unseen: 'Unseen',
        viewed: 'Viewed',
        attempted: 'Attempted (Revisit)',
        helped: 'Solved with Help',
        independent: 'Independent ✓'
      };
      return map[status] || 'Unseen';
    }
  }

  const RSA_FRESH_EXERCISES = [
    { p: '13', q: '17', e: '7', h: '180' },
    { p: '17', q: '19', e: '5', h: '42' },
    { p: '11', q: '23', e: '3', h: '95' },
    { p: '13', q: '29', e: '5', h: '111' },
    { p: '19', q: '23', e: '7', h: '205' }
  ];

  class ExamStudyApp {
    constructor(data) {
      this.data = data;
      this.state = this.loadState();
      this.activeView = 'lessons';
      this.activeChapterId = this.data.CHAPTERS[0].id;
      this.quizFilter = 'all';
      this.quizAnswers = {};
      this.quizHintOpen = {};
      this.lessonPracticeAnswers = {};
      this.lessonHintOpenCount = {};
      this.drillAnswers = {};
      this.drillHintOpenCount = {};
      this.guidedSigHintLevel = 0;
      this.rsaExerciseIndex = 0;
      this.lang = this.state.lang || 'en';
    }

    loadState() {
      const empty = {
        lessonEvidence: {},
        questionEvidence: {},
        drillEvidence: {},
        rsaEvidence: {},
        exposure: { lesson: {}, question: {}, drill: {}, rsa: {} },
        freshRsaIndependentCount: 0,
        lang: 'en'
      };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...empty,
            ...parsed,
            rsaEvidence: parsed.rsaEvidence || {},
            exposure: {
              lesson: (parsed.exposure && parsed.exposure.lesson) || {},
              question: (parsed.exposure && parsed.exposure.question) || {},
              drill: (parsed.exposure && parsed.exposure.drill) || {},
              rsa: (parsed.exposure && parsed.exposure.rsa) || {}
            }
          };
        }
      } catch (_) {
        const notice = document.getElementById('storage-notice');
        if (notice) notice.hidden = false;
      }
      return empty;
    }

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (_) {
        const notice = document.getElementById('storage-notice');
        if (notice) notice.hidden = false;
      }
    }

    markExposed(group, id, flag) {
      this.state.exposure[group] = this.state.exposure[group] || {};
      const rec = this.state.exposure[group][id] || { hintUsed: false, wrongAttempted: false, solutionRevealed: false };
      rec[flag] = true;
      this.state.exposure[group][id] = rec;
      this.saveState();
    }

    isExposed(group, id) {
      const rec = (this.state.exposure[group] && this.state.exposure[group][id]) || {};
      return Boolean(rec.hintUsed || rec.wrongAttempted || rec.solutionRevealed);
    }

    setEvidence(bucket, id, newStatus) {
      this.state[bucket] = this.state[bucket] || {};
      const prev = this.state[bucket][id] || 'unseen';
      if (newStatus === 'viewed' && EvidenceTracker.statusRank(prev) > 1) return;
      if (newStatus === 'independent' && (prev === 'attempted' || prev === 'helped')) return;
      if (newStatus === 'attempted' && (prev === 'independent' || prev === 'helped')) return;
      this.state[bucket][id] = newStatus;
      this.saveState();
      this.updateStats();
    }

    recordChoiceOutcome(evBucket, expGroup, id, isCorrect) {
      if (!isCorrect) {
        this.markExposed(expGroup, id, 'wrongAttempted');
        this.setEvidence(evBucket, id, 'attempted');
        return 'attempted';
      }
      const exposed = this.isExposed(expGroup, id);
      const outcome = exposed ? 'helped' : 'independent';
      this.setEvidence(evBucket, id, outcome);
      return outcome;
    }

    init() {
      this.bindEvents();
      this.applyHashRoute();
      this.applyLanguage();
      this.renderLessons();
      this.renderLabs();
      this.renderQuiz();
      this.updateStats();
    }

    applyHashRoute() {
      const hash = (window.location.hash || '').replace('#', '').toLowerCase();
      if (!hash) return;
      if (hash === 'labs') {
        this.switchView('labs');
      } else if (hash === 'quiz' || hash === 'mixed') {
        this.quizFilter = 'all';
        this.switchView('quiz');
      } else if (hash === 'tools') {
        this.switchView('tools');
      } else if (this.data.CHAPTERS.some(c => c.id === hash)) {
        this.activeChapterId = hash;
        this.switchView('lessons');
      }
    }

    bindEvents() {
      document.querySelectorAll('.tabs button[data-view]').forEach(btn => {
        btn.addEventListener('click', () => this.switchView(btn.dataset.view));
      });

      const backBtn = document.getElementById('back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.history.length > 1) window.history.back();
          else window.location.href = 'index.html';
        });
      }

      const langBtn = document.getElementById('lang-toggle');
      if (langBtn) {
        langBtn.addEventListener('click', () => {
          this.lang = this.lang === 'en' ? 'th' : 'en';
          this.state.lang = this.lang;
          this.saveState();
          this.applyLanguage();
          this.renderLessons();
        });
      }

      const labSearch = document.getElementById('lab-search');
      if (labSearch) {
        labSearch.addEventListener('input', () => {
          if (window.SmartSearch) {
            window.SmartSearch.filterTableRows(labSearch.value, '.lab-cmd-row');
          }
        });
      }

      const quizFilterEl = document.getElementById('quiz-filter');
      if (quizFilterEl) {
        quizFilterEl.addEventListener('change', () => {
          this.quizFilter = quizFilterEl.value;
          this.renderQuiz();
        });
      }

      const b64Btn = document.getElementById('b64-run');
      if (b64Btn) b64Btn.addEventListener('click', () => this.runBase64Tool());

      const sigCheckBtn = document.getElementById('sig-check-steps');
      if (sigCheckBtn) sigCheckBtn.addEventListener('click', () => this.checkGuidedSignatureSteps());

      const sigHintBtn = document.getElementById('sig-next-hint');
      if (sigHintBtn) sigHintBtn.addEventListener('click', () => this.showNextGuidedSigHint());

      const sigSolBtn = document.getElementById('sig-show-solution');
      if (sigSolBtn) sigSolBtn.addEventListener('click', () => this.showGuidedSigSolution());

      const sigNewBtn = document.getElementById('sig-new-exercise');
      if (sigNewBtn) sigNewBtn.addEventListener('click', () => this.loadFreshRsaExercise());

      const printBlank = document.getElementById('print-worksheet');
      if (printBlank) printBlank.addEventListener('click', () => this.printMaterial(false));

      const printKey = document.getElementById('print-answers');
      if (printKey) printKey.addEventListener('click', () => this.printMaterial(true));

      const resetBtn = document.getElementById('reset-progress');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.state = {
            lessonEvidence: {},
            questionEvidence: {},
            drillEvidence: {},
            rsaEvidence: {},
            exposure: { lesson: {}, question: {}, drill: {}, rsa: {} },
            freshRsaIndependentCount: 0,
            lang: this.lang
          };
          this.quizAnswers = {};
          this.quizHintOpen = {};
          this.lessonPracticeAnswers = {};
          this.lessonHintOpenCount = {};
          this.drillAnswers = {};
          this.drillHintOpenCount = {};
          this.guidedSigHintLevel = 0;
          this.saveState();
          this.renderLessons();
          this.renderLabs();
          this.renderQuiz();
          this.updateStats();
        });
      }
    }

    applyLanguage() {
      const t = I18N[this.lang] || I18N.en;
      const map = {
        'dash-link': t.dashboard,
        'back-btn': t.back,
        'lang-toggle': t.translate,
        'tab-lessons': t.lessonsTab,
        'tab-labs': t.labsTab,
        'tab-tools': t.toolsTab,
        'tab-quiz': t.quizTab,
        'print-worksheet': t.printBlank,
        'print-answers': t.printKey,
        'reset-progress': t.resetBtn
      };
      Object.entries(map).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      });
    }

    switchView(viewId) {
      this.activeView = viewId;
      document.querySelectorAll('.tabs button[data-view]').forEach(btn => {
        const isCurrent = btn.dataset.view === viewId;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-current', isCurrent ? 'page' : 'false');
      });
      document.querySelectorAll('main .view').forEach(sec => {
        sec.hidden = sec.id !== `view-${viewId}`;
      });
    }

    updateStats() {
      const totalLessons = this.data.CHAPTERS.reduce((acc, c) => acc + c.lessons.length, 0);
      const lEv = this.state.lessonEvidence || {};
      const qEv = this.state.questionEvidence || {};
      const reviewedOrDone = Object.values(lEv).filter(v => EvidenceTracker.statusRank(v) >= 1).length;
      const indQuestions = Object.values(qEv).filter(v => v === 'independent').length;
      const revisitCount = Object.values(qEv).filter(v => v === 'attempted' || v === 'helped').length
        + Object.values(lEv).filter(v => v === 'attempted' || v === 'helped').length;

      const lEl = document.getElementById('stat-lessons');
      const qEl = document.getElementById('stat-mastered');
      const rEl = document.getElementById('stat-revisit');
      if (lEl) lEl.textContent = `${reviewedOrDone} / ${totalLessons}`;
      if (qEl) qEl.textContent = `${indQuestions} / ${this.data.QUESTIONS.length}`;
      if (rEl) rEl.textContent = String(revisitCount);
    }

    renderLessons() {
      const nav = document.getElementById('chapter-nav');
      const container = document.getElementById('lesson-content');
      if (!nav || !container) return;

      nav.innerHTML = this.data.CHAPTERS.map(ch => {
        const active = ch.id === this.activeChapterId ? 'active' : '';
        const label = this.lang === 'th' ? `บทที่ ${ch.number} · ${ch.titleTh}` : `Ch ${ch.number} · ${ch.title}`;
        return `<button type="button" class="${active}" data-ch="${ch.id}">${escapeHtml(label)}</button>`;
      }).join('');

      nav.querySelectorAll('button[data-ch]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeChapterId = btn.dataset.ch;
          this.renderLessons();
        });
      });

      const ch = this.data.CHAPTERS.find(c => c.id === this.activeChapterId) || this.data.CHAPTERS[0];
      const chTitle = this.lang === 'th' ? `${ch.title} (${ch.titleTh})` : ch.title;

      let html = `
        <div class="panel">
          <div class="eyebrow">Chapter ${ch.number} · Verified Source: ${escapeHtml(ch.sourcePdf)} (${ch.pageCount}p)</div>
          <h2>${escapeHtml(chTitle)}</h2>
          <p class="muted">${escapeHtml(ch.summary)}</p>
          <div class="actions">
            <button type="button" class="small primary" id="practice-this-ch">Practise Ch ${ch.number} Quiz →</button>
          </div>
        </div>
      `;

      ch.lessons.forEach(lesson => {
        const ev = (this.state.lessonEvidence && this.state.lessonEvidence[lesson.id]) || 'unseen';
        const chosen = this.lessonPracticeAnswers[lesson.id];
        const hintLvl = this.lessonHintOpenCount[lesson.id] || 0;
        const exposed = this.isExposed('lesson', lesson.id);

        html += `<article class="panel">
          <div class="step-head">
            <div>
              <span class="tag">${escapeHtml(lesson.ref)}</span>
              <span class="tag">${escapeHtml(EvidenceTracker.badgeText(ev))}</span>
              <h3>${escapeHtml(lesson.title)}</h3>
            </div>
            <button type="button" class="small ${ev !== 'unseen' ? 'active' : ''}" data-view-lesson="${lesson.id}">
              ${ev === 'unseen' ? 'Mark viewed' : 'Viewed ✓'}
            </button>
          </div>
          <div class="callout good" style="margin-top:.6rem">
            <strong>Learning Objective:</strong> ${escapeHtml(lesson.objective)}<br>
            <small><strong>Prerequisites:</strong> ${escapeHtml((lesson.prerequisites || []).join(' · '))}</small>
          </div>
        `;

        if (lesson.simpleExplanation) {
          html += `<details class="answer-details" style="margin:.7rem 0;border:1px solid var(--line);border-radius:10px;padding:.65rem .9rem">
            <summary style="cursor:pointer;color:var(--cyan);font-weight:650">Simple Explanation &amp; Analogy (with limitation)</summary>
            <p>${escapeHtml(lesson.simpleExplanation.summary)}</p>
            <p><small><strong>Analogy:</strong> ${escapeHtml(lesson.simpleExplanation.analogy)}<br><strong>Where the analogy stops:</strong> ${escapeHtml(lesson.simpleExplanation.limitation)}</small></p>
          </details>`;
        }

        html += `<div>${lesson.body.map(p => `<p>${p}</p>`).join('')}</div>`;

        if (lesson.table) {
          html += `<div class="table-wrap"><table><thead><tr>${lesson.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>
            ${lesson.table.rows.map(r => `<tr>${r.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody></table></div>`;
        }

        if (lesson.workedExample) {
          html += `<div class="callout good">
            <strong>Worked Example · ${escapeHtml(lesson.workedExample.title)}</strong>
            <p>${escapeHtml(lesson.workedExample.prompt)}</p>
            <ol>${lesson.workedExample.steps.map(s => `<li><code>${escapeHtml(s)}</code></li>`).join('')}</ol>
          </div>`;
        }

        if (lesson.auditNote) {
          html += `<div class="callout warn">
            <strong>Source Correction / Clarification (${escapeHtml(lesson.auditNote.ref)})</strong>
            <p>${escapeHtml(lesson.auditNote.text)}</p>
          </div>`;
        }

        if (lesson.pendingNote) {
          html += `<div class="callout">
            <strong>Pending Lab Coverage</strong>
            <p>${escapeHtml(lesson.pendingNote)}</p>
          </div>`;
        }

        if (lesson.immediatePractice) {
          const ip = lesson.immediatePractice;
          const hintsShown = ip.hints.slice(0, hintLvl);
          html += `<div class="quiz-card" style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)">
            <span class="step-num">Immediate Practice Check</span>
            ${exposed && ev !== 'independent' ? '<span class="tag">Assisted / Exposed (cannot earn Independent on this item)</span>' : ''}
            <p class="exercise-prompt">${escapeHtml(ip.question)}</p>
            <div class="actions">
              ${hintLvl < ip.hints.length ? `<button type="button" class="small text" data-lhint="${lesson.id}">Hint (${hintLvl}/${ip.hints.length})</button>` : ''}
            </div>
            ${hintsShown.map((h, i) => `<div class="hint"><strong>Hint ${i + 1}:</strong> ${escapeHtml(h)}</div>`).join('')}
            <div style="margin-top:.5rem">
              ${ip.options.map((opt, oi) => {
                let cls = 'option';
                if (chosen !== undefined) {
                  if (oi === ip.correctIndex) cls += ' good';
                  else if (oi === chosen) cls += ' bad';
                }
                return `<button type="button" class="${cls}" data-lpractice="${lesson.id}" data-oi="${oi}">${String.fromCharCode(65 + oi)}. ${escapeHtml(opt)}</button>`;
              }).join('')}
            </div>
            ${chosen !== undefined ? `<div class="feedback ${chosen === ip.correctIndex ? 'correct' : 'incorrect'}">
              <strong>${chosen === ip.correctIndex ? '✓ Correct' : '✗ Incorrect'}</strong> — ${escapeHtml(ip.optionFeedback[chosen])}
            </div>` : ''}
          </div>`;
        }

        html += `</article>`;
      });

      container.innerHTML = html;

      const practBtn = document.getElementById('practice-this-ch');
      if (practBtn) {
        practBtn.addEventListener('click', () => {
          this.quizFilter = ch.id;
          const sel = document.getElementById('quiz-filter');
          if (sel) sel.value = ch.id;
          this.switchView('quiz');
          this.renderQuiz();
        });
      }

      container.querySelectorAll('button[data-view-lesson]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setEvidence('lessonEvidence', btn.dataset.viewLesson, 'viewed');
          this.renderLessons();
        });
      });

      container.querySelectorAll('button[data-lhint]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lid = btn.dataset.lhint;
          this.lessonHintOpenCount[lid] = (this.lessonHintOpenCount[lid] || 0) + 1;
          this.markExposed('lesson', lid, 'hintUsed');
          this.renderLessons();
        });
      });

      container.querySelectorAll('button[data-lpractice]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lid = btn.dataset.lpractice;
          const oi = Number(btn.dataset.oi);
          this.lessonPracticeAnswers[lid] = oi;
          const lesson = ch.lessons.find(x => x.id === lid);
          if (lesson && lesson.immediatePractice) {
            this.recordChoiceOutcome('lessonEvidence', 'lesson', lid, oi === lesson.immediatePractice.correctIndex);
          }
          this.renderLessons();
        });
      });
    }

    renderLabs() {
      const tbody = document.getElementById('lab-cmd-body');
      if (tbody) {
        tbody.innerHTML = this.data.LAB_COMMANDS.map(row => `
          <tr class="lab-cmd-row">
            <td><span class="tag">${escapeHtml(row.lab)}</span></td>
            <td><code>${escapeHtml(row.cmd)}</code></td>
            <td>${escapeHtml(row.mode)}</td>
            <td>${escapeHtml(row.purpose)}</td>
            <td><code>${escapeHtml(row.verify)}</code></td>
            <td>${escapeHtml(row.mistake)}</td>
          </tr>
        `).join('');
      }

      const drillsEl = document.getElementById('lab-drills-container');
      if (!drillsEl || !this.data.LAB_DRILLS) return;

      drillsEl.innerHTML = this.data.LAB_DRILLS.map((d, idx) => {
        const chosen = this.drillAnswers[d.id];
        const hintLvl = this.drillHintOpenCount[d.id] || 0;
        const ev = (this.state.drillEvidence && this.state.drillEvidence[d.id]) || 'unseen';
        const hintsShown = d.hints.slice(0, hintLvl);

        return `<article class="quiz-card">
          <div class="step-head">
            <div>
              <span class="step-num">Drill ${idx + 1} · ${escapeHtml(d.lab)}</span>
              <span class="tag">${escapeHtml(d.ref)}</span>
              <span class="tag">Simulated Output (Not Executed in Packet Tracer)</span>
            </div>
            <span class="tag">${escapeHtml(EvidenceTracker.badgeText(ev))}</span>
          </div>
          <p class="exercise-prompt">${escapeHtml(d.prompt)}</p>
          <pre style="background:#0b1425;border:1px solid var(--line);padding:.75rem;border-radius:8px;overflow:auto;font-size:.85rem"><code>${escapeHtml(d.simulatedOutput)}</code></pre>
          <div class="actions">
            ${hintLvl < d.hints.length ? `<button type="button" class="small text" data-dhint="${d.id}">Hint (${hintLvl}/${d.hints.length})</button>` : ''}
          </div>
          ${hintsShown.map((h, i) => `<div class="hint"><strong>Hint ${i + 1}:</strong> ${escapeHtml(h)}</div>`).join('')}
          <div style="margin-top:.5rem">
            ${d.options.map((opt, oi) => {
              let cls = 'option';
              if (chosen !== undefined) {
                if (oi === d.correctIndex) cls += ' good';
                else if (oi === chosen) cls += ' bad';
              }
              return `<button type="button" class="${cls}" data-drill="${d.id}" data-oi="${oi}">${String.fromCharCode(65 + oi)}. ${escapeHtml(opt)}</button>`;
            }).join('')}
          </div>
          ${chosen !== undefined ? `<div class="feedback ${chosen === d.correctIndex ? 'correct' : 'incorrect'}">
            <strong>${chosen === d.correctIndex ? '✓ Correct' : '✗ Incorrect'}</strong> — ${escapeHtml(d.optionFeedback[chosen])}
          </div>` : ''}
        </article>`;
      }).join('');

      drillsEl.querySelectorAll('button[data-dhint]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.dhint;
          this.drillHintOpenCount[id] = (this.drillHintOpenCount[id] || 0) + 1;
          this.markExposed('drill', id, 'hintUsed');
          this.renderLabs();
        });
      });

      drillsEl.querySelectorAll('button[data-drill]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.drill;
          const oi = Number(btn.dataset.oi);
          this.drillAnswers[id] = oi;
          const d = this.data.LAB_DRILLS.find(x => x.id === id);
          if (d) {
            this.recordChoiceOutcome('drillEvidence', 'drill', id, oi === d.correctIndex);
          }
          this.renderLabs();
        });
      });
    }

    runBase64Tool() {
      const mode = document.getElementById('b64-mode').value;
      const input = document.getElementById('b64-input').value;
      const out = document.getElementById('b64-output');
      try {
        if (mode === 'encode') {
          const bytes = new TextEncoder().encode(input);
          let bin = '';
          bytes.forEach(b => { bin += String.fromCharCode(b); });
          const encoded = btoa(bin);
          const bitChunks = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
          out.className = 'status success';
          out.innerHTML = `<strong>Base64:</strong> <code>${escapeHtml(encoded)}</code><br><small>Bytes (8-bit): <code>${escapeHtml(bitChunks)}</code> · Length: ${bytes.length} bytes (${bytes.length % 3 === 0 ? 'no padding' : bytes.length % 3 === 2 ? '1 "=" pad' : '2 "==" pads'})</small>`;
        } else {
          const bin = atob(input.trim());
          const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
          const decoded = new TextDecoder().decode(bytes);
          out.className = 'status success';
          out.innerHTML = `<strong>Decoded Text:</strong> <code>${escapeHtml(decoded)}</code>`;
        }
      } catch (err) {
        out.className = 'status error';
        out.textContent = `Invalid input: ${err.message}`;
      }
    }

    loadFreshRsaExercise() {
      this.rsaExerciseIndex = (this.rsaExerciseIndex + 1) % RSA_FRESH_EXERCISES.length;
      const ex = RSA_FRESH_EXERCISES[this.rsaExerciseIndex];
      document.getElementById('sig-p').value = ex.p;
      document.getElementById('sig-q').value = ex.q;
      document.getElementById('sig-e').value = ex.e;
      document.getElementById('sig-h').value = ex.h;
      document.getElementById('sig-ans-n').value = '';
      document.getElementById('sig-ans-z').value = '';
      document.getElementById('sig-ans-d').value = '';
      document.getElementById('sig-ans-s').value = '';
      this.guidedSigHintLevel = 0;
      const box = document.getElementById('sig-hints');
      if (box) box.innerHTML = '';
      const out = document.getElementById('sig-output');
      if (out) {
        const key = rsaExerciseKey({ p: BigInt(ex.p), q: BigInt(ex.q), e: BigInt(ex.e), h: BigInt(ex.h) });
        const prior = (this.state.rsaEvidence && this.state.rsaEvidence[key]) || null;
        out.className = 'status';
        out.textContent = prior
          ? `Loaded exercise p=${ex.p}, q=${ex.q}, e=${ex.e}, H=${ex.h} (prior status: ${EvidenceTracker.badgeText(prior)}).`
          : `Loaded fresh exercise: p=${ex.p}, q=${ex.q}, e=${ex.e}, H=${ex.h}.`;
      }
    }

    checkGuidedSignatureSteps() {
      const out = document.getElementById('sig-output');
      const v = validateRsaInputs({
        p: document.getElementById('sig-p').value,
        q: document.getElementById('sig-q').value,
        e: document.getElementById('sig-e').value,
        h: document.getElementById('sig-h').value
      });
      if (!v.ok) {
        out.className = 'status error';
        out.textContent = `✗ Invalid RSA inputs: ${v.error}`;
        return;
      }

      const key = rsaExerciseKey(v);
      const ansN = parseBigIntStrict(document.getElementById('sig-ans-n').value);
      const ansZ = parseBigIntStrict(document.getElementById('sig-ans-z').value);
      const ansD = parseBigIntStrict(document.getElementById('sig-ans-d').value);
      const ansS = parseBigIntStrict(document.getElementById('sig-ans-s').value);

      if (ansN === null || ansZ === null || ansD === null || ansS === null) {
        out.className = 'status error';
        out.textContent = 'Enter whole integers for n, φ(n), d, and S before checking.';
        return;
      }

      const errs = [];
      if (ansN !== v.n) errs.push(`n = p × q = ${v.p} × ${v.q} (you entered ${ansN}).`);
      if (ansZ !== v.z) {
        if (ansZ === v.n) errs.push('You entered n for φ(n)! Remember φ(n) = (p − 1)(q − 1), NOT p × q.');
        else errs.push(`φ(n) = (p − 1)(q − 1) (you entered ${ansZ}).`);
      }
      if (ansD <= 0n || ansD >= v.z || (v.e * ansD) % v.z !== 1n) {
        errs.push(`d must satisfy 1 ≤ d < φ(n) and e·d ≡ 1 (mod φ(n)), NOT mod n. Check ${v.e} × ${ansD} mod ${v.z}.`);
      }
      const expectedS = modPow(v.h, v.d, v.n);
      const ver = modPow(ansS, v.e, v.n);
      if (ansS < 0n || ansS >= v.n || ansS !== expectedS || ver !== v.h) {
        errs.push(`Signature S = H^d mod n must use modulus n = ${v.n} and verify back to H = ${v.h} (got S^e mod n = ${ver}).`);
      }

      if (errs.length === 0) {
        out.className = 'status success';
        this.state.rsaEvidence = this.state.rsaEvidence || {};
        const prev = this.state.rsaEvidence[key] || 'unseen';
        const exposed = this.isExposed('rsa', key);

        if (prev === 'independent') {
          out.innerHTML = `✓ All steps verified (<strong>already credited</strong> for this exercise — load a different problem for new credit): <code>n = ${v.n}</code>, <code>φ(n) = ${v.z}</code>, <code>d = ${ansD}</code>, <code>S = ${ansS}</code>, and <code>${ansS}^${v.e} mod ${v.n} = ${ver} = H</code>.`;
        } else if (exposed || prev === 'attempted' || prev === 'helped') {
          this.setEvidence('rsaEvidence', key, 'helped');
          out.innerHTML = `✓ Steps verified (<strong>with help</strong> — solve a different unexposed exercise for independent credit): <code>n = ${v.n}</code>, <code>φ(n) = ${v.z}</code>, <code>d = ${ansD}</code>, <code>S = ${ansS}</code>, and <code>${ansS}^${v.e} mod ${v.n} = ${ver} = H</code>.`;
        } else {
          this.setEvidence('rsaEvidence', key, 'independent');
          this.state.freshRsaIndependentCount = Object.values(this.state.rsaEvidence).filter(s => s === 'independent').length;
          this.saveState();
          out.innerHTML = `✓ All steps verified <strong>independently</strong>! <code>n = ${v.n}</code>, <code>φ(n) = ${v.z}</code>, <code>d = ${ansD}</code>, <code>S = ${ansS}</code>, and <code>${ansS}^${v.e} mod ${v.n} = ${ver} = H</code>.`;
        }
      } else {
        this.markExposed('rsa', key, 'wrongAttempted');
        this.setEvidence('rsaEvidence', key, 'attempted');
        out.className = 'status error';
        out.innerHTML = errs.map(x => `<div>✗ ${escapeHtml(x)}</div>`).join('');
      }
    }

    showNextGuidedSigHint() {
      const v = validateRsaInputs({
        p: document.getElementById('sig-p').value,
        q: document.getElementById('sig-q').value,
        e: document.getElementById('sig-e').value,
        h: document.getElementById('sig-h').value
      });
      const box = document.getElementById('sig-hints');
      if (!v.ok) {
        if (box) box.innerHTML = `<div class="hint">Fix inputs first: ${escapeHtml(v.error)}</div>`;
        return;
      }
      this.markExposed('rsa', rsaExerciseKey(v), 'hintUsed');
      const hints = [
        `Hint 1 (n vs φ(n)): For your current inputs p=${v.p}, q=${v.q}, compute n = p × q = ${v.n}, and φ(n) = (${v.p} − 1)(${v.q} − 1) = ${v.z}.`,
        `Hint 2 (Find d): Solve ${v.e}·d ≡ 1 (mod ${v.z}) using the Extended Euclidean Algorithm on φ(n) = ${v.z} (never mod n = ${v.n}).`,
        `Hint 3 (Sign): Compute S = ${v.h}^d mod ${v.n} using modulus n = ${v.n} via repeated squaring, then verify S^${v.e} mod ${v.n} = ${v.h}.`
      ];
      this.guidedSigHintLevel = Math.min(hints.length, this.guidedSigHintLevel + 1);
      if (box) {
        box.innerHTML = hints.slice(0, this.guidedSigHintLevel).map(h => `<div class="hint">${escapeHtml(h)}</div>`).join('');
      }
    }

    showGuidedSigSolution() {
      const out = document.getElementById('sig-output');
      const v = validateRsaInputs({
        p: document.getElementById('sig-p').value,
        q: document.getElementById('sig-q').value,
        e: document.getElementById('sig-e').value,
        h: document.getElementById('sig-h').value
      });
      if (!v.ok) {
        out.className = 'status error';
        out.textContent = `✗ Cannot compute solution: ${v.error}`;
        return;
      }
      this.markExposed('rsa', rsaExerciseKey(v), 'solutionRevealed');
      const s = modPow(v.h, v.d, v.n);
      const ver = modPow(s, v.e, v.n);
      out.className = 'status success';
      out.innerHTML = `<strong>Solution (Revealed):</strong> <code>n = ${v.n}</code>, <code>φ(n) = ${v.z}</code>, <code>d = ${v.d}</code> (${v.e}×${v.d} mod ${v.z} = 1), <code>S = ${v.h}^${v.d} mod ${v.n} = ${s}</code>, verify <code>${s}^${v.e} mod ${v.n} = ${ver}</code>.`;
    }

    renderQuiz() {
      const container = document.getElementById('quiz-container');
      if (!container) return;

      const qEv = this.state.questionEvidence || {};
      let list = this.data.QUESTIONS;
      if (this.quizFilter === 'revisit') {
        list = list.filter(q => qEv[q.id] === 'attempted' || qEv[q.id] === 'helped');
      } else if (this.quizFilter !== 'all') {
        list = list.filter(q => q.chapter === this.quizFilter);
      }

      if (list.length === 0) {
        container.innerHTML = '<div class="empty-state">No items in this filter (your Revisit List only shows questions you attempted incorrectly or solved with help).</div>';
        return;
      }

      container.innerHTML = list.map((q, idx) => {
        const chosen = this.quizAnswers[q.id];
        const hintOpen = !!this.quizHintOpen[q.id];
        const ev = qEv[q.id] || 'unseen';
        const exposed = this.isExposed('question', q.id);
        const lEv = (this.state.lessonEvidence && this.state.lessonEvidence[q.objectiveId]) || 'unseen';
        const twoChecksMastered = ev === 'independent' && lEv === 'independent';

        const optionsHtml = q.options.map((opt, oi) => {
          let cls = 'option';
          if (chosen !== undefined) {
            if (oi === q.correctIndex) cls += ' good';
            else if (oi === chosen) cls += ' bad';
          }
          const active = chosen === oi ? 'active' : '';
          return `<button type="button" class="${cls} ${active}" data-qid="${q.id}" data-oi="${oi}">${String.fromCharCode(65 + oi)}. ${escapeHtml(opt)}</button>`;
        }).join('');

        let feedbackHtml = '';
        if (chosen !== undefined) {
          const isCorrect = chosen === q.correctIndex;
          feedbackHtml = `<div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
            <strong>${isCorrect ? '✓ Correct' : '✗ Incorrect'}</strong> — ${escapeHtml(q.optionFeedback[chosen])}
            ${!isCorrect ? `<br><span class="correct">Correct answer (${String.fromCharCode(65 + q.correctIndex)}): ${escapeHtml(q.optionFeedback[q.correctIndex])}</span>` : ''}
          </div>`;
        }

        return `<article class="quiz-card">
          <div class="step-head">
            <div>
              <span class="step-num">Q${idx + 1} · ${escapeHtml(q.bloom || 'Recall')} · ${escapeHtml(q.topic)}</span>
              <span class="tag">${escapeHtml(q.ref)}</span>
              <span class="tag">Obj: ${escapeHtml(q.objectiveId || q.chapter)}</span>
              ${exposed && ev !== 'independent' ? '<span class="tag">Assisted / Exposed</span>' : ''}
            </div>
            <span class="tag">${twoChecksMastered ? '★ Mastered (2+ independent)' : escapeHtml(EvidenceTracker.badgeText(ev))}</span>
          </div>
          <p class="exercise-prompt">${escapeHtml(q.question)}</p>
          <div class="actions">
            <button type="button" class="small text" data-hint="${q.id}">${hintOpen ? 'Hide hint' : 'Show hint'}</button>
          </div>
          ${hintOpen ? `<div class="hint">${escapeHtml(q.hint)}</div>` : ''}
          <div style="margin-top:.6rem">${optionsHtml}</div>
          ${feedbackHtml}
        </article>`;
      }).join('');

      container.querySelectorAll('button[data-oi]').forEach(btn => {
        btn.addEventListener('click', () => {
          const qid = btn.dataset.qid;
          const oi = Number(btn.dataset.oi);
          this.quizAnswers[qid] = oi;
          const q = this.data.QUESTIONS.find(x => x.id === qid);
          if (q) {
            this.recordChoiceOutcome('questionEvidence', 'question', qid, oi === q.correctIndex);
          }
          this.renderQuiz();
        });
      });

      container.querySelectorAll('button[data-hint]').forEach(btn => {
        btn.addEventListener('click', () => {
          const qid = btn.dataset.hint;
          const nextOpen = !this.quizHintOpen[qid];
          this.quizHintOpen[qid] = nextOpen;
          if (nextOpen) {
            this.markExposed('question', qid, 'hintUsed');
          }
          this.renderQuiz();
        });
      });
    }

    printMaterial(withAnswers) {
      const area = document.getElementById('print-area');
      if (!area) return;
      const list = (this.quizFilter === 'all' || this.quizFilter === 'revisit')
        ? this.data.QUESTIONS
        : this.data.QUESTIONS.filter(q => q.chapter === this.quizFilter);

      let html = `
        <h1>ICT 304 · Chapters 6–10 &amp; Labs ${withAnswers ? 'Worked Answer Key' : 'Blank Practice Worksheet'}</h1>
        <p>Verified against course slides (Chapters 6, 7, 8, 9.1, 9.2, 10) and Lab 1–4 materials. Note: Lab 5 (ACLs) and Wireshark .pcap files are pending.</p>
      `;

      list.forEach((q, idx) => {
        html += `<div class="print-question">
          <h3>Q${idx + 1} (${escapeHtml(q.bloom || 'Recall')} · ${escapeHtml(q.topic)} · ${escapeHtml(q.ref)})</h3>
          <p>${escapeHtml(q.question)}</p>
          <ul>${q.options.map((o, oi) => `<li>${String.fromCharCode(65 + oi)}. ${escapeHtml(o)}</li>`).join('')}</ul>
          ${withAnswers
            ? `<p><strong>Answer:</strong> ${String.fromCharCode(65 + q.correctIndex)} — ${escapeHtml(q.optionFeedback[q.correctIndex])}</p>`
            : '<div class="work-box"></div>'}
        </div>`;
      });

      area.innerHTML = html;
      window.print();
    }
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.Chapters6to10Data) {
        const app = new ExamStudyApp(window.Chapters6to10Data);
        app.init();
        window.ExamStudyAppInstance = app;
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ExamStudyApp,
      EvidenceTracker,
      modPow,
      gcdBigInt,
      isPrimeBigInt,
      modInverseBigInt,
      validateRsaInputs
    };
  }
})();
