# ESTADO — Registro de avance de Kiago

> **Para retomar el trabajo (FABLE o cualquier agente/dev):**
> 1. Leé `FABLE_BRIEF.md` (raíz) — el brief maestro con arquitectura, receta y reglas.
> 2. Leé este archivo — qué se hizo, qué falta y por dónde seguir.
> 3. Consultá `docs/FUENTES.md` — qué datos legales ya están verificados (✅) y cuáles no (⚠️/🔄).
> 4. Continuá por la sección "Próximo paso" de abajo.
>
> **Última actualización:** 2026-07-03 · TypeScript (strict) ✅ compila · `yarn lint` ✅ sin errores ni warnings.

---

## 1. Estado de los módulos (flows)

| id | Título (home) | Estado | Detalle |
|---|---|---|---|
| `choque` | Choqué | ✅ Completo | Preexistente. Bugs corregidos en esta etapa (ver §2). Referencia de calidad. |
| `robo_celular` | Me robaron el celular | 🟡 Básico | Checklist plano preexistente. **Mejora pendiente:** modales con links de bloqueo (patrón §8.1 del brief) y verificación de fuentes (IMEI/Enacom no verificado). |
| `policia` | Me frenó la policía | 🟡 Básico | Checklist preexistente. **Pendiente:** verificar documentación obligatoria contra Ley 24.449 (FUENTES §9). |
| `emergencia` | Emergencia médica | ✅ **Implementado (2026-07-03)** | Ver §3. Fuentes verificadas y citadas. **Falta prueba en dispositivo.** |
| `incendio` | Incendio / Gas | ✅ **Implementado (2026-07-03)** | Dos ramas (fuego/gas). Fuentes: SINAGIR (protocolo incendio), ENARGAS (gas — llamar a la distribuidora al nº de la factura), 100/911 verificados. Reutilizó `EmergencyStep` sin código nuevo. **Falta prueba en dispositivo.** |
| `inseguro` | Me siento inseguro | ✅ **Implementado (2026-07-03)** | 4 ramas (peligro ahora / violencia de género / violencia familiar-sexual / prevención). 144 y 137 verificados con WhatsApp oficiales; deja claro que 144/137 no son líneas de emergencia (peligro inmediato → 911). Botón antipánico omitido (decisión conservadora, FUENTES §7). **Falta prueba en dispositivo.** |
| `robo_tarjetas` | Me robaron tarjetas | ✅ **Implementado (2026-07-03)** | Bloqueo urgente → registro (form) → derechos Ley 25.065 y reclamo escalonado (banco → BCRA/Defensa del Consumidor, UFECI). Sin números hardcodeados: deriva al dorso de la tarjeta/app (fundado en la ley: línea 24 h obligatoria). Motor mejorado: Summary y PDF ahora muestran respuestas de FormStep. **Falta prueba en dispositivo.** |
| `perdi_alguien` | Perdí a alguien | ✅ **Implementado (2026-07-03)** | Denuncia inmediata (mito 24/48 h desmentido con fuente oficial) → 911/142 → form con datos de búsqueda → guía SIFEBU/Alerta Sofía/difusión. Sin step de cámara (CameraStep bloquea sin foto; ver deuda menor). **Falta prueba en dispositivo.** |
| `problema_viaje` | Problema viajando | ✅ **Implementado (2026-07-03)** | 3 ramas (avión / micro-tren / otro servicio) con derechos verificados: Res. 1532/98 + Res. ANAC 774/2025 (aéreo), CNRT (terrestre), Ley 24.240 (consumo) + form de registro del reclamo. **Falta prueba en dispositivo.** |
| `perdi_mascota` | Perdí mi mascota | ✅ **Implementado (2026-07-03)** | Form (cartel de búsqueda) + plan de búsqueda/difusión. Animales BA (CABA, oficial) citado. **Falta prueba en dispositivo.** |

**🎉 Los 10 escenarios de la home tienen flow real: no queda ningún placeholder "en construcción".** (`createConstructionFlow` fue eliminado de `data/flows/index.ts`; el StepType `construction` sigue disponible en el motor por si se agregan escenarios futuros.)

---

## 2. Bugs del brief §7 — estado

