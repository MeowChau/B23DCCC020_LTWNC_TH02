import { create } from 'zustand';
import type { Exercise } from '../../types';

export interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  queue: [],
  currentIndex: -1,
  isRunning: false,
  elapsed: 0,

  startSession: (exercises, startIndex) => {
    if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= exercises.length) return;
    set({ queue: [...exercises], currentIndex: startIndex, isRunning: true, elapsed: 0 });
  },

  toggleRun: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    if (queue.length === 0) return;
    if (currentIndex === -1) {
      set({ currentIndex: 0, isRunning: true, elapsed: 0 });
      return;
    }
    const current = queue[currentIndex];
    if (!current) return;
    set({ isRunning: !isRunning, elapsed: elapsed >= current.duration ? 0 : elapsed });
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    if (currentIndex >= queue.length - 1) {
      set({ isRunning: false });
      return;
    }
    set({ currentIndex: currentIndex + 1, elapsed: 0 });
  },

  prev: () => {
    const { currentIndex, elapsed } = get();
    if (currentIndex === -1) return;
    if (elapsed > 3) {
      set({ elapsed: 0 });
      return;
    }
    set({ currentIndex: Math.max(0, currentIndex - 1), elapsed: 0 });
  },

  addToSession: (exercise) => {
    set((state) => state.queue.some((item) => item.id === exercise.id)
      ? state
      : { queue: [...state.queue, exercise] });
  },

  tick: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    const current = queue[currentIndex];
    if (!isRunning || !current) return;
    const nextElapsed = Math.min(elapsed + 1, current.duration);
    set({ elapsed: nextElapsed });
    if (nextElapsed >= current.duration) get().next();
  },
}));
