'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { useAuth } from '@/lib/supabase/auth-context';
import { useBusinessOrders, useUpdateOrderStatus } from '@/lib/hooks/useOrders';
import { ApiLoading } from '@/components/ApiLoading';

const statusInfo = {
  pending: { label: 'Pendiente', color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Aceptado', color: 'bg-indigo-100 text-indigo-700' },
  preparing: { label: 'En preparacion', color: 'bg-yellow-100 text-yellow-700' },
  onway: { label: 'En camino', color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

const nextActions = {
  pending: { label: 'Aceptar pedido', nextStatus: 'confirmed' },
  confirmed: { label: 'Iniciar preparacion', nextStatus: 'preparing' },
  preparing: { label: 'Marcar como enviado', nextStatus: 'onway' },
  onway: { label: 'Marcar como entregado', nextStatus: 'delivered' }
};

function getStatusInfo(status) {
  return statusInfo[status] || { label: 'Estado desconocido', color: 'bg-gray-100 text-gray-700' };
}

function getOrderStatusInfo(order) {
  if (order.isExpired) {
    return { label: 'Pedido vencido', color: 'bg-gray-200 text-gray-700' };
  }

  return getStatusInfo(order.status);
}

export default function AdminOrdersPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const canLoadOrders = isAuthenticated && profile?.role === 'owner';
  const { data: orders, isLoading, error, isError, refetch } = useBusinessOrders({
    enabled: canLoadOrders,
  });
  const updateStatus = useUpdateOrderStatus();
  const [guard, setGuard] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else if (profile && profile.role !== 'owner') {
        location.href = '/orders';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading, profile]);

  const handleUpdateStatus = async (order, action) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: action.nextStatus });
    } catch (err) {
      alert('Error al actualizar el pedido: ' + err.message);
    }
  };

  if (!guard) return null;

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Pedidos recibidos</h1>
            <p className="text-sm text-brand-mutedDark/70">
              Gestiona los pedidos entrantes de tu restaurante.
            </p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-lg bg-brand-primary/30 hover:bg-brand-primary/50 font-semibold"
          >
            Actualizar
          </button>
        </div>

        <ApiLoading isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
          {!orders || orders.length === 0 ? (
            <Card>
              <p className="text-center text-brand-mutedDark/70">
                Aun no recibes pedidos.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map(order => {
                const currentStatus = getOrderStatusInfo(order);
                const action = order.isExpired ? null : nextActions[order.status];
                const orderDate = new Date(order.createdAt);
                const expiresAt = order.expiresAt ? new Date(order.expiresAt) : null;

                return (
                  <Card key={order.id}>
                    <div className="space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div>
                          <h2 className="font-bold text-lg">Pedido #{order.id.slice(0, 8)}</h2>
                          <p className="text-sm text-brand-mutedDark/60">
                            {orderDate.toLocaleDateString()} - {orderDate.toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-brand-mutedDark/80 mt-1">
                            Cliente: {order.customerName || order.customerEmail || 'Cliente'}
                          </p>
                        </div>
                        <div className="lg:text-right">
                          <div className="font-bold text-xl">S/ {order.total.toFixed(2)}</div>
                          <span className={`inline-block text-xs px-2 py-1 rounded-lg ${currentStatus.color} font-semibold`}>
                            {currentStatus.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg bg-brand-primary/10 p-3">
                          <p className="font-semibold">Entrega</p>
                          <p className="text-brand-mutedDark/70">{order.deliveryDistrict || 'Sin distrito'}</p>
                          <p className="text-brand-mutedDark/70">{order.deliveryAddress || 'Sin direccion'}</p>
                          {expiresAt && (
                            <p className="text-brand-mutedDark/70">
                              Vence: {expiresAt.toLocaleDateString()} - {expiresAt.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className="rounded-lg bg-brand-primary/10 p-3">
                          <p className="font-semibold">Pago</p>
                          <p className="text-brand-mutedDark/70">{order.paymentMethod}</p>
                          <p className="text-brand-mutedDark/70">Envio: S/ {order.shippingCost.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-brand-primary/10 p-3">
                          <p className="font-semibold">Notas</p>
                          <p className="text-brand-mutedDark/70">{order.notes || 'Sin notas'}</p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-sm font-semibold mb-2">Productos:</p>
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm gap-3">
                              <div>
                                <span className="font-semibold">{item.quantity}x</span> {item.name}
                              </div>
                              <span className="text-brand-mutedDark/70">S/ {item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {action ? (
                        <button
                          onClick={() => handleUpdateStatus(order, action)}
                          disabled={updateStatus.isPending}
                          className="w-full md:w-auto px-5 py-2 rounded-lg bg-brand-accent text-white font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                          {updateStatus.isPending ? 'Actualizando...' : action.label}
                        </button>
                      ) : (
                        <p className="text-sm text-brand-mutedDark/60">
                          {order.isExpired
                            ? 'Este pedido ya vencio y no puede modificarse.'
                            : 'Este pedido ya no tiene acciones pendientes para el restaurante.'}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </ApiLoading>
      </div>
    </div>
  );
}
