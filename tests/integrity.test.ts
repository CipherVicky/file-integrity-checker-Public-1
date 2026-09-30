import { describe, it, expect } from 'vitest';
import { 
  hashString, 
  normalizeHash, 
  isValidSha256, 
  compareHashes, 
  calculateAvalanche, 
  formatBytes,
  hexToBits
} from '../src/utils/crypto';
import { 
  getAllTrustedRecords, 
  lookupHashInDatabase, 
  findPotentialMismatch 
} from '../src/data/trustedDatabase';
import { exportHistoryToCSV } from '../src/utils/history';
import { HistoryEntry } from '../src/types';

describe('Cryptographic Engine & NIST SHA-256 Compliance', () => {
  it('correctly computes the NIST standard SHA-256 hash of "The quick brown fox jumps over the lazy dog"', () => {
    const input = 'The quick brown fox jumps over the lazy dog';
    const expected = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';
    const computed = hashString(input);
    expect(computed).toBe(expected);
  });

  it('correctly computes the NIST standard SHA-256 hash of an empty string', () => {
    const input = '';
    const expected = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const computed = hashString(input);
    expect(computed).toBe(expected);
  });

  it('normalizes hashes with whitespace, colons, dashes, and upper case', () => {
    const dirty = ' D7:A8:FB:B3-07D7809469CA9ABCB0082E4F8D5651E46D3CDB762D02D0BF37C9E592 ';
    const clean = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';
    expect(normalizeHash(dirty)).toBe(clean);
  });

  it('validates 64-character hexadecimal SHA-256 strings', () => {
    expect(isValidSha256('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592')).toBe(true);
    expect(isValidSha256('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e59')).toBe(false); // 63 chars
    expect(isValidSha256('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592z')).toBe(false); // invalid char
  });

  it('safely compares two hashes and identifies differing character indices', () => {
    const hashA = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592';
    const hashB = 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e59f'; // last char differs
    const result = compareHashes(hashA, hashB);
    expect(result.match).toBe(false);
    expect(result.diffIndices).toEqual([63]);

    const matchResult = compareHashes(hashA, hashA.toUpperCase());
    expect(matchResult.match).toBe(true);
    expect(matchResult.diffIndices).toEqual([]);
  });

  it('measures Strict Avalanche Criterion (SAC) bit dispersion', () => {
    const textA = 'The quick brown fox jumps over the lazy dog';
    const textB = 'The quick brown fox jumps over the lazy cog'; // 1 character difference
    const avalanche = calculateAvalanche(textA, textB);

    expect(avalanche.totalBits).toBe(256);
    expect(avalanche.bitsChanged).toBeGreaterThan(90);
    expect(avalanche.bitsChanged).toBeLessThan(160);
    expect(avalanche.percentChanged).toBeGreaterThan(35);
    expect(avalanche.percentChanged).toBeLessThan(65);
    expect(avalanche.bitDiffArray.length).toBe(256);
  });

  it('correctly converts 64 hex characters to 256 boolean bits', () => {
    const hex = '0000000000000000000000000000000000000000000000000000000000000001';
    const bits = hexToBits(hex);
    expect(bits.length).toBe(256);
    expect(bits[255]).toBe(true);
    expect(bits[254]).toBe(false);
    expect(bits[0]).toBe(false);
  });

  it('formats byte numbers into human-readable units', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB');
    expect(formatBytes(1024 * 1024 * 1024 * 4.2)).toBe('4.2 GB');
  });
});

describe('Trusted Software Database & Verification Logic', () => {
  it('contains legitimate official software records', () => {
    const records = getAllTrustedRecords();
    expect(records.length).toBeGreaterThanOrEqual(25);

    const categories = new Set(records.map(r => r.category));
    expect(categories.has('Operating Systems')).toBe(true);
    expect(categories.has('Browsers')).toBe(true);
    expect(categories.has('Developer Tools')).toBe(true);
    expect(categories.has('Security Tools')).toBe(true);
    expect(categories.has('Utilities')).toBe(true);
  });

  it('authenticates Ubuntu 24.04.4 LTS ISO checksum', () => {
    const ubuntuHash = '3a4c9877b483ab46d7c3fbe165a0db275e1ae3cfe56a5657e5a47c2f99a99d1e';
    const record = lookupHashInDatabase(ubuntuHash);
    expect(record).toBeDefined();
    expect(record?.software).toContain('Ubuntu');
    expect(record?.version).toContain('24.04');
  });

  it('detects potential mismatch when a known file name has an altered checksum', () => {
    const tamperedHash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const fileName = 'ubuntu-24.04.4-desktop-amd64.iso';
    const mismatch = findPotentialMismatch(fileName, tamperedHash);

    expect(mismatch).toBeDefined();
    expect(mismatch?.file_name).toBe('ubuntu-24.04.4-desktop-amd64.iso');
  });

  it('does NOT label an unknown file as a mismatch if the name does not correlate', () => {
    const unknownHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const unknownName = 'my-custom-private-document.docx';
    const mismatch = findPotentialMismatch(unknownName, unknownHash);

    expect(mismatch).toBeUndefined();
  });
});

describe('Audit History & CSV Export', () => {
  it('formats scan history entries into valid RFC 4180 CSV rows', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'test-1',
        timestamp: 1717200000000,
        fileName: 'installer.exe',
        fileSize: 52428800,
        sha256: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
        status: 'VERIFIED',
        matchedSoftware: 'Test App',
        version: '1.0.0',
        vendor: 'Test Vendor'
      }
    ];

    const csv = exportHistoryToCSV(entries);
    expect(csv).toContain('installer.exe');
    expect(csv).toContain('52428800');
    expect(csv).toContain('VERIFIED');
    expect(csv).toContain('Test App');
  });
});
