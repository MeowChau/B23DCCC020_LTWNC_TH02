import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';

beforeEach(() => vi.resetModules());

function installDevtools() {
  const connection = { init: vi.fn(), send: vi.fn(), subscribe: vi.fn(() => vi.fn()), unsubscribe: vi.fn() };
  const extension = { connect: vi.fn(() => connection) };
  vi.stubGlobal('__REDUX_DEVTOOLS_EXTENSION__', extension);
  return { connection, extension };
}

describe('Tích hợp Redux DevTools bằng middleware Zustand', () => {
  it('store buổi tập kết nối và gửi action có tên cùng state mới', async () => {
    vi.stubEnv('DEV', true);
    const { connection, extension } = installDevtools();
    const { useSessionStore } = await import('./useSessionStore');
    expect(extension.connect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Workout Session' }));
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    useSessionStore.setState({ elapsed: 29 });
    useSessionStore.getState().tick();
    expect(connection.send).toHaveBeenCalledWith({ type: 'session/startSession' }, expect.objectContaining({ currentIndex: 0, isRunning: true }));
    expect(connection.send).toHaveBeenCalledWith({ type: 'session/startRest' }, expect.objectContaining({ isResting: true, restRemaining: 10 }));
    useSessionStore.devtools.cleanup();
    expect(connection.unsubscribe).toHaveBeenCalled();
  });

  it('store đã lưu vẫn persist đúng khi được bọc devtools', async () => {
    vi.stubEnv('DEV', true);
    const { connection, extension } = installDevtools();
    const { useSavedStore } = await import('../saved/useSavedStore');
    useSavedStore.getState().toggle('e1');
    expect(extension.connect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Workout Saved' }));
    expect(connection.send).toHaveBeenCalledWith({ type: 'saved/toggle' }, expect.objectContaining({ ids: ['e1'] }));
    expect(JSON.parse(localStorage.getItem('workout-saved')!).state.ids).toEqual(['e1']);
    useSavedStore.devtools.cleanup();
  });

  it('production không kết nối extension', async () => {
    vi.stubEnv('DEV', false);
    const { extension } = installDevtools();
    await import('./useSessionStore');
    expect(extension.connect).not.toHaveBeenCalled();
  });
});
