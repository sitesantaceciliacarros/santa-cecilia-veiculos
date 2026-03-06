-- ==============================================================================
-- SANTA CECÍLIA VEÍCULOS — Security Audit Fixes: Row Level Security (RLS)
-- Execution: Run this script in the Supabase "SQL Editor"
-- ==============================================================================

-- 1. Enable RLS on all critical tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Vehicles Policies
-- Allow anyone (including unauthenticated users) to read vehicles
CREATE POLICY "Allow public SELECT on vehicles" 
ON vehicles FOR SELECT TO anon, authenticated USING (true);

-- Restrict mutations (INSERT, UPDATE, DELETE) to authenticated users only
CREATE POLICY "Allow authenticated ALL on vehicles" 
ON vehicles FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

-- 3. Sections Policies
-- Allow anyone to read layout sections
CREATE POLICY "Allow public SELECT on sections" 
ON sections FOR SELECT TO anon, authenticated USING (true);

-- Restrict layout modifications to authenticated users
CREATE POLICY "Allow authenticated ALL on sections" 
ON sections FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

-- 4. Leads / Contacts Policies
-- Strict requirement from audit: Protect lead data.
-- Since this is a public form, anon MUST be able to INSERT (drop leads).
-- But anon MUST NOT be able to SELECT or DELETE leads.
CREATE POLICY "Allow anon INSERT to leads" 
ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only authenticated users (admins) can view or modify leads
CREATE POLICY "Allow authenticated ALL on leads" 
ON leads FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

-- 5. Users Policies (Ownership Check)
-- Users can only see and modify their own records based on their auth.uid()
CREATE POLICY "Users can SELECT their own record" 
ON users FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can UPDATE their own record" 
ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Done. Test access by attempting to mutate a vehicle with an unauthenticated client.
