import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetWorkoutStores } from '../../test/renderWithProviders';
import type { Routine } from '../../types';
import { useSessionStore } from '../session/useSessionStore';
import RoutineDetailPage from './RoutineDetailPage';

const routines: Routine[] = [
  { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] },
  { id: 'r2', name: 'Ngày chân', exerciseIds: [] },
];
function renderDetail(id = 'r1') {
  return renderWithProviders(<Routes><Route path="/routines/:id" element={<RoutineDetailPage />} /></Routes>, { route: `/routines/${id}`, routines });
}
beforeEach(() => { resetWorkoutStores(); vi.spyOn(console, 'log').mockImplementation(() => {}); });

describe('Chi tiết giáo án', () => {
  it('khôi phục bài đã lưu, tính 1 phút 37 giây và bắt đầu đúng queue', async () => {
    const user = userEvent.setup();
    renderDetail();
    expect(screen.getByText('Tổng thời gian: 1 phút 37 giây')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tập tất cả' }));
    expect(useSessionStore.getState().queue.map((exercise) => exercise.id)).toEqual(['e1', 'e2']);
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, elapsed: 0, isRunning: true });
    await user.click(screen.getByRole('button', { name: 'Bỏ Kéo tạ đơn 1' }));
    expect(screen.getByText('Tổng thời gian: 0 phút 30 giây')).toBeInTheDocument();
    expect(useSessionStore.getState().queue).toHaveLength(2);
  });

  it('đổi tên chặn tên trống/trùng và lưu tên hợp lệ', async () => {
    const user = userEvent.setup();
    renderDetail();
    const field = screen.getByLabelText('Tên giáo án mới');
    await user.clear(field);
    await user.click(screen.getByRole('button', { name: 'Đổi tên' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án không được để trống');
    await user.type(field, 'ngày CHÂN');
    await user.click(screen.getByRole('button', { name: 'Đổi tên' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án đã tồn tại');
    await user.clear(field);
    await user.type(field, 'Ngực nâng cao');
    await user.click(screen.getByRole('button', { name: 'Đổi tên' }));
    expect(screen.getByRole('heading', { name: 'Ngực nâng cao' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('workout-routines')!)[0].name).toBe('Ngực nâng cao');
  });

  it('giáo án rỗng có tổng bằng 0 và khóa Tập tất cả', () => {
    renderDetail('r2');
    expect(screen.getByText('Giáo án chưa có bài tập')).toBeInTheDocument();
    expect(screen.getByText('Tổng thời gian: 0 phút 0 giây')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tập tất cả' })).toBeDisabled();
  });

  it('ID không tồn tại hiển thị thông báo và link quay lại', () => {
    renderDetail('không-tồn-tại');
    expect(screen.getByRole('heading', { name: 'Không tìm thấy giáo án' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quay lại danh sách/ })).toHaveAttribute('href', '/routines');
  });
});
