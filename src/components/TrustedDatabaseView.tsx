import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  ShieldCheck, 
  CloudUpload,
  CheckCircle2
} from 'lucide-react';
import { Category, Platform, TrustedRecord } from '../types';
import { 
  getAllTrustedRecords, 
  saveCustomTrustedRecord, 
  deleteCustomTrustedRecord 
} from '../data/trustedDatabase';
import { isValidSha256, normalizeHash } from '../utils/crypto';
import { isSupabaseConfigured, pushTrustedRecordToSupabase } from '../utils/supabase';

interface TrustedDatabaseViewProps {
  onDatabaseUpdated?: () => void;
}

export const TrustedDatabaseView: React.FC<TrustedDatabaseViewProps> = ({ onDatabaseUpdated }) => {
  const [records, setRecords] = useState<TrustedRecord[]>(getAllTrustedRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Record Form State
  const [newSoftware, setNewSoftware] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Custom');
  const [newPlatform, setNewPlatform] = useState<Platform>('Multiplatform');
  const [newFileName, setNewFileName] = useState('');
  const [newSha256, setNewSha256] = useState('');
  const [newSource, setNewSource] = useState('Official Vendor Website');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setRecords(getAllTrustedRecords());
    onDatabaseUpdated?.();
  };

  const handleCopy = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this custom trusted record?')) {
      deleteCustomTrustedRecord(id);
      refreshList();
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newSoftware.trim() || !newFileName.trim() || !newSha256.trim()) {
      setFormError('Software name, file name, and SHA-256 hash are required.');
      return;
    }

    const cleanHash = normalizeHash(newSha256);
    if (!isValidSha256(cleanHash)) {
      setFormError('Invalid SHA-256 hash. Must be exactly 64 hexadecimal characters.');
      return;
    }

    const saved = saveCustomTrustedRecord({
      software: newSoftware.trim(),
      vendor: newVendor.trim() || 'Custom / Internal',
      version: newVersion.trim() || '1.0.0',
      category: newCategory,
      platform: newPlatform,
      architecture: 'x86_64',
      file_name: newFileName.trim(),
      sha256: cleanHash,
      source: newSource.trim(),
      source_url: newSourceUrl.trim() || 'https://example.com',
      release_date: new Date().toISOString().substring(0, 10),
      notes: newNotes.trim()
    });

    if (isSupabaseConfigured()) {
      await pushTrustedRecordToSupabase(saved);
    }

    refreshList();
    setShowAddModal(false);
    // Reset form
    setNewSoftware('');
    setNewVendor('');
    setNewVersion('');
    setNewFileName('');
    setNewSha256('');
    setNewSourceUrl('');
    setNewNotes('');
  };

  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.software.toLowerCase().includes(q) ||
      r.vendor.toLowerCase().includes(q) ||
      r.file_name.toLowerCase().includes(q) ||
      r.sha256.toLowerCase().includes(q) ||
      r.version.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'ALL' || r.platform === selectedPlatform;

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const exportDatabaseJson = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trusted-sha256-database-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            OFFICIAL TRUSTED SHA-256 DATABASE
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative cryptographic repository of official operating systems, browsers, developer tools, and security utilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Hash</span>
          </button>
          <button
            onClick={exportDatabaseJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Export complete database catalog as JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export Catalog</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search software, file name, or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs font-mono text-slate-200 pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 text-xs font-mono text-slate-200 px-3 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Categories</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Browsers">Browsers</option>
            <option value="Developer Tools">Developer Tools</option>
            <option value="Security Tools">Security Tools</option>
            <option value="Utilities">Utilities</option>
            <option value="Custom">Custom / User-Added</option>
          </select>
        </div>

        <div>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full bg-slate-950 text-xs font-mono text-slate-200 px-3 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Platforms</option>
            <option value="Linux">Linux</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
            <option value="Multiplatform">Multiplatform</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Software & Version</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">File Name & Source</th>
                <th className="p-3.5">SHA-256 Fingerprint</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{item.software}</span>
                        {item.is_custom && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-900 text-purple-300 border border-purple-700">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.version} • {item.vendor}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="text-slate-300">{item.platform}</span>
                      <span className="text-[10px] text-slate-500 block">{item.architecture}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="text-cyan-300 font-semibold truncate max-w-xs" title={item.file_name}>
                        {item.file_name}
                      </div>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-cyan-300 underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>{item.source}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800 max-w-sm truncate text-emerald-400 text-[11px]" title={item.sha256}>
                        {item.sha256}
                      </div>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(item.id, item.sha256)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                          title="Copy SHA-256 Hash"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {item.is_custom && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 transition-colors"
                            title="Delete custom record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Custom Trusted Hash Record
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddRecord} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Software Name *</label>
                  <input
                    type="text"
                    required
                    value={newSoftware}
                    onChange={(e) => setNewSoftware(e.target.value)}
                    placeholder="e.g. Internal Tool"
                    className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vendor / Team</label>
                  <input
                    type="text"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="e.g. Org Dev"
                    className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Version</label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="e.g. 1.0.0"
                    className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Custom">Custom</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Browsers">Browsers</option>
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="Security Tools">Security Tools</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as Platform)}
                    className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Multiplatform">Multiplatform</option>
                    <option value="Windows">Windows</option>
                    <option value="Linux">Linux</option>
                    <option value="macOS">macOS</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Expected File Name *</label>
                  <input
                    type="text"
                    required
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. app-1.0.0.tar.gz"
                    className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Official SHA-256 Hash (64 Hex Characters) *</label>
                <input
                  type="text"
                  required
                  value={newSha256}
                  onChange={(e) => setNewSha256(e.target.value)}
                  placeholder="Paste 64-char SHA-256..."
                  className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Source Reference URL</label>
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
