# File Integrity Checker – SHA-256

[![NIST FIPS 180-4](https://img.shields.io/badge/Standard-NIST%20FIPS%20180--4-06b6d4?style=for-the-badge)](https://csrc.nist.gov/publications/detail/fips/180-4/final)
[![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passing-10b981?style=for-the-badge)](tests/integrity.test.ts)
[![Security Privacy](https://img.shields.io/badge/Execution-100%25%20In--Memory%20Client--Side-3b82f6?style=for-the-badge)](#security-architecture--privacy-guarantee)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/CipherVicky/file-integrity-checker-Public-1)

A cybersecurity-grade web application and companion CLI tool designed to compute **SHA-256 cryptographic fingerprints**, detect file tampering and bit rot, verify installers against authoritative vendor checksums, monitor directory drift, and explore cryptographic principles.

---

## 🛡️ Core Security Architecture & Privacy Guarantee

- **Zero Unauthorized Uploads:** 100% of cryptographic hashing occurs directly within your browser's RAM via `@noble/hashes` and the Web Cryptography API. Files are streamed in 2 MB slices so multi-gigabyte ISOs hash smoothly without memory exhaustion. Files never touch any remote server.
- **Strictly Authentic Hashes:** Includes official, vendor-verified SHA-256 signatures for major operating systems, browsers, developer tools, and security packages. No fabricated checksums.
- **The Golden Security Principle:** **UNKNOWN FILE ≠ MALICIOUS FILE**. SHA-256 validates identity and untampered transmission against a known reference; it does not perform heuristic antivirus scanning.

```text
+---------------------------------------------------------------------------------------+
|                               FOUR INTEGRITY CLASSIFICATIONS                          |
+----------------------+----------------------------------------------------------------+
| 🟢 VERIFIED          | Exact bit-for-bit SHA-256 match with authoritative vendor feed.|
| 🔴 HASH MISMATCH     | Vendor package identified, but hash differs (tampering/drift). |
| 🟡 UNKNOWN FILE      | No reference in catalog (normal for private/unindexed builds). |
| 🟣 BASELINE VERIFIED | File matches a previously recorded user-generated baseline.    |
+----------------------+----------------------------------------------------------------+
```

---

## ⚡ Features

### 1. General File Integrity Hasher
- Drag-and-drop any file format (ISO, EXE, DMG, TAR.GZ, PDF, ZIP, RAW).
- Real-time streaming progress indicator with memory-efficient chunking.
- File metadata readout: File Name, Size (bytes & human-readable), MIME type, Last Modified timestamp, and execution duration (ms).
- Complete 64-character hexadecimal SHA-256 string in monospace font with single-click clipboard copying.
- Download standard `.sha256` verification files.

### 2. Trusted Application Verification
- Cross-references calculated hashes against an authoritative vendor database:
  - **Operating Systems:** Ubuntu 24.04.4 LTS, Ubuntu 22.04.5 LTS, Debian 12.7.0, Kali Linux 2024.3, Arch Linux 2024.09.01, Fedora 40 Workstation.
  - **Browsers:** Mozilla Firefox 131.0, Google Chrome, Brave Browser, Microsoft Edge.
  - **Developer Tools:** Visual Studio Code 1.93.1, Git 2.46.2, Python 3.12.6, Node.js 20.18.0 LTS, Docker Desktop.
  - **Security Tools:** Wireshark 4.2.7, Nmap 7.95, Burp Suite Community, 7-Zip 24.08.
  - **Utilities:** VLC Media Player 3.0.21, Notepad++ 8.7, WinRAR 7.01, LibreOffice 24.8.2.
- Tri-state verification engine with detailed vendor metadata and official source links.

### 3. Cryptographic Hash Comparator
- Safe, case-insensitive comparison of two hashes.
- Automatically normalizes input by stripping colons, hyphens, and whitespace.
- Visual character-by-character hex discrepancy diff highlighting exactly which characters differ.

### 4. Baseline Directory & Drift Monitoring
- **Snapshot Creation:** Select directories or multi-file batches to generate signed JSON baseline manifests.
- **Drift Detection:** Compare subsequent directory states against the baseline to detect:
  - `UNCHANGED`: Bit-for-bit cryptographic match.
  - `MODIFIED`: Tampered or edited files.
  - `ADDED`: Newly dropped files or unrecognized binaries.
  - `DELETED`: Missing or removed assets.
- Export executive audit reports in both **Markdown** and **JSON**.

### 5. "One Byte Changes Everything" Avalanche Lab
- Interactive demonstration of the **Strict Avalanche Criterion (SAC)** in SHA-256.
- Real-time Hamming distance calculation (how many of the 256 bits flipped).
- 16x16 interactive 256-bit visual matrix highlighting individual flipped bits.

### 6. Local Audit History & Compliance Export
- Persistent audit log stored locally in the browser.
- Instant export to **RFC 4180 CSV** or **JSON** for security compliance records.

### 7. Supabase Cloud Sync (Optional)
- Connect any Supabase PostgreSQL backend to sync team custom hashes and push audit logs.
- Includes SQL schema migration (`supabase/schema.sql`) with Row Level Security (RLS).

### 8. Companion CLI Utility (`integrity-check`)
Headless Node.js command-line tool for DevOps pipelines and terminal workflows:

```bash
# Verify a file against the trusted database
node cli/bin/integrity-check.js verify ubuntu-24.04-desktop-amd64.iso

# Compute SHA-256 hash of any file
node cli/bin/integrity-check.js hash ./dist/app.tar.gz

# Compare two SHA-256 checksums
node cli/bin/integrity-check.js compare 3a4c9877b483ab46d... 3a4c9877b483ab46d...

# Snapshot a directory into a baseline JSON manifest
node cli/bin/integrity-check.js baseline create ./src --out baseline.json

# Audit directory drift against the baseline
node cli/bin/integrity-check.js baseline audit ./src --baseline baseline.json
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/CipherVicky/file-integrity-checker-Public-1.git
cd file-integrity-checker-Public-1

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Automated Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run preview
```

---

## ☁️ Deployment

### 1-Click Vercel Deployment
Deploy instantly to Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CipherVicky/file-integrity-checker-Public-1)

---

## 📜 Cryptographic References & Standards

- **NIST FIPS 180-4:** Secure Hash Standard (SHS) – Specifications for SHA-256.
- **RFC 6234:** US Secure Hash Algorithms (SHA and SHA-based HMAC and HKDF).
- **Webster & Tavares (1985):** *On the Design of S-Boxes* – Strict Avalanche Criterion (SAC).

---

## 📄 License

MIT License. Authored and maintained by [CipherVicky](https://github.com/CipherVicky).
