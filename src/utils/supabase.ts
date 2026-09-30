import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HistoryEntry, TrustedRecord } from '../types';

const STORAGE_KEY_SUPABASE_URL = 'fic_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'fic_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

  let storedUrl = '';
  let storedKey = '';

  if (typeof localStorage !== 'undefined') {
    storedUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '';
    storedKey = localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '';
  }

  return {
    url: storedUrl || envUrl,
    anonKey: storedKey || envKey
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, anonKey.trim());
  }
}

export function clearSupabaseConfig(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  const configKey = `${url}:${anonKey}`;
  if (cachedClient && lastClientConfigKey === configKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastClientConfigKey = configKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

/**
 * Sync custom trusted records to Supabase 'trusted_records' table
 */
export async function pushTrustedRecordToSupabase(record: TrustedRecord): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client is not configured' };

  try {
    const { error } = await client.from('trusted_records').upsert({
      id: record.id,
      software: record.software,
      vendor: record.vendor,
      version: record.version,
      category: record.category,
      platform: record.platform,
      architecture: record.architecture,
      file_name: record.file_name,
      file_size: record.file_size,
      sha256: record.sha256.toLowerCase(),
      source: record.source,
      source_url: record.source_url,
      release_date: record.release_date,
      notes: record.notes
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Unknown network error' };
  }
}

/**
 * Fetch team/custom records from Supabase 'trusted_records' table
 */
export async function fetchRemoteTrustedRecords(): Promise<{ records: TrustedRecord[]; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { records: [], error: 'Supabase client is not configured' };

  try {
    const { data, error } = await client.from('trusted_records').select('*');
    if (error) return { records: [], error: error.message };
    return { records: (data as TrustedRecord[]) || [] };
  } catch (e: any) {
    return { records: [], error: e.message || 'Network error fetching records' };
  }
}

/**
 * Push an audit scan entry to Supabase 'audit_scans' table
 */
export async function logScanToSupabase(entry: HistoryEntry): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('audit_scans').insert({
      id: entry.id,
      file_name: entry.fileName,
      file_size: entry.fileSize,
      sha256: entry.sha256,
      status: entry.status,
      matched_software: entry.matchedSoftware,
      version: entry.version,
      vendor: entry.vendor,
      scanned_at: new Date(entry.timestamp).toISOString()
    });
  } catch (err) {
    console.warn('Failed to log scan to Supabase:', err);
  }
}
