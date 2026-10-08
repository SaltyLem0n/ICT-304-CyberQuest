/* Assignment 3: exact RSA working for a user-defined A-Z mapping. */
(function (root) {
  'use strict';
  const M = typeof module !== 'undefined' && module.exports ? require('./chapter5.js') : root.Chapter5Math;
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function mapping(kind = 'one', values = [], shift = 7) {
    if (kind === 'custom') {
      if (!Array.isArray(values) || values.length !== 26) throw new Error('Define a number for every letter A–Z (26 values).');
      const result = values.map(M.integer);
      if (result.some(v => v < 0n)) throw new Error('Mapping values must be non-negative whole numbers.');
      if (new Set(result.map(String)).size !== 26) throw new Error('Each letter needs a different number so decryption can recover one unambiguous letter.');
      return result;
    }
    if (!['one', 'zero', 'reverse', 'shifted'].includes(kind)) throw new Error('Choose a supported alphabet mapping.');
    const offset = kind === 'shifted' ? M.integer(shift) : 0n;
    if (kind === 'shifted' && (offset < 0n || offset > 25n)) throw new Error('Use a whole-number rotation from 0 to 25.');
    return Array.from(LETTERS, (_, i) => kind === 'reverse' ? BigInt(26 - i) : kind === 'one' ? BigInt(i + 1) : kind === 'shifted' ? (BigInt(i) + offset) % 26n : BigInt(i));
  }
  function inverseSteps(e, z) {
    e = M.integer(e); z = M.integer(z);
    if (z < 2n || e <= 1n || e >= z) throw new Error('For this assignment choose 1 < e < z.');
    let a = z, b = e, as = 1n, at = 0n, bs = 0n, bt = 1n;
    const rows = [];
    while (b) {
      const quotient = a / b, remainder = a % b, s = as - quotient * bs, t = at - quotient * bt;
      rows.push({ a, b, quotient, remainder, s, t });
      [a, b, as, at, bs, bt] = [b, remainder, bs, bt, s, t];
    }
    if (a !== 1n) throw new Error('e and z must have GCD 1. Choose a different e or leave it blank.');
    return { rows, s: as, t: at, d: ((at % z) + z) % z };
  }
  function prepare(options) {
    const originalName = String(options.name || '').trim(), name = originalName.replace(/\s/g, '').toUpperCase();
    if (!name) throw new Error('Enter your full name first.');
    if (!/^[a-z\s]+$/i.test(originalName)) throw new Error('Use English letters A–Z and spaces only. Spell out hyphenated names without punctuation.');
    if (name.length > 120) throw new Error('Use at most 120 letters for this paper assignment.');
    const p = M.integer(options.p), q = M.integer(options.q);
    if (p <= 13n || q <= 13n) throw new Error('Assignment 3 requires both p and q to be prime numbers greater than 13.');
    if (!M.isPrime(p) || !M.isPrime(q) || p === q) throw new Error('Choose two different prime numbers greater than 13, for example 17 and 19.');
    const values = mapping('custom', options.mapping), n = p * q, z = (p - 1n) * (q - 1n);
    M.validateBlocks(values, n);
    const candidates = [];
    let e;
    if (options.e === undefined || String(options.e).trim() === '') {
      e = 2n;
      while (e < z) {
        const divisor = M.gcd(e, z);
        candidates.push({ e, gcd: divisor });
        if (divisor === 1n) break;
        e++;
      }
    } else e = M.integer(options.e);
    const inverse = inverseSteps(e, z), key = M.keys(p, q, e, inverse.d);
    const decode = new Map(values.map((v, i) => [String(v), LETTERS[i]]));
    const unique = Array.from(new Set(name)).map(letter => {
      const m = values[LETTERS.indexOf(letter)], encryption = M.trace(m, key.e, n), c = encryption.result;
      const decryption = M.trace(c, key.d, n), recoveredLetter = decode.get(String(decryption.result));
      if (decryption.result !== m || recoveredLetter !== letter) throw new Error('The recovered letter did not match. Check the mapping and keys.');
      const positions = Array.from(name, (ch, i) => ch === letter ? i + 1 : null).filter(Boolean);
      return { letter, positions, m, c, encryption, decryption, recoveredLetter };
    });
    const byLetter = new Map(unique.map(row => [row.letter, row]));
    const blocks = Array.from(name, (letter, i) => ({ ...byLetter.get(letter), position: i + 1 }));
    return { ...key, originalName, name, mapping: values, candidates, inverse, unique, blocks, recoveredName: blocks.map(b => b.recoveredLetter).join('') };
  }
  const math = { mapping, inverseSteps, prepare };
  if (typeof module !== 'undefined' && module.exports) module.exports = math;
  root.Assignment3Math = math;
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const list = items => items.map(String).join(', ');
  let current = null, expanded = false;
  function message(text, error = false) {
    $('assignment-status').textContent = text;
    $('assignment-status').className = `status ${error ? 'error' : 'success'}`;
  }
  function invalidate() {
    const hadResult = Boolean(current);
    current = null; expanded = false;
    $('assignment-result').hidden = true;
    $('assignment-result').innerHTML = '';
    $('assignment-print').disabled = true;
    $('assignment-expand').disabled = true;
    $('assignment-expand').textContent = 'Expand all calculations';
    message(hadResult ? 'Inputs changed. Choose “Explain my assignment” to calculate the updated working.' : '');
    // A previous print preview must not retain personal working after an edit.
    if ($('print-area').dataset.assignment === 'true') { $('print-area').innerHTML = ''; delete $('print-area').dataset.assignment; }
  }
  function applyMapping() {
    const kind = $('assignment-mapping').value;
    $('assignment-shift-label').hidden = kind !== 'shifted';
    if (kind === 'custom') return;
    try {
      const values = mapping(kind, [], $('assignment-shift').value);
      $('assignment-mapping-grid').innerHTML = values.map((v, i) => `<label>${LETTERS[i]}<input type="text" inputmode="numeric" autocomplete="off" data-assignment-letter="${i}" value="${v}" aria-label="Number for ${LETTERS[i]}"></label>`).join('');
    } catch (error) { message(error.message, true); }
  }
  function readInputs() {
    // Validate rotation even if the last valid grid is still visible.
    if ($('assignment-mapping').value === 'shifted') mapping('shifted', [], $('assignment-shift').value);
    return { name: $('assignment-name').value, p: $('assignment-p').value, q: $('assignment-q').value, e: $('assignment-e').value, mapping: Array.from($('assignment-mapping-grid').querySelectorAll('input'), el => el.value) };
  }
  function mappingTable(r) {
    return `<div class="table-wrap"><table class="assignment-table"><caption>My chosen A–Z numerical mapping</caption><thead><tr>${Array.from(LETTERS.slice(0, 13), c => `<th scope="col">${c}</th>`).join('')}</tr></thead><tbody><tr>${r.mapping.slice(0, 13).map(v => `<td class="number">${v}</td>`).join('')}</tr><tr>${Array.from(LETTERS.slice(13), c => `<th scope="col">${c}</th>`).join('')}</tr><tr>${r.mapping.slice(13).map(v => `<td class="number">${v}</td>`).join('')}</tr></tbody></table></div>`;
  }
  function keyWorking(r) {
    const inv = r.inverse;
    return `<section class="panel assignment-step"><div class="step-num">Step 2 · Generate the keys</div><h2>Use p=${r.p} and q=${r.q}</h2><p>Both numbers are distinct primes greater than 13. Multiply them for n; use one less than each prime for z (also called φ(n)).</p><div class="formula math">n = p × q = ${r.p} × ${r.q} = <strong>${r.n}</strong><br>z = (p−1)(q−1) = ${r.p - 1n} × ${r.q - 1n} = <strong>${r.z}</strong></div><h3>Choose e=${r.e}</h3><p>e is the public encryption exponent. We need 1 &lt; e &lt; z and GCD(e,z)=1 so a matching decryption exponent exists.</p>${r.candidates.length ? `<p class="math">Small candidates: ${r.candidates.map(c => `GCD(${c.e},${r.z})=${c.gcd}`).join('; ')}.</p><p>The first candidate with GCD 1 gives e=${r.e}.</p>` : '<p>This is the e you entered. The Euclidean divisions below verify its GCD with z.</p>'}<h3>Find d: solve ${r.e}d ≡ 1 (mod ${r.z})</h3><p>The extended Euclidean algorithm divides, keeps the remainder, then divides again. To explain the inverse, track each remainder as a combination of z and e: start with z=1×z+0×e and e=0×z+1×e. Subtract the quotient times the second line from the first line at each division.</p><div class="formula">${inv.rows.map(row => `<span class="trace-line">${row.a} = ${row.quotient} × ${row.b} + <em>${row.remainder}</em></span>${row.remainder ? `<span class="trace-line">↳ ${row.remainder} = (${row.s}) × ${r.z} + (${row.t}) × ${r.e}</span>` : ''}`).join('')}</div><p>The last non-zero remainder is 1, so GCD(${r.e},${r.z})=1. The coefficient of e in the line for 1 is its inverse modulo z.</p><div class="formula math">1 = (${inv.s}) × ${r.z} + (${inv.t}) × ${r.e}<br>d = ${inv.t} mod ${r.z} = ${inv.t < 0n ? `${inv.t} + ${r.z} = ` : ''}<strong>${r.d}</strong><br>Check: e × d = ${r.e} × ${r.d} = ${r.e * r.d} = ${(r.e * r.d - 1n) / r.z} × ${r.z} + <strong>1</strong><br>Public key (n,e) = <strong>(${r.n}, ${r.e})</strong><br>Private key (n,d) = <strong>(${r.n}, ${r.d})</strong></div><p class="source">Use z only to find d. Use n=${r.n} for every encryption and decryption remainder.</p></section>`;
  }
  function traceWorking(t, symbol, resultSymbol) {
    return root.Chapter5Working.renderTrace(t, { baseSymbol: symbol, resultSymbol });
  }
  function calculations(r, direction, forPrint) {
    const enc = direction === 'enc';
    return r.unique.map((row, i) => {
      const label = `${enc ? 'Encrypt' : 'Decrypt'} ${row.letter} · name ${row.positions.length === 1 ? 'position' : 'positions'} ${row.positions.join(', ')}`;
      const body = traceWorking(enc ? row.encryption : row.decryption, enc ? 'm' : 'c', enc ? 'c' : 'm') + (enc ? '' : `<p>Look up ${row.decryption.result} in your mapping: <strong>${row.recoveredLetter}</strong>.</p>`);
      return forPrint ? `<section class="assignment-trace"><h3>${label}</h3>${body}</section>` : `<details id="assignment-${direction}-${row.letter}" class="answer-details" ${i === 0 ? 'open' : ''}><summary>${label} · ${enc ? `m=${row.m} → c=${row.c}` : `c=${row.c} → m=${row.m} → ${row.recoveredLetter}`}</summary>${body}</details>`;
    }).join('');
  }
  function output(r, forPrint = false) {
    const linked = (value, direction, letter) => forPrint ? String(value) : `<a href="#assignment-${direction}-${letter}">${value}</a>`;
    return `<section class="panel assignment-step"><div class="step-num">Step 1 · Remove spaces and encode</div><h2 class="assignment-sequence">${esc(r.name)}</h2><p>Full name entered: ${esc(r.originalName)}. Spaces are removed; lowercase letters become uppercase. Keep one numerical block per letter, with commas between numbers.</p>${mappingTable(r)}<p class="math assignment-sequence">${Array.from(r.name, c => `${c}=${r.mapping[LETTERS.indexOf(c)]}`).join(' · ')}</p><div class="formula math assignment-sequence">Plaintext blocks m: ${list(r.blocks.map(b => b.m))}</div><p>All 26 mapping values are different and satisfy 0 ≤ m &lt; n=${r.n}. A value of 0 is valid. Do not concatenate the entire name into one oversized number.</p></section>${keyWorking(r)}<section class="panel assignment-step"><div class="step-num">Step 3 · Encrypt with the public key</div><h2>Calculate c = m<sup>${r.e}</sup> mod ${r.n}</h2><p>m is a letter’s original number; c is its encrypted number. Use this same public key for every position. Repeated letters reuse the same calculation; the table in Step 5 keeps the full order.</p>${calculations(r, 'enc', forPrint)}<div class="formula math assignment-sequence">Ciphertext blocks c: ${list(r.blocks.map(b => b.c))}</div></section><section class="panel assignment-step"><div class="step-num">Step 4 · Decrypt with the private key</div><h2>Calculate m = c<sup>${r.d}</sup> mod ${r.n}</h2><p>Start from each ciphertext number and raise it to d. Follow the same calculate, divide, multiply, subtract, and answer steps, then translate the recovered number with your original mapping.</p>${calculations(r, 'dec', forPrint)}</section><section class="panel assignment-step"><div class="step-num">Step 5 · Check every position</div><h2>Recover the full name</h2><div class="table-wrap"><table><thead><tr><th>Position</th><th>Letter</th><th>Original m</th><th>Encrypted c</th><th>Decrypted m</th><th>Recovered letter</th></tr></thead><tbody>${r.blocks.map(b => `<tr><td>${b.position}</td><td>${b.letter}</td><td class="number">${b.m}</td><td class="number">${linked(b.c, 'enc', b.letter)}</td><td class="number">${linked(b.decryption.result, 'dec', b.letter)}</td><td>${b.recoveredLetter}</td></tr>`).join('')}</tbody></table></div><div class="callout good"><strong class="assignment-sequence">Recovered: ${r.recoveredName}</strong><p>Every recovered number matches its original block. The recovered name matches the full name without spaces.</p></div>${r.unique.some(b => b.m === b.c) ? '<p class="source">Some numbers are unchanged by these small RSA keys. These are valid fixed points; their decryption still recovers the original letter.</p>' : ''}<p>For your paper: include the complete mapping, p and q, n and z, the choice of e, the derivation and check of d, both keys, the modular working, and the final recovered name.</p></section>`;
  }
  function print(withAnswers) {
    try {
      const r = current || prepare(readInputs());
      const title = `Assignment 3 · ${withAnswers ? 'Worked RSA steps' : 'Paper worksheet'}`;
      $('print-area').dataset.assignment = 'true';
      $('print-area').innerHTML = `<div class="print-controls"><button data-action="close-print">← Back to study</button><button data-action="print-now">Print / Save as PDF</button></div><h1>${title}</h1><p class="assignment-sequence">ICT 304 · ${esc(r.originalName)} → ${r.name}</p>${withAnswers ? output(r, true) : `${mappingTable(r)}<p>My choices: p=${r.p}, q=${r.q}, e=${r.e}. One letter per numerical block.</p><p class="math assignment-sequence">Plaintext: ${list(r.blocks.map(b => b.m))}</p>${['Calculate n and z; show why e is valid.', 'Find d; check ed mod z=1; write both keys.', 'Encrypt each block: show squares and modular reductions.', 'Decrypt each block; map back to letters and recover your full name.'].map((text, i) => `<section class="print-question"><h3>${i + 1}. ${text}</h3><div class="work-box"></div></section>`).join('')}`}`;
      document.body.classList.add('print-preview');
      root.scrollTo({ top: 0 });
      $('print-area').querySelector('button').focus();
    } catch (error) { message(error.message, true); }
  }
  root.Chapter5Assignment = { print };
  $('assignment-form').addEventListener('submit', event => {
    event.preventDefault(); invalidate();
    try {
      current = prepare(readInputs());
      $('assignment-result').innerHTML = output(current);
      $('assignment-result').hidden = false;
      $('assignment-print').disabled = false; $('assignment-expand').disabled = false;
      message(`${current.blocks.length} letter blocks checked. Encryption and decryption recover ${current.recoveredName}.`);
      $('assignment-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) { message(error.message, true); }
  });
  $('assignment-form').addEventListener('input', event => {
    invalidate();
    if (event.target.dataset.assignmentLetter !== undefined) {
      $('assignment-mapping').value = 'custom'; $('assignment-shift-label').hidden = true;
    }
    if (event.target.id === 'assignment-shift') applyMapping();
  });
  $('assignment-mapping').addEventListener('change', () => { invalidate(); applyMapping(); });
  $('assignment-print').addEventListener('click', () => print(true));
  $('assignment-expand').addEventListener('click', () => {
    expanded = !expanded;
    $('assignment-result').querySelectorAll('details').forEach(el => { el.open = expanded; });
    $('assignment-expand').textContent = expanded ? 'Collapse all calculations' : 'Expand all calculations';
  });
  $('assignment-result').addEventListener('click', event => {
    const link = event.target.closest('a[href^="#assignment-"]');
    if (link) { const target = $(link.hash.slice(1)); if (target) target.open = true; }
  });
  applyMapping();
})(typeof globalThis !== 'undefined' ? globalThis : this);
