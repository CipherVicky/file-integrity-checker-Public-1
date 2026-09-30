import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { HistoryEntry } from '../types';
import { getHistory, deleteHistoryEntry, clearHistory, exportHistoryToCSV, exportHistoryToJSON } from '../utils/history';
import { formatBytes, formatTimestamp } from '../utils/crypto';
import { downloadFile } from '../utils/baseline';

export const HashHistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (confirm('Clear all audit scan history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const csv = exportHistoryToCSV(history);
    downloadFile(csv, `file-integrity-audit-${Date.now()}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const json = exportHistoryToJSON(history);
    downloadFile(json, `file-integrity-audit-${Date.now()}.json`, 'application/json');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            LOCAL AUDIT & SCAN HISTORY
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Persistent log of files hashed, verified, and checked during this and previous sessions.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Export as CSV for compliance"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No audit history recorded yet.</p>
            <p className="text-slate-600">Files hashed in the Hasher, Verifier, or Dashboard will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">File Name & Size</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Matched Software</th>
                  <th className="p-3.5">SHA-256 Checksum</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {formatTimestamp(entry.timestamp)}
                    </td>

                    <td className="p-3.5">
                      <div className="text-white font-semibold truncate max-w-xs" title={entry.fileName}>
                        {entry.fileName}
                      </div>
                      <div className="text-[11px] text-slate-500">{formatBytes(entry.fileSize)}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {entry.status === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          VERIFIED
                        </span>
                      )}
                      {entry.status === 'HASH_MISMATCH' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-500/40 font-bold">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          MISMATCH
                        </span>
                      )}
                      {entry.status === 'UNKNOWN' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          UNKNOWN
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-300">
                      {entry.matchedSoftware ? (
                        <div>
                          <span className="text-cyan-300 font-semibold">{entry.matchedSoftware}</span>
                          {entry.version && <span className="text-slate-400"> ({entry.version})</span>}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[11px] text-cyan-400 max-w-xs truncate" title={entry.sha256}>
                        {entry.sha256}
                      </div>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(entry.id, entry.sha256)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                          title="Copy SHA-256"
                        >
                          {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 rounded bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/80 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
