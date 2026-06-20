'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { useAuth } from '@/lib/supabase/auth-context';
import { useProducts, useCreateProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import { ApiLoading } from '@/components/ApiLoading';

export default function AdminPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const { data: products, isLoading: productsLoading, error, isError } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [guard, setGuard] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Comidas',
    imageUrl: '',
    stock: '1',
    expiresInHours: '4'
  });
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else if (profile && profile.role !== 'owner') {
        location.href = '/shop';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading, profile]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const originalPrice = parseFloat(form.originalPrice) || price * 2;
    
    if (!form.name || isNaN(price) || price <= 0) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(form.expiresInHours));

    try {
      await createProduct.mutateAsync({
        businessId: profile.businessId,
        name: form.name,
        description: form.description,
        category: form.category,
        price,
        originalPrice,
        imageUrl: form.imageUrl,
        stock: parseInt(form.stock),
        expiresAt: expiresAt.toISOString()
      });
      
      setForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'Comidas',
        imageUrl: '',
        stock: '1',
        expiresInHours: '4'
      });
      
      alert('Producto creado exitosamente');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await deleteProduct.mutateAsync(productId);
      alert('Producto eliminado');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!guard) return null;

  return (
    <div className="min-h-screen">
      <Nav/>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">Panel de Administración 🏪</h1>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Agregar Producto</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre *</label>
                <input 
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea 
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Precio *</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Precio Original</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Categoría</label>
                  <select 
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/10"
                  >
                    <option>Comidas</option>
                    <option>Postres</option>
                    <option>Bebidas</option>
                    <option>Panadería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock</label>
                  <input 
                    type="number"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">URL de Imagen</label>
                <input 
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Vence en (horas)</label>
                <input 
                  type="number"
                  value={form.expiresInHours}
                  onChange={e => setForm({ ...form, expiresInHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10"
                />
              </div>

              <button 
                type="submit"
                disabled={createProduct.isPending}
                className="w-full py-3 rounded-xl bg-brand-accent text-white font-bold hover:opacity-90 disabled:opacity-50"
              >
                {createProduct.isPending ? 'Creando...' : 'Agregar Producto'}
              </button>
            </form>
          </Card>

          <div>
            <h2 className="text-xl font-bold mb-4">Mis Productos</h2>
            <ApiLoading isLoading={productsLoading} isError={isError} error={error}>
              {!products || products.length === 0 ? (
                <Card>
                  <p className="text-center text-brand-mutedDark/70">
                    No tienes productos aún. ¡Agrega tu primer producto!
                  </p>
                </Card>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {products.map(product => (
                    <Card key={product.id}>
                      <div className="flex items-start gap-3">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover"/>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-brand-mutedDark/70">{product.category}</p>
                          <p className="text-sm font-bold text-brand-accent">S/ {product.price.toFixed(2)}</p>
                          <p className="text-xs text-brand-mutedDark/60">Stock: {product.stock}</p>
                        </div>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteProduct.isPending}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ApiLoading>
          </div>
        </div>
      </div>
    </div>
  );
}
