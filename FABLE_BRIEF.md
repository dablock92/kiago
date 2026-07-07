# FABLE BRIEF — Implementación autónoma de módulos de Kiago (Argentina)

> **Documento de handoff para un agente autónomo (FABLE / Claude).**
> Este archivo es el **único punto de entrada** que necesitás para implementar, de forma autónoma
> y de punta a punta, todos los módulos ("flows") que faltan en la app **Kiago**, respetando las
> **leyes, normas y vigencia (2026) de la República Argentina**.
> Asumí que arrancás en frío: acá está todo el contexto del código, el patrón a seguir, la
> investigación legal requerida y los criterios de aceptación.

---

## 0. Cómo usar este brief (para FABLE)

> **⚡ Si estás retomando trabajo previo:** leé primero **`docs/ESTADO.md`** — registro de avance con los módulos ya implementados, bugs corregidos, verificaciones pendientes y el próximo paso exacto. Este brief es el manual; ESTADO.md es el checkpoint.

1. **Leé este documento completo antes de escribir código.** Contiene la arquitectura real, no la del README (el README está desactualizado y describe un scaffold vacío — ignoralo como fuente de verdad).
   1a. **Leé también los registros históricos de Antigravity** (raíz del repo), que dejaron las IAs que construyeron la base del proyecto:
   - **`OLD-DOCS-ANTIGRAVITY_v2.md`** — el más **nuevo y detallado**, centrado en el módulo **"choque"** (modelo de datos, servicios, decisiones técnicas y el *porqué*). Referencia principal del motor y del flow de siniestros.
   - **`OLD-DOCS-ANTIGRAVITY.md`** (v1) — más **viejo y de alto nivel**. ⚠️ Tiene **datos de stack desactualizados** (dice Expo 51 / RN 0.74; el real es **SDK 54 / RN 0.81**) y estética "Slate/Indigo" que ya no aplica — **no lo uses para stack ni versiones**. Su valor está en **patrones de UX intencionados** (ver §8.1 y abajo).
   - **Precedencia ante conflictos: el CÓDIGO ACTUAL manda > `_v2` > v1.** Los docs reflejan intención, no siempre el estado final. Varias features que describen (ej. modales de bloqueo con links, visor de imágenes full-screen) **pueden no estar implementadas** en el código actual: tratalas como **guía de diseño a construir**, verificando siempre contra el código.
   - **Ninguno de los dos cubre los 7 módulos faltantes** (son puro "choque"/"robo celular"): para el contenido nuevo, la fuente es la §8 + investigación web.
   - **Patrones reutilizables extraídos de v1** (§4–5) que conviene aplicar en los módulos nuevos: (a) **modal informativo por acción con botones/links útiles** que no interrumpe el flujo (para bloquear bancos, tarjetas y billeteras virtuales tipo MercadoPago/Visa/Mastercard) — clave para `robo_tarjetas` y para enriquecer `robo_celular`; (b) **visor de imagen full-screen con long-press** (estilo Instagram) para la evidencia fotográfica; (c) `expo-image-picker` está disponible (además de `expo-camera`) por si un módulo necesita **elegir de la galería**, no solo sacar foto.
2. **Necesitás acceso a búsqueda web** (WebSearch / WebFetch). Se usa para verificar **números de emergencia, marcos legales y su vigencia a 2026** antes de codificar cada módulo. **Nunca inventes datos legales ni números de teléfono**: si no los podés verificar, dejalo marcado como `// TODO: verificar fuente` y seguí.
3. **Trabajá módulo por módulo** siguiendo el orden sugerido en la §13. Cada módulo tiene su objetivo, investigación requerida y Definition of Done (DoD).
4. **Antes de tocar los módulos, corregí los bugs de la §7** (afectan el motor compartido y el flow estrella "choque").
5. **Respetá las convenciones de la §10** (TypeScript strict, Prettier, tono, tema, reutilización de componentes de step existentes).
6. Al terminar cada módulo, verificá contra el **quality gate de la §11**.

---

## 1. Qué es Kiago

App móvil (iOS/Android, Expo + React Native + TypeScript) de **asistencia en crisis/incidentes** para Argentina. El usuario elige un escenario ("¿Qué pasó?"), la app lo **guía paso a paso** para actuar correctamente y **recopila evidencia/datos** (fotos, formularios, checklists), y al final genera un **reporte PDF** que puede guardar o enviar por mail (ej: a su aseguradora).

Tono de producto: **calmar al usuario en pánico**. El copy de la home es *"Relajá. No hay tal crisis. ¿Qué pasó?"*. Todo el texto es en **español rioplatense (es-AR, voseo)** y debe transmitir control y claridad.

Escenarios en la home (`app/(tabs)/index.tsx`, array `SCENARIOS`):

