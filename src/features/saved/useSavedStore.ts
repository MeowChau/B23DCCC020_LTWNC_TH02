import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export interface SavedState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useSavedStore = create<SavedState>()(
  devtools(persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((state) => ({
        ids: state.ids.includes(id)
          ? state.ids.filter((savedId) => savedId !== id)
          : [...state.ids, id],
      }), false, 'saved/toggle'),
    }),
    {
      name: 'workout-saved',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ ids: state.ids }),
    },
  ), { name: 'Workout Saved', enabled: import.meta.env.DEV, anonymousActionType: 'saved/setState' }),
);
