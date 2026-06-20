'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Escuchar evento personalizado para nuevos toasts
    const handleNewToast = (e) => {
      const newToast = {
        id: Date.now() + Math.random(), // Usar ID más único
        ...e.detail
      };
      
      setToasts(prev => {
        // Evitar duplicados del mismo mensaje en el mismo segundo
        const isDuplicate = prev.some(t => 
          t.business === newToast.business && 
          t.text === newToast.text &&
          (Date.now() - t.id) < 1000 // Dentro del mismo segundo
        );
        
        if (isDuplicate) {
          return prev; // No agregar si es duplicado
        }
        
        return [...prev, newToast];
      });
      
      // Auto-remover después de 5 segundos
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('show-toast', handleNewToast);
    
    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('show-toast', handleNewToast);
    };
  }, []); // Array vacío para que solo se ejecute una vez

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="glass rounded-xl p-4 shadow-xl border border-green-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-brand-accent mb-1">
                  {toast.business || 'Restaurante'}
                </div>
                <p className="text-sm text-brand-mutedDark">
                  {toast.text}
                </p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-brand-mutedDark/50 hover:text-brand-mutedDark"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper function para mostrar toasts desde cualquier parte
export function showToast(business, text) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { business, text }
    }));
  }
}
