'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';

const DISTRICTS = [
  "San Martin de Porres",
  "Comas",
  "Los Olivos",
  "Independencia",
  "San Juan de Miraflores",
  "Villa el Salvador",
  "Chorrillos",
  "El Agustino",
  "Ate",
  "Santa Anita"
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    district: DISTRICTS[0],
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password || !formData.name) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    setLoading(true);

    try {
      const metadata = {
        full_name: formData.name,
        role: formData.role,
        district: formData.district,
        business_name: formData.role === 'owner' ? formData.name : undefined
      };

      await signUp(formData.email, formData.password, metadata);
      
      setSuccess(true);
      setTimeout(() => {
        location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-brand-primary/40 to-brand-secondary/30">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-2xl shadow-soft p-8 w-full max-w-md text-center"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
          <p className="text-brand-mutedDark/80">
            Redirigiendo al login...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-brand-primary/40 to-brand-secondary/30 py-8">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="glass rounded-2xl shadow-soft p-6 w-full max-w-md"
      >
        <div className="flex justify-center mb-4">
          <Image 
            src="/images/ComeYaLogo.png" 
            alt="ComeYa Logo" 
            width={160} 
            height={55} 
            className="h-14 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">
          Crear Cuenta
        </h1>
        <p className="text-sm text-brand-mutedDark/80 mb-6 text-center">
          Únete a nuestra comunidad y empieza a rescatar alimentos
        </p>
        
        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo de Usuario</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                disabled={loading}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  formData.role === 'customer'
                    ? 'border-brand-accent bg-brand-accent/10 font-semibold'
                    : 'border-black/10 hover:border-brand-accent/50'
                }`}
              >
                👤 Cliente
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'owner' })}
                disabled={loading}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  formData.role === 'owner'
                    ? 'border-brand-accent bg-brand-accent/10 font-semibold'
                    : 'border-black/10 hover:border-brand-accent/50'
                }`}
              >
                🏪 Negocio
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              {formData.role === 'owner' ? 'Nombre del Negocio' : 'Nombre Completo'}
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none disabled:opacity-50"
              placeholder={formData.role === 'owner' ? 'Ej: Restaurant Mi Sabor' : 'Ej: Juan Pérez'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none disabled:opacity-50"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none disabled:opacity-50"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Distrito</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none disabled:opacity-50"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="mt-2 py-3 rounded-xl bg-brand-accent text-white hover:opacity-90 shadow-soft font-semibold disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-mutedDark/70">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-accent font-semibold hover:underline">
            Inicia Sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
