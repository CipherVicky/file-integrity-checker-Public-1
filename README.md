# File Integrity Checker – SHA-256

[![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passing-10b981?style=for-the-badge)](tests/integrity.test.ts)
[![Beginner Friendly](https://img.shields.io/badge/Level-Beginner%20Friendly-06b6d4?style=for-the-badge)](#beginner-guide)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20On%20Your%20Device-3b82f6?style=for-the-badge)](#privacy-guarantee)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/CipherVicky/file-integrity-checker-Public-1)

A friendly and easy-to-use web app and command-line tool to check if your files and downloaded software are **genuine, unmodified, and safe from tampering**.

---

## 💡 What is this project? (In Simple Words)

Whenever you download an app or save a file, it has a unique **digital fingerprint** called a **SHA-256 hash** (a 64-character code made of letters and numbers). 

If anyone modifies the file—or if a download gets broken—the code changes completely! This tool lets you:
1. **Get the code for any file** on your computer.
2. **Check downloaded apps** (like Ubuntu, Firefox, VS Code) to make sure they match the official version from the developer.
3. **Compare two codes** side-by-side to see if they match.
4. **Save a snapshot of a folder** to see if any file inside was modified, added, or deleted later.
5. **Experiment with how hashes work** by changing 1 letter and watching how the code transforms.

---

## 🔒 Privacy Guarantee

- **Your files never leave your computer:** All checks happen 100% inside your browser. No files are uploaded to any server or cloud.
- **Works offline:** You can use this even without an active internet connection.

---

## 🚦 What the 4 Results Mean

| Result | What it Means in Plain English |
| :--- | :--- |
| 🟢 **VERIFIED** | **Exact Match!** The file is an exact copy of the official software from the developer. |
| 🔴 **HASH MISMATCH** | **Different!** The file differs from the official version (could be edited, broken download, or a different version). |
| 🟡 **UNKNOWN FILE** | **Not in the List.** The file is not in our list of popular apps. **This does NOT mean it's a virus!** Personal files or home projects will always show as unknown. |
| 🟣 **SNAPSHOT MATCH** | **Matches Your Saved Folder!** The file matches the snapshot you previously saved on your computer. |

---

## 🛠️ Main Features

### 1. File Hash Checker
- Drop any file to see its unique 64-character SHA-256 code.
- View file name, file size, and last modified date.
- Copy the code with 1 click or download a `.sha256` verification file.

### 2. Check Known Software
- Automatically checks your file against official original software:
  - **Operating Systems:** Ubuntu 24.04, Debian, Kali Linux, Arch Linux, Fedora.
  - **Browsers:** Firefox, Chrome, Brave, Edge.
  - **Developer Tools:** Visual Studio Code, Git, Python, Node.js, Docker.
  - **Security & Utilities:** Wireshark, Nmap, 7-Zip, VLC Player, Notepad++, LibreOffice.

### 3. Compare Two Hashes
- Paste two codes side-by-side.
- Automatically ignores extra spaces and capital letters.
- Highlights any letter differences in bright red so you can easily spot mistakes.

### 4. Track Folder Changes (Baseline Monitor)
- **Step 1:** Select a folder to save a snapshot of all its files.
- **Step 2:** Check back later to see which files were:
  - `Unchanged`: Still the same.
  - `Modified`: Content was edited.
  - `Added`: A new file appeared.
  - `Deleted`: A file was removed.
- Download reports as Markdown or JSON.

### 5. Hash Experiment Lab
- Change just 1 letter in a sentence and watch roughly half of the 256 bits instantly change!
- Interactive 16x16 visual grid showing changed bits in red.

### 6. File Check History
- Keeps a local list of files you checked so you don't lose track.
- Export your history as a CSV spreadsheet or JSON file.

### 7. Terminal Tool (`integrity-check`)
For students and terminal users who want to run checks from the command line:

```bash
# 1. Check an installer against known apps
node cli/bin/integrity-check.js verify ubuntu-24.04-desktop-amd64.iso

# 2. Get the hash of any file
node cli/bin/integrity-check.js hash ./my-file.zip

# 3. Compare two hashes
node cli/bin/integrity-check.js compare <hash1> <hash2>

# 4. Save a folder snapshot
node cli/bin/integrity-check.js baseline create ./my-folder --out snapshot.json

# 5. Check what changed in the folder
node cli/bin/integrity-check.js baseline audit ./my-folder --baseline snapshot.json
```

---

## 💻 Quickstart (Run on your computer)

```bash
# 1. Clone the repository
git clone https://github.com/CipherVicky/file-integrity-checker-Public-1.git
cd file-integrity-checker-Public-1

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

---

## ☁️ Deploy to Vercel

Click below to deploy your own copy for free on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CipherVicky/file-integrity-checker-Public-1)

---

## 📄 License

MIT License. Created by [CipherVicky](https://github.com/CipherVicky).
