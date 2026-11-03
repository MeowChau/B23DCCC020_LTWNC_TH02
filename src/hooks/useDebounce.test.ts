import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

beforeEach(() => vi.useFakeTimers());

describe('Hook debounce', () => {
  it('giữ giá trị cũ trước 300ms và trả giá trị mới sau đúng 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'cũ' } });
    rerender({ value: 'mới' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('cũ');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('mới');
  });

  it('hủy lần chờ trước khi người dùng tiếp tục gõ', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: '' } });
    rerender({ value: 'đ' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'đẩy' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('đẩy');
  });

  it('hỗ trợ kiểu generic và dọn timeout khi unmount', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 1 } });
    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(2);
    rerender({ value: 3 });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
