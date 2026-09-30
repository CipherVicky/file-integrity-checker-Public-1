import { BaselineDiffItem, BaselineItem, BaselineManifest, BaselineReport, DiffStatus } from '../types';
import { formatBytes, formatTimestamp, hashFileProgressive } from './crypto';

/**
 * Creates a baseline manifest from a list of HTML5 File objects.
 * Supports directory relative paths when files are uploaded via directory input (webkitRelativePath).
 */
export async function createBaselineManifest(
  name: string,
  files: File[],
  onProgress?: (processed: number, total: number, currentFileName: string) => void
): Promise<BaselineManifest> {
  const items: BaselineItem[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const path = file.webkitRelativePath || file.name;
    onProgress?.(i, total, path);

    const { hash } = await hashFileProgressive(file);
    items.push({
      path,
      size: file.size,
      sha256: hash,
      lastModified: file.lastModified
    });
  }

  onProgress?.(total, total, 'Complete');

  return {
    version: '1.0.0',
    name: name.trim() || `Baseline-${new Date().toISOString().substring(0, 10)}`,
    createdAt: new Date().toISOString(),
    generator: 'File Integrity Checker v2.0 (SHA-256 Engine)',
    files: items
  };
}

/**
 * Compares current files against an imported baseline manifest to detect drift (UNCHANGED, MODIFIED, ADDED, DELETED).
 */
export async function compareWithBaseline(
  baseline: BaselineManifest,
  currentFiles: File[],
  onProgress?: (processed: number, total: number, currentFileName: string) => void
): Promise<BaselineReport> {
  const baselineMap = new Map<string, BaselineItem>();
  for (const item of baseline.files) {
    baselineMap.set(item.path, item);
  }

  const currentMap = new Map<string, { size: number; hash: string }>();
  const total = currentFiles.length;

  for (let i = 0; i < total; i++) {
    const file = currentFiles[i];
    const path = file.webkitRelativePath || file.name;
    onProgress?.(i, total, path);

    const { hash } = await hashFileProgressive(file);
    currentMap.set(path, {
      size: file.size,
      hash
    });
  }
  onProgress?.(total, total, 'Audit Finished');

  const diffs: BaselineDiffItem[] = [];
  let unchangedCount = 0;
  let modifiedCount = 0;
  let addedCount = 0;
  let deletedCount = 0;

  // 1. Check existing files in baseline against current
  for (const [path, baseItem] of baselineMap.entries()) {
    const current = currentMap.get(path);
    if (!current) {
      deletedCount++;
      diffs.push({
        path,
        status: 'DELETED',
        baselineHash: baseItem.sha256,
        baselineSize: baseItem.size
      });
    } else {
      if (baseItem.sha256.toLowerCase() === current.hash.toLowerCase()) {
        unchangedCount++;
        diffs.push({
          path,
          status: 'UNCHANGED',
          baselineHash: baseItem.sha256,
          currentHash: current.hash,
          baselineSize: baseItem.size,
          currentSize: current.size
        });
      } else {
        modifiedCount++;
        diffs.push({
          path,
          status: 'MODIFIED',
          baselineHash: baseItem.sha256,
          currentHash: current.hash,
          baselineSize: baseItem.size,
          currentSize: current.size
        });
      }
    }
  }

  // 2. Check newly added files not present in baseline
  for (const [path, currItem] of currentMap.entries()) {
    if (!baselineMap.has(path)) {
      addedCount++;
      diffs.push({
        path,
        status: 'ADDED',
        currentHash: currItem.hash,
        currentSize: currItem.size
      });
    }
  }

  // Sort diffs: MODIFIED first, then DELETED, then ADDED, then UNCHANGED
  const priorityOrder: Record<DiffStatus, number> = {
    MODIFIED: 0,
    DELETED: 1,
    ADDED: 2,
    UNCHANGED: 3
  };
  diffs.sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status] || a.path.localeCompare(b.path));

  return {
    id: `audit-${Date.now()}`,
    baselineName: baseline.name,
    scannedAt: new Date().toISOString(),
    totalBaselineFiles: baseline.files.length,
    totalCurrentFiles: currentFiles.length,
    unchangedCount,
    modifiedCount,
    addedCount,
    deletedCount,
    diffs
  };
}

/**
 * Generates an executive Markdown report detailing file integrity drift.
 */
export function generateMarkdownReport(report: BaselineReport): string {
  const hasDrift = report.modifiedCount > 0 || report.deletedCount > 0 || report.addedCount > 0;
  const statusBadge = hasDrift ? '⚠️ INTEGRITY DRIFT DETECTED' : '✅ INTEGRITY VERIFIED (0 DRIFT)';

  let md = `# File Integrity Verification Report\n\n`;
  md += `**Status:** ${statusBadge}\n`;
  md += `**Baseline Name:** ${report.baselineName}\n`;
  md += `**Audit Timestamp:** ${formatTimestamp(report.scannedAt)}\n`;
  md += `**Total Baseline Items:** ${report.totalBaselineFiles}\n`;
  md += `**Total Scanned Items:** ${report.totalCurrentFiles}\n\n`;

  md += `## Summary Metrics\n`;
  md += `| Metric | Count | Description |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Unchanged** | \`${report.unchangedCount}\` | Identical SHA-256 cryptographic match |\n`;
  md += `| **Modified** | \`${report.modifiedCount}\` | Hash mismatch detected (file modified/tampered) |\n`;
  md += `| **Added** | \`${report.addedCount}\` | New files present not recorded in baseline |\n`;
  md += `| **Deleted** | \`${report.deletedCount}\` | Baseline files missing from target directory |\n\n`;

  md += `## Detailed File Status\n\n`;
  md += `| Status | File Path | Baseline SHA-256 | Current SHA-256 |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  for (const item of report.diffs) {
    const icon =
      item.status === 'UNCHANGED' ? '🟢 UNCHANGED' :
      item.status === 'MODIFIED'  ? '🔴 MODIFIED'  :
      item.status === 'ADDED'     ? '🟡 ADDED'     : '⚪ DELETED';

    const bHash = item.baselineHash ? `\`${item.baselineHash.substring(0, 16)}...\`` : '—';
    const cHash = item.currentHash ? `\`${item.currentHash.substring(0, 16)}...\`` : '—';

    md += `| ${icon} | \`${item.path}\` | ${bHash} | ${cHash} |\n`;
  }

  md += `\n---\n*Report generated by File Integrity Checker – SHA-256 Engine. Verification complies with NIST FIPS 180-4 standard.*`;
  return md;
}

/**
 * Triggers a browser download of a generated file (JSON, Markdown, CSV).
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