| id | Título | Estado actual |
|---|---|---|
| `choque` | Choqué | ✅ Implementado (referencia de calidad) |
| `robo_celular` | Me robaron el celular | ✅ Implementado (checklist simple) |
| `policia` | Me frenó la policía | ✅ Implementado (checklist simple) |
| `robo_tarjetas` | Me robaron tarjetas | ❌ Placeholder "en construcción" |
| `emergencia` | Emergencia médica | ❌ Placeholder |
| `incendio` | Incendio / Gas | ❌ Placeholder |
| `perdi_alguien` | Perdí a alguien | ❌ Placeholder |
| `perdi_mascota` | Perdí mi mascota | ❌ Placeholder |
| `problema_viaje` | Problema viajando | ❌ Placeholder |
| `inseguro` | Me siento inseguro | ❌ Placeholder |

**Tu misión: convertir los 7 placeholders en flows reales, útiles y legalmente correctos para Argentina.**

---

## 2. Stack y restricciones

- **Expo SDK 54**, **React Native 0.81.5**, **React 19.1**.
- **Expo Router** (`expo-router` ~6): navegación basada en archivos, typed routes activadas (`experiments.typedRoutes`).
- **Estado**: **Zustand** v5 (3 stores). Persistencia con `@react-native-async-storage/async-storage` (config y settings).
- **Persistencia de incidentes**: **expo-sqlite** (`kiago_v1.db`).
- **Cámara**: `expo-camera`. **Export**: `expo-print` (PDF) + `expo-mail-composer` + `expo-sharing`. **Archivos**: `expo-file-system`.
- **UI**: `lucide-react-native` (iconos), `react-native-reanimated` (animaciones), `expo-haptics` (feedback), `expo-linear-gradient`. Tema claro/oscuro vía `constants/Colors.ts` + `useColorScheme`.
- **Alias de import**: `@/*` → raíz del proyecto (definido en `tsconfig.json`). Usá `@/components/...`, `@/store/...`, etc.
- **TypeScript strict = true**. **ESLint extiende expo + prettier**, con `prettier/prettier: "error"` → **el código mal formateado ROMPE el lint**. Corré `yarn lint:fix` antes de dar por cerrado.
- **NO agregues dependencias pesadas nuevas** salvo que sea imprescindible. Si necesitás marcar/llamar teléfonos usá `expo-linking` (`Linking.openURL('tel:911')`) — ya está disponible transitivamente vía Expo; si no, agregalo (`expo-linking` ~8 ya está en package.json).

---

## 3. Arquitectura — motor de "flows" data-driven (LEER CON ATENCIÓN)

El corazón de Kiago es un **motor genérico que renderiza flujos definidos como datos**. **No creás pantallas nuevas por escenario**: definís un array de `Step` y el motor lo dibuja. Este es el patrón que tenés que seguir.

```
data/flows/index.ts        →  Define cada flow como datos (Flow = { id, title, icon, steps[] })
engine/types.ts            →  El "esquema": StepType, Step, ChecklistItem, Field, Flow, ...
app/flow/[id].tsx          →  Máquina de estados: currentStepId + history[], maneja next()/back()/cancel()
components/flow/FlowRenderer.tsx → Despacha cada Step.type al componente de step correspondiente
components/flow/steps/*     →  Componentes de step (uno por StepType)
store/useIncidentStore.ts  →  Estado del incidente en curso (responses + involvedParties)
services/databaseService.ts→  Guardado/lectura en SQLite
services/exportService.ts  →  Genera HTML→PDF y arma el mail con adjuntos
```

**Flujo de datos (importante):**
1. La home llama `startIncident(id)` → crea `currentIncident` vacío en el store con ese `flowId`.
2. `app/flow/[id].tsx` busca el `Flow` por id en `flows`, arranca en `steps[0]` y navega con `handleNext(nextStepId)` (guarda historial para el "atrás").
3. Cada step escribe en el store: los steps genéricos usan `updateResponse(stepId, value)`; el flow "choque" además usa `involvedParties[]` (add/update/remove).
4. `SummaryStep` lee el `currentIncident`, lo **guarda en SQLite** (`saveIncidentToDb`) y ofrece **PDF** (`exportIncidentToPdf`) y **mail** (`exportIncidentToMail`).
5. El historial (`app/(tabs)/history.tsx`) lee de SQLite con `getAllIncidents()`.

**Navegación entre steps:** un `Step` avanza así:
- Si es `question`: cada `Option` puede tener `nextStep` (ramificación) → `onNext(option.nextStep)`.
- Otros steps: `onNext(step.nextStep)`; si `nextStep` es undefined, el motor avanza al **siguiente step del array**.
- El flujo **termina** en un step `type: "summary"`.

