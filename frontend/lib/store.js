'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PRODUCTS } from './seed';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // load from localStorage or seed
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('comeya_products') || 'null');
    
    // Verificar si los productos tienen los campos nuevos (district, businessName)
    const hasNewFields = loaded && Array.isArray(loaded) && loaded.length > 0 
      && loaded.some(p => p.district && p.businessName);
    
    // Si no hay productos o no tienen los campos nuevos, usar DEFAULT_PRODUCTS
    if (!loaded || !Array.isArray(loaded) || loaded.length === 0 || !hasNewFields) {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('comeya_products', JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      setProducts(loaded);
    }
    
    const loadedCart = JSON.parse(localStorage.getItem('comeya_cart') || '[]');
    setCart(Array.isArray(loadedCart) ? loadedCart : []);
    
    const loadedOrders = JSON.parse(localStorage.getItem('comeya_orders') || '[]');
    setOrders(Array.isArray(loadedOrders) ? loadedOrders : []);
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem('comeya_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('comeya_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('comeya_orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (p) => {
    setProducts(prev => [{ ...p, id: crypto.randomUUID() }, ...prev]);
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addToCart = (product) => {
    const id = typeof product === 'string' ? product : product.id;
    const productData = typeof product === 'string'
      ? products.find(p => p.id === id)
      : product;

    if (!productData || productData.stock <= 0) {
      alert('Este producto no tiene stock disponible.');
      return;
    }

    const existingItem = cart.find(item => item.id === id);
    if (existingItem && existingItem.qty >= productData.stock) {
      alert(`Solo hay ${productData.stock} unidad(es) disponibles.`);
      return;
    }

    setCart(prev => {
      const i = prev.findIndex(x => x.id === id);
      if (i >= 0) {
        const updated = [...prev];
        updated[i] = {
          ...updated[i],
          ...productData,
          businessId: productData.businessId || productData.business?.id,
          qty: updated[i].qty + 1
        };
        return updated;
      }
      if (!productData) return prev;

      return [...prev, {
        ...productData,
        id,
        businessId: productData.businessId || productData.business?.id,
        qty: 1
      }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(x => x.id !== id));
  const changeQty = (id, qty) => {
    const item = cart.find(product => product.id === id);
    const maxStock = Number.isFinite(item?.stock) ? item.stock : 1;

    if (qty > maxStock) {
      alert(`Solo hay ${maxStock} unidad(es) disponibles.`);
      return;
    }

    setCart(prev => prev.map(product =>
      product.id === id
        ? { ...product, qty: Math.min(maxStock, Math.max(1, qty)) }
        : product
    ));
  };
  const clearCart = () => setCart([]);

  // Función para crear una orden (ahora crea múltiples órdenes si hay diferentes restaurantes)
  const createOrder = (items, totalGeneral, userDistrict, orderDetails = null) => {
    // Agrupar items por restaurante
    const itemsByBusiness = items.reduce((acc, item) => {
      const businessName = item.businessName;
      if (!acc[businessName]) {
        acc[businessName] = [];
      }
      acc[businessName].push(item);
      return acc;
    }, {});

    // Crear una orden por cada restaurante
    const newOrders = Object.entries(itemsByBusiness).map(([businessName, businessItems]) => {
      return createSingleOrder(businessItems, userDistrict, orderDetails, businessName);
    });

    // Agregar todas las órdenes al estado
    setOrders(prev => [...newOrders, ...prev]);
    clearCart();
    
    return newOrders;
  };

  // Función auxiliar para crear una sola orden de un restaurante
  const createSingleOrder = (items, userDistrict, orderDetails = null, businessName) => {
    // Calcular distancia promedio y tiempo de entrega para ESTE restaurante
    // Importar getDistanceBetween dinámicamente
    let avgDistance = 5; // default
    try {
      const distances = items.map(item => {
        // Simulamos la distancia (en producción vendría de auth.js)
        const DISTRICT_DISTANCES = {
          "San Martin de Porres": { "San Martin de Porres": 0, "Comas": 6, "Los Olivos": 4, "Independencia": 3, "San Juan de Miraflores": 20, "Villa el Salvador": 25, "Chorrillos": 18, "El Agustino": 15, "Ate": 18, "Santa Anita": 20 },
          "Comas": { "San Martin de Porres": 6, "Comas": 0, "Los Olivos": 5, "Independencia": 8, "San Juan de Miraflores": 25, "Villa el Salvador": 30, "Chorrillos": 23, "El Agustino": 20, "Ate": 22, "Santa Anita": 24 },
          "Los Olivos": { "San Martin de Porres": 4, "Comas": 5, "Los Olivos": 0, "Independencia": 6, "San Juan de Miraflores": 22, "Villa el Salvador": 27, "Chorrillos": 20, "El Agustino": 17, "Ate": 19, "Santa Anita": 21 },
          "Independencia": { "San Martin de Porres": 3, "Comas": 8, "Los Olivos": 6, "Independencia": 0, "San Juan de Miraflores": 18, "Villa el Salvador": 23, "Chorrillos": 16, "El Agustino": 12, "Ate": 15, "Santa Anita": 17 },
          "San Juan de Miraflores": { "San Martin de Porres": 20, "Comas": 25, "Los Olivos": 22, "Independencia": 18, "San Juan de Miraflores": 0, "Villa el Salvador": 5, "Chorrillos": 8, "El Agustino": 15, "Ate": 12, "Santa Anita": 14 },
          "Villa el Salvador": { "San Martin de Porres": 25, "Comas": 30, "Los Olivos": 27, "Independencia": 23, "San Juan de Miraflores": 5, "Villa el Salvador": 0, "Chorrillos": 10, "El Agustino": 20, "Ate": 17, "Santa Anita": 19 },
          "Chorrillos": { "San Martin de Porres": 18, "Comas": 23, "Los Olivos": 20, "Independencia": 16, "San Juan de Miraflores": 8, "Villa el Salvador": 10, "Chorrillos": 0, "El Agustino": 12, "Ate": 10, "Santa Anita": 12 },
          "El Agustino": { "San Martin de Porres": 15, "Comas": 20, "Los Olivos": 17, "Independencia": 12, "San Juan de Miraflores": 15, "Villa el Salvador": 20, "Chorrillos": 12, "El Agustino": 0, "Ate": 5, "Santa Anita": 7 },
          "Ate": { "San Martin de Porres": 18, "Comas": 22, "Los Olivos": 19, "Independencia": 15, "San Juan de Miraflores": 12, "Villa el Salvador": 17, "Chorrillos": 10, "El Agustino": 5, "Ate": 0, "Santa Anita": 4 },
          "Santa Anita": { "San Martin de Porres": 20, "Comas": 24, "Los Olivos": 21, "Independencia": 17, "San Juan de Miraflores": 14, "Villa el Salvador": 19, "Chorrillos": 12, "El Agustino": 7, "Ate": 4, "Santa Anita": 0 }
        };
        return DISTRICT_DISTANCES[userDistrict]?.[item.district] || 5;
      });
      avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    } catch (e) {
      avgDistance = 5;
    }
    
    // Calcular subtotal de ESTE restaurante
    const subtotalBusiness = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Calcular envío para ESTE restaurante (basado en su distancia específica)
    const getShippingCostLocal = (distance) => {
      if (distance <= 10) return 4.00;
      if (distance <= 25) return 6.00;
      return 8.00;
    };
    const shippingCost = getShippingCostLocal(avgDistance);
    
    // Distribuir el descuento proporcionalmente si hay un cupón aplicado
    let discount = 0;
    let couponCode = null;
    if (orderDetails && orderDetails.discount > 0) {
      // Distribuir el descuento proporcionalmente según el subtotal de este restaurante
      const proportionOfTotal = subtotalBusiness / orderDetails.subtotal;
      discount = orderDetails.discount * proportionOfTotal;
      couponCode = orderDetails.coupon;
    }
    
    const totalBusiness = subtotalBusiness + shippingCost - discount;
    
    // Calcular tiempo: 15 min base + 2 min por km (máx 60 min)
    const deliveryMinutes = Math.min(60, Math.max(15, 15 + Math.round(avgDistance * 2)));
    const deliveryMs = deliveryMinutes * 60 * 1000;
    
    const newOrder = {
      id: crypto.randomUUID(),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        qty: item.qty,
        businessName: item.businessName,
        district: item.district
      })),
      total: totalBusiness,
      // Guardar detalles del pedido de ESTE restaurante
      orderDetails: {
        subtotal: subtotalBusiness,
        shippingCost: shippingCost,
        discount: discount,
        coupon: couponCode
      },
      status: 'pending', // pending -> preparing -> onway -> delivered
      createdAt: Date.now(),
      estimatedDelivery: Date.now() + deliveryMs,
      deliveryMinutes, // Guardar para mostrar en UI
      messages: [
        {
          id: 1,
          from: 'business',
          business: businessName,
          text: '¡Hola! Recibimos tu pedido. Lo confirmaremos en breve. 👋',
          timestamp: Date.now(),
          read: false
        }
      ]
    };
    
    // Notificación inicial inmediata
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            business: businessName,
            text: '¡Hola! Recibimos tu pedido. Lo confirmaremos en breve. 👋'
          }
        }));
      }, 500); // Pequeño delay para que se vea bien
    }
    
    // Simular progreso automático con mensajes del restaurante
    // Tiempos proporcionales: 13% del tiempo total para cada etapa
    const prepTime = Math.round(deliveryMinutes * 0.13) * 60 * 1000; // ~13% del tiempo
    const onwayTime = Math.round(deliveryMinutes * 0.33) * 60 * 1000; // ~33% del tiempo
    
    // Después de prepTime: preparing + mensaje de confirmación
    setTimeout(() => {
      setOrders(prev => prev.map(o => 
        o.id === newOrder.id ? { 
          ...o, 
          status: 'preparing',
          messages: [
            ...o.messages,
            {
              id: o.messages.length + 1,
              from: 'business',
              business: businessName,
              text: '✅ ¡Pedido confirmado! Nuestro chef ya está preparando tu orden con mucho cariño. 👨‍🍳',
              timestamp: Date.now(),
              read: false
            }
          ]
        } : o
      ));
      
      // Mostrar notificación
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            business: businessName,
            text: '✅ ¡Pedido confirmado! Estamos preparando tu orden. 👨‍🍳'
          }
        }));
      }
    }, prepTime);
    
    // Después de onwayTime: onway + mensaje de envío
    setTimeout(() => {
      setOrders(prev => prev.map(o => 
        o.id === newOrder.id ? { 
          ...o, 
          status: 'onway',
          messages: [
            ...o.messages,
            {
              id: o.messages.length + 1,
              from: 'business',
              business: businessName,
              text: '🚗 ¡Tu pedido salió! Nuestro repartidor ya va en camino a tu ubicación. Llega pronto!',
              timestamp: Date.now(),
              read: false
            }
          ]
        } : o
      ));
      
      // Mostrar notificación
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            business: businessName,
            text: '🚗 ¡Tu pedido salió! Ya va en camino.'
          }
        }));
      }
    }, onwayTime);
    
    // Después de deliveryMs: delivered + mensaje de entrega
    setTimeout(() => {
      setOrders(prev => prev.map(o => 
        o.id === newOrder.id ? { 
          ...o, 
          status: 'delivered',
          messages: [
            ...o.messages,
            {
              id: o.messages.length + 1,
              from: 'business',
              business: businessName,
              text: '🎉 ¡Pedido entregado! Gracias por rescatar alimentos con nosotros. ¡Buen provecho! 😋',
              timestamp: Date.now(),
              read: false
            }
          ]
        } : o
      ));
      
      // Actualizar estadísticas del usuario cuando se entrega
      if (typeof window !== 'undefined') {
        const stats = JSON.parse(localStorage.getItem('comeya_user_stats') || '{"mealsRescued": 0, "moneySaved": 0, "co2Avoided": 0, "totalOrders": 0}');
        
        // Calcular ahorro (diferencia entre precio original y precio con descuento)
        const savedAmount = items.reduce((sum, item) => {
          const saved = item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0;
          return sum + saved;
        }, 0);
        
        // Calcular comidas rescatadas (número de items)
        const mealsCount = items.reduce((sum, item) => sum + item.qty, 0);
        
        // Estimar CO2 evitado (aprox 0.5 kg por comida rescatada)
        const co2 = mealsCount * 0.5;
        
        stats.mealsRescued += mealsCount;
        stats.moneySaved += savedAmount;
        stats.co2Avoided += co2;
        stats.totalOrders += 1;
        
        localStorage.setItem('comeya_user_stats', JSON.stringify(stats));
        
        // Mostrar notificación
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            business: businessName,
            text: '🎉 ¡Pedido entregado! Buen provecho. 😋'
          }
        }));
      }
    }, deliveryMs);
    
    return newOrder;
  };

  // Función para enviar mensaje del cliente
  const sendClientMessage = (orderId, messageText) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      
      const businesses = [...new Set(o.items.map(item => item.businessName))];
      const businessName = businesses[0];
      
      // Números de teléfono simulados por restaurante
      const businessPhones = {
        "Restaurant Sabor Peruano": "987-654-321",
        "Pollería Don Pepe": "945-123-456",
        "Ohashi Sushi Bar": "912-345-678",
        "Chifa Lung Fung": "998-765-432",
        "La Pizzería Napoli": "923-456-789",
        "Panadería El Trigal": "956-789-012",
        "Cevichería El Pescador": "987-123-456",
        "Jugos La Vitamina": "934-567-890",
        "Cafetería Don Café": "978-234-567",
        "El Buen Sabor": "912-987-654",
        "Tacos Mexicanos Loco": "945-678-901",
        "Burger Master": "923-789-012",
        "Dulces Delicias": "956-890-123",
        "Parrilladas El Carbón": "987-456-789",
        "Comida Vegana Verde": "934-890-234"
      };
      
      const phone = businessPhones[businessName] || "987-654-321";
      
      // Mensaje del cliente
      const clientMessage = {
        id: o.messages.length + 1,
        from: 'client',
        text: messageText,
        timestamp: Date.now(),
        read: true
      };
      
      // Respuesta automática del restaurante con número de contacto
      const businessResponse = {
        id: o.messages.length + 2,
        from: 'business',
        business: businessName,
        text: `¡Hola! Entendemos tu inquietud. Para atenderte de inmediato, comunícate con nosotros al 📞 ${phone}. Estamos disponibles de 8am a 10pm. ¡Estamos aquí para ayudarte! 😊`,
        timestamp: Date.now() + 2000, // 2 segundos después
        read: false
      };
      
      // Agregar ambos mensajes
      const updatedOrder = {
        ...o,
        messages: [...o.messages, clientMessage, businessResponse]
      };
      
      // Mostrar notificación después de 2 segundos
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { 
              business: businessName,
              text: '📞 El restaurante te respondió. Revisa tu pedido.'
            }
          }));
        }
      }, 2000);
      
      return updatedOrder;
    }));
  };

  const cartDetailed = useMemo(() => cart.map(item => {
    if (item.name) return item;
    const p = products.find(x => x.id === item.id);
    return p ? { ...p, qty: item.qty } : null;
  }).filter(Boolean), [cart, products]);

  const subtotal = useMemo(() => cartDetailed.reduce((s, p) => s + (p.price * p.qty), 0), [cartDetailed]);

  const value = {
    products, addProduct, removeProduct,
    cart, addToCart, removeFromCart, changeQty, clearCart,
    cartDetailed, subtotal,
    orders, createOrder, sendClientMessage
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
