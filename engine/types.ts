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
  type: "text" | "photo" | "info" | "multiple" | "section" | "camera";
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

export interface IncidentResponse {
  stepId: string;
  value: any;
  timestamp: number;
}

export interface Incident {
  id: string;
  flowId: string;
  status: "in_progress" | "completed";
  responses: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}