---

## 4. Catálogo de StepTypes

Definidos en `engine/types.ts` (`StepType`). **Ojo: no todos están renderizados.** El `switch` de `FlowRenderer.renderStep()` solo maneja los que están ✅. Si un módulo necesita uno ❌, **tenés que crear el componente y agregarlo al switch**.

| StepType | Estado | Componente | Para qué sirve / shape de datos |
|---|---|---|---|
| `question` | ✅ | `QuestionStep` | Pregunta con botones (`options[]`), cada uno con `label` + `nextStep` opcional + `style` (`default`/`danger`/`success`). Guarda `option.label` en `responses[stepId]`. Soporta `option.action` (ej: `"CALL_107"`, hoy es un mock `alert`). |
| `checklist` | ✅ | `ChecklistStep` | Lista de ítems. Acepta **strings simples** (se vuelven ítems informativos) o **`ChecklistItem`** ricos (con `type`: `text`/`photo`/`info`/`section`/`camera`/`date`, `required`, `hint`, `allowPhoto`, `fields[]`). **Con `partyId`** funciona como formulario por-involucrado (choque). **Sin `partyId`** es una guía/checklist (los ítems informativos NO persisten estado; sirven como pasos-guía). |
| `camera` | ✅ | `CameraStep` | Galería de fotos de escena. Guarda `string[]` (uris) en `responses[stepId]`. |
| `form` | ✅ | `FormStep` | Formulario de `fields[]` (text/phone/number/date). Guarda un objeto `{fieldId: value}` en `responses[stepId]`. |
| `involved_management` | ✅ | `InvolvedManagementStep` | Gestión de N "involucrados" (choque): tarjetas con estado, modal que abre un `ChecklistStep` con `partyId`. Muy específico de choque. |
| `summary` | ✅ | `SummaryStep` | Cierre: revisión + guardar + PDF + mail. |
| `construction` | ✅ (especial) | (inline en `FlowRenderer`) | Pantalla "Estamos trabajando en esto". Es lo que hoy muestran los 7 placeholders. |
| `emergency` | ❌ | **falta** | Pensado para "botón grande de llamada de emergencia". **Implementalo** (ver §6.4). |
| `action` | ❌ | **falta** | Acción directa (llamar, compartir ubicación, abrir link). **Implementalo si un módulo lo necesita.** |
| `location` | ❌ | **falta** | Captura/muestra ubicación. **Opcional** — requiere `expo-location` (no instalado). Evitalo salvo que sea imprescindible; si lo hacés, agregá la dependencia y los permisos. |
| `audio` | ❌ | **falta** | Grabación de audio. **Opcional** — requiere `expo-audio`/`expo-av`. Evitalo en esta primera iteración. |

> **Regla de oro:** priorizá reutilizar `question`, `checklist`, `camera`, `form`, `summary` (ya andan). Solo creá `emergency`/`action` cuando el escenario lo pida (emergencia médica, incendio, inseguro), porque un "botón para llamar al 911/107/100" es central en esos casos.

---

## 5. Modelo de datos y persistencia

### Stores (Zustand)
- **`useIncidentStore`** (`store/useIncidentStore.ts`) — incidente en curso. `currentIncident: { id, flowId, responses: Record<string,any>, involvedParties: InvolvedParty[], createdAt }`. Métodos: `startIncident`, `updateResponse`, `addInvolvedParty`, `updateInvolvedParty`, `removeInvolvedParty`, `completeIncident`. **No persiste** (es efímero hasta que `SummaryStep` lo guarda en SQLite).
- **`useSettingsStore`** (`store/useSettingsStore.ts`) — datos propios del usuario (`userName`, `userEmail`, `insuranceName`, `insuranceEmail`, `userPlate`, `userPolicy`). **Persiste** en AsyncStorage. ⚠️ Hoy **no hay UI que lo escriba** (ver §7.5); `SummaryStep` solo **lee** `insuranceEmail`.
- **`useConfigStore`** (`store/useConfigStore.ts`) — `country`/`province`/`language` (hoy hardcodeado Argentina/CABA/Español). Persiste. **Usalo** para condicionar contenido legal por provincia cuando corresponda (ej: números provinciales).

### SQLite (`services/databaseService.ts`)
- DB `kiago_v1.db`, tabla `incidents (id, data TEXT[json], createdAt INTEGER, flowId TEXT)`.
- `getAllIncidents()` corta en `LIMIT 10` y ordena por fecha desc. (Podés subir el límite si un módulo lo amerita.)

