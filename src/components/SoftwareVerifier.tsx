import React, { useState } from 'react';
import { 
  CheckCircle2, 
  UploadCloud, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  FileCode, 
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatBytes, formatTimestamp, hashFileProgressive } from '../utils/crypto';
import { getAllTrustedRecords, lookupHashInDatabase, findPotentialMismatch } from '../data/trustedDatabase';
import { saveHistoryEntry } from '../utils/history';
import { logScanToSupabase } from '../utils/supabase';
import { FileScanResult, TrustedRecord } from '../types';

export const SoftwareVerifier: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<FileScanResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('auto');

  const allRecords = getAllTrustedRecords();

  const handleVerify = async (file: File) => {
    setCurrentFile(file);
    setIsHashing(true);
    setProgress(0);
    setScanResult(null);

    try {
      const { hash, timeMs } = await hashFileProgressive(file, (pct) => setProgress(pct));

      let matched: TrustedRecord | undefined;
      let potentialMismatch: TrustedRecord | undefined;

      if (selectedPresetId !== 'auto') {
        // User specifically picked a package to verify against
        const target = allRecords.find(r => r.id === selectedPresetId);
        if (target) {
          if (target.sha256.toLowerCase() === hash.toLowerCase()) {
            matched = target;
          } else {
            potentialMismatch = target;
          }
        }
      } else {
        // Auto-detect against full database
        matched = lookupHashInDatabase(hash);
        if (!matched) {
          potentialMismatch = findPotentialMismatch(file.name, hash);
        }
      }

      const status = matched 
        ? 'VERIFIED' 
        : potentialMismatch 
          ? 'HASH_MISMATCH' 
          : 'UNKNOWN';

      const result: FileScanResult = {
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

      setScanResult(result);

      // Save to audit history
      const saved = saveHistoryEntry({
        fileName: result.fileName,
        fileSize: result.fileSize,
        sha256: result.sha256,
        status: result.status,
        matchedSoftware: matched?.software || potentialMismatch?.software,
        version: matched?.version || potentialMismatch?.version,
        vendor: matched?.vendor || potentialMismatch?.vendor
      });

      logScanToSupabase(saved);
    } catch (err) {
      console.error('Software verification error:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          TRUSTED APPLICATION & INSTALLER VERIFICATION
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cryptographically verify software packages and operating system ISOs against official vendor release signatures.
        </p>
      </div>

      {/* Target Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Verification Mode:</span>
        </div>
        <div className="flex-1 max-w-md">
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="w-full text-xs font-mono bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="auto">⚡ Automatic Detection (Search All {allRecords.length} Trusted Records)</option>
            <optgroup label="Operating Systems">
              {allRecords.filter(r => r.category === 'Operating Systems').map(r => (
                <option key={r.id} value={r.id}>
                  {r.software} - {r.version} ({r.platform})
                </option>
              ))}
            </optgroup>
            <optgroup label="Browsers">
              {allRecords.filter(r => r.category === 'Browsers').map(r => (
                <option key={r.id} value={r.id}>
                  {r.software} - {r.version} ({r.platform})
                </option>
              ))}
            </optgroup>
            <optgroup label="Developer Tools">
              {allRecords.filter(r => r.category === 'Developer Tools').map(r => (
                <option key={r.id} value={r.id}>
                  {r.software} - {r.version} ({r.platform})
                </option>
              ))}
            </optgroup>
            <optgroup label="Security Tools & Utilities">
              {allRecords.filter(r => r.category === 'Security Tools' || r.category === 'Utilities').map(r => (
                <option key={r.id} value={r.id}>
                  {r.software} - {r.version} ({r.platform})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleVerify(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-slate-900/50 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01]'
            : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/80'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) handleVerify(files[0]);
          };
          input.click();
        }}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Upload Installer / Binary or <span className="text-emerald-400 underline decoration-emerald-400/40">Browse Files</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ubuntu, Debian, Firefox, VS Code, Git, Python, Wireshark, 7-Zip, VLC, and custom entries.
            </p>
          </div>
        </div>
      </div>

      {/* Hashing progress */}
      {isHashing && (
        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-emerald-400">Verifying SHA-256 for: {currentFile?.name}</span>
            <span className="text-slate-300">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Verification Result Display */}
      {scanResult && (
        <div className="space-y-6">
          {/* 🟢 VERIFIED BANNER */}
          {scanResult.status === 'VERIFIED' && scanResult.matchedRecord && (
            <div className="rounded-2xl bg-emerald-950/40 border-2 border-emerald-500 p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 space-y-5 animate-scaleUp">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold font-mono text-emerald-300">
                      VERIFIED – Hash matches the trusted original.
                    </span>
                    <span className="text-xl">🟢</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
                    This file's SHA-256 hash exactly matches a trusted reference published by the official software vendor.
                  </p>
                </div>
              </div>

              {/* Verified Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Software</span>
                  <span className="text-emerald-300 font-bold text-sm">{scanResult.matchedRecord.software}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Version</span>
                  <span className="text-white font-bold">{scanResult.matchedRecord.version}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vendor / Developer</span>
                  <span className="text-white font-bold">{scanResult.matchedRecord.vendor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Platform</span>
                  <span className="text-slate-200">{scanResult.matchedRecord.platform} ({scanResult.matchedRecord.architecture})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Authoritative Source</span>
                  <a
                    href={scanResult.matchedRecord.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300 inline-flex items-center gap-1"
                  >
                    <span>{scanResult.matchedRecord.source}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Release Date</span>
                  <span className="text-slate-200">{scanResult.matchedRecord.release_date}</span>
                </div>
              </div>
            </div>
          )}

          {/* 🔴 HASH MISMATCH BANNER */}
          {scanResult.status === 'HASH_MISMATCH' && scanResult.potentialMismatchRecord && (
            <div className="rounded-2xl bg-red-950/40 border-2 border-red-500 p-6 sm:p-8 shadow-2xl shadow-red-950/60 space-y-5 animate-scaleUp">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold font-mono text-red-300">
                      HASH MISMATCH – File differs from the trusted version.
                    </span>
                    <span className="text-xl">🔴</span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-200/90 mt-1">
                    A trusted reference exists for this software, but the calculated SHA-256 value is different.
                    This may indicate a different version, modified file, corruption, or unauthorized replacement.
                  </p>
                </div>
              </div>

              {/* Discrepancy Comparison Box */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-red-500/30 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Software Record:</span>
                  <span className="text-white font-bold">
                    {scanResult.potentialMismatchRecord.software} v{scanResult.potentialMismatchRecord.version} ({scanResult.potentialMismatchRecord.file_name})
                  </span>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[11px] font-bold">Expected SHA-256 (Vendor Official):</span>
                  <code className="text-emerald-300 break-all select-all block bg-slate-900 p-2 rounded border border-emerald-500/30">
                    {scanResult.potentialMismatchRecord.sha256}
                  </code>
                </div>
                <div>
                  <span className="text-red-400 block text-[11px] font-bold">Calculated SHA-256 (Your File):</span>
                  <code className="text-red-300 break-all select-all block bg-slate-900 p-2 rounded border border-red-500/30">
                    {scanResult.sha256}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* 🟡 UNKNOWN FILE BANNER */}
          {scanResult.status === 'UNKNOWN' && (
            <div className="rounded-2xl bg-amber-950/30 border-2 border-amber-500/80 p-6 sm:p-8 shadow-2xl shadow-amber-950/40 space-y-5 animate-scaleUp">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-bold font-mono text-amber-300">
                      UNVERIFIED – No matching trusted hash found.
                    </span>
                    <span className="text-xl">🟡</span>
                  </div>
                  <h4 className="text-base font-bold text-amber-200 mt-1">UNKNOWN FILE</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    No matching trusted SHA-256 value was found in the database.
                  </p>
                </div>
              </div>

              {/* Crucial Security Notice Box */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono text-sm">
                  <Info className="w-4 h-4 text-amber-400" />
                  IMPORTANT SECURITY PRINCIPLE
                </div>
                <p className="leading-relaxed">
                  <strong>This does NOT automatically mean the file is malicious.</strong>
                </p>
                <p className="text-slate-400 leading-relaxed">
                  SHA-256 cryptographic verification verifies file identity and proof of origin against pre-indexed lists. It does not perform antivirus behavioral analysis or determine whether arbitrary unindexed software is inherently safe or harmful. If you know the vendor's official checksum, use the <strong>Compare Hashes</strong> tab or add it to your <strong>Custom Database</strong>.
                </p>
              </div>
            </div>
          )}

          {/* File Summary Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scanned File Details</span>
              <button
                onClick={() => copyHash(scanResult.sha256)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
              <div><span className="text-slate-500">Name:</span> {scanResult.fileName}</div>
              <div><span className="text-slate-500">Size:</span> {formatBytes(scanResult.fileSize)}</div>
              <div><span className="text-slate-500">Duration:</span> {scanResult.computedTimeMs}ms</div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-500 block mb-1">Computed Hash:</span>
              <code className="text-cyan-300 break-all select-all font-semibold block bg-slate-950 p-2 rounded border border-slate-800">
                {scanResult.sha256}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
