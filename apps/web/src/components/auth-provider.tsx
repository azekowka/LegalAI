'use client'

import { ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}

// Custom hook to use session data
export function useAuthSession() {
  const session = useSession();
  
  return {
    user: session.data?.user || null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    session: session.data?.session || null
  };
}
