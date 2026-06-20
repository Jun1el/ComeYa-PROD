// Distritos disponibles en Lima
export const DISTRICTS = [
  "San Martin de Porres",
  "Comas",
  "Los Olivos",
  "Independencia",
  "San Juan de Miraflores",
  "Villa el Salvador",
  "Chorrillos",
  "El Agustino",
  "Ate",
  "Santa Anita"
];

// Matriz de distancias aproximadas en km entre distritos
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

export function getDistanceBetween(district1, district2) {
  if (!district1 || !district2) return null;
  return DISTRICT_DISTANCES[district1]?.[district2] ?? null;
}

export function getDistanceLabel(distance) {
  if (distance === null || distance === undefined) return '';
  if (distance === 0) return 'En tu distrito';
  if (distance <= 5) return `${distance} km - Muy cerca`;
  if (distance <= 10) return `${distance} km - Cerca`;
  return `${distance} km`;
}

// Calcular tarifa de envío según distancia
export function getShippingCost(distance) {
  if (distance === null || distance === undefined) return 4; // Default
  if (distance <= 10) return 4;
  if (distance <= 25) return 6;
  return 8; // 25+ km
}

// Planes de membresía
export const MEMBERSHIP_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Acceso al catálogo completo',
      'Descuentos de 40-70%',
      'Cupón PRIMERA30 (3 usos)',
      'Tracking de pedidos'
    ],
    futureFeatures: []
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.90,
    features: [
      'Acceso al catálogo completo',
      'Descuentos de 40-70%',
      'Cupones exclusivos Premium',
      'Tracking de pedidos',
      'Soporte prioritario'
    ],
    futureFeatures: [
      '3 envíos gratis al mes',
      'Acceso anticipado a ofertas',
      'Descuentos adicionales en productos seleccionados'
    ]
  }
};

// Cupones disponibles
export const COUPONS = {
  'PRIMERA30': {
    code: 'PRIMERA30',
    discount: 0.30, // 30%
    maxUses: 3,
    description: '30% de descuento en tus primeras 3 compras',
    minPurchase: 0,
    membershipRequired: null // Disponible para todos
  },
  'PREMIUM20': {
    code: 'PREMIUM20',
    discount: 0.20, // 20%
    maxUses: 10,
    description: '20% de descuento - Exclusivo Premium',
    minPurchase: 15,
    membershipRequired: 'PREMIUM'
  },
  'PREMIUM15': {
    code: 'PREMIUM15',
    discount: 0.15, // 15%
    maxUses: 999, // Casi ilimitado
    description: '15% de descuento - Exclusivo Premium',
    minPurchase: 0,
    membershipRequired: 'PREMIUM'
  }
};

// Verificar si un cupón es válido para el usuario
export function validateCoupon(couponCode, userEmail, userMembership = 'FREE') {
  if (typeof window === 'undefined') return { valid: false, error: 'No disponible' };
  
  const coupon = COUPONS[couponCode.toUpperCase()];
  if (!coupon) return { valid: false, error: 'Cupón no válido' };
  
  // Verificar si requiere membresía Premium
  if (coupon.membershipRequired === 'PREMIUM' && userMembership !== 'PREMIUM') {
    return { valid: false, error: 'Este cupón es exclusivo para miembros Premium' };
  }
  
  // Verificar cuántas veces ha usado este cupón
  const couponUsage = JSON.parse(localStorage.getItem('comeya_coupon_usage') || '{}');
  const userUsage = couponUsage[userEmail] || {};
  const timesUsed = userUsage[couponCode.toUpperCase()] || 0;
  
  if (timesUsed >= coupon.maxUses) {
    return { valid: false, error: `Este cupón ya fue usado ${coupon.maxUses} ${coupon.maxUses === 1 ? 'vez' : 'veces'}` };
  }
  
  return { valid: true, coupon };
}

// Registrar uso de cupón
export function useCoupon(couponCode, userEmail) {
  if (typeof window === 'undefined') return;
  
  const couponUsage = JSON.parse(localStorage.getItem('comeya_coupon_usage') || '{}');
  if (!couponUsage[userEmail]) couponUsage[userEmail] = {};
  
  const code = couponCode.toUpperCase();
  couponUsage[userEmail][code] = (couponUsage[userEmail][code] || 0) + 1;
  
  localStorage.setItem('comeya_coupon_usage', JSON.stringify(couponUsage));
}

// Obtener cupones disponibles para el usuario
export function getAvailableCoupons(userEmail, userMembership = 'FREE') {
  if (typeof window === 'undefined') return [];
  
  const couponUsage = JSON.parse(localStorage.getItem('comeya_coupon_usage') || '{}');
  const userUsage = couponUsage[userEmail] || {};
  
  return Object.values(COUPONS).filter(coupon => {
    // Verificar si el cupón requiere Premium
    if (coupon.membershipRequired === 'PREMIUM' && userMembership !== 'PREMIUM') {
      return false;
    }
    
    const timesUsed = userUsage[coupon.code] || 0;
    return timesUsed < coupon.maxUses;
  });
}

