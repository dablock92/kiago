# Documentación de Kiago (v2) - Registro Histórico Antigravity

Este documento recopila el conocimiento arquitectónico, técnico y funcional de la aplicación **Kiago**, centrado en el módulo de reporte de siniestros automotores, basándose en las interacciones y desarrollos recientes.

## 1. Visión General del Proyecto

*   **Nombre de la App:** Kiago
*   **Propósito:** Plataforma móvil para la gestión, registro y exportación formal de denuncias de siniestros automotores.
*   **Stack Tecnológico Principal:**
    *   **Framework:** React Native con Expo (SDK 54).
    *   **Lenguaje:** TypeScript.
    *   **Navegación:** Expo Router.
    *   **Gestión de Estado:** Zustand.
    *   **Base de Datos Local:** SQLite (`expo-sqlite`).
    *   **Iconografía:** `lucide-react-native`.

## 2. Arquitectura de Estado y Modelo de Datos

La aplicación utiliza **Zustand** (`useIncidentStore.ts`) para mantener el estado global del reporte en curso.

### Modelo de Datos Principal
*   **`Incident`**: Representa el reporte completo. Contiene un identificador (`id`), el tipo de flujo (`flowId`, ej: "crash-report"), y un array de partes involucradas.
*   **`InvolvedParty`**: Representa a cada individuo en el siniestro. El índice `0` (si es un "crash-report") se considera siempre la **Parte Asegurada (Titular/Yo)**, y los índices subsiguientes son los **Terceros Involucrados**.
    *   Contiene datos textuales limpios: `name`, `surname`, `dni`, `phone`, `plate`, `insuranceCompany`, `policyNumber`.
    *   **Fotos (`photos`)**: Estructura clave que almacena las URIs locales de la evidencia. Soporta captura dual para documentos: `dniFront`, `dniBack`, `licenseFront`, `licenseBack`, `plate` y un array `damage` para los daños del vehículo.

## 3. Flujo Funcional de Reporte

El núcleo de la aplicación es un flujo paso a paso gestionado por componentes específicos:

### A. ChecklistStep (`ChecklistStep.tsx`)
Es el motor de recolección de datos. Funciona como una lista de tareas dinámicas.
*   **Entradas Híbridas:** Permite al usuario elegir entre escribir un dato manualmente (ej. Patente o DNI) o tomarle una foto.
*   **Feedback Visual Inteligente:** Si el usuario ingresa texto, el checklist muestra el valor real ingresado (ej. "ASD112") en lugar de un texto genérico de estado.
*   **Limpieza de Datos:** Aplica `trim()` a todos los inputs antes de guardarlos para evitar errores por espacios invisibles.

### B. Captura de Evidencia (`CameraStep.tsx`)
*   Se integra de manera contextual. Recientemente se mejoraron los overlays visuales para indicar claramente qué se está fotografiando (ej. "DNI", "Licencia").

### C. Resumen y Exportación (`SummaryStep.tsx`)
*   La pantalla final donde el usuario revisa los datos y decide las acciones de cierre.
*   Incluye validaciones estrictas (ej. formato de email de la aseguradora).
*   **Acciones:** Permite "Descargar Reporte PDF" directamente al dispositivo o "Enviar Informe" por correo electrónico.

### D. Historial (`history.tsx`)
*   Una pestaña central en la navegación (`app/(tabs)/history.tsx`).
*   Muestra los **últimos 10 incidentes** registrados, ordenados del más reciente al más antiguo.
*   Cuenta con un modal de detalle dinámico que muestra la fecha, el tipo de flujo, los datos de cada involucrado y un recuento de la evidencia fotográfica recolectada, separando claramente al titular de los terceros.

## 4. Servicios Core

### Base de Datos (`databaseService.ts`)
*   Se implementó un patrón **Singleton** (`getDb()`) para la inicialización y conexión a `kiago_v1.db`. Esto resolvió problemas críticos de concurrencia y `NullPointerException` en entornos nativos (Android).
*   Maneja el almacenamiento JSON serializado del objeto `Incident`.

### Motor de Exportación (`exportService.ts`)
Este es uno de los módulos más robustos, responsable de generar el entregable final.
*   **Plantilla HTML Profesional:** Transforma el JSON del incidente en un documento HTML con diseño corporativo, tablas espaciadas, código de colores (azul para el titular, rojo para terceros) y avisos legales.
*   **Generación de PDF (`expo-print`):** Convierte el HTML estilizado en un archivo PDF.
*   **Incrustación de Imágenes (Base64):** Para que el PDF contenga las fotos de manera autónoma, las URIs locales se leen y se convierten a Base64.
*   **Envío Integral (`expo-mail-composer`):** Construye un correo que incluye un cuerpo de texto breve y adjunta **tanto el PDF completo como todas las fotografías individuales** en crudo.
*   **Compatibilidad de Compartición (`expo-sharing`):** Permite al usuario guardar o enviar el PDF a través del sistema nativo (WhatsApp, Drive, etc.).

## 5. Decisiones Técnicas y Resoluciones Clave Recientes

1.  **Migración de API FileSystem (SDK 54):** Se detectó y corrigió un error de deprecación al usar `FileSystem.readAsStringAsync`. Se migró exitosamente al uso de la clase moderna `File` (`import { File } from "expo-file-system"`) para la lectura de imágenes a Base64, asegurando compatibilidad futura.
2.  **Resolución de Errores de Tipado y Módulos:** Se solucionaron conflictos de importación (`EncodingType`) y referencias a iconos inexistentes en versiones recientes (`Clock` fue reemplazado consistentemente por `History` de `lucide-react-native`).
3.  **Licencia Dual:** Se rediseñó el modelo para soportar fotos de frente y dorso de la licencia de conducir, replicando la arquitectura probada del DNI.
4.  **Flujo Combinado de Exportación:** Se consolidó el botón de "Enviar Informe" para que ejecute una orquestación compleja: genera el PDF con imágenes incrustadas, recolecta los archivos originales y abre el cliente de correo con todo pre-cargado.
