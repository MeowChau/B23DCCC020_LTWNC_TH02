import { memo } from 'react';
import { act, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RoutineProvider, useRoutineDispatch, useRoutines } from './RoutineContext';

beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));

describe('Context giáo án', () => {
  it('khôi phục giáo án hợp lệ và bỏ qua bản ghi sai cấu trúc', () => {
    const valid = { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] };
    localStorage.setItem('workout-routines', JSON.stringify([valid, { id: 3 }, null]));
    const { result } = renderHook(() => useRoutines(), { wrapper: RoutineProvider });
    expect(result.current).toEqual([valid]);
  });

  it.each(['{JSON hỏng', '{}'])('dữ liệu lưu "%s" không làm trang bị lỗi', (data) => {
    localStorage.setItem('workout-routines', data);
    const { result } = renderHook(() => useRoutines(), { wrapper: RoutineProvider });
    expect(result.current).toEqual([]);
  });

  it('dispatch consumer không render lại khi danh sách đổi và dữ liệu được lưu', async () => {
    let renders = 0;
    const DispatchOnly = memo(function DispatchOnly() {
      renders++;
      const dispatch = useRoutineDispatch();
      return <button onClick={() => dispatch({ type: 'create', payload: { id: 'r1', name: 'Ngày ngực' } })}>Thêm</button>;
    });
    function StateOnly() { const routines = useRoutines(); return <p>{routines.length} giáo án</p>; }
    const user = userEvent.setup();
    renderWithProviders(<><DispatchOnly /><StateOnly /></>);
    await user.click(screen.getByRole('button', { name: 'Thêm' }));
    expect(screen.getByText('1 giáo án')).toBeInTheDocument();
    expect(renders).toBe(1);
    expect(JSON.parse(localStorage.getItem('workout-routines')!)).toEqual([{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }]);
  });

  it('báo lỗi rõ nếu hook được dùng ngoài Provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useRoutines())).toThrow('useRoutines phải được dùng bên trong RoutineProvider.');
    expect(() => renderHook(() => useRoutineDispatch())).toThrow('useRoutineDispatch phải được dùng bên trong RoutineProvider.');
  });

  it('vẫn cập nhật trong bộ nhớ khi trình duyệt không ghi được localStorage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Đã đầy', 'QuotaExceededError'); });
    const { result } = renderHook(() => ({ routines: useRoutines(), dispatch: useRoutineDispatch() }), { wrapper: RoutineProvider });
    act(() => result.current.dispatch({ type: 'create', payload: { id: 'r1', name: 'Buổi mới' } }));
    expect(result.current.routines[0].name).toBe('Buổi mới');
  });
});