### Export (`services/exportService.ts`)
- `exportIncidentToPdf` y `exportIncidentToMail` arman un **HTML** con `formatIncidentBody()` y las fotos en base64, lo pasan a PDF con `expo-print`, y (mail) adjuntan además las fotos originales.
- ⚠️ `formatIncidentBody` está **muy orientado a "choque"** (habla de "DENUNCIA DE SINIESTRO", "Partes Involucradas", "Aseguradora"). Para los módulos nuevos, **generalizá el título/encabezado del reporte según `incident.flowId`** (ej: "Reporte de robo", "Constancia de emergencia médica"), o al menos que no diga "siniestro" para un módulo de mascota. Ver §7.6.

---

## 6. Receta: cómo implementar un flow nuevo (paso a paso)

### 6.1 Definir el flow como datos
En `data/flows/index.ts`, **reemplazá el placeholder** `createConstructionFlow("<id>", "<title>")` por un `Flow` real y exportalo/registralo en el array `flows`. Ejemplo de esqueleto:

```ts
export const roboTarjetasFlow: Flow = {
  id: "robo_tarjetas",
  title: "Me robaron tarjetas",
  icon: "credit-card",
  steps: [
    {
      id: "acciones_urgentes",
      type: "checklist",
      text: "Primeros pasos",
      subtitle: "Paso 1: Bloqueo inmediato",
      checklistItems: [
        "Llamar YA a la línea de tu banco para bloquear las tarjetas",
        "Desconocer los consumos que no reconozcas",
        // ... (verificados por investigación, ver §8)
      ],
      nextStep: "datos_tarjetas",
    },
    // ... más steps
    { id: "resumen", type: "summary", text: "Reporte final", subtitle: "Finalización" },
  ],
};
```
Y en el array final:
```ts
export const flows = [
  choqueFlow,
  roboCelularFlow,
  policiaFlow,
  roboTarjetasFlow,        // ← antes era createConstructionFlow("robo_tarjetas", ...)
  emergenciaFlow,
  // ...
];
```

**El `id` del flow DEBE coincidir** con el `id` en `SCENARIOS` (`app/(tabs)/index.tsx`). Ya coinciden; no los cambies.

### 6.2 Iconos
- El `Flow.icon` es informativo (string). Lo que se ve en la home es el icono de `SCENARIOS` (componente lucide). Ya está seteado por escenario; no hace falta tocarlo.

### 6.3 Steps que "andan solos"
`question`, `checklist` (informativo o con `fields`), `camera`, `form` y `summary` **ya persisten y se resumen** sin código nuevo. Un flow armado solo con estos tipos funciona de punta a punta.

### 6.4 Crear un StepType nuevo (`emergency` / `action`) cuando haga falta
Si un escenario necesita **llamar a un número** (emergencia médica, incendio, inseguro):
1. Creá `components/flow/steps/EmergencyStep.tsx` (mismo estilo que los otros steps: usa `Text`/`View` de `@/components/Themed`, `Colors`, `Haptics`).
2. Renderizá un **botón grande de llamada** que haga `Linking.openURL('tel:<numero>')` (import `* as Linking from "expo-linking"`), más una lista de acciones/consejos.
3. Poné el/los números en el `Step` (ej: reutilizá `options[]` con `action: "tel:107"` o extendé el tipo con un campo propio si lo necesitás — mantené el cambio de tipos mínimo y compatible).
4. Registralo en `FlowRenderer.renderStep()`:
   ```ts
   case "emergency":
     return <EmergencyStep step={step} onNext={onNext} />;
   ```
5. Si extendés `engine/types.ts` (nuevos campos en `Step`/`Option`), hacelo **opcional** para no romper los flows existentes.

### 6.5 Números de teléfono clickeables
Usá `tel:` con `expo-linking`. En Argentina, discado directo (sin prefijos). Verificá cada número por investigación (§8).

---

## 7. Bugs conocidos — CORREGIR ANTES DE LOS MÓDULOS

Estos afectan el motor compartido y el flow "choque". Arreglalos primero.

1. **`flowId` inconsistente (`"choque"` vs `"crash-report"`) — decisión de diseño, no typo.** Según `OLD-DOCS-ANTIGRAVITY_v2.md` (§2), el diseño **original** usaba `flowId: "crash-report"` con una convención semántica deliberada: **el involucrado índice `0` es la Parte Asegurada (Titular / "Yo")** y los siguientes son **Terceros**. Después la home se cambió a `startIncident("choque")` y **no se actualizó el resto**: `services/exportService.ts:168` y `app/(tabs)/history.tsx:66,172` siguen comparando contra `"crash-report"`. Efecto: nunca se activa "Parte Asegurada (Yo)", el color azul del titular, ni el título "Reporte de Choque" (el historial muestra "Incidente"). **Fix (decisión consciente):** unificá a **un solo id** en toda la app **y preservá la semántica índice-0 = titular** (es la parte útil). Recomendado: quedate con `"choque"` (es el que dispara la home y el que usan los módulos nuevos) y actualizá export/history para que la lógica "titular vs tercero" y el título legible se basen en ese id — idealmente vía un **mapa `flowId → título legible`** reutilizable por todos los flows (ver §7.6). No dejes dos ids conviviendo.

