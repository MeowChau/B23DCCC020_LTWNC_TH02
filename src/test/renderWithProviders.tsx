import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RoutineProvider } from '../features/routines/RoutineContext';
import { useSavedStore } from '../features/saved/useSavedStore';
import { useSessionStore } from '../features/session/useSessionStore';
import type { Routine } from '../types';

interface ProviderOptions {
  route?: string;
  routines?: Routine[];
}

export function renderWithProviders(ui: ReactNode, { route = '/', routines }: ProviderOptions = {}) {
  if (routines) localStorage.setItem('workout-routines', JSON.stringify(routines));
  return render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RoutineProvider>{ui}</RoutineProvider>
    </MemoryRouter>,
  );
}

export function resetWorkoutStores() {
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0,
    restDuration: 0, isResting: false, restRemaining: 0 });
  useSavedStore.setState({ ids: [] });
}
