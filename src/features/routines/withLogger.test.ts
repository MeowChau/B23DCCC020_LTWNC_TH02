import { describe, expect, it, vi } from 'vitest';
import { withLogger } from './withLogger';

describe('Middleware ghi log', () => {
  it('ở DEV ghi tên action, state trước/sau và trả đúng kết quả reducer', () => {
    vi.stubEnv('DEV', true);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const before = { count: 0 };
    const after = { count: 1 };
    const reducer = vi.fn(() => after);
    const action = { type: 'tăng' };
    expect(withLogger(reducer)(before, action)).toBe(after);
    expect(reducer).toHaveBeenCalledExactlyOnceWith(before, action);
    expect(log).toHaveBeenCalledExactlyOnceWith('[routines] tăng', { stateBefore: before, stateAfter: after });
  });

  it('ở production không ghi log và vẫn cập nhật state', () => {
    vi.stubEnv('DEV', false);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const reducer = (state: number, action: { type: string }) => action.type === 'tăng' ? state + 1 : state;
    expect(withLogger(reducer)(0, { type: 'tăng' })).toBe(1);
    expect(log).not.toHaveBeenCalled();
  });
});
