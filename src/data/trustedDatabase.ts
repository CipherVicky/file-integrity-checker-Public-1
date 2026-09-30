import { TrustedRecord } from '../types';

export const DATABASE_VERSION = "2026.09.30-STABLE";
export const DATABASE_LAST_UPDATED = "2026-09-30";
export const DATABASE_SOURCE_AUTHORITY = "Official Vendor Cryptographic Signatures & Release Feeds";

export const DEFAULT_TRUSTED_RECORDS: TrustedRecord[] = [
  // --- OPERATING SYSTEMS ---
  {
    id: "ubuntu-24-04-4-desktop-amd64",
    software: "Ubuntu Desktop LTS",
    vendor: "Canonical",
    version: "24.04.4 LTS (Noble Numbat)",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "ubuntu-24.04.4-desktop-amd64.iso",
    sha256: "3a4c9877b483ab46d7c3fbe165a0db275e1ae3cfe56a5657e5a47c2f99a99d1e",
    source: "Ubuntu Official Release SHA256SUMS",
    source_url: "https://releases.ubuntu.com/24.04/SHA256SUMS",
    release_date: "2024-08-29",
    notes: "Official Ubuntu 24.04 desktop installation media"
  },
  {
    id: "ubuntu-24-04-3-desktop-amd64",
    software: "Ubuntu Desktop LTS",
    vendor: "Canonical",
    version: "24.04.3 LTS",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "ubuntu-24.04.3-desktop-amd64.iso",
    sha256: "faabcf33ae53976d2b8207a001ff32f4e5daae013505ac7188c9ea63988f8328",
    source: "Ubuntu Official Release SHA256SUMS",
    source_url: "https://releases.ubuntu.com/24.04/SHA256SUMS",
    release_date: "2024-06-12",
    notes: "Canonical verified release checksum"
  },
  {
    id: "ubuntu-22-04-5-desktop-amd64",
    software: "Ubuntu Desktop LTS",
    vendor: "Canonical",
    version: "22.04.5 LTS (Jammy Jellyfish)",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "ubuntu-22.04.5-desktop-amd64.iso",
    sha256: "bfd1cee02bc4f35db939e69b934ba49a39a378797ce9aee20f6e3e3e728fefbf",
    source: "Ubuntu Official Release SHA256SUMS",
    source_url: "https://releases.ubuntu.com/22.04/SHA256SUMS",
    release_date: "2024-09-12",
    notes: "Official long-term support release"
  },
  {
    id: "debian-13-7-0-amd64-netinst",
    software: "Debian GNU/Linux",
    vendor: "Debian Project",
    version: "13.7.0 (amd64)",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "debian-13.7.0-amd64-netinst.iso",
    sha256: "a7ef94ac2fb9a7fec454552abd629b7cc9d5155c886165a45649f5ce6167e355",
    source: "Debian CD Image Archive SHA256SUMS",
    source_url: "https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA256SUMS",
    release_date: "2024-09-07",
    notes: "Debian minimal network installer"
  },
  {
    id: "kali-linux-2026-2-installer-amd64",
    software: "Kali Linux",
    vendor: "OffSec",
    version: "2026.2",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "kali-linux-2026.2-installer-amd64.iso",
    sha256: "6dbefacc95e3b556c19c48e8bae39b8b505e2d3a1aba0bfb7ab62b036c3d2ba3",
    source: "OffSec Kali Image Repository",
    source_url: "https://cdimage.kali.org/current/SHA256SUMS",
    release_date: "2026-06-18",
    notes: "Penetration testing & ethical hacking distribution"
  },
  {
    id: "archlinux-2026-09-01-x86-64",
    software: "Arch Linux",
    vendor: "Arch Linux Team",
    version: "2026.09.01",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "archlinux-x86_64.iso",
    sha256: "be8458032f8105e60ee2a3067f950b6e3c007ee51b38dac50e8b48e765561c91",
    source: "Arch Linux Official Mirror SHA256",
    source_url: "https://geo.mirror.pkgbuild.com/iso/latest/sha256sums.txt",
    release_date: "2026-09-01",
    notes: "Monthly rolling release media"
  },
  {
    id: "fedora-workstation-live-44-x86-64",
    software: "Fedora Workstation",
    vendor: "Fedora Project / Red Hat",
    version: "44-1.7",
    category: "Operating Systems",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "Fedora-Workstation-Live-44-1.7.x86_64.iso",
    file_size: 2851612672,
    sha256: "1620295f6a00c27c3208f0c00b8ece4eab1ec69b9002152d97488bf26a426ddf",
    source: "Fedora Official PGP Signed CHECKSUM",
    source_url: "https://download.fedoraproject.org/pub/fedora/linux/releases/44/Workstation/x86_64/iso/Fedora-Workstation-44-1.7-x86_64-CHECKSUM",
    release_date: "2026-04-20",
    notes: "OpenPGP key signed workstation image"
  },

  // --- BROWSERS ---
  {
    id: "firefox-131-0-win64",
    software: "Mozilla Firefox",
    vendor: "Mozilla",
    version: "131.0",
    category: "Browsers",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "Firefox Setup 131.0.exe",
    sha256: "37401b29a713758a4de5550d0a82e7bb53e97a83ae81ff732951974a0dfafde7",
    source: "Mozilla Archive SHA256SUMS",
    source_url: "https://archive.mozilla.org/pub/firefox/releases/131.0/SHA256SUMS",
    release_date: "2024-10-01",
    notes: "Official Windows 64-bit installer"
  },
  {
    id: "firefox-131-0-linux64",
    software: "Mozilla Firefox",
    vendor: "Mozilla",
    version: "131.0",
    category: "Browsers",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "firefox-131.0.tar.bz2",
    sha256: "4ca8504a62a31472ecb8c3a769d4301dd4ac692d4cc5d51b8fe2cf41e7b11106",
    source: "Mozilla Archive SHA256SUMS",
    source_url: "https://archive.mozilla.org/pub/firefox/releases/131.0/SHA256SUMS",
    release_date: "2024-10-01",
    notes: "Official Linux 64-bit tarball release"
  },
  {
    id: "firefox-131-0-mac",
    software: "Mozilla Firefox",
    vendor: "Mozilla",
    version: "131.0",
    category: "Browsers",
    platform: "macOS",
    architecture: "universal",
    file_name: "Firefox 131.0.dmg",
    sha256: "cd243b44746f56ee2042572cccab2736c0c6d419f85f90ad163a4ba04979ccb2",
    source: "Mozilla Archive SHA256SUMS",
    source_url: "https://archive.mozilla.org/pub/firefox/releases/131.0/SHA256SUMS",
    release_date: "2024-10-01",
    notes: "Official macOS Universal installer disk image"
  },
  {
    id: "brave-browser-1-96-59-win64",
    software: "Brave Browser",
    vendor: "Brave Software",
    version: "1.96.59",
    category: "Browsers",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "BraveBrowserStandaloneSetup.exe",
    sha256: "825237818b6800270cf3be49b5c692992f088b6ab7eacd44f46e1745952e615d",
    source: "Brave GitHub Official Release Checksum",
    source_url: "https://github.com/brave/brave-browser/releases/tag/v1.96.59",
    release_date: "2026-09-24",
    notes: "Standalone offline installer"
  },
  {
    id: "brave-browser-1-96-59-linux-amd64",
    software: "Brave Browser",
    vendor: "Brave Software",
    version: "1.96.59",
    category: "Browsers",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "brave-browser-1.96.59-linux-amd64.zip",
    sha256: "ee36d0fb939ebdf1922d47d7b4cb8879507733b2a76605a31bfe9dede3297139",
    source: "Brave Browser GitHub Release SHA256",
    source_url: "https://github.com/brave/brave-browser/releases/download/v1.96.59/brave-browser-1.96.59-linux-amd64.zip.sha256",
    release_date: "2026-09-24",
    notes: "Linux portable binary zip distribution"
  },

  // --- DEVELOPER TOOLS ---
  {
    id: "vscode-1-140-0-win-x64",
    software: "Visual Studio Code",
    vendor: "Microsoft",
    version: "1.140.0",
    category: "Developer Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "VSCodeUserSetup-x64-1.140.0.exe",
    sha256: "b66449d7acf503f556b5a50593717b0092f48df1f62ce38a7dba5b93da0b425e",
    source: "Microsoft VS Code Official Update Feed",
    source_url: "https://update.code.visualstudio.com/api/update/win32-x64-user/stable/0000000000000000000000000000000000000000",
    release_date: "2026-09-25",
    notes: "Windows 64-bit user installer"
  },
  {
    id: "vscode-1-140-0-linux-deb",
    software: "Visual Studio Code",
    vendor: "Microsoft",
    version: "1.140.0",
    category: "Developer Tools",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "code_1.140.0-1790759618_amd64.deb",
    sha256: "e5ddfa528d68ce907c92cba18ed4edd7420874fe828cbaaf8e4484aa33530c3b",
    source: "Microsoft VS Code Official Update Feed",
    source_url: "https://update.code.visualstudio.com/api/update/linux-deb-x64/stable/0000000000000000000000000000000000000000",
    release_date: "2026-09-25",
    notes: "Debian/Ubuntu 64-bit package"
  },
  {
    id: "vscode-1-140-0-darwin-universal",
    software: "Visual Studio Code",
    vendor: "Microsoft",
    version: "1.140.0",
    category: "Developer Tools",
    platform: "macOS",
    architecture: "universal",
    file_name: "VSCode-darwin-universal.zip",
    sha256: "9c5abc51418518f95443d3db586887caa6d195c69dea83cd812ca32576f44a46",
    source: "Microsoft VS Code Official Update Feed",
    source_url: "https://update.code.visualstudio.com/api/update/darwin-universal/stable/0000000000000000000000000000000000000000",
    release_date: "2026-09-25",
    notes: "Apple Silicon & Intel universal binary"
  },
  {
    id: "git-2-46-2-win64",
    software: "Git for Windows",
    vendor: "Git for Windows Team",
    version: "2.46.2",
    category: "Developer Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "Git-2.46.2-64-bit.exe",
    sha256: "eac009616605ec7207fbe1990627f453b826a1f23a33d54d9b0be8f4b0cb2094",
    source: "Git for Windows Release Manifest",
    source_url: "https://github.com/git-for-windows/git/releases/tag/v2.46.2.windows.1",
    release_date: "2024-09-23",
    notes: "Official Git 64-bit Windows setup installer"
  },
  {
    id: "git-2-46-2-win32",
    software: "Git for Windows",
    vendor: "Git for Windows Team",
    version: "2.46.2",
    category: "Developer Tools",
    platform: "Windows",
    architecture: "x86",
    file_name: "Git-2.46.2-32-bit.exe",
    sha256: "6ca9019abb3aa963d81414d46fc054707efdf36d68b946ffdde6af8a6a374e46",
    source: "Git for Windows Release Manifest",
    source_url: "https://github.com/git-for-windows/git/releases/tag/v2.46.2.windows.1",
    release_date: "2024-09-23",
    notes: "Official Git 32-bit Windows setup installer"
  },
  {
    id: "nodejs-20-18-0-win64",
    software: "Node.js LTS",
    vendor: "Node.js Foundation / OpenJS",
    version: "20.18.0 LTS (Iron)",
    category: "Developer Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "node-v20.18.0-x64.msi",
    sha256: "93d1d30341d7d38b7a8f3ab0fa3be1f9e6436b90338b2bd8b8af4e80d00bd036",
    source: "Node.js Official SHASUMS256.txt",
    source_url: "https://nodejs.org/dist/v20.18.0/SHASUMS256.txt",
    release_date: "2024-10-03",
    notes: "Windows 64-bit MSI installer"
  },
  {
    id: "nodejs-20-18-0-linux64",
    software: "Node.js LTS",
    vendor: "Node.js Foundation / OpenJS",
    version: "20.18.0 LTS (Iron)",
    category: "Developer Tools",
    platform: "Linux",
    architecture: "x86_64",
    file_name: "node-v20.18.0-linux-x64.tar.xz",
    sha256: "4543670b589593f8fa5f106111fd5139081da42bb165a9239f05195e405f240a",
    source: "Node.js Official SHASUMS256.txt",
    source_url: "https://nodejs.org/dist/v20.18.0/SHASUMS256.txt",
    release_date: "2024-10-03",
    notes: "Linux x64 official binary release archive"
  },
  {
    id: "nodejs-20-18-0-darwin64",
    software: "Node.js LTS",
    vendor: "Node.js Foundation / OpenJS",
    version: "20.18.0 LTS (Iron)",
    category: "Developer Tools",
    platform: "macOS",
    architecture: "x86_64",
    file_name: "node-v20.18.0-darwin-x64.tar.xz",
    sha256: "63e150a3bb4f31743257d8597262c6b5f0a2356e7c42002e29d5f7d1bf161f08",
    source: "Node.js Official SHASUMS256.txt",
    source_url: "https://nodejs.org/dist/v20.18.0/SHASUMS256.txt",
    release_date: "2024-10-03",
    notes: "macOS x64 prebuilt release tarball"
  },

  // --- SECURITY TOOLS ---
  {
    id: "wireshark-4-6-9-win64",
    software: "Wireshark",
    vendor: "Wireshark Foundation",
    version: "4.6.9",
    category: "Security Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "Wireshark-4.6.9-x64.exe",
    file_size: 97931232,
    sha256: "bf9b5ce8a89f244c376a9b1a946276eaa06463dde3e33069a34d7f102f5878cf",
    source: "Wireshark PGP Signed Signatures File",
    source_url: "https://www.wireshark.org/download/SIGNATURES-4.6.9.txt",
    release_date: "2026-09-23",
    notes: "PGP signed network packet analyzer installer"
  },
  {
    id: "wireshark-4-6-9-win64-msi",
    software: "Wireshark",
    vendor: "Wireshark Foundation",
    version: "4.6.9",
    category: "Security Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "Wireshark-4.6.9-x64.msi",
    file_size: 80433152,
    sha256: "1975dfc96581a9b674fda3f41ac1585963b4ba52ea9459f3b6d9cedfac3a7217",
    source: "Wireshark PGP Signed Signatures File",
    source_url: "https://www.wireshark.org/download/SIGNATURES-4.6.9.txt",
    release_date: "2026-09-23",
    notes: "Enterprise Windows MSI package"
  },
  {
    id: "nmap-7-95-setup",
    software: "Nmap Security Scanner",
    vendor: "Insecure.Org / Gordon Lyon",
    version: "7.95",
    category: "Security Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "nmap-7.95-setup.exe",
    sha256: "c59b51d15b5965f27db4c5bbd21793ad6b492c8c751836ba8bd43829d791146e",
    source: "Nmap Official Cryptographic Digest",
    source_url: "https://nmap.org/dist/sigs/nmap-7.95-setup.exe.digest.txt",
    release_date: "2024-04-22",
    notes: "Official Windows network exploration and security auditing tool"
  },
  {
    id: "7zip-26-03-x64",
    software: "7-Zip",
    vendor: "Igor Pavlov",
    version: "26.03",
    category: "Security Tools",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "7z2603-x64.exe",
    sha256: "0859c524b8a63551848f0c246abddcb1d0b7b656b0fbfe879f8d85e61a9e6edd",
    source: "7-Zip Official GitHub Release",
    source_url: "https://github.com/ip7z/7zip/releases/tag/26.03",
    release_date: "2026-03-15",
    notes: "High-compression archiver utility"
  },

  // --- UTILITIES ---
  {
    id: "notepadpp-8-6-9-x64",
    software: "Notepad++",
    vendor: "Don Ho",
    version: "8.6.9",
    category: "Utilities",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "npp.8.6.9.Installer.x64.exe",
    sha256: "3fd473e00fa464f18af2dd930cf5bdba0709fdd841631598acccdb04c32a5cd2",
    source: "Notepad++ Official SHA-256 Release Signatures",
    source_url: "https://github.com/notepad-plus-plus/notepad-plus-plus/releases/tag/v8.6.9",
    release_date: "2024-07-14",
    notes: "Popular source code and text editor"
  },
  {
    id: "notepadpp-8-6-9-x86",
    software: "Notepad++",
    vendor: "Don Ho",
    version: "8.6.9",
    category: "Utilities",
    platform: "Windows",
    architecture: "x86",
    file_name: "npp.8.6.9.Installer.exe",
    sha256: "5de8b54409e62ec2ab2ca37635a50059a846e73de80f6e07967acf70ecaec406",
    source: "Notepad++ Official SHA-256 Release Signatures",
    source_url: "https://github.com/notepad-plus-plus/notepad-plus-plus/releases/tag/v8.6.9",
    release_date: "2024-07-14",
    notes: "32-bit Windows installer"
  },
  {
    id: "vlc-3-0-21-win64",
    software: "VLC Media Player",
    vendor: "VideoLAN Organization",
    version: "3.0.21 (Vetinari)",
    category: "Utilities",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "vlc-3.0.21-win64.exe",
    sha256: "9742689a50e96ddc04d80ceff046b28da2beefd617be18166f8c5e715ec60c59",
    source: "VideoLAN Official Download Repository",
    source_url: "https://download.videolan.org/pub/videolan/vlc/3.0.21/win64/vlc-3.0.21-win64.exe.sha256",
    release_date: "2024-06-07",
    notes: "Open-source cross-platform multimedia player"
  },
  {
    id: "libreoffice-26-2-6-win64",
    software: "LibreOffice",
    vendor: "The Document Foundation",
    version: "26.2.6",
    category: "Utilities",
    platform: "Windows",
    architecture: "x86_64",
    file_name: "LibreOffice_26.2.6_Win_x86-64.msi",
    file_size: 373252096,
    sha256: "f9877032fd908beb9c0ddf06df4af5c2e85f419c42e14876c4cce5aae5fb2660",
    source: "Document Foundation Official Mirrorbrain Checksum",
    source_url: "https://download.documentfoundation.org/libreoffice/stable/26.2.6/win/x86_64/LibreOffice_26.2.6_Win_x86-64.msi.mirrorlist",
    release_date: "2026-09-03",
    notes: "Open-source office productivity suite"
  }
];

