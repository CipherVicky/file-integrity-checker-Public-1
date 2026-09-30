import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  isSupabaseConfigured,
  getSupabaseClient,
  fetchRemoteTrustedRecords,
  pushTrustedRecordToSupabase
} from '../utils/supabase';
import { getCustomTrustedRecords } from '../data/trustedDatabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setStatusMessage({ text: 'Please provide both URL and Public Anon Key', type: 'error' });
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setStatusMessage({ text: 'Invalid Supabase URL format. Must start with https://', type: 'error' });
      return;
    }

    saveSupabaseConfig(url, anonKey);
    setStatusMessage({ text: 'Supabase credentials saved successfully!', type: 'success' });
    onSyncComplete?.();
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    const client = getSupabaseClient();
    if (!client) {
      setStatusMessage({ text: 'Supabase is not configured yet. Save credentials first.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await client.from('trusted_records').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        setStatusMessage({ text: `Connection response: ${error.message}`, type: 'info' });
      } else {
        setStatusMessage({ text: 'Connection successful! Database is accessible.', type: 'success' });
      }
    } catch (err: any) {
      setStatusMessage({ text: `Connection test failed: ${err.message || err}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushCustom = async () => {
    setIsLoading(true);
    const custom = getCustomTrustedRecords();
    if (custom.length === 0) {
      setStatusMessage({ text: 'No custom records found locally to upload.', type: 'info' });
      setIsLoading(false);
      return;
    }

    let successCount = 0;
    for (const record of custom) {
      const res = await pushTrustedRecordToSupabase(record);
      if (res.success) successCount++;
    }

    setStatusMessage({
      text: `Uploaded ${successCount} of ${custom.length} custom records to Supabase.`,
      type: 'success'
    });
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatusMessage({ text: 'Supabase disconnected and cleared from browser storage.', type: 'info' });
    onSyncComplete?.();
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">Supabase Cloud Sync</h3>
              <p className="text-[11px] text-slate-400">Optional backend sync for teams & audit records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
          isConnected
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>{isConnected ? 'Supabase Connected' : 'Disconnected (Local-Only Mode)'}</span>
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="text-red-400 hover:text-red-300 text-[11px] underline"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' :
            statusMessage.type === 'error'   ? 'bg-red-950/60 border border-red-500/40 text-red-300' :
                                              'bg-slate-800 border border-slate-700 text-cyan-300'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
            {statusMessage.type === 'error'   && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Supabase Project URL</label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Supabase Anon Public API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono transition-colors"
            >
              Save Credentials
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isLoading || !url}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Sync Actions */}
        {isConnected && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
              Cloud Synchronization Actions
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePushCustom}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Custom Hashes</span>
              </button>
            </div>
          </div>
        )}

        {/* Schema Setup Info */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="text-slate-300 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Database Tables</span>
          </div>
          <p>
            An official SQL migration is included in <code className="text-cyan-300">supabase/schema.sql</code>. It creates <code className="text-cyan-300">trusted_records</code> and <code className="text-cyan-300">audit_scans</code> tables with Row Level Security (RLS).
          </p>
        </div>
      </div>
    </div>
  );
};
