'use client';
import { useEffect, useState } from 'react';
import { currentUser } from '@/lib/auth';
import { DEFAULT_PRODUCTS } from '@/lib/seed';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = currentUser();
    if (u) {
      setUser(u);
      loadNotifications(u);
    }
  }, []);

  const loadNotifications = (currentUser) => {
    // Cargar notificaciones guardadas
    const saved = JSON.parse(localStorage.getItem('comeya_notifications') || '{}');
    const userNotifications = saved[currentUser.email] || [];
    
    // Si no hay notificaciones, generar las iniciales
    if (userNotifications.length === 0) {
      const newNotifications = generateNotifications(currentUser);
      saved[currentUser.email] = newNotifications;
      localStorage.setItem('comeya_notifications', JSON.stringify(saved));
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } else {
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    }
  };

  const generateNotifications = (currentUser) => {
    const notifs = [];
    const now = Date.now();
    
    // Obtener productos reales del localStorage (productos por defecto + agregados por dueños)
    const storedProducts = JSON.parse(localStorage.getItem('comeya_products') || '[]');
    const allProducts = storedProducts.length > 0 ? storedProducts : DEFAULT_PRODUCTS;
    
    // Filtrar productos del distrito del usuario
    const productsInDistrict = allProducts.filter(p => p.district === currentUser.district);
    
    // NOTIFICACIÓN 1: Cupón de descuento (SIEMPRE APARECE)
    notifs.push({
      id: `notif_${now}_cupon`,
      type: 'promo',
      icon: '🎉',
      title: '¡Cupón especial disponible!',
      message: 'Usa el código PRIMERA30 y obtén 30% OFF en tus primeras 3 compras. ¡No te lo pierdas!',
      timestamp: now - 10 * 60000, // 10 minutos atrás
      read: false
    });
    
    // NOTIFICACIÓN 2-4: Productos reales del distrito del usuario
    if (productsInDistrict.length > 0) {
      // Agrupar por restaurante
      const productsByBusiness = {};
      productsInDistrict.forEach(p => {
        if (!productsByBusiness[p.businessName]) {
          productsByBusiness[p.businessName] = [];
        }
        productsByBusiness[p.businessName].push(p);
      });
      
      // Crear notificaciones para cada restaurante (máximo 3)
      const businesses = Object.keys(productsByBusiness).slice(0, 3);
      
      businesses.forEach((businessName, index) => {
        const products = productsByBusiness[businessName];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        
        // Calcular descuento real
        const discount = randomProduct.originalPrice 
          ? Math.round(((randomProduct.originalPrice - randomProduct.price) / randomProduct.originalPrice) * 100)
          : 0;
        
        if (discount > 0) {
          notifs.push({
            id: `notif_${now}_local_${index}`,
            type: 'local',
            icon: '�️',
            title: `Oferta en ${businessName}`,
            message: `${randomProduct.name} con ${discount}% de descuento en ${currentUser.district}. ¡Solo S/ ${randomProduct.price.toFixed(2)}!`,
            timestamp: now - (30 + index * 20) * 60000, // Espaciadas en el tiempo
            read: false
          });
        } else {
          // Si no hay descuento, mostrar que hay productos disponibles
          notifs.push({
            id: `notif_${now}_local_${index}`,
            type: 'local',
            icon: '📍',
            title: `${businessName} cerca de ti`,
            message: `${randomProduct.name} disponible en ${currentUser.district} por solo S/ ${randomProduct.price.toFixed(2)}`,
            timestamp: now - (30 + index * 20) * 60000,
            read: false
          });
        }
      });
    }
    
    // NOTIFICACIÓN 5: Productos con mayor descuento en el distrito
    if (productsInDistrict.length > 0) {
      const bestDeal = productsInDistrict
        .filter(p => p.originalPrice && p.originalPrice > p.price)
        .sort((a, b) => {
          const discountA = ((a.originalPrice - a.price) / a.originalPrice);
          const discountB = ((b.originalPrice - b.price) / b.originalPrice);
          return discountB - discountA;
        })[0];
      
      if (bestDeal) {
        const discount = Math.round(((bestDeal.originalPrice - bestDeal.price) / bestDeal.originalPrice) * 100);
        notifs.push({
          id: `notif_${now}_best`,
          type: 'hot',
          icon: '🔥',
          title: '¡Mejor oferta del día!',
          message: `${bestDeal.name} de ${bestDeal.businessName} con ${discount}% de descuento. De S/ ${bestDeal.originalPrice.toFixed(2)} a S/ ${bestDeal.price.toFixed(2)}`,
          timestamp: now - 90 * 60000, // 1.5 horas atrás
          read: false
        });
      }
    }
    
    // NOTIFICACIÓN 6: Productos recién agregados (si existen productos que no están en DEFAULT_PRODUCTS)
    const newProducts = storedProducts.filter(p => 
      p.district === currentUser.district && 
      !DEFAULT_PRODUCTS.find(dp => dp.id === p.id)
    );
    
    if (newProducts.length > 0) {
      const newest = newProducts[0]; // El más reciente
      notifs.push({
        id: `notif_${now}_new`,
        type: 'discovery',
        icon: '✨',
        title: '¡Nuevo producto disponible!',
        message: `${newest.businessName} acaba de agregar ${newest.name} en ${currentUser.district} por S/ ${newest.price.toFixed(2)}`,
        timestamp: now - 2 * 60 * 60000, // 2 horas atrás
        read: false
      });
    }

    return notifs.sort((a, b) => b.timestamp - a.timestamp);
  };

  const markAsRead = (notifId) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    
    const saved = JSON.parse(localStorage.getItem('comeya_notifications') || '{}');
    saved[user.email] = updated;
    localStorage.setItem('comeya_notifications', JSON.stringify(saved));
    
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    
    const saved = JSON.parse(localStorage.getItem('comeya_notifications') || '{}');
    saved[user.email] = updated;
    localStorage.setItem('comeya_notifications', JSON.stringify(saved));
    
    setUnreadCount(0);
  };

  const clearNotification = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    
    const saved = JSON.parse(localStorage.getItem('comeya_notifications') || '{}');
    saved[user.email] = updated;
    localStorage.setItem('comeya_notifications', JSON.stringify(saved));
    
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return `Hace ${Math.floor(seconds / 86400)}d`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Campanita */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-xl hover:bg-brand-primary/20 transition-colors"
      >
        <svg className="w-6 h-6 text-brand-mutedDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge de notificaciones */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-black/10 z-50 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
              <div>
                <h3 className="font-bold text-lg">Notificaciones</h3>
                <p className="text-xs text-brand-mutedDark/70">
                  {unreadCount > 0 ? `${unreadCount} nuevas` : 'No hay nuevas'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-accent text-white hover:opacity-90 font-semibold"
                >
                  Marcar todas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-brand-mutedDark/70 text-sm">
                    No tienes notificaciones
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-brand-primary/5 transition-colors ${
                        !notif.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                          notif.type === 'local' ? 'bg-green-100' :
                          notif.type === 'promo' ? 'bg-purple-100' :
                          notif.type === 'hot' ? 'bg-red-100' :
                          notif.type === 'discovery' ? 'bg-blue-100' :
                          'bg-orange-100'
                        }`}>
                          {notif.icon}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm leading-tight">
                              {notif.title}
                            </h4>
                            <button
                              onClick={() => clearNotification(notif.id)}
                              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-xs text-brand-mutedDark/70 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-brand-mutedDark/50">
                              {getTimeAgo(notif.timestamp)}
                            </span>
                            
                            {!notif.read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                              >
                                Marcar leída
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
