# FUENTES — Registro de verificación legal y de datos (Argentina)

> **Para FABLE:** este archivo es el **registro de trazabilidad** de todo dato sensible que uses en la app
> (números de emergencia/ayuda, leyes, plazos, procedimientos, líneas de entidades). Completá una fila por
> cada dato **antes de codificarlo** y dejá el mismo link como comentario en el código.
>
> **Reglas (ver `FABLE_BRIEF.md` §9):**
> - Priorizá fuentes **oficiales argentinas** (`argentina.gob.ar` y organismos, gobiernos provinciales/CABA,
>   **InfoLEG**/Boletín Oficial para leyes, Cruz Roja Argentina para primeros auxilios).
> - **Verificá vigencia a 2026.** Si no podés verificar → `Estado: ⚠️ NO VERIFICADO`, usá el fallback conservador
>   (derivar a **911**) y dejá `// TODO: verificar` en el código.
> - **No inventes** números ni artículos de ley.
> - Contemplá **variación por provincia** (usá `useConfigStore.province`); si un dato varía, agregá filas por jurisdicción.
>
> **Leyenda de Estado:** ✅ Verificado · ⚠️ No verificado / pendiente · 🔄 Verificar de nuevo (posible cambio) · ❌ Dato erróneo descartado

---

## 0. Convención de la tabla

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| *(qué dato es)* | *(el valor que va al código)* | *(link oficial)* | AAAA-MM-DD | ✅/⚠️/🔄/❌ | *(alcance, provincia, salvedades)* |

---

## 1. Números de emergencia / ayuda (transversal)

> Semillas orientativas — **verificar todas**. Varias varían por provincia.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Policía / emergencias generales | 911 | https://www.argentina.gob.ar/seguridad/911emergencias | 2026-07-03 | ✅ | Nacional (fallback seguro). Usado en `emergencia`. |
| Emergencias médicas (SAME) | 107 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | CABA y varias jurisdicciones (BsAs, Córdoba, T. del Fuego, Jujuy); donde no existe, deriva 911. Usado en `emergencia`. |
| Bomberos | 100 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Confirmado leyendo la página oficial. Usado en `incendio`. |
| Defensa Civil | 103 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Confirmado leyendo la página oficial. |
| Violencia de género (nacional) | 144 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Confirmado leyendo la página oficial ("Atención a Víctimas de Violencia de Género"). Para `inseguro`. |
| Chicos y chicas extraviados | 142 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Confirmado leyendo la página oficial. Para `perdi_alguien`. |
| Prevención del suicidio | 135 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Confirmado leyendo la página oficial. |
| Violencia familiar y sexual | 137 | | | ⚠️ | |
| Trata de personas | 145 | | | ⚠️ | |
| Denuncias (narcotráfico/delitos) | 134 | | | ⚠️ | |
| Atención ciudadana (municipal/CABA) | 147 | | | ⚠️ | |

---

## 2. `emergencia` — Emergencia médica

**Marco / temas a verificar:** número correcto por provincia (SAME/911); primeros auxilios (RCP, posición lateral de seguridad, atragantamiento/Heimlich, no mover accidentados) desde **Cruz Roja Argentina** / **Ministerio de Salud**.

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `emergencia` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Nº emergencia médica | 107 (SAME) + fallback 911 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | 107 en CABA y varias jurisdicciones; el flow ofrece ambos botones e indica usar 911 si 107 no funciona en la zona. |
| Pauta RCP básico (adultos) | 30 compresiones, centro del pecho (mitad inf. esternón), hundir 5–6 cm, ritmo 100–120/min, no parar | https://www.argentina.gob.ar/salud/primerosauxilios/rcp/adultos | 2026-07-03 | ✅ | Step `rcp` del flow. |
| Maniobra de atragantamiento | Obstrucción parcial: dejar toser, no golpear espalda ni dar agua. Total: Heimlich — puño 4 dedos sobre ombligo, presión adentro/arriba, hasta 5 veces, repetir | https://www.argentina.gob.ar/salud/primerosauxilios/situaciones/atragantamiento | 2026-07-03 | ✅ | Step `atragantamiento`. |
| Convulsiones | Algo blando bajo la cabeza, alejar objetos, aflojar ropa, NO inmovilizar ni poner nada en la boca, tomar el tiempo, posición de seguridad al terminar | https://www.argentina.gob.ar/salud/primerosauxilios/situaciones/convulsiones | 2026-07-03 | ✅ | Step `convulsiones`. |
| Hemorragias (presión directa) | Presión firme con tela/apósito limpio sobre la herida | https://www.argentina.gob.ar/sites/default/files/manual_1ros_auxilios_web.pdf | 2026-07-03 | ✅ | Manual de Primeros Auxilios (Min. Salud). Step `consciente`. |
| Posición de seguridad (inconsciente que respira) | De costado; no mover si hubo golpe/caída (posible lesión de columna) | https://www.argentina.gob.ar/sites/default/files/manual_1ros_auxilios_web.pdf | 2026-07-03 | ✅ | Step `inconsciente`. |
| Disclaimer médico incluido | Sí — en los 5 checklists de primeros auxilios | — | 2026-07-03 | ✅ | Constante `DISCLAIMER_MEDICO` en `data/flows/index.ts` (FABLE_BRIEF §12). |

