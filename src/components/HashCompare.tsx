import React, { useState } from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  UploadCloud, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { compareHashes, formatBytes, hashFileProgressive, normalizeHash } from '../utils/crypto';

export const HashCompare: React.FC = () => {
  const [calculatedInput, setCalculatedInput] = useState('');
  const [expectedInput, setExpectedInput] = useState('');
  const [comparisonResult, setComparisonResult] = useState<{
    hasCompared: boolean;
    match: boolean;
    normalizedA: string;
    normalizedB: string;
    isValidA: boolean;
    isValidB: boolean;
    diffIndices: number[];
  } | null>(null);

  const [isHashingFile, setIsHashingFile] = useState(false);
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  const handleCompare = () => {
    if (!calculatedInput && !expectedInput) return;
    const res = compareHashes(calculatedInput, expectedInput);
    setComparisonResult({
      hasCompared: true,
      ...res
    });
  };

  const handleFileDrop = async (file: File) => {
    setIsHashingFile(true);
    try {
      const { hash } = await hashFileProgressive(file);
      setCalculatedInput(hash);
      if (expectedInput) {
        const res = compareHashes(hash, expectedInput);
        setComparisonResult({ hasCompared: true, ...res });
      }
    } catch (err) {
      console.error('File hashing error in compare:', err);
    } finally {
      setIsHashingFile(false);
    }
  };

  const loadSample = (type: 'match' | 'mismatch') => {
    const sampleUbuntu = '3a4c9877b483ab46d7c3fbe165a0db275e1ae3cfe56a5657e5a47c2f99a99d1e';
    if (type === 'match') {
      setCalculatedInput(sampleUbuntu.toUpperCase());
      setExpectedInput(sampleUbuntu);
      const res = compareHashes(sampleUbuntu.toUpperCase(), sampleUbuntu);
      setComparisonResult({ hasCompared: true, ...res });
    } else {
      setCalculatedInput(sampleUbuntu);
      // Alter one character in expected
      const altered = '3a4c9877b483ab46d7c3fbe165a0db275e1ae3cfe56a5657e5a47c2f99a99d1f';
      setExpectedInput(altered);
      const res = compareHashes(sampleUbuntu, altered);
      setComparisonResult({ hasCompared: true, ...res });
    }
  };

  const reset = () => {
    setCalculatedInput('');
    setExpectedInput('');
    setComparisonResult(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-blue-400" />
          COMPARE TWO HASHES
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Paste two SHA-256 codes side-by-side to check if they match. Spaces, dashes, and capital letters are automatically fixed for you.
        </p>
      </div>

      {/* Quick Sample Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Try A Test Example:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSample('match')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            Load Matching Hashes
          </button>
          <button
            onClick={() => loadSample('mismatch')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30 transition-colors"
          >
            Load 1-Letter Difference
          </button>
          <button
            onClick={reset}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Clear fields"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input Comparison Form */}
      <div className="space-y-5">
        {/* Calculated SHA-256 Input */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-2">
              <span>Calculated SHA-256</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Your File</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileDrop(f);
                  }}
                />
              </label>
              {calculatedInput && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(calculatedInput);
                    setCopiedA(true);
                    setTimeout(() => setCopiedA(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Paste your hash here (or upload a file above)..."
              value={calculatedInput}
              onChange={(e) => setCalculatedInput(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-cyan-300 p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 tracking-wider placeholder:text-slate-600"
            />
          </div>
          {isHashingFile && (
            <p className="text-xs font-mono text-cyan-400 animate-pulse">Calculating file hash...</p>
          )}
          {calculatedInput && (
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Length: {normalizeHash(calculatedInput).length} characters</span>
              <span>
                {normalizeHash(calculatedInput).length === 64 ? '✓ Valid 64-char Hash' : '⚠️ Must be 64 characters'}
              </span>
            </div>
          )}
        </div>

        {/* Expected SHA-256 Input */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-2">
              <span>Expected SHA-256</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">From Official Website</span>
            </label>
            {expectedInput && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(expectedInput);
                  setCopiedB(true);
                  setTimeout(() => setCopiedB(false), 2000);
                }}
                className="text-slate-400 hover:text-white"
              >
                {copiedB ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Paste the hash from the developer's website..."
              value={expectedInput}
              onChange={(e) => setExpectedInput(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-emerald-300 p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 tracking-wider placeholder:text-slate-600"
            />
          </div>
          {expectedInput && (
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Length: {normalizeHash(expectedInput).length} characters</span>
              <span>
                {normalizeHash(expectedInput).length === 64 ? '✓ Valid 64-char Hash' : '⚠️ Must be 64 characters'}
              </span>
            </div>
          )}
        </div>

        {/* Compare Action Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleCompare}
            disabled={!calculatedInput || !expectedInput}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <GitCompare className="w-4 h-4" />
            <span>COMPARE HASHES</span>
          </button>
        </div>
      </div>

      {/* Comparison Result Box */}
      {comparisonResult && comparisonResult.hasCompared && (
        <div className="space-y-4 animate-scaleUp">
          {/* Result Status Banner */}
          {comparisonResult.match ? (
            <div className="p-6 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500 text-center space-y-2 shadow-xl shadow-emerald-950/40">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black font-mono tracking-widest text-emerald-300">
                MATCH
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200">
                Both hashes are 100% identical! The file is genuine, complete, and unmodified.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-red-950/50 border-2 border-red-500 text-center space-y-2 shadow-xl shadow-red-950/40">
              <div className="inline-flex p-3 rounded-full bg-red-500/20 text-red-400 mb-1">
                <XCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black font-mono tracking-widest text-red-300">
                MISMATCH
              </h3>
              <p className="text-xs sm:text-sm text-red-200">
                The hashes are different! The file might be corrupted, a different version, or modified.
              </p>
            </div>
          )}

          {/* Hex Discrepancy Diff View */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span>See Exactly Which Letters Differ</span>
              <span className="text-[11px] text-slate-500">
                Differences: {comparisonResult.diffIndices.length} / 64 characters
              </span>
            </h4>

            {/* Calculated Breakdown */}
            <div className="space-y-1">
              <div className="text-[11px] text-slate-400">Your File:</div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap gap-x-1 gap-y-1 break-all">
                {comparisonResult.normalizedA.split('').map((char, idx) => {
                  const isDiff = comparisonResult.diffIndices.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1 rounded font-bold ${
                        isDiff
                          ? 'bg-red-500 text-white font-extrabold animate-pulse'
                          : 'text-cyan-300'
                      }`}
                      title={isDiff ? `Letter differs at position ${idx + 1}` : undefined}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Expected Breakdown */}
            <div className="space-y-1">
              <div className="text-[11px] text-slate-400">Expected:</div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap gap-x-1 gap-y-1 break-all">
                {comparisonResult.normalizedB.split('').map((char, idx) => {
                  const isDiff = comparisonResult.diffIndices.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1 rounded font-bold ${
                        isDiff
                          ? 'bg-emerald-500 text-slate-950 font-extrabold'
                          : 'text-emerald-300'
                      }`}
                      title={isDiff ? `Expected letter at position ${idx + 1}` : undefined}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
