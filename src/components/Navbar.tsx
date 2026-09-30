import React from 'react';
import { 
  ShieldCheck, 
  FileSearch, 
  CheckCircle2, 
  GitCompare, 
  FolderSync, 
  Activity, 
  Database, 
  History, 
  GraduationCap, 
  Cloud,
  Terminal
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { isSupabaseConfigured } from '../utils/supabase';

export type ActiveTab = 
  | 'dashboard' 
  | 'hasher' 
  | 'verifier' 
  | 'compare' 
  | 'baseline' 
  | 'avalanche' 
  | 'database' 
  | 'history' 
  | 'education';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSupabaseModal: () => void;
  trustedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSupabaseModal,
  trustedCount
}) => {
  const isCloudActive = isSupabaseConfigured();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: ShieldCheck },
    { id: 'hasher', label: 'Check File', icon: FileSearch },
    { id: 'verifier', label: 'Verify Software', icon: CheckCircle2 },
    { id: 'compare', label: 'Compare Hashes', icon: GitCompare },
    { id: 'baseline', label: 'Folder Changes', icon: FolderSync },
    { id: 'avalanche', label: 'Hash Lab', icon: Activity },
    { id: 'database', label: `Known Apps (${trustedCount})`, icon: Database },
    { id: 'history', label: 'History', icon: History },
    { id: 'education', label: 'Learn Basics', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-black/40">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-inner shadow-cyan-500/30">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-wider text-slate-100 uppercase font-mono">
                  FILE INTEGRITY CHECKER
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  SHA-256
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Check if files were changed, corrupted, or modified using simple SHA-256 codes.
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Cloud Sync button */}
            <button
              onClick={onOpenSupabaseModal}
              title={isCloudActive ? 'Cloud database connected' : 'Connect cloud database (Optional)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all duration-200 ${
                isCloudActive
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-cyan-500/40 hover:text-slate-200'
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Cloud Sync</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isCloudActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </button>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/CipherVicky/file-integrity-checker-Public-1"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-all duration-200"
              title="View on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              <span className="hidden sm:inline">CipherVicky</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
