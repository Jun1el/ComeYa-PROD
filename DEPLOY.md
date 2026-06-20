# 🚀 Guía de Despliegue a Vercel

Esta guía te llevará paso a paso para subir tu proyecto a GitHub y desplegarlo en Vercel.

---

## 📋 Pre-requisitos

✅ Git instalado en tu computadora  
✅ Cuenta de GitHub (gratuita)  
✅ Cuenta de Vercel (gratuita, puedes usar tu cuenta de GitHub)

---

## 1️⃣ Preparar el Repositorio Local

### Verificar archivos importantes

Asegúrate de tener estos archivos en tu proyecto:

```
✅ .gitignore   (para no subir node_modules y archivos innecesarios)
✅ package.json (con todas las dependencias)
✅ README.md    (documentación del proyecto)
```

### Inicializar Git (si no lo has hecho)

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar repositorio (solo si no existe)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: ComeYa! prototipo completo"
```

---

## 2️⃣ Crear Repositorio en GitHub

### Opción A: Desde la Web

1. Ve a [github.com](https://github.com)
2. Click en el botón **"+"** arriba a la derecha → **"New repository"**
3. Configura tu repositorio:
   - **Repository name**: `comeya-prototipo` (o el nombre que prefieras)
   - **Description**: "Plataforma de rescate alimentario - Reduce desperdicio con descuentos"
   - **Public** o **Private** (tu elección)
   - ⚠️ **NO marques** "Add a README" (ya tienes uno)
   - ⚠️ **NO agregues** .gitignore ni license (ya los tienes)
4. Click **"Create repository"**

### Conectar tu proyecto local con GitHub

GitHub te mostrará comandos. Usa estos (reemplaza `tu-usuario`):

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/tu-usuario/comeya-prototipo.git

# Renombrar rama a main (si es necesario)
git branch -M main

# Subir tu código
git push -u origin main
```

**Si pide autenticación:**
- Usuario: tu username de GitHub
- Contraseña: necesitas un **Personal Access Token** (no tu contraseña normal)

#### Crear Personal Access Token (si es necesario):
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Marcar "repo" → Generate
3. Copia el token y úsalo como contraseña

---

## 3️⃣ Desplegar en Vercel

### Método Recomendado: Importar desde GitHub

1. **Ve a [vercel.com](https://vercel.com)**

2. **Iniciar sesión**:
   - Click en **"Sign Up"** o **"Log In"**
   - Selecciona **"Continue with GitHub"**
   - Autoriza Vercel para acceder a tus repositorios

3. **Importar proyecto**:
   - Click en **"Add New..."** → **"Project"**
   - Verás lista de tus repositorios de GitHub
   - Busca `comeya-prototipo` y click **"Import"**

4. **Configurar proyecto**:
   ```
   Project Name: comeya-prototipo (o el que prefieras)
   Framework Preset: Next.js (se detecta automáticamente)
   Root Directory: ./ (dejar por defecto)
   Build Command: (dejar vacío, usa el default)
   Output Directory: (dejar vacío, usa el default)
   Install Command: (dejar vacío, usa el default)
   ```

5. **Variables de entorno**:
   ```
   ⚠️ NO necesitas agregar ninguna variable de entorno
   Este proyecto no usa APIs externas ni secrets
   ```

6. **Deploy**:
   - Click **"Deploy"**
   - Espera 1-3 minutos ⏳
   - ✅ ¡Verás "Congratulations"!

7. **Tu app está en línea**:
   ```
   URL: https://comeya-prototipo.vercel.app
   (o similar, Vercel te asigna una URL única)
   ```

---

## 4️⃣ Verificar Funcionamiento

### Prueba estas páginas:

✅ **Landing page**: `https://tu-url.vercel.app/`  
✅ **Login**: `https://tu-url.vercel.app/login`  
✅ **Shop**: Login como cliente y prueba el catálogo  
✅ **Admin**: Login como dueño y prueba agregar producto  

### Probar con estas cuentas:

**Cliente:**
```
Email: cliente@comeya.app
Password: cliente123
```

**Dueño:**
```
Email: dueno@comeya.app
Password: owner123
```

---

## 5️⃣ Actualizar tu Proyecto

Cada vez que hagas cambios locales:

```bash
# 1. Guardar cambios
git add .
git commit -m "Fix: descripción de tu cambio"

# 2. Subir a GitHub
git push origin main

# 3. Vercel detecta el push y redespliega automáticamente ✨
#    No necesitas hacer nada más!
```

**Auto-deploy**: Vercel redespliegará tu app automáticamente cada vez que hagas `git push`

---

## 🎨 Personalizar Dominio (Opcional)

### URL personalizada de Vercel (gratis):

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega: `tu-nombre-personalizado.vercel.app`

### Dominio propio (requiere dominio):

1. Compra un dominio (ej: `comeya.com`)
2. En Vercel → Settings → Domains → Add
3. Sigue instrucciones para configurar DNS

---

## ⚠️ Solución de Problemas

### Error: "Cannot find module"
```bash
# Asegúrate de que package.json tenga todas las dependencias
npm install
git add package-lock.json
git commit -m "Update: dependencies"
git push
```

### Error: Build failed
- Verifica que `npm run build` funcione localmente
- Revisa logs en Vercel dashboard
- Asegúrate de que no haya errores de TypeScript/ESLint

### localStorage no persiste entre despliegues
- ✅ **Esto es normal**: localStorage es del navegador
- ✅ Cada usuario tendrá su propio localStorage
- ✅ Los datos se mantienen mientras no borren cookies

---

## 📊 Monitoreo (Opcional)

### Ver estadísticas en Vercel:

1. Dashboard de tu proyecto
2. **Analytics**: Visitas, países, dispositivos
3. **Logs**: Errores en tiempo real
4. **Speed Insights**: Rendimiento de tu app

---

## 🎉 ¡Felicitaciones!

Tu app **ComeYa!** está en línea y lista para compartir:

```
🌐 URL: https://tu-proyecto.vercel.app
📱 Comparte el link con amigos/profesores
📈 Cada cambio se actualiza automáticamente
```

---

## 📞 ¿Problemas?

- 📚 Docs de Vercel: https://vercel.com/docs
- 💬 Support: https://vercel.com/support
- 🐛 GitHub Issues: Para reportar bugs

---

**¡Tu proyecto está listo para el mundo! 🚀🌍**
