import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../data/exercises';
import { useSessionStore } from '../features/session/useSessionStore';
import { resetWorkoutStores } from '../test/renderWithProviders';
import { useSessionKeyboardShortcut } from './useSessionKeyboardShortcut';

beforeEach(() => { resetWorkoutStores(); useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0); });

function ShortcutFixture() {
  useSessionKeyboardShortcut();
  return <><input aria-label="Tìm bài" /><textarea aria-label="Ghi chú" /><select aria-label="Bộ lọc"><option>Tất cả</option></select>
    <div contentEditable suppressContentEditableWarning data-testid="editor"><span>Nội dung sửa được</span></div>
    <button type="button">Nút khác</button><a href="#">Liên kết</a></>;
}
const space = { code: 'Space', key: ' ', bubbles: true, cancelable: true };

describe('Phím tắt Space', () => {
  it('tạm dừng và tiếp tục buổi tập, đồng thời ngăn cuộn trang', () => {
    renderHook(() => useSessionKeyboardShortcut());
    const event = new KeyboardEvent('keydown', space);
    window.dispatchEvent(event);
    expect(useSessionStore.getState().isRunning).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    fireEvent.keyDown(window, space);
    expect(useSessionStore.getState().isRunning).toBe(true);
  });

  it('bỏ qua input, textarea, select, contenteditable và các nút/link', () => {
    render(<ShortcutFixture />);
    for (const target of [screen.getByLabelText('Tìm bài'), screen.getByLabelText('Ghi chú'), screen.getByLabelText('Bộ lọc'),
      screen.getByText('Nội dung sửa được'), screen.getByRole('button'), screen.getByRole('link')]) {
      fireEvent.keyDown(target, space);
      expect(useSessionStore.getState().isRunning).toBe(true);
    }
  });

  it('bỏ qua phím lặp, phím khác, tổ hợp phím và sự kiện đã được xử lý', () => {
    renderHook(() => useSessionKeyboardShortcut());
    fireEvent.keyDown(window, { ...space, repeat: true });
    fireEvent.keyDown(window, { code: 'Enter', key: 'Enter' });
    fireEvent.keyDown(window, { ...space, ctrlKey: true });
    fireEvent.keyDown(window, { ...space, isComposing: true });
    const event = new KeyboardEvent('keydown', space);
    event.preventDefault();
    window.dispatchEvent(event);
    expect(useSessionStore.getState().isRunning).toBe(true);
  });

  it('removeEventListener dùng đúng handler khi unmount và không còn điều khiển store', () => {
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');
    const view = renderHook(() => useSessionKeyboardShortcut());
    const handler = added.mock.calls.find(([type]) => type === 'keydown')?.[1];
    view.unmount();
    expect(removed).toHaveBeenCalledWith('keydown', handler);
    fireEvent.keyDown(window, space);
    expect(useSessionStore.getState().isRunning).toBe(true);
  });
});