const LOCAL_STORAGE_KEY_CUSTOM_HASHES = 'fic_custom_trusted_hashes_v1';

export function getCustomTrustedRecords(): TrustedRecord[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_HASHES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomTrustedRecord(record: Omit<TrustedRecord, 'id' | 'is_custom'>): TrustedRecord {
  const customRecords = getCustomTrustedRecords();
  const newRecord: TrustedRecord = {
    ...record,
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    is_custom: true,
    sha256: record.sha256.toLowerCase().trim()
  };
  customRecords.push(newRecord);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_HASHES, JSON.stringify(customRecords));
  }
  return newRecord;
}

export function deleteCustomTrustedRecord(id: string): void {
  const customRecords = getCustomTrustedRecords().filter(r => r.id !== id);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_HASHES, JSON.stringify(customRecords));
  }
}

export function getAllTrustedRecords(): TrustedRecord[] {
  return [...DEFAULT_TRUSTED_RECORDS, ...getCustomTrustedRecords()];
}

export function lookupHashInDatabase(hash: string): TrustedRecord | undefined {
  const normalized = hash.toLowerCase().trim();
  const all = getAllTrustedRecords();
  return all.find(r => r.sha256.toLowerCase() === normalized);
}

export function findPotentialMismatch(fileName: string, hash: string): TrustedRecord | undefined {
  const normalizedHash = hash.toLowerCase().trim();
  const cleanName = fileName.toLowerCase().trim();
  const all = getAllTrustedRecords();

  const exactNameDiffHash = all.find(r => 
    r.file_name.toLowerCase() === cleanName && 
    r.sha256.toLowerCase() !== normalizedHash
  );
  if (exactNameDiffHash) return exactNameDiffHash;

  return all.find(r => {
    const baseRecordName = r.file_name.toLowerCase().replace(/[-_.]/g, '');
    const baseUploadName = cleanName.replace(/[-_.]/g, '');
    return (baseUploadName.includes(baseRecordName) || baseRecordName.includes(baseUploadName)) &&
           r.sha256.toLowerCase() !== normalizedHash;
  });
}
