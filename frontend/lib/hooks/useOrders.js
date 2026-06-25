'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getMyOrders(),
    refetchInterval: 30000,
    retry: 1,
  });
}

export function useCustomerOrders(options = {}) {
  return useQuery({
    queryKey: ['orders', 'customer'],
    queryFn: () => ordersApi.getCustomerOrders(),
    refetchInterval: 30000,
    retry: 1,
    ...options,
  });
}

export function useBusinessOrders(options = {}) {
  return useQuery({
    queryKey: ['orders', 'business'],
    queryFn: () => ordersApi.getBusinessOrders(),
    refetchInterval: 30000,
    retry: 1,
    ...options,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
    refetchInterval: 10000,
    retry: 1,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order) => ordersApi.create(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'customer'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'business'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'customer'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'business'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => ordersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'customer'] });
    },
  });
}
