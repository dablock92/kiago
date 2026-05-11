import { Flow } from '../../engine/types';

export const choqueFlow: Flow = {
  id: 'choque',
  title: 'Choqué',
  icon: 'car',
  steps: [
    {
      id: 'bienestar',
      type: 'question',
      text: '¿Estás bien?',
      subtitle: 'Primero lo importante.',
      options: [
        { label: 'Sí, estoy bien', nextStep: 'heridos' },
        { label: 'Necesito ayuda médica', action: 'CALL_EMERGENCY', style: 'danger' }
      ]
    },
    {
      id: 'heridos',
      type: 'question',
      text: '¿Hay otros heridos?',
      options: [
        { label: 'No, nadie herido', nextStep: 'seguridad' },
        { label: 'Sí / No estoy seguro', action: 'CALL_EMERGENCY', style: 'danger' }
      ]
    },
    {
      id: 'seguridad',
      type: 'checklist',
      text: 'Medidas de seguridad',
      checklistItems: [
        'Poner balizas / luces de emergencia',
        'Ponerse el chaleco reflectante',
        'Colocar triángulos de seguridad',
        'Alejarse del tráfico'
      ],
      nextStep: 'fotos_escena'
    },
    {
      id: 'fotos_escena',
      type: 'camera',
      text: 'Fotos de la escena',
      subtitle: 'Sacá fotos de ambos autos y la calle antes de moverlos.',
      required: true,
      nextStep: 'datos_tercero'
    },
    {
      id: 'datos_tercero',
      type: 'form',
      text: 'Datos del otro conductor',
      fields: [
        { id: 'nombre', label: 'Nombre Completo', type: 'text' },
        { id: 'telefono', label: 'Teléfono', type: 'phone' },
        { id: 'patente', label: 'Patente / Placa', type: 'text' },
        { id: 'seguro', label: 'Compañía de Seguro', type: 'text' }
      ],
      nextStep: 'resumen'
    },
    {
      id: 'resumen',
      type: 'summary',
      text: 'Resumen del incidente'
    }
  ]
};