2. **`party.photos.license` no existe (residuo de la migración a licencia dual).** `OLD-DOCS-ANTIGRAVITY_v2.md` (§5.3) documenta que se rediseñó la licencia a **frente + dorso** (`licenseFront`/`licenseBack`, replicando la arquitectura del DNI). Quedaron referencias sueltas al viejo campo único `party.photos.license` en `components/flow/steps/InvolvedManagementStep.tsx:72,91,221`, que ya no existe en el tipo. Efecto: el chequeo de "licencia obligatoria cubierta" en `getPartyStatus` falla y el contador de fotos subcuenta. **Fix:** reemplazá por `(party.photos.licenseFront || party.photos.licenseBack)` y ajustá el conteo.

3. **Tipo `Incident` duplicado.** Hay uno muerto en `engine/types.ts` y el real en `store/useIncidentStore.ts`. **Fix:** eliminá o marcá como deprecado el de `engine/types.ts` para evitar confusión.

4. **`imageToBase64` — verificar en runtime (posible discrepancia con lo documentado).** `OLD-DOCS-ANTIGRAVITY_v2.md` (§5.1) afirma que se migró *a propósito* a la clase moderna `File` de `expo-file-system` para leer imágenes a Base64. Pero el código real (`services/exportService.ts:10`) hace una llamada **estática** `File.readAsStringAsync(uri, { encoding: "base64" })`, mientras que la API de instancia moderna sería `new File(uri).base64()`. Es decir, el estado del código puede no coincidir con la intención del doc. **Fix:** **verificá corriendo el export** que las fotos realmente se incrusten en el PDF (hay un `try/catch` que traga el error y devuelve `null` silenciosamente). Si fallan, migrá a `new File(uri).base64()` (API nueva) o a `expo-file-system/legacy`. Recordá que el mismo error de deprecación afecta a `collectAttachments`/lectura de adjuntos del mail.

5. **`useSettingsStore` sin UI de escritura.** La tab "Ajustes" (`app/(tabs)/two.tsx`) solo muestra país/provincia/idioma deshabilitados. **Fix (recomendado como parte del trabajo):** hacé funcional la pantalla de Ajustes para editar `userName`, `userPlate`, `userPolicy`, `insuranceEmail`, etc. Esto habilita auto-completar los datos propios del usuario en los flows (clave para "choque" y para pre-cargar el mail).

6. **`formatIncidentBody` hardcodeado a "siniestro".** Generalizá encabezado/copy del PDF/mail según `flowId` (ver §5).

7. **IDs con `Math.random().toString(36).substr(2,9)`** (`substr` deprecado). Menor; podés migrar a un helper de id más robusto si tocás esos archivos.

---

## 8. Módulos a implementar (los 7) + investigación legal argentina requerida

> Para **cada** módulo: (a) investigá en internet y **verificá vigencia 2026 y fuentes oficiales** (§9); (b) definí el flow como datos siguiendo §6; (c) cumplí el DoD.
> **Los números y leyes de abajo son SEMILLAS orientativas — NO los des por ciertos: confirmalos por búsqueda antes de codificar.** Las líneas pueden variar por provincia (usá `useConfigStore.province`).

**Números de referencia a verificar (semilla):** 911 (policía/emergencias), 107 (SAME / emergencias médicas — varía por provincia), 100 (bomberos), 103 (Defensa Civil), 144 (violencia de género, nacional), 137 (violencia familiar y sexual), 145 (trata de personas), 134 (denuncias narcotráfico/delitos), 147 (atención ciudadana municipal/CABA).

### 8.1 `robo_tarjetas` — "Me robaron tarjetas"
- **Objetivo:** guiar el bloqueo inmediato, el desconocimiento de consumos y la denuncia; dejar registro de las tarjetas afectadas.
- **Investigar (AR):** Ley **25.065 de Tarjetas de Crédito** (derecho a desconocer consumos, plazos); procedimiento de **bloqueo/denuncia ante el banco emisor** (líneas 24 h); denuncia policial; reporte a **BCRA** (Central de Deudores / reclamos) y a **Defensa del Consumidor**; qué pasa con débitos automáticos. Verificá plazos y derechos vigentes 2026.
- **Steps sugeridos:** `checklist` (acciones urgentes: bloquear, desconocer, cambiar claves de home banking) → `form`/`checklist` para listar tarjetas robadas (banco, últimos 4 dígitos, tipo) → `checklist` guía de denuncia → `summary`.
- **UX intencionada (de `OLD-DOCS-ANTIGRAVITY.md` §4A):** el flow de bloqueo debería usar **modales informativos por acción con links/botones útiles** (bloquear líneas de **bancos**, **emisoras de tarjeta** —Visa/Mastercard/Amex— y **billeteras virtuales** como MercadoPago), accesibles por un **botón de "info" auxiliar** a la derecha de cada ítem, sin interrumpir el flujo principal. Este mismo patrón conviene retro-aplicarlo a `robo_celular` (hoy es solo un checklist plano). Los teléfonos/links de cada entidad deben **verificarse por investigación** (§9) y contemplar variación por banco.
- **DoD:** el usuario sabe a quién llamar (con acceso directo a líneas/links verificados), qué desconocer y cómo denunciar; el reporte lista las tarjetas y acciones.

