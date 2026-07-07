'use client';
/* eslint-disable @next/next/no-img-element -- Las imágenes usan URLs configuradas por cada negocio. */

import { useEffect, useMemo, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { ApiLoading } from '@/components/ApiLoading';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  useCreateProduct,
  useDeleteProduct,
  useMyProducts,
  useUpdateProduct,
} from '@/lib/hooks/useProducts';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: 'Comidas',
  imageUrl: '',
  stock: '1',
  expiresInHours: '4',
  expiresAt: '',
};

const TABS = [
  { id: 'published', label: 'Publicados' },
  { id: 'attention', label: 'Requieren atención' },
  { id: 'inactive', label: 'Inactivos' },
];

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function statusLabel(product) {
  if (!product.isActive) return 'Inactivo';
  if (product.stock <= 0) return 'Agotado';
  if (new Date(product.expiresAt) <= new Date()) return 'Vencido';
  return 'Publicado';
}

export default function AdminPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const [guard, setGuard] = useState(false);
  const [activeTab, setActiveTab] = useState('published');
  const [editing, setEditing] = useState(null);
  const [republishing, setRepublishing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const productsQuery = useMyProducts({ enabled: guard && !!profile?.businessId });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) location.href = '/login';
      else if (profile?.role !== 'owner') location.href = '/shop';
      else setGuard(true);
    }
  }, [isAuthenticated, loading, profile]);

  const grouped = useMemo(() => {
    const products = productsQuery.data || [];
    return {
      published: products.filter(product => product.status === 'published'),
      attention: products.filter(product => product.status === 'attention'),
      inactive: products.filter(product => product.status === 'inactive'),
    };
  }, [productsQuery.data]);

  const resetForm = () => {
    setEditing(null);
    setRepublishing(false);
    setForm(EMPTY_FORM);
  };

  const startEditing = (product, shouldRepublish = false) => {
    setEditing(product);
    setRepublishing(shouldRepublish);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      category: product.category,
      imageUrl: product.imageUrl || '',
      stock: product.stock.toString(),
      expiresInHours: '4',
      expiresAt: toLocalDateTime(product.expiresAt),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const price = Number(form.price);
    const originalPrice = Number(form.originalPrice) || price * 2;
    const stock = Number.parseInt(form.stock, 10);

    if (!form.name.trim() || price <= 0 || originalPrice < price || stock < 0) {
      alert('Revisa el nombre, los precios y el stock.');
      return;
    }

    const expiresAt = editing
      ? new Date(form.expiresAt)
      : new Date(Date.now() + Number.parseInt(form.expiresInHours, 10) * 60 * 60 * 1000);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      alert('El vencimiento debe ser una fecha futura.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description,
      category: form.category,
      price,
      originalPrice,
      imageUrl: form.imageUrl,
      stock,
      expiresAt: expiresAt.toISOString(),
    };

    try {
      if (editing) {
        await updateProduct.mutateAsync({
          id: editing.id,
          ...payload,
          expectedStock: editing.stock,
          isActive: republishing ? true : editing.isActive,
        });
        alert(republishing ? 'Producto republicado.' : 'Producto actualizado.');
      } else {
        await createProduct.mutateAsync(payload);
        alert('Producto creado exitosamente.');
      }
      resetForm();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeactivate = async (product) => {
    if (!confirm(`¿Desactivar "${product.name}"? Dejará de mostrarse en la tienda.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      alert('Producto desactivado.');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!guard) return null;

  const visibleProducts = grouped[activeTab];
  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-1">Panel de administración 🏪</h1>
        <p className="text-sm text-brand-mutedDark/70 mb-4">
          Publica, corrige y renueva los productos de tu negocio.
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">
                {editing ? (republishing ? 'Republicar producto' : 'Editar producto') : 'Agregar producto'}
              </h2>
              {editing && (
                <button type="button" onClick={resetForm} className="text-sm font-semibold text-brand-accent">
                  Cancelar
                </button>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block text-sm font-semibold">
                Nombre *
                <input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" required />
              </label>

              <label className="block text-sm font-semibold">
                Descripción
                <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" rows={2} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Precio *
                  <input type="number" min="0.01" step="0.01" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" required />
                </label>
                <label className="text-sm font-semibold">
                  Precio original *
                  <input type="number" min="0.01" step="0.01" value={form.originalPrice} onChange={event => setForm({ ...form, originalPrice: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" required={!!editing} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Categoría
                  <select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10">
                    <option>Comidas</option><option>Postres</option><option>Bebidas</option><option>Panadería</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Stock
                  <input type="number" min="0" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                URL de imagen
                <input type="url" value={form.imageUrl} onChange={event => setForm({ ...form, imageUrl: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" placeholder="https://..." />
              </label>
              {form.imageUrl && <img src={form.imageUrl} alt="Vista previa" className="w-full h-36 rounded-xl object-cover bg-black/5" />}

              {editing ? (
                <label className="block text-sm font-semibold">
                  Fecha y hora de vencimiento *
                  <input type="datetime-local" value={form.expiresAt} onChange={event => setForm({ ...form, expiresAt: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" required />
                </label>
              ) : (
                <label className="block text-sm font-semibold">
                  Vence en (horas)
                  <input type="number" min="1" value={form.expiresInHours} onChange={event => setForm({ ...form, expiresInHours: event.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10" />
                </label>
              )}

              {republishing && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">Para republicar necesitas stock mayor a cero y una fecha futura.</p>}

              <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-brand-accent text-white font-bold hover:opacity-90 disabled:opacity-50">
                {saving ? 'Guardando...' : editing ? (republishing ? 'Guardar y republicar' : 'Guardar cambios') : 'Agregar producto'}
              </button>
            </form>
          </Card>

          <section>
            <h2 className="text-xl font-bold mb-3">Mis productos</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3" role="tablist" aria-label="Estado de productos">
              {TABS.map(tab => (
                <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-semibold ${activeTab === tab.id ? 'bg-brand-accent text-white' : 'bg-white border border-black/10'}`}>
                  {tab.label} ({grouped[tab.id].length})
                </button>
              ))}
            </div>

            <ApiLoading isLoading={productsQuery.isLoading} isError={productsQuery.isError} error={productsQuery.error}>
              {visibleProducts.length === 0 ? (
                <Card><p className="text-center text-brand-mutedDark/70">No hay productos en esta sección.</p></Card>
              ) : (
                <div className="space-y-3 max-h-[680px] overflow-y-auto">
                  {visibleProducts.map(product => (
                    <Card key={product.id}>
                      <div className="flex items-start gap-3">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-lg object-cover" /> : <div className="w-20 h-20 rounded-lg bg-black/5 grid place-items-center text-2xl">🍽️</div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            <span className="text-xs font-semibold rounded-full bg-black/5 px-2 py-1">{statusLabel(product)}</span>
                          </div>
                          <p className="text-sm text-brand-mutedDark/70">{product.category}</p>
                          <p className="text-sm font-bold text-brand-accent">S/ {product.price.toFixed(2)}</p>
                          <p className="text-xs text-brand-mutedDark/60">Stock: {product.stock} · Vence: {new Date(product.expiresAt).toLocaleString('es-PE')}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 mt-3 pt-3 border-t border-black/5">
                        <button type="button" onClick={() => startEditing(product)} className="px-3 py-2 rounded-lg border border-brand-accent text-brand-accent text-sm font-semibold">Editar</button>
                        {product.isActive ? (
                          <button type="button" onClick={() => handleDeactivate(product)} disabled={deleteProduct.isPending} className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-50">Desactivar</button>
                        ) : (
                          <button type="button" onClick={() => startEditing(product, true)} className="px-3 py-2 rounded-lg bg-brand-accent text-white text-sm font-semibold">Republicar</button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ApiLoading>
          </section>
        </div>
      </main>
    </div>
  );
}
