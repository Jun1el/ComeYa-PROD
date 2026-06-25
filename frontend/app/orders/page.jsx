'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { useAuth } from '@/lib/supabase/auth-context';
import { useCustomerOrders, useCancelOrder } from '@/lib/hooks/useOrders';
import { ApiLoading } from '@/components/ApiLoading';

function getStatusInfo(status) {
  const statusMap = {
    pending: { label: 'Pedido pendiente', color: 'bg-blue-100 text-blue-700', progress: 10 },
    confirmed: { label: 'Pedido aceptado', color: 'bg-blue-100 text-blue-700', progress: 25 },
    preparing: { label: 'Preparando tu pedido', color: 'bg-yellow-100 text-yellow-700', progress: 50 },
    onway: { label: 'En camino', color: 'bg-orange-100 text-orange-700', progress: 75 },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700', progress: 100 },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', progress: 0 }
  };
  return statusMap[status] || { label: 'Procesando...', color: 'bg-gray-100 text-gray-700', progress: 0 };
}

function getOrderStatusInfo(order) {
  if (order.isExpired) {
    return { label: 'Pedido vencido', color: 'bg-gray-200 text-gray-700', progress: 0 };
  }

  return getStatusInfo(order.status);
}

export default function OrdersPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const canLoadOrders = isAuthenticated && profile?.role !== 'owner';
  const { data: orders, isLoading, error, isError, refetch } = useCustomerOrders({
    enabled: canLoadOrders,
  });
  const cancelOrder = useCancelOrder();
  const [guard, setGuard] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else if (profile?.role === 'owner') {
        location.href = '/admin/orders';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading, profile]);

  const handleCancel = async (orderId) => {
    if (!confirm('Estas seguro de cancelar este pedido?')) return;

    try {
      await cancelOrder.mutateAsync(orderId);
      alert('Pedido cancelado');
    } catch (err) {
      alert('Error al cancelar: ' + err.message);
    }
  };

  if (!guard) return null;

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">Mis Pedidos</h1>

        <ApiLoading isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
          {!orders || orders.length === 0 ? (
            <Card>
              <p className="text-center text-brand-mutedDark/70">
                No tienes pedidos aun. Haz tu primera orden desde la tienda.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map(order => {
                const statusInfo = getOrderStatusInfo(order);
                const orderDate = new Date(order.createdAt);
                const expiresAt = order.expiresAt ? new Date(order.expiresAt) : null;

                return (
                  <Card key={order.id}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg">Pedido #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-brand-mutedDark/60">
                            {orderDate.toLocaleDateString()} - {orderDate.toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-brand-mutedDark/70 mt-1">
                            Restaurante: {order.businessName}
                          </p>
                          {expiresAt && (
                            <p className="text-sm text-brand-mutedDark/70">
                              Vence: {expiresAt.toLocaleDateString()} - {expiresAt.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">S/ {order.total.toFixed(2)}</div>
                          <div className={`text-xs px-2 py-1 rounded-lg ${statusInfo.color} font-semibold`}>
                            {statusInfo.label}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">Progreso del pedido</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-brand-accent h-3 rounded-full transition-all duration-500"
                            style={{ width: `${statusInfo.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-brand-mutedDark/60">
                          <span>Aceptado</span>
                          <span>Preparando</span>
                          <span>En camino</span>
                          <span>Entregado</span>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-sm font-semibold mb-2">Productos:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-semibold">{item.quantity}x</span> {item.name}
                              </div>
                              <span className="text-brand-mutedDark/70">S/ {item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                          <div className="flex justify-between text-brand-mutedDark/70">
                            <span>Subtotal</span>
                            <span>S/ {order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-brand-mutedDark/70">
                            <span>Envio</span>
                            <span>S/ {order.shippingCost.toFixed(2)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Descuento {order.couponCode && `(${order.couponCode})`}</span>
                              <span>-S/ {order.discount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {order.isExpired && (
                        <p className="text-sm text-brand-mutedDark/70">
                          Este pedido ya vencio y no puede modificarse.
                        </p>
                      )}

                      {order.status === 'pending' && !order.isExpired && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelOrder.isPending}
                          className="w-full py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancelar Pedido
                        </button>
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
