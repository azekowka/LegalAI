-- Quick fix for RLS policy issue
-- Run this in your Supabase SQL editor

-- Disable RLS on documents table
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view own deleted documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'documents' AND schemaname = 'public';

-- The rowsecurity column should show 'f' (false) after running this script


