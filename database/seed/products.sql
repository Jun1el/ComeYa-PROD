-- Seed data for products table
-- Execute this in Supabase SQL Editor after creating a business

-- First, get or create a business
-- If you already have a business, replace the business_id below with your actual business_id
-- You can find it with: SELECT id, name FROM public.businesses WHERE owner_id = 'YOUR_USER_ID';

-- Example products for testing
INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Hamburguesa Clásica' as name,
    'Deliciosa hamburguesa con queso, lechuga y tomate' as description,
    'Comidas' as category,
    15.90 as price,
    25.00 as original_price,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' as image_url,
    10 as stock,
    NOW() + INTERVAL '4 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Pizza Margherita' as name,
    'Pizza tradicional con mozzarella y albahaca fresca' as description,
    'Comidas' as category,
    22.50 as price,
    35.00 as original_price,
    'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500' as image_url,
    8 as stock,
    NOW() + INTERVAL '6 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Ensalada César' as name,
    'Ensalada fresca con pollo, crutones y aderezo césar' as description,
    'Comidas' as category,
    18.00 as price,
    28.00 as original_price,
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500' as image_url,
    12 as stock,
    NOW() + INTERVAL '3 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Pastel de Chocolate' as name,
    'Delicioso pastel de chocolate con ganache' as description,
    'Postres' as category,
    12.00 as price,
    20.00 as original_price,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500' as image_url,
    6 as stock,
    NOW() + INTERVAL '8 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Limonada Natural' as name,
    'Limonada fresca hecha en el momento' as description,
    'Bebidas' as category,
    6.50 as price,
    10.00 as original_price,
    'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500' as image_url,
    20 as stock,
    NOW() + INTERVAL '12 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Sandwich de Pollo' as name,
    'Sandwich de pollo a la plancha con vegetales' as description,
    'Comidas' as category,
    14.50 as price,
    22.00 as original_price,
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500' as image_url,
    15 as stock,
    NOW() + INTERVAL '5 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Café Americano' as name,
    'Café recién molido de origen peruano' as description,
    'Bebidas' as category,
    5.00 as price,
    8.00 as original_price,
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' as image_url,
    30 as stock,
    NOW() + INTERVAL '24 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

INSERT INTO public.products (business_id, name, description, category, price, original_price, image_url, stock, expires_at, is_active)
SELECT 
    b.id as business_id,
    'Pan Artesanal' as name,
    'Pan recién horneado con masa madre' as description,
    'Panadería' as category,
    8.00 as price,
    12.00 as original_price,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' as image_url,
    25 as stock,
    NOW() + INTERVAL '10 hours' as expires_at,
    true as is_active
FROM public.businesses b
LIMIT 1;

-- Verify the products were created
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.original_price,
    p.stock,
    p.expires_at,
    b.name as business_name
FROM public.products p
JOIN public.businesses b ON b.id = p.business_id
ORDER BY p.created_at DESC
LIMIT 10;
