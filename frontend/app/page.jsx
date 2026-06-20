'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import HomeSection from '@/components/HomeSection';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/20 via-white to-brand-secondary/20">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/ComeYaLogo.png" 
              alt="ComeYa Logo" 
              width={140} 
              height={45} 
              className="h-11 w-auto hover:scale-105 transition-transform"
              priority
            />
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="px-6 py-2 rounded-xl bg-brand-accent text-white hover:opacity-90 shadow-soft transition-opacity">
              Empezar Ahora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-brand-accent to-brand-primary bg-clip-text text-transparent">
              Comida deliciosa,
              <br />
              precios increíbles,
              <br />
              cero desperdicio
            </h1>
            <p className="text-xl md:text-2xl text-brand-mutedDark/80 mb-6 max-w-3xl mx-auto">
              Rescatamos alimentos en perfecto estado antes de su fecha de vencimiento. 
              Ahorra dinero mientras ayudas al planeta. 🌍
            </p>

            {/* Redes Sociales - Hero */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-sm text-brand-mutedDark/70">Síguenos:</span>
              <a 
                href="https://wa.me/+51936224784" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                aria-label="Contáctanos por WhatsApp"
                title="WhatsApp: +51 936 224 784"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                aria-label="Síguenos en Instagram"
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                aria-label="Síguenos en TikTok"
                title="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
            
            {/* Banner de Cupón Compacto */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-4 shadow-lg">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">¡30% OFF en tus primeras 3 compras!</p>
                      <p className="text-white/80 text-xs">Usa el cupón al finalizar tu pedido</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span className="text-xl font-black text-purple-600 tracking-wide">PRIMERA30</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/login" className="px-8 py-4 rounded-xl bg-brand-accent text-white text-lg font-semibold hover:opacity-90 shadow-soft transition-opacity">
                Ordenar Ahora
              </Link>
              <a href="#conocenos" className="px-8 py-4 rounded-xl border-2 border-brand-accent text-brand-accent text-lg font-semibold hover:bg-brand-accent hover:text-white transition-all">
                Conocer Más
              </a>
            </div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 text-8xl"
          >
            🍕🍔🍰🥤
          </motion.div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <HomeSection className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Por qué elegir ComeYa?</h2>
            <p className="text-lg text-brand-mutedDark/70">
              Combatimos el desperdicio alimentario conectando negocios con consumidores conscientes
            </p>
          </HomeSection>

          <div className="grid md:grid-cols-3 gap-8">
            <HomeSection delay={0.1}>
              <div className="glass rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-2xl font-bold mb-3">Sostenibilidad</h3>
                <p className="text-brand-mutedDark/70">
                  Reducimos el desperdicio de alimentos en perfecto estado y cuidamos el medio ambiente
                </p>
              </div>
            </HomeSection>

            <HomeSection delay={0.2}>
              <div className="glass rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-2xl font-bold mb-3">Precios Accesibles</h3>
                <p className="text-brand-mutedDark/70">
                  Alimentos frescos y de calidad a precios increíbles antes de su vencimiento
                </p>
              </div>
            </HomeSection>

            <HomeSection delay={0.3}>
              <div className="glass rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="text-6xl mb-4">🤝</div>
                <h3 className="text-2xl font-bold mb-3">Apoyo Local</h3>
                <p className="text-brand-mutedDark/70">
                  Ayudamos a restaurantes y negocios locales a reducir pérdidas
                </p>
              </div>
            </HomeSection>
          </div>
        </div>
      </section>

      {/* Conócenos */}
      <section id="conocenos" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <HomeSection>
            <h2 className="text-4xl font-bold mb-6">Sobre ComeYa!</h2>
            <p className="text-lg text-brand-mutedDark/80 mb-4">
              Somos una aplicación comprometida con la <strong>sostenibilidad y la reducción del desperdicio alimentario</strong>. 
              Conectamos restaurantes, pastelerías y tiendas de comida con consumidores que desean 
              adquirir productos en perfecto estado antes de su fecha de vencimiento, a precios accesibles.
            </p>
            <p className="text-lg text-brand-mutedDark/80 mb-6">
              Nos guiamos por valores como la responsabilidad ambiental, la calidad y frescura de los alimentos, 
              la innovación tecnológica y la cercanía con el cliente. Promovemos un <strong>consumo consciente</strong>, 
              fomentamos el ahorro económico y apoyamos a los negocios locales.
            </p>
            <div className="flex gap-8 justify-center mt-8">
              <div>
                <div className="text-3xl font-bold text-brand-accent">-40%</div>
                <div className="text-brand-mutedDark/70">Descuentos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-accent">50+</div>
                <div className="text-brand-mutedDark/70">Negocios</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-accent">♻️</div>
                <div className="text-brand-mutedDark/70">Cero Desperdicio</div>
              </div>
            </div>
          </HomeSection>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-primary/30 to-brand-secondary/30">
        <div className="max-w-7xl mx-auto">
          <HomeSection className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-lg text-brand-mutedDark/70">
              Rescata alimentos en 3 simples pasos y genera impacto positivo
            </p>
          </HomeSection>

          <div className="grid md:grid-cols-3 gap-8">
            <HomeSection delay={0.1}>
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Explora Ofertas</h3>
                <p className="text-brand-mutedDark/70">
                  Descubre productos frescos cercanos a su fecha de vencimiento con grandes descuentos
                </p>
              </div>
            </HomeSection>

            <HomeSection delay={0.2}>
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Rescata Alimentos</h3>
                <p className="text-brand-mutedDark/70">
                  Compra a precios increíbles y evita que comida perfecta se desperdicie
                </p>
              </div>
            </HomeSection>

            <HomeSection delay={0.3}>
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Impacto Positivo</h3>
                <p className="text-brand-mutedDark/70">
                  Disfruta tu comida sabiendo que ayudaste al planeta y a negocios locales
                </p>
              </div>
            </HomeSection>
          </div>
        </div>
      </section>

      {/* Planes de Membresía */}
      <section className="py-20 px-4 bg-gradient-to-b from-brand-secondary/10 to-white">
        <div className="max-w-7xl mx-auto">
          <HomeSection className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Elige tu Plan</h2>
            <p className="text-lg text-brand-mutedDark/70">
              Comienza gratis o desbloquea beneficios exclusivos con Premium
            </p>
          </HomeSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Free */}
            <HomeSection delay={0.1}>
              <div className="glass rounded-2xl p-8 border-2 border-black/5 hover:border-brand-accent/30 transition-all">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="text-5xl font-black text-brand-accent mb-2">S/ 0</div>
                  <p className="text-sm text-brand-mutedDark/70">Por siempre</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">Acceso al catálogo completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">Descuentos desde el 40% hasta el 70%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">Cupón PRIMERA30 (3 usos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">Tracking de pedidos</span>
                  </li>
                </ul>

                <Link href="/register" className="block w-full py-3 text-center rounded-xl border-2 border-brand-accent text-brand-accent font-semibold hover:bg-brand-accent hover:text-white transition-all">
                  Comenzar Gratis
                </Link>
              </div>
            </HomeSection>

            {/* Plan Premium */}
            <HomeSection delay={0.2}>
              <div className="glass rounded-2xl p-8 border-2 border-brand-accent shadow-xl relative overflow-hidden">
                {/* Badge Premium */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold">
                  ⭐ POPULAR
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="text-5xl font-black text-brand-accent mb-2">S/ 9.90</div>
                  <p className="text-sm text-brand-mutedDark/70">Por mes</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">Todo lo del plan Free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80 font-semibold">Cupones exclusivos Premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">PREMIUM20: 20% OFF (10 usos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">PREMIUM15: 15% OFF (ilimitado)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-brand-mutedDark/80">Soporte prioritario</span>
                  </li>
                  
                  {/* Features próximamente */}
                  <li className="pt-2 border-t border-black/10">
                    <p className="text-xs font-semibold text-brand-accent mb-2"> Próximamente:</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-brand-mutedDark/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-brand-mutedDark/60 text-sm">3 envíos gratis al mes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-brand-mutedDark/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-brand-mutedDark/60 text-sm">Acceso anticipado a ofertas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-brand-mutedDark/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-brand-mutedDark/60 text-sm">Descuentos adicionales</span>
                  </li>
                </ul>

                <Link href="/register" className="block w-full py-3 text-center rounded-xl bg-brand-accent text-white font-semibold hover:opacity-90 shadow-soft transition-opacity">
                  Activar Premium
                </Link>
              </div>
            </HomeSection>
          </div>
        </div>
      </section>

      {/* Público Objetivo */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <HomeSection className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Para quién es ComeYa?</h2>
            <p className="text-lg text-brand-mutedDark/70">
              Una plataforma que beneficia a todos: consumidores, negocios y el planeta
            </p>
          </HomeSection>

          <div className="grid md:grid-cols-2 gap-8">
            <HomeSection delay={0.1}>
              <div className="glass rounded-2xl p-8">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-2xl font-bold mb-3">Para Consumidores Conscientes</h3>
                <ul className="space-y-2 text-brand-mutedDark/80">
                  <li>✓ Estudiantes que buscan comida de calidad y económica</li>
                  <li>✓ Profesionales comprometidos con el medio ambiente</li>
                  <li>✓ Familias que quieren ahorrar sin sacrificar calidad</li>
                  <li>✓ Personas que valoran el consumo responsable</li>
                </ul>
              </div>
            </HomeSection>

            <HomeSection delay={0.2}>
              <div className="glass rounded-2xl p-8">
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-2xl font-bold mb-3">Para Negocios Sostenibles</h3>
                <ul className="space-y-2 text-brand-mutedDark/80">
                  <li>✓ Restaurantes que quieren reducir pérdidas</li>
                  <li>✓ Pastelerías con productos del día anterior</li>
                  <li>✓ Tiendas de comida comprometidas con el planeta</li>
                  <li>✓ Emprendedores que buscan nuevos clientes</li>
                </ul>
              </div>
            </HomeSection>
          </div>
        </div>
      </section>

      {/* Impacto Ambiental */}
      <section className="py-20 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <HomeSection className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Nuestro Impacto 🌍</h2>
            <p className="text-lg text-brand-mutedDark/70">
              Juntos estamos generando un cambio positivo en la comunidad y el medio ambiente
            </p>
          </HomeSection>

          <div className="grid md:grid-cols-4 gap-6">
            <HomeSection delay={0.1}>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <div className="text-3xl font-bold text-green-600 mb-1">2,500+</div>
                <p className="text-sm text-brand-mutedDark/70">Comidas Rescatadas</p>
              </div>
            </HomeSection>

            <HomeSection delay={0.2}>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🌱</div>
                <div className="text-3xl font-bold text-green-600 mb-1">1.2 ton</div>
                <p className="text-sm text-brand-mutedDark/70">CO₂ Evitado</p>
              </div>
            </HomeSection>

            <HomeSection delay={0.3}>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">💵</div>
                <div className="text-3xl font-bold text-green-600 mb-1">S/45K</div>
                <p className="text-sm text-brand-mutedDark/70">Ahorrado por Usuarios</p>
              </div>
            </HomeSection>

            <HomeSection delay={0.4}>
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🤝</div>
                <div className="text-3xl font-bold text-green-600 mb-1">50+</div>
                <p className="text-sm text-brand-mutedDark/70">Negocios Aliados</p>
              </div>
            </HomeSection>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-accent/90 to-brand-primary/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <HomeSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para hacer la diferencia?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a la comunidad que combate el desperdicio alimentario mientras ahorra dinero
            </p>
            <Link href="/login" className="inline-block px-8 py-4 rounded-xl bg-white text-brand-accent text-lg font-semibold hover:shadow-2xl transition-shadow">
              Comenzar a Rescatar Alimentos
            </Link>
          </HomeSection>
        </div>
      </section>
    </div>
  );
}
