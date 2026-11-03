import { createContext, useContext, useEffect, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { Routine } from '../../types';
import { routineReducer } from './routineReducer';
import type { RoutineAction } from './routineReducer';
import { withLogger } from './withLogger';

export const RoutineStateContext = createContext<Routine[] | undefined>(undefined);
export const RoutineDispatchContext = createContext<Dispatch<RoutineAction> | undefined>(undefined);

function isRoutine(value: unknown): value is Routine {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'name' in value && typeof value.name === 'string'
    && 'exerciseIds' in value && Array.isArray(value.exerciseIds)
    && value.exerciseIds.every((id: unknown) => typeof id === 'string');
}

function loadRoutines(): Routine[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem('workout-routines') ?? '[]');
    return Array.isArray(data) ? data.filter(isRoutine) : [];
  } catch {
    return [];
  }
}

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [routines, dispatch] = useReducer(withLogger(routineReducer), [], loadRoutines);

  useEffect(() => {
    try {
      localStorage.setItem('workout-routines', JSON.stringify(routines));
    } catch {
      // Vẫn cho phép dùng giáo án trong phiên nếu trình duyệt chặn localStorage.
    }
  }, [routines]);

  // State giữ nguyên tham chiếu khi reducer không đổi; dispatch do React giữ ổn định.
  return (
    <RoutineStateContext.Provider value={routines}>
      <RoutineDispatchContext.Provider value={dispatch}>{children}</RoutineDispatchContext.Provider>
    </RoutineStateContext.Provider>
  );
}

export function useRoutines(): Routine[] {
  const value = useContext(RoutineStateContext);
  if (value === undefined) throw new Error('useRoutines phải được dùng bên trong RoutineProvider.');
  return value;
}

export function useRoutineDispatch(): Dispatch<RoutineAction> {
  const value = useContext(RoutineDispatchContext);
  if (value === undefined) throw new Error('useRoutineDispatch phải được dùng bên trong RoutineProvider.');
  return value;
}