---

## 3. `incendio` — Incendio / Gas

**Marco / temas a verificar:** Bomberos 100 / 911; Defensa Civil 103; protocolo de escape de gas; **líneas de emergencia de distribuidoras por zona** (Metrogas, Naturgy, Camuzzi, Ecogas, etc.).

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `incendio` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Nº Bomberos | 100 (+ fallback 911) | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Steps `llamada_bomberos` y `llamada_gas`. |
| Protocolo de incendio estructural | Matafuego solo si es chico y sabés usarlo; salir por la vía más cercana; priorizar chicos/mayores/discapacidad; escaleras (nunca ascensor/ventanas); con humo gatear y trapo húmedo en nariz/boca; si no podés salir, encerrarte, sellar puerta y hacerte ver; no reingresar sin autorización de bomberos | https://www.argentina.gob.ar/sinagir/incendios-estructurales/que-hacer | 2026-07-03 | ✅ | SINAGIR. Step `protocolo_fuego`. |
| Protocolo escape de gas | NO accionar luces/electrodomésticos, NO celular adentro ni fuentes de chispa; cerrar llave de paso; ventilar; salir | https://www.enargas.gob.ar/secciones/tramites/perdida-de-gas.php | 2026-07-03 | ✅ | ENARGAS. Step `protocolo_gas`. |
| Distribuidora gas — línea emergencia | **El número de emergencias que figura en la factura de gas** (24 h), llamando desde afuera | https://www.enargas.gob.ar/secciones/tramites/perdida-de-gas.php | 2026-07-03 | ✅ | Vía oficial ENARGAS. Se eligió NO hardcodear números por distribuidora (9 distribuidoras, varían por zona): la factura es la fuente correcta y universal. |
| ENARGAS (ente regulador) — atención | 0800-333-4444 (lun–vie 10–16 h) | https://www.enargas.gob.ar/secciones/contacto/consultas.php | 2026-07-03 | ✅ | Informativo en step `llamada_gas` (no es línea de emergencia). |

---

## 4. `robo_tarjetas` — Me robaron tarjetas

**Marco / temas a verificar:** **Ley 25.065 (Tarjetas de Crédito)** — derecho a desconocer consumos y plazos; procedimiento de bloqueo/denuncia ante el banco emisor; denuncia policial; reporte a **BCRA** y **Defensa del Consumidor**; débitos automáticos.

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `robo_tarjetas` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Ley 25.065 — desconocimiento de consumos | Derecho a impugnar el resumen detallando el error; pagar el mínimo NO implica aceptación; no pueden impedir el uso durante la impugnación | https://www.argentina.gob.ar/normativa/nacional/ley-25065-55556/actualizacion | 2026-07-03 | ✅ | Texto actualizado oficial. Step `denuncia`. |
| Plazo para desconocer consumos | 30 días desde recibido el resumen; emisor acusa recibo en 7 días y resuelve en 15 (60 si es del exterior) | https://www.argentina.gob.ar/normativa/nacional/ley-25065-55556/actualizacion | 2026-07-03 | ✅ | Step `denuncia`. |
| Líneas de bloqueo bancos (por entidad) | **No se hardcodean.** La Ley 25.065 obliga al emisor a tener sistema telefónico de denuncias 24 h que entrega nº de denuncia → el flow deriva al **dorso de la tarjeta / app del banco** | https://www.argentina.gob.ar/tengo-tarjeta-de-credito | 2026-07-03 | ✅ | Mismo criterio conservador que la factura de gas en `incendio`: el número correcto siempre viaja con el producto. |
| Emisoras (Visa/Mastercard/Amex) — bloqueo | — (cubierto por el banco emisor) | — | 2026-07-03 | ❌ | Omitido: en Argentina el bloqueo se gestiona con el emisor (banco); números de marcas varían y no se verificaron. |
| Billeteras virtuales (MercadoPago, etc.) | Bloqueo desde la app de cada billetera (sección Seguridad) | — | 2026-07-03 | ✅ | Indicación general sin número hardcodeado (bajo riesgo). Step `bloqueo`. |
| Canal reclamo BCRA / Defensa del Consumidor | 1º reclamo al banco (respuesta máx. 10 días hábiles); si no responde → BCRA o Defensa del Consumidor | https://www.argentina.gob.ar/economia/inclusion-financiera/como-y-donde-realizar-un-reclamo · https://www.bcra.gob.ar/BCRAyVos/Reclamos.asp | 2026-07-03 | ✅ | Step `denuncia`. |
| Ciberestafas — UFECI | denunciasufeci@mpf.gob.ar / mpf.gob.ar/ufeci | https://www.argentina.gob.ar/economia/inclusion-financiera/como-y-donde-realizar-un-reclamo | 2026-07-03 | ✅ | Step `denuncia`. |