### 8.2 `emergencia` — "Emergencia médica"
- **Objetivo:** triaje rápido + llamada inmediata + primeros auxilios básicos mientras llega la ayuda.
- **Investigar (AR):** número correcto según provincia (**107 SAME** en muchas jurisdicciones, **911** deriva). Pautas de **primeros auxilios** de fuentes serias (Cruz Roja Argentina / Ministerio de Salud): RCP básico, posición lateral de seguridad, no mover a accidentados, atragantamiento (Heimlich), etc. **No des indicaciones médicas inventadas.**
- **Steps sugeridos:** `question` (¿la persona responde/respira?) → **`emergency`** (botón grande "Llamar al 107/911" con `tel:`) → `checklist` de primeros auxilios según respuesta → `summary` opcional.
- **Requiere:** implementar `EmergencyStep` (§6.4).
- **DoD:** llamada en 1 tap; guía de primeros auxilios citada de fuente oficial; disclaimer de que no reemplaza atención médica profesional.

### 8.3 `incendio` — "Incendio / Gas"
- **Objetivo:** evacuación segura y llamada a bomberos; protocolo específico para **escape de gas**.
- **Investigar (AR):** **Bomberos 100** / **911**; **Defensa Civil 103**; protocolo de **escape de gas** (no accionar interruptores ni encender fuego, cerrar la llave de paso, ventilar, salir, llamar a la **distribuidora**: Metrogas / Naturgy (ex Gas Natural) / Camuzzi / Ecogas según zona — verificá líneas de emergencia por región). Evacuación en edificios (no usar ascensor).
- **Steps sugeridos:** `question` (¿fuego o olor a gas?) → ramifica a `checklist` de protocolo correspondiente → **`emergency`** (llamar a bomberos / a la distribuidora) → `summary` opcional.
- **DoD:** dos ramas (fuego vs gas) con protocolo correcto y números verificados por zona.

### 8.4 `perdi_alguien` — "Perdí a alguien"
- **Objetivo:** denuncia inmediata y difusión efectiva de una persona desaparecida/extraviada.
- **Investigar (AR):** **desmentí el mito de esperar 48 h** (la denuncia se puede/debe hacer de inmediato). **911**; **Sistema Federal de Búsqueda de Personas Desaparecidas y Extraviadas (SIFEBU)**; **Alerta Sofía** (menores); líneas nacionales vigentes. Qué datos ayudan (última vez visto, ropa, foto reciente).
- **Steps sugeridos:** `checklist`/`form` para cargar datos de la persona (foto vía `camera`, descripción, última ubicación, hora) → `checklist` guía de denuncia y difusión → `summary` con todos los datos (útil para compartir/pegar en redes o dar a la policía).
- **DoD:** deja claro que la denuncia es inmediata; recopila datos accionables; reporte compartible.

### 8.5 `perdi_mascota` — "Perdí mi mascota"
- **Objetivo:** maximizar la chance de recuperar la mascota (difusión + búsqueda local). Poca carga legal.
- **Investigar (AR):** buenas prácticas (grupos de rescate/redes por zona, veterinarias, refugios, registros de mascotas/microchip si aplica en la jurisdicción). Verificá si hay registros oficiales municipales.
- **Steps sugeridos:** `form`/`checklist` con foto (`camera`), descripción, zona/hora de pérdida, datos de contacto → `checklist` de difusión (redes, veterinarias, plazas) → `summary` con "cartel" listo para compartir.
- **DoD:** genera un resumen tipo "cartel de búsqueda" con foto y contacto.

