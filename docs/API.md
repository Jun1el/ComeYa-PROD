# ComeYa API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: `https://comeya-api.onrender.com`

## Authentication
All protected endpoints require a Bearer token from Supabase Auth.

```
Authorization: Bearer <supabase-jwt-token>
```

---

## Endpoints

### Products

#### GET /api/products
Get all active products with optional filters.

**Query Parameters:**
- `category` (string): Comidas, Postres, Bebidas, Panadería
- `district` (string): Filter by business district
- `businessId` (UUID): filtra por establecimiento
- `q` (string): busca por nombre, descripción o establecimiento
- `minPrice` / `maxPrice` (decimal): rango inclusivo de precio del pack
- `originDistrict` (string): distrito desde el cual se calcula la cercanía
- `maxDistanceKm` (decimal): radio máximo; requiere `originDistrict`
- `sort` (string): `expires-soon`, `name-asc`, `name-desc`, `price-asc`, `price-desc` o `distance`
- `limit` (1-100) y `offset` (>= 0): paginación
- `businessId` (guid): Filter by business ID
- `limit` (int, default: 50): Max results
- `offset` (int, default: 0): Pagination offset

**Response:**
```json
[
  {
    "id": "guid",
    "name": "Lomo Saltado",
    "description": "Clásico peruano...",
    "category": "Comidas",
    "price": 8.90,
    "originalPrice": 22.00,
    "imageUrl": "https://...",
    "stock": 5,
    "expiresAt": "2024-12-31T23:59:59Z",
    "discountPercentage": 60,
    "hoursUntilExpiry": 5,
    "distanceKm": 4.0,
    "business": {
      "id": "guid",
      "name": "Restaurant Sabor Peruano",
      "district": "San Martin de Porres",
      "rating": 4.5
    }
  }
]
```

#### GET /api/products/{id}
Get a single product by ID.

#### POST /api/products (Auth required)
Create a new product for the authenticated owner's business. The business is
resolved from the JWT user and cannot be selected by the client.

**Request:**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción",
  "category": "Comidas",
  "price": 10.00,
  "originalPrice": 25.00,
  "imageUrl": "https://...",
  "stock": 10,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### PUT /api/products/{id} (Auth required)
Update an existing product.

#### DELETE /api/products/{id} (Auth required)
Soft delete a product (sets isActive = false).

---

### Orders

#### GET /api/orders (Auth required)
Get orders for the current user.
- Customers see their own orders
- Business owners see orders for their business

**Response:**
```json
[
  {
    "id": "guid",
    "businessId": "guid",
    "businessName": "Restaurant Name",
    "status": "pending|confirmed|preparing|onway|delivered|cancelled",
    "subtotal": 25.00,
    "shippingCost": 4.00,
    "discount": 5.00,
    "couponCode": "PRIMERA30",
    "total": 24.00,
    "paymentMethod": "cash|card",
    "deliveryAddress": "Av. Example 123",
    "deliveryDistrict": "Los Olivos",
    "estimatedDelivery": "2024-12-31T14:30:00Z",
    "deliveredAt": null,
    "createdAt": "2024-12-31T13:00:00Z",
    "items": [...],
    "messagesCount": 2,
    "unreadMessages": 1
  }
]
```

#### GET /api/orders/{id} (Auth required)
Get a single order with messages.

#### POST /api/orders (Auth required)
Create a new order. Items are grouped by business (creates one order per business).

**Request:**
```json
{
  "items": [
    {
      "productId": "guid",
      "businessId": "guid",
      "quantity": 2
    }
  ],
  "deliveryAddress": "Av. Example 123",
  "deliveryDistrict": "Los Olivos",
  "paymentMethod": "cash",
  "couponCode": "PRIMERA30",
  "discount": 5.00,
  "notes": "Sin cebolla por favor"
}
```

#### PUT /api/orders/{id}/status (Auth required, Owner only)
Update order status.

**Request:**
```json
{
  "status": "preparing"
}
```

#### POST /api/orders/{id}/cancel (Auth required, Customer only)
Cancel an order (only if status is "pending").

---

### Profile

#### GET /api/profile (Auth required)
Get current user's profile with stats.

**Response:**
```json
{
  "id": "guid",
  "email": "user@example.com",
  "fullName": "Ana Torres",
  "role": "customer|owner|admin",
  "district": "Los Olivos",
  "membership": "Free|Premium",
  "membershipDate": null,
  "businessName": null,
  "businessPhone": null,
  "avatarUrl": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "stats": {
    "mealsRescued": 15,
    "moneySaved": 120.50,
    "co2Avoided": 7.5,
    "totalOrders": 8
  }
}
```

#### PUT /api/profile (Auth required)
Update profile information.

**Request:**
```json
{
  "fullName": "Ana María Torres",
  "district": "San Isidro",
  "businessPhone": "987654321",
  "avatarUrl": "https://..."
}
```

#### POST /api/profile/upgrade-premium (Auth required)
Upgrade to Premium membership.

---

### Businesses

#### GET /api/businesses
Get all active businesses.

#### GET /api/businesses/{id}
Get a business with its active products.

#### GET /api/businesses/my-business (Auth required, Owner only)
Get the current owner's business.

#### POST /api/businesses (Auth required, Owner only)
Create a new business.

**Request:**
```json
{
  "name": "Mi Restaurante",
  "description": "Comida peruana",
  "district": "Los Olivos",
  "address": "Av. Example 123",
  "phone": "987654321",
  "logoUrl": "https://..."
}
```

#### PUT /api/businesses/{id} (Auth required, Owner only)
Update business information.

---

## Error Responses

```json
{
  "status": 400,
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
