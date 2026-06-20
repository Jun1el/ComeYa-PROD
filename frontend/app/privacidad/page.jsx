'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/10 to-white">
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
            />
          </Link>
          <Link href="/" className="text-sm text-brand-accent hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h1 className="text-4xl font-bold text-brand-accent mb-6">Política de Privacidad</h1>
            <p className="text-sm text-brand-mutedDark/60 mb-8">Última actualización: Octubre 2025</p>

            <div className="space-y-8 text-brand-mutedDark/80">
              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">1. Información que Recopilamos</h2>
                <p className="leading-relaxed mb-3">
                  En ComeYa! recopilamos la siguiente información para proporcionar y mejorar nuestros servicios:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Datos de registro:</strong> Nombre, email, teléfono, dirección, distrito</li>
                  <li><strong>Datos de pago:</strong> Información de tarjetas de crédito/débito (almacenada de forma segura)</li>
                  <li><strong>Historial de pedidos:</strong> Productos comprados, restaurantes visitados, preferencias</li>
                  <li><strong>Datos de navegación:</strong> Páginas visitadas, productos vistos, tiempo en la plataforma</li>
                  <li><strong>Membresía:</strong> Plan actual (Free o Premium), cupones utilizados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">2. Cómo Usamos su Información</h2>
                <p className="leading-relaxed mb-3">Utilizamos la información recopilada para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Procesar y gestionar sus pedidos</li>
                  <li>Conectarlo con restaurantes y establecimientos cercanos</li>
                  <li>Procesar pagos de forma segura</li>
                  <li>Enviar notificaciones sobre ofertas y cupones disponibles</li>
                  <li>Mejorar la experiencia del usuario en la plataforma</li>
                  <li>Gestionar su membresía Premium</li>
                  <li>Atender reclamos y consultas</li>
                  <li>Generar estadísticas de impacto ambiental</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">3. Compartir Información</h2>
                <p className="leading-relaxed mb-3">
                  Su información puede ser compartida con:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Establecimientos comerciales:</strong> Solo información necesaria para procesar el pedido</li>
                  <li><strong>Procesadores de pago:</strong> Para completar transacciones (con protocolos de seguridad)</li>
                  <li><strong>Soporte técnico:</strong> Para resolver problemas y mejorar el servicio</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>Nunca vendemos</strong> su información personal a terceros.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">4. Seguridad de los Datos</h2>
                <p className="leading-relaxed mb-3">
                  Implementamos medidas de seguridad para proteger su información:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cifrado de datos sensibles</li>
                  <li>Almacenamiento seguro en localStorage (solo para prototipo)</li>
                  <li>Acceso restringido a información personal</li>
                  <li>Mostrar solo últimos 4 dígitos de tarjetas</li>
                  <li>Autenticación de usuarios</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Nota:</strong> Este es un prototipo educativo. En producción se utilizarían protocolos 
                    de seguridad bancarios y certificados SSL/TLS.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">5. Cookies y Tecnologías Similares</h2>
                <p className="leading-relaxed">
                  Utilizamos localStorage para mantener su sesión activa y recordar sus preferencias. Esta información 
                  se almacena localmente en su navegador y puede eliminarla en cualquier momento limpiando el caché.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">6. Sus Derechos</h2>
                <p className="leading-relaxed mb-3">Usted tiene derecho a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Acceder:</strong> Ver toda la información que tenemos sobre usted</li>
                  <li><strong>Rectificar:</strong> Corregir datos incorrectos desde su perfil</li>
                  <li><strong>Eliminar:</strong> Solicitar la eliminación de su cuenta y datos</li>
                  <li><strong>Portabilidad:</strong> Exportar sus datos en formato legible</li>
                  <li><strong>Oposición:</strong> Rechazar ciertos usos de su información</li>
                  <li><strong>Cancelar suscripción:</strong> Darse de baja de notificaciones</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">7. Retención de Datos</h2>
                <p className="leading-relaxed">
                  Conservamos su información mientras su cuenta esté activa o sea necesaria para proporcionar servicios. 
                  Los datos de transacciones se mantienen por razones contables y legales según la normativa peruana.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">8. Privacidad de Menores</h2>
                <p className="leading-relaxed">
                  ComeYa! no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. 
                  Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">9. Cambios en la Política</h2>
                <p className="leading-relaxed">
                  Nos reservamos el derecho de actualizar esta política de privacidad. Los cambios significativos serán 
                  notificados a través de la plataforma o por email. La fecha de la última actualización se muestra al 
                  inicio de este documento.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">10. Contacto sobre Privacidad</h2>
                <p className="leading-relaxed mb-3">
                  Para ejercer sus derechos o hacer consultas sobre privacidad, contáctenos:
                </p>
                <ul className="list-none pl-0 space-y-2">
                  <li>📱 WhatsApp: <a href="https://wa.me/+51936224784" className="text-brand-accent hover:underline">+51 936 224 784</a></li>
                  <li>📧 Email: privacidad@comeya.pe</li>
                  <li>📍 Lima, Perú</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">11. Cumplimiento Legal</h2>
                <p className="leading-relaxed">
                  ComeYa! cumple con la Ley de Protección de Datos Personales del Perú (Ley N° 29733) y su reglamento. 
                  Nos comprometemos a proteger la privacidad y seguridad de nuestros usuarios.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-black/10">
              <Link 
                href="/" 
                className="inline-block px-6 py-3 rounded-xl bg-brand-accent text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
