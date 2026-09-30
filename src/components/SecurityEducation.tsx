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
          CRYPTOGRAPHIC SECURITY & THREAT MODEL HUB
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Essential cybersecurity principles, cryptographic guarantees, and guidance on distinguishing integrity from malware analysis.
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
              FUNDAMENTAL PRINCIPLE: UNKNOWN FILE ≠ MALICIOUS FILE
            </h3>
            <p className="text-xs text-amber-200/90 mt-0.5">
              SHA-256 verifies <strong>Identity and Untampered Transmission</strong>, not whether executable software is inherently benign.
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          A cryptographic hash is an irreversible mathematical digest. While it guarantees that a file has not diverged by even 1 single bit from the author's copy, it cannot detect zero-day exploits, logical vulnerabilities, or backdoors intentionally inserted by the author. Conversely, private scripts, internal corporate tools, or newly published builds will not appear in public databases, but are entirely benign.
        </p>
      </div>

      {/* The 4 Distinct Security States */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          THE FOUR INTEGRITY CLASSIFICATIONS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
              <span className="text-base">🟢</span>
              <span>1. VERIFIED</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The file's computed SHA-256 digest is an exact, bit-for-bit match against an authoritative vendor checksum published on their official security portal. Proves the file was received exactly as created by the legitimate developer.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-red-500/40 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold font-mono text-sm">
              <span className="text-base">🔴</span>
              <span>2. HASH MISMATCH</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A trusted record exists for this specific software, but the calculated hash is different. This signals a warning: it could be a different release version, storage bit rot, an interrupted download, or deliberate Trojan insertion by a compromised CDN mirror.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
              <span className="text-base">🟡</span>
              <span>3. UNKNOWN FILE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No matching reference exists in the trusted database. The system treats this with neutral skepticism. The user should verify against the developer's release notes or import the expected checksum manually.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-purple-500/40 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-sm">
              <span className="text-base">🟣</span>
              <span>4. INTEGRITY VERIFIED (BASELINE)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The file matches a previously recorded, user-generated baseline manifest. Ideal for monitoring server configuration files (<code className="text-purple-300">/etc/nginx</code>, SSL certificates) against unauthorized file drift or ransomware modification.
            </p>
          </div>
        </div>
      </div>

      {/* Threat Models */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          WHAT ATTACKS DOES SHA-256 PREVENT?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white font-mono text-sm">CDN / Mirror Tampering</h4>
            <p className="text-slate-400 leading-relaxed">
              Open source software is frequently downloaded from third-party mirrors. If a mirror is breached and replaces an ISO with malware, comparing the SHA-256 with the main vendor portal immediately detects the tampering.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white font-mono text-sm">Hardware & Network Corruption</h4>
            <p className="text-slate-400 leading-relaxed">
              During transmission over unstable Wi-Fi or storage on degrading SSDs, packets can drop or flip bits. SHA-256 ensures zero data corruption occurred during download.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white font-mono text-sm">Ransomware & Silent Drift</h4>
            <p className="text-slate-400 leading-relaxed">
              By taking periodic cryptographic baselines of critical folders, administrators immediately detect if an adversary modified system binaries or web application source code.
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
              COMPANION CLI UTILITY: <code className="text-cyan-400">integrity-check</code>
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            Node.js CLI
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          For automated CI/CD pipelines, DevOps servers, and headless terminals, this repository includes an official CLI tool.
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
              <span className="text-slate-500"># 1. Verify a file against the trusted database</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js verify ubuntu-24.04-desktop-amd64.iso</pre>
            </div>
            <div>
              <span className="text-slate-500"># 2. Hash any file directly in terminal</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js hash ./dist/app.tar.gz</pre>
            </div>
            <div>
              <span className="text-slate-500"># 3. Compare two hashes directly</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js compare &lt;hash1&gt; &lt;hash2&gt;</pre>
            </div>
            <div>
              <span className="text-slate-500"># 4. Create directory baseline snapshot</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js baseline create ./src --out baseline.json</pre>
            </div>
            <div>
              <span className="text-slate-500"># 5. Audit directory drift against baseline</span>
              <pre className="text-cyan-300 mt-0.5">$ node cli/bin/integrity-check.js baseline audit ./src --baseline baseline.json</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
