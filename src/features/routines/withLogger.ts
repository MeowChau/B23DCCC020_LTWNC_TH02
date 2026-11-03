export function withLogger<State, Action extends { type: string }>(
  reducer: (state: State, action: Action) => State,
): (state: State, action: Action) => State {
  return (state, action) => {
    const nextState = reducer(state, action);
    if (import.meta.env.DEV) {
      console.log(`[routines] ${action.type}`, { stateBefore: state, stateAfter: nextState });
    }
    return nextState;
  };
}
