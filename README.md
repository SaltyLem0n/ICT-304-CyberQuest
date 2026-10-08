# CyberQuest: Cybersecurity Study Hub & Cryptography Lab
> Interactive cybersecurity study portal and cryptography practice for ICT 304: Chapter 3 (Cryptographic Concepts) and Chapter 5 (Public Key Cryptography).

## 🚀 Live Demo
Visit the deployed application on GitHub Pages:
**[https://saltylem0n.github.io/ICT-304-CyberQuest/](https://saltylem0n.github.io/ICT-304-CyberQuest/)**

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
