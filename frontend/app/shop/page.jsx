'use client';
import { useEffect, useMemo, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { useAuth } from '@/lib/supabase/auth-context';
import { useProducts } from '@/lib/hooks/useProducts';
import { ApiLoading } from '@/components/ApiLoading';
import { useStore } from '@/lib/store';
import { formatRemainingTime, getProductUrgency } from '@/lib/product-urgency.mjs';

export default function ShopPage() {
  const { user, profile, isAuthenticated, loading } = useAuth();
  const { addToCart } = useStore();
  
  const [guard, setGuard] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading]);

  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBusiness, setSelectedBusiness] = useState('Todos');
  const [selectedDistrict, setSelectedDistrict] = useState('Todos');
  const [priceRange, setPriceRange] = useState('Todos');
  const [sortBy, setSortBy] = useState('default');
  const [distanceRadius, setDistanceRadius] = useState('Todos');
  const [viewMode, setViewMode] = useState('grid');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timeoutId);
  }, [q]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const priceParams = useMemo(() => {
    if (priceRange === 'S/ 0 - 10') return { minPrice: 0, maxPrice: 10 };
    if (priceRange === 'S/ 10 - 25') return { minPrice: 10, maxPrice: 25 };
    if (priceRange === 'S/ 25+') return { minPrice: 25 };
    return {};
  }, [priceRange]);

  const searchParams = useMemo(() => ({
    ...(debouncedQ ? { q: debouncedQ } : {}),
    ...(selectedCategory !== 'Todos' ? { category: selectedCategory } : {}),
    ...(selectedBusiness !== 'Todos' ? { businessId: selectedBusiness } : {}),
    ...(selectedDistrict !== 'Todos' ? { district: selectedDistrict } : {}),
    ...priceParams,
    ...(profile?.district ? { originDistrict: profile.district } : {}),
    ...(profile?.district && distanceRadius !== 'Todos'
      ? { maxDistanceKm: Number(distanceRadius) }
      : {}),
    sort: sortBy === 'default' ? 'expires-soon' : sortBy,
    limit: 100,
  }), [debouncedQ, selectedCategory, selectedBusiness, selectedDistrict, priceParams, profile?.district, distanceRadius, sortBy]);

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    isError,
  } = useProducts(searchParams, { refetchInterval: 60_000 });
  const { data: filterOptions } = useProducts({ limit: 100 });

  const categories = ['Todos', 'Comidas', 'Postres', 'Bebidas', 'Panadería'];
  const businesses = useMemo(() => {
    const uniqueBusinesses = new Map();
    (filterOptions || []).forEach(product => {
      if (product.business?.id) uniqueBusinesses.set(product.business.id, product.business.name);
    });
    return Array.from(uniqueBusinesses, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filterOptions]);
  const districts = useMemo(() => ['Todos', ...Array.from(new Set((filterOptions || []).map(p => p.business?.district).filter(Boolean))).sort()], [filterOptions]);
  const priceRanges = ['Todos', 'S/ 0 - 10', 'S/ 10 - 25', 'S/ 25+'];
  
  const filtered = useMemo(() => {
    return (products || []).filter(product => new Date(product.expiresAt).getTime() > now);
  }, [products, now]);

  const groupedByBusiness = useMemo(() => {
    const groups = {};
    filtered.forEach(product => {
      const businessName = product.business?.name || 'Unknown';
      if (!groups[businessName]) {
        groups[businessName] = {
          businessName,
          district: product.business?.district || '',
          products: []
        };
      }
      groups[businessName].products.push(product);
    });
    return Object.values(groups).sort((a, b) => a.businessName.localeCompare(b.businessName));
  }, [filtered]);

  const clearFilters = () => {
    setQ('');
    setSelectedCategory('Todos');
    setSelectedBusiness('Todos');
    setSelectedDistrict('Todos');
    setPriceRange('Todos');
    setSortBy('default');
    setDistanceRadius('Todos');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (q) count++;
    if (selectedCategory !== 'Todos') count++;
    if (selectedBusiness !== 'Todos') count++;
    if (selectedDistrict !== 'Todos') count++;
    if (priceRange !== 'Todos') count++;
    if (sortBy !== 'default') count++;
    if (distanceRadius !== 'Todos') count++;
    return count;
  }, [q, selectedCategory, selectedBusiness, selectedDistrict, priceRange, sortBy, distanceRadius]);

  const ProductCard = ({ p }) => {
    const urgency = getProductUrgency(p.expiresAt, now);
    const urgencyStyles = {
      urgent: 'bg-red-100 text-red-700 animate-pulse',
      soon: 'bg-orange-100 text-orange-700',
      available: 'bg-green-100 text-green-700',
    };

    return (
      <Card key={p.id} image={p.imageUrl}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-brand-mutedDark/70">{p.description}</p>
            <div className="text-xs mt-2 space-y-1">
              <div><span className="px-2 py-0.5 rounded-lg bg-brand-secondary/30">{p.category}</span></div>
              {p.business?.name && (
                <div className="text-brand-mutedDark/70">{p.business.name}</div>
              )}
              {p.business?.district && (
                <div className="flex items-center gap-1">
                  <span className="text-brand-mutedDark/70">{p.business.district}</span>
                  {p.distanceKm !== null && p.distanceKm !== undefined && (
                    <span className="font-semibold text-brand-accent">• {Number(p.distanceKm).toFixed(1)} km</span>
                  )}
                </div>
              )}
              {urgency.key !== 'expired' && (
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 ${urgencyStyles[urgency.key]}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {urgency.label} • {formatRemainingTime(urgency.remainingMs)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="space-y-1">
              {p.originalPrice && (
                <div className="text-xs text-brand-mutedDark/50 line-through">
                  S/ {p.originalPrice.toFixed(2)}
                </div>
              )}
              <div className="font-bold text-lg text-brand-accent">
                S/ {p.price.toFixed(2)}
              </div>
              {p.discountPercentage > 0 && (
                <div className="text-xs font-semibold text-green-600">
                  ¡-{p.discountPercentage}%!
                </div>
              )}
            </div>
            <button
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className="mt-2 text-xs px-2 py-1 rounded-md bg-brand-accent text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {p.stock > 0 ? `Agregar (${p.stock})` : 'Agotado'}
            </button>
          </div>
        </div>
      </Card>
    );
  };

  if (!guard) return null;

  const userMembership = profile?.membership || 'Free';
  const isPremium = userMembership === 'Premium';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/5 to-white">
      <Nav/>
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-4 space-y-3">
          <div className="glass rounded-xl p-3 flex items-center justify-between">
            <p className="text-sm">
              <span className="font-semibold">{profile?.fullName}</span> | 
              <span className="text-brand-mutedDark/70"> Tu ubicación: {profile?.district}</span>
            </p>
            
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isPremium 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {isPremium ? '⭐ Premium' : 'Free'}
            </div>
          </div>

          {!isPremium && (
            <div className="glass rounded-xl p-4 bg-gradient-to-r from-brand-secondary/10 to-brand-primary/10 border-2 border-brand-accent/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">✨ Upgrade a Premium por S/ 9.90</h4>
                  <p className="text-xs text-brand-mutedDark/70">
                    Desbloquea cupones exclusivos y obtén hasta 20% OFF en tus compras
                  </p>
                </div>
                <a 
                  href="/profile"
                  className="px-4 py-2 rounded-lg bg-brand-accent text-white text-xs font-semibold hover:opacity-90 whitespace-nowrap"
                >
                  Ver Planes
                </a>
              </div>
            </div>
          )}
        </div>

        <ApiLoading isLoading={productsLoading} isError={isError} error={productsError}>
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-4 sticky top-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Filtros</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-brand-accent hover:underline font-semibold"
                    >
                      Limpiar ({activeFiltersCount})
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Buscar</label>
                  <input 
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm" 
                    placeholder="Nombre, restaurante..." 
                    value={q} 
                    onChange={e => setQ(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Vista</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-brand-accent text-white' 
                          : 'bg-brand-primary/10 hover:bg-brand-primary/20'
                      }`}
                    >
                      Cuadrícula
                    </button>
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'grouped' 
                          ? 'bg-brand-accent text-white' 
                          : 'bg-brand-primary/10 hover:bg-brand-primary/20'
                      }`}
                    >
                      Restaurantes
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Categoría</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm" 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Restaurante</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm" 
                    value={selectedBusiness} 
                    onChange={e => setSelectedBusiness(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Distrito</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm" 
                    value={selectedDistrict} 
                    onChange={e => setSelectedDistrict(e.target.value)}
                  >
                    {districts.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Precio</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm" 
                    value={priceRange} 
                    onChange={e => setPriceRange(e.target.value)}
                  >
                    {priceRanges.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Cercanía</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm disabled:opacity-50"
                    value={distanceRadius}
                    onChange={e => setDistanceRadius(e.target.value)}
                    disabled={!profile?.district}
                  >
                    <option value="Todos">Sin límite</option>
                    <option value="0">Mismo distrito</option>
                    <option value="5">Hasta 5 km</option>
                    <option value="10">Hasta 10 km</option>
                    <option value="20">Hasta 20 km</option>
                  </select>
                  {!profile?.district && (
                    <p className="mt-1 text-xs text-brand-mutedDark/60">Agrega tu distrito en el perfil para usar cercanía.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Ordenar por</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-black/10 focus:border-brand-accent focus:outline-none text-sm" 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="default">Por defecto</option>
                    <option value="expires-soon">Próximos a vencer</option>
                    <option value="name-asc">Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                    <option value="price-asc">Precio (menor a mayor)</option>
                    <option value="price-desc">Precio (mayor a menor)</option>
                    <option value="distance" disabled={!profile?.district}>Más cercanos</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-brand-mutedDark/70">
                  {viewMode === 'grid' ? (
                    <span>Mostrando <strong>{filtered.length}</strong> productos</span>
                  ) : (
                    <span>Mostrando <strong>{groupedByBusiness.length}</strong> restaurantes con <strong>{filtered.length}</strong> productos</span>
                  )}
                </div>
              </div>

              {viewMode === 'grid' && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-primary/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-brand-mutedDark/70 font-semibold">No se encontraron productos con esos filtros</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-3 text-sm text-brand-accent hover:underline font-semibold"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  ) : (
                    filtered.map(p => <ProductCard key={p.id} p={p} />)
                  )}
                </div>
              )}

              {viewMode === 'grouped' && (
                <div className="space-y-6">
                  {groupedByBusiness.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-primary/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-brand-mutedDark/70 font-semibold">No se encontraron restaurantes con esos filtros</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-3 text-sm text-brand-accent hover:underline font-semibold"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  ) : (
                    groupedByBusiness.map(group => (
                      <div key={group.businessName} className="glass rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
                          <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                              {group.businessName}
                            </h2>
                            <p className="text-sm text-brand-mutedDark/70 mt-1">
                              {group.district} • {group.products.length} {group.products.length === 1 ? 'producto' : 'productos'} disponibles
                            </p>
                          </div>
                          <div className="text-sm px-3 py-1 rounded-lg bg-green-100 text-green-700 font-semibold">
                            Hasta -{Math.max(...group.products.map(p => p.discountPercentage || 0))}% OFF
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.products.map(p => <ProductCard key={p.id} p={p} />)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </ApiLoading>
      </div>
    </div>
  );
}
