# Configuración de Supabase

## 1. Crear Proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en "New Project"
3. Configura:
   - **Name**: `comeya`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: US East (o la más cercana)
   - **Pricing Plan**: Free

## 2. Ejecutar Migraciones

Una vez creado el proyecto:

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Ejecuta las migraciones **en orden**:

```sql
-- 1. Schema inicial (tablas)
-- Copia y pega el contenido de: database/migrations/001_initial_schema.sql

-- 2. RLS Policies
-- Copia y pega el contenido de: database/migrations/002_rls_policies.sql

-- 3. Functions y Triggers
-- Copia y pega el contenido de: database/migrations/003_functions_triggers.sql
```

## 3. Ejecutar Seed Data

```sql
-- 4. Distritos
-- Copia y pega el contenido de: database/seed/districts.sql

-- 5. Cupones
-- Copia y pega el contenido de: database/seed/coupons.sql
```

## 4. Obtener Credenciales

1. Ve a **Project Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (empieza con `eyJ`)

## 5. Configurar Frontend

Crea el archivo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 6. Configurar Backend

Edita `backend/src/ComeYa.API/appsettings.Development.json`:

```json
{
  "Supabase": {
    "Url": "https://tu-proyecto.supabase.co",
    "AnonKey": "tu-anon-key-aqui"
  },
  "ConnectionStrings": {
    "Supabase": "Host=db.tu-proyecto.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=tu-database-password"
  },
  "Frontend": {
    "Url": "http://localhost:3000"
  }
}
```

**Nota**: El host de la base de datos es `db.tu-proyecto.supabase.co` (con `db.` al inicio).

## 7. Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Email** esté habilitado
3. Desactiva "Confirm email" para desarrollo (opcional)

## 8. Verificar Configuración

### Frontend
```bash
cd frontend
npm run dev
```

Abre http://localhost:3000 y verifica que no haya errores en la consola.

### Backend
```bash
cd backend
dotnet run --project src/ComeYa.API
```

Abre http://localhost:5000/swagger y verifica que la API responda.

## 9. Crear Usuario de Prueba

1. Ve a http://localhost:3000/register
2. Registra un usuario de prueba
3. Verifica en Supabase → **Authentication** → **Users** que el usuario se creó
4. Verifica en **Table Editor** → **profiles** que el perfil se creó automáticamente

## 10. Troubleshooting

### Error: "JWT validation failed"
- Verifica que la URL de Supabase no tenga `/` al final
- Verifica que el anon key sea correcto

### Error: "Connection refused"
- Verifica que el backend esté corriendo en el puerto 5000
- Verifica que `NEXT_PUBLIC_API_URL` sea correcto

### Error: "RLS policy violation"
- Verifica que ejecutaste todas las migraciones en orden
- Verifica que el usuario esté autenticado

### El perfil no se crea automáticamente
- Verifica que el trigger `on_auth_user_created` exista:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 11. Variables para Producción

### Vercel (Frontend)
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega:
   - `NEXT_PUBLIC_API_URL`: URL de tu API en Render
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key de Supabase

### Render (Backend)
1. Ve a tu servicio en Render
2. **Environment**
3. Agrega:
   - `Supabase__Url`: URL de Supabase
   - `Supabase__AnonKey`: Anon key de Supabase
   - `ConnectionStrings__Supabase`: Connection string completo
   - `Frontend__Url`: URL de tu frontend en Vercel