| # | Bug | Estado | Qué se hizo |
|---|---|---|---|
| 1 | `flowId` inconsistente (`choque` vs `crash-report`) | ✅ Corregido | Unificado a `"choque"`. Nuevo helper `getFlowTitle(flowId)` en `data/flows/index.ts`. Historial muestra título real; "Parte Asegurada (Yo)" (índice 0) funciona en historial y PDF. |
| 2 | `party.photos.license` inexistente | ✅ Corregido | Reemplazado por `licenseFront \|\| licenseBack` en `InvolvedManagementStep.tsx` (3 lugares). Contador de fotos ahora cuenta cada cara real (DNI×2, licencia×2, patente, daños). |
| 3 | Tipo `Incident` duplicado | ✅ Corregido | Eliminados `Incident`/`IncidentResponse` muertos de `engine/types.ts` (nadie los importaba). |
| 4 | `imageToBase64` roto | ✅ Corregido (código) | `tsc` confirmó que `File.readAsStringAsync` no existía → las fotos **nunca** se incrustaban en el PDF. Migrado a `new File(uri).base64()` (API moderna SDK 54). ⚠️ **Falta verificar en runtime** que el PDF salga con fotos. |
| 5 | Ajustes sin UI de escritura | ✅ Corregido | `app/(tabs)/two.tsx` reescrita: edita `userName`, `userEmail`, `userPlate`, `insuranceName`, `userPolicy`, `insuranceEmail` (persisten en AsyncStorage vía `useSettingsStore`). El email de aseguradora pre-carga el envío en `SummaryStep`. |
| 6 | PDF hardcodeado a "siniestro" | ✅ Corregido | `getReportTitle(flowId)` en `exportService.ts`: "DENUNCIA DE SINIESTRO" solo para `choque`; `REPORTE — <TÍTULO>` para el resto. Asunto y cuerpo del mail generalizados; "Partes Involucradas" solo se renderiza si hay involucrados. |
| 7 | IDs con `substr` deprecado | ⚠️ Pendiente (menor) | Migrar a helper de id robusto cuando se toquen `useIncidentStore.ts` / `databaseService.ts`. |

---

## 3. Módulo `emergencia` — qué se implementó (2026-07-03)

**Infraestructura nueva (reutilizable por los módulos que faltan):**
- **`components/flow/steps/EmergencyStep.tsx`** — step de emergencia genérico: botones grandes rojos de llamada (options con `action: "tel:<numero>"` → discador nativo vía `expo-linking`), lista de indicaciones (`checklistItems` strings), botones de navegación. Registra la llamada en `responses[stepId]` para el reporte. Registrado en el `switch` de `FlowRenderer` (`case "emergency"`). **No requirió cambios de tipos** (reutiliza `Option.action`/`style`).
- **`QuestionStep`** — el mock `CALL_107` (alert) fue reemplazado por manejo real de `action: "tel:..."` con `expo-linking`.
- **`getFlowTitle(flowId)`** (`data/flows/index.ts`) y **`getReportTitle(flowId)`** (`services/exportService.ts`) — títulos legibles para historial y PDF/mail de cualquier flow.

**El flow (`emergenciaFlow` en `data/flows/index.ts`):**
1. `llamada` (emergency) — botones 107 (SAME) y 911 + guía de qué decir al operador.
2. `triaje` (question) — ¿cómo está la persona? → 5 ramas.
3. `rcp` / `inconsciente` / `atragantamiento` / `convulsiones` / `consciente` (checklists) — primeros auxilios verificados, cada uno con el disclaimer médico (`DISCLAIMER_MEDICO`, brief §12).
4. `resumen` (summary) — guarda en SQLite y exporta.

**Fuentes:** todas oficiales (`argentina.gob.ar`), citadas como comentarios en el código y registradas en `docs/FUENTES.md` §1–2 con estado ✅.

---

## 4. Verificaciones hechas y pendientes

**Hecho:**
- `npx tsc --noEmit` ✅ (strict, sin errores).
- `yarn lint` ✅ (0 errores, 0 warnings; incluye Prettier).
- Fuentes de `emergencia` verificadas por búsqueda web contra `argentina.gob.ar` (2026-07-03).

