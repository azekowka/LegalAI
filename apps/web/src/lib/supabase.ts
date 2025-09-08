import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: number;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          starred: boolean;
          last_accessed: string | null;
          share_link_id: string | null;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          starred?: boolean;
          last_accessed?: string | null;
          share_link_id?: string | null;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          starred?: boolean;
          last_accessed?: string | null;
          share_link_id?: string | null;
          is_public?: boolean;
        };
      };
    };
  };
};