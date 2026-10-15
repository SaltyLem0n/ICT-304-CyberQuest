/* Fixed source questions and exact worked traces. No browser dependencies. */
(function (root) {
  'use strict';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const source = 'ICT304%20Chapter%203%20Practice%20Questions.pdf';
  const mod = value => (value % 26 + 26) % 26;
  const rotate = (text, shift) => String(text).replace(/[A-Za-z]/g, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(base + mod(c.charCodeAt(0) - base + shift));
  });
  const asciiRows = text => Array.from(text, c => ({ character: c === ' ' ? '(space)' : c, decimal: c.charCodeAt(0), binary: c.charCodeAt(0).toString(2).padStart(8, '0'), hex: c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0') }));
  function railTrace(ciphertext, rails) {
    const path = []; let row = 0, direction = 1;
    for (let i = 0; i < ciphertext.length; i++) {
      path.push(row);
      if (row === 0) direction = 1;
      if (row === rails - 1) direction = -1;
      row += direction;
    }
    let offset = 0;
    const strips = Array.from({ length: rails }, (_, r) => {
      const length = path.filter(p => p === r).length, strip = ciphertext.slice(offset, offset + length);
      offset += length; return strip;
    });
    const positions = Array(rails).fill(0);
    const grid = Array.from({ length: rails }, () => Array(ciphertext.length).fill(''));
    const plaintext = path.map((r, i) => (grid[r][i] = strips[r][positions[r]++])).join('');
    return { strips, grid, plaintext };
  }
  function columnarTrace(ciphertext, key) {
    const width = key.length, height = ciphertext.length / width;
    if (!Number.isInteger(height)) throw new Error('The source columnar grid must be rectangular.');
    const order = Array.from(key, (letter, index) => ({ letter, index })).sort((a, b) => a.letter.localeCompare(b.letter) || a.index - b.index);
    const ranks = Array(width), grid = Array.from({ length: height }, () => Array(width));
    order.forEach(({ index }, rank) => {
      ranks[index] = rank + 1;
      for (let row = 0; row < height; row++) grid[row][index] = ciphertext[rank * height + row];
    });
    return { key, ranks, grid, order: order.map(o => o.letter).join(''), plaintext: grid.flat().join('') };
  }
  const playfairGrid = ['TMPQS', 'ZVWXY', 'EOCUR', 'FNABD', 'LGHIK'].map(row => row.split(''));
  function playfairTrace(ciphertext) {
    const positions = Object.fromEntries(playfairGrid.flatMap((row, r) => row.map((c, col) => [c, [r, col]])));
    const rows = [];
    for (let i = 0; i < ciphertext.length; i += 2) {
      const pair = ciphertext.slice(i, i + 2), [r, c] = positions[pair[0]], [s, d] = positions[pair[1]];
      let output, rule;
      if (r === s) { output = playfairGrid[r][(c + 4) % 5] + playfairGrid[s][(d + 4) % 5]; rule = 'Same row: move left'; }
      else if (c === d) { output = playfairGrid[(r + 4) % 5][c] + playfairGrid[(s + 4) % 5][d]; rule = 'Same column: move up'; }
      else { output = playfairGrid[r][d] + playfairGrid[s][c]; rule = 'Rectangle: keep rows, exchange columns'; }
      rows.push({ pair, positions: `${r + 1},${c + 1} / ${s + 1},${d + 1}`, rule, output });
    }
    return { rows, plaintext: rows.map(row => row.output).join('') };
  }
  // Shape names describe the visible ink, independent of a letter assignment.
  const shapeNames = ['bottom-right', 'open-top', 'bottom-left', 'open-left', 'square', 'open-right', 'top-right', 'open-bottom', 'top-left'];
  const pigpen = [...shapeNames, ...shapeNames.map(s => `${s}-dot`), 'down', 'right', 'left', 'up', 'down-dot', 'right-dot', 'left-dot', 'up-dot'];
  const q6Lines = ['IFYOUTELLTHETRUTH', 'YOUDONTHAVETO', 'REMEMBERANYTHING'].map(line => Array.from(line, c => pigpen[alphabet.indexOf(c)]));
  const q7Lines = ['ROHXDLJWMANJVRC', 'HXDLJWMXRC'].map(line => Array.from(line, c => pigpen[alphabet.indexOf(c)]));
  // Direct transcription of line 3: dotted open-top, open-bottom, open-right,
  // dotted bottom-right, left, bottom-left, dotted open-left, dotted top-left,
  // open-top, dotted down, dotted square, open-bottom.
  q7Lines[2] = ['open-top-dot', 'open-bottom', 'open-right', 'bottom-right-dot', 'left', 'bottom-left', 'open-left-dot', 'top-left-dot', 'open-top', 'down-dot', 'square-dot', 'open-bottom'];
  const pigpenDecode = (lines, shift = 0) => lines.map(line => line.map(shape => alphabet[mod(pigpen.indexOf(shape) + shift)]).join(''));
  const q2Cipher = 'Kl Euxfh,\n\nKrsh brx duh grlqj ilqh. Krz derxw phhwlqj dw wkh wudlq vwdwlrq wklv iulgdb dw 5 sp? Sohdvh ohw ph nqrz li lw lv rn zlwk brx.\n\nUhjdugv.\n\nIra';
  const q5Cipher = 'PLOFOTVSRQQFRTMEQWTCFBPAIZHERMMTNRCPFPOZOEKQFOUWUOQYPDDR';
  const q8Cipher = 'OLMVMKCPTWPDGMYLEKLRRKZKWSYHJLXNAT', q8Key = 'CHICAGO';
  const q8Rows = Array.from(q8Cipher, (c, i) => {
    const k = q8Key[i % q8Key.length], difference = alphabet.indexOf(c) - alphabet.indexOf(k);
    return { position: i + 1, cipher: c, key: k, calculation: `${alphabet.indexOf(c)} − ${alphabet.indexOf(k)} = ${difference}; mod 26 = ${mod(difference)}`, plaintext: alphabet[mod(difference)] };
  });
  const q9Cipher = 'WASENSIBTENORERADIEHTBIGADEWEYUHATNMN';
  const q10Cipher = 'AARBDETBNLWRAESAEODCPINYUTULFISNEOSZ';
  const q11Cipher = 'XTTINEWTANWKAYEHMLCADALET';
  const q11Grid = Array.from({ length: 5 }, () => Array(5));
  let routeIndex = 0;
  for (let col = 4; col >= 0; col--) {
    const rows = (4 - col) % 2 === 0 ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
    for (const row of rows) q11Grid[row][col] = q11Cipher[routeIndex++];
  }
  const q12Cipher = 'LIEVBEOUCAEYNDYONAREHAUAWAYTLFRE_BHEHEODYTEROOORVELTSE';
  const q12Rows = q12Cipher.match(/.{6}/g).map((block, i) => ({ block: i + 1, ciphertext: block, plaintext: block.slice(4) + block.slice(0, 4) }));
  const q13Cipher = 'MRGOEMXMTRXEIXSEAIXXTTNTAEFDABEXHUX';
  const q14Cipher = 'DANUTOBCASDSHETSFIIOTCNACCUSELALNOKIOATYLE';
  const q14Second = columnarTrace(q14Cipher, 'PICTURE');
  const q14First = columnarTrace(q14Second.plaintext, 'WONDER');
  const q15Known = '57 66 73 6C 78 6E 79 25 5A 73 6E 7B 6A 77 78 6E 79 7E';
  const q15Cipher = '46 25 55 6A 77 78 74 73 25 5C 6D 74 25 53 6A 7B 6A 77 25 52 66 69 6A 25 46 25 52 6E 78 79 66 70 6A 25 53 6A 7B 6A 77 25 59 77 6E 6A 69 25 46 73 7E 79 6D 6E 73 6C 25 53 6A 7C';
  const q15Rows = q15Cipher.split(' ').map((hex, i) => {
    const code = parseInt(hex, 16) - 5;
    return { position: i + 1, hex, calculation: `${parseInt(hex, 16)} − 5 = ${code}`, character: code === 32 ? '(space)' : String.fromCharCode(code) };
  });
  const plaintextField = (answer, accepted = []) => [{ id: 'plaintext', label: 'Decrypted message', kind: 'plaintext', answer, accepted }];
  const questions = [
    {
      id: 1, title: 'ASCII: binary and hexadecimal', topic: 'Character encoding', page: 1,
      prompt: 'Using the ASCII code table from the lesson slides, encode the phrase INFORMATION SECURITY using 1 byte (8 bits) per character (including spaces), and then write the answer in hexadecimal format.',
      ciphertext: 'INFORMATION SECURITY',
      method: 'Look up each character’s ASCII value. Write it as an 8-bit byte and as two hexadecimal digits. A space is a character too.',
      hint: 'I is decimal 73: 01001001 in binary and 49 in hexadecimal. The space is decimal 32, binary 00100000, hex 20. There are 20 characters in this phrase.',
      fields: [
        { id: 'binary', label: '8-bit binary bytes', kind: 'binary', answer: asciiRows('INFORMATION SECURITY').map(r => r.binary).join(' ') },
        { id: 'hex', label: 'Hexadecimal bytes', kind: 'hex', answer: '49 4E 46 4F 52 4D 41 54 49 4F 4E 20 53 45 43 55 52 49 54 59' }
      ],
      steps: ['Keep the space between the two words: the message contains 20 bytes (160 bits).', 'Convert each ASCII value to 8 binary digits. Convert each group of 4 bits to one hex digit.'],
      trace: { type: 'ascii', rows: asciiRows('INFORMATION SECURITY') }
    },
    {
      id: 2, title: 'Caesar: discover the shift', topic: 'Caesar cipher', page: 1,
      prompt: 'A spy managed to intercept a message sent over a computer network and discovered that it had been encrypted using the Caesar Cipher. The content of the message is as follows:',
      ciphertext: q2Cipher, figure: 'q2-message.png', figureAlt: 'Original intercepted letter from question 2; the complete accessible ciphertext is transcribed above.',
      method: 'Try backward shifts until the message forms readable English. Apply the same shift to every letter; punctuation, spaces, and digits stay in place.',
      hint: 'Start with “Kl Euxfh”. Test a few small backward shifts and look for a greeting and a name.',
      fields: plaintextField('Hi Bruce,\n\nHope you are doing fine. How about meeting at the train station this friday at 5 pm? Please let me know if it is ok with you.\n\nRegards.\n\nFox'),
      steps: [`Backward shift 1 gives “${rotate('Kl Euxfh', -1)}” (not a readable greeting); backward shift 2 gives “${rotate('Kl Euxfh', -2)}”; backward shift 3 gives “Hi Bruce”.`, 'Use P = (C − 3 + 26) mod 26 with A=0. K (10) becomes H (7), l (11) becomes i (8), and E (4) becomes B (1).', 'Continue with shift 3 through the letter. Keep 5 pm, punctuation, and line breaks.'],
      trace: { type: 'substitution', shift: 3, rows: Array.from('KLEUXFH', c => [c, String(alphabet.indexOf(c)), `${alphabet.indexOf(c)} − 3 mod 26`, rotate(c, -3)]) }
    },
    {
      id: 3, title: 'Substitution: shift key 4', topic: 'Caesar cipher', page: 1,
      prompt: 'Decrypt the ciphertext WIGYVMXCRIZIVGSQIWJSVJVII using a substitution cipher with a shift key value of 4.', ciphertext: 'WIGYVMXCRIZIVGSQIWJSVJVII',
      method: 'Number A=0 through Z=25. Subtract 4 from each ciphertext value and wrap negative values by adding 26.',
      hint: 'W is 22. 22 − 4 = 18, which is S. Apply this to every letter.', fields: plaintextField('SECURITY NEVER COMES FOR FREE'),
      steps: ['Use P = (C − 4 + 26) mod 26.', 'For example W→S, I→E, G→C, Y→U. Add word spaces after recovering the letters.'],
      trace: { type: 'substitution', shift: 4, rows: Array.from('WIGYVMXCRIZIVGSQIWJSVJVII', c => [c, String(alphabet.indexOf(c)), `${alphabet.indexOf(c)} − 4 mod 26`, rotate(c, -4)]) }
    },
    {
      id: 4, title: 'Atbash: mirror the alphabet', topic: 'Atbash cipher', page: 1,
      prompt: 'Decrypt the ciphertext RUBLFXZMWIVZNRGBLFXZMZXSRVEVRG, which uses the Atbash cipher.', ciphertext: 'RUBLFXZMWIVZNRGBLFXZMZXSRVEVRG',
      method: 'Pair A with Z, B with Y, and so on. Atbash uses the same mapping in both directions.',
      hint: 'With A=0, use P=25−C. R (17) maps to I (8). U maps to F.', fields: plaintextField('IF YOU CAN DREAM IT YOU CAN ACHIEVE IT'),
      steps: ['Write the normal alphabet above the reversed alphabet.', 'Replace each ciphertext letter by its partner. R→I, U→F, B→Y, L→O.'],
      trace: { type: 'atbash', rows: Array.from('RUBLFXZMWIVZNRGBLFXZMZXSRVEVRG', c => [c, `25 − ${alphabet.indexOf(c)} = ${25 - alphabet.indexOf(c)}`, alphabet[25 - alphabet.indexOf(c)]]) }
    },
    {
      id: 5, title: 'Playfair: use the supplied grid', topic: 'Playfair cipher', page: 1, selfCheck: true,
      prompt: 'Decrypt the ciphertext PLOFOTVSRQQFRTMEQWTCFBPAIZHERMMTNRCPFPOZOEKQFOUWUOQYPDDR, which uses the Fairplay Cipher method, based on the provided key table:', ciphertext: q5Cipher, keyGrid: playfairGrid,
      method: 'The PDF calls this “Fairplay”; the supplied table is a Playfair grid. Split the ciphertext into pairs. Move left in a shared row, up in a shared column, or exchange columns at rectangle corners.',
      sourceIssue: 'Source issue · self-check. The printed ciphertext and grid produce some garbled words. Compare the literal working below; this question does not receive an automatic correct/incorrect grade.',
      hint: 'Use the exact grid printed here. PL is a rectangle: P is at row 1, column 3 and L at row 5, column 1. Exchanging columns gives TH.',
      fields: plaintextField('THENEMYMUSTBESTOPXPEDAHCLXLCOSTSDOWHATEVERISNECXCESXSARY'),
      steps: ['Preserve the supplied grid exactly; do not replace it with an alphabetically filled keyword grid.', 'Decrypt all 28 digraphs with the Playfair rules. Row and column positions below start at 1.', 'The literal result still contains garbled groups, including AHCLXLCOSTS, even after considering padding. No source letters have been corrected and no definitive intended sentence is supplied.'],
      trace: { type: 'playfair', ...playfairTrace(q5Cipher) }
    },
    {
      id: 6, title: 'Pigpen: read the geometric symbols', topic: 'Pigpen cipher', page: 2,
      prompt: 'Decode the meaning of the symbol.', figure: 'q6-symbols.png', figureAlt: 'Three original lines of standard Pigpen symbols. A shape-by-shape accessible transcription follows.', symbols: q6Lines, reference: 'pigpen',
      method: 'A Pigpen symbol is the outline of a letter’s cell in a grid or X. Its orientation and the presence of a dot both matter.',
      hint: 'Use the standard Pigpen key below. The first two outlines are a top-left corner and a box open on the right. Keep dotted symbols separate from undotted ones.',
      fields: plaintextField('IF YOU TELL THE TRUTH YOU DONT HAVE TO REMEMBER ANYTHING'),
      steps: ['Match each outline to the standard key. A dot selects the second grid or second X.', 'Decode each of the three lines in order, then restore word spacing.'],
      trace: { type: 'pigpen', lines: q6Lines, decoded: pigpenDecode(q6Lines) }
    },
    {
      id: 7, title: 'Modified Pigpen: infer the mapping', topic: 'Symbol substitution', page: 2,
      prompt: 'Assume there is a three-line puzzle message in the document, represented by the following symbols. The students learned that the symbols were encoded using a method other than the standard Pigpen cipher, and they also discovered the meanings of certain additional symbols. Analyze what message the given cryptic text decodes to.',
      figure: 'q7-symbols.png', figureAlt: 'The original three-line modified Pigpen message, with an accessible shape transcription below.', symbols: q7Lines, reference: 'pigpen',
      clues: [['square', 'V'], ['open-top-dot', 'B'], ['top-left', 'Z'], ['top-right-dot', 'G'], ['right', 'K'], ['up-dot', 'Q']],
      method: 'Compare the six supplied letter clues with the standard Pigpen key. Look for one consistent change in the letter assignments, then test it across the message.',
      hint: 'The ordinary key assigns the square to E, but this question says V. Compare A=0 numerical positions, wrapping around 26. Test the same change on the other five clues.',
      fields: plaintextField('IF YOU CAN DREAM IT YOU CAN DO IT BY WALT DISNEY'),
      answerNote: 'Include all three lines, including the attribution.',
      steps: ['The standard Pigpen letters for the six clues are E, K, I, P, T, Z. The provided letters are V, B, Z, G, K, Q.', 'Each clue fits P = (standard Pigpen index − 9 + 26) mod 26 with A=0. For example E: 4−9+26=21→V; K: 10−9=1→B.', 'First decode the outline with the ordinary key, then move that letter backward by 9. This mapping fits all six clues and produces a coherent three-line message.'],
      trace: { type: 'pigpen', lines: q7Lines, decoded: pigpenDecode(q7Lines, -9), shifted: true }
    },
    {
      id: 8, title: 'Vigenère: keyword CHICAGO', topic: 'Vigenère cipher', page: 2,
      prompt: 'Decrypt the ciphertext OLMVMKCPTWPDGMYLEKLRRKZKWSYHJLXNAT, which was encrypted using the Vigenère cipher with the keyword “CHICAGO”.', ciphertext: q8Cipher, key: q8Key,
      method: 'Repeat the keyword beneath the ciphertext. With A=0, subtract the key letter’s value from each ciphertext value modulo 26.',
      hint: 'The repeated key begins CHICAGOCHICAGO. O (14) minus C (2) gives M (12).', fields: plaintextField('MEET ME ON MONDAY WE WILL DISCUSS THE PLAN'),
      steps: ['Repeat CHICAGO until it covers all 34 ciphertext letters.', 'Use Pᵢ = (Cᵢ − Kᵢ + 26) mod 26. Negative differences wrap by adding 26.', 'Read the resulting letters and add word spacing.'], trace: { type: 'vigenere', rows: q8Rows }
    },
    {
      id: 9, title: 'Rail fence: 2 rows', topic: 'Transposition', page: 3,
      prompt: 'The following ciphertext was obtained using the 2-row Rail Fence Transposition method: WASENSIBTENORERADIEHTBIGADEWEYUHATNMN. Determine the original plaintext.', ciphertext: q9Cipher,
      method: 'Draw the zigzag rail positions first. Count how many letters belong on each rail, split the ciphertext into those strips, then read along the zigzag.',
      hint: 'There are 37 letters. Two rails alternate: the first has 19 positions and the second has 18.', fields: plaintextField('WHATS BEING SAID BETWEEN YOUR HEART AND MINE'),
      steps: ['Draw a 37-position two-row zigzag. Count 19 slots in rail 1 and 18 in rail 2.', 'Put the first 19 ciphertext letters on rail 1 and the remaining 18 on rail 2.', 'Read alternately from the top and bottom rail to recover the message.'], trace: { type: 'rail', ...railTrace(q9Cipher, 2) }
    },
    {
      id: 10, title: 'Rail fence: 3 rows', topic: 'Transposition', page: 3,
      prompt: 'The following ciphertext was obtained using the 3-row Rail Fence Transposition method: AARBDETBNLWRAESAEODCPINYUTULFISNEOSZ. Determine the original plaintext.', ciphertext: q10Cipher,
      method: 'With three rails the path repeats 1→2→3→2. Count the actual slots on each rail before placing the ciphertext.',
      hint: 'There are 36 letters. The rail counts are 9, 18, and 9, not three equal chunks.', fields: plaintextField('ALL WARFARE IS BASED ON DECEPTION BY SUN TZU'),
      steps: ['Draw the 1→2→3→2 zigzag across 36 positions.', 'Split the ciphertext into rails of 9, 18, and 9 letters.', 'Fill each rail left to right, then read the zigzag path.'], trace: { type: 'rail', ...railTrace(q10Cipher, 3) }
    },
    {
      id: 11, title: 'Route cipher: start at bottom right', topic: 'Transposition', page: 3,
      prompt: 'Decrypt the ciphertext XTTINEWTANWKAYEHMLCADALET, which was encrypted using the Route cipher. The route is reading down-up and up-down from the bottom right with 5 x 5 grid.', ciphertext: q11Cipher,
      method: 'Undo the stated route by placing ciphertext letters into a 5×5 grid, starting at the bottom-right cell and moving up the rightmost column. Alternate the direction for each next column to the left.',
      hint: 'Place X, T, T, I, N upward in the rightmost column. Put E, W, T, A, N downward in the next column.', fields: plaintextField('THE ENEMY WILL ATTACK AT DAWN', ['THEENEMYWILLATTACKATDAWNX']),
      answerNote: 'The final X is documented grid padding; either the raw result or the message without that X is accepted.',
      steps: ['The ciphertext has 25 letters, filling every cell of a 5×5 grid.', 'Fill column 5 bottom-to-top, column 4 top-to-bottom, and continue alternating to column 1.', 'Read the completed grid across each row, from top left. The final X completes the grid and is padding.'], trace: { type: 'route', grid: q11Grid, raw: q11Grid.flat().join('') }
    },
    {
      id: 12, title: 'Permutation: reverse a block rotation', topic: 'Block permutation', page: 3,
      prompt: 'In a permutation cipher applied to a 54-character message, the text is divided into blocks of 6 characters, and the characters within each block are shifted 4 positions to the right. Given the received ciphertext LIEVBEOUCAEYNDYONAREHAUAWAYTLFRE_BHEHEODYTEROOORVELTSE, determine the original plaintext.', ciphertext: q12Cipher,
      method: 'Keep the 6-character block boundaries. Undo a right rotation of 4 by rotating each received block left by 4 (equivalently, right by 2).',
      hint: 'The first received block is LIEVBE. Move its last two letters to the front: BE + LIEV.',
      fields: plaintextField('BELIEVEYOUCANANDYOUAREHALFWAYTHERE_BYTHEODOREROOSEVELT', ['BELIEVE YOU CAN AND YOU ARE HALFWAY THERE BY THEODORE ROOSEVELT']),
      answerNote: 'The source underscore is a separator before BY. Both that literal separator and an ordinary word space there are accepted.',
      steps: ['54 characters ÷ 6 characters per block = 9 blocks. Preserve the underscore as part of its block.', 'Original positions 1 2 3 4 5 6 become ciphertext positions 3 4 5 6 1 2 after the right rotation of 4.', 'Recover each original block in ciphertext order 5 6 1 2 3 4. Concatenate all nine recovered blocks.'], trace: { type: 'blocks', rows: q12Rows }
    },
    {
      id: 13, title: 'Columnar transposition: JOURNEY', topic: 'Columnar transposition', page: 3,
      prompt: 'Given the ciphertext MRGOEMXMTRXEIXSEAIXXTTNTAEFDABEXHUX which was encrypted using the Columnar Transposition Cipher with the keyword JOURNEY. Determine the actual plaintext (note: not every character present in the ciphertext is part of the plaintext).', ciphertext: q13Cipher, key: 'JOURNEY',
      method: 'Rank the key letters alphabetically. Fill the ciphertext down the columns in that ranked order, then read the grid across rows in the original key order.',
      hint: '35 ciphertext letters ÷ 7 key letters = 5 rows. The alphabetically first key letter is E, so the first five ciphertext letters fill the E column.', fields: plaintextField('MEET ME AFTER MIDNIGHT AT OUR BASE', ['MEETXMEXAFTERXMIDNIGHTXATXOURXBASEX']),
      answerNote: 'The documented X separators and final X may be kept as the raw result or replaced/removed to write the readable message.',
      steps: ['Sort JOURNEY as E, J, N, O, R, U, Y. Under the original key, the ranks are 2, 4, 6, 5, 3, 1, 7.', 'Split the ciphertext into seven strips of five letters. Place each strip down its ranked column.', 'Read across the five rows. In this specific message, X marks separators and the last cell is padding. Do not remove X indiscriminately from other messages.'], trace: { type: 'columnar', ...columnarTrace(q13Cipher, 'JOURNEY') }
    },
    {
      id: 14, title: 'Double columnar: undo the keys in reverse', topic: 'Double transposition', page: 3,
      prompt: 'Given the ciphertext DANUTOBCASDSHETSFIIOTCNACCUSELALNOKIOATYLE which was encrypted using the Double Columnar Transposition Cipher with the keyword 1: WONDER and keyword 2: PICTURE. Determine the actual plaintext (note: not every character present in the ciphertext is part of the plaintext).', ciphertext: q14Cipher, key: 'WONDER → PICTURE',
      method: 'Encryption applied WONDER first and PICTURE second. Decryption must undo PICTURE first, then WONDER. Reconstruct each ranked-column grid separately.',
      hint: 'The 42-letter ciphertext gives 6 rows with the 7-letter key PICTURE. After undoing that stage, use 7 rows with the 6-letter key WONDER.', fields: plaintextField('ACTION IS THE FOUNDATIONAL KEY TO ALL SUCCESS', ['ACTIONISTHEFOUNDATIONALKEYTOALLSUCCESSABCD']),
      answerNote: 'The final ABCD fills the rectangular grid; the raw result and the message without this documented padding are both accepted.',
      steps: ['Undo key 2, PICTURE: alphabetic column order C, E, I, P, R, T, U. Fill seven columns with six letters each, then read rows.', 'Treat that intermediate result as ciphertext for key 1, WONDER. Its alphabetic order is D, E, N, O, R, W; fill six columns with seven letters each.', 'Read rows again. The meaningful sentence ends at SUCCESS; ABCD is the remaining padding.'], trace: { type: 'double-columnar', stages: [q14Second, q14First] }
    },
    {
      id: 15, title: 'Hexadecimal: infer the character offset', topic: 'ASCII and substitution', page: 4,
      prompt: 'Suppose the phrase Rangsit University has been encoded and intercepted as follows. Subsequently, the following data was intercepted. Decrypt the intercepted data to reveal the message. (Note: Use the provided sample table for character mapping).',
      known: { text: 'Rangsit University', hex: q15Known }, ciphertext: q15Cipher, reference: 'ascii',
      method: 'Compare the known text with its hexadecimal bytes to infer the transformation. Test letters and the space before applying it to the new bytes.',
      hint: 'ASCII R is hex 52, but its intercepted byte is 57: the byte increased by 5. The space changed from hex 20 to 25 too. This changes character codes, not just alphabet letters.',
      fields: plaintextField('A Person Who Never Made A Mistake Never Tried Anything New'),
      steps: ['R is ASCII 82 (hex 52), encoded as 87 (hex 57): +5. The space is ASCII 32 (hex 20), encoded as 37 (hex 25): also +5.', 'For each intercepted hex byte, convert to decimal and subtract 5. Convert the result back to its ASCII character.', 'For example 46 hex = 70; 70−5=65→A. 25 hex = 37; 37−5=32→space. 55 hex = 85; 85−5=80→P.'], trace: { type: 'hex-offset', rows: q15Rows }
    }
  ];
  const normalizePlaintext = value => String(value).toUpperCase().replace(/[\s.,!?;:'"‘’“”()\-]/g, '');
  function checkAnswer(question, fieldId, value) {
    const field = question.fields.find(f => f.id === fieldId);
    if (!field) throw new Error('Unknown answer field.');
    if (question.selfCheck) return { status: 'self-check', message: 'This source item is self-check. Compare your attempt with the literal worked decryption.' };
    const input = String(value).trim();
    if (!input) return { status: 'empty', message: 'Write your answer first, then check it.' };
    if (field.kind === 'binary') {
      const groups = input.split(/\s+/);
      if (groups.some(g => !/^[01]{8}$/.test(g))) return { status: 'format', message: 'Use 8 binary digits per byte, with spaces or new lines between bytes.' };
      return groups.join(' ') === field.answer ? { status: 'correct', message: 'Correct. Every 8-bit byte, including the space, matches.' } : { status: 'incorrect', message: 'Check each ASCII byte and include the space between the words.' };
    }
    if (field.kind === 'hex') {
      const bytes = input.replace(/\s+/g, '').toUpperCase();
      if (!/^(?:[0-9A-F]{2})+$/.test(bytes)) return { status: 'format', message: 'Use two hexadecimal digits per byte; spaces and new lines are allowed between bytes.' };
      return bytes === field.answer.replace(/\s+/g, '') ? { status: 'correct', message: 'Correct. Every hexadecimal byte matches.' } : { status: 'incorrect', message: 'Check the hexadecimal bytes and retain 20 for the space.' };
    }
    const accepted = [field.answer, ...(field.accepted || [])].map(normalizePlaintext);
    return accepted.includes(normalizePlaintext(input)) ? { status: 'correct', message: 'Correct. Your recovered message matches.' } : { status: 'incorrect', message: 'Check the key, direction, and character order. Open a hint when you need one.' };
  }
  const api = { questions, source, alphabet, pigpen, pigpenDecode, normalizePlaintext, checkAnswer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Chapter3PracticeData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
