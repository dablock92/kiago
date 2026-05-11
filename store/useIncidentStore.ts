import { create } from 'zustand';

export interface InvolvedParty {
  id: string;
  name?: string;
  surname?: string;
  phone?: string;
  dni?: string;
  // Campos del Vehículo y Seguro
  plate?: string;
  insuranceCompany?: string;
  policyNumber?: string;
  ownerName?: string;
  insuranceValidity?: string;
  
  photos: {
    insurance?: string;
    license?: string;
    car?: string;
    dniFront?: string;
    dniBack?: string;
    damage?: string[]; // Array para múltiples fotos del daño
  };
  useDniPhoto?: boolean;
  unavailableFields?: string[]; // IDs de campos obligatorios que no se pudieron obtener
  missingDataReason?: string; // Explicación de por qué faltan datos
}

interface Incident {
  id: string;
  type: string;
  responses: Record<string, any>;
  involvedParties: InvolvedParty[];
  createdAt: string;
}

interface IncidentState {
  currentIncident: Incident | null;
  startIncident: (type: string) => void;
  updateResponse: (stepId: string, response: any) => void;
  addInvolvedParty: () => string;
  updateInvolvedParty: (partyId: string, update: Partial<InvolvedParty>) => void;
  removeInvolvedParty: (partyId: string) => void;
  completeIncident: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  currentIncident: null,
  
  completeIncident: () => set({ currentIncident: null }),

  startIncident: (type) => set({
    currentIncident: {
      id: Math.random().toString(36).substr(2, 9),
      type,
      responses: {},
      involvedParties: [],
      createdAt: new Date().toISOString(),
    }
  }),

  updateResponse: (stepId, response) => set((state) => ({
    currentIncident: state.currentIncident ? {
      ...state.currentIncident,
      responses: {
        ...state.currentIncident.responses,
        [stepId]: response,
      },
    } : null,
  })),

  addInvolvedParty: () => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      currentIncident: state.currentIncident ? {
        ...state.currentIncident,
        involvedParties: [
          ...state.currentIncident.involvedParties,
          { 
            id, 
            photos: { damage: [] } 
          },
        ],
      } : null,
    }));
    return id;
  },

  updateInvolvedParty: (partyId, update) => set((state) => ({
    currentIncident: state.currentIncident ? {
      ...state.currentIncident,
      involvedParties: state.currentIncident.involvedParties.map((p) =>
        p.id === partyId ? { ...p, ...update } : p
      ),
    } : null,
  })),

  removeInvolvedParty: (partyId) => set((state) => ({
    currentIncident: state.currentIncident ? {
      ...state.currentIncident,
      involvedParties: state.currentIncident.involvedParties.filter((p) => p.id !== partyId),
    } : null,
  })),
}));
