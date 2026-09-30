import React, { useState } from 'react';
import { 
  FolderSync, 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  Sparkles, 
  FileCheck,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { BaselineManifest, BaselineReport, DiffStatus } from '../types';
import { 
  createBaselineManifest, 
  compareWithBaseline, 
  generateMarkdownReport, 
  downloadFile 
} from '../utils/baseline';
import { formatBytes, formatTimestamp } from '../utils/crypto';

export const BaselineMonitor: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'audit'>('create');

  // Creation State
  const [baselineName, setBaselineName] = useState('My-Folder-Snapshot-v1');
  const [createdManifest, setCreatedManifest] = useState<BaselineManifest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState({ current: 0, total: 0, file: '' });

  // Audit State
  const [baselineToAudit, setBaselineToAudit] = useState<BaselineManifest | null>(null);
  const [auditReport, setAuditReport] = useState<BaselineReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState({ current: 0, total: 0, file: '' });
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Handle Multi-file upload for Baseline Creation
  const handleFilesForBaseline = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setIsCreating(true);
    setCreatedManifest(null);

    try {
      const manifest = await createBaselineManifest(baselineName, files, (curr, tot, fname) => {
        setCreateProgress({ current: curr, total: tot, file: fname });
      });
      setCreatedManifest(manifest);
    } catch (err) {
      console.error('Failed to create baseline snapshot:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Upload of existing JSON Baseline Manifest
  const handleImportManifest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.files && Array.isArray(parsed.files)) {
          setBaselineToAudit(parsed);
          setAuditReport(null);
        } else {
          alert('Invalid snapshot file. Please upload a valid baseline JSON file.');
        }
      } catch (err) {
        alert('Could not read the snapshot file.');
      }
    };
    reader.readAsText(file);
  };

  // Run audit against loaded baseline
  const handleFilesForAudit = async (fileList: FileList | null) => {
    if (!fileList || !baselineToAudit) return;
    const files = Array.from(fileList);
    setIsAuditing(true);
    setAuditReport(null);

    try {
      const report = await compareWithBaseline(baselineToAudit, files, (curr, tot, fname) => {
        setAuditProgress({ current: curr, total: tot, file: fname });
      });
      setAuditReport(report);
    } catch (err) {
      console.error('Error checking folder changes:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Demo baseline generator for instant testing
  const loadDemoBaseline = () => {
    const sampleManifest: BaselineManifest = {
      version: '1.0.0',
      name: 'Sample-Project-Snapshot',
      createdAt: new Date().toISOString(),
      generator: 'File Integrity Checker Engine',
      files: [
        {
          path: 'config/settings.json',
          size: 1450,
          sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          lastModified: Date.now() - 3600000
        },
        {
          path: 'certs/security.key',
          size: 2048,
          sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
          lastModified: Date.now() - 7200000
        },
        {
          path: 'src/main.js',
          size: 512000,
          sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          lastModified: Date.now() - 10800000
        },
        {
          path: 'notes/readme.txt',
          size: 4096,
          sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
          lastModified: Date.now() - 14400000
        }
      ]
    };
    setBaselineToAudit(sampleManifest);
    setActiveSubTab('audit');
  };

  const filteredDiffs = auditReport?.diffs.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  }) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <FolderSync className="w-5 h-5 text-purple-400" />
          TRACK FOLDER CHANGES (BASELINE MONITOR)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Save a list of your files today, then check anytime later to see which files were modified, newly added, or deleted.
        </p>
      </div>

      {/* Sub Mode Toggle */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
              activeSubTab === 'create'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Save Folder Snapshot
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
              activeSubTab === 'audit'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Check What Changed
          </button>
        </div>

        <button
          onClick={loadDemoBaseline}
          className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Try A Demo Snapshot</span>
        </button>
      </div>

      {/* SUBTAB 1: CREATE BASELINE MANIFEST */}
      {activeSubTab === 'create' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-300 font-semibold block mb-1">
                Give This Snapshot A Name
              </label>
              <input
                type="text"
                value={baselineName}
                onChange={(e) => setBaselineName(e.target.value)}
                placeholder="e.g. My-Project-Version-1"
                className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-purple-300 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Folder or Multi-File Upload Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-purple-950/10 cursor-pointer transition-all">
                <FolderOpen className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-xs font-mono font-bold text-slate-200">Select Entire Folder</span>
                <span className="text-[11px] text-slate-400 text-center mt-1">Saves all files and subfolders</span>
                <input
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesForBaseline(e.target.files)}
                />
              </label>

              <label className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-purple-950/10 cursor-pointer transition-all">
                <FileCheck className="w-8 h-8 text-cyan-400 mb-2" />
                <span className="text-xs font-mono font-bold text-slate-200">Select Multiple Files</span>
                <span className="text-[11px] text-slate-400 text-center mt-1">Pick specific files to record</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesForBaseline(e.target.files)}
                />
              </label>
            </div>
          </div>

          {/* Creation Progress */}
          {isCreating && (
            <div className="p-5 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-purple-300">Reading: {createProgress.file}</span>
                <span className="text-slate-300">{createProgress.current} / {createProgress.total}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-100"
                  style={{ width: `${(createProgress.current / Math.max(1, createProgress.total)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Generated Manifest Display */}
          {createdManifest && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold font-mono text-white">Snapshot Saved Successfully!</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {createdManifest.files.length} files recorded with unique SHA-256 fingerprints.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      downloadFile(
                        JSON.stringify(createdManifest, null, 2),
                        `${createdManifest.name.toLowerCase().replace(/\s+/g, '-')}-baseline.json`,
                        'application/json'
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Snapshot (JSON)</span>
                  </button>
                  <button
                    onClick={() => {
                      setBaselineToAudit(createdManifest);
                      setActiveSubTab('audit');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  >
                    <span>Check For Changes Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table of cataloged files */}
              <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-lg">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-2.5">File Path</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">SHA-256 Fingerprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {createdManifest.files.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-purple-300">{item.path}</td>
                        <td className="p-2.5 whitespace-nowrap">{formatBytes(item.size)}</td>
                        <td className="p-2.5 break-all text-slate-400 font-mono text-[11px]">{item.sha256}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: AUDIT & DETECT DRIFT */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          {/* Baseline Reference Header */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 block">Loaded Snapshot</span>
                {baselineToAudit ? (
                  <h3 className="text-base font-bold font-mono text-cyan-300">
                    {baselineToAudit.name} ({baselineToAudit.files.length} saved files)
                  </h3>
                ) : (
                  <p className="text-xs text-amber-400 font-mono mt-1">
                    No snapshot loaded yet. Upload your snapshot file or click "Try A Demo Snapshot".
                  </p>
                )}
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors">
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Snapshot JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportManifest}
                />
              </label>
            </div>
          </div>

          {/* Target File Upload to Audit */}
          {baselineToAudit && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-mono uppercase text-slate-300 font-semibold block">
                Select your current folder or files to check what changed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all">
                  <FolderOpen className="w-6 h-6 text-cyan-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-slate-200">Select Folder To Check</span>
                  <input
                    type="file"
                    // @ts-ignore
                    webkitdirectory=""
                    directory=""
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesForAudit(e.target.files)}
                  />
                </label>

                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-all">
                  <FileCheck className="w-6 h-6 text-purple-400 mb-1" />
                  <span className="text-xs font-mono font-bold text-slate-200">Select Files To Check</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesForAudit(e.target.files)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Audit In Progress */}
          {isAuditing && (
            <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-300">Checking: {auditProgress.file}</span>
                <span className="text-slate-300">{auditProgress.current} / {auditProgress.total}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-400 transition-all duration-100"
                  style={{ width: `${(auditProgress.current / Math.max(1, auditProgress.total)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Audit Results Report Card */}
          {auditReport && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
              {/* Summary Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-400">Results</span>
                  <div className="flex items-center gap-2 mt-1">
                    {auditReport.modifiedCount === 0 && auditReport.deletedCount === 0 && auditReport.addedCount === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ALL FILES MATCH – 0 CHANGES DETECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        CHANGES FOUND IN FOLDER
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const md = generateMarkdownReport(auditReport);
                      downloadFile(md, `folder-change-report-${Date.now()}.md`, 'text/markdown');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Report (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadFile(JSON.stringify(auditReport, null, 2), `folder-change-report-${Date.now()}.json`, 'application/json');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <button
                  onClick={() => setFilterStatus('UNCHANGED')}
                  className={`p-3 rounded-xl border transition-all ${
                    filterStatus === 'UNCHANGED' ? 'bg-emerald-950/60 border-emerald-500' : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Unchanged</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{auditReport.unchangedCount}</span>
                </button>

                <button
                  onClick={() => setFilterStatus('MODIFIED')}
                  className={`p-3 rounded-xl border transition-all ${
                    filterStatus === 'MODIFIED' ? 'bg-red-950/60 border-red-500' : 'bg-slate-950/70 border-slate-800 hover:border-red-500/40'
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Modified (Edited)</span>
                  <span className="text-xl font-bold font-mono text-red-400">{auditReport.modifiedCount}</span>
                </button>

                <button
                  onClick={() => setFilterStatus('ADDED')}
                  className={`p-3 rounded-xl border transition-all ${
                    filterStatus === 'ADDED' ? 'bg-amber-950/60 border-amber-500' : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Added (New)</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{auditReport.addedCount}</span>
                </button>

                <button
                  onClick={() => setFilterStatus('DELETED')}
                  className={`p-3 rounded-xl border transition-all ${
                    filterStatus === 'DELETED' ? 'bg-slate-800 border-slate-600' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-mono uppercase text-slate-400 block">Missing (Deleted)</span>
                  <span className="text-xl font-bold font-mono text-slate-400">{auditReport.deletedCount}</span>
                </button>
              </div>

              {/* Status filter banner */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2">
                <span>Showing: <strong className="text-white">{filterStatus}</strong> ({filteredDiffs.length} items)</span>
                {filterStatus !== 'ALL' && (
                  <button onClick={() => setFilterStatus('ALL')} className="text-cyan-400 hover:underline">
                    Show All
                  </button>
                )}
              </div>

              {/* Detailed Diff List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredDiffs.map((diff, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border font-mono text-xs space-y-1.5 ${
                      diff.status === 'UNCHANGED' ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' :
                      diff.status === 'MODIFIED'  ? 'bg-red-950/30 border-red-500/40 text-red-200' :
                      diff.status === 'ADDED'     ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
                                                    'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {diff.status === 'UNCHANGED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {diff.status === 'MODIFIED'  && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        {diff.status === 'ADDED'     && <PlusCircle className="w-3.5 h-3.5 text-amber-400" />}
                        {diff.status === 'DELETED'   && <MinusCircle className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="font-bold">{diff.path}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        diff.status === 'UNCHANGED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                        diff.status === 'MODIFIED'  ? 'bg-red-950 text-red-300 border border-red-500/30' :
                        diff.status === 'ADDED'     ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                                                      'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {diff.status}
                      </span>
                    </div>

                    {diff.status === 'MODIFIED' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-400">Previous Hash:</span>
                          <span className="block text-slate-300 truncate" title={diff.baselineHash}>
                            {diff.baselineHash}
                          </span>
                        </div>
                        <div>
                          <span className="text-red-400 font-bold">Current Hash:</span>
                          <span className="block text-red-300 truncate font-bold" title={diff.currentHash}>
                            {diff.currentHash}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
