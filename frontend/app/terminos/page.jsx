'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function TerminosPage() {
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
            <h1 className="text-4xl font-bold text-brand-accent mb-6">Términos y Condiciones</h1>
            <p className="text-sm text-brand-mutedDark/60 mb-8">Última actualización: Octubre 2025</p>

            <div className="space-y-8 text-brand-mutedDark/80">
              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">1. Aceptación de los Términos</h2>
                <p className="leading-relaxed">
                  Al acceder y utilizar la plataforma ComeYa!, usted acepta estar sujeto a estos Términos y Condiciones. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">2. Descripción del Servicio</h2>
                <p className="leading-relaxed mb-3">
                  ComeYa! es una plataforma intermediaria que conecta establecimientos de comida (restaurantes, pastelerías, 
                  tiendas) con consumidores interesados en adquirir productos alimenticios en perfecto estado antes de su 
                  fecha de vencimiento a precios reducidos.
                </p>
                <p className="leading-relaxed">
                  <strong>Importante:</strong> ComeYa! no es responsable de la preparación, almacenamiento, calidad o 
                  entrega de los alimentos. Estas responsabilidades recaen exclusivamente en los establecimientos 
                  comerciales asociados.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">3. Registro de Usuario</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Debe proporcionar información veraz y actualizada al registrarse</li>
                  <li>Es responsable de mantener la confidencialidad de su cuenta</li>
                  <li>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                  <li>Debe ser mayor de 18 años para utilizar la plataforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">4. Uso de la Plataforma</h2>
                <p className="leading-relaxed mb-3">El usuario se compromete a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utilizar la plataforma solo para fines legales</li>
                  <li>No manipular precios ni realizar compras fraudulentas</li>
                  <li>Recoger los pedidos en los horarios acordados</li>
                  <li>Tratar con respeto a los establecimientos comerciales</li>
                  <li>No revender productos adquiridos a través de la plataforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">5. Precios y Pagos</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Los precios se muestran en soles peruanos (S/)</li>
                  <li>Los descuentos son establecidos por los establecimientos comerciales</li>
                  <li>Los cupones tienen condiciones específicas de uso</li>
                  <li>El pago puede realizarse en efectivo o mediante tarjeta</li>
                  <li>La membresía Premium tiene un costo de S/ 9.90 mensual</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">6. Membresía Premium</h2>
                <p className="leading-relaxed mb-3">
                  La membresía Premium ofrece beneficios adicionales como cupones exclusivos y soporte prioritario. 
                  La renovación es mensual y puede cancelarse en cualquier momento desde el perfil de usuario.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">7. Cancelaciones y Reembolsos</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Las cancelaciones deben realizarse antes de que el pedido sea confirmado</li>
                  <li>Los reembolsos se procesarán según el método de pago utilizado</li>
                  <li>Los productos adquiridos con cupones no son reembolsables</li>
                  <li>En caso de problemas con el producto, contactar al establecimiento directamente</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">8. Responsabilidad de los Alimentos</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <p className="text-yellow-800 leading-relaxed">
                    <strong>Aviso Legal:</strong> ComeYa! actúa solo como plataforma intermediaria. Los establecimientos 
                    son responsables de la calidad, conservación y entrega de los productos ofrecidos. La página no asume 
                    responsabilidad por el estado o consumo de los alimentos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">9. Reclamos</h2>
                <p className="leading-relaxed">
                  Los usuarios pueden presentar reclamos a través de la sección correspondiente en la plataforma. 
                  ComeYa! facilitará la comunicación entre el usuario y el establecimiento, pero no se hace responsable 
                  de la resolución del conflicto.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">10. Modificaciones</h2>
                <p className="leading-relaxed">
                  ComeYa! se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán 
                  notificados a través de la plataforma y entrarán en vigor inmediatamente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-brand-mutedDark mb-4">11. Contacto</h2>
                <p className="leading-relaxed">
                  Para cualquier consulta sobre estos términos, puede contactarnos a través de:
                </p>
                <ul className="list-none pl-0 mt-3 space-y-2">
                  <li>📱 WhatsApp: <a href="https://wa.me/+51936224784" className="text-brand-accent hover:underline">+51 936 224 784</a></li>
                  <li>📧 Email: soporte@comeya.pe</li>
                </ul>
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