---

## 5. `perdi_alguien` — Perdí a alguien

**Marco / temas a verificar:** **la denuncia es inmediata (desmentir mito de 48 h)**; 911; **SIFEBU** (Sistema Federal de Búsqueda de Personas Desaparecidas y Extraviadas); **Alerta Sofía** (menores); líneas nacionales vigentes.

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `perdi_alguien` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Denuncia inmediata (sin esperar 48 h) | NO hay que esperar 24/48 h; se denuncia de inmediato en cualquier comisaría, fiscalía o juzgado; están **obligados** a tomarla en el momento; puede denunciar cualquier persona (sin parentesco). Si se niegan → **134** gratuito | https://www.argentina.gob.ar/seguridad/personasextraviadas/denuncia | 2026-07-03 | ✅ | Step `denuncia_ya`. |
| SIFEBU — canal/contacto | Sistema Federal de Búsqueda de Personas Desaparecidas y Extraviadas (Min. Seguridad); se activa con la denuncia | https://www.argentina.gob.ar/seguridad/personasextraviadas | 2026-07-03 | ✅ | Step `guia_busqueda`. |
| Alerta Sofía (menores) | Difusión masiva inmediata para menores en "Alto Riesgo Inminente"; **la activa la autoridad judicial** (no el ciudadano); denuncias anónimas al 134 o denuncias@minseg.gob.ar | https://www.argentina.gob.ar/seguridad/alertasofia | 2026-07-03 | ✅ | El flow lo explica sin prometer activación (depende de la Justicia). |
| Nº menores extraviados (142) | 142 | https://www.argentina.gob.ar/tema/emergencias | 2026-07-03 | ✅ | Botón de llamada en `denuncia_ya`. Ya verificado en §1. |
| Datos útiles para la búsqueda | Nombre, edad, descripción física, ropa, última vez vista (lugar/hora), datos de salud, foto reciente | https://www.argentina.gob.ar/seguridad/personasextraviadas/denuncia | 2026-07-03 | ✅ | Capturados en el `form` `datos_persona`. |

---

## 6. `problema_viaje` — Problema viajando

**Marco / temas a verificar:** **Ley 24.240 (Defensa del Consumidor)**; **derechos del pasajero aéreo** (normativa **ANAC** / resolución vigente); transporte terrestre **CNRT**; canales de reclamo (Ventanilla Única / Defensa del Consumidor).

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `problema_viaje` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Ley 24.240 — derechos base | Protege cualquier servicio contratado; prohíbe deslindarse de cancelaciones arbitrarias (reembolso) | https://www.argentina.gob.ar/tema/consumidores | 2026-07-03 | ✅ | Steps `terrestre` y `otro_servicio`. |
| Derechos del pasajero aéreo | Res. 1532/98: demora >4 h → comida/refrigerios; >8 h → + alojamiento y traslados; cancelación → reubicación/endoso/reencaminamiento o reintegro total; excepciones clima/fuerza mayor. Res. ANAC 774/2025: canal gratuito de reclamos, comprobante único, 30 días hábiles de respuesta | https://servicios.infoleg.gob.ar/infolegInternet/anexos/50000-54999/54791/texact.htm · https://www.argentina.gob.ar/anac/pasajeros/guia-para-pasajeros-de-avion-y-derechos-del-pasajero | 2026-07-03 | ✅ | Step `avion`. |
| Transporte terrestre (CNRT) | Micro larga distancia: 15 kg de equipaje gratis con ticket; cancelación → devolución del pasaje; deben respetar recorridos/frecuencias/tarifas | https://www.argentina.gob.ar/transporte/cnrt/derechos-de-los-usuarios | 2026-07-03 | ✅ | Step `terrestre`. |
| Canal de reclamo transporte | Denuncias CNRT online: denuncias.cnrt.gob.ar; el 0800 de la CNRT figura en el pasaje (no se hardcodeó el número) | https://www.argentina.gob.ar/denunciar-servicios-de-transporte | 2026-07-03 | ✅ | Mismo criterio conservador (el dato viaja con el producto). |