**Pendiente (runtime — requiere dispositivo/simulador):**
- [ ] Recorrer `emergencia` de punta a punta (las 5 ramas del triaje) y confirmar que los botones `tel:` abren el discador.
- [ ] Recorrer `incendio` de punta a punta (rama fuego y rama gas).
- [ ] Recorrer `inseguro` de punta a punta (las 4 ramas).
- [ ] Recorrer `robo_tarjetas` y verificar que los datos del form aparecen en el resumen y en el PDF (valida la mejora del motor).
- [ ] Recorrer `perdi_alguien` (form + guía de búsqueda).
- [ ] Recorrer `problema_viaje` (3 ramas) y `perdi_mascota`.
- [ ] Exportar un PDF de `choque` **con fotos** y confirmar que se incrustan (valida el fix del bug #4).
- [ ] Confirmar que el historial muestra los títulos nuevos y "Parte Asegurada (Yo)".
- [ ] Probar la pantalla de Ajustes (persistencia + pre-carga del email en `SummaryStep`).

---

## 5. Próximo paso

**Los 10 módulos están implementados.** Lo que sigue, en orden de prioridad:
1. **Commit del checkpoint** (hay muchos archivos sin commitear).
2. **Pruebas de runtime en dispositivo/simulador** — la checklist de la §4 completa. Es el único paso que falta del quality gate (brief §11).
3. **Deuda menor** (§ abajo): retro-mejora de `robo_celular`/`policia` con fuentes, bug #7 (ids), visor full-screen, cámara salteable/galería.

---

## 6. Historial de sesiones

- **2026-07-03 (sesión 1):** Bugs §7 (#1–#6) corregidos · Ajustes editable · `EmergencyStep` creado · **los 7 módulos faltantes implementados con fuentes verificadas** (`emergencia`, `incendio`, `inseguro`, `robo_tarjetas`, `perdi_alguien`, `problema_viaje`, `perdi_mascota`) · mejora del motor: Summary/PDF renderizan respuestas de FormStep (objetos) y conteo de fotos (arrays) · docs de continuidad (ESTADO/FUENTES) creados · `createConstructionFlow` eliminado (ya no hay placeholders).
- **2026-07-06 (sesión 2, UX):** Autofocus en modales con campo de texto (ref + `onShow`; ChecklistStep y modal de envío del Summary) · ítems `info` de guías ahora togglean el tilde ✓ (antes abrían un modal de texto que no guardaba nada) · `vigencia_seguro` acepta fecha **o foto** (nuevo `photos.insurance`; casos de `getPartyStatus` para vigencia y titular que faltaban) · input DNI con color de tema (estaba negro en dark) · teléfono de contacto con teclado numérico y sanitizado · **dark mode fijo en toda la app** (`useColorScheme` forzado a "dark" + `userInterfaceStyle: "dark"` en app.json).
- **2026-07-06 (sesión 2, PDF completo):** El PDF ahora incluye TODO: sección **"Parte Asegurada (Titular)"** con los datos propios desde Ajustes (`useSettingsStore.getState()` — si están vacíos, indica completarlos); los involucrados del flow se etiquetan correctamente como **Terceros** (se corrigió la semántica heredada "índice 0 = titular", que era falsa: el titular nunca se carga en el flow); filas nuevas **Titular del vehículo** y **Vigencia del seguro**; bloque ámbar de **datos no obtenidos + motivo declarado**; foto del **seguro** incrustada; **fotos de la escena incrustadas** en el PDF (antes solo conteo); adjuntos del mail completos (escena + seguro). Mismo fix de etiqueta en el historial.
- **2026-07-06 (sesión 2, flows-guía sin reporte):** Regla de producto aplicada a TODOS los flows: **no todo problema genera un reporte** y **los checks son solo para pasos obligatorios a hacer/revisar en el momento** (lo informativo es `note`). Nuevo `Step.finish` + sentinel `nextStep: "fin"` en la máquina de estados (`app/flow/[id].tsx`): el botón dice "Finalizar" y vuelve al inicio sin guardar reporte. **Flows-guía (sin reporte):** `policia`, `robo_celular`, `emergencia` (5 ramas), `incendio` (2 ramas), `inseguro` (4 ramas) — se eliminaron sus steps `summary`. **Flows con reporte:** `choque` (aseguradora), `robo_tarjetas`, `perdi_alguien`, `perdi_mascota`, `problema_viaje` (registro/cartel con valor). Disclaimers de todos los flows → `note`; Alerta Sofía y denuncias anónimas (perdi_alguien) → `note`. `SummaryStep`: el modal de envío solo habla de "aseguradora" en `choque`; en el resto el label es "Correo de destino (opcional)" y no se pre-carga el email del seguro.
- **2026-07-06 (sesión 2, derechos como notas + PDF de guías):** Nuevo tipo de ítem **`note`** en el motor (texto enunciativo con borde de acento, sin check ni tap — para derechos/marcos legales que no son acciones del usuario) y nuevo flag **`Step.sharePdf`** que muestra el botón "Descargar / Compartir PDF" (genera un PDF de la guía con `exportGuideToPdf` y abre el share sheet). Aplicado a: `robo_tarjetas` (derechos Ley 25.065 + BCRA/UFECI) y las 3 pantallas de derechos de `problema_viaje` (avión/terrestre/otro). Las acciones reales (denuncia policial, reclamar, guardar comprobantes) siguen como checks.
- **2026-07-06 (sesión 2, reporte final):** Fix de los parches oscuros dentro de las cards del Summary (los `View` de Themed pintan `theme.background` por defecto → `backgroundColor: "transparent"` en filas internas) · card oscura más clara (`dark.card` #273449, `dark.border` #3B4A63) · **miniaturas de fotos de evidencia** en el resumen (fotos de escena + fotos por involucrado: DNI, licencia, patente, seguro, daños) · flujo de envío: loader "Preparando informe..." en el botón (el PDF+base64 tarda ~5 s), al completarse el envío cierra el modal, vuelve al inicio y muestra "¡Informe enviado!" (si el usuario cancela el correo, se queda en el modal); "Descargar PDF" no cierra el modal; `exportIncidentToMail` ahora devuelve el status del composer.

**Deuda menor acumulada (no bloqueante):**
- Bug #7 (ids con `substr`).
- Retro-mejorar `robo_celular` y `policia` con fuentes verificadas y patrón de modales.
- Visor de imágenes full-screen con long-press (patrón intencionado de OLD-DOCS v1, no implementado).
- `CameraStep` no permite saltearse ni elegir de galería (bloquea sin foto) — por eso `perdi_alguien` no tiene step de foto; agregar "omitir" o picker de galería (`expo-image-picker` ya disponible) y sumar la foto al flow y al PDF.
- `getAllIncidents()` con `LIMIT 10` (subir si hace falta).
