import { HistoryEntry } from '../types';
import { formatBytes, formatTimestamp } from './crypto';

const LOCAL_STORAGE_KEY_HISTORY = 'file_integrity_checker_history_v2';
const MAX_HISTORY_ITEMS = 250;

/**
 * Retrieves audit history records saved in localStorage.
 */
export function getHistory(): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves a new verification or scan entry into local history.
 */
export function saveHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): HistoryEntry {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now()
  };

  const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(updated));
  }
  return newEntry;
}

/**
 * Deletes a specific history record by its ID.
 */
export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter(item => item.id !== id);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
  }
}

/**
 * Clears the entire local audit history.
 */
export function clearHistory(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_HISTORY);
  }
}

/**
 * Converts history entries into CSV format for security audit logs.
 */
export function exportHistoryToCSV(entries: HistoryEntry[]): string {
  const headers = ['Timestamp', 'File Name', 'File Size (Bytes)', 'File Size (Formatted)', 'SHA-256 Checksum', 'Status', 'Matched Software', 'Version', 'Vendor'];
  const rows = entries.map(e => [
    `"${formatTimestamp(e.timestamp)}"`,
    `"${(e.fileName || '').replace(/"/g, '""')}"`,
    e.fileSize,
    `"${formatBytes(e.fileSize)}"`,
    `"${e.sha256}"`,
    `"${e.status}"`,
    `"${(e.matchedSoftware || '').replace(/"/g, '""')}"`,
    `"${(e.version || '').replace(/"/g, '""')}"`,
    `"${(e.vendor || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

/**
 * Exports history entries as structured JSON.
 */
export function exportHistoryToJSON(entries: HistoryEntry[]): string {
  return JSON.stringify(entries, null, 2);
}
