'use client';
import { useQuery } from '@tanstack/react-query';
import { superadminApi } from '../api/superadmin';

export function useSuperAdminMetrics(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'metrics'],
    queryFn: () => superadminApi.getMetrics(),
    refetchInterval: 60000,
    retry: 1,
    ...options,
  });
}
