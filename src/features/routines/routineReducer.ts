import type { Routine } from '../../types';

export type RoutineAction =
  | { type: 'create'; payload: { id: string; name: string } }
  | { type: 'rename'; payload: { id: string; name: string } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'addExercise'; payload: { routineId: string; exerciseId: string } }
  | { type: 'removeExercise'; payload: { routineId: string; exerciseId: string } };

export type RoutineNameError = 'Tên giáo án không được để trống' | 'Tên giáo án đã tồn tại';

export function getRoutineNameError(name: string, routines: Routine[], ignoreId?: string): RoutineNameError | undefined {
  const normalized = name.trim().toLocaleLowerCase('vi');
  if (!normalized) return 'Tên giáo án không được để trống';
  if (routines.some((routine) => routine.id !== ignoreId && routine.name.toLocaleLowerCase('vi') === normalized)) {
    return 'Tên giáo án đã tồn tại';
  }
  return undefined;
}

export function routineReducer(state: Routine[], action: RoutineAction): Routine[] {
  switch (action.type) {
    case 'create': {
      const { id, name } = action.payload;
      if (!id || state.some((routine) => routine.id === id) || getRoutineNameError(name, state)) return state;
      return [...state, { id, name: name.trim(), exerciseIds: [] }];
    }
    case 'rename': {
      const { id, name } = action.payload;
      const routine = state.find((item) => item.id === id);
      if (!routine || routine.name === name.trim() || getRoutineNameError(name, state, id)) return state;
      return state.map((item) => item.id === id ? { ...item, name: name.trim() } : item);
    }
    case 'remove': {
      if (!state.some((routine) => routine.id === action.payload.id)) return state;
      return state.filter((routine) => routine.id !== action.payload.id);
    }
    case 'addExercise': {
      const { routineId, exerciseId } = action.payload;
      const routine = state.find((item) => item.id === routineId);
      if (!routine || !exerciseId || routine.exerciseIds.includes(exerciseId)) return state;
      return state.map((item) => item.id === routineId
        ? { ...item, exerciseIds: [...item.exerciseIds, exerciseId] }
        : item);
    }
    case 'removeExercise': {
      const { routineId, exerciseId } = action.payload;
      const routine = state.find((item) => item.id === routineId);
      if (!routine || !routine.exerciseIds.includes(exerciseId)) return state;
      return state.map((item) => item.id === routineId
        ? { ...item, exerciseIds: item.exerciseIds.filter((id) => id !== exerciseId) }
        : item);
    }
  }
}
