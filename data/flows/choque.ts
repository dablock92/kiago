import { Flow } from '../../engine/types';

export const choqueFlow: Flow = {
  id: 'choque',
  title: 'Choqué',
  icon: 'car',
  steps: [
    {
      id: 'rol',
      type: 'question',
      text: '¿Cuál es tu rol en el choque?',
      subtitle: 'Paso 0: Identificación',
      options: [
        { label: 'Soy conductor / pasajero', nextStep: 'seguridad_inmediata' },
        { label: 'Soy un espectador', nextStep: 'espectador_guia' }
      ]
    },
    {
      id: 'espectador_guia',
      type: 'checklist',
      text: 'Tu rol como espectador',
      subtitle: 'Ayudá sin ponerte en riesgo.',
      checklistItems: [
        'Señalizá la zona para evitar más choques',
        'Llamá al 107 (Emergencias)',
        'No muevas a los heridos',
        'Ofrecete como testigo si es necesario'
      ],
      nextStep: 'resumen_final'
    },
    {
      id: 'seguridad_inmediata',
      type: 'checklist',
      text: 'Seguridad Inmediata',
      subtitle: 'Paso 1: Ley 24.449',
      checklistItems: [
        'Detenerse por completo (es obligatorio)',
        'Encender balizas',
        'Colocar triángulos (a 30m y 150m en ruta)',
        'Verificar si hay heridos'
      ],
      nextStep: 'hay_heridos'
    },
    {
      id: 'hay_heridos',
      type: 'question',
      text: '¿Hay personas heridas?',
      options: [
        { label: 'Sí, llamar al 107', action: 'CALL_107', style: 'danger' },
        { label: 'No hay heridos', nextStep: 'intercambio_doc' },
        { label: 'No estoy seguro', action: 'CALL_107', style: 'default' }
      ]
    },
    {
      id: 'intercambio_doc',
      type: 'checklist',
      text: 'Intercambio de Documentos',
      subtitle: 'Pedí y brindá esta info (sacá fotos)',
      checklistItems: [
        'Seguro (Compañía y Póliza)',
        'Licencia de conducir (Frente y Dorso)',
        'Cédula Verde o Azul',
        'DNI y Teléfono de contacto'
      ],
      nextStep: 'registro_evidencia'
    },
    {
      id: 'registro_evidencia',
      type: 'camera',
      text: 'Fotos de la escena',
      subtitle: 'Antes de mover los autos, capturá:',
      checklistItems: [
        'Posición de los vehículos',
        'Daños de ambos autos',
        'Patente del otro vehículo',
        'Fotos de la calle / calzada'
      ],
      nextStep: 'datos_otro'
    },
    {
      id: 'datos_otro',
      type: 'form',
      text: 'Datos del tercero',
      fields: [
        { id: 'nombre', label: 'Nombre del conductor', type: 'text' },
        { id: 'patente', label: 'Patente del otro auto', type: 'text' },
        { id: 'seguro', label: 'Compañía de seguro', type: 'text' },
        { id: 'telefono', label: 'Teléfono de contacto', type: 'phone' }
      ],
      nextStep: 'situaciones_especiales'
    },
    {
      id: 'situaciones_especiales',
      type: 'question',
      text: '¿Sucedió algo de esto?',
      options: [
        { label: 'El otro conductor se fugó', nextStep: 'fuga_info' },
        { label: 'No tiene seguro', nextStep: 'no_seguro_info' },
        { label: 'Todo normal', nextStep: 'tramites_legales' }
      ]
    },
    {
      id: 'fuga_info',
      type: 'checklist',
      text: 'En caso de fuga',
      checklistItems: [
        'Anotá la patente si llegaste a verla',
        'Buscá cámaras en la zona',
        'Buscá testigos (pedí su teléfono)'
      ],
      nextStep: 'tramites_legales'
    },
    {
      id: 'no_seguro_info',
      type: 'checklist',
      text: 'Sin seguro',
      checklistItems: [
        'Tomá sus datos personales igual',
        'El reclamo deberá ser vía civil',
        'Consultá con un abogado'
      ],
      nextStep: 'tramites_legales'
    },
    {
      id: 'tramites_legales',
      type: 'checklist',
      text: 'Próximos pasos legales',
      subtitle: 'Paso 5: Trámites',
      checklistItems: [
        'Denuncia administrativa: Tenés 72hs hábiles para avisar a TU seguro',
        'Denuncia policial: Solo si hay heridos o robo',
        'Guardar fotos y datos recolectados'
      ],
      nextStep: 'resumen_final'
    },
    {
      id: 'resumen_final',
      type: 'summary',
      text: 'Reporte Finalizado',
      subtitle: 'Toda la información ha sido guardada localmente.'
    }
  ]
};
