# GymControl — Frontend 🎨

Interfaz de usuario moderna para la gestión de gimnasios, desarrollada con **Angular 16** y **PrimeNG**.

## ✨ Características del Frontend

- **Glassmorphism Desktop:** Estética premium con transparencias y desenfoques.
- **Responsivo:** Adaptado para quioscos de registro facial y administración desde móviles.
- **Automatización de Membresías:**
  - Cálculo instantáneo de vencimiento y precio al seleccionar el plan.
  - Bloqueo de campos automáticos para evitar errores humanos.
- **Control de Versiones:** Sistema automático que incrementa el número de versión (`package.json` y `assets/version.json`) en cada arranque de desarrollo o build de producción.

## 🛠️ Desarrollo

### Pre-requisitos

- Node.js (v16+)
- Angular CLI (`npm install -g @angular/cli`)

### Instalación

```bash
npm install
```

### Servidor de Desarrollo

Ejecuta el siguiente comando para iniciar el servidor de desarrollo. La versión se incrementará automáticamente.

```bash
npm start
```

Navega a `http://localhost:4200/`.

### Producción (Build)

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## 📁 Estructura

- `src/app/components`: Componentes principales (Membresías, Clientes, Facial Check-in).
- `src/app/services`: Servicios para comunicación con la API.
- `src/assets`: Recursos estáticos y archivo de versión.

---

_GymControl — Warrior Spirit_
