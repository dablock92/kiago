export type StepType =
  | "question"
  | "checklist"
  | "camera"
  | "form"
  | "audio"
  | "summary"
  | "emergency"
  | "action"
  | "location"
  | "involved_management"
  | "construction";

export interface Option {
  label: string;
  nextStep?: string;
  action?: string;
  style?: "default" | "danger" | "success";
}

export interface ChecklistItem {
  id: string;
  label: string;
  // "info": paso accionable (togglea ✓ al tocarlo).
  // "note": texto enunciativo (derechos, marcos legales) — no interactivo.
  type:
    | "text"
    | "photo"
    | "info"
    | "note"
    | "multiple"
    | "section"
    | "camera"
    | "date";
  action?: string;
  allowPhoto?: boolean;
  placeholder?: string;
  required?: boolean;
  fields?: Field[];
  completed?: boolean;
  hint?: string;
}

export interface Step {
  id: string;
  type: StepType;
  text: string;
  subtitle?: string;
  options?: Option[];
  required?: boolean;
  fields?: Field[];
  checklistItems?: (string | ChecklistItem)[]; // Support both simple and interactive
  nextStep?: string;
  // Muestra un botón para descargar/compartir el contenido del step como PDF
  // (útil para guías de derechos: Ley 25.065, derechos del pasajero, etc.).
  sharePdf?: boolean;
  // Step terminal de un flow-guía: el botón dice "Finalizar" y vuelve al
  // inicio SIN generar reporte (no todo problema genera un reporte).
  finish?: boolean;
}

export interface Field {
  id: string;
  label: string;
  type: "text" | "phone" | "number" | "date";
  placeholder?: string;
  hint?: string;
}

export interface Flow {
  id: string;
  title: string;
  icon: string;
  steps: Step[];
}

// NOTA: el tipo `Incident` real vive en store/useIncidentStore.ts
// (acá existía un duplicado muerto que fue eliminado — ver FABLE_BRIEF.md §7.3).
