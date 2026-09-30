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
        setText1('Password123');
        setText2('Password124');
        break;
      case 'case':
        setText1('MySecretCode');
        setText2('mysecretcode');
        break;
      case 'period':
        setText1('Hello world');
        setText2('Hello world.');
        break;
      case 'identical':
        setText1('Security test 2026');
        setText2('Security test 2026');
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          HASH EXPERIMENT LAB: 1 LETTER CHANGES EVERYTHING
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          See the magic of hashing in action! Notice how changing just one tiny letter completely scrambles the resulting 64-character code.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Experiments:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset('one-char')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors"
          >
            1 Number Change ('3' vs '4')
          </button>
          <button
            onClick={() => loadPreset('case')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            Capital vs Lowercase
          </button>
          <button
            onClick={() => loadPreset('period')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-colors"
          >
            Add a Period ('.')
          </button>
          <button
            onClick={() => loadPreset('identical')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            Exact Same Text
          </button>
        </div>
      </div>

      {/* Interactive Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Text A */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center justify-between">
            <span>Text A (Original)</span>
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
            <span className="text-slate-500 block text-[10px]">Hash of Text A:</span>
            <code className="text-cyan-400">{analysis.originalHash}</code>
          </div>
        </div>

        {/* Input Text B */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center justify-between">
            <span>Text B (Modified)</span>
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
            <span className="text-slate-500 block text-[10px]">Hash of Text B:</span>
            <code className="text-amber-400">{analysis.modifiedHash}</code>
          </div>
        </div>
      </div>

      {/* Avalanche Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Bits Changed</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1 block">
            {analysis.hammingDistance}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Out of 256 total bits</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Percentage Changed</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 mt-1 block">
            {analysis.percentChanged}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Roughly half (~50%) flips</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Identical Bits</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1 block">
            {256 - analysis.bitsChanged}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Unchanged positions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase block">Result</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-purple-400 mt-1 block">
            {analysis.bitsChanged === 0 ? 'SAME' : 'SCRAMBLED'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Complete randomness</span>
        </div>
      </div>

      {/* 256-Bit Visual Matrix */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              256-BIT VISUAL GRID
            </h3>
            <p className="text-xs text-slate-400">
              Every SHA-256 hash is made of 256 tiny bits (1s and 0s). Red squares represent bits that changed when you changed the text.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
              Unchanged Bit ({256 - analysis.bitsChanged})
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
                title={`Bit #${bitIndex + 1}: ${isFlipped ? 'CHANGED' : 'SAME'}`}
                className={`aspect-square rounded-xs sm:rounded transition-all duration-300 cursor-pointer ${
                  isFlipped
                    ? 'bg-red-500 shadow-sm shadow-red-500/60 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Beginner Explanation */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Why does changing 1 letter scramble the whole hash?
          </div>
          <p className="leading-relaxed">
            This is known as the <strong>Avalanche Effect</strong>. When you calculate a SHA-256 hash, the computer mixes, rotates, and shuffles the data 64 times.
          </p>
          <p className="leading-relaxed">
            Because of this mixing, altering even a single comma or letter sets off a massive chain reaction. That is why it is mathematically impossible for an attacker to modify your file without the hash looking completely different!
          </p>
        </div>
      </div>
    </div>
  );
};
