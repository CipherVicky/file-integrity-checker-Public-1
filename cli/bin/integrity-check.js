#!/usr/bin/env node

/**
 * File Integrity Checker – SHA-256 CLI Companion
 * NIST FIPS 180-4 Cryptographic Integrity Verification Tool
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION = '2.0.0';
const DATABASE_PATH = path.join(__dirname, '..', 'data', 'trustedDatabase.json');

function loadTrustedDatabase() {
  if (!fs.existsSync(DATABASE_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function normalizeHash(hash) {
  if (!hash) return '';
  return hash.replace(/[\s:-]/g, '').toLowerCase().trim();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

function crawlDirectory(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(crawlDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

async function handleHash(args) {
  const filePath = args[0];
  if (!filePath) {
    console.error('Error: Please provide a file path. Usage: integrity-check hash <file>');
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  const start = Date.now();
  const hash = await hashFile(filePath);
  const elapsed = Date.now() - start;

  console.log('\n--- FILE HASH SUMMARY ---');
  console.log(`File Name:     ${path.basename(filePath)}`);
  console.log(`File Size:     ${formatBytes(stat.size)} (${stat.size} bytes)`);
  console.log(`SHA-256 Digest: \x1b[36m${hash}\x1b[0m`);
  console.log(`Time Elapsed:  ${elapsed} ms\n`);
}

async function handleVerify(args) {
  const filePath = args[0];
  if (!filePath) {
    console.error('Error: Please provide a file path. Usage: integrity-check verify <file>');
    process.exit(1);
  }

  const fileName = path.basename(filePath);
  const stat = fs.statSync(filePath);
  const hash = await hashFile(filePath);
  const db = loadTrustedDatabase();

  const exactMatch = db.find(r => r.sha256.toLowerCase() === hash.toLowerCase());
  const potentialMismatch = !exactMatch ? db.find(r => {
    const baseName = r.file_name.toLowerCase().replace(/[-_.]/g, '');
    const currentName = fileName.toLowerCase().replace(/[-_.]/g, '');
    return currentName.includes(baseName) || baseName.includes(currentName);
  }) : null;

  console.log('\n========================================');
  console.log('FILE INTEGRITY CHECKER – VERIFICATION');
  console.log('========================================');
  console.log(`Target File:    ${fileName}`);
  console.log(`Target Size:    ${formatBytes(stat.size)}`);
  console.log(`Computed Hash:  \x1b[36m${hash}\x1b[0m`);
  console.log('----------------------------------------');

  if (exactMatch) {
    console.log('\x1b[32m[🟢 VERIFIED]\x1b[0m Exact match found in authoritative database!');
    console.log(`Software:       ${exactMatch.software}`);
    console.log(`Version:        ${exactMatch.version}`);
    console.log(`Vendor:         ${exactMatch.vendor}`);
    console.log(`Platform:       ${exactMatch.platform} (${exactMatch.architecture})`);
    console.log(`Authoritative:  ${exactMatch.source}`);
  } else if (potentialMismatch) {
    console.log('\x1b[31m[🔴 HASH MISMATCH]\x1b[0m File differs from known trusted release!');
    console.log(`Known Record:   ${potentialMismatch.software} (${potentialMismatch.version})`);
    console.log(`Expected Hash:  ${potentialMismatch.sha256}`);
    console.log(`Calculated:     ${hash}`);
    console.log('\x1b[33mWarning: File may be corrupt, modified, or a different build version.\x1b[0m');
  } else {
    console.log('\x1b[33m[🟡 UNKNOWN FILE]\x1b[0m No matching trusted reference found in catalog.');
    console.log('Security Note: An unknown file is NOT automatically malicious.');
    console.log('SHA-256 verifies identity against known digests, not malware behavior.');
  }
  console.log('========================================\n');
}

function handleCompare(args) {
  const hashA = args[0];
  const hashB = args[1];

  if (!hashA || !hashB) {
    console.error('Error: Please provide two hashes to compare. Usage: integrity-check compare <hash1> <hash2>');
    process.exit(1);
  }

  const normA = normalizeHash(hashA);
  const normB = normalizeHash(hashB);
  const match = normA === normB && normA.length === 64;

  console.log('\n--- SHA-256 COMPARISON ---');
  console.log(`Hash A: ${normA}`);
  console.log(`Hash B: ${normB}`);
  console.log('--------------------------');

  if (match) {
    console.log('\x1b[32mRESULT: MATCH (100% Identical Fingerprint)\x1b[0m\n');
  } else {
    console.log('\x1b[31mRESULT: MISMATCH (Fingerprints Differ)\x1b[0m\n');
  }
}

async function handleBaseline(args) {
  const subCmd = args[0];
  if (subCmd === 'create') {
    const dir = args[1] || '.';
    let outIndex = args.indexOf('--out');
    const outFile = outIndex !== -1 && args[outIndex + 1] ? args[outIndex + 1] : 'baseline.json';

    console.log(`Creating baseline manifest for directory: ${dir}...`);
    const files = crawlDirectory(dir);
    const items = [];

    for (const f of files) {
      const stat = fs.statSync(f.fullPath);
      const hash = await hashFile(f.fullPath);
      items.push({
        path: f.relPath,
        size: stat.size,
        sha256: hash,
        lastModified: stat.mtimeMs
      });
    }

    const manifest = {
      version: '1.0.0',
      name: `CLI-Baseline-${path.basename(path.resolve(dir))}`,
      createdAt: new Date().toISOString(),
      generator: `integrity-check CLI v${VERSION}`,
      files: items
    };

    fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
    console.log(`\x1b[32mBaseline successfully created!\x1b[0m ${items.length} files cataloged to: ${outFile}\n`);
  } else if (subCmd === 'audit') {
    const dir = args[1] || '.';
    let baseIndex = args.indexOf('--baseline');
    if (baseIndex === -1 || !args[baseIndex + 1]) {
      console.error('Error: Please specify baseline file via --baseline <manifest.json>');
      process.exit(1);
    }
    const baselineFile = args[baseIndex + 1];
    if (!fs.existsSync(baselineFile)) {
      console.error(`Error: Baseline manifest file not found: ${baselineFile}`);
      process.exit(1);
    }

    const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    const baselineMap = new Map(baseline.files.map(f => [f.path, f]));
    const currentFiles = crawlDirectory(dir);
    const currentMap = new Map();

    for (const f of currentFiles) {
      const stat = fs.statSync(f.fullPath);
      const hash = await hashFile(f.fullPath);
      currentMap.set(f.relPath, { size: stat.size, hash });
    }

    let unchanged = 0, modified = 0, added = 0, deleted = 0;

    console.log('\n--- DIRECTORY INTEGRITY DRIFT AUDIT ---');
    console.log(`Target Dir:     ${dir}`);
    console.log(`Baseline Name:  ${baseline.name}`);
    console.log('---------------------------------------');

    for (const [p, baseItem] of baselineMap.entries()) {
      const current = currentMap.get(p);
      if (!current) {
        deleted++;
        console.log(`\x1b[37m[DELETED]\x1b[0m   ${p}`);
      } else if (current.hash.toLowerCase() === baseItem.sha256.toLowerCase()) {
        unchanged++;
        console.log(`\x1b[32m[UNCHANGED]\x1b[0m ${p}`);
      } else {
        modified++;
        console.log(`\x1b[31m[MODIFIED]\x1b[0m  ${p}`);
      }
    }

    for (const [p] of currentMap.entries()) {
      if (!baselineMap.has(p)) {
        added++;
        console.log(`\x1b[33m[ADDED]\x1b[0m     ${p}`);
      }
    }

    console.log('---------------------------------------');
    console.log(`Summary: ${unchanged} Unchanged | ${modified} Modified | ${added} Added | ${deleted} Deleted`);
    if (modified > 0 || deleted > 0 || added > 0) {
      console.log('\x1b[31mStatus: INTEGRITY DRIFT DETECTED\x1b[0m\n');
    } else {
      console.log('\x1b[32mStatus: INTEGRITY VERIFIED (0 DRIFT)\x1b[0m\n');
    }
  } else {
    console.log('Usage:');
    console.log('  integrity-check baseline create <dir> [--out <manifest.json>]');
    console.log('  integrity-check baseline audit <dir> --baseline <manifest.json>');
  }
}

function printHelp() {
  console.log(`
File Integrity Checker – SHA-256 CLI v${VERSION}
NIST FIPS 180-4 Cryptographic Integrity Verification Tool

Usage:
  integrity-check <command> [options]

Commands:
  verify <file>                        Verify file against the authoritative trusted database
  hash <file>                          Compute SHA-256 digest and file metadata
  compare <hash1> <hash2>              Compare two SHA-256 hashes safely and case-insensitively
  baseline create <dir> [--out <file>] Snapshot directory into a baseline JSON manifest
  baseline audit <dir> --baseline <f>  Audit directory drift against an existing baseline manifest
  help, --help                         Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'hash':
      await handleHash(args.slice(1));
      break;
    case 'verify':
      await handleVerify(args.slice(1));
      break;
    case 'compare':
      handleCompare(args.slice(1));
      break;
    case 'baseline':
      await handleBaseline(args.slice(1));
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
