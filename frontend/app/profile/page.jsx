'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { useAuth } from '@/lib/supabase/auth-context';
import { useUpdateProfile, useUpgradeToPremium } from '@/lib/hooks/useProfile';
import { ApiLoading } from '@/components/ApiLoading';

const DISTRICTS = [
  "San Martin de Porres", "Comas", "Los Olivos", "Independencia",
  "San Juan de Miraflores", "Villa el Salvador", "Chorrillos",
  "El Agustino", "Ate", "Santa Anita"
];

export default function ProfilePage() {
  const { signOut, isAuthenticated, profile, loading } = useAuth();
  const updateProfile = useUpdateProfile();
  const upgradePremium = useUpgradeToPremium();
  
  const [guard, setGuard] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', district: '' });
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        district: profile.district || ''
      });
    }
  }, [profile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      setEditing(false);
      alert('Perfil actualizado');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpgrade = async () => {
    if (!confirm('¿Deseas actualizar a Premium por S/ 9.90/mes?')) return;
    try {
      await upgradePremium.mutateAsync();
      alert('¡Bienvenido a Premium!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    location.href = '/login';
  };

  if (!guard) return null;

  return (
    <div className="min-h-screen">
      <Nav/>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">Mi Perfil 👤</h1>
        
        <ApiLoading isLoading={false} isError={false} error={null}>
          {profile && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Información Personal</h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    profile.membership === 'Premium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {profile.membership === 'Premium' ? '⭐ Premium' : 'Free'}
                  </div>
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Nombre</label>
                      <input 
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-black/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Distrito</label>
                      <select 
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-black/10"
                      >
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="flex-1 py-2 rounded-lg bg-brand-accent text-white font-semibold disabled:opacity-50"
                      >
                        {updateProfile.isPending ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex-1 py-2 rounded-lg bg-gray-200 font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-brand-mutedDark/70">Email:</span>
                      <span className="font-semibold">{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-mutedDark/70">Nombre:</span>
                      <span className="font-semibold">{profile.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-mutedDark/70">Rol:</span>
                      <span className="font-semibold">{profile.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-mutedDark/70">Distrito:</span>
                      <span className="font-semibold">{profile.district}</span>
                    </div>
                    <button 
                      onClick={() => setEditing(true)}
                      className="w-full mt-3 py-2 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 font-semibold"
                    >
                      Editar Perfil
                    </button>
                  </div>
                )}
              </Card>

              {profile.membership !== 'Premium' && (
                <Card>
                  <h2 className="text-xl font-bold mb-3">✨ Upgrade a Premium</h2>
                  <p className="text-sm text-brand-mutedDark/70 mb-4">
                    Desbloquea cupones exclusivos, descuentos adicionales y soporte prioritario por solo S/ 9.90/mes.
                  </p>
                  <button 
                    onClick={handleUpgrade}
                    disabled={upgradePremium.isPending}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {upgradePremium.isPending ? 'Procesando...' : 'Actualizar a Premium'}
                  </button>
                </Card>
              )}

              {profile.stats && (
                <Card>
                  <h2 className="text-xl font-bold mb-3">Tu Impacto 🌍</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-green-50">
                      <div className="text-3xl font-bold text-green-600">{profile.stats.mealsRescued}</div>
                      <div className="text-sm text-brand-mutedDark/70">Comidas rescatadas</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-blue-50">
                      <div className="text-3xl font-bold text-blue-600">S/ {profile.stats.moneySaved.toFixed(2)}</div>
                      <div className="text-sm text-brand-mutedDark/70">Dinero ahorrado</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-purple-50">
                      <div className="text-3xl font-bold text-purple-600">{profile.stats.co2Avoided.toFixed(1)} kg</div>
                      <div className="text-sm text-brand-mutedDark/70">CO₂ evitado</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-orange-50">
                      <div className="text-3xl font-bold text-orange-600">{profile.stats.totalOrders}</div>
                      <div className="text-sm text-brand-mutedDark/70">Pedidos realizados</div>
                    </div>
                  </div>
                </Card>
              )}

              <button 
                onClick={handleSignOut}
                className="w-full py-3 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </ApiLoading>
      </div>
    </div>
  );
}
