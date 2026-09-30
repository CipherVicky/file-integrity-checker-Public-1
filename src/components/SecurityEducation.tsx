import React from 'react';
import { 
  GraduationCap, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileCode,
  Copy,
  Check
} from 'lucide-react';

export const SecurityEducation: React.FC = () => {
  const [copiedCli, setCopiedCli] = React.useState(false);

  const copyCliCommand = () => {
    navigator.clipboard.writeText('node cli/bin/integrity-check.js verify ubuntu-24.04-desktop-amd64.iso');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-teal-400" />
          BEGINNER CYBERSECURITY GUIDE
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Simple explanations of how hashes work, why they protect your computer, and what each check result means.
        </p>
      </div>

      {/* Core Principle Alert Banner */}
      <div className="p-6 rounded-2xl bg-amber-950/30 border-2 border-amber-500/80 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-amber-300">
              GOLDEN RULE: UNKNOWN FILE ≠ VIRUS OR DANGER
            </h3>
            <p className="text-xs text-amber-200/90 mt-0.5">
              SHA-256 checks if a file is an <strong>exact twin</strong> of a known original. It is not an antivirus scanner.
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          When you see "Unknown File", it simply means the file is not in our database of famous apps. Your personal photos, homework documents, and custom scripts are not in any public database, but they are completely safe. Always remember: SHA-256 checks <em>identity</em>, not whether a file contains malware.
        </p>
      </div>

      {/* What is a Hash? */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          WHAT IS A HASH? (THE DIGITAL FINGERPRINT)
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Imagine taking any file—a 10 GB movie or a 1-sentence text note—and running it through a digital machine that creates a unique 64-character code. That code is called a <strong>SHA-256 hash</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">1. It is One-Way</span>
            <span className="text-slate-400">You can easily turn a file into a hash, but nobody in the world can turn a hash back into the file.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">2. It Catches Any Change</span>
            <span className="text-slate-400">If you change even a single dot, comma, or letter in the file, the hash changes completely.</span>
          </div>
        </div>
      </div>

      {/* The 4 Distinct Security States */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          WHAT THE 4 CHECK RESULTS MEAN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
              <span className="text-base">🟢</span>
              <span>1. VERIFIED</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The file is an exact, bit-for-bit twin of the official copy released by the original software developer. You can be 100% confident it hasn't been modified.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-red-500/40 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold font-mono text-sm">
              <span className="text-base">🔴</span>
              <span>2. HASH MISMATCH</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We know what the file is supposed to be, but its code doesn't match! This means the file was changed, corrupted during download, or is an unverified version.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
              <span className="text-base">🟡</span>
              <span>3. UNKNOWN FILE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This file is not in our list of popular software. It could be your own document or a private file. It is NOT necessarily dangerous.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-purple-500/40 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-sm">
              <span className="text-base">🟣</span>
              <span>4. FOLDER SNAPSHOT MATCH</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The file matches a snapshot you previously saved on your computer. Great for keeping tabs on important folders and detecting accidental edits.
            </p>
          </div>
        </div>
      </div>

      {/* Real-World Use Cases */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          WHAT DOES THIS PROTECT YOU FROM?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white font-mono text-sm">Fake Downloads & Scams</h4>
            <p className="text-slate-400 leading-relaxed">
              Shady download websites sometimes bundle adware or malware into free software. Checking the hash against the developer's official site prevents you from opening fakes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white font-mono text-sm">Broken or Incomplete Files</h4>
            <p className="text-slate-400 leading-relaxed">
              Large games or operating system ISOs can get corrupted if Wi-Fi cuts out during download. Hashing verifies every single byte arrived intact.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white font-mono text-sm">Sneaky Unwanted Changes</h4>
            <p className="text-slate-400 leading-relaxed">
              If someone (or a background program) edits files on your computer without your permission, taking folder snapshots will spot the changes immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Companion CLI Tool */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              COMMAND LINE TOOL: <code className="text-cyan-400">integrity-check</code>
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            For Terminal Users
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          If you like working in the terminal or want to automate file checks in scripts, you can run these simple commands:
        </p>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span>Terminal Usage Examples</span>
            <button
              onClick={copyCliCommand}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCli ? 'Copied' : 'Copy Example'}</span>
            </button>
          </div>

          <div className="space-y-2 text-slate-300">
            <div>
              <span className="text-slate-500"># 1. Check an installer against known apps</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js verify ubuntu-24.04-desktop-amd64.iso</pre>
            </div>
            <div>
              <span className="text-slate-500"># 2. Get the hash of any file</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js hash ./my-file.zip</pre>
            </div>
            <div>
              <span className="text-slate-500"># 3. Compare two hashes directly</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js compare &lt;hash1&gt; &lt;hash2&gt;</pre>
            </div>
            <div>
              <span className="text-slate-500"># 4. Save a folder snapshot</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js baseline create ./my-folder --out snapshot.json</pre>
            </div>
            <div>
              <span className="text-slate-500"># 5. Check what changed in the folder</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js baseline audit ./my-folder --baseline snapshot.json</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
