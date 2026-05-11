import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Incident } from '../engine/types';

interface IncidentState {
  currentIncident: Incident | null;
  history: Incident[];
  startIncident: (flowId: string) => void;
  updateResponse: (stepId: string, value: any) => void;
  completeIncident: () => void;
  clearCurrent: () => void;
}

export const useIncidentStore = create<IncidentState>()(
  persist(
    (set) => ({
      currentIncident: null,
      history: [],

      startIncident: (flowId) => {
        const newIncident: Incident = {
          id: Math.random().toString(36).substring(7),
          flowId,
          status: 'in_progress',
          responses: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ currentIncident: newIncident });
      },

      updateResponse: (stepId, value) => {
        set((state) => {
          if (!state.currentIncident) return state;
          return {
            currentIncident: {
              ...state.currentIncident,
              responses: {
                ...state.currentIncident.responses,
                [stepId]: value,
              },
              updatedAt: Date.now(),
            },
          };
        });
      },

      completeIncident: () => {
        set((state) => {
          if (!state.currentIncident) return state;
          const completedIncident: Incident = {
            ...state.currentIncident,
            status: 'completed',
            updatedAt: Date.now(),
          };
          return {
            currentIncident: null,
            history: [completedIncident, ...state.history],
          };
        });
      },

      clearCurrent: () => set({ currentIncident: null }),
    }),
    {
      name: 'incident-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
