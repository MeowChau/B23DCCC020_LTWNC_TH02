import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('Giao diện sáng và tối', () => {
  it('đổi sáng/tối và khôi phục lựa chọn khi Provider được khởi tạo lại', async () => {
    const user = userEvent.setup();
    const view = render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    await user.click(screen.getByRole('button', { name: 'Giao diện tối' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('workout-theme')).toBe('dark');
    view.unmount();
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'Giao diện sáng' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Giao diện sáng' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('dùng hook ngoài ThemeProvider báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow('useTheme phải được dùng bên trong ThemeProvider.');
  });
});
