'use client';
import { StoreProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/supabase/auth-context';
import { QueryProvider } from '@/lib/hooks/query-provider';

export default function Providers({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
