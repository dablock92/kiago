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
      checklistItems: [
        "Llamar a la operadora para bloquear SIM",
        "Bloquear el equipo por IMEI (Enacom)",
        "Cambiar contraseñas de Apps bancarias",
        "Cambiar contraseña de Gmail/Apple ID",
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Acciones Realizadas",
      subtitle: "Paso 2: Finalización",
    },
  ],
};

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
      checklistItems: [
        "DNI (Físico o Mi Argentina)",
        "Licencia de conducir vigente",
        "Cédula Verde o Azul",
        "Seguro obligatorio (comprobante)",
        "VTV / RTO vigente",
        "Patente paga",
      ],
      nextStep: "resumen",
    },
    {
      id: "resumen",
      type: "summary",
      text: "Control Finalizado",
      subtitle: "Paso 2: Finalización",
    },
  ],
};

const createConstructionFlow = (id: string, title: string): Flow => ({
  id,
  title,
  icon: "alert-triangle",
  steps: [
    {
      id: "construction",
      type: "construction",
      text: "Estamos trabajando en esto",
      subtitle: "Esta sección todavía no se encuentra disponible",
    },
  ],
});

export const flows = [
  choqueFlow,
  roboCelularFlow,
  policiaFlow,
  createConstructionFlow("robo_tarjetas", "Me robaron tarjetas"),
  createConstructionFlow("emergencia", "Emergencia médica"),
  createConstructionFlow("incendio", "Incendio / Gas"),
  createConstructionFlow("perdi_alguien", "Perdí a alguien"),
  createConstructionFlow("perdi_mascota", "Perdí mi mascota"),
  createConstructionFlow("problema_viaje", "Problema viajando"),
  createConstructionFlow("inseguro", "Me siento inseguro"),
];
