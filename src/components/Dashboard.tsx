import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileSearch, 
  CheckCircle2, 
  GitCompare, 
  FolderSync, 
  Activity, 
  Database, 
  History, 
  Lock, 
  Zap, 
  Cpu, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertTriangle,
  UploadCloud,
  TerminalSquare
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { formatBytes, formatTimestamp, hashFileProgressive } from '../utils/crypto';
import { lookupHashInDatabase, findPotentialMismatch } from '../data/trustedDatabase';
import { saveHistoryEntry } from '../utils/history';
import { logScanToSupabase } from '../utils/supabase';
import { FileScanResult, TrustedRecord } from '../types';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  trustedCount: number;
  historyCount: number;
  onQuickScanResult: (result: FileScanResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  trustedCount,
  historyCount,
  onQuickScanResult
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [quickResult, setQuickResult] = useState<FileScanResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFile = async (file: File) => {
    setCurrentFile(file);
    setIsHashing(true);
    setProgress(0);
    setQuickResult(null);

    try {
      const { hash, timeMs } = await hashFileProgressive(file, (pct) => {
        setProgress(pct);
      });

      const matched = lookupHashInDatabase(hash);
      const potentialMismatch = !matched ? findPotentialMismatch(file.name, hash) : undefined;

      const status = matched 
        ? 'VERIFIED' 
        : potentialMismatch 
          ? 'HASH_MISMATCH' 
          : 'UNKNOWN';

      const scanResult: FileScanResult = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        lastModified: file.lastModified,
        sha256: hash,
        computedTimeMs: timeMs,
        status,
        matchedRecord: matched,
        potentialMismatchRecord: potentialMismatch
      };

      setQuickResult(scanResult);
      onQuickScanResult(scanResult);

      // Save to local audit history
      const saved = saveHistoryEntry({
        fileName: scanResult.fileName,
        fileSize: scanResult.fileSize,
        sha256: scanResult.sha256,
        status: scanResult.status,
        matchedSoftware: matched?.software || potentialMismatch?.software,
        version: matched?.version || potentialMismatch?.version,
        vendor: matched?.vendor || potentialMismatch?.vendor
      });

      // Attempt async cloud logging if configured
      logScanToSupabase(saved);
    } catch (err) {
      console.error('Hashing error:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Security Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-4">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>100% Client-Side Cryptographic Execution • Zero File Uploads</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            Cryptographic Integrity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
              & Software Supply-Chain Verification
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Verify downloaded installers, system ISOs, firmware, and mission-critical binaries against genuine
            authoritative vendor signatures. Compute collision-resistant 256-bit cryptographic fingerprints entirely in your browser.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('hasher')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm font-mono shadow-lg shadow-cyan-500/25 transition-all"
            >
              <FileSearch className="w-4 h-4" />
              <span>Full File Hasher</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('verifier')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs sm:text-sm font-mono transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Software Verifier</span>
            </button>
            <button
              onClick={() => setActiveTab('baseline')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm font-mono transition-all"
            >
              <FolderSync className="w-4 h-4 text-slate-400" />
              <span>Directory Drift Monitor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Cryptographic Digest</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-cyan-300">SHA-256</p>
          <span className="text-[11px] text-slate-400">256-bit / 32-byte digest</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Trusted Records</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-emerald-300">{trustedCount}</p>
          <span className="text-[11px] text-slate-400">Official vendor hashes</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Scans Logged</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-blue-300">{historyCount}</p>
          <span className="text-[11px] text-slate-400">Audit session records</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Collision Boundary</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-amber-300">2¹²⁸ Ops</p>
          <span className="text-[11px] text-slate-400">Pre-image resistant</span>
        </div>
      </div>

      {/* Quick Verification Dropzone */}
      <div className="rounded-xl bg-slate-900/90 border border-cyan-500/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              QUICK VERIFY DROPZONE
            </h2>
            <p className="text-xs text-slate-400">
              Drop any file to compute SHA-256 and query the trusted software catalog instantly.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Streaming Engine
          </span>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20'
              : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/40'
          }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files && files[0]) handleFile(files[0]);
            };
            input.click();
          }}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Drop a file here or <span className="text-cyan-400 underline decoration-cyan-400/40">Browse Files</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Any format supported: ISO, EXE, DMG, ZIP, TAR.GZ, PDF, BIN. Handled progressively in 2MB memory blocks.
              </p>
            </div>
          </div>
        </div>

        {/* Hashing Progress Bar */}
        {isHashing && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-cyan-500/30">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-cyan-400">Hashing: {currentFile?.name}</span>
              <span className="text-slate-300">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Scan Result Display */}
        {quickResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            {/* Status Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {quickResult.status === 'VERIFIED' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    VERIFIED – Exact Match with Official Vendor Hash
                  </div>
                )}
                {quickResult.status === 'HASH_MISMATCH' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    HASH MISMATCH – File Differs From Trusted Original
                  </div>
                )}
                {quickResult.status === 'UNKNOWN' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    UNKNOWN FILE – No Matching Trusted Hash Found
                  </div>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">
                Computed in {quickResult.computedTimeMs}ms
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block">File Name</span>
                <span className="text-slate-200 font-semibold truncate block" title={quickResult.fileName}>
                  {quickResult.fileName}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block">File Size</span>
                <span className="text-slate-200 font-semibold">
                  {formatBytes(quickResult.fileSize)} ({quickResult.fileSize.toLocaleString()} bytes)
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block">Last Modified</span>
                <span className="text-slate-200 font-semibold">
                  {formatTimestamp(quickResult.lastModified)}
                </span>
              </div>
            </div>

            {/* Full Monospace SHA-256 with Copy */}
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">Computed SHA-256 Hash</span>
                <button
                  onClick={() => handleCopy(quickResult.sha256)}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
              <p className="font-mono text-xs sm:text-sm text-cyan-300 break-all select-all font-semibold tracking-wide">
                {quickResult.sha256}
              </p>
            </div>

            {/* Matched Details */}
            {quickResult.matchedRecord && (
              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
                <div className="font-bold text-emerald-400 mb-1">Vendor Identity Authenticated:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Software:</span> {quickResult.matchedRecord.software}</div>
                  <div><span className="text-slate-500">Version:</span> {quickResult.matchedRecord.version}</div>
                  <div><span className="text-slate-500">Platform:</span> {quickResult.matchedRecord.platform}</div>
                  <div><span className="text-slate-500">Source:</span> {quickResult.matchedRecord.source}</div>
                </div>
              </div>
            )}

            {/* Potential Mismatch Details */}
            {quickResult.potentialMismatchRecord && (
              <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                <div className="font-bold text-red-400 mb-1">Potential Tampering / Version Discrepancy:</div>
                <p>
                  A registered package named <strong>"{quickResult.potentialMismatchRecord.file_name}"</strong> was found in the database, but its expected SHA-256 hash does not match this file.
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  Expected: {quickResult.potentialMismatchRecord.sha256}
                </p>
              </div>
            )}

            {/* Unknown Advisory Notice */}
            {quickResult.status === 'UNKNOWN' && (
              <div className="p-3.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Security Notice: Unknown File ≠ Malicious File
                </div>
                <p>
                  No authoritative checksum was found in the built-in catalog for this specific file.
                  This is common for private documents, customized builds, or unindexed releases. SHA-256 verifies identity and untampered transmission, not whether executable code is inherently benign.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature Exploration Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white font-mono">CORE CAPABILITIES</h2>
          <p className="text-xs text-slate-400">Access advanced integrity verification, drift detection, and cryptographic analysis tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab('hasher')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              General File Hasher
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Calculate SHA-256 for any local file of arbitrary size. Inspect file metadata and copy checksums with zero network footprint.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('verifier')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              Software Verifier
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Compare installers against genuine vendor hashes for Ubuntu, Debian, Kali, Firefox, VS Code, Git, Wireshark, VLC, and more.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('compare')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              Compare Checksums
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Safe, case-insensitive comparison with character-by-character hexadecimal diff highlighting to spot slight discrepancies.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('baseline')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
              <FolderSync className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              Baseline Drift Monitor
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Take cryptographic snapshots of directories and detect tampered, modified, newly added, or deleted files. Export Markdown/JSON audits.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('avalanche')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              Avalanche Lab
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Witness the Strict Avalanche Criterion (SAC): change 1 single bit in an input string and observe ~50% of the 256 output bits flip randomly.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('education')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-105 transition-transform">
              <TerminalSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              Security Hub & CLI
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Learn cryptanalysis concepts, understand threat models (tampering vs malware), and use the bundled Node.js companion CLI tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
