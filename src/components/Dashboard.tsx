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
  Sparkles, 
  Cpu, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertTriangle,
  UploadCloud,
  GraduationCap
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

      // Save to local check history
      const saved = saveHistoryEntry({
        fileName: scanResult.fileName,
        fileSize: scanResult.fileSize,
        sha256: scanResult.sha256,
        status: scanResult.status,
        matchedSoftware: matched?.software || potentialMismatch?.software,
        version: matched?.version || potentialMismatch?.version,
        vendor: matched?.vendor || potentialMismatch?.vendor
      });

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
      {/* Friendly Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono mb-4">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>100% Private & Local • Files Never Leave Your Device</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Check If Your Files & Downloads <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
              Are Safe, Real & Untouched
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Every file has a unique <strong>SHA-256 fingerprint</strong>. If someone changes even one letter in a file, or if a download gets corrupted, the fingerprint changes completely. Drop any file here to check it in seconds.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('hasher')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm font-mono shadow-lg shadow-cyan-500/25 transition-all"
            >
              <FileSearch className="w-4 h-4" />
              <span>Check Any File</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('verifier')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold text-xs sm:text-sm font-mono transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Check Known App</span>
            </button>
            <button
              onClick={() => setActiveTab('baseline')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs sm:text-sm font-mono transition-all"
            >
              <FolderSync className="w-4 h-4 text-slate-400" />
              <span>Track Folder Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Beginner-friendly Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Fingerprint Type</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-cyan-300">SHA-256</p>
          <span className="text-[11px] text-slate-400">Unique 64-character code</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Known Apps</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-emerald-300">{trustedCount}</p>
          <span className="text-[11px] text-slate-400">Original software saved</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Checks Done</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-blue-300">{historyCount}</p>
          <span className="text-[11px] text-slate-400">Files checked so far</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Tamper Proof</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-amber-300">100% Solid</p>
          <span className="text-[11px] text-slate-400">Cannot be faked or guessed</span>
        </div>
      </div>

      {/* Quick Dropzone */}
      <div className="rounded-xl bg-slate-900/90 border border-cyan-500/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              QUICK FILE CHECK
            </h2>
            <p className="text-xs text-slate-400">
              Drop any file here to calculate its SHA-256 code and check if it matches an original app.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Fast & Private
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
                Works with any file type: documents, installers, images, zip files, or games.
              </p>
            </div>
          </div>
        </div>

        {/* Hashing Progress Bar */}
        {isHashing && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-cyan-500/30">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-cyan-400">Reading: {currentFile?.name}</span>
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

        {/* Scan Result Display */}
        {quickResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            {/* Status Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                {quickResult.status === 'VERIFIED' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    VERIFIED – Hash matches the trusted original.
                  </div>
                )}
                {quickResult.status === 'HASH_MISMATCH' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    HASH MISMATCH – File differs from the trusted version.
                  </div>
                )}
                {quickResult.status === 'UNKNOWN' && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    UNVERIFIED – No matching trusted hash found.
                  </div>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">
                Done in {quickResult.computedTimeMs}ms
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
                  {formatBytes(quickResult.fileSize)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-500 block">Last Saved</span>
                <span className="text-slate-200 font-semibold">
                  {formatTimestamp(quickResult.lastModified)}
                </span>
              </div>
            </div>

            {/* Monospace SHA-256 with Copy */}
            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">File SHA-256 Hash</span>
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
                <div className="font-bold text-emerald-400 mb-1">Original Software Found:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                  <div><span className="text-slate-500">App:</span> {quickResult.matchedRecord.software}</div>
                  <div><span className="text-slate-500">Version:</span> {quickResult.matchedRecord.version}</div>
                  <div><span className="text-slate-500">Platform:</span> {quickResult.matchedRecord.platform}</div>
                  <div><span className="text-slate-500">Developer:</span> {quickResult.matchedRecord.vendor}</div>
                </div>
              </div>
            )}

            {/* Potential Mismatch Details */}
            {quickResult.potentialMismatchRecord && (
              <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                <div className="font-bold text-red-400 mb-1">File Does Not Match Original:</div>
                <p>
                  We found a known file named <strong>"{quickResult.potentialMismatchRecord.file_name}"</strong>, but its hash code is different. It may have been modified, corrupted, or it might be a different version.
                </p>
              </div>
            )}

            {/* Unknown Advisory Notice */}
            {quickResult.status === 'UNKNOWN' && (
              <div className="p-3.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Note: Unknown Does NOT Mean Harmful
                </div>
                <p>
                  This file is not in our built-in list of popular apps. This is normal for private files, photos, documents, or personal programs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature Exploration Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white font-mono">TOOLS & FEATURES</h2>
          <p className="text-xs text-slate-400">Choose a tool below to check files, compare codes, or monitor folders.</p>
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
              1. File Hash Checker
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Calculate the unique 64-character SHA-256 code for any file. Copy the code or save a checksum file.
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
              2. Check Known Software
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Check if an installer you downloaded matches the official copy from Ubuntu, Firefox, VS Code, Git, or VLC.
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
              3. Compare Two Hashes
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Paste two hashes side-by-side to see if they match. We will highlight any letter differences in red.
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
              4. Track Folder Changes
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Save a list of your files today. Check later to immediately see which files were modified, added, or deleted.
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
              5. The Hash Experiment Lab
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Change just 1 character in a sentence and watch half of the 256 bits instantly flip to something completely different.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('education')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              6. Learn the Basics
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Easy explanations of what hashes are, why they are used, and simple tips to stay safe online.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