### 8.6 `problema_viaje` — "Problema viajando"
- **Objetivo:** orientar sobre **derechos del pasajero** ante demoras/cancelaciones/problemas en transporte.
- **Investigar (AR):** **Ley 24.240 de Defensa del Consumidor**; **derechos del pasajero aéreo** (normativa **ANAC** / resolución vigente: asistencia, reprogramación, reintegro por cancelación/demora); transporte terrestre **CNRT** (colectivos/trenes de larga distancia); cómo y dónde reclamar (Ventanilla Única / Defensa del Consumidor). Verificá la normativa aérea vigente 2026.
- **Steps sugeridos:** `question` (¿avión / colectivo / tren / auto propio?) → ramifica a `checklist` de derechos y pasos de reclamo por medio → `summary`/guía de reclamo.
- **DoD:** ramas por medio de transporte con derechos y canal de reclamo correctos y vigentes.

### 8.7 `inseguro` — "Me siento inseguro"
- **Objetivo:** herramientas preventivas rápidas y contactos de ayuda según la situación.
- **Investigar (AR):** **911**; **144** (violencia de género, nacional); **137** (violencia familiar/sexual); apps/botones antipánico provinciales; buenas prácticas de seguridad personal (compartir ubicación, ir a lugar poblado). Verificá líneas vigentes y su alcance provincial.
- **Steps sugeridos:** `question` (tipo de situación: seguimiento / violencia de género / robo inminente / otro) → **`action`/`emergency`** (llamar 911/144, compartir ubicación) → `checklist` preventivo → `summary` opcional.
- **DoD:** deriva a la línea correcta según el tipo de situación; acción de contacto en 1 tap.

---

## 9. Directivas de investigación en internet (obligatorias)

1. **Verificá TODO dato sensible por búsqueda web**: números de emergencia/ayuda, nombres y números de leyes, plazos legales, procedimientos oficiales, líneas de distribuidoras de gas, y **su vigencia a 2026**. Las líneas y normas cambian y varían por provincia.
2. **Priorizá fuentes oficiales argentinas**: `argentina.gob.ar` y sus organismos (Ministerio de Seguridad, Ministerio de Salud, ANAC, CNRT, BCRA, Defensa del Consumidor, SIFEBU), gobiernos provinciales/CABA, **InfoLEG / Boletín Oficial** para textos legales, Cruz Roja Argentina para primeros auxilios. Evitá blogs o fuentes no verificables para datos duros.
3. **Citá la fuente en el código** con un comentario junto al dato (ej: `// Fuente: argentina.gob.ar/... (verificado 2026)`), y registrá cada dato verificado en **`docs/FUENTES.md`** (ya existe, con una tabla por módulo y semillas en estado ⚠️): completá `Valor verificado`, `Fuente oficial (URL)`, `Fecha verif.` y pasá el Estado a ✅. **Una fila sin fuente = dato que NO puede ir al código.**
4. **Si no podés verificar un dato, NO lo inventes**: dejá `// TODO: verificar` y usá el placeholder más conservador (ej: derivar a 911).
5. **Contemplá variación provincial**: cuando un número/procedimiento dependa de la provincia, usá `useConfigStore.province` para condicionar, o mostrá la opción nacional (911) como fallback seguro.
6. **No des asesoramiento legal ni médico definitivo.** El contenido es **orientación general**. Ver §12.

---

## 10. Convenciones de código y UX (respetar)

- **Idioma:** todo el copy en **es-AR con voseo** ("Llamá", "Sacá la foto", "Asegurate"). Tono calmo y directo, alineado a "Relajá, no hay crisis".
- **Reutilizá** los componentes de step existentes y sus estilos; mirá `choque` (`data/flows/index.ts`) como **referencia de calidad y estructura** (uso de `section`, `hint`, `required`, `subtitle` tipo "Paso N: ...").
- **Tema:** nunca hardcodees colores de fondo/texto; usá `Colors[colorScheme]` (`theme.background`, `theme.text`, `theme.card`, `theme.border`, `theme.tint`, `theme.tabIconDefault`). Los acentos semánticos usados en la app: verde `#10B981` (ok), ámbar `#F59E0B` (advertencia), rojo `#EF4444` (peligro), acento de marca rosa/rojo `#E11D48`.
- **Haptics:** en cada acción importante (`Haptics.impactAsync(...)`), como ya hacen los steps.
- **Accesibilidad/tap targets grandes:** botones de emergencia bien visibles (el usuario está estresado). Los botones de "peligro" en rojo.
- **TypeScript strict:** tipá todo; si extendés `engine/types.ts`, campos nuevos **opcionales** y compatibles.
- **Formato:** corré `yarn lint:fix`. Prettier es obligatorio (rompe el lint).
- **No rompas los flows existentes** (`choque`, `robo_celular`, `policia`) ni el motor.
- **Convenciones heredadas** (de `OLD-DOCS-ANTIGRAVITY_v2.md`): usá el icono **`History`** de lucide (no `Clock`, que no existe en la versión actual); mantené el patrón **Singleton** de la DB (`getDb()`) —resolvió `NullPointerException`/concurrencia en Android— si tocás `databaseService.ts`; aplicá `trim()` a todos los inputs de texto antes de guardar (ya es el estándar en los steps).

