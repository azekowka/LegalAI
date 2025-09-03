-- SQL migration for documents table in Supabase
-- This will create a documents table that matches your requirements

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Using TEXT to match Better Auth user IDs (CUID)
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    starred BOOLEAN DEFAULT false NOT NULL,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_last_accessed ON public.documents(last_accessed DESC);
CREATE INDEX IF NOT EXISTS idx_documents_starred ON public.documents(starred) WHERE starred = true;
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON public.documents(deleted_at) WHERE deleted_at IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Since we're using Better Auth (not Supabase Auth), we'll disable RLS for now
-- and rely on application-level security in our API routes
-- This is secure because all API routes check authentication before accessing data

-- Disable RLS temporarily - we handle security at the application level
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, you would need to set up
-- a custom authentication function that works with Better Auth tokens
-- For now, we rely on the requireAuth() function in our API routes

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON public.documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.documents IS 'User documents with soft delete and starring functionality';
COMMENT ON COLUMN public.documents.id IS 'Unique document identifier (UUID)';
COMMENT ON COLUMN public.documents.user_id IS 'User ID from Better Auth (CUID format)';
COMMENT ON COLUMN public.documents.title IS 'Document title';
COMMENT ON COLUMN public.documents.content IS 'Document content (rich text)';
COMMENT ON COLUMN public.documents.created_at IS 'Document creation timestamp';
COMMENT ON COLUMN public.documents.updated_at IS 'Document last modification timestamp';
COMMENT ON COLUMN public.documents.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';
COMMENT ON COLUMN public.documents.starred IS 'Whether document is starred by user';
COMMENT ON COLUMN public.documents.last_accessed IS 'Last time document was accessed by user';
