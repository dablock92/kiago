# Kiago - Documentación del Proyecto (Antigravity)

Este documento es una recopilación completa de la arquitectura, características y estado actual del proyecto **Kiago**, una aplicación móvil desarrollada en **React Native** utilizando **Expo**.

## 1. Resumen del Proyecto

**Kiago** es una aplicación diseñada con un enfoque **Premium** y una estética moderna (Slate/Indigo, Glassmorphism, animaciones fluidas) para la gestión y reporte de incidentes. Su principal funcionalidad es permitir a los usuarios documentar paso a paso incidentes como **Choques vehiculares** y el **Robo de celulares**, guardando la información de manera local (offline-first) y permitiendo su posterior exportación a formatos útiles como **PDF** y **Email**.

## 2. Stack Tecnológico

- **Framework Core:** React Native (v0.74+) con Expo (v51+).
- **Enrutamiento:** Expo Router (Navegación basada en archivos y Tab bar).
- **Lenguaje:** TypeScript (Tipado estricto).
- **Gestión de Estado:** Zustand (`store/useIncidentStore.ts`, etc.).
- **Persistencia Local:** SQLite (`expo-sqlite`) para guardar historiales de reportes y configuración.
- **UI / Estilos:**
  - Estética Premium (Colores Slate/Indigo, temas oscuros y claros).
  - Iconos: `lucide-react-native`.
  - Animaciones: `react-native-reanimated`.
  - Gradientes: `expo-linear-gradient`.
- **Servicios de Hardware/Nativos:**
  - Cámara / Galería: `expo-image-picker` y `expo-camera`.
  - Sistema de Archivos: `expo-file-system`.
  - Compartir/Exportar: `expo-sharing`, `expo-mail-composer`.

## 3. Estructura de Directorios

La estructura del proyecto está fuertemente organizada para separar las responsabilidades:

- `/app`: Contiene el enrutamiento principal de Expo Router.
  - `/app/(tabs)`: Pantallas principales accesibles desde el Tab Bar (Inicio, Historial, Ajustes).
  - `/app/flow`: Pantallas del wizard o flujo de creación de reportes paso a paso (ej: `choque`, `robo-celular`).
- `/components`: Componentes UI reutilizables.
  - `/components/flow`: Componentes específicos de los flujos de reporte (Inputs, tarjetas de selección, modales informativos, captura de fotos).
- `/store`: Tiendas de Zustand para la gestión de estado global (`useIncidentStore.ts`, `useSettingsStore.ts`, `useConfigStore.ts`).
- `/services`: Lógica de negocio y servicios externos.
  - `databaseService.ts`: Inicialización y consultas de la base de datos SQLite.
  - `exportService.ts`: Lógica para compilar los reportes en HTML, generar PDFs y preparar el envío por correo.
- `/constants`: Tokens de diseño, colores, fuentes, y variables globales.
- `/assets`: Recursos estáticos (imágenes, fuentes, íconos de la app).

## 4. Funcionalidades Principales Implementadas

### A. Flujos de Reporte (Wizard)

El núcleo de la aplicación son los flujos guiados para reportar incidentes.

1. **Flujo de Choque (Car Crash):**
   - Recopilación de datos de los involucrados (Nombre, Vehículo, Seguro).
   - Captura de fotos de la licencia (Frente/Dorso) y el DNI.
   - Captura de fotos del siniestro.
2. **Flujo de Robo de Celular:**
   - Pasos para reportar el robo.
   - Acciones de emergencia interactivas: Modales informativos para bloquear líneas, tarjetas, bancos y billeteras virtuales (ej: MercadoPago, Visa, Mastercard).
   - Iconos de "info" dedicados a la derecha de las acciones para expandir la información y acceder a links útiles.

### B. Gestión de Imágenes y Evidencia

- Captura dual de documentos (Frente y Dorso en la misma vista).
- Vista previa de imágenes adjuntas mostradas en cuadrícula.
- **Visor Full-Screen:** Al mantener presionada (Long Press) cualquier imagen pequeña en los reportes o resúmenes, esta se expande y muestra al 100% de la pantalla en un modal (estilo Instagram).

### C. Persistencia y Base de Datos (Offline-First)

- Toda la información recolectada durante los flujos de reporte se persiste de forma segura mediante **SQLite**.
- **Módulo de Historial:** Pantalla dedicada en los Tabs para visualizar el historial de reportes creados previamente, permitiendo ver detalles pasados en cualquier momento sin requerir conexión a internet.

### D. Exportación (PDF y Email)

- Los reportes finalizados pueden ser exportados de manera profesional.
- Conversión de los datos estructurados a **HTML** para conformar el cuerpo del email, inyectando las imágenes adjuntas.
- Generación de archivos **PDF** listos para ser compartidos a aseguradoras o autoridades, utilizando las herramientas de impresión y file system de Expo.

## 5. Decisiones de Diseño y UI/UX

- **Tipografía y Legibilidad:** Evitamos fondos en textos que compliquen la legibilidad, asegurando buen contraste respecto a las cards de fondo.
- **Acceso a Información:** La información adicional y de ayuda dentro de los flujos no interrumpe el flujo principal; se accede a través de modales dedicados activados por botones de información auxiliares.
- **Sensación Premium:** El uso extendido de `BlurView` (Glassmorphism), sombras suaves, esquinas redondeadas generosas y transiciones cuidadas con Reanimated brindan una experiencia de usuario superior.

---

_Documento generado por Antigravity para mantener el contexto histórico y técnico del proyecto Kiago._