// Actualizar membresía del usuario
export function upgradeToPremium(userEmail) {
  if (typeof window === 'undefined') return false;
  
  // Primero verificar si es un usuario preset
  const isPresetUser = PRESET_USERS.some(u => u.email === userEmail);
  
  if (isPresetUser) {
    // Los usuarios preset no se pueden modificar en localStorage, 
    // pero podemos actualizar el usuario actual en sesión
    const currentUserData = JSON.parse(localStorage.getItem('comeya_user') || 'null');
    if (currentUserData && currentUserData.email === userEmail) {
      currentUserData.membership = 'PREMIUM';
      currentUserData.membershipDate = new Date().toISOString();
      localStorage.setItem('comeya_user', JSON.stringify(currentUserData));
      return true;
    }
    return false;
  }
  
  // Para usuarios registrados
  const users = JSON.parse(localStorage.getItem('comeya_registered_users') || '[]');
  const userIndex = users.findIndex(u => u.email === userEmail);
  
  if (userIndex === -1) return false;
  
  users[userIndex].membership = 'PREMIUM';
  users[userIndex].membershipDate = new Date().toISOString();
  
  localStorage.setItem('comeya_registered_users', JSON.stringify(users));
  
  // Actualizar usuario actual en sesión
  const currentUserData = JSON.parse(localStorage.getItem('comeya_user') || 'null');
  if (currentUserData && currentUserData.email === userEmail) {
    currentUserData.membership = 'PREMIUM';
    currentUserData.membershipDate = new Date().toISOString();
    localStorage.setItem('comeya_user', JSON.stringify(currentUserData));
  }
  
  return true;
}

export const PRESET_USERS = [
  // Dueños de negocios
  { 
    role: "owner", 
    email: "dueno@comeya.app", 
    password: "owner123", 
    name: "Carlos Mendoza", 
    district: "San Martin de Porres",
    businessName: "Restaurant Sabor Peruano"
  },
  { 
    role: "owner", 
    email: "ohashi@comeya.app", 
    password: "owner123", 
    name: "Kenji Tanaka", 
    district: "Los Olivos",
    businessName: "Ohashi Sushi Bar"
  },
  { 
    role: "owner", 
    email: "dulcearte@comeya.app", 
    password: "owner123", 
    name: "María García", 
    district: "Chorrillos",
    businessName: "Pastelería Dulce Arte"
  },
  // Clientes
  { 
    role: "customer", 
    email: "cliente@comeya.app", 
    password: "cliente123", 
    name: "Ana Torres", 
    district: "Los Olivos" 
  },
];

export function signIn({ email, password }) {
  // Buscar en usuarios preset
  let user = PRESET_USERS.find(u => u.email === email && u.password === password);
  
  // Si no está en preset, buscar en usuarios registrados
  if (!user && typeof window !== 'undefined') {
    const registeredUsers = JSON.parse(localStorage.getItem("comeya_registered_users") || "[]");
    user = registeredUsers.find(u => u.email === email && u.password === password);
  }
  
  if (user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem("comeya_user", JSON.stringify(user));
    }
    return user;
  }
  return null;
}

export function signUp({ email, password, name, district, role = "customer" }) {
  if (typeof window === 'undefined') return { success: false, error: "No disponible" };
  
  // Verificar si el email ya existe en preset users
  const existsInPreset = PRESET_USERS.some(u => u.email === email);
  if (existsInPreset) {
    return { success: false, error: "Este correo ya está registrado" };
  }
  
  // Cargar usuarios registrados
  const registeredUsers = JSON.parse(localStorage.getItem("comeya_registered_users") || "[]");
  
  // Verificar si el email ya existe en usuarios registrados
  const existsInRegistered = registeredUsers.some(u => u.email === email);
  if (existsInRegistered) {
    return { success: false, error: "Este correo ya está registrado" };
  }
  
  // Crear nuevo usuario con membresía FREE por defecto
  const newUser = {
    role,
    email,
    password,
    name,
    district,
    membership: 'FREE',
    membershipDate: new Date().toISOString(),
    businessName: role === "owner" ? name : undefined
  };
  
  // Agregar a la lista y guardar
  registeredUsers.push(newUser);
  localStorage.setItem("comeya_registered_users", JSON.stringify(registeredUsers));
  
  return { success: true, user: newUser };
}

export function currentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem("comeya_user");
  return raw ? JSON.parse(raw) : null;
}

export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("comeya_user");
  }
}

export function updateUser(updates) {
  if (typeof window === 'undefined') return null;
  const user = currentUser();
  if (!user) return null;
  
  const updatedUser = { ...user, ...updates };
  localStorage.setItem("comeya_user", JSON.stringify(updatedUser));
  return updatedUser;
}
