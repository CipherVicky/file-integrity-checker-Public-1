export type Category = 
  | 'Operating Systems' 
  | 'Browsers' 
  | 'Developer Tools' 
  | 'Security Tools' 
  | 'Utilities'
  | 'Custom';

export type Platform = 'Windows' | 'Linux' | 'macOS' | 'Multiplatform' | 'Source';

export type Architecture = 'x86_64' | 'x86' | 'arm64' | 'universal' | 'source' | 'any';

export interface TrustedRecord {
  id: string;
  software: string;
  vendor: string;
  version: string;
  category: Category;
  platform: Platform;
  architecture: Architecture;
  file_name: string;
  file_size?: number;
  sha256: string;
  source: string;
  source_url: string;
  release_date: string;
  is_custom?: boolean;
  notes?: string;
}

export type VerificationStatus = 'VERIFIED' | 'HASH_MISMATCH' | 'UNKNOWN';

export interface FileScanResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified?: number;
  sha256: string;
  computedTimeMs: number;
  status: VerificationStatus;
  matchedRecord?: TrustedRecord;
  potentialMismatchRecord?: TrustedRecord;
}

export interface BaselineItem {
  path: string;
  size: number;
  sha256: string;
  lastModified?: number;
}

export interface BaselineManifest {
  version: string;
  name: string;
  createdAt: string;
  generator: string;
  files: BaselineItem[];
}

export type DiffStatus = 'UNCHANGED' | 'MODIFIED' | 'ADDED' | 'DELETED';

export interface BaselineDiffItem {
  path: string;
  status: DiffStatus;
  baselineHash?: string;
  currentHash?: string;
  baselineSize?: number;
  currentSize?: number;
}

export interface BaselineReport {
  id: string;
  baselineName: string;
  scannedAt: string;
  totalBaselineFiles: number;
  totalCurrentFiles: number;
  unchangedCount: number;
  modifiedCount: number;
  addedCount: number;
  deletedCount: number;
  diffs: BaselineDiffItem[];
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  sha256: string;
  status: VerificationStatus;
  matchedSoftware?: string;
  version?: string;
  vendor?: string;
}

export interface AvalancheAnalysis {
  originalText: string;
  modifiedText: string;
  originalHash: string;
  modifiedHash: string;
  bitsChanged: number;
  totalBits: 256;
  percentChanged: number;
  hammingDistance: number;
  bitDiffArray: boolean[];
}
