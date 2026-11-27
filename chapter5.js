/* CyberQuest Chapter 5. Browser UI + independently testable exact arithmetic. */
(function (root) {
  'use strict';
  function integer(value) {
    const text = String(value).trim();
    if (!/^-?\d{1,30}$/.test(text)) throw new Error('Enter a whole number (up to 30 digits), without decimals.');
    return BigInt(text);
  }
  function gcd(a, b) {
    a = integer(a); b = integer(b); a = a < 0n ? -a : a; b = b < 0n ? -b : b;
    while (b) [a, b] = [b, a % b];
    return a;
  }
  function isPrime(value) {
    const n = integer(value);
    if (n < 2n) return false;
    if (n > 10000n) throw new Error('This paper-practice lab uses primes no larger than 10,000.');
    for (let k = 2n; k * k <= n; k++) if (n % k === 0n) return false;
    return true;
  }
  function inverse(a, modulus) {
    a = integer(a); modulus = integer(modulus);
    if (modulus < 2n) throw new Error('The inverse modulus must be greater than 1.');
    let oldR = modulus, r = ((a % modulus) + modulus) % modulus, oldT = 0n, t = 1n;
    while (r) {
      const q = oldR / r;
      [oldR, r] = [r, oldR - q * r]; [oldT, t] = [t, oldT - q * t];
    }
    if (oldR !== 1n) throw new Error('No modular inverse exists: e and z must have GCD 1.');
    return ((oldT % modulus) + modulus) % modulus;
  }
  function keys(p, q, e, d) {
    p = integer(p); q = integer(q); e = integer(e);
    if (!isPrime(p) || !isPrime(q) || p === q) throw new Error('Use two different prime numbers p and q.');
    const n = p * q, z = (p - 1n) * (q - 1n);
    if (e <= 1n || e >= n) throw new Error('Choose 1 < e < n. The lab excludes the trivial exponent 1.');
    if (gcd(e, z) !== 1n) throw new Error('e and z must be relatively prime: GCD(e, z) = 1.');
    d = d === undefined ? inverse(e, z) : integer(d);
    if (d <= 0n || (e * d) % z !== 1n) throw new Error('d must be positive and satisfy ed mod z = 1.');
    return { p, q, n, z, e, d };
  }
  function trace(base, exponent, modulus) {
    base = integer(base); exponent = integer(exponent); modulus = integer(modulus);
    if (modulus <= 1n || base < 0n || base >= modulus) throw new Error('Each message/ciphertext block must satisfy 0 ≤ block < n.');
    if (exponent < 1n) throw new Error('Use a positive exponent.');
    const squares = [{ power: 1n, dividend: base, quotient: 0n, remainder: base }];
    for (let power = 2n; power <= exponent; power *= 2n) {
      const previous = squares[squares.length - 1].remainder;
      const dividend = previous * previous;
      squares.push({ power, previous, dividend, quotient: dividend / modulus, remainder: dividend % modulus });
    }
    const selected = squares.filter(row => (exponent & row.power) !== 0n);
    let result = 1n;
    const products = selected.map(row => {
      const left = result, dividend = left * row.remainder;
      result = dividend % modulus;
      return { power: row.power, left, right: row.remainder, dividend, quotient: dividend / modulus, remainder: result };
    });
    return { base, exponent, modulus, squares, selected, products, result };
  }
  function directReduction(t) {
    const base = integer(t.base), exponent = integer(t.exponent), modulus = integer(t.modulus);
    if (base < 0n || base >= modulus || modulus <= 1n || exponent < 1n) throw new Error('Use a valid modular-power trace.');
    const limit = 999999999999n; // At most 12 decimal digits, including boundary values.
    let dividend = base === 0n ? 0n : 1n;
    if (base > 1n) {
      for (let power = 0n; power < exponent; power++) {
        // Check BEFORE multiplying: never construct an oversized full power.
        // For base >= 2 this loop exits within 40 iterations, even for huge exponents.
        if (dividend > limit / base) return null;
        dividend *= base;
      }
    }
    const quotient = dividend / modulus, multiple = quotient * modulus;
    return { dividend, quotient, multiple, remainder: dividend - multiple };
  }
  function reductionWorking(operation, row, modulus, answerSymbol) {
    const multiple = row.quotient * modulus;
    return `<div class="formula worked-reduction"><span class="trace-line">1. <strong>Calculate:</strong> A = ${operation} = ${row.dividend}</span><span class="trace-line">2. <strong>Divide:</strong> Q = whole-number part of ${row.dividend} ÷ ${modulus} = ${row.quotient}</span><span class="trace-line">3. <strong>Multiply:</strong> B = ${row.quotient} × ${modulus} = ${multiple}</span><span class="trace-line">4. <strong>Subtract:</strong> ${answerSymbol} = ${row.dividend} − ${multiple} = <em>${row.remainder}</em></span><strong class="trace-line">5. Answer: ${answerSymbol} = ${row.remainder}</strong></div>`;
  }
  function decimalPreview(dividend, modulus) {
    if (dividend % modulus === 0n) return String(dividend / modulus);
    const q = dividend / modulus, frac = ((dividend % modulus) * 100n) / modulus;
    return `${q}.${String(frac).padStart(2, '0')}…`;
  }
  function gcdSteps(a, b) {
    a = integer(a); b = integer(b);
    let x = a < 0n ? -a : a, y = b < 0n ? -b : b;
    if (x < y) [x, y] = [y, x];
    const rows = [];
    while (y > 0n) {
      const quotient = x / y, remainder = x % y;
      rows.push({ a: x, b: y, quotient, remainder });
      [x, y] = [y, remainder];
    }
    const sharedSmallFactor = [2n, 3n, 5n, 7n, 11n].find(f => a % f === 0n && b % f === 0n) || null;
    return { a, b, gcd: x, rows, sharedSmallFactor };
  }
  function inverseByTrial(e, z) {
    e = integer(e); z = integer(z);
    if (z < 2n) throw new Error('z must be greater than 1.');
    if (gcd(e, z) !== 1n) throw new Error(`No modular inverse exists because GCD(${e}, ${z}) = ${gcd(e, z)} ≠ 1.`);
    const q0 = e / z, r = e % z;
    const trials = [];
    let k = 0n, d = null;
    while (k <= r + 1n) {
      const target = 1n + k * z;
      const divisible = target % r === 0n;
      const candidateD = divisible ? target / r : null;
      trials.push({ k, target, divisible, d: candidateD });
      if (divisible) { d = candidateD; break; }
      k++;
    }
    if (d === null) d = inverse(e, z);
    const checkProduct = e * d, checkQuotient = checkProduct / z, checkMultiple = checkQuotient * z, checkRemainder = checkProduct - checkMultiple;
    return { e, z, q0, r, k, d, trials, checkProduct, checkQuotient, checkMultiple, checkRemainder };
  }
  function powerShortcut(base, exponent, modulus) {
    base = integer(base); exponent = integer(exponent); modulus = integer(modulus);
    if (modulus <= 1n || base < 0n || base >= modulus || exponent < 1n) return null;
    if (base === 0n) {
      return { kind: 'zero', result: 0n, label: 'Remainder 0 shortcut', explanation: `0 multiplied by itself any number of times is always 0, so 0<sup>${exponent}</sup> mod ${modulus} = 0.` };
    }
    if (base === 1n) {
      return { kind: 'one', result: 1n, label: 'Remainder 1 shortcut', explanation: `1 multiplied by itself any number of times is always 1, so 1<sup>${exponent}</sup> mod ${modulus} = 1.` };
    }
    if (base === modulus - 1n) {
      const isEven = exponent % 2n === 0n;
      const result = isEven ? 1n : modulus - 1n;
      return { kind: 'minus_one', result, isEven, label: 'Remainder n − 1 shortcut', explanation: `${base} is 1 less than ${modulus}, so it behaves like −1 modulo ${modulus}. Raising −1 to an ${isEven ? 'even' : 'odd'} exponent (${exponent}) gives ${isEven ? '1' : `−1 ≡ ${result} (mod ${modulus})`}.` };
    }
    return null;
  }
  function renderCalculatorStep({ title, operation, dividend, modulus, quotient, remainder, answerSymbol, why, mistakeCheck }) {
    const multiple = quotient * modulus;
    const dec = decimalPreview(dividend, modulus);
    return `<div class="calc-step">${title ? `<div class="calc-label">${title}</div>` : ''}<p><strong>Write on paper:</strong> <span class="math">${operation} = ${dividend}</span>; <span class="math">${dividend} = ${quotient} × ${modulus} + ${remainder}</span>; <span class="math"><strong>${answerSymbol} = ${remainder}</strong></span></p><p><strong>Basic calculator:</strong> <span class="math">${operation} = ${dividend}</span> → <span class="math">${dividend} ÷ ${modulus} = ${dec}</span> (whole-number quotient <span class="math">Q = ${quotient}</span>) → <span class="math">${quotient} × ${modulus} = ${multiple}</span> → <span class="math">${dividend} − ${multiple} = ${remainder}</span></p><p><strong>Quotient &amp; remainder:</strong> <span class="math">Q = ${quotient}</span>, <span class="math">R = ${remainder}</span></p><p><strong>Why it works:</strong> ${why}</p><p class="calc-check"><strong>Mistake check:</strong> ${mistakeCheck}</p></div>`;
  }
  function renderInverseGuide(e, z) {
    e = integer(e); z = integer(z);
    if (gcd(e, z) !== 1n) return `<div class="callout warn"><strong>No inverse exists</strong><p>GCD(${e}, ${z}) = ${gcd(e, z)} ≠ 1, so no whole number d satisfies ${e}d mod ${z} = 1.</p></div>`;
    const inv = inverseByTrial(e, z);
    const reducedNote = e >= z ? `<p><strong>Step 1 — Reduce e modulo z (shortcut for finding d):</strong> Divide ${e} by ${z}: <span class="math">${e} ÷ ${z} = ${decimalPreview(e, z)}</span> → whole-number quotient <span class="math">Q = ${inv.q0}</span>, so <span class="math">r = ${e} − ${inv.q0} × ${z} = <strong>${inv.r}</strong></span>. We solve <span class="math">${inv.r}d = 1 + k × ${z}</span>, while keeping the <strong>original e = ${e}</strong> for encryption.</p>` : `<p><strong>Step 1 — Reduce e modulo z:</strong> Since ${e} &lt; ${z}, <span class="math">r = ${e} mod ${z} = <strong>${inv.r}</strong></span>. Solve <span class="math">${inv.r}d = 1 + k × ${z}</span>.</p>`;
    const trialRows = inv.trials.slice(0, 14).map(t => `<tr><td class="number">${t.k}</td><td class="math">1 + ${t.k} × ${z} = ${t.target}</td><td>${t.divisible ? `Yes: ${t.target} ÷ ${inv.r} = <strong>${t.d}</strong>` : `No (${decimalPreview(t.target, inv.r)})`}</td></tr>`).join('');
    const extraNote = inv.trials.length > 14 ? `<p class="field-note">Continuing k up to ${inv.k} gives <span class="math">1 + ${inv.k} × ${z} = ${1n + inv.k * z}</span>, and <span class="math">${1n + inv.k * z} ÷ ${inv.r} = <strong>${inv.d}</strong></span>.</p>` : '';
    return `<div class="calc-step"><div class="calc-label">Find private exponent d using a basic calculator</div>${reducedNote}<p><strong>Step 2 — Try k = 0, 1, 2, … until (1 + kz) ÷ r is a whole number:</strong></p><div class="table-wrap"><table><thead><tr><th scope="col">k</th><th scope="col">1 + k × ${z}</th><th scope="col">Divisible by ${inv.r}?</th></tr></thead><tbody>${trialRows}</tbody></table></div>${extraNote}<p><strong>Step 3 — Always check with the original e = ${e}:</strong> <span class="math">${e} × ${inv.d} = ${inv.checkProduct}</span>; <span class="math">${inv.checkProduct} ÷ ${z} = ${decimalPreview(inv.checkProduct, z)}</span> → <span class="math">Q = ${inv.checkQuotient}</span>; <span class="math">${inv.checkProduct} − ${inv.checkQuotient} × ${z} = ${inv.checkProduct} − ${inv.checkMultiple} = <strong>${inv.checkRemainder}</strong></span>. ✓</p><p class="calc-check"><strong>Mistake check:</strong> Use z = ${z} (not n) when finding d, and keep the original e = ${e} in the public key.</p></div>`;
  }
  // Shared, DOM-independent formatting for assignment, practice, and print answers.
  function renderTrace(t, { baseSymbol = 'm', resultSymbol = 'c', method = 'auto' } = {}) {
    if (!['m', 'c'].includes(baseSymbol) || !['m', 'c'].includes(resultSymbol)) throw new Error('Use m or c for RSA message symbols.');
    const heading = `<p class="math">${resultSymbol} = ${t.base}<sup>${t.exponent}</sup> mod ${t.modulus}</p>`;
    const legend = '<p class="field-note">Q is the whole-number quotient (divide and ignore the decimal part). Keep every remainder smaller than n.</p>';
    if (method === 'squaring') {
      const shortcut = powerShortcut(t.base, t.exponent, t.modulus);
      if (shortcut) {
        return `${heading}<div class="callout good"><strong>${shortcut.label}</strong><p>${shortcut.explanation}</p><p class="math"><strong>Final answer: ${resultSymbol} = ${shortcut.result}</strong></p><p class="calc-check"><strong>Mistake check:</strong> ${shortcut.result} is between 0 and ${t.modulus - 1n}. Repeated squaring gives the exact same result.</p></div>`;
      }
      const powers = t.selected.map(row => row.power).reverse().join(' + ');
      const squareBlocks = t.squares.slice(1).map(row => {
        const why = `Removing ${row.quotient} full group${row.quotient === 1n ? '' : 's'} of ${t.modulus} keeps the same remainder modulo ${t.modulus}.`;
        const mistake = `Check ${row.remainder} &lt; ${t.modulus} and ${row.quotient} × ${t.modulus} + ${row.remainder} = ${row.dividend}. Never round Q up.`;
        let extra = '';
        if (row.remainder === 0n) extra = `<p class="field-note">Shortcut: remainder hit 0, so every higher square is also 0.</p>`;
        else if (row.remainder === 1n) extra = `<p class="field-note">Shortcut: remainder hit 1, so every higher square stays 1.</p>`;
        else if (row.remainder === t.modulus - 1n) extra = `<p class="field-note">Shortcut: remainder hit ${row.remainder} = n − 1 (like −1), so the next square will be 1.</p>`;
        return `<section class="reduction-group"><h4>Power ${row.power} · ${baseSymbol}<sup>${row.power}</sup> mod ${t.modulus}</h4>${renderCalculatorStep({ operation: `${row.previous}²`, dividend: row.dividend, modulus: t.modulus, quotient: row.quotient, remainder: row.remainder, answerSymbol: 'R', why, mistakeCheck: mistake })}${extra}</section>`;
      }).join('');
      const prodBlocks = t.products.map((row, idx) => {
        if (idx === 0) {
          return `<section class="reduction-group"><h4>Include power ${row.power}</h4><div class="calc-step"><p><strong>Write on paper:</strong> Start with <span class="math">R = ${row.right}</span> (since <span class="math">1 × ${row.right} = ${row.right}</span>).</p><p class="calc-check"><strong>Mistake check:</strong> ${row.right} is already smaller than ${t.modulus}, so no division is needed here.</p></div></section>`;
        }
        return `<section class="reduction-group"><h4>Include power ${row.power}</h4>${renderCalculatorStep({ operation: `${row.left} × ${row.right}`, dividend: row.dividend, modulus: t.modulus, quotient: row.quotient, remainder: row.remainder, answerSymbol: 'R', why: `Multiplying the running remainder by the remainder for power ${row.power} and reducing keeps numbers small for a basic calculator.`, mistakeCheck: `Check ${row.remainder} &lt; ${t.modulus} and ${row.quotient} × ${t.modulus} + ${row.remainder} = ${row.dividend}.` })}</section>`;
      }).join('');
      return `${heading}<p>Use repeated squaring and reduce after every multiplication so your basic calculator never hits huge numbers.</p>${legend}<p class="math"><strong>Split the exponent:</strong> ${t.exponent} = ${powers}</p><h4>1. Square in smaller groups</h4><p class="math">Starting remainder: R = ${t.base} (${baseSymbol}<sup>1</sup> mod ${t.modulus}).</p>${squareBlocks}<h4>2. Multiply the selected remainders</h4><p class="math">${t.selected.map(row => `${baseSymbol}<sup>${row.power}</sup> → ${row.remainder}`).join('; ')}</p>${prodBlocks}<div class="callout good"><strong class="trace-line">Final answer: ${resultSymbol} = ${t.result}</strong><p>The last remainder R is the ${resultSymbol === 'c' ? 'encrypted message number c' : 'original message number m'}.</p></div>`;
    }
    const direct = directReduction(t);
    if (direct) return `${heading}${legend}${reductionWorking(`${t.base}<sup>${t.exponent}</sup>`, direct, t.modulus, resultSymbol)}`;
    const powers = t.selected.map(row => row.power).reverse().join(' + ');
    return `${heading}<p>The full power has more than 12 digits, so use smaller groups. Follow the same five steps for each square and multiplication. R is an intermediate remainder; reuse it in the next calculation.</p>${legend}<p class="math"><strong>Split the exponent:</strong> ${t.exponent} = ${powers}</p><h4>Square in smaller groups</h4><p class="math">Starting remainder: R = ${t.base}. This is ${baseSymbol}<sup>1</sup> mod ${t.modulus}.</p>${t.squares.slice(1).map(row => `<section class="reduction-group"><h4>Power ${row.power} · ${baseSymbol}<sup>${row.power}</sup> mod ${t.modulus}</h4>${reductionWorking(`${row.previous}²`, row, t.modulus, 'R')}</section>`).join('')}<h4>Multiply the selected remainders</h4><p class="math">${t.selected.map(row => `${baseSymbol}<sup>${row.power}</sup> → ${row.remainder}`).join('; ')}</p><p>Start at 1. Include each selected power and keep the new remainder R after each multiplication.</p>${t.products.map(row => `<section class="reduction-group"><h4>Include power ${row.power}</h4>${reductionWorking(`${row.left} × ${row.right}`, row, t.modulus, 'R')}</section>`).join('')}<div class="callout good"><strong class="trace-line">Final answer: ${resultSymbol} = ${t.result}</strong><p>The last remainder R is the ${resultSymbol === 'c' ? 'ciphertext c' : 'recovered plaintext m'}.</p></div>`;
  }
  function renderManualPowerFiveGuide() {
    return `<section class="manual-power-five-guide">
      <h3>Calculating m<sup>5</sup> mod n without a calculator</h3>
      <p>This method calculates the encryption power when <span class="math">e = 5</span>.</p>
      <ol>
        <li>Start with <span class="math">r = m</span>.</li>
        <li>Multiply <span class="math">r</span> by <span class="math">m</span>.</li>
        <li>Keep the result small by adding or subtracting a multiple of <span class="math">n</span>:<div class="formula math">r ← r − k × n &nbsp; or &nbsp; r ← r + k × n</div>Choose a whole number <span class="math">k</span> that makes the calculation easy. It counts multiples of <span class="math">n</span>, is <strong>unrelated to the exponent</strong>, and can differ at each adjustment.</li>
        <li>Repeat steps 2–3 until you have multiplied <strong>five copies of m</strong> in total—four multiplications after starting with <span class="math">m</span>.</li>
        <li>Adjust the final result until <span class="math">0 ≤ r &lt; n</span>.</li>
      </ol>
      <h4>Useful rules</h4>
      <ul>
        <li>Negative intermediate values are allowed.</li>
        <li>If the value is negative, add multiples of <span class="math">n</span>.</li>
        <li>If the value is at least <span class="math">n</span>, subtract multiples of <span class="math">n</span>.</li>
        <li>Adding or subtracting multiples of <span class="math">n</span> preserves the result modulo <span class="math">n</span>.</li>
      </ul>
      <p>The final value of <span class="math">r</span> is your answer, <span class="math">c</span>.</p>
      <h4>Worked example: m = 12, n = 323</h4>
      <p>This is a fixed example. Use your own <span class="math">m</span> and <span class="math">n</span> for each letter.</p>
      <div class="table-wrap"><table>
        <caption>Five copies of 12, with an adjustment after each multiplication when needed</caption>
        <thead><tr><th scope="col">Copies of m</th><th scope="col">Multiply and adjust</th><th scope="col">New r</th></tr></thead>
        <tbody>
          <tr><th scope="row">1</th><td>Start with r = 12</td><td class="number">12</td></tr>
          <tr><th scope="row">2</th><td class="math">12 × 12 = 144; no adjustment needed</td><td class="number">144</td></tr>
          <tr><th scope="row">3</th><td class="math">144 × 12 = 1728; 1728 − 6 × 323 = −210</td><td class="number">−210</td></tr>
          <tr><th scope="row">4</th><td class="math">−210 × 12 = −2520; −2520 + 8 × 323 = 64</td><td class="number">64</td></tr>
          <tr><th scope="row">5</th><td class="math">64 × 12 = 768; 768 − 2 × 323 = 122</td><td class="number">122</td></tr>
        </tbody>
      </table></div>
      <p class="math">0 ≤ 122 &lt; 323, therefore <strong>c = 122</strong>.</p>
      <p>Here k is 6, then 8, then 2. We subtract 6 groups of 323, add 8 groups when the value is negative, then subtract 2 groups. These choices do not change the count of five copies of m.</p>
    </section>`;
  }
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,;?';
  function encode(text, mapping = 'letters') {
    text = String(text);
    if (!text.length) throw new Error('Enter at least one character.');
    if (text.length > 60) throw new Error('Use a message of at most 60 characters for paper practice.');
    if (mapping === 'letters') {
      if (!/^[a-z]+$/i.test(text)) throw new Error('A=1 … Z=26 supports letters only here. Use the other mapping for spaces, digits, and punctuation.');
      return { text, codes: Array.from(text.toUpperCase(), c => String(c.charCodeAt(0) - 64)), blocks: Array.from(text.toUpperCase(), c => BigInt(c.charCodeAt(0) - 64)), padded: false };
    }
    if (mapping !== 'blocks') throw new Error('Unknown encoding mapping.');
    const codes = Array.from(text, c => {
      const i = alphabet.indexOf(c);
      if (i < 0) throw new Error('Slide 14 supports a-z, A-Z, 0-9, space, period, comma, semicolon, and question mark.');
      return String(i).padStart(2, '0');
    });
    const padded = codes.length % 2 !== 0;
    if (padded) codes.push('62');
    const blockStrings = [];
    for (let i = 0; i < codes.length; i += 2) blockStrings.push(codes[i] + codes[i + 1]);
    return { text, codes, blockStrings, blocks: blockStrings.map(BigInt), padded };
  }
  function validateBlocks(blocks, n) {
    n = integer(n);
    if (n <= 1n || blocks.some(block => integer(block) < 0n || integer(block) >= n)) throw new Error('A block is too large for this modulus. Every block must be smaller than n; do not silently reduce an encoded message.');
    return true;
  }
  function solve(exercise, e, d) {
    if (exercise.kind === 'encoding') return encode(exercise.text, 'blocks');
    const k = keys(exercise.p, exercise.q, e === undefined ? exercise.e || 5 : e, d === undefined ? exercise.d : d);
    validateBlocks(exercise.messages || [], k.n);
    const messages = (exercise.messages || []).map(m => {
      const encryption = trace(m, k.e, k.n), decryption = trace(encryption.result, k.d, k.n);
      return { m: integer(m), c: encryption.result, encryption, decryption };
    });
    return { ...k, messages };
  }
  const exercises = [
    { id: 'q1', title: 'Slide Q1 · Generate Bob’s keys', source: 'Slide 12', kind: 'key', p: 5, q: 7, messages: [], prompt: 'Bob chooses p = 5 and q = 7. Calculate n and z, choose a valid e, and find a matching d. Write the public and private key pairs.' },
    { id: 'q2', title: 'Slide Q2 · Encrypt and decrypt “love”', source: 'Slides 15–17', kind: 'rsa', p: 5, q: 7, text: 'love', messages: [12, 15, 22, 5], prompt: 'Use p = 5, q = 7 and the A=1 … Z=26 mapping. Choose a valid e, find d, encrypt “love”, and show Bob’s decryption. Use the same key for every letter.' },
    { id: 'q3', title: 'Slide Q3 · A larger exponent', source: 'Slides 18–20', kind: 'rsa', p: 11, q: 13, e: 37, d: 13, provided: true, messages: [24], prompt: 'Given public key (143, 37), private key (143, 13), and message m = 24, encrypt and decrypt. The keys are supplied: you do not need to factor n or generate them.' },
    { id: 'q4a', title: 'Slide Q4A · p=3, q=13, e=5', source: 'Slide 21 · A', kind: 'rsa', p: 3, q: 13, e: 5, messages: [10], prompt: 'p = 3, q = 13, e = 5, M = 10. Generate the keys, encrypt M, and decrypt the ciphertext.' },
    { id: 'q4b', title: 'Slide Q4B · p=7, q=13, e=5', source: 'Slide 21 · B', kind: 'rsa', p: 7, q: 13, e: 5, messages: [8], prompt: 'p = 7, q = 13, e = 5, M = 8. Generate the keys, encrypt M, and decrypt the ciphertext.' },
    { id: 'q4c', title: 'Slide Q4C · p=11, q=7, e=11', source: 'Slide 21 · C', kind: 'rsa', p: 11, q: 7, e: 11, messages: [7], prompt: 'p = 11, q = 7, e = 11, M = 7. Generate the keys, encrypt M, and decrypt the ciphertext.' },
    { id: 'q4d', title: 'Slide Q4D · p=5, q=31, e=13', source: 'Slide 21 · D', kind: 'rsa', p: 5, q: 31, e: 13, messages: [5], prompt: 'p = 5, q = 31, e = 13, M = 5. Generate the keys, encrypt M, and decrypt the ciphertext.' },
    { id: 'speed_3_5', title: 'Quick RSA · p=3, q=5, e=3 (Speedup)', source: 'Authored quick-calc', kind: 'rsa', p: 3, q: 5, e: 3, text: 'b', messages: [2], prompt: 'Use A=1, B=2, … mapping with p = 3, q = 5, e = 3, and letter B (m = 2). Generate n, z, and d, encrypt m, and decrypt c.' },
    { id: 'encoding', title: 'Slide 14 · Four-digit encoding', source: 'Slide 14', kind: 'encoding', text: 'How are you?', prompt: 'Encode “How are you?” using slide 14: a=00 … z=25, A=26 … Z=51, 0=52 … 9=61, space=62, .=63, ,=64, ;=65, ?=66. Group two character codes into each four-digit block. Keep leading zeros. This question is encoding only.' }
  ];
  const EASY_PRIMES = [2, 3, 5, 7, 11];
  const EASY_EXPONENTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const FRIENDLY_START = { p: 5, q: 7, e: 5, m: 12 };
  function validateEasyChoice({ p, q, e, m }) {
    let pVal, qVal, eVal, mVal;
    try { pVal = integer(p); } catch (_) { return { ok: false, field: 'p', error: 'Choose a prime p from 2, 3, 5, 7, 11.', validEs: [] }; }
    try { qVal = integer(q); } catch (_) { return { ok: false, field: 'q', error: 'Choose a prime q from 2, 3, 5, 7, 11.', validEs: [] }; }
    if (!EASY_PRIMES.map(BigInt).includes(pVal)) return { ok: false, field: 'p', error: `p = ${pVal} is not in Easy numbers. Choose a prime below 13: 2, 3, 5, 7, or 11.`, validEs: [] };
    if (!EASY_PRIMES.map(BigInt).includes(qVal)) return { ok: false, field: 'q', error: `q = ${qVal} is not in Easy numbers. Choose a prime below 13: 2, 3, 5, 7, or 11.`, validEs: [] };
    if (pVal === qVal) return { ok: false, field: 'q', error: `p and q must be different primes. Both are currently ${pVal}, so n = ${pVal * qVal} = p², which breaks RSA key generation.`, validEs: [] };
    const n = pVal * qVal, z = (pVal - 1n) * (qVal - 1n);
    const validEs = EASY_EXPONENTS.filter(cand => BigInt(cand) < n && gcd(cand, z) === 1n);
    try { eVal = integer(e); } catch (_) { return { ok: false, field: 'e', n, z, validEs, error: `Choose a whole-number public exponent e below 13. Valid choices for p=${pVal}, q=${qVal} (n=${n}, z=${z}): ${validEs.join(', ')}.` }; }
    if (eVal <= 1n) return { ok: false, field: 'e', n, z, validEs, error: `e = ${eVal} is invalid because RSA requires 1 < e < n (e = 1 leaves every message unchanged). Valid choices here: ${validEs.join(', ')}.` };
    if (eVal >= 13n) return { ok: false, field: 'e', n, z, validEs, error: `e = ${eVal} is outside Easy numbers (choose e below 13). Valid choices for p=${pVal}, q=${qVal}: ${validEs.join(', ')}.` };
    if (eVal >= n) return { ok: false, field: 'e', n, z, validEs, error: `e = ${eVal} is invalid because e must satisfy 1 < e < n. Here n = ${pVal} × ${qVal} = ${n}, so choose e < ${n}. Valid choices: ${validEs.join(', ')}.` };
    const g = gcd(eVal, z);
    if (g !== 1n) return { ok: false, field: 'e', n, z, validEs, error: `e = ${eVal} is invalid because GCD(${eVal}, ${z}) = ${g} ≠ 1. Both ${eVal} and ${z} are divisible by ${g}, so no modular inverse d exists for ${eVal}d mod ${z} = 1. Valid choices here: ${validEs.join(', ')}.` };
    try { mVal = integer(m); } catch (_) { return { ok: false, field: 'm', n, z, validEs, error: `Enter a whole-number message m with 0 ≤ m < ${n}.` }; }
    if (mVal < 0n || mVal >= n) return { ok: false, field: 'm', n, z, validEs, error: `Message m = ${mVal} is out of bounds. RSA requires 0 ≤ m < n. Here n = ${n}, so choose m from 0 to ${n - 1n}.` };
    const key = keys(pVal, qVal, eVal);
    return { ok: true, p: pVal, q: qVal, n, z, e: eVal, d: key.d, m: mVal, validEs, key };
  }
  function generate(difficulty = 'beginner', id = 'generated', random = Math.random) {
    const pick = list => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
    if (difficulty === 'easy') {
      const pairs = EASY_PRIMES.flatMap(p => EASY_PRIMES.filter(q => q > p).map(q => [p, q]));
      const [p, q] = pick(pairs);
      const n = p * q, z = (p - 1) * (q - 1);
      const e = pick(EASY_EXPONENTS.filter(cand => cand < n && gcd(cand, z) === 1n));
      const m = n > 3 ? 2 + Math.min(n - 3, Math.floor(random() * (n - 2))) : Math.min(n - 1, Math.floor(random() * n));
      return { id, title: 'Generated · Easy numbers', source: 'Easy numbers · primes & e below 13', kind: 'rsa', p, q, e, messages: [m], prompt: `p = ${p}, q = ${q}, e = ${e}, m = ${m}. Generate the keys, encrypt m, and decrypt c. Show every modular reduction on paper.` };
    }
    const limit = difficulty === 'mixed' ? 200 : 77;
    const primes = [3, 5, 7, 11, 13, 17, 19, 23, 31];
    const pairs = primes.flatMap(p => primes.filter(q => q > p && p * q <= limit).map(q => [p, q]));
    const [p, q] = pick(pairs);
    const e = pick([3, 5, 7, 11, 13].filter(e => e < p * q && gcd(e, (p - 1) * (q - 1)) === 1n));
    const m = 2 + Math.min(p * q - 3, Math.floor(random() * (p * q - 2)));
    return { id, title: 'Generated · New paper numbers', source: 'Generated practice · same RSA method as slides 11–21', kind: 'rsa', p, q, e, messages: [m], prompt: `p = ${p}, q = ${q}, e = ${e}, M = ${m}. Generate the keys, encrypt M, and decrypt. Show every modular reduction on paper.` };
  }
  const math = { integer, gcd, isPrime, inverse, keys, trace, directReduction, renderTrace, encode, validateBlocks, solve, exercises, generate, EASY_PRIMES, EASY_EXPONENTS, FRIENDLY_START, validateEasyChoice, gcdSteps, inverseByTrial, powerShortcut };
  if (typeof module !== 'undefined' && module.exports) module.exports = math;
  root.Chapter5Math = math;
  root.Chapter5Working = { renderTrace, renderManualPowerFiveGuide, renderCalculatorStep, renderInverseGuide, powerShortcut, inverseByTrial, gcdSteps };
  if (typeof document === 'undefined') return;

  const lessons = [
    { title: 'Public and private keys', ref: 'Slides 2–4', body: `<p>With symmetric encryption, Alice and Bob share one secret key. Before sending encrypted messages, they must get that key to each other securely. Sending the key openly would let an eavesdropper read later messages.</p><p>Asymmetric cryptography uses two mathematically related keys. The <strong>public key</strong> can be shared; the <strong>private key</strong> stays with its owner. For confidentiality, Alice uses <strong>Bob’s public key</strong> to encrypt, and Bob uses <strong>Bob’s private key</strong> to decrypt.</p><div class="flow"><span>Alice’s message</span> → <span>Bob’s public key</span> → <span>Ciphertext</span> → <span>Bob’s private key</span> → <span>Bob reads it</span></div><h3>Example</h3><p>Anyone can put a message into Bob’s “locked mailbox”; only Bob has the key to open it. Making the mailbox public does not give everyone the opening key.</p><div class="callout warn"><strong>Read the slides carefully</strong><p>A public key alone does not prove the sender’s identity. Encrypting with Bob’s key protects secrecy but does not establish that Alice sent the message, or establish integrity by itself.</p></div>`, takeaway: 'Confidentiality: recipient’s public key → recipient’s private key.' },
    { title: 'One-way & trapdoor functions', ref: 'Slides 5–8', body: `<p>A one-way function is easy to compute forward but hard to reverse for suitably large inputs. A trapdoor function has extra secret information that makes the intended reverse operation practical.</p><h3>Multiplication versus factorization</h3><p>5 × 7 = 35 is easy. Given a huge product, finding its prime factors can be much harder. RSA publishes n = pq and keeps the prime factors secret. Small examples such as 35 are easy to factor and are useful only for learning.</p><h3>Exponentiation versus discrete logarithms</h3><p>3³ mod 7 = 6 is easy to calculate. Given 3, 7, and 6, searching for an exponent x such that 3ˣ mod 7 = 6 illustrates a discrete-logarithm problem. With appropriate large groups, reversing this is hard.</p><div class="callout"><strong>Clarification</strong><p>The slides use ordinary multiplication/factoring and exponent/logarithm analogies. Ordinary calculator logarithms are not the hard cryptographic problem. RSA is associated with factoring; schemes such as Diffie–Hellman use discrete-logarithm problems.</p></div>`, takeaway: 'Easy forward + hard reverse + secret trapdoor information is the central idea.' },
    { title: 'What the algorithm names mean', ref: 'Slides 9–10', body: `<p>The slide list mixes algorithms, purposes, families, and standards. Learn what each name represents rather than treating them all as interchangeable encryption methods.</p><div class="table-wrap"><table><thead><tr><th>Name</th><th>What it is used for</th></tr></thead><tbody><tr><td>RSA</td><td>Public-key encryption and digital-signature schemes using modular arithmetic.</td></tr><tr><td>Diffie–Hellman</td><td>Key agreement: two parties derive a shared secret. It does not directly encrypt the message or authenticate the parties on its own.</td></tr><tr><td>Digital signature</td><td>A function for authenticity and integrity, implemented by schemes such as RSA signatures.</td></tr><tr><td>ElGamal</td><td>A discrete-logarithm-based public-key encryption scheme; related signature constructions also exist.</td></tr><tr><td>ECC</td><td>Elliptic-curve cryptography: a family supporting key agreement and signatures, among other constructions.</td></tr><tr><td>PKCS</td><td>Public-Key Cryptography Standards: specifications, rather than one encryption algorithm.</td></tr><tr><td>Cramer–Shoup</td><td>A public-key encryption scheme designed to resist adaptive chosen-ciphertext attacks under its assumptions.</td></tr><tr><td>KEA</td><td>Key Exchange Algorithm: a key-agreement technique.</td></tr><tr><td>LUC</td><td>A family of public-key constructions based on Lucas sequences.</td></tr></tbody></table></div><h3>Example</h3><p>“Use Diffie–Hellman to agree on an AES key” describes key agreement followed by symmetric encryption. “Use RSA to sign” describes authentication rather than secrecy.</p>`, takeaway: 'RSA is the calculation focus of this chapter. Diffie–Hellman is key agreement; PKCS is standards.' },
    { title: 'Paper maths: mod, GCD & powers', ref: 'Supporting skills for slides 11–21', body: `<h3>1. Mod means the remainder (basic calculator method)</h3><p>A basic calculator (+, −, ×, ÷) does not have a mod button, so find any remainder in four steps:</p><div class="formula math">17 ÷ 5 = 3.4 → whole-number quotient Q = 3<br>3 × 5 = 15<br>17 − 15 = 2<br>Therefore 17 mod 5 = 2.</div><p>Divide by the modulus, ignore the decimal part to get Q, multiply back by the modulus, then subtract. For positive n, a remainder always lies between 0 and n − 1. You can reduce after every multiplication: (ab) mod n = ((a mod n)(b mod n)) mod n.</p><h3>2. GCD means greatest common divisor</h3><p>An inverse exists <strong>only when GCD(e, z) = 1</strong> (meaning e and z share no common factor greater than 1). For tiny numbers like e &lt; 13, check small factors (2, 3, 5, 7, 11): if both e and z divide evenly by the same factor, GCD(e, z) &gt; 1 and e is invalid. When needed, use Euclid’s divisions:</p><div class="formula math">24 = 4 × 5 + 4<br>5 = 1 × 4 + 1<br>4 = 4 × 1 + 0<br>Last non-zero remainder = 1 → GCD(24, 5) = 1.</div><h3>3. Find d: reduce e first, then solve rd = 1 + kz</h3><p>First check GCD(e, z) = 1; otherwise no modular inverse exists. Next, reduce e modulo z and call this remainder <strong>r</strong>. Then solve <strong>rd = 1 + kz</strong> by trying whole numbers k = 0, 1, 2, … until (1 + kz) ÷ r is a whole number.</p><p><strong>Example: e = 31, z = 24. Find d such that 31d mod 24 = 1.</strong></p><p><strong>Step 1 — Reduce e modulo z to get r:</strong></p><div class="formula math">31 ÷ 24 = 1.29… → Q = 1<br>31 − 1 × 24 = 7 → r = 7<br>Solve 7d = 1 + 24k.</div><p><strong>Step 2 — Try k = 0, 1, 2, … until (1 + 24k) ÷ 7 is a whole number:</strong></p><div class="table-wrap"><table><caption>Trial table for 7d = 1 + 24k</caption><thead><tr><th scope="col">k</th><th scope="col">1 + 24k</th><th scope="col">Divisible by 7?</th></tr></thead><tbody><tr><td>0</td><td>1</td><td>No (1 ÷ 7 = 0.14…)</td></tr><tr><td>1</td><td>25</td><td>No (25 ÷ 7 = 3.57…)</td></tr><tr><td>2</td><td>49</td><td>Yes: 49 ÷ 7 = <strong>7</strong></td></tr></tbody></table></div><div class="formula math">d = (1 + 24 × 2) ÷ 7 = 49 ÷ 7 = 7</div><p><strong>Step 3 — Always check using the ORIGINAL e = 31:</strong></p><div class="formula math">31 × 7 = 217<br>217 ÷ 24 = 9.04… → Q = 9<br>217 − 24 × 9 = 217 − 216 = 1. ✓</div><p><strong>Important:</strong> reducing e to r is only a shortcut for finding d. Keep the <strong>original e = 31</strong> in the public key and for encryption. Replacing 31 with 7 removes one group of 24; multiplying by d removes d groups of 24, so the remainder mod 24 stays the same.</p><p>For very large numbers, trying k can take many steps; the extended Euclidean algorithm finds d faster by back-substituting Euclid’s divisions.</p><h3>4. Repeated squaring &amp; shortcuts (never compute huge powers directly)</h3><p>To compute m<sup>e</sup> mod n on a basic calculator, split the exponent into powers of 2 (1, 2, 4, 8, …), square the previous remainder, and reduce after every multiplication. For example, for 12² mod 35:</p><div class="formula math">12² = 144<br>144 ÷ 35 = 4.11… → whole-number quotient 4<br>144 − 4 × 35 = 4<br>Therefore 12² mod 35 = 4.</div>${renderTrace(trace(12n, 5n, 35n), { method: 'squaring' })}<h4>Helpful shortcuts when a remainder is 0, 1, or n − 1</h4><ul><li><strong>0:</strong> 0<sup>k</sup> mod n = 0 (multiplying 0 by itself always gives 0).</li><li><strong>1:</strong> 1<sup>k</sup> mod n = 1 (multiplying 1 by itself always gives 1; any later squares stay 1).</li><li><strong>n − 1:</strong> n − 1 behaves like −1 modulo n. Even powers give 1 (because (−1)² = 1); odd powers give n − 1. For example, 34² mod 35 = 1 because 34 ≡ −1 (mod 35).</li></ul>${renderManualPowerFiveGuide()}`, takeaway: 'Divide → whole-number Q → multiply Q × n → subtract. Reduce e to r only to find d; use repeated squaring for powers.' },
    { title: 'RSA: keys, encryption & decryption', ref: 'Slides 10–24', body: `<h3>What each symbol means</h3><div class="table-wrap"><table><thead><tr><th>Symbol</th><th>Meaning</th></tr></thead><tbody><tr><td class="math">p, q</td><td>Two different prime numbers (kept secret).</td></tr><tr><td class="math">n</td><td>Modulus: n = p × q. Used for encryption and decryption.</td></tr><tr><td class="math">z</td><td>Totient φ(n) = (p − 1)(q − 1). Used only to choose e and find d.</td></tr><tr><td class="math">e</td><td>Public encryption exponent: 1 &lt; e &lt; n and GCD(e, z) = 1.</td></tr><tr><td class="math">d</td><td>Private decryption exponent: ed mod z = 1.</td></tr><tr><td class="math">m</td><td><strong>Original message number</strong> (plaintext block, 0 ≤ m &lt; n).</td></tr><tr><td class="math">c</td><td><strong>Encrypted message number</strong> (ciphertext block, 0 ≤ c &lt; n).</td></tr><tr><td class="math">Q, r, R</td><td>Q = whole-number quotient (separate from prime q). r or R = remainder.</td></tr></tbody></table></div><h3>The 6 RSA steps</h3><ol><li>Choose different prime numbers p and q.</li><li>Calculate <strong>n = pq</strong> and <strong>z = (p − 1)(q − 1)</strong>.</li><li>Choose e with 1 &lt; e &lt; n and GCD(e, z) = 1.</li><li>Find positive d with <strong>ed mod z = 1</strong>.</li><li>Public key: <strong>(n, e)</strong>. Private key: <strong>(n, d)</strong>.</li><li>Encrypt: <strong>c = m<sup>e</sup> mod n</strong>. Decrypt: <strong>m = c<sup>d</sup> mod n</strong>.</li></ol><h3>Friendly starting example: p = 5, q = 7, e = 5, m = 12</h3><div class="formula math">n = 5 × 7 = 35, z = 4 × 6 = 24<br>Choose e = 5; GCD(5, 24) = 1<br>Solve 5d = 1 + 24k → k = 1 gives d = 25 ÷ 5 = 5<br>Public (35, 5); private (35, 5)</div><h4>Encrypt m = 12</h4>${renderTrace(trace(12n, 5n, 35n), { method: 'squaring' })}<h4>Decrypt c = 17</h4>${renderTrace(trace(17n, 5n, 35n), { baseSymbol: 'c', resultSymbol: 'm', method: 'squaring' })}<p>The same exponent can occur in these tiny examples; that is mathematically valid, but it is a weak teaching key. Question 1 does not specify e, so it has several valid answers. Always report the e you chose.</p><div class="callout warn"><p>Use n when encrypting/decrypting; use z when finding d. The decryption table on slide 17 has a copied encryption-formula heading: the correct decryption formula is m=cᵈ mod n. Do not require GCD(m,n)=1; RSA also recovers valid message values sharing a factor with n.</p></div><p>With public n,e, factoring n lets an attacker recover p,q, then z and d. Large, appropriately generated keys and secure schemes make this attack impractical under their assumptions.</p>`, takeaway: 'm is the original message number; c is the encrypted message number. Use z for d, and n for c and m.' },
    { title: 'Letters, numbers & message blocks', ref: 'Slides 13–17', body: `<h3>Mapping 1: A=1 … Z=26</h3><p>Ignore letter case in this mapping. “love” becomes 12, 15, 22, 5. Encrypt each number separately for slide Q2. Using e=d=5,n=35:</p><div class="formula math">12 → 17; 15 → 15; 22 → 22; 5 → 10<br>Ciphertext = 17, 15, 22, 10<br>Decrypt → 12, 15, 22, 5 → “love”.</div><p>Ciphertext is a list of numbers; it need not fit back into A–Z. An unchanged value in a small example does not mean you used the wrong formula.</p><h3>Mapping 2: two-digit character codes</h3><p>a=00 … z=25; A=26 … Z=51; 0=52 … 9=61; space=62; period=63; comma=64; semicolon=65; question mark=66. This mapping is case-sensitive.</p><div class="formula math">“How are you?”<br>33 14 22 62 00 17 04 62 24 14 20 66<br>Blocks: 3314, 2262, 0017, 0462, 2414, 2066</div><p>Keep leading zeros when writing four-digit blocks, even though 0017 is numerically 17. The reference desk appends a visible space code 62 if a custom message has an odd number of characters.</p><div class="callout warn"><p>3314 cannot be encrypted with n=35. Taking 3314 mod 35 before encryption would lose the original block. Choose a suitable modulus or a different agreed encoding; this exercise only encodes the blocks.</p></div>`, takeaway: 'State the mapping, preserve block boundaries, and check each block is smaller than n.' },
    { title: 'Hybrid encryption & session keys', ref: 'Slides 27–32', body: `<p>Public-key operations are relatively expensive. Symmetric algorithms can efficiently encrypt large messages. Hybrid encryption uses both.</p><ol><li>Alice generates a random temporary session key K.</li><li>Alice encrypts the message with K using a symmetric scheme → Ciphertext1.</li><li>Alice protects K with Bob’s public key → Ciphertext2.</li><li>Alice sends both ciphertexts.</li><li>Bob uses his private key to recover K from Ciphertext2.</li><li>Bob uses K to recover the message from Ciphertext1.</li></ol><div class="flow"><span>Message + session key</span> → <span>Symmetric encryption</span> → <span>Ciphertext1</span></div><div class="flow" style="margin-top:.7rem"><span>Session key + Bob’s public key</span> → <span>Asymmetric encryption</span> → <span>Ciphertext2</span></div><h3>Example</h3><p>Alice sends a large file encrypted with AES, plus the protected AES session key. Bob performs the public-key operation on the key, not on every byte of the file. Sessions can rotate keys according to the protocol’s policy.</p><div class="callout"><p>The slide flow illustrates key transport. Real protocols also use authenticated key agreement. Hybrid encryption still needs authenticated public keys and an integrity-protecting scheme; it does not automatically stop tampering or impersonation.</p></div>`, takeaway: 'Symmetric encryption protects the message; asymmetric cryptography protects or establishes its session key.' },
    { title: 'Secrecy, signatures & both together', ref: 'Slides 33–35', body: `<div class="table-wrap"><table><thead><tr><th>Goal</th><th>Sender</th><th>Receiver</th></tr></thead><tbody><tr><td>Confidentiality</td><td>Encrypt for Bob using Bob’s public key.</td><td>Decrypt using Bob’s private key.</td></tr><tr><td>Authentication & integrity</td><td>Alice signs using Alice’s private key.</td><td>Verify using Alice’s authenticated public key.</td></tr><tr><td>Both</td><td>Alice signs, then encrypts for Bob.</td><td>Bob decrypts, then verifies Alice’s signature.</td></tr></tbody></table></div><h3>What a signature actually does</h3><p>A real signature scheme signs an encoded representation associated with a message, typically using a cryptographic hash. Verification checks it against the message. Signing is not a general way to hide a message: anyone with the public key can verify.</p><h3>Example</h3><p>A signed announcement can be public but authentic. An encrypted anonymous message can be secret without showing who sent it. A signed-and-encrypted message aims to provide both properties.</p><div class="callout"><p>The slides describe “encryption with the private key” to illustrate the direction of a signature-like RSA operation. Real RSA encryption and signature schemes have different encodings and purposes; the keys are not simply interchangeable for every algorithm.</p></div><p class="source">Clarification: <a href="https://www.rfc-editor.org/rfc/rfc8017.html#section-5" target="_blank" rel="noopener">RFC 8017: primitives and schemes</a>.</p>`, takeaway: 'Recipient’s key for secrecy; sender’s key for signing. Signing does not hide the message.' },
    { title: 'Tradeoffs, MITM & PKI', ref: 'Slides 22, 36–38', body: `<h3>Advantages and limitations</h3><p>You can publish an encryption key without transmitting the decryption secret. This helps with secret-key distribution, but public-key operations are slower than symmetric encryption and use different key-size requirements. Key sizes cannot be compared directly across RSA, ECC, and AES.</p><h3>The man-in-the-middle problem</h3><p>Alice asks for Bob’s public key. Eve substitutes Eve’s key. Alice encrypts to Eve, thinking she is encrypting to Bob. Eve can decrypt, then re-encrypt to Bob and forward it.</p><div class="flow"><span>Alice</span> → <span>Eve substitutes a key</span> → <span>Bob</span></div><h3>How certificates help</h3><p>A certificate binds an identity to a public key and is signed by an issuer. PKI provides certificates and trust relationships. A verifier checks a chain to a trusted authority, along with the identity, validity period, intended usage, and applicable revocation information.</p><p>A signature from an untrusted, substituted key is not enough. The key itself must be authenticated. Trusted fingerprints exchanged through another reliable channel are another way to check keys.</p><h3>Example</h3><p>“This certificate is signed” is only the beginning. Alice also needs to establish that the certificate represents Bob and chains to a trust anchor she accepts.</p><p class="source">Clarification: <a href="https://www.rfc-editor.org/rfc/rfc5280.html#section-6" target="_blank" rel="noopener">RFC 5280: certification path validation</a>.</p>`, takeaway: 'Public does not mean trusted. Authenticate the public key before relying on it.' },
    { title: 'Factoring, weaknesses & quantum risk', ref: 'Slides 23–24, 39', body: `<h3>Small RSA is easy to recover</h3><div class="formula math">Public key (55,3)<br>Factor 55 = 5 × 11<br>z = 4 × 10 = 40<br>d = 27 because 3 × 27 = 81 = 2 × 40 + 1<br></div><h4>Encrypt m=7</h4>${renderTrace(trace(7n, 3n, 55n))}<h4>Decrypt c=13</h4>${renderTrace(trace(13n, 27n, 55n), { baseSymbol: 'c', resultSymbol: 'm' })}<p>An attacker who factors n can compute z and recover a private exponent. Trying every possible private-key value is not the usual practical way to attack properly generated RSA. Large-number factoring uses more advanced algorithms than simple trial division.</p><h3>Implementation failures matter</h3><ul><li>Weak randomness or shared prime factors can expose keys.</li><li>Small or poorly chosen keys can enable special attacks.</li><li>Incorrect padding or protocol design can leak information.</li><li>Timing, power, or fault observations can reveal private computations.</li><li>Implementation bugs can defeat otherwise sound mathematics.</li></ul><h3>Quantum overview</h3><p>A sufficiently capable fault-tolerant quantum computer running Shor’s algorithm could factor large integers efficiently. That is why post-quantum cryptography is relevant. This is a conceptual overview, not a manual quantum-calculation exercise.</p><div class="callout warn"><p>The lesson keys and raw modular operations are for paper practice. Real RSA requires a secure scheme and suitable parameters. Do not interpret a 2048-bit RSA modulus as 2048 bits of security or as directly equivalent to an AES key of the same size.</p></div>`, takeaway: 'Factoring n exposes the RSA secret. Secure mathematics also needs secure randomness, encoding, implementation, and protocols.' }
  ];
  const concepts = [
    ['Public/private keys', 'Alice sends Bob a confidential message. Whose public key should she use?', ['Alice’s', 'Bob’s', 'Eve’s'], 1, 'Use the recipient’s public key. Bob alone should possess its private counterpart.', 'Slides 2–4'],
    ['One-way functions', 'Which task illustrates the difficulty associated with RSA?', ['Adding p and q', 'Factoring a suitably large n into its prime factors', 'Taking an ordinary calculator logarithm'], 1, 'RSA is associated with the difficulty of factoring large appropriately generated moduli.', 'Slides 5–8'],
    ['Algorithm names', 'What does Diffie–Hellman primarily provide?', ['Key agreement', 'Message compression', 'A certificate authority'], 0, 'Diffie–Hellman agrees on a shared secret; authentication and message encryption need additional mechanisms.', 'Slide 9'],
    ['Paper arithmetic', 'Which modulus is used to find the RSA inverse d?', ['n', 'z = (p−1)(q−1)', 'm'], 1, 'Solve ed mod z = 1. Use n later for encryption and decryption.', 'Slide 12'],
    ['RSA', 'If a toy ciphertext equals its plaintext number, must the calculation be wrong?', ['Yes, encryption must change every number', 'No, fixed points can occur in the toy examples', 'Yes, unless the message is a prime'], 1, 'Some valid RSA inputs are unchanged. Q4B, Q4C, and Q4D demonstrate this. A message need not be relatively prime to n.', 'Slide 21'],
    ['Encoding', 'Can the four-digit message block 3314 be encrypted as a recoverable raw RSA block with n=35?', ['Yes, just reduce 3314 modulo 35 first', 'No, the original block must be smaller than n', 'Yes, because it has four digits'], 1, 'Reducing an oversized original block loses information. Use an appropriate modulus or agreed encoding.', 'Slides 13–14'],
    ['Hybrid encryption', 'In the slide flow, what is protected by Bob’s public key?', ['Only the plaintext filename', 'The session key', 'Bob’s private key'], 1, 'The symmetric session key is protected with public-key encryption; it protects the bulk message.', 'Slides 27–31'],
    ['Signatures', 'Which key does Alice use to sign a message?', ['Bob’s public key', 'Alice’s private key', 'Alice’s public key'], 1, 'Alice signs with her private key. Verify with her authenticated public key.', 'Slides 33–35'],
    ['Trust', 'What lets Eve impersonate Bob during an unauthenticated key exchange?', ['Bob’s key is publicly visible', 'Eve substitutes her own public key for Bob’s', 'The ciphertext is a number'], 1, 'The issue is key substitution, not merely seeing a public key. Authenticate the key’s identity.', 'Slides 37–38'],
    ['Attacks', 'After factoring n into p and q, what can an attacker derive?', ['z, then a private exponent d', 'Only the plaintext length', 'A new AES algorithm'], 0, 'Compute z=(p−1)(q−1), then the inverse of the public e modulo z.', 'Slide 39']
  ];

  // UI is intentionally independent of Chapter 3’s quiz and cipher engines.
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const list = values => values.map(String).join(', ');
  const STORE = 'cyberquest_chapter5_v1';
  const fresh = () => ({ view: 'learn', lesson: 0, reviewed: [], completed: [], concepts: {}, difficulty: 'beginner', guided: { id: 'q1', generated: null, custom: { p: '5', q: '7', e: '5', m: '12' }, draft: {}, keyOK: false, mapOK: false, encOK: false, decOK: false, reveal: false }, exam: { generated: [], answers: {}, submitted: false }, lastScore: null });
  let state = fresh(), storageAvailable = true, resetPending = false;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && typeof saved === 'object' && ['learn', 'guided', 'exam', 'assignment'].includes(saved.view)) {
      // Validate stored shape rather than trusting arbitrary markup or exercise parameters.
      const defaults = fresh();
      state = { ...defaults, view: saved.view, lesson: Number.isInteger(saved.lesson) ? Math.max(0, Math.min(9, saved.lesson)) : 0, reviewed: Array.isArray(saved.reviewed) ? saved.reviewed.filter(i => Number.isInteger(i) && i >= 0 && i < 10) : [], completed: Array.isArray(saved.completed) ? saved.completed.filter(i => typeof i === 'string') : [], concepts: saved.concepts && typeof saved.concepts === 'object' ? saved.concepts : {}, difficulty: ['easy', 'beginner', 'mixed'].includes(saved.difficulty) ? saved.difficulty : 'beginner', lastScore: typeof saved.lastScore === 'string' ? saved.lastScore : null };
      if (saved.guided && typeof saved.guided.draft === 'object' && saved.guided.draft !== null) {
        const custom = saved.guided.custom && typeof saved.guided.custom === 'object'
          ? { p: String(saved.guided.custom.p ?? '5'), q: String(saved.guided.custom.q ?? '7'), e: String(saved.guided.custom.e ?? '5'), m: String(saved.guided.custom.m ?? '12') }
          : defaults.guided.custom;
        state.guided = { ...defaults.guided, ...saved.guided, custom, draft: saved.guided.draft };
      }
      if (saved.exam && Array.isArray(saved.exam.generated) && saved.exam.answers && typeof saved.exam.answers === 'object') state.exam = saved.exam;
      const validGenerated = ex => ex && ex.kind === 'rsa' && /^generated/.test(ex.id) && ex.messages?.length === 1 && ex.messages.every(m => Number.isInteger(m) && m >= 0) && solve(ex).n <= 200n;
      if (state.guided.generated && !validGenerated(state.guided.generated)) state.guided = defaults.guided;
      if (!exercises.some(ex => ex.id === state.guided.id) && !['generated', 'easy-custom'].includes(state.guided.id)) state.guided = defaults.guided;
      if (state.guided.id === 'generated' && !state.guided.generated) state.guided = defaults.guided;
      if (!state.exam.generated.every(validGenerated)) state.exam = defaults.exam;
    }
  } catch (_) { state = fresh(); /* malformed/old saved data falls back to a fresh session */ }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (_) { storageAvailable = false; $('storage-notice').hidden = false; }
    updateStats();
  }
  function updateStats() {
    $('lesson-count').textContent = `${new Set(state.reviewed).size} / ${lessons.length}`;
    $('practice-count').textContent = new Set(state.completed).size;
    $('exam-score').textContent = state.lastScore || '—';
  }
  function complete(id) { if (!state.completed.includes(id)) state.completed.push(id); save(); }
  function status(id, text, good) { const el = $(id); el.textContent = text; el.className = `status ${good ? 'success' : 'error'}`; }
  function tokens(text) { return String(text).trim().split(/[\s,;]+/).filter(Boolean); }
  function sameList(answer, expected) {
    try { const values = tokens(answer).map(integer); return values.length === expected.length && values.every((v, i) => v === integer(expected[i])); } catch (_) { return false; }
  }
  function feedbackInput(el, good) { el.classList.remove('good', 'bad'); el.classList.add(good ? 'good' : 'bad'); el.setAttribute('aria-invalid', String(!good)); }
  function input(name, label, draft = state.guided.draft, value, readonly = false) {
    const current = value === undefined ? draft[name] || '' : value;
    return `<label>${esc(label)}<input type="text" inputmode="${name === 'recovered_word' ? 'text' : 'numeric'}" autocomplete="off" data-field="${esc(name)}" value="${esc(current)}" ${readonly ? 'readonly' : ''} aria-label="${esc(label)}"></label>`;
  }
  function hint(id, text) { return `<button type="button" class="small text" data-hint="${id}" aria-expanded="false" aria-controls="${id}">Need a hint?</button><div class="hint" id="${id}" hidden>${text}</div>`; }
  function renderLesson() {
    $('lesson-nav').innerHTML = lessons.map((lesson, i) => `<button data-lesson="${i}" class="${i === state.lesson ? 'active' : ''}" ${i === state.lesson ? 'aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')} · ${lesson.title}</span>${state.reviewed.includes(i) ? '<span class="done" aria-label="Reviewed">✓</span>' : ''}</button>`).join('');
    const lesson = lessons[state.lesson];
    $('lesson-content').innerHTML = `<div class="eyebrow">Lesson ${state.lesson + 1} / ${lessons.length}</div><h2>${lesson.title}</h2><p class="source">${lesson.ref} · <a href="Chapter%205%20-%20Public%20Key%20Cryptography.pdf#page=${[2,5,9,11,11,13,27,33,36,39][state.lesson]}" target="_blank" rel="noopener">See source slides ↗</a></p>${lesson.body}<div class="callout good"><strong>Write this in your exam notes</strong><p>${lesson.takeaway}</p></div><div class="lesson-bottom"><button id="lesson-prev" ${state.lesson === 0 ? 'disabled' : ''}>← Previous</button><button id="lesson-reviewed" class="primary">${state.reviewed.includes(state.lesson) ? 'Reviewed ✓ · Continue' : 'Mark reviewed & continue'} →</button></div>`;
  }
  function renderConcepts() {
    $('concept-checks').innerHTML = concepts.map((q, i) => {
      const answered = Object.prototype.hasOwnProperty.call(state.concepts, i), choice = state.concepts[i];
      return `<div class="quiz-card"><span class="source">${q[0]} · ${q[5]}</span><h3>${q[1]}</h3>${q[2].map((option, j) => `<button class="option ${answered && choice === j ? 'active' : ''}" data-concept="${i}" data-choice="${j}" ${answered ? 'disabled' : ''}>${String.fromCharCode(65 + j)}. ${option}</button>`).join('')}${answered ? `<p class="feedback ${choice === q[3] ? 'correct' : 'incorrect'}">${choice === q[3] ? 'Correct.' : `Correct answer: ${String.fromCharCode(65 + q[3])}.`} ${q[4]}</p><button class="small" data-concept-retry="${i}">Try again</button>` : ''}</div>`;
    }).join('');
  }
  function easyCustomExercise() {
    const c = state.guided.custom || FRIENDLY_START;
    const v = validateEasyChoice(c);
    if (!v.ok) {
      return { id: 'easy-custom', title: 'Easy numbers · choose p, q, e, m below 13', source: 'Easy numbers · primes & e below 13', kind: 'rsa', p: null, q: null, e: null, messages: [], prompt: 'Choose two different primes p and q below 13, a valid public exponent e below 13, and a small numeric message m with 0 ≤ m < n.', easyValid: v };
    }
    return { id: 'easy-custom', title: 'Easy numbers · choose p, q, e, m below 13', source: 'Easy numbers · primes & e below 13', kind: 'rsa', p: Number(v.p), q: Number(v.q), e: Number(v.e), messages: [Number(v.m)], prompt: `p = ${v.p}, q = ${v.q}, e = ${v.e}, m = ${v.m}. Generate the keys, encrypt m, and decrypt c. Show every modular reduction on paper.`, easyValid: v };
  }
  function currentExercise() {
    if (state.guided.id === 'generated') return state.guided.generated;
    if (state.guided.id === 'easy-custom') return easyCustomExercise();
    return exercises.find(ex => ex.id === state.guided.id);
  }
  function guidedKey(ex) {
    if (ex.provided) return solve(ex);
    const draft = state.guided.draft;
    const result = solve(ex, ex.e || draft.e, draft.d);
    if (integer(draft.n) !== result.n || integer(draft.z) !== result.z) throw new Error('Check n=pq and z=(p−1)(q−1). Both must be correct before continuing.');
    return result;
  }
  function traceForm(t, direction, index) {
    const baseLabel = direction === 'enc' ? 'm' : 'c', prefix = `${direction}_${index}`;
    const shortcut = powerShortcut(t.base, t.exponent, t.modulus);
    const shortcutTip = shortcut ? `<p class="field-note">Tip: ${baseLabel} = ${t.base} is a special value (0, 1, or n − 1). Check if a shortcut applies before multiplying.</p>` : '';
    return `<details class="answer-details" ${index === 0 ? 'open' : ''}><summary>Block ${index + 1} · ${baseLabel}=${t.base}, exponent=${t.exponent}</summary><p class="math">${t.exponent} = ${t.selected.map(r => r.power).reverse().join(' + ')}. For each row: square the previous remainder, divide by ${t.modulus}, drop the decimal for Q, multiply Q × ${t.modulus}, and subtract.</p>${shortcutTip}<div class="table-wrap"><table><thead><tr><th>Power</th><th>Basic-calculator operation</th><th>Your remainder</th></tr></thead><tbody><tr><td>${baseLabel}<sup>1</sup></td><td>Starting number</td><td class="math">${t.base}</td></tr>${t.squares.slice(1).map(r => `<tr><td>${baseLabel}<sup>${r.power}</sup></td><td>Square remainder for ${baseLabel}<sup>${r.power / 2n}</sup>, then reduce mod ${t.modulus}</td><td>${input(`${prefix}_sq_${r.power}`, `Block ${index + 1}: ${baseLabel} power ${r.power} remainder`)}</td></tr>`).join('')}</tbody></table></div><p class="muted">Multiply the selected powers (${t.selected.map(r => r.power).join(', ')}) one at a time, reducing mod ${t.modulus} after each multiplication.</p>${t.products.slice(1).map((r, j) => input(`${prefix}_prod_${j + 1}`, `Accumulated remainder after multiplying power ${r.power}`)).join('')}${input(`${prefix}_final`, direction === 'enc' ? `Ciphertext c for block ${index + 1}` : `Recovered plaintext m for block ${index + 1}`)}</details>`;
  }
  function renderEasyBuilder(v) {
    const c = state.guided.custom || FRIENDLY_START;
    const pButtons = EASY_PRIMES.map(val => `<button type="button" class="${String(c.p) === String(val) ? 'active' : ''}" aria-pressed="${String(c.p) === String(val)}" data-easy-p="${val}">${val}</button>`).join('');
    const qButtons = EASY_PRIMES.map(val => `<button type="button" class="${String(c.q) === String(val) ? 'active' : ''}" aria-pressed="${String(c.q) === String(val)}" data-easy-q="${val}">${val}</button>`).join('');
    const eButtons = EASY_EXPONENTS.map(val => `<button type="button" class="${String(c.e) === String(val) ? 'active' : ''}" aria-pressed="${String(c.e) === String(val)}" data-easy-e="${val}">${val}</button>`).join('');
    const quickMs = [0, 1, 2, 12];
    if (v.n && v.n > 2n && !quickMs.includes(Number(v.n - 1n))) quickMs.push(Number(v.n - 1n));
    const mButtons = quickMs.filter(m => !v.n || BigInt(m) < v.n).map(val => `<button type="button" class="small ${String(c.m) === String(val) ? 'active' : ''}" data-easy-m="${val}">m = ${val}${v.n && BigInt(val) === v.n - 1n ? ' (n−1)' : ''}</button>`).join('');
    return `<section class="panel" aria-label="Easy numbers builder"><div class="step-head"><div><div class="step-num">Easy numbers · custom builder</div><h3>Choose p, q, and e below 13</h3></div><button type="button" class="small primary" data-action="load-friendly-start">Friendly start (p=5, q=7, e=5, m=12)</button></div><p class="source">Your choices p, q, and e stay below 13, while calculated values n, z, d, and ciphertext c may exceed 13. Invalid choices are never changed silently—we explain why below.</p><div class="two-col"><div><label>Prime p (below 13)</label><div class="choice-group" role="group" aria-label="Choose prime p">${pButtons}</div></div><div><label>Prime q (different prime below 13)</label><div class="choice-group" role="group" aria-label="Choose prime q">${qButtons}</div></div></div><div style="margin-top:1rem"><label>Public exponent e (below 13, with 1 &lt; e &lt; n and GCD(e, z) = 1)</label><div class="choice-group" role="group" aria-label="Choose public exponent e">${eButtons}</div></div><div style="margin-top:1rem"><label for="easy-m-input">Numeric message m (0 ≤ m &lt; n)</label><div class="control-row" style="margin-bottom:.4rem"><input id="easy-m-input" type="text" inputmode="numeric" autocomplete="off" data-easy-m-input="true" value="${esc(c.m)}" style="max-width:160px"><div class="choice-group" role="group" aria-label="Quick message presets">${mButtons}</div></div></div>${v.ok ? `<div class="callout good"><strong>Ready to practise</strong><p class="math">p = ${v.p}, q = ${v.q}, e = ${v.e}, m = ${v.m} (0 ≤ m &lt; ${v.n}). Valid e below 13 for (${v.p}, ${v.q}): ${v.validEs.join(', ')}.</p><p class="field-note">Note: calculated n = ${v.n}, z, d, and ciphertext c may exceed 13.</p></div>` : `<div class="callout warn" role="alert"><strong>Unavailable or invalid choice</strong><p>${esc(v.error)}</p></div>`}</section>`;
  }
  function renderGuided() {
    const ex = currentExercise(), g = state.guided;
    const easyStub = { id: 'easy-custom', title: 'Easy numbers · choose p, q, e, m below 13' };
    $('exercise-select').innerHTML = [easyStub, ...exercises, ...(g.generated ? [g.generated] : [])].map(e => `<option value="${e.id}" ${e.id === g.id ? 'selected' : ''}>${esc(e.title)}</option>`).join('');
    $('difficulty').value = state.difficulty;
    let html = `<section class="panel"><div class="eyebrow">${esc(ex.source)}</div><h2>${esc(ex.title)}</h2><p class="exercise-prompt">${esc(ex.prompt)}</p><p class="source">Work on paper with a basic calculator (+, −, ×, ÷). Enter whole numbers; use commas or spaces between blocks.</p><details class="answer-details"><summary>Symbol &amp; basic-calculator reference</summary><p class="math"><strong>p, q:</strong> secret primes &nbsp;|&nbsp; <strong>n = pq:</strong> modulus &nbsp;|&nbsp; <strong>z = (p−1)(q−1):</strong> totient for d</p><p class="math"><strong>e:</strong> public exponent &nbsp;|&nbsp; <strong>d:</strong> private exponent &nbsp;|&nbsp; <strong>m:</strong> original message number &nbsp;|&nbsp; <strong>c:</strong> encrypted message number</p><p><strong>Remainder on a basic calculator:</strong> divide → drop decimal for whole-number quotient Q → multiply Q × modulus → subtract.</p></details></section>`;
    if (ex.id === 'easy-custom') {
      html += renderEasyBuilder(ex.easyValid);
      if (!ex.easyValid.ok) { $('guided-content').innerHTML = html; return; }
    }
    if (ex.kind === 'encoding') {
      html += `<section class="panel"><div class="step-num">Encoding only</div><h3>Write the six four-digit blocks</h3>${input('blocks', 'Four-digit blocks (keep leading zeros)')}<label>Optional modulus n to check block sizes<input type="text" inputmode="numeric" data-field="block_n" value="${esc(g.draft.block_n || '')}"></label><div class="actions"><button data-action="check-blocks" class="primary">Check encoding</button></div><div id="blocks-status" class="status" aria-live="polite"></div>${hint('blocks-hint', 'Find each case-sensitive two-digit code. A space is 62. Pair consecutive codes without dropping zeros. For RSA, each resulting block must be strictly smaller than n.')}</section>`;
    } else {
      if (!ex.provided) html += `<section class="panel"><div class="step-num">Step 1 · Key generation</div><h3>Build the public and private keys</h3><div class="grid-fields">${input('n', 'n = pq')}${input('z', 'z = (p−1)(q−1)')}${input('e', ex.e ? 'e (given)' : 'Choose e', g.draft, ex.e, Boolean(ex.e))}${input('d', 'd: ed mod z = 1')}</div><div class="actions"><button data-action="check-keys" class="primary">Check keys & continue</button></div><div id="key-status" class="status" aria-live="polite">${g.keyOK ? 'Keys checked. Continue below.' : ''}</div>${hint('key-hint', 'Multiply p by q for n; multiply p−1 by q−1 for z. Choose 1&lt;e&lt;n with GCD(e,z)=1 (an inverse exists only when GCD(e,z)=1).<br><br><strong>Easy way to find d:</strong> reduce e modulo z first: call this remainder r. Then solve rd = 1 + kz by trying k=0, 1, 2, … until (1 + kz) ÷ r is a whole number.<br><br>For e=31, z=24: r = 31 mod 24 = 7. Try k=1: 25 ÷ 7 is not whole. Try k=2: 49 ÷ 7 = 7, so d=7.<br><br>Always check with the original e: 31 × 7 = 217; 217 − 24 × 9 = 1. Keep the original e in your public key.')}</section>`;
      else html += '<div class="callout good"><strong>Keys supplied</strong><p>Public (143,37), private (143,13). Begin with the encryption; key generation is not required.</p></div>';
      let result = null;
      try { if (g.keyOK || ex.provided) result = guidedKey(ex); } catch (_) { g.keyOK = false; g.mapOK = false; g.encOK = false; g.decOK = false; }
      if (result && ex.kind === 'key') html += `<div class="callout good"><strong>Correct keys</strong><p class="math">Public (${result.n},${result.e}); private (${result.n},${result.d}).</p><p>You can now try Q2 using the same e and d.</p></div>`;
      if (result && ex.kind !== 'key') {
        if (ex.text) html += `<section id="map-section" class="panel"><div class="step-num">Step 2 · Encoding</div><h3>Convert “${esc(ex.text)}” with A=1 … Z=26</h3>${input('mapping', 'Plaintext number list')}<button data-action="check-mapping" class="primary">Check mapping</button><div id="map-status" class="status" aria-live="polite">${g.mapOK ? 'Mapping checked. Continue below.' : ''}</div>${hint('map-hint', 'Count A=1, B=2, … Z=26. Use one numeric block for each letter. Do not use the slide 14 two-digit mapping in this question.')}</section>`;
        if (!ex.text || g.mapOK) html += `<section id="encryption-section" class="panel"><div class="step-num">${ex.text ? 'Step 3' : 'Step 2'} · Encryption</div><h3>Use the public key (${result.n}, ${result.e})</h3><p>Calculate c=m<sup>e</sup> mod n. Enter each remainder, then the ciphertext.</p>${result.messages.map((m, i) => traceForm(m.encryption, 'enc', i)).join('')}<button data-action="check-encryption" class="primary">Check encryption</button><div id="enc-status" class="status" aria-live="polite">${g.encOK ? 'Encryption checked. Decryption is unlocked below.' : ''}</div>${hint('enc-hint', 'Square the previous remainder, divide by n, take the whole-number quotient Q, multiply Q × n, and subtract. Multiply only the powers that sum to e. Check shortcuts if a remainder is 0, 1, or n − 1.')}</section>`;
        if (g.encOK && (!ex.text || g.mapOK)) html += `<section id="decryption-section" class="panel"><div class="step-num">${ex.text ? 'Step 4' : 'Step 3'} · Decryption</div><h3>Use the private key (${result.n}, ${result.d})</h3><p class="math">Ciphertext: ${list(result.messages.map(m => m.c))}</p><p>Calculate m=c<sup>d</sup> mod n. The modulus is still n.</p>${result.messages.map((m, i) => traceForm(m.decryption, 'dec', i)).join('')}${ex.text ? input('recovered_word', 'Recovered word') : ''}<button data-action="check-decryption" class="primary">Check decryption</button><div id="dec-status" class="status" aria-live="polite">${g.decOK ? 'Correct. Encryption and decryption complete!' : ''}</div>${hint('dec-hint', 'Start from the ciphertext c and use d as the exponent. Square and reduce exactly as in encryption. The recovered number m should match the original message block.')}</section>`;
      } else if (ex.kind !== 'key') html += '<div class="empty-state">Check the keys above to unlock the message calculations.</div>';
    }
    html += `<section class="panel"><div class="step-head"><div><h3>Worked solution</h3><p class="muted">Reveal when you are ready to compare your paper steps.</p></div><button data-action="reveal">${g.reveal ? 'Hide solution' : 'Reveal solution'}</button></div><div id="guided-solution" ${g.reveal ? '' : 'hidden'}>${g.reveal ? guidedSolution(ex) : ''}</div><div class="actions"><button data-action="print-guided">Print this question</button><button data-action="print-guided-key">Print its answer key</button><button data-action="retry-guided">Clear this attempt</button></div></section>`;
    $('guided-content').innerHTML = html;
  }
  function traceSolution(t, baseSymbol, resultSymbol) {
    return renderTrace(t, { baseSymbol, resultSymbol, method: 'squaring' });
  }
  function solution(ex, chosenE, chosenD) {
    if (ex.kind === 'encoding') {
      const encoded = solve(ex);
      return `<p>Character codes: ${encoded.codes.join(' ')}</p><p class="math">Blocks: ${encoded.blockStrings.join(', ')}</p><p>0017 represents the number 17, but its four-digit width preserves the two character codes. For all of these blocks together, n must be greater than 3314.</p>`;
    }
    const r = solve(ex, chosenE, chosenD);
    let html = ex.provided ? '<p>Use the supplied keys; no key generation is needed.</p>' : `<div class="formula math">n=${r.p} × ${r.q}=${r.n}<br>z=(${r.p}−1)(${r.q}−1)=${r.z}<br>e=${r.e}; GCD(${r.e},${r.z})=1<br>d=${r.d}; ${r.e} × ${r.d}=${r.e * r.d}=${(r.e * r.d - 1n) / r.z} × ${r.z}+1<br>Public (${r.n},${r.e}); private (${r.n},${r.d})</div>${renderInverseGuide(r.e, r.z)}`;
    if (!ex.e) html += '<p class="source">This is one valid choice. Other e,d pairs satisfying the conditions are also accepted. The default example uses e=5.</p>';
    if (ex.text) html += `<p>Encoding: “${ex.text}” → ${list(ex.messages)} (A=1 … Z=26).</p>`;
    r.messages.forEach((m, i) => { html += `<h3>Block ${i + 1} · Encrypt ${m.m}</h3>${traceSolution(m.encryption, 'm', 'c')}<h3>Block ${i + 1} · Decrypt ${m.c}</h3>${traceSolution(m.decryption, 'c', 'm')}`; });
    if (r.messages.length) html += `<div class="callout good"><p>Ciphertext: <strong>${list(r.messages.map(m => m.c))}</strong><br>Recovered: <strong>${list(r.messages.map(m => m.m))}${ex.text ? ` → “${ex.text}”` : ''}</strong></p></div>`;
    if (r.messages.some(m => m.m === m.c)) html += '<p class="source">An unchanged number is a valid fixed point in this small example. The checker intentionally accepts it.</p>';
    return html;
  }
  function guidedSolution(ex) { try { const r = guidedKey(ex); return solution(ex, r.e, r.d); } catch (_) { return solution(ex); } }

  function checkKeys() {
    const ex = currentExercise();
    try {
      const r = guidedKey(ex);
      state.guided.keyOK = true; renderGuided();
      status('key-status', `Correct. Public (${r.n}, ${r.e}); private (${r.n}, ${r.d}).`, true);
      if (ex.kind === 'key') complete(ex.id);
    } catch (error) { state.guided.keyOK = false; status('key-status', error.message, false); }
    save();
  }
  function checkMapping() {
    const ex = currentExercise();
    if (!sameList(state.guided.draft.mapping, ex.messages)) { status('map-status', 'Check each letter with A=1 … Z=26, and enter exactly four numbers in order.', false); return; }
    state.guided.mapOK = true; renderGuided(); status('map-status', 'Correct mapping. Begin encryption below.', true); save();
  }
  function checkTrace(direction) {
    const ex = currentExercise();
    let result;
    try { result = guidedKey(ex); } catch (error) { status(direction === 'enc' ? 'enc-status' : 'dec-status', error.message, false); return; }
    let valid = true, checked = 0;
    result.messages.forEach((m, i) => {
      const t = direction === 'enc' ? m.encryption : m.decryption;
      const expected = [...t.squares.slice(1).map(row => [`${direction}_${i}_sq_${row.power}`, row.remainder]), ...t.products.slice(1).map((row, j) => [`${direction}_${i}_prod_${j + 1}`, row.remainder]), [`${direction}_${i}_final`, t.result]];
      expected.forEach(([name, answer]) => {
        const el = $('guided-content').querySelector(`[data-field="${name}"]`);
        let ok = false; try { ok = integer(state.guided.draft[name]) === answer; } catch (_) { /* blank/invalid */ }
        feedbackInput(el, ok); valid = valid && ok; checked++;
      });
    });
    if (direction === 'dec' && ex.text) {
      const ok = String(state.guided.draft.recovered_word || '').trim().toLowerCase() === ex.text;
      feedbackInput($('guided-content').querySelector('[data-field="recovered_word"]'), ok); valid = valid && ok;
    }
    const statusId = direction === 'enc' ? 'enc-status' : 'dec-status';
    if (!valid) { status(statusId, `Some entries need another look (${checked} arithmetic entries checked). Check the marked fields; reduce each result modulo n.`, false); return; }
    state.guided[direction === 'enc' ? 'encOK' : 'decOK'] = true;
    renderGuided(); status(statusId, direction === 'enc' ? 'Correct. Decryption is now unlocked.' : 'Correct. Your message is recovered; this exercise is complete.', true);
    if (direction === 'dec') complete(ex.id === 'generated' ? `generated-${ex.p}-${ex.q}-${ex.e}-${ex.messages[0]}` : ex.id === 'easy-custom' ? `easy-${ex.p}-${ex.q}-${ex.e}-${ex.messages[0]}` : ex.id);
    save();
  }
  function checkBlocks() {
    const g = state.guided, expected = solve(currentExercise());
    const entered = tokens(g.draft.blocks);
    const valid = entered.length === expected.blockStrings.length && entered.every((v, i) => v === expected.blockStrings[i]);
    if (!valid) { status('blocks-status', 'Check the codes and pairing. Enter six four-digit blocks, including leading zeros.', false); return; }
    try { if (String(g.draft.block_n || '').trim()) validateBlocks(expected.blocks, g.draft.block_n); }
    catch (error) { status('blocks-status', `Encoding is correct. ${error.message}`, false); return; }
    status('blocks-status', 'Correct encoding. These are message blocks, not RSA ciphertext.', true); complete('encoding');
  }
  function newGuided(ex) {
    state.guided = { id: ex.id, generated: ex.id === 'generated' ? ex : state.guided.generated, custom: state.guided.custom || { ...FRIENDLY_START }, draft: {}, keyOK: false, mapOK: false, encOK: false, decOK: false, reveal: false };
    renderGuided(); save();
  }

  // Exam: the whole paper is graded together. No expected values enter the DOM before submission.
  function examItems() { return state.exam.generated.length ? state.exam.generated : exercises; }
  function examFields(ex) {
    if (ex.kind === 'encoding') return [['blocks', 'Four-digit blocks', true]];
    const fields = [];
    if (!ex.provided && ex.id !== 'q2') fields.push(['n', 'n'], ['z', 'z'], ...(!ex.e ? [['e', 'Chosen e']] : []), ['d', 'd']);
    if (ex.kind !== 'key') fields.push(['c', 'Ciphertext number(s)', true], ['m', ex.text ? 'Recovered plaintext numbers' : 'Recovered plaintext m', true]);
    return fields;
  }
  function examPrompt(ex) { return ex.id === 'q2' ? 'Using your Q1 key pair, encrypt “love” with A=1 … Z=26. Write the ciphertext number list and the recovered plaintext number list.' : ex.prompt; }
  function examField(ex, field) {
    const key = `${ex.id}:${field[0]}`;
    return `<label class="${field[2] ? 'wide' : ''}">${esc(field[1])}<input type="text" inputmode="numeric" autocomplete="off" data-exam-field="${esc(key)}" aria-label="${esc(ex.title + ': ' + field[1])}" value="${esc(state.exam.answers[key] || '')}" ${state.exam.submitted ? 'readonly' : ''}></label>`;
  }
  function renderExam() {
    $('exam-content').innerHTML = `<p class="source">${state.exam.generated.length ? 'Generated paper · 4 RSA questions + 2 concept questions' : 'Course slide paper · Q1–Q4 + encoding + 2 concept questions'}</p>${examItems().map((ex, i) => `<section class="exam-question"><h3>${i + 1}. ${esc(ex.title)}</h3><p>${esc(examPrompt(ex))}</p><p class="source">${esc(ex.source)}</p><div class="exam-fields">${examFields(ex).map(field => examField(ex, field)).join('')}</div></section>`).join('')}${[0,8].map(i => `<section class="exam-question"><h3>Concept · ${concepts[i][0]}</h3><p>${concepts[i][1]}</p>${concepts[i][2].map((option, j) => `<label><input type="radio" name="exam-concept-${i}" data-exam-field="concept:${i}" value="${j}" ${String(state.exam.answers[`concept:${i}`]) === String(j) ? 'checked' : ''} ${state.exam.submitted ? 'disabled' : ''}> ${String.fromCharCode(65 + j)}. ${option}</label>`).join('')}</section>`).join('')}`;
    $('exam-submit').disabled = Boolean(state.exam.submitted);
    $('exam-print-key').disabled = !state.exam.submitted;
    if (state.exam.submitted) renderExamReview(); else $('exam-review').innerHTML = '';
  }
  function gradeExam() {
    const answers = state.exam.answers, rows = [];
    let q1Key = null;
    try {
      q1Key = solve(exercises[0], answers['q1:e'], answers['q1:d']);
      if (integer(answers['q1:n']) !== q1Key.n || integer(answers['q1:z']) !== q1Key.z) q1Key = null;
    } catch (_) { /* dependent Q2 cannot be graded against invalid Q1 keys */ }
    for (const ex of examItems()) {
      let r = null, error = null;
      try {
        if (ex.id === 'q2') { if (!q1Key) throw new Error('Q2 depends on a valid Q1 key pair. Correct Q1 in your next attempt. The worked example below uses e=5.'); r = solve(ex, q1Key.e, q1Key.d); }
        else if (!ex.e && ex.kind !== 'encoding') r = solve(ex, answers[`${ex.id}:e`], answers[`${ex.id}:d`]);
        else r = solve(ex);
      } catch (err) { error = err.message; }
      const checks = examFields(ex).map(([field, label]) => {
        const value = answers[`${ex.id}:${field}`] || '';
        let correct = false;
        if (r) {
          if (field === 'blocks') correct = tokens(value).length === r.blockStrings.length && tokens(value).every((v, i) => v === r.blockStrings[i]);
          else if (field === 'c' || field === 'm') correct = sameList(value, r.messages.map(m => m[field]));
          else try { correct = integer(value) === r[field]; } catch (_) { /* missing/invalid */ }
        }
        return { label, value, correct };
      });
      rows.push({ ex, r, error, checks });
    }
    const conceptual = [0, 8].map(i => ({ index: i, correct: String(answers[`concept:${i}`]) === String(concepts[i][3]) }));
    const total = rows.reduce((sum, row) => sum + row.checks.length, 0) + conceptual.length;
    const correct = rows.reduce((sum, row) => sum + row.checks.filter(c => c.correct).length, 0) + conceptual.filter(c => c.correct).length;
    return { rows, conceptual, total, correct };
  }
  function renderExamReview() {
    const grade = gradeExam();
    $('exam-review').innerHTML = `<section class="panel"><div class="eyebrow">Paper submitted</div><h2>${grade.correct} / ${grade.total} answer fields correct</h2><p>Compare your written method with the worked steps. A final-answer check cannot assess every line you wrote on paper.</p></section>${grade.rows.map(row => `<section class="panel"><h3>${esc(row.ex.title)}</h3>${row.error ? `<p class="incorrect">${esc(row.error)}</p>` : ''}<ul>${row.checks.map(check => `<li class="${check.correct ? 'correct' : 'incorrect'}">${check.correct ? '✓' : '✗'} ${esc(check.label)}: ${esc(check.value || '(blank)')}</li>`).join('')}</ul><details class="answer-details"><summary>Full worked solution</summary>${row.r && row.ex.kind !== 'encoding' ? solution(row.ex, row.r.e, row.r.d) : solution(row.ex)}</details></section>`).join('')}<section class="panel"><h3>Concept feedback</h3>${grade.conceptual.map(row => `<p class="${row.correct ? 'correct' : 'incorrect'}">${row.correct ? '✓' : '✗'} ${concepts[row.index][0]}: ${concepts[row.index][4]}</p>`).join('')}</section>`;
  }
  function printMaterial(items, withAnswers, useExam = false) {
    const grade = useExam && withAnswers ? gradeExam() : null;
    const title = withAnswers ? 'Chapter 5 · Worked answer key' : 'Chapter 5 · Paper practice';
    $('print-area').innerHTML = `<div class="print-controls"><button data-action="close-print">← Back to study</button><button data-action="print-now">Print / Save as PDF</button><span>Preview · ${withAnswers ? 'worked answers' : 'questions only'}</span></div><h1>${title}</h1><p>ICT 304 · Show each multiplication and modular reduction on paper.</p>${withAnswers ? '' : '<p>Name: ________________________ &nbsp; Date: ______________</p>'}${!withAnswers && !useExam ? '<p>Public (n,e); private (n,d). n=pq; z=(p−1)(q−1). ed mod z=1. c=mᵉ mod n; m=cᵈ mod n.</p>' : ''}${items.map((ex, i) => {
      let answer = '';
      if (withAnswers) {
        if (ex.easyValid && !ex.easyValid.ok) {
          answer = `<div class="callout warn"><p>${esc(ex.easyValid.error)}</p></div>`;
        } else {
          const row = grade?.rows.find(row => row.ex.id === ex.id);
          answer = row?.r && ex.kind !== 'encoding' ? solution(ex, row.r.e, row.r.d) : (items.length === 1 ? guidedSolution(ex) : solution(ex));
        }
      }
      return `<section class="print-question"><h3>${i + 1}. ${esc(ex.title)}</h3><p>${esc(useExam ? examPrompt(ex) : ex.prompt)}</p><p>${esc(ex.source)}</p>${withAnswers ? answer : '<p>Answer: ______________________________________________________</p><div class="work-box"></div>'}</section>`;
    }).join('')}${useExam ? [0,8].map(i => `<section class="print-question"><h3>Concept · ${concepts[i][0]}</h3><p>${concepts[i][1]}</p>${withAnswers ? `<p>${concepts[i][4]}</p>` : `<p>${concepts[i][2].map((option, j) => `${String.fromCharCode(65+j)}. ${option}`).join('<br>')}</p><p>Answer: __________</p>`}</section>`).join('') : ''}`;
    document.body.classList.add('print-preview');
    root.scrollTo({ top: 0 });
    $('print-area').querySelector('button').focus();
  }
  function switchView(view) {
    state.view = view;
    document.querySelector('.hero-note').hidden = view === 'exam';
    document.querySelector('.hero').classList.toggle('exam-hero', view === 'exam');
    for (const name of ['learn', 'guided', 'exam', 'assignment']) $('view-' + name).hidden = name !== view;
    document.querySelectorAll('[data-view]').forEach(button => { button.classList.toggle('active', button.dataset.view === view); if (button.dataset.view === view) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
    save();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.view) switchView(button.dataset.view);
    if (button.dataset.lesson !== undefined) { state.lesson = Number(button.dataset.lesson); renderLesson(); save(); }
    if (button.dataset.hint) { const box = $(button.dataset.hint); box.hidden = !box.hidden; button.setAttribute('aria-expanded', String(!box.hidden)); }
    if (button.dataset.concept !== undefined) { state.concepts[button.dataset.concept] = Number(button.dataset.choice); renderConcepts(); save(); }
    if (button.dataset.conceptRetry !== undefined) { delete state.concepts[button.dataset.conceptRetry]; renderConcepts(); save(); }
    const actions = {
      'check-keys': checkKeys, 'check-mapping': checkMapping, 'check-encryption': () => checkTrace('enc'), 'check-decryption': () => checkTrace('dec'), 'check-blocks': checkBlocks,
      reveal: () => { state.guided.reveal = !state.guided.reveal; renderGuided(); save(); },
      'retry-guided': () => newGuided(currentExercise()),
      'load-friendly-start': () => { state.guided.custom = { p: '5', q: '7', e: '5', m: '12' }; newGuided({ id: 'easy-custom' }); },
      'print-guided': () => printMaterial([currentExercise()], false),
      'print-guided-key': () => printMaterial([currentExercise()], true),
      'close-print': () => { document.body.classList.remove('print-preview'); $('print-worksheet').focus(); },
      'print-now': () => root.print()
    };
    if (actions[button.dataset.action]) actions[button.dataset.action]();
    if (button.dataset.easyP) { state.guided.custom = { ...(state.guided.custom || FRIENDLY_START), p: button.dataset.easyP }; newGuided({ id: 'easy-custom' }); }
    if (button.dataset.easyQ) { state.guided.custom = { ...(state.guided.custom || FRIENDLY_START), q: button.dataset.easyQ }; newGuided({ id: 'easy-custom' }); }
    if (button.dataset.easyE) { state.guided.custom = { ...(state.guided.custom || FRIENDLY_START), e: button.dataset.easyE }; newGuided({ id: 'easy-custom' }); }
    if (button.dataset.easyM !== undefined) { state.guided.custom = { ...(state.guided.custom || FRIENDLY_START), m: button.dataset.easyM }; newGuided({ id: 'easy-custom' }); }
    if (button.id === 'use-easy-numbers') { state.difficulty = 'easy'; newGuided({ id: 'easy-custom' }); }
    if (button.id === 'lesson-prev') { state.lesson--; renderLesson(); save(); }
    if (button.id === 'lesson-reviewed') { if (!state.reviewed.includes(state.lesson)) state.reviewed.push(state.lesson); state.lesson = Math.min(lessons.length - 1, state.lesson + 1); renderLesson(); save(); }
    if (button.id === 'encoding-show') {
      try {
        const r = encode($('encoding-message').value, $('encoding-mapping').value);
        $('encoding-result').innerHTML = `<div class="formula math">Codes: ${r.codes.join(' ')}${r.blockStrings ? `<br>Four-digit blocks: ${r.blockStrings.join(', ')}` : ''}</div>${r.padded ? '<p>A trailing space code 62 was added to make a complete pair. This is explicit padding for the reference desk.</p>' : ''}`;
      } catch (error) { status('encoding-result', error.message, false); }
    }
    if (button.id === 'generate-guided') newGuided(generate(state.difficulty));
    if (button.id === 'exam-slides' || button.id === 'exam-generate' || button.id === 'exam-retry') {
      const generated = button.id === 'exam-generate' ? Array.from({ length: 4 }, (_, i) => generate(state.difficulty, `generated-${i}`)) : button.id === 'exam-retry' ? state.exam.generated : [];
      state.exam = { generated, answers: {}, submitted: false }; renderExam(); save();
    }
    if (button.id === 'exam-print-key') printMaterial(examItems(), true, true);
    if (button.id === 'print-worksheet') {
      if (state.view === 'assignment') root.Chapter5Assignment.print(false);
      else printMaterial(state.view === 'guided' ? [currentExercise()] : examItems(), false, state.view !== 'guided');
    }
    if (button.id === 'reset-progress') {
      if (resetPending) {
        state = fresh(); resetPending = false; renderAll(); save();
        button.textContent = 'Reset progress'; $('reset-cancel').hidden = true;
      } else {
        resetPending = true; button.textContent = 'Confirm reset'; $('reset-cancel').hidden = false;
      }
    }
    if (button.id === 'reset-cancel') { resetPending = false; $('reset-progress').textContent = 'Reset progress'; button.hidden = true; }
  });
  document.addEventListener('input', event => {
    const el = event.target;
    if (el.dataset.easyMInput) {
      const pos = el.selectionStart;
      state.guided.custom = { ...(state.guided.custom || FRIENDLY_START), m: el.value };
      state.guided.draft = {}; state.guided.keyOK = false; state.guided.mapOK = false; state.guided.encOK = false; state.guided.decOK = false; state.guided.reveal = false;
      renderGuided(); save();
      const restored = $('easy-m-input');
      if (restored) { restored.focus(); if (pos !== null) restored.setSelectionRange(pos, pos); }
      return;
    }
    if (el.dataset.field) {
      state.guided.draft[el.dataset.field] = el.value;
      if (['n','z','e','d'].includes(el.dataset.field) && !el.readOnly) {
        state.guided.keyOK = false; state.guided.mapOK = false; state.guided.encOK = false; state.guided.decOK = false;
        for (const id of ['map-section', 'encryption-section', 'decryption-section']) if ($(id)) $(id).hidden = true;
        if ($('key-status')) $('key-status').textContent = 'Key changed. Check the keys again to continue.';
      }
      if (el.dataset.field === 'mapping') { state.guided.mapOK = false; state.guided.encOK = false; if ($('encryption-section')) $('encryption-section').hidden = true; if ($('decryption-section')) $('decryption-section').hidden = true; }
      if (el.dataset.field.startsWith('enc_')) { state.guided.encOK = false; state.guided.decOK = false; if ($('decryption-section')) $('decryption-section').hidden = true; if ($('enc-status')) $('enc-status').textContent = 'Answer changed. Check encryption again.'; }
      if (el.dataset.field.startsWith('dec_') || el.dataset.field === 'recovered_word') { state.guided.decOK = false; if ($('dec-status')) $('dec-status').textContent = 'Answer changed. Check decryption again.'; }
      el.classList.remove('good','bad'); el.removeAttribute('aria-invalid');
    }
    if (el.dataset.examField && !state.exam.submitted) state.exam.answers[el.dataset.examField] = el.value;
    if (el.dataset.field || el.dataset.examField) save();
  });
  $('exercise-select').addEventListener('change', event => {
    const val = event.target.value;
    if (val === 'generated') newGuided(state.guided.generated);
    else if (val === 'easy-custom') newGuided({ id: 'easy-custom' });
    else newGuided(exercises.find(ex => ex.id === val));
  });
  $('difficulty').addEventListener('change', event => { state.difficulty = event.target.value; save(); });
  $('encoding-mapping').addEventListener('change', () => { $('encoding-message').value = $('encoding-mapping').value === 'blocks' ? 'How are you?' : 'love'; $('encoding-result').innerHTML = ''; });
  $('exam-form').addEventListener('submit', event => { event.preventDefault(); state.exam.submitted = true; const grade = gradeExam(); state.lastScore = `${grade.correct} / ${grade.total}`; renderExam(); save(); $('exam-review').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  function renderAll() { renderLesson(); renderConcepts(); renderGuided(); renderExam(); switchView(state.view); updateStats(); }
  renderAll();
  if (!storageAvailable) $('storage-notice').hidden = false;
})(typeof globalThis !== 'undefined' ? globalThis : this);
