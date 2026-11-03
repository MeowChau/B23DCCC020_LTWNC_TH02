import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Exercise } from '../../types';

export const DEFAULT_REST_DURATION = 10;

export interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  restDuration: number;
  isResting: boolean;
  restRemaining: number;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>()(devtools((set, get) => ({
  queue: [],
  currentIndex: -1,
  isRunning: false,
  elapsed: 0,
  restDuration: DEFAULT_REST_DURATION,
  isResting: false,
  restRemaining: 0,

  startSession: (exercises, startIndex) => {
    if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= exercises.length) return;
    set({ queue: [...exercises], currentIndex: startIndex, isRunning: true, elapsed: 0,
      isResting: false, restRemaining: 0 }, false, 'session/startSession');
  },

  toggleRun: () => {
    const { queue, currentIndex, isRunning, elapsed, isResting } = get();
    if (queue.length === 0) return;
    if (currentIndex === -1) {
      set({ currentIndex: 0, isRunning: true, elapsed: 0, isResting: false, restRemaining: 0 }, false, 'session/startQueued');
      return;
    }
    const current = queue[currentIndex];
    if (!current) return;
    set({ isRunning: !isRunning, elapsed: !isResting && elapsed >= current.duration ? 0 : elapsed }, false, 'session/toggleRun');
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    if (currentIndex >= queue.length - 1) {
      set({ isRunning: false, isResting: false, restRemaining: 0 }, false, 'session/finish');
      return;
    }
    set({ currentIndex: currentIndex + 1, elapsed: 0, isResting: false, restRemaining: 0 }, false, 'session/next');
  },

  prev: () => {
    const { currentIndex, elapsed } = get();
    if (currentIndex === -1) return;
    if (elapsed > 3) {
      set({ elapsed: 0, isResting: false, restRemaining: 0 }, false, 'session/restartExercise');
      return;
    }
    set({ currentIndex: Math.max(0, currentIndex - 1), elapsed: 0, isResting: false, restRemaining: 0 }, false, 'session/prev');
  },

  addToSession: (exercise) => {
    set((state) => state.queue.some((item) => item.id === exercise.id)
      ? state
      : { queue: [...state.queue, exercise] }, false, 'session/addToSession');
  },

  tick: () => {
    const { queue, currentIndex, isRunning, elapsed, isResting, restRemaining, restDuration } = get();
    const current = queue[currentIndex];
    if (!isRunning || !current) return;
    if (isResting) {
      if (restRemaining <= 1) get().next();
      else set({ restRemaining: restRemaining - 1 }, false, 'session/tickRest');
      return;
    }
    const nextElapsed = Math.min(elapsed + 1, current.duration);
    if (nextElapsed >= current.duration && currentIndex < queue.length - 1 && restDuration > 0) {
      set({ elapsed: current.duration, isResting: true, restRemaining: restDuration }, false, 'session/startRest');
      return;
    }
    set({ elapsed: nextElapsed }, false, 'session/tick');
    if (nextElapsed >= current.duration) get().next();
  },
}), { name: 'Workout Session', enabled: import.meta.env.DEV, anonymousActionType: 'session/setState' }));
