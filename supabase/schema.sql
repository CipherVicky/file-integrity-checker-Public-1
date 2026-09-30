-- ==========================================================
-- File Integrity Checker – SHA-256 Database Schema
-- Supabase / PostgreSQL DDL Migration
-- ==========================================================

-- 1. Create Trusted Records Table (Stores official & custom hashes)
CREATE TABLE IF NOT EXISTS public.trusted_records (
    id TEXT PRIMARY KEY,
    software TEXT NOT NULL,
    vendor TEXT DEFAULT 'Unknown',
    version TEXT NOT NULL,
    category TEXT NOT NULL,
    platform TEXT NOT NULL,
    architecture TEXT NOT NULL DEFAULT 'x86_64',
    file_name TEXT NOT NULL,
    file_size BIGINT,
    sha256 TEXT NOT NULL,
    source TEXT,
    source_url TEXT,
    release_date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fast lookup index on SHA-256 hash and file_name
CREATE INDEX IF NOT EXISTS idx_trusted_records_sha256 ON public.trusted_records (sha256);
CREATE INDEX IF NOT EXISTS idx_trusted_records_file_name ON public.trusted_records (file_name);

-- 2. Create Audit Scans Table (Stores verification history logs)
CREATE TABLE IF NOT EXISTS public.audit_scans (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    sha256 TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('VERIFIED', 'HASH_MISMATCH', 'UNKNOWN')),
    matched_software TEXT,
    version TEXT,
    vendor TEXT,
    scanned_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_scans_sha256 ON public.audit_scans (sha256);
CREATE INDEX IF NOT EXISTS idx_audit_scans_status ON public.audit_scans (status);
CREATE INDEX IF NOT EXISTS idx_audit_scans_scanned_at ON public.audit_scans (scanned_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.trusted_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_scans ENABLE ROW LEVEL SECURITY;

-- 4. Policies: Allow read and insert for authenticated & anonymous users
CREATE POLICY "Public read trusted_records"
    ON public.trusted_records FOR SELECT
    USING (true);

CREATE POLICY "Public insert/update trusted_records"
    ON public.trusted_records FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public read audit_scans"
    ON public.audit_scans FOR SELECT
    USING (true);

CREATE POLICY "Public insert audit_scans"
    ON public.audit_scans FOR INSERT
    WITH CHECK (true);
