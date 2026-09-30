import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { AvalancheAnalysis } from '../types';

/**
 * Normalizes a SHA-256 hash string by removing colons, dashes, spaces, and converting to lowercase.
 */
export function normalizeHash(hash: string): string {
  if (!hash) return '';
  return hash.replace(/[\s:-]/g, '').toLowerCase().trim();
}

/**
 * Validates whether a given string is a valid 64-character hexadecimal SHA-256 string.
 */
export function isValidSha256(hash: string): boolean {
  const normalized = normalizeHash(hash);
  return /^[0-9a-f]{64}$/i.test(normalized);
}

/**
 * Computes the SHA-256 hash of a string using UTF-8 encoding.
 */
export function hashString(text: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBytes = sha256(data);
  return bytesToHex(hashBytes);
}

/**
 * Computes SHA-256 hash of a Uint8Array or ArrayBuffer.
 */
export function hashBytes(buffer: Uint8Array | ArrayBuffer): string {
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const hashBytes = sha256(uint8);
  return bytesToHex(hashBytes);
}

/**
 * Hashes a File object in chunks (progressive streaming) to handle multi-gigabyte files
 * without exhausting browser memory, reporting percentage progress.
 */
export async function hashFileProgressive(
  file: File | Blob,
  onProgress?: (percent: number, bytesProcessed: number) => void
): Promise<{ hash: string; timeMs: number; bytes: number }> {
  const startTime = performance.now();
  const chunkSize = 2 * 1024 * 1024; // 2MB chunk size for smooth UI progress
  const totalBytes = file.size;
  let offset = 0;

  // Noble sha256 hasher instance supporting progressive chunk updates
  const hasher = sha256.create();

  // Edge case: 0-byte file
  if (totalBytes === 0) {
    hasher.update(new Uint8Array(0));
    const digest = hasher.digest();
    const endTime = performance.now();
    onProgress?.(100, 0);
    return {
      hash: bytesToHex(digest),
      timeMs: Math.max(1, Math.round(endTime - startTime)),
      bytes: 0
    };
  }

  while (offset < totalBytes) {
    const chunk = file.slice(offset, offset + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    hasher.update(new Uint8Array(arrayBuffer));
    offset += chunk.size;

    const percent = Math.min(100, Math.round((offset / totalBytes) * 100));
    onProgress?.(percent, offset);

    // Yield control to event loop so browser UI stays snappy and updates the progress bar
    if (offset < totalBytes) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  const digest = hasher.digest();
  const endTime = performance.now();

  return {
    hash: bytesToHex(digest),
    timeMs: Math.max(1, Math.round(endTime - startTime)),
    bytes: totalBytes
  };
}

/**
 * Compares two SHA-256 hashes safely, case-insensitively, and identifies differing character indices.
 */
export function compareHashes(
  hashA: string,
  hashB: string
): {
  match: boolean;
  normalizedA: string;
  normalizedB: string;
  isValidA: boolean;
  isValidB: boolean;
  diffIndices: number[];
} {
  const normalizedA = normalizeHash(hashA);
  const normalizedB = normalizeHash(hashB);
  const isValidA = isValidSha256(normalizedA);
  const isValidB = isValidSha256(normalizedB);

  const match = isValidA && isValidB && normalizedA === normalizedB;

  const diffIndices: number[] = [];
  const maxLen = Math.max(normalizedA.length, normalizedB.length);
  for (let i = 0; i < maxLen; i++) {
    if (normalizedA[i] !== normalizedB[i]) {
      diffIndices.push(i);
    }
  }

  return {
    match,
    normalizedA,
    normalizedB,
    isValidA,
    isValidB,
    diffIndices
  };
}

/**
 * Calculates Strict Avalanche Criterion (SAC) effect between two input texts:
 * Hashes both, converts 256-bit digests into binary, and measures Hamming distance (bit differences).
 */
export function calculateAvalanche(text1: string, text2: string): AvalancheAnalysis {
  const hash1 = hashString(text1);
  const hash2 = hashString(text2);

  // Convert hex strings to 256 boolean bit arrays
  const bits1 = hexToBits(hash1);
  const bits2 = hexToBits(hash2);

  let bitsChanged = 0;
  const bitDiffArray: boolean[] = [];

  for (let i = 0; i < 256; i++) {
    const differs = bits1[i] !== bits2[i];
    bitDiffArray.push(differs);
    if (differs) {
      bitsChanged++;
    }
  }

  const percentChanged = Math.round((bitsChanged / 256) * 1000) / 10;

  return {
    originalText: text1,
    modifiedText: text2,
    originalHash: hash1,
    modifiedHash: hash2,
    bitsChanged,
    totalBits: 256,
    percentChanged,
    hammingDistance: bitsChanged,
    bitDiffArray
  };
}

/**
 * Converts a 64-character hexadecimal SHA-256 hash into an array of 256 bits (booleans).
 */
export function hexToBits(hex: string): boolean[] {
  const bits: boolean[] = [];
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    if (isNaN(nibble)) {
      for (let b = 0; b < 4; b++) bits.push(false);
    } else {
      for (let b = 3; b >= 0; b--) {
        bits.push(((nibble >> b) & 1) === 1);
      }
    }
  }
  return bits;
}

/**
 * Converts bytes into a readable formatted string (e.g. 14.5 MB, 1.2 GB).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a Unix timestamp or date string into standard ISO format.
 */
export function formatTimestamp(timestamp?: number | string | null): string {
  if (!timestamp) return 'Unknown';
  try {
    const d = new Date(timestamp);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return 'Invalid Date';
  }
}
