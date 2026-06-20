import './globals.css'
import Providers from './providers';
import ToastContainer from '@/components/Toast';
import Footer from '@/components/Footer';

export const metadata = {
  title: "ComeYa! - Rescata alimentos, ahorra dinero",
  description: "Rescatamos alimentos en perfecto estado antes de su vencimiento. Ahorra hasta 70% mientras ayudas al planeta.",
  icons: {
    icon: '/images/ComeYaLogo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
