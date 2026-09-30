import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FileHasher } from './components/FileHasher';
import { SoftwareVerifier } from './components/SoftwareVerifier';
import { HashCompare } from './components/HashCompare';
import { BaselineMonitor } from './components/BaselineMonitor';
import { AvalancheLab } from './components/AvalancheLab';
import { TrustedDatabaseView } from './components/TrustedDatabaseView';
import { HashHistoryView } from './components/HashHistoryView';
import { SecurityEducation } from './components/SecurityEducation';
import { SupabaseModal } from './components/SupabaseModal';
import { getAllTrustedRecords } from './data/trustedDatabase';
import { getHistory } from './utils/history';
import { FileScanResult } from './types';
import { ShieldCheck, Heart, Lock } from 'lucide-react';
import { GithubIcon } from './components/GithubIcon';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [trustedCount, setTrustedCount] = useState<number>(getAllTrustedRecords().length);
  const [historyCount, setHistoryCount] = useState<number>(getHistory().length);

  const refreshCounts = () => {
    setTrustedCount(getAllTrustedRecords().length);
    setHistoryCount(getHistory().length);
  };

  useEffect(() => {
    refreshCounts();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber Grid Glow */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        trustedCount={trustedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            trustedCount={trustedCount}
            historyCount={historyCount}
            onQuickScanResult={() => refreshCounts()}
          />
        )}

        {activeTab === 'hasher' && <FileHasher />}

        {activeTab === 'verifier' && <SoftwareVerifier />}

        {activeTab === 'compare' && <HashCompare />}

        {activeTab === 'baseline' && <BaselineMonitor />}

        {activeTab === 'avalanche' && <AvalancheLab />}

        {activeTab === 'database' && (
          <TrustedDatabaseView onDatabaseUpdated={() => refreshCounts()} />
        )}

        {activeTab === 'history' && <HashHistoryView />}

        {activeTab === 'education' && <SecurityEducation />}
      </main>

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSyncComplete={() => refreshCounts()}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-500 text-xs font-mono py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-semibold">File Integrity Checker</span>
            <span>•</span>
            <span>SHA-256 Engine (NIST FIPS 180-4)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              100% In-Memory Local Verification
            </span>
            <a
              href="https://github.com/CipherVicky/file-integrity-checker-Public-1"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>CipherVicky Repository</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
