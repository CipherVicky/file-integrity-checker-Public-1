import React, { useState } from 'react';
import { 
  FileSearch, 
  UploadCloud, 
  Copy, 
  Check, 
  HardDrive, 
  Calendar, 
  FileType, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  FileCode,
  Download
} from 'lucide-react';
import { formatBytes, formatTimestamp, hashFileProgressive } from '../utils/crypto';
import { lookupHashInDatabase, findPotentialMismatch } from '../data/trustedDatabase';
import { saveHistoryEntry } from '../utils/history';
import { logScanToSupabase } from '../utils/supabase';
import { FileScanResult } from '../types';

export const FileHasher: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bytesProcessed, setBytesProcessed] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [result, setResult] = useState<FileScanResult | null>(null);
  const [copied, setCopied] = useState(false);

  const processFile = async (file: File) => {
    setCurrentFile(file);
    setIsHashing(true);
    setProgress(0);
    setBytesProcessed(0);
    setResult(null);

    try {
      const { hash, timeMs } = await hashFileProgressive(file, (pct, bytes) => {
        setProgress(pct);
        setBytesProcessed(bytes);
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

      setResult(scanResult);

      // Save to audit history
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
      console.error('Error computing hash:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadChecksumFile = () => {
    if (!result) return;
    const content = `${result.sha256}  ${result.fileName}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName}.sha256`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Module Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-cyan-400" />
          GENERAL FILE INTEGRITY CHECKER
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload any file to calculate its SHA-256 cryptographic digest locally. View full metadata, copy checksums, and export .sha256 verification files.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-slate-900/50 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
            : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900/80'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) processFile(files[0]);
          };
          input.click();
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Drop a file here or <span className="text-cyan-400 underline decoration-cyan-400/40">Browse Files</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports files of any size (ISOs, executables, archives, raw documents).
            </p>
            <p className="text-[11px] text-cyan-400/80 font-mono mt-2">
              🔒 100% Client-Side In-Memory Execution • The file never leaves your computer
            </p>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      {isHashing && currentFile && (
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-cyan-300 font-bold truncate max-w-md">
              Computing SHA-256 for: {currentFile.name}
            </span>
            <span className="text-slate-300">{progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
            <span>Processed: {formatBytes(bytesProcessed)}</span>
            <span>Total: {formatBytes(currentFile.size)}</span>
          </div>
        </div>
      )}

      {/* File Information Card */}
      {result && (
        <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block">Verification Status</span>
              <div className="flex items-center gap-2 mt-1">
                {result.status === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    VERIFIED – Exact Match With Trusted Reference
                  </span>
                )}
                {result.status === 'HASH_MISMATCH' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    HASH MISMATCH – Discrepancy Found Against Known Catalog
                  </span>
                )}
                {result.status === 'UNKNOWN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    UNVERIFIED – No Matching Trusted Hash Found
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadChecksumFile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Download standard sha256sum verification file"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save .sha256</span>
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>File Name</span>
              </div>
              <p className="text-sm font-mono text-white font-semibold truncate" title={result.fileName}>
                {result.fileName}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>File Size</span>
              </div>
              <p className="text-sm font-mono text-white font-semibold">
                {formatBytes(result.fileSize)}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">
                {result.fileSize.toLocaleString()} bytes
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                <FileType className="w-3.5 h-3.5 text-cyan-400" />
                <span>File Type</span>
              </div>
              <p className="text-sm font-mono text-white font-semibold truncate" title={result.fileType}>
                {result.fileType || 'binary/raw'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Last Modified</span>
              </div>
              <p className="text-xs font-mono text-white font-semibold">
                {formatTimestamp(result.lastModified)}
              </p>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Hashed in {result.computedTimeMs}ms
              </span>
            </div>
          </div>

          {/* SHA-256 Checksum Container */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                  SHA-256 Checksum
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  64 Hex Characters • 256 Bits
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(result.sha256)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <code className="text-sm sm:text-base font-mono text-cyan-300 break-all select-all font-semibold tracking-wider block">
                {result.sha256}
              </code>
            </div>
          </div>

          {/* Security Principle Note */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="text-slate-300 font-bold uppercase tracking-wider block font-mono">
              Cryptographic Integrity Guarantee:
            </span>
            <p>
              A SHA-256 hash acts as a unique digital fingerprint. If even a single bit in this file is modified, corrupted, or infected by malware, the resulting SHA-256 digest will change drastically (Avalanche Effect).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
