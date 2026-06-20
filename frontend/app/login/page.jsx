'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await signIn(email, password);
      if (user) {
        const metadata = user.user_metadata || {};
        const role = metadata.role || 'customer';
        location.href = role === 'owner' ? '/admin' : '/shop';
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-brand-primary/40 to-brand-secondary/30">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-2xl shadow-soft p-6 w-full max-w-md">
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
          Iniciar Sesión
        </h1>
        <p className="text-sm text-brand-mutedDark/80 mb-6 text-center">
          Ingresa tus credenciales para continuar
        </p>
        
        <form onSubmit={onSubmit} className="grid gap-3">
          <input 
            className="px-3 py-2 rounded-xl border border-black/10" 
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <input 
            className="px-3 py-2 rounded-xl border border-black/10" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            disabled={loading}
            required
          />
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
          <button 
            type="submit"
            disabled={loading}
            className="mt-2 py-2 rounded-xl bg-brand-accent text-white hover:opacity-90 shadow-soft disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-mutedDark/70">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-brand-accent font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
