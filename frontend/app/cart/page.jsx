'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { useAuth } from '@/lib/supabase/auth-context';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { useStore } from '@/lib/store';
import { ApiLoading } from '@/components/ApiLoading';

export default function CartPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const { cartDetailed, changeQty, removeFromCart, clearCart, subtotal } = useStore();
  const createOrder = useCreateOrder();
  
  const [guard, setGuard] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading]);

  const shippingCost = 4.00;
  const discount = appliedCoupon ? subtotal * 0.10 : 0;
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    if (couponCode.toUpperCase() === 'PRIMERA30') {
      setAppliedCoupon({ code: 'PRIMERA30', discount: 0.30 });
      setCouponCode('');
    } else if (couponCode.toUpperCase() === 'PREMIUM20' && profile?.membership === 'Premium') {
      setAppliedCoupon({ code: 'PREMIUM20', discount: 0.20 });
      setCouponCode('');
    } else {
      alert('Cupón no válido');
    }
  };

  const handleOrder = async () => {
    if (cartDetailed.length === 0) return;
    
    const items = cartDetailed.map(item => ({
      productId: item.id,
      businessId: item.businessId,
      quantity: item.qty
    }));

    try {
      await createOrder.mutateAsync({
        items,
        deliveryAddress: profile?.district,
        deliveryDistrict: profile?.district,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        discount,
        notes
      });
      
      clearCart();
      alert('¡Pedido creado exitosamente!');
      location.href = '/orders';
    } catch (err) {
      alert('Error al crear el pedido: ' + err.message);
    }
  };

  if (!guard) return null;

  return (
    <div className="min-h-screen">
      <Nav/>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">Carrito 🛒</h1>
        
        {cartDetailed.length === 0 ? (
          <Card>
            <p className="text-center text-brand-mutedDark/70">
              Tu carrito está vacío. ¡Agrega productos desde la tienda! 🛍️
            </p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cartDetailed.map(item => (
                <Card key={item.id}>
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover"/>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-brand-mutedDark/70">{item.business?.name}</p>
                      <p className="text-sm font-bold text-brand-accent">S/ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => changeQty(item.id, item.qty - 1)}
                        className="w-8 h-8 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.qty}</span>
                      <button 
                        onClick={() => changeQty(item.id, item.qty + 1)}
                        className="w-8 h-8 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card>
                <h3 className="font-bold text-lg mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>S/ {shippingCost.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-S/ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-accent">S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cupón de descuento</label>
                    <div className="flex gap-2">
                      <input 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="PRIMERA30"
                        className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 rounded-lg bg-brand-accent text-white text-sm font-semibold"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Método de pago</label>
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta (simulado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Notas (opcional)</label>
                    <textarea 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Instrucciones especiales..."
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm"
                      rows={2}
                    />
                  </div>

                  <button 
                    onClick={handleOrder}
                    disabled={createOrder.isPending}
                    className="w-full py-3 rounded-xl bg-brand-accent text-white font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {createOrder.isPending ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
