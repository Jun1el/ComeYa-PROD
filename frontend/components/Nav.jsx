'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/supabase/auth-context';

export default function Nav() {
  const pathname = usePathname();
  const { user, profile, signOut, loading } = useAuth();
  const { cart } = useStore();
  const isOwner = profile?.role === 'owner';
  const isSuperAdmin = profile?.role === 'superadmin';
  const cartItemsCount = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/ComeYaLogo.png"
            alt="ComeYa Logo"
            width={120}
            height={40}
            className="h-10 w-auto hover:scale-105 transition-transform"
            priority
          />
        </Link>

        <div className="flex items-center justify-end gap-2 md:gap-3 flex-wrap">
          {!isOwner && !isSuperAdmin && (
            <>
              <Link href="/shop" className={linkCls(pathname, '/shop')}>Tienda</Link>
              <Link href="/orders" className={linkCls(pathname, '/orders')}>Mis Pedidos</Link>
              <Link href="/cart" className={`${linkCls(pathname, '/cart')} relative`}>
                Carrito
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {isOwner && (
            <>
              <Link href="/admin" className={linkCls(pathname, '/admin', true)}>Admin</Link>
              <Link href="/admin/orders" className={linkCls(pathname, '/admin/orders')}>Pedidos recibidos</Link>
            </>
          )}

          {isSuperAdmin && (
            <Link href="/superadmin" className={linkCls(pathname, '/superadmin')}>Superadmin</Link>
          )}

          {!isSuperAdmin && <Link href="/complaints" className={linkCls(pathname, '/complaints')}>Reclamos</Link>}
          <Link href="/profile" className={linkCls(pathname, '/profile')}>Perfil</Link>

          {user && <NotificationBell />}

          {!loading && (user ? (
            <button
              onClick={async () => {
                await signOut();
                location.href = '/login';
              }}
              className="ml-2 text-sm px-3 py-1 rounded-lg bg-brand-accent text-white hover:opacity-90"
            >
              Cerrar sesion
            </button>
          ) : (
            <Link href="/login" className="text-sm px-3 py-1 rounded-lg bg-brand-accent text-white hover:opacity-90">
              Entrar
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function linkCls(pathname, href, exact = false) {
  const active = exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);
  return `px-3 py-1 rounded-lg hover:bg-brand-primary/50 ${active ? 'bg-brand-secondary/50' : ''}`;
}
