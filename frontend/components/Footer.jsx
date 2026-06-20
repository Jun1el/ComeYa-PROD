'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-brand-mutedDark/5 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo y Descripción */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image 
                src="/images/ComeYaLogo.png" 
                alt="ComeYa Logo" 
                width={120} 
                height={38} 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-brand-mutedDark/70">
              Rescatamos alimentos en perfecto estado. Ahorra dinero mientras ayudas al planeta.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold text-brand-mutedDark mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#conocenos" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Conócenos
                </a>
              </li>
              <li>
                <Link href="/shop" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-semibold text-brand-mutedDark mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/complaints" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Libro de reclamaciones
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/+51936224784" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors"
                >
                  WhatsApp: +51 936 224 784
                </a>
              </li>
              <li>
                <a href="#faq" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-brand-mutedDark mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terminos" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <a href="#aviso-legal" className="text-brand-mutedDark/70 hover:text-brand-accent transition-colors">
                  Aviso Legal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Aviso Legal/Disclaimer */}
        <div className="border-t border-black/10 pt-6 mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <h4 className="font-semibold text-sm text-yellow-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Aviso Legal
            </h4>
            <p className="text-xs text-yellow-800/90 leading-relaxed">
              <strong>ComeYa!</strong> actúa solo como plataforma intermediaria entre restaurantes, 
              pastelerías y consumidores. Los establecimientos son responsables de la calidad, 
              conservación y entrega de los productos ofrecidos. La página no asume responsabilidad 
              por el estado o consumo de los alimentos. El uso del sitio implica la aceptación de estos términos.
            </p>
          </div>
        </div>

        {/* Copyright y Redes Sociales Footer */}
        <div className="border-t border-black/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-brand-mutedDark/70">
              © 2025 <strong className="text-brand-accent">ComeYa!</strong> Todos los derechos reservados.
            </p>
            <p className="text-xs text-brand-mutedDark/60 mt-1">
              Reduciendo el desperdicio alimentario, un plato a la vez 🌱
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-brand-mutedDark/60">Síguenos:</span>
            <div className="flex gap-2">
              <a 
                href="https://wa.me/+51936224784" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 flex items-center justify-center text-white transition-opacity"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