---

## 7. `inseguro` — Me siento inseguro

**Marco / temas a verificar:** 911; **144** (violencia de género); **137** (violencia familiar/sexual); botones antipánico provinciales; buenas prácticas de seguridad personal.

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `inseguro` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Nº violencia de género (144) | 144 — gratuita, 24 hs/365, contención y asesoramiento (Ley 26.485). **NO es línea de emergencia** (peligro inmediato → 911). WhatsApp +54 9 11 2771-6463 | https://www.argentina.gob.ar/linea-144 | 2026-07-03 | ✅ | Nacional. Step `violencia_genero`. |
| Nº violencia familiar/sexual (137) | 137 — gratuita, nacional, 24 hs/365. Violencia familiar y/o sexual y grooming. Equipo de psicólogas/trabajadoras sociales (Programa Las Víctimas Contra Las Violencias). WhatsApp +54 9 11 3133-1000 | https://www.argentina.gob.ar/justicia/violencia-familiar-sexual | 2026-07-03 | ✅ | Step `violencia_familiar`. |
| Botón antipánico | — (omitido del flow) | — | 2026-07-03 | ❌ | Varía por provincia, sin fuente única verificable. Decisión conservadora: el flow deriva al 911. Re-evaluar si se agrega selección de provincia real. |
| Buenas prácticas seguridad personal | Consejos generales de prudencia (lugar con gente/iluminado, compartir ubicación, no ir directo a casa si te siguen, no enfrentar, 911 a mano) | — | 2026-07-03 | ✅ | Sin "dato duro": son recomendaciones de sentido común de bajo riesgo; el núcleo verificado es el 911 (§1). Steps `peligro_ahora` y `prevencion`. |

---

## 8. `perdi_mascota` — Perdí mi mascota (baja carga legal)

**Marco / temas a verificar:** registros municipales de mascotas/microchip (si aplica); buenas prácticas de difusión (redes, veterinarias, refugios).

> **Módulo IMPLEMENTADO (2026-07-03)** — flow `perdi_mascota` en `data/flows/index.ts`. Pendiente: prueba de recorrido en dispositivo real.

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Registro municipal de mascotas | Animales BA — plataforma oficial de CABA para reportar mascotas perdidas/encontradas | https://buenosaires.gob.ar/inicio/animales-ba | 2026-07-03 | ✅ | Solo CABA (el flow lo aclara). No existe registro nacional oficial; registros de microchip son privados → indicación genérica "avisá al registro/veterinaria que lo colocó". |
| Canales de difusión recomendados | Buenas prácticas generales (recorrer la zona, olor/agua en la puerta, vecinos, redes barriales, veterinarias/refugios, carteles) | — | 2026-07-03 | ✅ | Sin dato duro: consejos de bajo riesgo. Step `busqueda`. |

---

## 9. Módulos existentes (referencia — verificar si se modifican)

**`policia` (Control policial)** y **`choque`** ya están implementados con contenido legal. Si los tocás, registrá acá las fuentes (Ley Nacional de Tránsito **24.449**, documentación obligatoria, derechos en un control, plazos de denuncia a la aseguradora).

| Dato | Valor verificado | Fuente oficial (URL) | Fecha verif. | Estado | Notas / Jurisdicción |
|---|---|---|---|---|---|
| Documentación obligatoria en control | | | | ⚠️ | DNI, licencia, cédula, seguro, VTV/RTO, patente |
| Derechos del conductor en un control | | | | ⚠️ | Ley 24.449 |
| Plazo denuncia a aseguradora (choque) | | | | ⚠️ | Verificar |

---

*Mantené este archivo actualizado a medida que verificás. Una fila sin fuente = dato que NO puede ir al código.*
