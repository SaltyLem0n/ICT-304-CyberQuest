# CyberQuest: Cybersecurity Study Hub & Cryptography Lab
> Interactive cybersecurity study portal and cryptography practice for ICT 304: Chapter 3 (Cryptographic Concepts), Chapter 4 (Secret Key Cryptography & DES), and Chapter 5 (Public Key Cryptography).

## 🚀 Live Demo
Visit the deployed application on GitHub Pages:
**[https://saltylem0n.github.io/ICT-304-CyberQuest/](https://saltylem0n.github.io/ICT-304-CyberQuest/)**

---

## CLI-only exam practice

Open the [CLI exam trainer](https://saltylem0n.github.io/ICT-304-CyberQuest/cli-trainer.html) from the dashboard or the Chapters 6–10 labs section. It includes six configuration patterns, command recall, authored variants, troubleshooting, worksheets, and a mistake log. Practise the actual networks in Packet Tracer alongside the website.

The activity index distinguishes source coverage: Exercises 1 and 11 have reviewed instructions, 2 and 10 are partially reviewed, and 3–9 await internal instruction review. Authored templates are labelled separately. The one-page A4 reference includes Chapters 5–10, RSA, the memory routine and CLI command patterns.

Run `node tests/cli-trainer.test.js` for trainer regression checks. See [the memory guide](wiki/cli-exam-memory-guide.md) and [the implementation review](wiki/cli-trainer-review.md) for scope and validation details.

## Chapter 3: guided practice paper

Open [Chapter 3 guided practice](https://saltylem0n.github.io/ICT-304-CyberQuest/chapter3-practice.html) from the Chapter 3 card.

- All 15 questions from `ICT304 Chapter 3 Practice Questions.pdf`, with original diagrams, accessible symbol transcriptions, method explanations, optional hints, and worked answers.
- Fourteen checked questions covering ASCII, classical substitution, Pigpen, Vigenère, rail fence, route and block permutation, and single/double columnar transposition. The printed Playfair ciphertext produces garbled text with its supplied grid; that item preserves the literal working as ungraded self-check.
- Blank worksheets and a separate worked-answer print view. Documented padding variants are accepted explicitly; meaningful letters, digits, and separators are retained.
- Typed attempts remain while switching questions in the open page. The original concept quiz, cipher lab, and Chapter 5 remain available.

The new page uses `chapter3-practice.html`, `chapter3-practice.js`, `chapter3-practice-data.js`, and local figures in `assets/chapter3-practice/`. Run `node tests/chapter3-practice.test.js` for independent answer/round-trip and answer-checking coverage.

---

## Chapter 4: secret-key lessons and guided practice

Open [Chapter 4](https://saltylem0n.github.io/ICT-304-CyberQuest/chapter4.html) from its dashboard card.

- Eleven lessons grounded in both Chapter 4 slide decks: rotor machines, ASCII/XOR, bit transposition, key distribution, stream ciphers/IVs, block modes/padding, brute force, DES rounds/key generation, and the chapter's algorithm/future-risk comparison.
- All seven original practice questions, preserving Part 1/Part 2 numbering. Optional hints and worked solutions, binary answer checks, exact password counts, and two-decimal exhaustive times using 365 days/year.
- DES working preserves `Computer` and `ABCD1234` case, shows ASCII, IP, key rotations, expansion, all eight S-box lookups, P, XOR, and the round-two key preparation. Binary leading zeroes are retained; solutions also show hex.
- The 56-bit carried key state and 48-bit subkeys are labeled separately. Source clarifications identify PC-1 indexing, the PC-2 position-label typo, and the corrected final-permutation entry against NIST FIPS 46-3. Original PDFs are unchanged.
- Blank worksheets and worked-answer printing share the screen calculations and include DES reference tables. Attempts remain only in the open page.

The zero-build page uses `chapter4.html`, `chapter4.css`, `chapter4.js`, `chapter4-content.js`, and `chapter4-math.js`. `Chapter4Math` and `Chapter4Content` work in browsers and CommonJS. Run `node tests/chapter4.test.js` for source-derived fixtures, DES stage checks, exact arithmetic, padding, and grading coverage.

---

## Chapter 5: paper-first RSA practice

Open [Chapter 5](https://saltylem0n.github.io/ICT-304-CyberQuest/chapter5.html) or use its dashboard card.

- Ten English lessons covering the course's public-key topics and prerequisite paper arithmetic, with slide references and clarification of simplified security claims.
- Guided checks for key generation, encoding, repeated squaring, encryption, and decryption. Solutions and hints appear only on request.
- Exam papers using slide Q1–Q4 or generated small-number exercises, graded on submission. Q2 uses the key pair chosen in Q1.
- Printable blank worksheets and separate worked answer keys, including every modular reduction.
- Worked solutions follow Calculate → Divide → Multiply → Subtract → Answer. Powers with up to 12 digits are shown in full; larger powers use the same steps for each smaller square and multiplication.
- Browser-local progress, reset controls, and exact `BigInt` arithmetic. A=1–Z=26 and slide 14's four-digit encoding remain separate.
- Assignment 3 helper: enter a full name, select or edit the complete A–Z mapping, and choose distinct primes greater than 13. Follow the modular-inverse derivation and every encryption/decryption reduction, check the recovered name, and print worked steps or a blank worksheet. Name inputs stay in the open page and are not stored with progress.

Chapter 5 uses `chapter5.html`, `chapter5.js`, and `chapter5-assignment.js` without external dependencies. The dashboard retains Chapter 3's existing engines. Run the regression checks with `node tests/chapter5-math.test.js`, `node tests/chapter5-assignment.test.js`, and `node tests/chapter5-working.test.js`.

---

## 🛠️ Features

### 1. NotebookLM-Style Conceptual Quiz
- Practice questions mapped directly to course slides.
- Dynamic hint toggles and detailed rationale explanations.
- Session score tracking and topic-based categorization.

### 2. Interactive Cryptography Lab & Solvers
- **Caesar & ROT13 Lab**: Live shift slider and 25-key automated brute-force inspector with English heuristic detection (`MYWOROBO` $\rightarrow$ `COMEHERE`).
- **Atbash Cipher**: Symmetric Hebrew alphabet mirror with real-time transformation.
- **Vigenère Square**: Interactive Tabula Recta ($26 \times 26$) with row/col coordinate highlight and step-by-step trace calculation.
- **Playfair $5 \times 5$ Simulator**: Live key matrix generation, digraph pair tokenizer with duplicate insertion, and geometric rule cards (Same Row, Same Column, Rectangle). Includes Slide 33 National Treasure challenge.
- **Vernam One-Time Pad**: Modular arithmetic subtraction ($P_i \equiv C_i - K_i \pmod{26}$) with step-by-step decimal calculation table.
- **Digital Scratchpad**: Double-buffered HTML5 canvas with pen, highlighter, eraser, pre-loaded templates (Cyber Dot Grid, Playfair Box, Pigpen Enclosures), 25-step undo history, and PNG export.
- **Reference Tables**: Fast interactive lookups for Tabula Recta, 1-25 Caesar shifts, 7-Bit ASCII code table with `smart-search.js` filtering, and Pigpen cards.

---

## 🏗️ Architecture
- **Zero-Build Single-Page Application**: Runs straight out of the box without bundlers, Node.js runtime, or build steps.
- **ES6 Object-Oriented Architecture**: Cleanly separated domain classes (`CaesarCipher`, `AtbashCipher`, `VigenereCipher`, `PlayfairCipher`, `VernamCipher`) and controllers (`ScratchpadEngine`, `QuizEngine`, `LabEngine`, `CyberQuestApp`).
- **Styling**: Tailwind CSS v3 via CDN with cyber dark-mode theme.
- **Bilingual Interface**: Quick toggle between English and Thai.

---

## 💻 Local Usage
Simply open `index.html` in any modern web browser:
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```
