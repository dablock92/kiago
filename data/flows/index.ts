import { Flow } from "../../engine/types";

export const choqueFlow: Flow = {
  id: "choque",
  title: "Choqué",
  icon: "car",
  steps: [
    {
      id: "rol",
      type: "question",
      text: "¿Cuál es tu rol en el choque?",
      subtitle: "Paso 0: Identificación",
      options: [
        { label: "Soy conductor / pasajero", nextStep: "seguridad_inmediata" },
        { label: "Soy un espectador", nextStep: "espectador_guia" },
      ],
    },
    {
      id: "espectador_guia",
      type: "checklist",
      text: "Guía para testigos",
      subtitle: "Asistencia técnica",
      checklistItems: [
        "Asegurar zona del accidente",
        "Llamar al 911 si hay heridos",
        "Tomar fotos generales de lejos",
        "No mover los vehículos",
      ],
      nextStep: "resumen",
    },
    {
      id: "seguridad_inmediata",
      type: "question",
      text: "¿Hay personas heridas?",
      subtitle: "Paso 1: Triaje",
      options: [
        { label: "Sí, hay heridos", nextStep: "heridos_emergencia" },
        { label: "No, solo daños materiales", nextStep: "cantidad_vehiculos" },
      ],
    },
    {
      id: "heridos_emergencia",
      type: "checklist",
      text: "Protocolo de Emergencia",
      subtitle: "Prioridad máxima",
      checklistItems: [
        { id: "sec_antes", label: "ANTES DE LLAMAR (Rápido)", type: "section" },
        { id: "balizas", label: "Poner balizas y chaleco", type: "info" },
        {
          id: "ubicacion",
          label: "Verificar calle y altura exacta",
          type: "info",
        },
        { id: "sec_inmediata", label: "ACCIÓN INMEDIATA", type: "section" },
        { id: "llamado_911", label: "Llamar al 911 / 107", type: "info" },
        {
          id: "sec_mientras",
          label: "MIENTRAS LLEGA LA AYUDA",
          type: "section",
        },
        { id: "no_mover", label: "No mover a los heridos", type: "info" },
        {
          id: "gravedad",
          label: "Evaluar signos vitales (consciencia/pulso)",
          type: "info",
        },
      ],
      nextStep: "cantidad_vehiculos",
    },
    {
      id: "cantidad_vehiculos",
      type: "question",
      text: "¿Cuántos vehículos hay involucrados?",
      subtitle: "Paso 2: Magnitud",
      options: [
        { label: "Solo 2 (yo y otro)", nextStep: "fotos_escena" },
        { label: "3 o más", nextStep: "fotos_escena" },
      ],
    },
    {
      id: "fotos_escena",
      type: "camera",
      text: "Fotos de la Escena",
      subtitle: "Paso 3: Evidencia",
      nextStep: "intercambio_datos",
    },
    {
      id: "intercambio_datos",
      type: "involved_management",
      text: "Intercambio de Datos",
      subtitle: "Paso 4: Documentación",
      checklistItems: [
        { id: "sec_seguro", label: "DATOS DEL SEGURO", type: "section" },
        {
          id: "aseguradora",
          label: "Aseguradora",
          type: "text",
          allowPhoto: true,
          required: true,
          placeholder: "Ingrese nombre o foto",
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
        },
        {
          id: "poliza_num",
          label: "Número de Póliza",
          type: "text",
          allowPhoto: true,
          required: true,
          placeholder: "Escribe el número o toma foto",
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
        },
        {
          id: "vigencia_seguro",
          label: "Vigencia del Seguro",
          type: "date",
          allowPhoto: true,
          required: true,
          placeholder: "Seleccionar fecha o toma foto",
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
        },
        { id: "sec_vehiculo", label: "DATOS DEL VEHÍCULO", type: "section" },
        {
          id: "dominio_patente",
          label: "Dominio / Patente",
          type: "text",
          allowPhoto: true,
          required: true,
          placeholder: "Ej: AF 123 BK o toma foto",
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
        },
        {
          id: "nombre_titular",
          label: "Nombre del Titular",
          type: "text",
          allowPhoto: true,
          required: true,
          placeholder: "Nombre como figura en cédula",
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
        },
        { id: "sec_conductor", label: "DATOS DEL CONDUCTOR", type: "section" },
        {
          id: "conductor_nombre",
          label: "Conductor (Nombre y Apellido)",
          type: "text",
          required: true,
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
          fields: [
            {
              id: "nombre",
              label: "Nombre/s",
              type: "text",
              placeholder: "Ej: Juan",
            },
            {
              id: "apellido",
              label: "Apellido/s",
              type: "text",
              placeholder: "Ej: Pérez",
            },
          ],
        },
        {
          id: "dni_photos",
          label: "Identidad (DNI)",
          type: "photo",
          required: false,
          hint: "Podés ingresar el número de DNI o sacar fotos del documento (opcional).",
        },
        {
          id: "licencia_img",
          label: "Licencia de Conducir",
          type: "photo",
          allowPhoto: true,
          required: true,
          hint: "Captura obligatoria de la licencia de conducir vigente.",
        },
        {
          id: "conductor_tel",
          label: "Teléfono de contacto",
          type: "text",
          required: false,
          placeholder: "Ej: +54 9 11 ...",
          hint: "Este dato lo necesita la otra persona involucrada también, asegurate de brindar el tuyo.",
        },
        { id: "sec_danos", label: "EVIDENCIA DE DAÑOS", type: "section" },
        {
          id: "fotos_danos",
          label: "Fotos del Daño",
          type: "camera",
          required: true,
          hint: "Capturá abolladuras y raspaduras de cerca. Sumá una foto de lejos que muestre el daño junto a la patente para contexto legal.",
        },
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Reporte Final",
      subtitle: "Paso 5: Finalización",
    },
  ],
};

// Flow-guía: acciones urgentes a realizar en el momento, sin reporte final.
export const roboCelularFlow: Flow = {
  id: "robo_celular",
  title: "Robo de Celular",
  icon: "smartphone",
  steps: [
    {
      id: "bloqueo_inmediato",
      type: "checklist",
      text: "Acciones de Emergencia",
      subtitle: "Paso 1: Seguridad",
      finish: true,
      checklistItems: [
        "Llamar a la operadora para bloquear SIM",
        "Bloquear el equipo por IMEI (Enacom)",
        "Cambiar contraseñas de Apps bancarias",
        "Cambiar contraseña de Gmail/Apple ID",
      ],
    },
  ],
};

// Flow-guía: puntos a revisar en el momento, sin reporte final.
export const policiaFlow: Flow = {
  id: "policia",
  title: "Control Policial",
  icon: "shield-alert",
  steps: [
    {
      id: "documentacion_obligatoria",
      type: "checklist",
      text: "Qué documentos mostrar",
      subtitle: "Guía de Control",
      finish: true,
      checklistItems: [
        "DNI (Físico o Mi Argentina)",
        "Licencia de conducir vigente",
        "Cédula Verde o Azul",
        "Seguro obligatorio (comprobante)",
        "VTV / RTO vigente",
        "Patente paga",
      ],
    },
  ],
};

// ============================================================================
// EMERGENCIA MÉDICA
// Números y primeros auxilios verificados contra fuentes oficiales (2026-07-03):
// - 911 (emergencias, nacional): argentina.gob.ar/seguridad/911emergencias
// - 107 SAME (emergencias médicas; CABA y varias jurisdicciones; si no existe
//   en tu zona, el 911 deriva): argentina.gob.ar/tema/emergencias
// - RCP adultos: argentina.gob.ar/salud/primerosauxilios/rcp/adultos
// - Atragantamiento: argentina.gob.ar/salud/primerosauxilios/situaciones/atragantamiento
// - Convulsiones: argentina.gob.ar/salud/primerosauxilios/situaciones/convulsiones
// - Hemorragias: Manual de Primeros Auxilios del Ministerio de Salud
//   (argentina.gob.ar/sites/default/files/manual_1ros_auxilios_web.pdf)
// Registro completo en docs/FUENTES.md §2.
// ============================================================================

const DISCLAIMER_MEDICO =
  "Esta guía es orientativa y no reemplaza la atención médica profesional. Ante la duda, llamá al 911.";

export const emergenciaFlow: Flow = {
  id: "emergencia",
  title: "Emergencia Médica",
  icon: "stethoscope",
  steps: [
    {
      id: "llamada",
      type: "emergency",
      text: "Llamá a emergencias ahora",
      subtitle: "Paso 1: Pedir ayuda",
      options: [
        // Fuente 107/SAME: argentina.gob.ar/tema/emergencias (verificado 2026-07-03)
        { label: "Llamar al 107 (SAME)", action: "tel:107", style: "danger" },
        // Fuente 911: argentina.gob.ar/seguridad/911emergencias (verificado 2026-07-03)
        { label: "Llamar al 911", action: "tel:911", style: "danger" },
        { label: "Ya llamé, ¿qué hago?", nextStep: "triaje" },
      ],
      checklistItems: [
        "Decí dónde estás: calle, altura y localidad.",
        "Contá qué pasó y cuántas personas necesitan ayuda.",
        "No cortes la llamada hasta que el operador te lo indique.",
        "Si el 107 no funciona en tu zona, llamá al 911.",
      ],
    },
    {
      id: "triaje",
      type: "question",
      text: "¿Cómo está la persona?",
      subtitle: "Paso 2: Evaluación rápida",
      options: [
        { label: "No responde y NO respira", nextStep: "rcp", style: "danger" },
        { label: "No responde, pero respira", nextStep: "inconsciente" },
        { label: "Se está atragantando", nextStep: "atragantamiento" },
        { label: "Está convulsionando", nextStep: "convulsiones" },
        { label: "Está consciente", nextStep: "consciente" },
      ],
    },
    {
      // Fuente: argentina.gob.ar/salud/primerosauxilios/rcp/adultos (verificado 2026-07-03)
      id: "rcp",
      type: "checklist",
      text: "RCP básico (adultos)",
      subtitle: "Mientras llega la ayuda",
      checklistItems: [
        "Tocala suavemente y hablale fuerte para confirmar que no responde.",
        "Pedí a alguien que consiga un DEA (desfibrilador) si hay uno cerca.",
        "Apoyá el talón de una mano en el centro del pecho (mitad inferior del esternón) y la otra mano encima, con los dedos entrelazados.",
        "Comprimí fuerte y rápido: hundí el pecho entre 5 y 6 cm.",
        "Ritmo: 100 a 120 compresiones por minuto, en series de 30.",
        "No pares hasta que llegue la ayuda o la persona reaccione.",
        { id: "disclaimer_nota", label: DISCLAIMER_MEDICO, type: "note" },
      ],
      finish: true,
    },
    {
      // Posición de seguridad: Manual de Primeros Auxilios, Ministerio de Salud
      // (verificado 2026-07-03)
      id: "inconsciente",
      type: "checklist",
      text: "No responde, pero respira",
      subtitle: "Mientras llega la ayuda",
      checklistItems: [
        "Si sospechás un golpe fuerte o caída, NO la muevas (posible lesión de columna).",
        "Si no hubo golpe, ponela de costado (posición de seguridad) para que no se ahogue.",
        "Aflojale la ropa que apriete (cuello, cintura).",
        "Controlá que siga respirando hasta que llegue la ayuda.",
        "No le des agua, comida ni medicamentos.",
        { id: "disclaimer_nota", label: DISCLAIMER_MEDICO, type: "note" },
      ],
      finish: true,
    },
    {
      // Fuente: argentina.gob.ar/salud/primerosauxilios/situaciones/atragantamiento
      // (verificado 2026-07-03)
      id: "atragantamiento",
      type: "checklist",
      text: "Atragantamiento",
      subtitle: "Actuá según pueda respirar o no",
      checklistItems: [
        { id: "sec_parcial", label: "SI TOSE O PUEDE HABLAR", type: "section" },
        {
          id: "dejar_toser",
          label: "Dejala toser: no le golpees la espalda ni le des agua",
          type: "info",
          hint: "La tos es la forma más efectiva de expulsar el objeto.",
        },
        {
          id: "sec_total",
          label: "SI NO PUEDE RESPIRAR NI HABLAR",
          type: "section",
        },
        {
          id: "heimlich_1",
          label: "Abrazala por la espalda, por debajo de sus brazos",
          type: "info",
        },
        {
          id: "heimlich_2",
          label:
            "Poné tu puño cerrado cuatro dedos arriba del ombligo y tu otra mano sobre el puño",
          type: "info",
        },
        {
          id: "heimlich_3",
          label: "Presioná fuerte hacia adentro y arriba, hasta 5 veces",
          type: "info",
        },
        {
          id: "heimlich_4",
          label:
            "Repetí la maniobra hasta que salga el objeto o llegue la ayuda",
          type: "info",
        },
        { id: "disclaimer", label: DISCLAIMER_MEDICO, type: "note" },
      ],
      finish: true,
    },
    {
      // Fuente: argentina.gob.ar/salud/primerosauxilios/situaciones/convulsiones
      // (verificado 2026-07-03)
      id: "convulsiones",
      type: "checklist",
      text: "Convulsiones",
      subtitle: "Mientras llega la ayuda",
      checklistItems: [
        "Ponéle algo blando debajo de la cabeza.",
        "Alejá los objetos con los que pueda lastimarse.",
        "Aflojale la ropa.",
        "NO la inmovilices y NO le pongas nada en la boca.",
        "Tomá el tiempo que dura la convulsión (informalo al médico).",
        "Cuando termine, ponela de costado (posición de seguridad).",
        { id: "disclaimer_nota", label: DISCLAIMER_MEDICO, type: "note" },
      ],
      finish: true,
    },
    {
      // Hemorragias: Manual de Primeros Auxilios, Ministerio de Salud
      // (verificado 2026-07-03)
      id: "consciente",
      type: "checklist",
      text: "Está consciente",
      subtitle: "Mientras llega la ayuda",
      checklistItems: [
        "Mantené la calma y hablale para tranquilizarla.",
        "Si sangra: presioná firme sobre la herida con una tela limpia y no la sueltes.",
        "Si tuvo un golpe fuerte o una caída, no la muevas.",
        "No le des agua, comida ni medicamentos.",
        "Acompañala hasta que llegue la ayuda.",
        { id: "disclaimer_nota", label: DISCLAIMER_MEDICO, type: "note" },
      ],
      finish: true,
    },
  ],
};

// ============================================================================
// INCENDIO / GAS
// Verificado contra fuentes oficiales (2026-07-03):
// - 100 (Bomberos) y 103 (Defensa Civil): argentina.gob.ar/tema/emergencias
// - Protocolo de incendio estructural (SINAGIR):
//   argentina.gob.ar/sinagir/incendios-estructurales/que-hacer
// - Escape de gas (ENARGAS): enargas.gob.ar/secciones/tramites/perdida-de-gas.php
//   → la vía oficial es llamar a TU distribuidora al número de emergencias
//   que figura en la factura de gas (varía por zona; atención 24 h).
//   ENARGAS (ente regulador): 0800-333-4444.
// Registro completo en docs/FUENTES.md §3.
// ============================================================================

const DISCLAIMER_EMERGENCIA =
  "Esta guía es orientativa. Ante peligro inmediato, priorizá salir del lugar y llamá al 911.";

export const incendioFlow: Flow = {
  id: "incendio",
  title: "Incendio / Gas",
  icon: "flame",
  steps: [
    {
      id: "tipo",
      type: "question",
      text: "¿Qué está pasando?",
      subtitle: "Paso 1: Identificar el peligro",
      options: [
        { label: "Hay fuego", nextStep: "llamada_bomberos", style: "danger" },
        { label: "Siento olor a gas", nextStep: "protocolo_gas" },
      ],
    },
    {
      id: "llamada_bomberos",
      type: "emergency",
      text: "Llamá a los bomberos ahora",
      subtitle: "Paso 2: Pedir ayuda",
      options: [
        // Fuente 100: argentina.gob.ar/tema/emergencias (verificado 2026-07-03)
        {
          label: "Llamar al 100 (Bomberos)",
          action: "tel:100",
          style: "danger",
        },
        { label: "Llamar al 911", action: "tel:911", style: "danger" },
        { label: "Ya llamé, ¿qué hago?", nextStep: "protocolo_fuego" },
      ],
      checklistItems: [
        "Si el fuego avanza, salí primero y llamá desde afuera.",
        "Decí la dirección exacta: calle, altura, piso y localidad.",
        "Avisá si hay personas atrapadas o en peligro.",
      ],
    },
    {
      // Fuente: argentina.gob.ar/sinagir/incendios-estructurales/que-hacer
      // (verificado 2026-07-03)
      id: "protocolo_fuego",
      type: "checklist",
      text: "Protocolo de incendio",
      subtitle: "Evacuá con calma",
      checklistItems: [
        "Si el fuego es chico y sabés usar un matafuego, intentá apagarlo sin arriesgarte.",
        "Si no podés apagarlo, salí YA por la salida más cercana.",
        "Ayudá a salir primero a chicos, personas mayores y personas con discapacidad.",
        "Usá las escaleras. NUNCA el ascensor ni las ventanas.",
        "Si hay humo: agachate, avanzá gateando y tapate nariz y boca con un trapo húmedo.",
        "Si no podés salir: encerrate lejos del fuego, sellá la puerta con trapos y hacete ver por la ventana.",
        "No vuelvas a entrar hasta que los bomberos lo autoricen.",
        {
          id: "disclaimer_nota",
          label: DISCLAIMER_EMERGENCIA,
          type: "note",
        },
      ],
      finish: true,
    },
    {
      // Fuente: enargas.gob.ar/secciones/tramites/perdida-de-gas.php
      // (verificado 2026-07-03)
      id: "protocolo_gas",
      type: "checklist",
      text: "Protocolo de escape de gas",
      subtitle: "Evitá cualquier chispa",
      checklistItems: [
        "NO prendas ni apagues luces ni electrodomésticos.",
        "NO uses el celular adentro, ni fósforos ni encendedores: cualquier chispa puede encender el gas.",
        "Cerrá la llave de paso del gas.",
        "Abrí puertas y ventanas para ventilar.",
        "Salí de la vivienda y alejá a todos del lugar.",
        {
          id: "disclaimer_nota",
          label: DISCLAIMER_EMERGENCIA,
          type: "note",
        },
      ],
      nextStep: "llamada_gas",
    },
    {
      id: "llamada_gas",
      type: "emergency",
      text: "Avisá desde afuera",
      subtitle: "Paso 3: Pedir ayuda",
      options: [
        {
          label: "Llamar al 100 (Bomberos)",
          action: "tel:100",
          style: "danger",
        },
        { label: "Llamar al 911", action: "tel:911", style: "danger" },
        { label: "Ya avisé, finalizar", nextStep: "fin" },
      ],
      checklistItems: [
        "Llamá a tu distribuidora de gas al número de EMERGENCIAS que figura en tu factura (atención 24 h). Hacelo desde AFUERA de la vivienda.",
        "Cada zona tiene su distribuidora (Metrogas, Naturgy, Camuzzi, Ecogas, etc.): el número correcto es el de TU factura.",
        "ENARGAS (ente regulador del gas): 0800-333-4444, lun a vie de 10 a 16 h.",
      ],
    },
  ],
};

// ============================================================================
// ME SIENTO INSEGURO
// Verificado contra fuentes oficiales (2026-07-03):
// - 911 (emergencias): argentina.gob.ar/seguridad/911emergencias
// - 144 (violencia de género — contención/asesoramiento, gratuita 24/365,
//   Ley 26.485; NO es línea de emergencia): argentina.gob.ar/linea-144
//   WhatsApp: +54 9 11 2771-6463
// - 137 (violencia familiar y/o sexual, grooming — nacional, gratuita 24/365,
//   Programa Las Víctimas Contra Las Violencias):
//   argentina.gob.ar/justicia/violencia-familiar-sexual
//   WhatsApp: +54 9 11 3133-1000
// Botones antipánico provinciales: omitidos (varían por provincia, sin fuente
// única verificable — decisión conservadora, ver docs/FUENTES.md §7).
// ============================================================================

export const inseguroFlow: Flow = {
  id: "inseguro",
  title: "Situación de Inseguridad",
  icon: "alert-triangle",
  steps: [
    {
      id: "situacion",
      type: "question",
      text: "¿Qué está pasando?",
      subtitle: "Paso 1: Tu situación",
      options: [
        {
          label: "Estoy en peligro AHORA (me siguen / amenaza)",
          nextStep: "peligro_ahora",
          style: "danger",
        },
        { label: "Sufro violencia de género", nextStep: "violencia_genero" },
        {
          label: "Violencia familiar o sexual",
          nextStep: "violencia_familiar",
        },
        { label: "Quiero consejos de prevención", nextStep: "prevencion" },
      ],
    },
    {
      id: "peligro_ahora",
      type: "emergency",
      text: "Llamá al 911 ahora",
      subtitle: "Paso 2: Pedir ayuda",
      options: [
        { label: "Llamar al 911", action: "tel:911", style: "danger" },
        { label: "Estoy a salvo, finalizar", nextStep: "fin" },
      ],
      checklistItems: [
        "Andá a un lugar con gente e iluminado: un comercio, una estación, una farmacia.",
        "Compartí tu ubicación en tiempo real con alguien de confianza.",
        "Si creés que te siguen, NO vayas directo a tu casa: cambiá el recorrido.",
        "Tené el teléfono a mano, con el 911 listo para marcar.",
        "No enfrentes a nadie: alejate.",
      ],
    },
    {
      // Fuente: argentina.gob.ar/linea-144 (verificado 2026-07-03)
      id: "violencia_genero",
      type: "emergency",
      text: "No estás sola",
      subtitle: "Hay ayuda disponible, gratuita y 24 hs",
      options: [
        {
          label: "Llamar al 911 (peligro inmediato)",
          action: "tel:911",
          style: "danger",
        },
        { label: "Llamar al 144 (orientación)", action: "tel:144" },
        { label: "Finalizar", nextStep: "fin" },
      ],
      checklistItems: [
        "La línea 144 es gratuita, atiende 24 hs los 365 días: escucha, contención y asesoramiento (no es una línea de emergencia).",
        "Si el peligro es inmediato, llamá al 911.",
        "También podés escribir al WhatsApp del 144: +54 9 11 2771-6463.",
        "Cubre todos los tipos de violencia de la Ley 26.485: física, psicológica, sexual, económica y más.",
      ],
    },
    {
      // Fuente: argentina.gob.ar/justicia/violencia-familiar-sexual
      // (verificado 2026-07-03)
      id: "violencia_familiar",
      type: "emergency",
      text: "Hay ayuda disponible",
      subtitle: "Gratuita, nacional y 24 hs",
      options: [
        {
          label: "Llamar al 911 (peligro inmediato)",
          action: "tel:911",
          style: "danger",
        },
        { label: "Llamar al 137 (acompañamiento)", action: "tel:137" },
        { label: "Finalizar", nextStep: "fin" },
      ],
      checklistItems: [
        "La línea 137 atiende víctimas de violencia familiar y/o sexual y grooming, 24 hs los 365 días, en todo el país.",
        "Te atiende un equipo de psicólogas y trabajadoras sociales.",
        "También podés escribir al WhatsApp del 137: +54 9 11 3133-1000.",
        "Si el peligro es inmediato, llamá al 911.",
      ],
    },
    {
      id: "prevencion",
      type: "checklist",
      text: "Consejos de prevención",
      subtitle: "Reducí el riesgo",
      checklistItems: [
        "Compartí tu ubicación en tiempo real con alguien de confianza cuando viajes solo/a.",
        "Avisale a alguien a dónde vas y a qué hora pensás llegar.",
        "Preferí calles iluminadas y con gente; evitá atajos solitarios.",
        "Tené el teléfono cargado y a mano, con el 911 listo para marcar.",
        "Si un lugar o una persona te generan desconfianza, alejate: no lo enfrentes.",
        {
          id: "disclaimer_nota",
          label:
            "Esta guía es orientativa. Ante peligro inmediato, llamá al 911.",
          type: "note",
        },
      ],
      finish: true,
    },
  ],
};

// ============================================================================
// ME ROBARON TARJETAS
// Verificado contra fuentes oficiales (2026-07-03):
// - Ley 25.065 (Tarjetas de Crédito), texto actualizado:
//   argentina.gob.ar/normativa/nacional/ley-25065-55556/actualizacion
//   → impugnación de consumos dentro de 30 días de recibido el resumen;
//     el emisor acusa recibo en 7 días y resuelve en 15 (60 si es exterior);
//     mientras tanto no pueden impedir el uso ni dar por aceptado el consumo;
//     pagar el mínimo NO implica aceptar el resumen.
//   → la ley exige al emisor un sistema telefónico de denuncias 24 h que
//     entrega número de denuncia (por eso NO hardcodeamos números por banco:
//     el correcto está al dorso de la tarjeta y en la app del banco).
//     Fuente: argentina.gob.ar/tengo-tarjeta-de-credito
// - Reclamo escalonado: primero al banco (respuesta máx. 10 días hábiles);
//   si no responde → BCRA (bcra.gob.ar/BCRAyVos/Reclamos.asp) o Defensa del
//   Consumidor: argentina.gob.ar/economia/inclusion-financiera/como-y-donde-realizar-un-reclamo
// - Ciberestafas: UFECI (mpf.gob.ar/ufeci — denunciasufeci@mpf.gob.ar)
// Registro completo en docs/FUENTES.md §4.
// ============================================================================

const DISCLAIMER_LEGAL =
  "Esta guía es orientativa y no reemplaza el asesoramiento legal profesional.";

export const roboTarjetasFlow: Flow = {
  id: "robo_tarjetas",
  title: "Robo de Tarjetas",
  icon: "credit-card",
  steps: [
    {
      id: "bloqueo",
      type: "checklist",
      text: "Bloqueá todo ahora",
      subtitle: "Paso 1: Frenar el daño",
      checklistItems: [
        {
          id: "llamar_emisor",
          label: "Llamá YA al emisor de cada tarjeta para bloquearla",
          type: "info",
          hint: "El número de emergencias 24 h figura al dorso de la tarjeta y en la app del banco. La Ley 25.065 los obliga a atender denuncias las 24 hs.",
        },
        {
          id: "numero_denuncia",
          label: "Anotá el número de denuncia que te da el emisor",
          type: "info",
          hint: "Es tu comprobante del bloqueo: la ley obliga a entregarlo.",
        },
        {
          id: "bloqueo_app",
          label: "Bloqueá también desde el home banking o la app del banco",
          type: "info",
          hint: "La mayoría de los bancos permite pausar/bloquear la tarjeta desde la app en segundos.",
        },
        {
          id: "billeteras",
          label: "Asegurá tus billeteras virtuales (MercadoPago, etc.)",
          type: "info",
          hint: "Desde la app de cada billetera: sección Seguridad → bloquear tarjetas / cerrar sesiones.",
        },
        {
          id: "claves",
          label: "Cambiá las claves de home banking y billeteras",
          type: "info",
        },
        {
          id: "celular_tambien",
          label:
            "¿Te robaron también el celular? Bloqueá la línea con tu operadora",
          type: "info",
        },
      ],
      nextStep: "registro",
    },
    {
      id: "registro",
      type: "form",
      text: "Registrá lo robado",
      subtitle: "Paso 2: Datos para la denuncia",
      fields: [
        {
          id: "tarjetas_afectadas",
          label: "Tarjetas afectadas",
          type: "text",
          placeholder: "Ej: Visa Galicia, Mastercard BBVA",
        },
        {
          id: "ultimos_digitos",
          label: "Últimos 4 dígitos (si los recordás)",
          type: "text",
          placeholder: "Ej: 4321, 8765",
        },
        {
          id: "cuando",
          label: "¿Cuándo pasó?",
          type: "text",
          placeholder: "Ej: hoy 15:30 hs aprox.",
        },
        {
          id: "donde",
          label: "¿Dónde pasó?",
          type: "text",
          placeholder: "Ej: subte línea B, estación Carlos Gardel",
        },
      ],
      nextStep: "denuncia",
    },
    {
      // Fuente Ley 25.065: argentina.gob.ar/normativa/nacional/ley-25065-55556
      // (verificado 2026-07-03)
      id: "denuncia",
      type: "checklist",
      text: "Denuncia y tus derechos",
      subtitle: "Paso 3: Protegerte",
      // Los derechos se enuncian (type "note", sin check) y se pueden
      // descargar/compartir en PDF: no son acciones inmediatas del usuario.
      sharePdf: true,
      checklistItems: [
        { id: "sec_denuncia", label: "DENUNCIA", type: "section" },
        {
          id: "denuncia_policial",
          label: "Hacé la denuncia policial del robo",
          type: "info",
          hint: "En la comisaría más cercana o por la denuncia online de tu jurisdicción. Sirve para deslindar responsabilidad por el uso de las tarjetas.",
        },
        {
          id: "sec_derechos",
          label: "TUS DERECHOS (LEY 25.065)",
          type: "section",
        },
        {
          id: "desconocer",
          label:
            "Podés desconocer por escrito los consumos que no hiciste: tenés 30 días desde que recibís el resumen",
          type: "note",
        },
        {
          id: "plazos_emisor",
          label:
            "El emisor debe acusar recibo en 7 días y resolver en 15 (60 si el consumo fue en el exterior)",
          type: "note",
        },
        {
          id: "minimo",
          label:
            "Pagar el mínimo del resumen NO implica aceptar los consumos desconocidos",
          type: "note",
        },
        {
          id: "sec_escalar",
          label: "SI EL BANCO NO RESPONDE",
          type: "section",
        },
        {
          id: "bcra",
          label:
            "Pasados 10 días hábiles sin solución, podés reclamar ante el BCRA o Defensa del Consumidor",
          type: "note",
          hint: "BCRA: bcra.gob.ar → Reclamos. Defensa del Consumidor: argentina.gob.ar (Ventanilla Única Federal).",
        },
        {
          id: "ufeci",
          label:
            "Si hubo estafa virtual, también podés denunciar en la UFECI: denunciasufeci@mpf.gob.ar",
          type: "note",
        },
        { id: "disclaimer", label: DISCLAIMER_LEGAL, type: "note" },
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Reporte del Robo",
      subtitle: "Paso final: Registro",
    },
  ],
};

// ============================================================================
// PERDÍ A ALGUIEN (persona desaparecida/extraviada)
// Verificado contra fuentes oficiales (2026-07-03):
// - Denuncia INMEDIATA (no hay que esperar 24/48 h; obligación de tomarla en
//   el momento; puede denunciar cualquier persona, en comisaría, fiscalía o
//   juzgado): argentina.gob.ar/seguridad/personasextraviadas/denuncia
// - Si se niegan a tomar la denuncia → línea 134 (gratuita).
// - SIFEBU (Sistema Federal de Búsqueda de Personas Desaparecidas y
//   Extraviadas, Min. Seguridad): argentina.gob.ar/seguridad/personasextraviadas
// - Alerta Sofía (menores en Alto Riesgo Inminente; la activa la autoridad
//   judicial; denuncias anónimas al 134 o denuncias@minseg.gob.ar):
//   argentina.gob.ar/seguridad/alertasofia
// - 142 (Chicos y chicas extraviados): argentina.gob.ar/tema/emergencias
// Registro completo en docs/FUENTES.md §5.
// ============================================================================

export const perdiAlguienFlow: Flow = {
  id: "perdi_alguien",
  title: "Búsqueda de Persona",
  icon: "user-minus",
  steps: [
    {
      id: "denuncia_ya",
      type: "emergency",
      text: "Denunciá YA: no esperes",
      subtitle: "Paso 1: Activar la búsqueda",
      options: [
        { label: "Llamar al 911", action: "tel:911", style: "danger" },
        // Fuente 142: argentina.gob.ar/tema/emergencias (verificado 2026-07-03)
        { label: "Llamar al 142 (menores)", action: "tel:142" },
        { label: "Continuar con los datos", nextStep: "datos_persona" },
      ],
      checklistItems: [
        "NO hay que esperar 24 ni 48 horas: eso es un mito. Denunciá de inmediato.",
        "Podés denunciar en cualquier comisaría, fiscalía o juzgado: están obligados a tomarla en el momento.",
        "Cualquier persona puede denunciar, aunque no sea familiar.",
        "Si no te quieren tomar la denuncia, llamá gratis al 134.",
      ],
    },
    {
      id: "datos_persona",
      type: "form",
      text: "Datos de la persona",
      subtitle: "Paso 2: Información para la búsqueda",
      fields: [
        {
          id: "nombre_persona",
          label: "Nombre y apellido",
          type: "text",
          placeholder: "Ej: María López",
        },
        {
          id: "edad",
          label: "Edad",
          type: "text",
          placeholder: "Ej: 8 años / 82 años",
        },
        {
          id: "descripcion_fisica",
          label: "Descripción física",
          type: "text",
          placeholder: "Ej: 1,60 m, pelo canoso, anteojos",
        },
        {
          id: "ropa",
          label: "Ropa que llevaba",
          type: "text",
          placeholder: "Ej: campera azul, jean, zapatillas blancas",
        },
        {
          id: "ultima_vez",
          label: "Última vez vista: lugar y hora",
          type: "text",
          placeholder: "Ej: Plaza Italia, hoy 17:00 hs",
        },
        {
          id: "datos_salud",
          label: "Datos de salud u otros relevantes",
          type: "text",
          placeholder: "Ej: toma medicación, deterioro cognitivo",
        },
      ],
      nextStep: "guia_busqueda",
    },
    {
      // Fuentes: argentina.gob.ar/seguridad/personasextraviadas (SIFEBU) y
      // argentina.gob.ar/seguridad/alertasofia (verificado 2026-07-03)
      id: "guia_busqueda",
      type: "checklist",
      text: "Denuncia y difusión",
      subtitle: "Paso 3: Buscar en paralelo",
      checklistItems: [
        { id: "sec_denuncia", label: "DENUNCIA", type: "section" },
        {
          id: "comisaria",
          label:
            "Andá a la comisaría o fiscalía más cercana con la foto más reciente y los datos",
          type: "info",
          hint: "La denuncia activa el SIFEBU, el sistema federal de búsqueda del Ministerio de Seguridad.",
        },
        {
          id: "alerta_sofia",
          label:
            "Si es un menor en riesgo, la Justicia puede activar el Alerta Sofía",
          type: "note",
          hint: "Es la difusión masiva inmediata (medios, celulares, redes). La activa la autoridad judicial: aportá todos los datos en la denuncia.",
        },
        { id: "sec_difusion", label: "DIFUSIÓN Y BÚSQUEDA", type: "section" },
        {
          id: "foto_reciente",
          label: "Conseguí la foto más reciente que tengas y tenela a mano",
          type: "info",
        },
        {
          id: "compartir",
          label:
            "Compartí foto y datos con familiares, vecinos y grupos de la zona",
          type: "info",
        },
        {
          id: "recorrer",
          label:
            "Recorré los últimos lugares donde estuvo y consultá en hospitales de la zona",
          type: "info",
        },
        {
          id: "anonimas",
          label:
            "Denuncias anónimas: línea 134 (gratuita) o denuncias@minseg.gob.ar",
          type: "note",
        },
        {
          id: "cierre",
          label: "Cuando aparezca, avisá a la policía para cerrar la búsqueda",
          type: "info",
        },
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Reporte de Búsqueda",
      subtitle: "Paso final: Registro",
    },
  ],
};

// ============================================================================
// PROBLEMA VIAJANDO
// Verificado contra fuentes oficiales (2026-07-03):
// - Aéreo — Resolución 1532/98 (texto actualizado InfoLEG:
//   servicios.infoleg.gob.ar/infolegInternet/anexos/50000-54999/54791/texact.htm):
//   demora >4 h → comida/refrigerios; >8 h → + alojamiento y traslados;
//   cancelación → reubicación / endoso / reencaminamiento o reintegro total;
//   excepciones: clima, caso fortuito, fuerza mayor.
//   Guía oficial ANAC: argentina.gob.ar/anac/pasajeros/guia-para-pasajeros-de-avion-y-derechos-del-pasajero
//   Res. ANAC 774/2025: canal gratuito de reclamos, comprobante único,
//   30 días hábiles para responder.
// - Terrestre — CNRT: argentina.gob.ar/transporte/cnrt/derechos-de-los-usuarios
//   (15 kg equipaje gratis con ticket; cancelación → reembolso; respetar
//   recorridos/frecuencias/tarifas). Denuncias: denuncias.cnrt.gob.ar y
//   argentina.gob.ar/denunciar-servicios-de-transporte
// - Consumo en general — Ley 24.240: argentina.gob.ar/tema/consumidores
// Registro completo en docs/FUENTES.md §6.
// ============================================================================

export const problemaViajeFlow: Flow = {
  id: "problema_viaje",
  title: "Problema Viajando",
  icon: "plane",
  steps: [
    {
      id: "medio",
      type: "question",
      text: "¿Con qué tuviste el problema?",
      subtitle: "Paso 1: Tu situación",
      options: [
        { label: "Vuelo (demora / cancelación)", nextStep: "avion" },
        { label: "Micro o tren de larga distancia", nextStep: "terrestre" },
        { label: "Hotel, agencia u otro servicio", nextStep: "otro_servicio" },
      ],
    },
    {
      // Fuente: Res. 1532/98 (InfoLEG) y guía ANAC (verificado 2026-07-03)
      id: "avion",
      type: "checklist",
      text: "Tus derechos en el vuelo",
      subtitle: "Demoras y cancelaciones",
      sharePdf: true,
      checklistItems: [
        { id: "sec_derechos_aire", label: "TUS DERECHOS", type: "section" },
        {
          id: "demora4",
          label:
            "Demora de más de 4 horas: la aerolínea debe darte comida y refrigerios",
          type: "note",
        },
        {
          id: "demora8",
          label:
            "Más de 8 horas: se suman alojamiento y los traslados necesarios",
          type: "note",
        },
        {
          id: "cancelacion",
          label:
            "Cancelación: pueden reubicarte en el próximo vuelo, endosarte a otra aerolínea o reencaminarte. Si nada te sirve, te corresponde el reintegro total",
          type: "note",
        },
        {
          id: "excepciones",
          label:
            "Excepciones: mal clima, caso fortuito o fuerza mayor no generan estas obligaciones",
          type: "note",
        },
        { id: "sec_reclamo_aire", label: "CÓMO RECLAMAR", type: "section" },
        {
          id: "canal_gratuito",
          label:
            "Reclamá primero a la aerolínea: deben tener un canal gratuito y darte un comprobante de reclamo",
          type: "info",
          hint: "Tienen hasta 30 días hábiles para responderte (Res. ANAC 774/2025).",
        },
        {
          id: "anac",
          label:
            "Si no responden, reclamá ante la ANAC o Defensa del Consumidor",
          type: "info",
          hint: "ANAC: argentina.gob.ar/anac. Defensa del Consumidor: Ventanilla Única Federal.",
        },
        {
          id: "guardar_aire",
          label:
            "Guardá todo: pasaje, tarjeta de embarque y tickets de los gastos que hiciste",
          type: "info",
        },
        { id: "disclaimer_aire", label: DISCLAIMER_LEGAL, type: "note" },
      ],
      nextStep: "registro_viaje",
    },
    {
      // Fuente: argentina.gob.ar/transporte/cnrt/derechos-de-los-usuarios
      // (verificado 2026-07-03)
      id: "terrestre",
      type: "checklist",
      text: "Tus derechos en micro / tren",
      subtitle: "Larga distancia",
      sharePdf: true,
      checklistItems: [
        {
          id: "sec_derechos_tierra",
          label: "TUS DERECHOS",
          type: "section",
        },
        {
          id: "equipaje",
          label:
            "Micro: hasta 15 kg de equipaje gratis. El chofer debe darte un ticket: guardalo hasta recuperar tu equipaje",
          type: "note",
        },
        {
          id: "cancelacion_tierra",
          label:
            "Si la empresa cancela el servicio, te deben devolver el pasaje",
          type: "note",
          hint: "La Ley 24.240 prohíbe que se desliguen de cancelaciones arbitrarias.",
        },
        {
          id: "recorridos",
          label:
            "Deben respetar recorridos, frecuencias y tarifas aprobadas, con vehículos y choferes habilitados",
          type: "note",
        },
        { id: "sec_reclamo_tierra", label: "CÓMO RECLAMAR", type: "section" },
        {
          id: "cnrt",
          label: "Reclamá a la empresa y denunciá en la CNRT",
          type: "info",
          hint: "Online: denuncias.cnrt.gob.ar (el 0800 de la CNRT figura en tu pasaje).",
        },
        {
          id: "consumidor_tierra",
          label: "También podés reclamar en Defensa del Consumidor",
          type: "info",
        },
        { id: "disclaimer_tierra", label: DISCLAIMER_LEGAL, type: "note" },
      ],
      nextStep: "registro_viaje",
    },
    {
      // Fuente Ley 24.240: argentina.gob.ar/tema/consumidores (verificado 2026-07-03)
      id: "otro_servicio",
      type: "checklist",
      text: "Hotel, agencia u otro servicio",
      subtitle: "Defensa del Consumidor",
      sharePdf: true,
      checklistItems: [
        {
          id: "ley24240",
          label:
            "La Ley 24.240 te protege en cualquier servicio que contrates: hoteles, agencias, excursiones",
          type: "note",
        },
        {
          id: "reclamo_escrito",
          label:
            "Reclamá primero al proveedor por escrito y guardá el comprobante",
          type: "info",
        },
        {
          id: "ventanilla",
          label:
            "Si no responde, reclamá en Defensa del Consumidor (Ventanilla Única Federal)",
          type: "info",
          hint: "argentina.gob.ar/tema/consumidores — podés iniciar el reclamo online.",
        },
        {
          id: "guardar_otro",
          label: "Guardá contratos, comprobantes de pago, fotos y chats",
          type: "info",
        },
        { id: "disclaimer_otro", label: DISCLAIMER_LEGAL, type: "note" },
      ],
      nextStep: "registro_viaje",
    },
    {
      id: "registro_viaje",
      type: "form",
      text: "Registrá el problema",
      subtitle: "Datos para tu reclamo",
      fields: [
        {
          id: "empresa",
          label: "Empresa / proveedor",
          type: "text",
          placeholder: "Ej: Aerolíneas Argentinas / Vía Bariloche",
        },
        {
          id: "servicio",
          label: "Vuelo / servicio contratado",
          type: "text",
          placeholder: "Ej: AR1234 BUE-COR / butaca 12, 22:30 hs",
        },
        {
          id: "que_paso",
          label: "¿Qué pasó?",
          type: "text",
          placeholder: "Ej: cancelaron el vuelo sin reubicación",
        },
        {
          id: "cuando_viaje",
          label: "¿Cuándo?",
          type: "text",
          placeholder: "Ej: hoy 14:00 hs",
        },
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Reporte del Problema",
      subtitle: "Paso final: Registro",
    },
  ],
};

// ============================================================================
// PERDÍ MI MASCOTA
// Verificado (2026-07-03):
// - Animales BA (plataforma oficial de CABA para reportar mascotas perdidas
//   y encontradas): buenosaires.gob.ar/inicio/animales-ba
// - No existe un registro nacional oficial de mascotas perdidas; los registros
//   de microchip son privados → indicación genérica (docs/FUENTES.md §8).
// El resto son buenas prácticas de difusión (bajo riesgo, sin dato duro).
// ============================================================================

export const perdiMascotaFlow: Flow = {
  id: "perdi_mascota",
  title: "Búsqueda de Mascota",
  icon: "dog",
  steps: [
    {
      id: "datos_mascota",
      type: "form",
      text: "Datos de tu mascota",
      subtitle: "Paso 1: Para el cartel de búsqueda",
      fields: [
        {
          id: "nombre_mascota",
          label: "Nombre",
          type: "text",
          placeholder: "Ej: Simón",
        },
        {
          id: "especie_raza",
          label: "Especie y raza",
          type: "text",
          placeholder: "Ej: perro, caniche / gato común",
        },
        {
          id: "descripcion_mascota",
          label: "Descripción",
          type: "text",
          placeholder: "Ej: blanco, chico, collar rojo con chapita",
        },
        {
          id: "zona_hora",
          label: "Zona y hora en que se perdió",
          type: "text",
          placeholder: "Ej: Parque Centenario, hoy 18:00 hs",
        },
        {
          id: "contacto",
          label: "Tu teléfono de contacto",
          type: "phone",
          placeholder: "Ej: 11 5555-5555",
        },
      ],
      nextStep: "busqueda",
    },
    {
      id: "busqueda",
      type: "checklist",
      text: "Plan de búsqueda",
      subtitle: "Paso 2: Actuá rápido",
      checklistItems: [
        { id: "sec_ahora", label: "BUSCÁ AHORA", type: "section" },
        {
          id: "recorrer_zona",
          label: "Recorré la zona a pie llamándola por su nombre",
          type: "info",
          hint: "Repetí en horarios tranquilos: amanecer y noche, cuando hay menos ruido.",
        },
        {
          id: "olor",
          label: "Dejá en tu puerta algo con su olor (manta, arenero) y agua",
          type: "info",
        },
        {
          id: "vecinos",
          label: "Avisá a vecinos, porteros y comercios de la zona",
          type: "info",
        },
        { id: "sec_difusion_m", label: "DIFUSIÓN", type: "section" },
        {
          id: "redes",
          label:
            "Publicá foto, zona y contacto en los grupos de mascotas perdidas de tu barrio",
          type: "info",
        },
        {
          id: "veterinarias",
          label: "Avisá a veterinarias y refugios cercanos",
          type: "info",
          hint: "Ahí suelen llevar a los animales que aparecen.",
        },
        {
          // Fuente: buenosaires.gob.ar/inicio/animales-ba (verificado 2026-07-03)
          id: "animales_ba",
          label: "En CABA: reportala en Animales BA, la plataforma oficial",
          type: "info",
          hint: "buenosaires.gob.ar/inicio/animales-ba — publicás la búsqueda y ves los animales encontrados.",
        },
        {
          id: "microchip",
          label:
            "Si tiene microchip o chapita, avisá al registro o veterinaria que lo colocó",
          type: "info",
        },
        {
          id: "carteles",
          label:
            "Imprimí carteles: foto grande, zona y tu teléfono bien visible",
          type: "info",
        },
        { id: "sec_cierre_m", label: "CUANDO APAREZCA", type: "section" },
        {
          id: "cerrar_busqueda",
          label:
            "Actualizá tus publicaciones y avisá a quienes ayudaron para cerrar la búsqueda",
          type: "info",
        },
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Cartel de Búsqueda",
      subtitle: "Paso final: Compartir",
    },
  ],
};

// Título legible por flowId, para historial y reportes (PDF/mail).
// El id canónico del flujo de choque es "choque" (el viejo "crash-report" quedó deprecado).
export const getFlowTitle = (flowId: string): string =>
  flows.find((f) => f.id === flowId)?.title || "Incidente";

export const flows = [
  choqueFlow,
  roboCelularFlow,
  policiaFlow,
  roboTarjetasFlow,
  emergenciaFlow,
  incendioFlow,
  perdiAlguienFlow,
  perdiMascotaFlow,
  problemaViajeFlow,
  inseguroFlow,
];