---

## 11. Definition of Done global / Quality gate

Un módulo está terminado cuando:
- [ ] El flow arranca desde la home (id coincide con `SCENARIOS`) y **ya no muestra "en construcción"**.
- [ ] Recorre de principio a fin sin crashear y **termina en un `summary`** (o cierre equivalente).
- [ ] Todo dato legal/número **verificado por búsqueda web y citado** (comentario + `docs/FUENTES.md`).
- [ ] Copy en es-AR, tono calmo, tema claro/oscuro correcto, tap targets grandes.
- [ ] Si creó un StepType nuevo, está en el `switch` de `FlowRenderer` y tipado en `engine/types.ts` (campos opcionales).
- [ ] Botones de llamada funcionan (`tel:` con `expo-linking`).
- [ ] `yarn lint` pasa sin errores; TypeScript compila (strict).
- [ ] No rompió `choque`/`robo_celular`/`policia`.
- [ ] Disclaimer legal/médico presente donde corresponda (§12).

**Antes de todo lo anterior:** los **bugs de la §7** deben estar corregidos.

---

## 12. Restricciones legales y disclaimers (obligatorio)

- Kiago brinda **orientación general de emergencia**, **no** asesoramiento legal ni médico profesional. Incluí un disclaimer visible en los módulos sensibles (emergencia médica, incendio, legal): *"Esta guía es orientativa y no reemplaza la atención profesional / el asesoramiento legal. Ante una emergencia, llamá al 911."*
- **No prometas resultados legales** (ej: "vas a recuperar tu dinero"). Usá lenguaje de derechos y pasos ("podés reclamar", "tenés derecho a").
- **No inventes** artículos de ley, números de resolución ni teléfonos.

---

## 13. Orden de ejecución sugerido

1. **Bugs §7** (empezá por #1 `flowId` y #2 `photos.license`; luego #5 pantalla de Ajustes funcional).
2. **Generalizar `formatIncidentBody`** (§7.6) para que el reporte sirva a cualquier flow.
3. **Módulos por impacto/seguridad:**
   1. `emergencia` (médica) — implementa `EmergencyStep`, base para el resto.
   2. `incendio` (reutiliza `EmergencyStep`).
   3. `inseguro` (reutiliza `EmergencyStep`/`action`).
   4. `robo_tarjetas`.
   5. `perdi_alguien`.
   6. `problema_viaje`.
   7. `perdi_mascota` (menor carga legal, cierre).
4. **Cierre:** `yarn lint:fix`, verificación de cada DoD, y `docs/FUENTES.md` completo.

---

## 14. Índice rápido de archivos (mapa)

- `app/(tabs)/index.tsx` — Home, array `SCENARIOS` (id/título/icono/color).
- `app/(tabs)/history.tsx` — Historial (lee SQLite).
- `app/(tabs)/two.tsx` — Ajustes (hoy solo lectura; hacela editable — §7.5).
- `app/flow/[id].tsx` — Máquina de estados del flow.
- `data/flows/index.ts` — **Definición de todos los flows** (acá reemplazás los placeholders).
- `engine/types.ts` — Tipos del motor (`StepType`, `Step`, `ChecklistItem`, `Flow`, ...).
- `components/flow/FlowRenderer.tsx` — Dispatcher de steps (agregá `case` para tipos nuevos).
- `components/flow/steps/*` — Componentes de step (creá `EmergencyStep.tsx` acá).
- `components/flow/CameraView.tsx` — Cámara reutilizable.
- `store/useIncidentStore.ts` / `useSettingsStore.ts` / `useConfigStore.ts` — Estado.
- `services/databaseService.ts` — SQLite. `services/exportService.ts` — PDF/mail.
- `constants/Colors.ts` — Tema.
- `OLD-DOCS-ANTIGRAVITY_v2.md` — **Registro histórico (Antigravity)** del módulo "choque": decisiones técnicas y arquitectura. Referencia del motor, no de los módulos nuevos. Ante conflicto con el código, gana el código.
- `OLD-DOCS-ANTIGRAVITY.md` (v1) — Registro histórico más viejo y de alto nivel. **Stack desactualizado (ignorar versiones).** Útil por patrones de UX (modales con links, visor full-screen). Precedencia: código > v2 > v1.
- `README.md` — **Desactualizado** (scaffold genérico). No es fuente de verdad.

---

*Fin del brief. Implementá con criterio, verificá cada dato legal/número contra fuentes oficiales argentinas vigentes a 2026, y mantené el tono que calma al usuario. Ante la duda de un dato sensible: derivá al 911 y marcá `// TODO: verificar`.*
