import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Binary, 
  HelpCircle,
  Cpu
} from 'lucide-react';
import { calculateAvalanche } from '../utils/crypto';

export const AvalancheLab: React.FC = () => {
  const [text1, setText1] = useState('The quick brown fox jumps over the lazy dog');
  const [text2, setText2] = useState('The quick brown fox jumps over the lazy cog'); // 1 letter difference: d -> c

  const analysis = useMemo(() => {
    return calculateAvalanche(text1, text2);
  }, [text1, text2]);

  const loadPreset = (preset: 'one-char' | 'case' | 'period' | 'identical') => {
    switch (preset) {
      case 'one-char':
        setText1('Antigravity SHA-256 Verification Protocol');
        setText2('Antigravity SHA-256 Verification Protocok');
        break;
      case 'case':
        setText1('SECURITY_FIRMWARE_V2');
        setText2('security_firmware_v2');
        break;
      case 'period':
        setText1('System authentication allowed');
        setText2('System authentication allowed.');
        break;
      case 'identical':
        setText1('Cryptographic integrity 2026');
        setText2('Cryptographic integrity 2026');
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          CRYPTOGRAPHIC LAB: ONE BYTE CHANGES EVERYTHING
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore the <strong>Strict Avalanche Criterion (SAC)</strong> in SHA-256. Notice how modifying even a single character flips roughly 50% of the entire 256-bit cryptographic matrix.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Experiment Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset('one-char')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors"
          >
            1 Character Change ('l' vs 'k')
          </button>
          <button
            onClick={() => loadPreset('case')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            Case Sensitivity (UPPER vs lower)
          </button>
          <button
            onClick={() => loadPreset('period')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-colors"
          >
            Added Period ('.')
          </button>
          <button
            onClick={() => loadPreset('identical')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            Identical Inputs (0 Bits)
          </button>
        </div>
      </div>

      {/* Interactive Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Text A */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center justify-between">
            <span>Input A (Original String)</span>
            <span className="text-[10px] text-slate-500">{text1.length} characters</span>
          </label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-cyan-300 p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
            placeholder="Type original text..."
          />
          <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">SHA-256 Digest:</span>
            <code className="text-cyan-400">{analysis.originalHash}</code>
          </div>
        </div>

        {/* Input Text B */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center justify-between">
            <span>Input B (Modified String)</span>
            <span className="text-[10px] text-slate-500">{text2.length} characters</span>
          </label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-amber-300 p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            placeholder="Type modified text..."
          />
          <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-800/80">
            <span className="text-slate-500 block text-[10px]">SHA-256 Digest:</span>
            <code className="text-amber-400">{analysis.modifiedHash}</code>
          </div>
        </div>
      </div>

      {/* Avalanche Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Hamming Distance</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1 block">
            {analysis.hammingDistance}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Flipped bits out of 256</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Avalanche Ratio</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 mt-1 block">
            {analysis.percentChanged}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Target: ~50% (Ideal SAC)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Unchanged Bits</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1 block">
            {256 - analysis.bitsChanged}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Conserved bit positions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">SAC Compliance</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-purple-400 mt-1 block">
            {Math.abs(analysis.percentChanged - 50) < 10 ? 'OPTIMAL' : analysis.bitsChanged === 0 ? 'IDENTICAL' : 'NORMAL'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Pseudo-random dispersion</span>
        </div>
      </div>

      {/* 256-Bit Cryptographic Bit Matrix (16 x 16 Grid) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              256-BIT CRYPTOGRAPHIC MATRIX (16 × 16)
            </h3>
            <p className="text-xs text-slate-400">
              Each square represents 1 of the 256 bits in the SHA-256 output. Red indicates a flipped bit; slate indicates an unchanged bit.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
              Identical Bit ({256 - analysis.bitsChanged})
            </span>
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-3 h-3 rounded bg-red-500 inline-block shadow-sm shadow-red-500" />
              Flipped Bit ({analysis.bitsChanged})
            </span>
          </div>
        </div>

        {/* The Matrix */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex justify-center overflow-x-auto">
          <div className="grid grid-cols-16 gap-1 sm:gap-1.5 w-full max-w-2xl">
            {analysis.bitDiffArray.map((isFlipped, bitIndex) => (
              <div
                key={bitIndex}
                title={`Bit #${bitIndex}: ${isFlipped ? 'FLIPPED (Differs)' : 'UNCHANGED (Match)'}`}
                className={`aspect-square rounded-xs sm:rounded transition-all duration-300 cursor-pointer ${
                  isFlipped
                    ? 'bg-red-500 shadow-sm shadow-red-500/60 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cryptanalysis Explanation */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Why does changing 1 character cause ~50% of the bits to flip?
          </div>
          <p className="leading-relaxed">
            In cryptography, this is known as the <strong>Strict Avalanche Criterion (SAC)</strong>, formalized by Webster and Tavares in 1985.
            SHA-256 uses a Merkle–Damgård construction with the Davies–Meyer compression function, consisting of 64 rounds of non-linear bitwise operations
            (bitwise rotations, right shifts, <code className="text-cyan-300">Ch</code> choice functions, and modular addition).
          </p>
          <p className="leading-relaxed">
            By the time the input reaches round 64, a single flipped bit in the message expands exponentially through all state variables (<code className="text-cyan-300">A..H</code>),
            making it mathematically impossible for an attacker to deduce what was changed, effectively providing pre-image and second pre-image collision resistance.
          </p>
        </div>
      </div>
    </div>
  );
};
