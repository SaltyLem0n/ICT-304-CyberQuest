/**
 * chapters6-10-data.js
 * Verified exam study data for ICT 304 Chapters 6-10 and Practical Labs 1-5.
 * Structured using microlearning-design, concept-explainer, assessment-design,
 * socratic-tutor, and didactic-reduction principles while preserving all Phase 1
 * audit findings, source citations, and pending-lab flags.
 * Dual-export for Browser (window.Chapters6to10Data) and Node/CommonJS.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Chapters6to10Data = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SOURCE_STATUS = {
    VERIFIED: 'verified',
    CORRECTION: 'correction',
    PENDING: 'pending'
  };

  const CHAPTERS = [
    {
      id: 'ch6',
      number: '06',
      title: 'Digital Signatures & Hash Functions',
      titleTh: 'ลายเซ็นดิจิทัลและฟังก์ชันแฮช',
      sourcePdf: 'Chapter 6 - Digital Signatures, Hash Functions.pdf',
      pageCount: 44,
      summary: 'Checksums, cryptographic hash properties, MD5/SHA families, avalanche effect, collisions, RSA digital signatures, digital envelopes, and Windows certutil/Get-FileHash labs.',
      lessons: [
        {
          id: 'ch6-integrity',
          title: 'Data Integrity, Checksums & Hash Properties',
          ref: 'Ch 6, pp. 2–3, 18–19, 25–29',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Distinguish a simple checksum from a cryptographic hash function and identify which security properties hashing provides.',
          prerequisites: ['Binary/hexadecimal byte representation', 'Basic idea of data tampering in transit'],
          simpleExplanation: {
            summary: 'A hash function is like a blender that turns any document into a fixed-size digital fingerprint. Changing even one letter changes the fingerprint completely, and you cannot un-blend the smoothie back into the original ingredients.',
            analogy: 'Digital fingerprint / blender (Ch 6, p. 19).',
            limitation: 'Unlike a real fingerprint that uniquely belongs to one person forever, hashes map infinite inputs to finite bits—so theoretical collisions exist, and weak hashes (MD5, SHA-1) allow practical collisions.'
          },
          body: [
            'A 1\'s-complement byte checksum (e.g., Data = <code>01 02 03 0A</code>, sum <code>0x10</code>, Checksum = <code>EF</code> so <code>0x10 + 0xEF = 0xFF</code>) catches accidental bit errors, but an attacker can alter data and recompute the checksum.',
            'Cryptographic hash functions map any-length input to a fixed-length <strong>message digest</strong>. Core properties: deterministic, fixed length, one-way (preimage resistance), collision resistance, and the <strong>avalanche effect</strong> (flipping 1 bit, e.g., <code>"bat"</code> vs <code>"cat"</code>, changes ~50% of output bits).',
            'Exam applications: digital signatures, salted password verification, <strong>HMAC</strong> (keyed integrity + authentication), File Integrity Monitoring (FIM), and malware/forensic evidence verification.'
          ],
          auditNote: {
            ref: 'Ch 6, pp. 3, 18',
            text: 'Source clarifications: (1) Slide 3 prints "Data = 01 02 05 04 0A" but the binary sum below only adds 4 bytes (01, 02, 05, 0A), omitting 04. (2) Slide 18 calls hashing "one-way encryption"; technically hashing is NOT encryption (no key, no decryption).'
          },
          immediatePractice: {
            question: 'You download an ISO file and compute its SHA-256 hash. It matches the publisher\'s posted SHA-256, EXCEPT you notice the publisher\'s webpage was served over plain HTTP. What can an attacker still do?',
            hints: [
              'Think about whether SHA-256 alone authenticates who posted the hash.',
              'Over plain HTTP, a Man-in-the-Middle can modify both the ISO download link and the posted hash string.'
            ],
            options: [
              'Nothing—matching SHA-256 proves both integrity and publisher identity.',
              'Modify both the file and the posted SHA-256 on the HTTP page so they still match.',
              'Reverse the SHA-256 digest to recover the publisher\'s private key.'
            ],
            correctIndex: 1,
            optionFeedback: [
              'A hash checks integrity against a trusted digest; without HTTPS or a digital signature, the digest itself can be swapped.',
              'Correct! Without an authenticated channel (HTTPS/PGP signature), an attacker can replace both the file and the hash.',
              'SHA-256 is one-way and has no private key.'
            ]
          }
        },
        {
          id: 'ch6-algorithms',
          title: 'MD Family vs SHA-1 / SHA-2 / SHA-3',
          ref: 'Ch 6, pp. 20–22, 27–28',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Select an appropriate cryptographic hash algorithm by comparing digest size, collision status, and design family.',
          prerequisites: ['Message digest concept', 'Definition of a hash collision'],
          simpleExplanation: {
            summary: 'Older hash algorithms (MD5, SHA-1) are like locks whose master-key flaw has been discovered—attackers can craft two different files with the exact same hash. Use SHA-256 or SHA-3 instead.',
            analogy: 'Two different keys opening the same lock (collision).',
            limitation: 'A collision attack does not mean you can reverse a hash back to the original file; it means an attacker can create two different files (one benign, one malicious) with the same digest.'
          },
          body: [
            '<strong>MD5 (RFC 1321, 128-bit):</strong> Designed by Ron Rivest (1991). Broken in 2004 by Xiaoyun Wang &amp; Hongbo Yu (practical collisions). Avoid for security.',
            '<strong>SHA-1 (160-bit, 1995):</strong> Deprecated after the 2017 SHAttered practical collision attack.',
            '<strong>SHA-2 (2001):</strong> Recommended family (<code>SHA-224</code>, <code>SHA-256</code>, <code>SHA-384</code>, <code>SHA-512</code>). <code>SHA-256</code> (256 bits / 64 hex chars) is the current standard.',
            '<strong>SHA-3 (2015, FIPS 202):</strong> Keccak sponge construction providing structural diversity and resistance to length-extension attacks.'
          ],
          table: {
            headers: ['Algorithm', 'Digest Size', 'Status', 'Primary Note'],
            rows: [
              ['MD5', '128 bits (32 hex)', 'Broken / Avoid', '2004 collision attack (Wang & Yu)'],
              ['SHA-1', '160 bits (40 hex)', 'Deprecated', '2017 SHAttered collision attack'],
              ['SHA-256 (SHA-2)', '256 bits (64 hex)', 'Recommended', 'Current standard for integrity & TLS'],
              ['SHA3-256 (SHA-3)', '256 bits (64 hex)', 'Recommended', 'Sponge construction; resists length-extension']
            ]
          },
          auditNote: {
            ref: 'Ch 6, p. 21',
            text: 'Source clarification: Slide 21 claims SHA-3 provides "post-quantum resistance". Grover\'s quantum search halves preimage security for BOTH SHA-2 and SHA-3, so larger digests (256/384/512 bits) are needed for post-quantum security in either family.'
          },
          immediatePractice: {
            question: 'A legacy script verifies software patches using a 40-hex-character digest. Which algorithm is it using, and what should it migrate to?',
            hints: [
              'Each hex character = 4 bits, so 40 hex characters = 160 bits.',
              '160-bit SHA-1 was broken in 2017 (SHAttered).'
            ],
            options: [
              'MD5 (128-bit); migrate to SHA-1.',
              'SHA-1 (160-bit); migrate to SHA-256 (64 hex chars).',
              'SHA-256 (256-bit); no migration needed.'
            ],
            correctIndex: 1,
            optionFeedback: [
              'MD5 is 32 hex chars (128 bits), and SHA-1 is also deprecated.',
              'Correct! 40 hex chars = 160 bits = SHA-1; migrate to SHA-256 (or SHA-3).',
              'SHA-256 is 64 hex characters, not 40.'
            ]
          }
        },
        {
          id: 'ch6-signatures',
          title: 'Digital Signatures & Digital Envelopes',
          ref: 'Ch 6, pp. 8–17, 30',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Trace RSA digital signature creation and verification, and distinguish signing from a full Digital Envelope.',
          prerequisites: ['RSA Public Key (n, e) vs Private Key (n, d)', 'Hash functions'],
          simpleExplanation: {
            summary: 'Signing hashes the document into a tiny fingerprint and locks it with your Private Key so anyone can verify it with your Public Key. A Digital Envelope adds a locked symmetric session key so nobody else can read the document either.',
            analogy: 'Wax seal on a letter (signature) vs wax seal inside a locked courier box (digital envelope).',
            limitation: 'In modern cryptography (RSASSA-PSS/ECDSA), signing is NOT literally "encrypting with the private key"—that is a textbook RSA simplification.'
          },
          body: [
            '<strong>E-Signature ≠ Digital Signature:</strong> An e-signature can be a drawn image; a digital signature uses a hash + the signer\'s <strong>Private Key</strong>.',
            '<strong>Signing (A):</strong> Compute <code>H(M)</code>, sign with <code>PR_A</code> → send <code>M || DS</code>. <strong>Verifying (B):</strong> Verify <code>DS</code> with <code>PU_A</code>, compute <code>H(M)</code> independently, and compare.',
            '<strong>5 Properties (p. 16):</strong> Authentic, Unforgeable, Non-Reusable, Unalterable, Non-Repudiable. Provides <strong>Authentication + Integrity + Non-Repudiation</strong> (NOT confidentiality).',
            '<strong>Digital Envelope (p. 30):</strong> Random session key <code>K</code> encrypts <code>M</code>; <code>PU_B</code> encrypts <code>K</code>; <code>PR_A</code> signs <code>H(M)</code> → Confidentiality + Integrity + Authentication.'
          ],
          workedExample: {
            title: 'Slide 17 Worked RSA Signature Exercise',
            prompt: 'A has Public Key (221, 7) and Private Key (221, 55). Message hash H = 180. Find signature S and verify.',
            steps: [
              'Check key: n = 221 = 13 × 17, z = 12 × 16 = 192. 7 × 55 = 385 = 2 × 192 + 1 ≡ 1 (mod 192).',
              'Sign with PR_A (221, 55): S = 180^55 mod 221.',
              'Split exponent 55 = 32 + 16 + 4 + 2 + 1. Repeated squaring mod 221: 180^1=180, 180^2=134, 180^4=55, 180^8=152, 180^16=118, 180^32=1.',
              'Multiply selected: (1 × 118 × 55 × 134 × 180) mod 221 = 158. So Signature S = 158.',
              'Verify with PU_A (221, 7): H\' = 158^7 mod 221. 158^2=210, 158^4=121. (121 × 210 × 158) mod 221 = 180 = H (Valid!).'
            ]
          },
          immediatePractice: {
            question: 'Alice wants to send a contract to Bob so that (1) only Bob can read it, and (2) Bob can prove Alice signed it. Which keys does Alice use?',
            hints: [
              'Confidentiality requires the recipient\'s Public Key.',
              'Non-repudiation/signing requires the sender\'s Private Key.'
            ],
            options: [
              'Sign hash with Alice\'s Private Key (PR_A); encrypt message/session key with Bob\'s Public Key (PU_B).',
              'Sign hash with Bob\'s Public Key (PU_B); encrypt message with Alice\'s Private Key (PR_A).',
              'Encrypt everything with Alice\'s Public Key (PU_A).'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! PR_A signs for authentication/non-repudiation, and PU_B encrypts the session key for Bob\'s confidentiality.',
              'Bob cannot prove Alice signed if Alice used Bob\'s public key, and encrypting with PR_A lets anyone with PU_A read it.',
              'If Alice encrypts with PU_A, Bob cannot decrypt it because only Alice has PR_A.'
            ]
          }
        },
        {
          id: 'ch6-lab',
          title: 'Windows Hashing Lab Commands',
          ref: 'Ch 6, pp. 31–44',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Compute and export file or text hashes on Windows using certutil and PowerShell Get-FileHash.',
          prerequisites: ['Difference between MD5, SHA-1, and SHA-256'],
          simpleExplanation: {
            summary: 'Windows has built-in tools to fingerprint files without installing anything: certutil in CMD and Get-FileHash in PowerShell.',
            analogy: 'Built-in digital scale for files—weighs the exact bytes.',
            limitation: 'Text strings must be converted to bytes (UTF-8) before hashing; adding a trailing space or newline changes the hash completely.'
          },
          body: [
            '<strong>CMD (certutil):</strong> <code>certutil -hashfile C:\\HashFiles\\Name.txt SHA256</code> (always specify algorithm; older Windows defaults to SHA1).',
            '<strong>PowerShell (Get-FileHash):</strong> Defaults to <code>SHA256</code>. Batch export: <code>Get-ChildItem -File -Recurse | Get-FileHash -Algorithm SHA256 | Export-Csv .\\HashReport.csv -NoTypeInformation</code>.',
            '<strong>Text Hashing (p. 40):</strong> Convert to bytes via <code>[Text.Encoding]::UTF8.GetBytes($text)</code>, then <code>[Security.Cryptography.SHA256]::Create().ComputeHash($bytes)</code>.'
          ],
          immediatePractice: {
            question: 'You run "Get-FileHash .\\Name.txt" in PowerShell without -Algorithm, and "certutil -hashfile Name.txt" in CMD without an algorithm. Will they always use the same algorithm?',
            hints: [
              'PowerShell Get-FileHash defaults to SHA256.',
              'Slide 33 shows certutil defaulting to SHA1 when no algorithm is given.'
            ],
            options: [
              'Yes—both default to SHA-256.',
              'No—Get-FileHash defaults to SHA-256, while certutil defaults to SHA-1.',
              'No—Get-FileHash defaults to MD5.'
            ],
            correctIndex: 1,
            optionFeedback: [
              'Slide 33 explicitly shows certutil outputting SHA1 when no algorithm parameter is supplied.',
              'Correct! Always pass SHA256 explicitly to certutil.',
              'Get-FileHash defaults to SHA256 (Slide 34).'
            ]
          }
        }
      ]
    },
    {
      id: 'ch7',
      number: '07',
      title: 'Key Management, PKI & Base64',
      titleTh: 'การจัดการกุญแจ PKI และ Base64',
      sourcePdf: 'Chapter 7 - Key Management and Distribution.pdf',
      pageCount: 50,
      summary: 'MitM risk on public keys, 4 public-key distribution methods, Kerberos KDC, X.509 certificates, PKI (CA/RA/VA/CRL/OCSP), and Base64 encoding/decoding.',
      lessons: [
        {
          id: 'ch7-dist',
          title: 'Public Key Distribution Methods & KDC / Kerberos',
          ref: 'Ch 7, pp. 2–10',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Compare the four public-key distribution models and explain why PKI/Certificates scale better than an online KDC.',
          prerequisites: ['Symmetric vs asymmetric keys', 'Man-in-the-Middle (MitM) attack'],
          simpleExplanation: {
            summary: 'Having a public key is useless if an attacker swapped it on the way. You can shout your key (easy to fake), look it up in a phonebook (phonebook can be hacked), ask a live security guard every time (KDC bottleneck), or carry a signed passport (CA Certificate).',
            analogy: 'Live security guard checking a list (KDC) vs government-signed passport verified offline (CA Certificate).',
            limitation: 'Even passports can be stolen or revoked early, which is why PKI still needs CRL or OCSP revocation checks.'
          },
          body: [
            '<strong>1. Public Announcement:</strong> Broadcast openly; anyone can forge/MitM.',
            '<strong>2. Publicly Available Directory:</strong> Trusted directory stores <code>{ID, PU}</code>; tampering with directory breaks trust.',
            '<strong>3. Public-Key Authority (KDC):</strong> Authority signs <code>PU_B</code> with <code>PR_auth</code> on demand. Drawback: KDC must be online 24/7 (bottleneck / single point of failure).',
            '<strong>4. Public-Key Certificates (CA):</strong> Solves KDC bottleneck—recipients verify the CA\'s signature offline.',
            '<strong>Kerberos (pp. 8–10):</strong> Symmetric-key KDC using <strong>AS</strong> (issues TGT) and <strong>TGS</strong> (issues Service Ticket) on port 88.'
          ],
          table: {
            headers: ['Method', 'Online Authority Needed?', 'Main Weakness / Tradeoff'],
            rows: [
              ['Public Announcement', 'No', 'Easily forged / MitM'],
              ['Public Directory', 'Yes (for lookups)', 'Directory tampering compromises all keys'],
              ['Public-Key Authority (KDC)', 'Yes (every session)', 'Bottleneck & single point of failure'],
              ['Public-Key Certificates (CA)', 'No (offline verification)', 'Requires revocation checks (CRL / OCSP)']
            ]
          },
          immediatePractice: {
            question: 'An enterprise has 50,000 employees connecting to internal web apps. Why is a CA-based Certificate model preferred over a Public-Key Authority (KDC) for web TLS?',
            hints: [
              'Does the browser have to contact the CA on every single TLS handshake to verify a certificate\'s signature?',
              'Think about single points of failure and traffic bottlenecks.'
            ],
            options: [
              'A CA does not need to be online for every session because clients already hold trusted Root CA public keys.',
              'A CA uses symmetric keys instead of public/private keys.',
              'A CA eliminates the need for expiration dates.'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! Clients verify the CA\'s signature locally using pre-installed Root CA certificates.',
              'CAs certify asymmetric public keys (X.509).',
              'Certificates always include a validity period (Not Before / Not After).'
            ]
          }
        },
        {
          id: 'ch7-pki',
          title: 'Digital Certificates & PKI Architecture',
          ref: 'Ch 7, pp. 11–26',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Identify the three components of an X.509 certificate and the roles of RA, CA, Repository, CRL, and OCSP.',
          prerequisites: ['Digital signatures', 'Asymmetric key pairs'],
          simpleExplanation: {
            summary: 'PKI is the passport system of the Internet: the Registration Authority (RA) checks your ID, the Certificate Authority (CA) stamps and signs your certificate, and CRL/OCSP is the stolen-passport list.',
            analogy: 'Passport office (RA), issuing authority (CA), and cancelled-passport list (CRL/OCSP).',
            limitation: 'Certificates are NOT encrypted—anyone can read your certificate\'s Subject and Public Key; the CA\'s signature only proves it wasn\'t forged.'
          },
          body: [
            '<strong>Three Certificate Contents (p. 24):</strong> (1) Subject\'s Public Key, (2) Subject Identification (CN, org, validity dates), (3) CA\'s Digital Signature.',
            '<strong>PKI Roles (pp. 25–26):</strong> <strong>RA</strong> verifies identity; <strong>CA</strong> issues & signs X.509 certificates; <strong>Directory</strong> publishes certs; <strong>CRL / OCSP</strong> checks revocation.',
            '<strong>Windows Tool (p. 23):</strong> <code>certmgr.msc</code> inspects Trusted Root Certification Authorities.'
          ],
          auditNote: {
            ref: 'Ch 7, pp. 11–12',
            text: 'Source clarification: Slides 11–12 say certificates are "encrypted with the CA\'s digital signature" and "decrypted using the CA\'s public key". In X.509 (RFC 5280), certificates are plaintext ASN.1/Base64 signed by the CA; recipients VERIFY the signature with the CA\'s public key.'
          },
          immediatePractice: {
            question: 'A web server\'s private key is stolen, so the admin revokes its certificate before the expiration date. How does a client learn the certificate is no longer trusted?',
            hints: [
              'Expiration dates alone won\'t catch a prematurely compromised key.',
              'Look at Step 4 of the PKI lifecycle (Slide 26).'
            ],
            options: [
              'By checking a CRL (Certificate Revocation List) or OCSP (Online Certificate Status Protocol).',
              'By asking the Registration Authority (RA) to re-issue a new root key.',
              'By deleting the server\'s public key from DNS.'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! CRLs and OCSP publish revocation status before the certificate\'s normal expiry.',
              'The RA verifies applicant identity during issuance, not live revocation checks.',
              'Certificates are not stored in DNS for revocation.'
            ]
          }
        },
        {
          id: 'ch7-base64',
          title: 'Base64 Encoding, Padding & Lab Commands',
          ref: 'Ch 7, pp. 27–50',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Encode and decode short ASCII strings in Base64 by hand, including "=" and "==" padding.',
          prerequisites: ['8-bit ASCII binary representation', '6-bit binary-to-decimal conversion (0–63)'],
          simpleExplanation: {
            summary: 'Base64 turns raw binary bytes (8 bits each) into safe printable text characters (6 bits each) so email, JSON, and text protocols don\'t choke on control characters. It is encoding, NOT encryption.',
            analogy: 'Packing 8-ounce cups into 6-ounce boxes—3 cups (24 oz) fit evenly into 4 boxes; leftovers need "=" filler.',
            limitation: 'Base64 provides ZERO confidentiality—anyone can decode it instantly. Never confuse Base64 encoding with encryption.'
          },
          body: [
            'Alphabet (64 chars): <code>A–Z</code> (0–25), <code>a–z</code> (26–51), <code>0–9</code> (52–61), <code>+</code> (62), <code>/</code> (63).',
            '<strong>Steps:</strong> 3 bytes (24 bits) → four 6-bit indices → 4 Base64 chars.',
            '<strong>Padding (<code>=</code>):</strong> 2 leftover bytes (16 bits) → 3 chars + <code>=</code> (e.g., <code>"an"</code> → <code>YW4=</code>). 1 leftover byte (8 bits) → 2 chars + <code>==</code> (e.g., <code>"G"</code> → <code>Rw==</code>).',
            '<strong>Lab Caution (p. 41):</strong> <code>certutil -encode</code> wraps output with <code>-----BEGIN CERTIFICATE-----</code> / <code>-----END CERTIFICATE-----</code>; PowerShell <code>[Convert]::ToBase64String(...)</code> outputs raw Base64.'
          ],
          workedExample: {
            title: 'Slide 37 Base64 Exercises (Verified)',
            prompt: 'Encode Base64, Hacker, INFOSEC, Encrypt; Decode RnV0dXJl, QW5nZWw=, SW1hZ2luZQ==, RGllSGFyZA==.',
            steps: [
              'Encode "Base64" → QmFzZTY0 | "Hacker" → SGFja2Vy | "INFOSEC" → SU5GT1NFQw== | "Encrypt" → RW5jcnlwdA==',
              'Decode "RnV0dXJl" → Future | "QW5nZWw=" → Angel | "SW1hZ2luZQ==" → Imagine | "RGllSGFyZA==" → DieHard'
            ]
          },
          immediatePractice: {
            question: 'Encode the 2-character ASCII string "OK" (O = 79 = 01001111, K = 75 = 01001011) into Base64.',
            hints: [
              'Concatenate 16 bits: 01001111 01001011, then split into 6-bit groups (pad the last group on the right with two 0s).',
              'Groups: 010011 (19=T), 110100 (52=0), 101100 (44=s), plus one "=".'
            ],
            options: ['T0s=', 'T0s==', 'S08='],
            correctIndex: 0,
            optionFeedback: [
              'Correct! 16 bits = 3 Base64 chars (19→T, 52→0, 44→s) + one "=" padding character.',
              'Two "==" padding chars are used only for 1-byte (8-bit) remainders.',
              'S08= is "KO", not "OK".'
            ]
          }
        }
      ]
    },
    {
      id: 'ch8',
      number: '08',
      title: 'Internet & Network Security',
      titleTh: 'ความมั่นคงปลอดภัยอินเทอร์เน็ตและเครือข่าย',
      sourcePdf: 'Chapter 8 - Internet and Network Security.pdf',
      pageCount: 36,
      summary: 'Layered security protocols, HTTP vs HTTPS, SSL/TLS 1.2 vs 1.3 (RFC 8446), PGP & Web of Trust, Remote-Access vs Site-to-Site VPN, IPsec (AH/ESP, Transport vs Tunnel), and Wireshark.',
      lessons: [
        {
          id: 'ch8-http-tls',
          title: 'HTTP, HTTPS & SSL/TLS 1.3',
          ref: 'Ch 8, pp. 2–12',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Explain how HTTPS uses TLS 1.3 (RFC 8446) cipher suites and Forward Secrecy to secure web traffic.',
          prerequisites: ['Hybrid cryptography', 'X.509 certificates'],
          simpleExplanation: {
            summary: 'HTTP sends postcards anyone on the network can read; HTTPS wraps the connection in a TLS 1.3 armored tunnel after checking the server\'s certificate and agreeing on a fresh session key.',
            analogy: 'Postcard (HTTP) vs sealed armored courier with a one-time lock (HTTPS/TLS 1.3).',
            limitation: 'HTTPS encrypts data in transit, NOT the destination IP/port or domain name in DNS/SNI (unless encrypted DNS/ECH is also used).'
          },
          body: [
            '<strong>Layer Mapping (p. 2):</strong> App/Pres: <code>HTTPS, SSH, PGP, S/MIME</code>; Session/Transport: <code>SSL/TLS</code>; Network: <code>IPsec</code>; Data Link: <code>PPTP, L2F, L2TP</code>.',
            '<strong>HTTP (80) vs HTTPS (443):</strong> Status codes: 1xx Info, 2xx Success, 3xx Redirect, 4xx Client Error, 5xx Server Error.',
            '<strong>TLS 1.3 (RFC 8446, 2018):</strong> SSL 2/3 &amp; TLS 1.0/1.1 deprecated. TLS 1.3 allows only <strong>5 AEAD cipher suites</strong> (e.g., <code>TLS_AES_128_GCM_SHA256</code>) and enforces <strong>Forward Secrecy</strong> (removed static RSA key exchange, RC4, 3DES, CBC).'
          ],
          auditNote: {
            ref: 'Ch 8, p. 10',
            text: 'Source clarification: Slide 10 caption says "TLS_AES_256_GCM_SHA384", but the Wireshark capture on that slide actually shows Cipher Suite: TLS_AES_128_GCM_SHA256 (0x1301).'
          },
          immediatePractice: {
            question: 'Why did TLS 1.3 remove static RSA key exchange?',
            hints: [
              'Think about what happens to recorded past traffic if the server\'s private key is stolen years later.',
              'TLS 1.3 requires Forward Secrecy by default.'
            ],
            options: [
              'Static RSA key exchange lacks Forward Secrecy—compromising the server\'s private key later would decrypt recorded past sessions.',
              'RSA cannot be used for digital certificates in TLS 1.3.',
              'TLS 1.3 only works over UDP port 80.'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! TLS 1.3 mandates ephemeral (ECDHE/DHE) key exchange for Forward Secrecy (RSA is still allowed for authentication/signatures).',
              'RSA certificates are still used for server authentication in TLS 1.3.',
              'TLS runs over TCP (443 for HTTPS); QUIC uses UDP.'
            ]
          }
        },
        {
          id: 'ch8-pgp',
          title: 'Pretty Good Privacy (PGP) & Web of Trust',
          ref: 'Ch 8, pp. 13–20',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Contrast PGP\'s decentralized Web of Trust with CA-based PKI and trace PGP\'s sign-then-encrypt pipeline.',
          prerequisites: ['Digital signatures', 'Hybrid encryption'],
          simpleExplanation: {
            summary: 'Instead of trusting a central government (CA) to vouch for everyone, PGP lets users vouch for each other\'s keys directly in a Key Ring—like trusting a friend-of-a-friend.',
            analogy: 'Personal network of trusted referrals (Web of Trust) vs central passport office (PKI CA).',
            limitation: 'Web of Trust scales poorly for strangers on the open web, which is why HTTPS uses CAs while PGP is used mainly for email/file signing.'
          },
          body: [
            'Designed by Phil Zimmermann (1991). Uses a <strong>Key Ring</strong> and decentralized <strong>Web of Trust</strong>.',
            '<strong>Combined Pipeline (p. 19):</strong> Hash <code>M</code> → sign <code>H(M)</code> with <code>PR_A</code> → concatenate <code>M || DS</code> → encrypt with random session key <code>K</code> → encrypt <code>K</code> with <code>PU_B</code>.',
            '<strong>Modern Algorithms (p. 20):</strong> AES, RSA (up to 4096-bit), EdDSA (Ed25519), SHA-2. TripleDES, SHA-1, and MD5 are deprecated.'
          ],
          immediatePractice: {
            question: 'In PGP\'s combined confidentiality + authentication flow (Slide 19), which operation happens FIRST on the sender\'s side?',
            hints: [
              'Look at the left side of Slide 19: M enters the Hash Function and Private Key signing before Symmetric Encryption.',
              'Sign first, then encrypt.'
            ],
            options: [
              'Encrypt the message with the recipient\'s Public Key, then hash the ciphertext.',
              'Hash M and sign H(M) with the sender\'s Private Key (PR_A), then symmetrically encrypt (M || DS) with session key K.',
              'Send the session key K in plaintext.'
            ],
            correctIndex: 1,
            optionFeedback: [
              'Slide 19 hashes and signs M first, then encrypts (M || DS) with K.',
              'Correct! Sign-then-encrypt with session key K, and encrypt K with PU_B.',
              'Session key K is encrypted with the recipient\'s Public Key PU_B.'
            ]
          }
        },
        {
          id: 'ch8-vpn-ipsec',
          title: 'VPNs, IPsec Modes & Wireshark Lab',
          ref: 'Ch 8, pp. 21–36',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Select between IPsec AH vs ESP and Transport vs Tunnel mode based on confidentiality and traffic-analysis requirements.',
          prerequisites: ['OSI Network Layer (IP header vs payload)', 'Remote-access vs Site-to-Site VPN'],
          simpleExplanation: {
            summary: 'Transport Mode locks only the cargo inside a truck while leaving the original shipping label visible. Tunnel Mode puts the entire original truck inside a bigger armored truck with a new gateway-to-gateway label.',
            analogy: 'Locked cargo (Transport) vs truck-inside-an-armored-truck (Tunnel).',
            limitation: 'Tunnel Mode hides internal host IPs from external sniffers, but it cannot stop malicious traffic originating inside the trusted intranet before the gateway.'
          },
          body: [
            '<strong>VPNs (p. 22):</strong> <strong>Remote-Access VPN</strong> (client ↔ gateway) vs <strong>Site-to-Site VPN</strong> (gateway ↔ gateway).',
            '<strong>IPsec (Layer 3):</strong> <strong>AH</strong> (integrity + auth, NO encryption) vs <strong>ESP</strong> (confidentiality + integrity + auth). Key setup via <strong>IKE</strong>.',
            '<strong>Transport Mode (pp. 25–26):</strong> Encrypts IP payload only; original IP header exposed (host-to-host).',
            '<strong>Tunnel Mode (pp. 27–30):</strong> Encrypts entire original IP packet + adds new outer IP header (gateway-to-gateway; protects against traffic-flow analysis).'
          ],
          workedExample: {
            title: 'Ch 8 pp. 25–28 · IPsec Mode Selection Decision',
            prompt: 'Packet from Host 10.1.1.5 → 10.2.2.9 passes through GW1 (203.0.113.1) and GW2 (198.51.100.1). Compare what an ISP sniffer sees.',
            steps: [
              'Transport Mode: ISP sees original header [10.1.1.5 → 10.2.2.9] + ESP-encrypted TCP payload (traffic flow exposed).',
              'Tunnel Mode: ISP sees outer header [203.0.113.1 → 198.51.100.1] + ESP-encrypted [10.1.1.5 → 10.2.2.9 | TCP payload] (internal hosts hidden).'
            ]
          },
          table: {
            headers: ['IPsec Mode', 'What is Encrypted?', 'Typical Use', 'Traffic Flow Analysis'],
            rows: [
              ['Transport Mode', 'IP Payload only (original IP header exposed)', 'Host-to-Host', 'Vulnerable (end IPs visible)'],
              ['Tunnel Mode', 'Entire original IP packet (new outer IP header)', 'Site-to-Site / VPN Gateway', 'Protected (only gateway IPs visible)']
            ]
          },
          pendingNote: 'Wireshark Lab (Ch 8, pp. 31–36): Covers ICMP ping and TCP 3-way handshake + HTTP inspection, but no .pcap/.pcapng capture files are included in lab/.',
          immediatePractice: {
            question: 'Two branch offices want to link their internal LANs over the Internet while hiding internal host IP addresses from ISP sniffers. Which IPsec combination should they configure?',
            hints: [
              'AH does not encrypt; ESP does.',
              'Only Tunnel Mode encrypts the original IP header.'
            ],
            options: [
              'AH in Transport Mode',
              'ESP in Transport Mode',
              'ESP in Tunnel Mode'
            ],
            correctIndex: 2,
            optionFeedback: [
              'AH provides no encryption and Transport Mode leaves the original IP header visible.',
              'Transport Mode leaves the original internal host IP header unencrypted.',
              'Correct! ESP provides encryption, and Tunnel Mode encapsulates the entire original IP packet inside a new gateway-to-gateway packet.'
            ]
          }
        }
      ]
    },
    {
      id: 'ch9',
      number: '09',
      title: 'Network Security Configurations & Labs 1–5',
      titleTh: 'การตั้งค่าความปลอดภัยเครือข่ายและแล็บ 1–5',
      sourcePdf: 'Chapter 9.1 (71p, authoritative) & Chapter 9.2 (19p)',
      pageCount: 90,
      summary: 'Cisco IOS modes, basic device hardening, IP/SVI/SSH, VLANs & 802.1Q trunks, LAN attacks, Switch Port Security (Lab 4), Firewalls, and Standard/Extended ACLs (Lab 5 pending).',
      lessons: [
        {
          id: 'ch9-ios-ip',
          title: 'Lab 1 & Lab 2: IOS Modes, Passwords, IP/SVI & SSH',
          ref: 'Ch 9.1, pp. 8–35 (supersedes Ch 9 old)',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Navigate Cisco IOS modes, save/erase configurations safely, interpret interface status codes, and configure SSH.',
          prerequisites: ['Basic IPv4 subnetting & default gateway concept'],
          simpleExplanation: {
            summary: 'Cisco IOS works like nested rooms: User EXEC (>) lets you look around; Privileged EXEC (#) lets you inspect/save; Global Config ((config)#) lets you change settings; and Interface/Line submodes configure specific ports.',
            analogy: 'Lobby (>) → Security Desk (#) → Control Room ((config)#) → Individual Switchboard ((config-if)#).',
            limitation: 'Changes in (config)# take effect immediately in RAM (running-config) but are lost on reboot unless saved to NVRAM (startup-config).'
          },
          body: [
            '<strong>Prompts:</strong> <code>&gt;</code> → <code>enable</code> → <code>#</code> → <code>configure terminal</code> → <code>(config)#</code> → <code>(config-if)#</code> / <code>(config-line)#</code>.',
            '<strong>Memory:</strong> <code>running-config</code> = volatile <strong>RAM</strong>; <code>startup-config</code> = <strong>NVRAM</strong>. Save: <code>copy running-config startup-config</code>. Wipe: <code>erase startup-config</code> + <code>reload</code>.',
            '<strong>Interface Status (p. 26):</strong> <code>administratively down/down</code> = <code>shutdown</code>; <code>down/down</code> = L1 physical issue; <code>up/down</code> = L2 protocol mismatch; <code>up/up</code> = operational.',
            '<strong>SSH (pp. 33–35):</strong> <code>hostname</code> → <code>ip domain-name</code> → <code>crypto key generate rsa general-keys modulus 1024</code> → <code>username</code> → <code>line vty 0 4</code> → <code>login local</code> → <code>transport input ssh</code>.'
          ],
          auditNote: {
            ref: 'Ch 9.1, pp. 17, 31, 33',
            text: 'Source corrections: (1) p. 17 mentions Flash under startup-config, but startup-config is in NVRAM (Flash holds IOS & vlan.dat). (2) p. 31 typos: use "security passwords min-length 8" (plural), "enable password/secret" (not enabled), and prompt "(config-line)#" (not config-if). (3) p. 33 bullet says "ip-domain name"; correct syntax is "ip domain-name".'
          },
          immediatePractice: {
            question: 'You configure a router interface with an IP address, but "show ip interface brief" reports "administratively down / down". What command did you forget?',
            hints: [
              'Router interfaces are shut down by default.',
              'Look at the status table on Ch 9.1 p. 26.'
            ],
            options: [
              'no shutdown (in interface configuration mode)',
              'copy running-config startup-config',
              'ip default-gateway'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! Router interfaces default to shutdown; "no shutdown" brings them up.',
              'Saving to startup-config does not enable an administratively shut interface.',
              'ip default-gateway is used on Layer 2 switches, not to enable router interfaces.'
            ]
          }
        },
        {
          id: 'ch9-vlan-trunk',
          title: 'Lab 3: VLANs, 802.1Q Trunks & Switch SVI',
          ref: 'Ch 9.1, pp. 36–71',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Configure access ports, 802.1Q trunk ports with allowed VLAN lists, and a management SVI on Catalyst switches.',
          prerequisites: ['IOS interface configuration mode', 'Subnetting'],
          simpleExplanation: {
            summary: 'VLANs split one physical switch into separate virtual switches so broadcasts stay inside each department. An access port connects one PC to one VLAN; a trunk port is a highway carrying tagged traffic for multiple VLANs between switches.',
            analogy: 'Separate lanes (VLANs) on a multi-lane highway (802.1Q Trunk) vs single driveway (Access port).',
            limitation: 'Without a Layer 3 router or multilayer switch, devices in different VLANs cannot ping each other even if they plug into the same switch.'
          },
          body: [
            '<strong>VLAN = Broadcast Domain = Subnet.</strong> VLAN 1 is default/native/management (cannot delete/rename). Ranges: <code>2–1001</code> Normal, <code>1006–4094</code> Extended.',
            '<strong>Access Port:</strong> <code>switchport mode access</code> + <code>switchport access vlan 10</code>.',
            '<strong>Trunk Port:</strong> <code>switchport mode trunk</code> + <code>switchport trunk allowed vlan 10,20,99</code> (allowed lists must match on both ends!).',
            '<strong>Verify:</strong> <code>show vlan brief</code>, <code>show interface trunk</code>, <code>show interfaces status</code>, <code>show interface fa0/1 switchport</code>.'
          ],
          auditNote: {
            ref: 'Ch 9.1, pp. 57, 58, 64–65',
            text: 'Source typos in Ch 9.1: p. 57 title says SW2 but prompt shows SW1; p. 58 lists VLAN 20 as 192.168.10.0/24 instead of 192.168.20.0/24; pp. 64–65 trunk output shows 10,20,30,99 even though p. 63 configured 10,20,99.'
          },
          immediatePractice: {
            question: 'PC10 (VLAN 10) on SW1 cannot ping PC10/2 (VLAN 10) on SW2, even though both access ports are up. Which command on the inter-switch link G0/1 diagnoses a trunk/allowed-VLAN mismatch?',
            hints: [
              'You need to inspect trunking status and allowed VLANs on G0/1.',
              'Check Ch 9.1 pp. 60–61.'
            ],
            options: [
              'show interface trunk',
              'show ip route',
              'erase startup-config'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! "show interface trunk" reveals trunk mode, 802.1Q status, native VLAN, and allowed/active VLANs.',
              'Layer 2 switches forward frames by MAC/VLAN, not IP routing table.',
              'Erasing startup-config wipes the switch configuration.'
            ]
          }
        },
        {
          id: 'ch9-portsec',
          title: 'LAN Attacks & Switch Port Security (Lab 4)',
          ref: 'Ch 9.2, pp. 2–8 & lab/Lab4 - Port Security Configuration.txt',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Configure static or sticky port security, choose the right violation mode, and recover an err-disabled port.',
          prerequisites: ['Switch access ports', 'MAC address table'],
          simpleExplanation: {
            summary: 'An access switch port normally trusts anyone who plugs into the wall jack. Port Security acts like a bouncer with a guest list (allowed MACs) and a max capacity—if an intruder plugs in, the port either drops their frames or shuts itself down.',
            analogy: 'Nightclub bouncer with a MAC guest list and max occupancy.',
            limitation: 'Port security only works on static access (or trunk) ports, NOT dynamic-negotiation ports—and sticky MACs are lost on reboot unless you save running-config to startup-config.'
          },
          body: [
            '<strong>LAN Attacks (pp. 3–4):</strong> <strong>MAC Flooding</strong> fills CAM table → switch floods all ports like a hub; <strong>DHCP/DNS Spoofing</strong> (MitM); <strong>DHCP Starvation</strong> exhausts IP pool.',
            '<strong>MAC Types (p. 6):</strong> <strong>Static</strong> (manual), <strong>Dynamic</strong> (lost on reload), <strong>Sticky</strong> (learned dynamically + saved to running-config).',
            '<strong>Violation Modes (p. 7):</strong> <strong>Protect</strong> (drop, no notify), <strong>Restrict</strong> (drop + notify), <strong>Shutdown</strong> (default: <code>err-disabled</code> + notify; recover via <code>shutdown</code> then <code>no shutdown</code>).'
          ],
          table: {
            headers: ['Violation Mode', 'Forwards Traffic?', 'Syslog / Counter Notify?', 'Port State'],
            rows: [
              ['Protect', 'No (drops unauthorized)', 'No', 'Up (stays active)'],
              ['Restrict', 'No (drops unauthorized)', 'Yes', 'Up (stays active)'],
              ['Shutdown (Default)', 'No', 'Yes', 'err-disabled (requires shut / no shut)']
            ]
          },
          immediatePractice: {
            question: 'In Lab 4, an attacker laptop triggers default port security on Fa0/1. After unplugging the attacker and reconnecting PC1, PC1 still has no network. What must the admin run on Fa0/1?',
            hints: [
              'Default violation mode is shutdown, putting Fa0/1 into err-disabled.',
              'Check lines 22–24 of Lab4 - Port Security Configuration.txt.'
            ],
            options: [
              'shutdown followed by no shutdown on interface Fa0/1',
              'switchport mode trunk',
              'no switchport port-security mac-address sticky'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! An err-disabled port must be administratively shut down and re-enabled (shutdown → no shutdown).',
              'Changing to trunk mode does not clear err-disabled and breaks access-port security.',
              'Removing sticky config does not recover an err-disabled interface.'
            ]
          }
        },
        {
          id: 'ch9-acl',
          title: 'Firewalls & Access Control Lists (Lab 5 Pending)',
          ref: 'Ch 9.2, pp. 9–19',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Design Standard vs Extended ACL rules, choose optimal router placement, and avoid the implicit-deny trap.',
          prerequisites: ['IPv4 source/destination addresses', 'TCP/UDP ports'],
          simpleExplanation: {
            summary: 'An ACL is a top-down checklist on a router interface. The first matching rule decides Permit or Deny; if nothing matches, an invisible "deny everything" rule at the bottom drops the packet.',
            analogy: 'Top-down security checklist ending with "if not on list, deny entry."',
            limitation: 'Because Standard ACLs only check the sender\'s IP, placing one near the sender would block them from EVERY destination—so Standard ACLs go near the destination, while Extended ACLs go near the source.'
          },
          body: [
            '<strong>Evaluation (pp. 11–12):</strong> Top-down, first match wins, <strong>implicit deny all</strong> at end.',
            '<strong>Inbound vs Outbound (p. 15):</strong> Inbound filters <em>before</em> routing (saves lookup); Outbound filters <em>after</em> routing.',
            '<strong>Standard ACL (1–99):</strong> Source IP only → place <strong>closest to destination</strong>.',
            '<strong>Extended ACL (100–199):</strong> Source IP, Destination IP, Protocol, L4 Port → place <strong>closest to source</strong>.'
          ],
          workedExample: {
            title: 'Ch 9.2 pp. 16–19 · Lab 5 ACL Placement & Wildcard',
            prompt: 'Block 192.168.10.0/24 from reaching 192.168.30.0/24 (Lab 5 topology R1–R2–R3), while allowing 192.168.11.0/24.',
            steps: [
              'Wildcard mask for /24 (255.255.255.0): 255.255.255.255 − 255.255.255.0 = 0.0.0.255.',
              'Extended ACL (near source R1 Fa0/1 in): access-list 100 deny ip 192.168.10.0 0.0.0.255 192.168.30.0 0.0.0.255; access-list 100 permit ip any any.',
              'Standard ACL (near destination R3 Fa0/1 out): access-list 10 deny 192.168.10.0 0.0.0.255; access-list 10 permit any.'
            ]
          },
          auditNote: {
            ref: 'Ch 9.2, p. 16',
            text: 'Syntax fix: Slide 16 writes "access-list 103 permit 192.168.30.0 0.0.0.255 any eq 80" without a protocol keyword. Cisco IOS requires "tcp": access-list 103 permit tcp 192.168.30.0 0.0.0.255 any eq 80.'
          },
          pendingNote: 'Lab 5 (Access Control Lists, Ch 9.2 p. 90): Topology (R1-R2-R3, block 192.168.10.0/24 -> 192.168.30.0/24) is in the slides, but no .pkt or .txt file is supplied in lab/.',
          immediatePractice: {
            question: 'In Lab 5 (Ch 9.2 p. 90), you want to block 192.168.10.0/24 from reaching 192.168.30.0/24 while still allowing 192.168.10.0/24 to reach 192.168.31.0/24. If you use a Standard ACL, where must it go?',
            hints: [
              'A Standard ACL cannot check the destination IP (30.0 vs 31.0).',
              'Place it on R3\'s interface leading ONLY to 192.168.30.0/24.'
            ],
            options: [
              'On R1 Fa0/1 inbound (closest to source).',
              'On R3 Fa0/1 outbound (closest to the 192.168.30.0/24 destination), plus permit any for other traffic.',
              'On R2 Se2/0 inbound with no permit statement.'
            ],
            correctIndex: 1,
            optionFeedback: [
              'Blocking 192.168.10.0/24 on R1 Fa0/1 with a Standard ACL would also block it from 192.168.31.0/24!',
              'Correct! Standard ACLs go closest to the destination (R3 Fa0/1 outbound), and you must include "permit any" so other traffic isn\'t dropped by implicit deny.',
              'Without a permit statement, implicit deny drops all traffic on that interface.'
            ]
          }
        }
      ]
    },
    {
      id: 'ch10',
      number: '10',
      title: 'Resiliency & Site Security Concepts',
      titleTh: 'ความยืดหยุ่นของระบบและความมั่นคงปลอดภัยสถานที่',
      sourcePdf: 'Chapter 10 - Resiliency and Site Security Concepts.pdf',
      pageCount: 50,
      summary: 'Availability & nines, HA vs FT, RAID 0/1, NIC teaming & STP, backup types (Full/Incremental/Differential), 3-2-1 & 3-2-1-1-0 rules, Hot/Warm/Cold sites, CPTED, and physical/environmental controls.',
      lessons: [
        {
          id: 'ch10-ha-ft',
          title: 'Availability, HA vs FT & Redundancy (RAID / Network)',
          ref: 'Ch 10, pp. 2–14',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Calculate yearly availability/downtime and distinguish High Availability, Fault Tolerance, RAID 0, and RAID 1.',
          prerequisites: ['Basic percentage math'],
          simpleExplanation: {
            summary: 'High Availability has a standby spare ready to take over in seconds or minutes; Fault Tolerance runs two identical engines side-by-side so failure causes zero blink. RAID 1 mirrors disks for hardware survival, but it is NOT a backup.',
            analogy: 'Spare tire in the trunk (HA) vs twin engines running simultaneously on an airplane (FT).',
            limitation: 'RAID 1 mirrors deletions and ransomware instantly to both drives—so RAID never replaces offline backups.'
          },
          body: [
            '<strong>Availability (p. 2):</strong> <code>(Total − Downtime) / Total</code>. 99% = 3.65d/yr; 99.9% = 8.76h/yr; 99.99% = 52.56m/yr; 99.999% = 5.26m/yr.',
            '<strong>HA vs FT (pp. 5–7):</strong> HA = active-standby failover (brief sec–min downtime); FT = active-active real-time mirroring (zero downtime, highest cost).',
            '<strong>RAID (pp. 8–10):</strong> <strong>RAID 0</strong> (striping, min 2 disks, <strong>0 fault tolerance</strong>). <strong>RAID 1</strong> (mirroring, 50% usable capacity, tolerates 1 disk failure).',
            '<strong>Network Redundancy (pp. 12–14):</strong> NIC Teaming, redundant switch paths (requires <strong>STP</strong> to prevent L2 loops), Load Balancers.'
          ],
          workedExample: {
            title: 'Ch 10 pp. 2–3 · Availability & Downtime Calculation',
            prompt: 'Calculate yearly availability for 10 hours downtime in an 8,760-hour year, and downtime for 99.999% SLA.',
            steps: [
              'Availability = (8,760 − 10) / 8,760 = 8,750 / 8,760 = 0.998858 → 99.89%.',
              'Five nines (99.999%) downtime/yr = 365 × 24 × 60 × (1 − 0.99999) = 525,600 × 0.00001 = 5.256 min/yr.'
            ]
          },
          table: {
            headers: ['Concept', 'Goal / Mechanism', 'Downtime / Tolerance', 'Key Caveat'],
            rows: [
              ['High Availability (HA)', 'Active-Standby / Failover', 'Very short (sec–min)', 'Brief interruption during failover'],
              ['Fault Tolerance (FT)', 'Active-Active / Real-time mirror', 'Zero downtime', 'High hardware & software cost'],
              ['RAID 0', 'Disk Striping (no parity)', 'None (0 disk failures)', 'Any single disk failure loses all data'],
              ['RAID 1', 'Disk Mirroring', '1 disk failure (50% cap)', 'Not a substitute for backups']
            ]
          },
          immediatePractice: {
            question: 'A 2-disk × 4 TB RAID 1 array suffers a single drive failure, and simultaneously a user accidentally deletes a critical folder. What happens?',
            hints: [
              'RAID 1 tolerates 1 physical disk failure.',
              'Does RAID 1 protect against accidental deletion or ransomware?'
            ],
            options: [
              'The server stays online (1 disk failure tolerated), but the deleted folder is gone from both drives unless you have a backup.',
              'All data is lost immediately because RAID 1 has zero fault tolerance.',
              'RAID 1 automatically restores the deleted folder from parity.'
            ],
            correctIndex: 0,
            optionFeedback: [
              'Correct! RAID 1 survives 1 disk failure, but logical deletions are mirrored immediately—hence "does not replace backups" (Slide 10).',
              'Zero fault tolerance describes RAID 0, not RAID 1.',
              'RAID 1 uses mirroring (not parity) and does not provide point-in-time file recovery.'
            ]
          }
        },
        {
          id: 'ch10-backup-sites',
          title: 'Backups, 3-2-1-1-0 Rule & Recovery Sites',
          ref: 'Ch 10, pp. 15–21',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Choose Full/Incremental/Differential backup schedules, apply 3-2-1-1-0, and match Hot/Warm/Cold sites to RTO.',
          prerequisites: ['Basic storage & disaster recovery concepts'],
          simpleExplanation: {
            summary: 'Incremental saves only today\'s changes (fast to back up, slow to restore every day\'s tape). Differential saves everything since Sunday\'s Full (only 2 sets needed to restore). 3-2-1-1-0 adds an unchangeable/offline copy against ransomware.',
            analogy: 'Daily sticky notes since yesterday (Incremental) vs a growing cumulative list since Sunday (Differential).',
            limitation: 'Never mix Incremental and Differential in the same schedule—Incremental clears the archive bit, breaking Differential\'s baseline.'
          },
          body: [
            '<strong>Backup Types (pp. 15–17):</strong> <strong>Full</strong> (all data; clears archive bit). <strong>Incremental</strong> (since last any; fast backup, slow restore = Full + all Inc; clears bit). <strong>Differential</strong> (since last Full; restore = 2 sets: Full + latest Diff; does NOT clear bit).',
            '<strong>3-2-1-1-0 (pp. 18–19):</strong> 3 copies, 2 media types, 1 offsite, <strong>+1 immutable/air-gapped</strong>, 0 errors.',
            '<strong>Recovery Sites (pp. 20–21):</strong> <strong>Hot</strong> (instant failover, $$$), <strong>Warm</strong> (partial gear, manual config/restore, hours–days, $$), <strong>Cold</strong> (empty facility, days–weeks, $).'
          ],
          auditNote: {
            ref: 'Ch 10, p. 21',
            text: 'Source inconsistency: Slide 21 graphic labels Warm Site as "Failover occurs within hours or days" (same text as Hot Site on p. 21). Use Slide 20: Hot = instantaneous; Warm = some delay/manual config; Cold = significant delay.'
          },
          immediatePractice: {
            question: 'A mid-sized company can tolerate up to 24 hours of downtime after a flood, but cannot afford duplicate live servers running 24/7. Which recovery site fits best?',
            hints: [
              'Hot sites are instantaneous and most expensive; Cold sites take days/weeks.',
              'Warm sites balance cost with hours-to-days recovery.'
            ],
            options: ['Hot Site', 'Warm Site', 'Cold Site'],
            correctIndex: 1,
            optionFeedback: [
              'Hot sites require full real-time redundant hardware (highest cost) for instantaneous failover.',
              'Correct! A Warm Site has power, network, and partial hardware ready for manual restore within hours to a day.',
              'A Cold Site has little/no equipment and typically takes days or weeks to procure and configure.'
            ]
          }
        },
        {
          id: 'ch10-physical',
          title: 'Physical Security, CPTED, Sensors & TEMPEST',
          ref: 'Ch 10, pp. 23–50',
          status: SOURCE_STATUS.VERIFIED,
          objective: 'Classify physical controls (Preventive vs Detective, 5 Ds) and select perimeter, entry, and EM shielding controls.',
          prerequisites: ['CIA Triad & AAA concepts'],
          simpleExplanation: {
            summary: 'Physical security layers Deter, Detect, Deny, Delay, and Defend around critical servers—from bollards and lighting outside, to mantraps at the door, to metal cable conduits (PDS) and EM-blocking Faraday cages inside.',
            analogy: 'Castle moat, gatehouse, guard, and vault.',
            limitation: 'A CCTV camera only records (detective control); without a guard or response team (preventive/corrective), it cannot physically stop an intruder.'
          },
          body: [
            '<strong>5 Ds (p. 23):</strong> Deter, Detect, Deny, Delay, Defend.',
            '<strong>Perimeter & Entry (pp. 26–37):</strong> CPTED, Fencing, Lighting (no shadow/glare), Bollards (vehicle barrier), Turnstiles & <strong>Mantraps</strong> (prevent tailgating), Kensington cable locks. <strong>Guard = Preventive</strong>; <strong>CCTV = Detective</strong>.',
            '<strong>Sensors (pp. 40–44):</strong> Circuit, PIR + Microwave (dual-tech motion), Ultrasonic, Pressure mats, Duress.',
            '<strong>Secure Areas & EM (pp. 45–50):</strong> Colocation cages, Air Gaps, Vaults, <strong>PDS</strong> (sealed metal conduit for cables), <strong>Faraday Cage / TEMPEST</strong> (blocks EM leakage).'
          ],
          immediatePractice: {
            question: 'An organization wants to prevent unauthorized visitors from tailgating behind badge-holding employees AND prevent anyone from tapping Ethernet cables in the ceiling. Which two controls address these?',
            hints: [
              'Tailgating is mitigated at the doorway by an interlocking vestibule.',
              'Physical cable tapping is mitigated by hardened conduits.'
            ],
            options: [
              'CCTV camera + RAID 1',
              'Access Control Vestibule (Mantrap) + Protected Distribution System (PDS)',
              'Bollards + Ultrasonic sensor'
            ],
            correctIndex: 1,
            optionFeedback: [
              'CCTV is detective only (doesn\'t physically stop tailgating), and RAID 1 protects disks, not cables.',
              'Correct! Mantraps/turnstiles prevent tailgating (p. 32), and PDS sealed metal conduits protect cabling (p. 49).',
              'Bollards stop vehicles; ultrasonic sensors detect motion in a room.'
            ]
          }
        }
      ]
    }
  ];

  const LAB_COMMANDS = [
    { lab: 'Lab 1', cmd: 'enable', mode: 'User EXEC (>)', purpose: 'Enter Privileged EXEC mode (#)', verify: 'Prompt changes from > to #', mistake: 'Trying to run configure terminal from > mode' },
    { lab: 'Lab 1', cmd: 'configure terminal', mode: 'Privileged EXEC (#)', purpose: 'Enter Global Configuration mode', verify: 'Prompt changes to (config)#', mistake: 'Running show commands without "do" inside (config)#' },
    { lab: 'Lab 1', cmd: 'hostname <name>', mode: 'Global Config', purpose: 'Set unique device name (req. for SSH)', verify: 'show running-config | include hostname', mistake: 'Using spaces or >63 chars in hostname' },
    { lab: 'Lab 1', cmd: 'enable secret <pw>', mode: 'Global Config', purpose: 'Set encrypted privileged EXEC password', verify: 'show running-config | include enable', mistake: 'Using plaintext "enable password" instead of "enable secret"' },
    { lab: 'Lab 1', cmd: 'banner motd #<msg>#', mode: 'Global Config', purpose: 'Display legal warning before login', verify: 'Exit to login prompt and test', mistake: 'Using the delimiter character inside the message text' },
    { lab: 'Lab 1', cmd: 'copy running-config startup-config', mode: 'Privileged EXEC (#)', purpose: 'Save RAM config to NVRAM', verify: 'show startup-config', mistake: 'Forgetting to save before reload (changes lost)' },
    { lab: 'Lab 1', cmd: 'erase startup-config; reload', mode: 'Privileged EXEC (#)', purpose: 'Clear NVRAM config and reboot device', verify: 'show startup-config', mistake: 'Running erase without reload (RAM still holds old config)' },
    { lab: 'Lab 2', cmd: 'ip address <ip> <mask>; no shutdown', mode: 'Interface (config-if)', purpose: 'Assign IPv4 address and enable interface', verify: 'show ip interface brief', mistake: 'Forgetting "no shutdown" (leaves interface administratively down)' },
    { lab: 'Lab 2', cmd: 'interface vlan 1; ip address <ip> <mask>; no shut', mode: 'Global / Interface', purpose: 'Configure Switch Virtual Interface (SVI) for remote mgmt', verify: 'show ip interface brief', mistake: 'Forgetting "ip default-gateway <gw>" for remote subnet access' },
    { lab: 'Lab 2', cmd: 'service password-encryption', mode: 'Global Config', purpose: 'Obfuscate plaintext console/VTY passwords (Type 7)', verify: 'show running-config', mistake: 'Writing "security password" instead of "security passwords min-length"' },
    { lab: 'Lab 2', cmd: 'ip domain-name <domain>; crypto key generate rsa general-keys modulus 1024', mode: 'Global Config', purpose: 'Generate RSA keypair to enable SSH', verify: 'show ip ssh', mistake: 'Missing hostname or ip domain-name before generating RSA key' },
    { lab: 'Lab 2', cmd: 'username <u> password <p>; line vty 0 4; login local; transport input ssh', mode: 'Global / Line', purpose: 'Enable local SSH authentication on VTY lines', verify: 'ssh -l <u> <ip> / show ssh', mistake: 'Using "login" instead of "login local", or leaving Telnet enabled' },
    { lab: 'Lab 3', cmd: 'vlan <id>; name <name>', mode: 'Global / VLAN', purpose: 'Create VLAN and assign descriptive name', verify: 'show vlan brief', mistake: 'Using VLAN 1 or deleting VLAN before reassigning member ports' },
    { lab: 'Lab 3', cmd: 'switchport mode access; switchport access vlan <id>', mode: 'Interface (config-if)', purpose: 'Assign switch port to a single data VLAN', verify: 'show interface <if> switchport', mistake: 'Forgetting "switchport mode access" (leaving DTP dynamic)' },
    { lab: 'Lab 3', cmd: 'switchport mode trunk; switchport trunk allowed vlan <list>', mode: 'Interface (config-if)', purpose: 'Configure 802.1Q trunk and restrict allowed VLANs', verify: 'show interface trunk / show interfaces status', mistake: 'Mismatched allowed VLAN lists or native VLAN across trunk ends' },
    { lab: 'Lab 4', cmd: 'switchport port-security; switchport port-security mac-address <mac>', mode: 'Interface (config-if)', purpose: 'Enable port security with static MAC binding', verify: 'show port-security interface <if>', mistake: 'Enabling port-security on a dynamic/trunk port instead of access mode' },
    { lab: 'Lab 4', cmd: 'switchport port-security maximum 2; switchport port-security mac-address sticky', mode: 'Interface (config-if)', purpose: 'Allow up to 2 MACs and save learned MACs to running-config', verify: 'show port-security address', mistake: 'Forgetting to save running-config to startup-config for sticky MACs' },
    { lab: 'Lab 4', cmd: 'switchport port-security violation {protect|restrict|shutdown}', mode: 'Interface (config-if)', purpose: 'Set violation response (default is shutdown -> err-disabled)', verify: 'show port-security / show interface status', mistake: 'Forgetting "shutdown" then "no shutdown" to clear err-disabled state' },
    { lab: 'Lab 5 (Pending)', cmd: 'access-list <1-99> deny <src> <wildcard>', mode: 'Global Config', purpose: 'Standard ACL (source IP only; place near destination)', verify: 'show access-lists', mistake: 'Using subnet mask instead of wildcard mask; forgetting implicit deny any' },
    { lab: 'Lab 5 (Pending)', cmd: 'access-list <100-199> deny tcp <src> <wc> <dst> <wc> eq <port>', mode: 'Global Config', purpose: 'Extended ACL (src/dst/proto/port; place near source)', verify: 'show ip interface <if>', mistake: 'Omitting protocol ("tcp") before "eq 80", or forgetting "ip access-group <id> in/out"' }
  ];

  // Authored simulated CLI exercises (explicitly labeled as simulated, not Packet Tracer execution)
  const LAB_DRILLS = [
    {
      id: 'drill-lab1-mode',
      lab: 'Lab 1',
      ref: 'Ch 9.1, pp. 8–10, 17',
      prompt: 'You are at prompt "SW1(config-line)#" after securing VTY lines, and want to save your configuration to NVRAM. Which command sequence works?',
      simulatedOutput: 'SW1(config-line)# copy running-config startup-config\n                  ^\n% Invalid input detected at \'^\' marker.',
      hints: [
        '"copy running-config startup-config" is a Privileged EXEC (#) command, not a config-line command.',
        'Use "end" (or "do copy running-config startup-config") from config mode.'
      ],
      options: [
        'Type "end" to return to SW1#, then run "copy running-config startup-config".',
        'Run "enable" inside (config-line)#.',
        'Run "erase startup-config" first.'
      ],
      correctIndex: 0,
      optionFeedback: [
        'Correct! "end" exits directly to Privileged EXEC (#), where "copy running-config startup-config" saves RAM to NVRAM.',
        '"enable" moves from User EXEC (>) to Privileged EXEC (#), not out of config-line.',
        '"erase startup-config" deletes the saved NVRAM config.'
      ]
    },
    {
      id: 'drill-lab2-if',
      lab: 'Lab 2',
      ref: 'Ch 9.1, pp. 24–26',
      prompt: 'Inspect the simulated verification output below. Why is GigabitEthernet0/1 failing to forward traffic?',
      simulatedOutput: 'R1# show ip interface brief\nInterface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     192.168.10.1    YES manual up                    up\nGigabitEthernet0/1     192.168.20.1    YES manual down                  down',
      hints: [
        'Notice Status is "down" (NOT "administratively down") and Protocol is "down".',
        'Compare "administratively down/down" vs "down/down" on Ch 9.1 p. 26.'
      ],
      options: [
        'The "shutdown" command is still active on G0/1.',
        'Physical layer (Layer 1) problem: no cable attached, bad cable, or the peer switch port is down.',
        'Wrong subnet mask on G0/0.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'If "shutdown" were active, Status would read "administratively down".',
        'Correct! "down / down" means "no shutdown" was issued, but Layer 1 has no carrier/link.',
        'G0/0 is "up / up" and does not cause G0/1 to be "down / down".'
      ]
    },
    {
      id: 'drill-lab3-trunk',
      lab: 'Lab 3',
      ref: 'Ch 9.1, pp. 60–65',
      prompt: 'Inspect the simulated trunk output on SW1. Users in VLAN 20 on SW1 cannot reach VLAN 20 on SW2. What is wrong?',
      simulatedOutput: 'SW1# show interface trunk\nPort        Mode         Encapsulation  Status        Native vlan\nGig0/1      on           802.1q         trunking      1\nPort        Vlans allowed on trunk\nGig0/1      10,99',
      hints: [
        'Look at "Vlans allowed on trunk" for Gig0/1.',
        'VLAN 20 is missing from the allowed list!'
      ],
      options: [
        'Native VLAN 1 is invalid for 802.1Q.',
        'VLAN 20 was omitted from "switchport trunk allowed vlan" on Gig0/1.',
        'Gig0/1 should be configured as "switchport mode access".'
      ],
      correctIndex: 1,
      optionFeedback: [
        'VLAN 1 is the default native VLAN and does not block VLAN 20.',
        'Correct! Only VLANs 10 and 99 are allowed on Gig0/1; add VLAN 20 with "switchport trunk allowed vlan 10,20,99".',
        'Inter-switch links carrying multiple VLANs must be trunks, not access ports.'
      ]
    },
    {
      id: 'drill-lab4-portsec',
      lab: 'Lab 4',
      ref: 'Ch 9.2, pp. 7–8 & Lab 4.txt',
      prompt: 'Inspect the simulated port-security output on SW1 Fa0/2. What happened when the attacker plugged into Fa0/2?',
      simulatedOutput: 'SW1# show port-security interface fa0/2\nPort Security              : Enabled\nPort Status                : Secure-up\nViolation Mode             : Restrict\nMaximum MAC Addresses      : 2\nTotal MAC Addresses        : 2\nSecurity Violation Count   : 4',
      hints: [
        'Look at "Port Status: Secure-up", "Violation Mode: Restrict", and "Security Violation Count: 4".',
        'Restrict mode drops unauthorized frames and increments the violation counter without shutting down the port.'
      ],
      options: [
        'The port entered err-disabled and shut down.',
        'Unauthorized frames from the attacker were dropped and counted (4 violations), while the port stayed Secure-up.',
        'The attacker\'s MAC was added as a 3rd sticky MAC.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Only "Shutdown" mode puts the port into err-disabled (Secure-shutdown).',
        'Correct! Restrict mode keeps the port up ("Secure-up"), drops offending frames, and increments Security Violation Count.',
        'Maximum MAC Addresses is 2, so a 3rd MAC triggers a violation instead of being learned.'
      ]
    }
  ];

  const QUESTIONS = [
    // Chapter 6
    {
      id: 'q-ch6-1',
      chapter: 'ch6',
      objectiveId: 'ch6-algorithms',
      bloom: 'Recall',
      topic: 'Hash Functions',
      ref: 'Ch 6, pp. 21–22',
      question: 'Which cryptographic hash function is currently recommended for file integrity verification and TLS certificates, and what is its digest length?',
      hint: 'MD5 (128-bit) and SHA-1 (160-bit) both have practical collision attacks.',
      options: [
        'MD5 — 128 bits (32 hex characters)',
        'SHA-1 — 160 bits (40 hex characters)',
        'SHA-256 — 256 bits (64 hex characters)',
        'CRC32 — 32 bits (8 hex characters)'
      ],
      correctIndex: 2,
      optionFeedback: [
        'MD5 was broken by practical collision attacks in 2004 (Wang & Yu) and is not recommended for security.',
        'SHA-1 was broken by the 2017 SHAttered collision attack and is deprecated.',
        'Correct! SHA-256 (part of SHA-2) produces a 256-bit (64-hex) digest with no practical collision attacks.',
        'CRC32 is an error-detection checksum, not a cryptographic hash function.'
      ]
    },
    {
      id: 'q-ch6-2',
      chapter: 'ch6',
      objectiveId: 'ch6-signatures',
      bloom: 'Application',
      topic: 'Digital Signatures',
      ref: 'Ch 6, pp. 13–17',
      question: 'In a digital signature, which key does the sender (Alice) use to sign the message digest, and which security properties does signing alone provide?',
      hint: 'Anyone must be able to verify the signature, but only Alice should be able to create it.',
      options: [
        'Alice signs with her Private Key; provides Authentication, Integrity, and Non-Repudiation.',
        'Alice signs with Bob\'s Public Key; provides Confidentiality and Integrity.',
        'Alice signs with her Public Key; provides Confidentiality only.',
        'Alice signs with a shared symmetric session key; provides Non-Repudiation.'
      ],
      correctIndex: 0,
      optionFeedback: [
        'Correct! Only Alice holds PR_A (authentication & non-repudiation), and verifying H(M) detects any alteration (integrity). Note: plaintext M may still be readable unless also encrypted.',
        'Encrypting with Bob\'s Public Key provides confidentiality, not a digital signature from Alice.',
        'Alice\'s Public Key is known to everyone, so anyone could forge it.',
        'A shared symmetric key cannot prove non-repudiation because both parties possess the same key.'
      ]
    },
    {
      id: 'q-ch6-3',
      chapter: 'ch6',
      objectiveId: 'ch6-signatures',
      bloom: 'Calculation',
      topic: 'RSA Signature Math',
      ref: 'Ch 6, p. 17',
      question: 'Using the Chapter 6 Slide 17 exercise: Alice\'s Public Key is (221, 7), Private Key is (221, 55), and message hash H = 180. What is the RSA digital signature S = 180^55 mod 221?',
      hint: 'Use repeated squaring: 55 = 32 + 16 + 4 + 2 + 1, or verify which option satisfies S^7 mod 221 = 180.',
      options: ['118', '158', '134', '192'],
      correctIndex: 1,
      optionFeedback: [
        '118 is the intermediate remainder for 180^16 mod 221, not the final signature.',
        'Correct! 180^55 mod 221 = 158, and Bob verifies 158^7 mod 221 = 180.',
        '134 is the intermediate remainder for 180^2 mod 221.',
        '192 is z = (13-1)(17-1), the totient used to compute d, not the signature.'
      ]
    },
    {
      id: 'q-ch6-4',
      chapter: 'ch6',
      objectiveId: 'ch6-lab',
      bloom: 'Recall',
      topic: 'Hash Lab',
      ref: 'Ch 6, pp. 34–36',
      question: 'In Windows PowerShell, what is the default hashing algorithm used by Get-FileHash when -Algorithm is omitted?',
      hint: 'Unlike older certutil defaults (SHA1), modern PowerShell defaults to a 256-bit SHA-2 variant.',
      options: ['MD5', 'SHA1', 'SHA256', 'SHA512'],
      correctIndex: 2,
      optionFeedback: [
        'MD5 is not the default; it must be requested with -Algorithm MD5.',
        'SHA1 was the default in older certutil versions, not PowerShell Get-FileHash.',
        'Correct! Get-FileHash defaults to SHA256.',
        'SHA512 requires -Algorithm SHA512.'
      ]
    },
    {
      id: 'q-ch6-5',
      chapter: 'ch6',
      objectiveId: 'ch6-integrity',
      bloom: 'Application',
      topic: 'Avalanche Effect',
      ref: 'Ch 6, pp. 25–26, 40–41',
      question: 'In the PowerShell text-hashing lab (Slide 40–41), a student hashes "Hello" and then hashes "hello" (lowercase h). What happens to the SHA-256 output?',
      hint: 'Remember the avalanche effect: even a 1-bit change in ASCII causes a completely different digest.',
      options: [
        'Only the first hex character changes because only the first letter changed.',
        'The entire 64-character hex digest changes unpredictably (~50% of bits flip).',
        'Both produce the exact same SHA-256 because SHA-256 is case-insensitive.',
        'PowerShell throws an error for lowercase letters.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Cryptographic hashes do not localize changes to the first byte; every bit depends on the whole input.',
        'Correct! The avalanche effect ensures a 1-bit input difference produces an unrelated digest.',
        'Cryptographic hashes operate on exact UTF-8 byte values ("H"=0x48 vs "h"=0x68).',
        'UTF-8 encodes any valid text string.'
      ]
    },
    // Chapter 7
    {
      id: 'q-ch7-1',
      chapter: 'ch7',
      objectiveId: 'ch7-dist',
      bloom: 'Application',
      topic: 'Key Distribution',
      ref: 'Ch 7, pp. 7–14',
      question: 'Why do Public-Key Certificates (CA / PKI) solve the main operational drawback of a Key Distribution Center (KDC)?',
      hint: 'Think about availability and bottlenecks when two users want to communicate.',
      options: [
        'Certificates eliminate the need for public/private keys.',
        'The CA does not need to remain online for every communication session; recipients verify the CA\'s signature offline using the CA\'s public key.',
        'Certificates encrypt the entire network tunnel automatically.',
        'Certificates use symmetric keys shared by all users.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Certificates still rely on asymmetric key pairs; they bind a public key to an identity.',
        'Correct! Unlike a KDC (which is an online bottleneck/SPOF), a CA signs certificates once and clients verify them offline (checking CRL/OCSP as needed).',
        'Encryption of tunnels is handled by TLS/IPsec, not by the certificate itself.',
        'Certificates contain a public key, not a shared symmetric key.'
      ]
    },
    {
      id: 'q-ch7-2',
      chapter: 'ch7',
      objectiveId: 'ch7-base64',
      bloom: 'Calculation',
      topic: 'Base64 Encoding',
      ref: 'Ch 7, pp. 31–37',
      question: 'How many "=" padding characters are added when Base64-encoding a 1-byte (8-bit) input such as "G", and what is the Base64 result for "G" (ASCII 71 = 01000111)?',
      hint: '8 bits split into 6-bit groups gives two 6-bit groups (12 bits total, padded with 4 trailing zero bits) out of four.',
      options: [
        'One "=" padding character; result is "Rw="',
        'Two "==" padding characters; result is "Rw=="',
        'No padding; result is "Rw"',
        'Two "==" padding characters; result is "YW4="'
      ],
      correctIndex: 1,
      optionFeedback: [
        'One "=" is used when 2 leftover bytes (16 bits -> 3 Base64 chars) remain, not 1 byte.',
        'Correct! 010001 110000 -> indices 17 (R) and 48 (w), plus "==" for the remaining two 6-bit slots.',
        'Standard Base64 (RFC 4648) pads output to a multiple of 4 characters.',
        'YW4= is the 2-byte example "an" from Slide 35.'
      ]
    },
    {
      id: 'q-ch7-3',
      chapter: 'ch7',
      objectiveId: 'ch7-base64',
      bloom: 'Troubleshooting',
      topic: 'Base64 Lab',
      ref: 'Ch 7, pp. 41–43',
      question: 'When using "certutil -encode C:\\Base64\\Name.txt C:\\Base64\\Encoded.txt" on Windows, what important caveat must you remember?',
      hint: 'Compare certutil -encode output with PowerShell [Convert]::ToBase64String().',
      options: [
        'certutil only works on .jpg files.',
        'certutil wraps the Base64 output with -----BEGIN CERTIFICATE----- and -----END CERTIFICATE----- header/footer lines.',
        'certutil automatically hashes the file with SHA-256 instead of encoding it.',
        'certutil deletes the original input file.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'certutil -encode works on any file.',
        'Correct! Slide 41 explicitly warns about the BEGIN/END CERTIFICATE header and footer lines.',
        'certutil -hashfile hashes; certutil -encode performs Base64 encoding.',
        'certutil does not delete the source file.'
      ]
    },
    {
      id: 'q-ch7-4',
      chapter: 'ch7',
      objectiveId: 'ch7-pki',
      bloom: 'Recall',
      topic: 'X.509 Certificates',
      ref: 'Ch 7, pp. 11–12, 24–26',
      question: 'Which statement accurately describes how a browser verifies an X.509 digital certificate?',
      hint: 'Remember the Phase 1 audit clarification on Slides 11–12: certificates are plaintext signed, not encrypted.',
      options: [
        'The browser decrypts the hidden certificate using the server\'s private key.',
        'The browser reads the plaintext certificate fields and verifies the CA\'s digital signature using the trusted CA\'s public key.',
        'The browser sends the user\'s password to the Registration Authority (RA).',
        'The browser hashes the CA\'s private key.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'No one ever has the server\'s private key except the server, and certificates are not encrypted.',
        'Correct! X.509 certificates are plaintext ASN.1/Base64 signed by the CA; the browser verifies the signature with the CA\'s public key.',
        'The RA verifies identity during issuance, not during client TLS browsing.',
        'The CA\'s private key is never shared with browsers.'
      ]
    },
    // Chapter 8
    {
      id: 'q-ch8-1',
      chapter: 'ch8',
      objectiveId: 'ch8-http-tls',
      bloom: 'Recall',
      topic: 'TLS 1.3',
      ref: 'Ch 8, pp. 8–9',
      question: 'Which statement accurately describes TLS 1.3 (RFC 8446) compared to TLS 1.2?',
      hint: 'Think about cipher suite count, AEAD, and Forward Secrecy.',
      options: [
        'TLS 1.3 expanded the cipher suite list to support RC4 and 3DES.',
        'TLS 1.3 reduced allowed cipher suites to 5 AEAD suites and enforces Forward Secrecy by removing static RSA key exchange.',
        'TLS 1.3 is simply "SSL 4.0" with no handshake changes.',
        'TLS 1.3 runs on TCP port 80 by default.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'RC4, 3DES, and CBC-mode ciphers were removed in TLS 1.3.',
        'Correct! TLS 1.3 uses 5 AEAD cipher suites with ephemeral key exchange for forward secrecy.',
        'Slide 8 explicitly notes TLS is a redesigned protocol, not just "SSL 4.0".',
        'HTTPS over TLS uses port 443; port 80 is plaintext HTTP.'
      ]
    },
    {
      id: 'q-ch8-2',
      chapter: 'ch8',
      objectiveId: 'ch8-vpn-ipsec',
      bloom: 'Application',
      topic: 'IPsec Modes',
      ref: 'Ch 8, pp. 25–30',
      question: 'Which IPsec mode encrypts the entire original IP packet (both IP header and payload) and encapsulates it inside a new IP packet, making it ideal for site-to-site VPN gateways?',
      hint: 'This mode hides internal source/destination host IPs from traffic-flow analysis.',
      options: [
        'Transport Mode',
        'Tunnel Mode',
        'AH-only Mode',
        'Promiscuous Mode'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Transport Mode encrypts only the IP payload, leaving the original IP header unencrypted.',
        'Correct! Tunnel Mode protects the entire original IP datagram and adds a new outer IP header between gateways.',
        'AH (Authentication Header) provides integrity and authentication, not encryption.',
        'Promiscuous mode is a NIC capture setting, not an IPsec mode.'
      ]
    },
    {
      id: 'q-ch8-3',
      chapter: 'ch8',
      objectiveId: 'ch8-pgp',
      bloom: 'Application',
      topic: 'PGP Web of Trust',
      ref: 'Ch 8, pp. 13–15',
      question: 'A small security team exchanges encrypted emails without a corporate Certificate Authority (CA). How does PGP determine whether a correspondent\'s public key is trustworthy?',
      hint: 'PGP stores keys in a Key Ring and uses a decentralized trust model.',
      options: [
        'By querying Microsoft Active Directory Kerberos KDC on port 88.',
        'Through the Web of Trust, where users store keys in a Key Ring and personally/peer-sign keys to establish trust.',
        'By sending the private key inside the email header.',
        'By using Base64 padding.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Kerberos KDC is symmetric-key enterprise auth, not PGP email trust.',
        'Correct! PGP uses a decentralized Web of Trust and local Key Ring instead of a central CA.',
        'Private keys must never be sent.',
        'Base64 is an encoding format, not a trust model.'
      ]
    },
    // Chapter 9 & Labs
    {
      id: 'q-ch9-1',
      chapter: 'ch9',
      objectiveId: 'ch9-ios-ip',
      bloom: 'Troubleshooting',
      topic: 'IOS Troubleshooting',
      ref: 'Ch 9.1, p. 26',
      question: 'On a Cisco router, "show ip interface brief" shows Status = "up" and Protocol = "down". What is the most likely cause?',
      hint: 'Physical layer (Layer 1) is up, so look one layer higher.',
      options: [
        'The "shutdown" command is configured on the interface.',
        'No cable is attached (Layer 1 failure).',
        'A Data Link layer (Layer 2) configuration/protocol problem exists.',
        'The interface is fully operational.'
      ],
      correctIndex: 2,
      optionFeedback: [
        '"shutdown" produces "administratively down / down".',
        'A missing cable or powered-off peer produces "down / down".',
        'Correct! "up / down" indicates Layer 1 is working but Layer 2 (line protocol) has a configuration/encapsulation mismatch.',
        'Fully operational is "up / up".'
      ]
    },
    {
      id: 'q-ch9-2',
      chapter: 'ch9',
      objectiveId: 'ch9-vlan-trunk',
      bloom: 'Application',
      topic: 'VLANs & Trunks',
      ref: 'Ch 9.1, pp. 41, 47, 63',
      question: 'Which statement about Cisco Catalyst VLANs and 802.1Q trunks is TRUE?',
      hint: 'Check VLAN 1 rules and trunk allowed-list behavior.',
      options: [
        'VLAN 1 can be deleted using "no vlan 1".',
        'Devices in different VLANs can ping each other directly through a Layer 2 switch without a router.',
        'When restricting VLANs with "switchport trunk allowed vlan 10,20,99", both ends of the trunk must have matching allowed VLAN lists.',
        'Normal Ethernet VLANs use IDs 1006–4094.'
      ],
      correctIndex: 2,
      optionFeedback: [
        'VLAN 1 is the default VLAN and cannot be deleted or renamed.',
        'VLANs isolate broadcast domains; inter-VLAN routing requires a Layer 3 device.',
        'Correct! Slide 63 emphasizes that the allowed VLAN lists must match on both ends of the trunk.',
        'Normal Ethernet VLANs are 2–1001; 1006–4094 are Extended VLANs.'
      ]
    },
    {
      id: 'q-ch9-3',
      chapter: 'ch9',
      objectiveId: 'ch9-portsec',
      bloom: 'Troubleshooting',
      topic: 'Port Security',
      ref: 'Ch 9.2, pp. 6–8 & Lab 4',
      question: 'In Lab 4 (Port Security), what is the difference between "restrict" and "shutdown" violation modes when an attacker laptop connects to a secured port?',
      hint: 'One keeps the interface up while dropping unauthorized frames; the other puts it in err-disabled.',
      options: [
        'Both put the port into err-disabled state.',
        '"restrict" drops unauthorized frames and logs/notifies while keeping the port up; "shutdown" (default) disables the port (err-disabled) until "shutdown" + "no shutdown" are run.',
        '"restrict" allows the attacker traffic without logging; "protect" disables the port.',
        '"shutdown" deletes sticky MAC addresses automatically.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Only "shutdown" mode puts the port into err-disabled.',
        'Correct! Lab 4 tests "shutdown" (err-disabled recovery via shut/no shut) and then changes to "restrict" (drops attacker frames + increments counter without disabling the port).',
        'Protect drops frames without notifying; neither protect nor restrict disables the port.',
        'Sticky MACs remain in running-config until removed or reloaded (if unsaved).'
      ]
    },
    {
      id: 'q-ch9-4',
      chapter: 'ch9',
      objectiveId: 'ch9-acl',
      bloom: 'Application',
      topic: 'ACLs',
      ref: 'Ch 9.2, pp. 12–18',
      question: 'Where should Standard ACLs and Extended ACLs be placed on a network, and what happens if no ACE in an ACL matches a packet?',
      hint: 'Standard ACLs only check source IP; Extended ACLs check source, destination, protocol, and port.',
      options: [
        'Standard closest to source; Extended closest to destination; unmatched packets are permitted.',
        'Standard closest to destination; Extended closest to source; unmatched packets are dropped by the implicit deny all.',
        'Both should always be placed on the core router outbound; unmatched packets are logged and forwarded.',
        'ACLs are evaluated bottom-up.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Placement is reversed and default action is deny, not permit.',
        'Correct! Standard ACLs go near the destination (to avoid over-blocking), Extended ACLs go near the source (for efficiency), and every ACL ends with an implicit deny all.',
        'Placement depends on ACL type; implicit deny drops unmatched packets.',
        'ACLs are evaluated top-down, first match wins.'
      ]
    },
    {
      id: 'q-ch9-5',
      chapter: 'ch9',
      objectiveId: 'ch9-acl',
      bloom: 'Troubleshooting',
      topic: 'ACL Syntax',
      ref: 'Ch 9.2, p. 16',
      question: 'An admin types "access-list 103 permit 192.168.30.0 0.0.0.255 any eq 80" (from Slide 16) on a Cisco router, and IOS rejects it. Why?',
      hint: 'Port 80 is a Layer 4 TCP port—what keyword is missing before the source IP?',
      options: [
        'Standard ACLs use numbers 100–199.',
        'Extended ACLs filtering on "eq 80" require a Layer 4 protocol keyword ("tcp") after permit/deny.',
        'Wildcard masks cannot end in 255.',
        '"any" is not valid in Extended ACLs.'
      ],
      correctIndex: 1,
      optionFeedback: [
        '100–199 are Extended ACLs; Standard ACLs are 1–99.',
        'Correct! The valid IOS command is "access-list 103 permit tcp 192.168.30.0 0.0.0.255 any eq 80".',
        '0.0.0.255 is the correct wildcard mask for /24.',
        '"any" is valid for source or destination in Extended ACLs.'
      ]
    },
    {
      id: 'q-ch9-6',
      chapter: 'ch9',
      objectiveId: 'ch9-ios-ip',
      bloom: 'Application',
      topic: 'SSH Configuration',
      ref: 'Ch 9.1, pp. 33–35',
      question: 'Which prerequisite MUST be configured on a Cisco router/switch BEFORE running "crypto key generate rsa general-keys modulus 1024"?',
      hint: 'The RSA key name is formed as <hostname>.<domain-name>.',
      options: [
        'A unique hostname (not default) and an "ip domain-name".',
        'A port-security sticky MAC address.',
        'An Extended ACL on VTY 0 4.',
        'Deleting vlan.dat.'
      ],
      correctIndex: 0,
      optionFeedback: [
        'Correct! Slide 35 shows the key is named "<hostname>.<domain-name>" (e.g., R1.ICT304).',
        'Port security is a Layer 2 switch feature unrelated to SSH key generation.',
        'ACLs are optional and not a prerequisite for generating RSA keys.',
        'Deleting vlan.dat wipes VLANs, which is unrelated to SSH.'
      ]
    },
    // Chapter 10
    {
      id: 'q-ch10-1',
      chapter: 'ch10',
      objectiveId: 'ch10-ha-ft',
      bloom: 'Calculation',
      topic: 'Availability & HA/FT',
      ref: 'Ch 10, pp. 2–7',
      question: 'Approximately how much downtime per year corresponds to 99.999% ("five nines") availability, and which architecture targets zero downtime?',
      hint: '365 days × 24 hours × 60 minutes = 525,600 minutes/year. Take 0.001% of that.',
      options: [
        '8.76 hours/year; High Availability (HA)',
        '5.26 minutes/year; Fault Tolerance (FT)',
        '3.65 days/year; Fault Tolerance (FT)',
        '52.56 minutes/year; High Availability (HA)'
      ],
      correctIndex: 1,
      optionFeedback: [
        '8.76 hours/year is 99.9% (three nines); HA has brief failover downtime.',
        'Correct! 525,600 × 0.00001 ≈ 5.26 minutes/year, and Fault Tolerance (FT) uses full active-active redundancy for zero downtime.',
        '3.65 days/year is 99% (two nines).',
        '52.56 minutes/year is 99.99% (four nines).'
      ]
    },
    {
      id: 'q-ch10-2',
      chapter: 'ch10',
      objectiveId: 'ch10-backup-sites',
      bloom: 'Application',
      topic: 'RAID & Backups',
      ref: 'Ch 10, pp. 9–19',
      question: 'Suppose a Full backup runs on Sunday, followed by Differential backups Mon–Wed. If a failure occurs Thursday morning, which backup sets are needed to restore, and what does the "+1" in the 3-2-1-1-0 rule mean?',
      hint: 'Differential captures everything changed since the last Full backup.',
      options: [
        'Sunday Full + Mon + Tue + Wed Differentials; +1 = 1 extra local USB drive.',
        'Sunday Full + Wednesday Differential only (2 sets); +1 = 1 immutable or air-gapped copy.',
        'Wednesday Differential only; +1 = 1 cloud copy.',
        'Sunday Full only; +1 = 1 RAID 0 array.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Full + every daily set is for Incremental backups, not Differential.',
        'Correct! Differential restore needs only 2 sets (last Full + latest Differential), and +1 adds an immutable/air-gapped copy against ransomware.',
        'Differential backups do not include unchanged files from Sunday Full.',
        'RAID 0 has zero fault tolerance and is not a backup.'
      ]
    },
    {
      id: 'q-ch10-3',
      chapter: 'ch10',
      objectiveId: 'ch10-physical',
      bloom: 'Recall',
      topic: 'Site & Physical Security',
      ref: 'Ch 10, pp. 20, 32, 37, 49–50',
      question: 'Which physical/resiliency pairing is accurate?',
      hint: 'Compare preventive vs detective controls, tailgating mitigation, and cable/EM protection.',
      options: [
        'CCTV camera = Preventive control; Security Guard = Detective control only.',
        'Mantrap = prevents tailgating; PDS = sealed metal conduit for cables; Faraday cage/TEMPEST = blocks EM signal leakage.',
        'Cold site = instantaneous failover; Hot site = empty room with no equipment.',
        'RAID 1 replaces the need for offsite backups.'
      ],
      correctIndex: 1,
      optionFeedback: [
        'Reversed! Slide 37 states a Security Guard is a preventive control (can intervene), whereas a CCTV camera is detective only.',
        'Correct! All three definitions match Chapter 10 slides 32, 49, and 50.',
        'Reversed! Hot site = instantaneous failover; Cold site = empty space with significant delay.',
        'Slide 10 explicitly states RAID 1 "does not replace backups".'
      ]
    },
    {
      id: 'q-ch10-4',
      chapter: 'ch10',
      objectiveId: 'ch10-ha-ft',
      bloom: 'Calculation',
      topic: 'Availability Math',
      ref: 'Ch 10, p. 2',
      question: 'A server was operational for 8,750 hours out of an 8,760-hour year (10 hours of downtime). What is its availability percentage?',
      hint: 'Use (Total Elapsed Time - Sum of Downtime) / Total Elapsed Time × 100%.',
      options: ['99.00%', '99.89%', '99.99%', '98.86%'],
      correctIndex: 1,
      optionFeedback: [
        '99.00% would allow ~87.6 hours of downtime.',
        'Correct! (8760 - 10) / 8760 = 8750 / 8760 ≈ 0.998858 → 99.89%.',
        '99.99% allows only ~52.56 minutes (0.876 hours) of downtime.',
        '8750 / 8760 is 0.99886, not 0.9886.'
      ]
    }
  ];

  return {
    SOURCE_STATUS,
    CHAPTERS,
    LAB_COMMANDS,
    LAB_DRILLS,
    QUESTIONS
  };
});
