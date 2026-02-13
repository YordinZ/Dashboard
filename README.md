# 📊 FacturaIQ – Dashboard Analítico Inteligente

FacturaIQ es una plataforma de analítica de facturación que permite cargar archivos CSV y transformarlos en dashboards interactivos, KPIs estratégicos y reportes automáticos.

El sistema incluye autenticación segura con JWT, backend en Node.js y base de datos PostgreSQL en Neon.

---

## 🚀 Demo

Frontend: (agregar cuando lo subas a GitHub Pages)  
Backend API: (agregar cuando lo despliegues)

---

# 🧠 Características Principales

## 🔐 Autenticación
- Registro de usuarios
- Login con validación real
- JWT (JSON Web Token)
- Rutas protegidas
- Manejo de roles (estructura lista para escalar)

## 📂 Carga de CSV
- Subida dinámica de archivos
- Procesamiento en el cliente
- Detección automática de columnas
- Normalización de datos

## 📈 Dashboard Analítico
- KPIs principales
- Tendencias temporales
- Productos más vendidos
- Días pico y días bajos
- Visualizaciones interactivas

## 📄 Reportes
- Generación automática de reportes
- Exportación en CSV / PDF
- Análisis resumido

---

# 🏗 Arquitectura del Proyecto

FacturaIQ/
│
├── backend/ → API Express + PostgreSQL + JWT
│
├── src/ → Frontend React + Vite + Tailwind
│
└── public/


---

# 🖥 Frontend

### Tecnologías utilizadas:

- React
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- Lucide Icons
- React Router
- Context API

### Estructura clave:

- `ProtectedRoute.tsx` → Protección de rutas
- `LoginPage.tsx` → Autenticación
- `Dashboard.tsx` → Visualización de datos
- `Upload.tsx` → Subida y procesamiento de CSV
- `DataContext.tsx` → Manejo global de datos

---

# ⚙ Backend

Ubicación: `/backend`

### Tecnologías utilizadas:

- Node.js
- Express
- PostgreSQL
- Neon Database
- JWT
- bcrypt
- dotenv
- Helmet
- CORS

---

## 🔐 Autenticación JWT

El backend genera un token firmado con:

```js
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" })
```
---

# 🗄 Base de Datos
Base de datos: PostgreSQL (Neon)

Tabla principal:
```js
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 🔧 Instalación Local
1️⃣ Clonar repositorio
git clone https://github.com/tu_usuario/facturaiq.git
cd facturaiq

2️⃣ Frontend
npm install
npm run dev

Frontend correrá en:
http://localhost:8080

3️⃣ Backend
cd backend
npm install
node src/server.js

Backend correrá en:
http://localhost:4000

---

# 🔑 Variables de Entorno
-Backend (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=super_secret_random_string
CORS_ORIGIN=http://localhost:8080
PORT=4000

-Frontend (.env)
VITE_API_URL=http://localhost:4000

---

# 🌍 Deploy
Frontend
GitHub Pages

Backend
Render / Railway (recomendado)
Neon PostgreSQL como base de datos

---

# 🔐 Seguridad Implementada
Hash de contraseñas con bcrypt
JWT firmado
Helmet (headers de seguridad)
CORS configurado
Variables protegidas con dotenv

---

# 🧩 Futuras Mejoras
Middleware global de autenticación
Roles admin
Dashboard multiusuario
Persistencia histórica de CSV
Integración OAuth (Google/GitHub)
Cookies httpOnly para mayor seguridad