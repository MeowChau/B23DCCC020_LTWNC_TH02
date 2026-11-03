import { act, fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { renderWithProviders, resetWorkoutStores } from '../../test/renderWithProviders';
import { useSavedStore } from '../saved/useSavedStore';
import { useSessionStore } from '../session/useSessionStore';
import LibraryPage from './LibraryPage';

beforeEach(() => {
  resetWorkoutStores();
  vi.useFakeTimers();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

function rowByName(name: string) {
  const row = screen.getByText(name).closest<HTMLElement>('[role=row]');
  if (!row) throw new Error('Không tìm thấy dòng bài tập');
  return within(row);
}
function search(keyword: string) {
  fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: keyword } });
  act(() => vi.advanceTimersByTime(300));
}

describe('Kho bài tập', () => {
  it('ảo hóa 10.000 bài, debounce 300ms và lọc đúng tên, HLV, nhóm cơ', () => {
    const view = renderWithProviders(<LibraryPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 10000 bài tập');
    expect(view.container.querySelectorAll('.exercise-row').length).toBeLessThanOrEqual(15);
    expect(screen.getByLabelText('Giáo án đang chọn')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value: 'ĐẨY' } });
    act(() => vi.advanceTimersByTime(299));
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 10000 bài tập');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 1250 bài tập');
    fireEvent.change(screen.getByLabelText('Nhóm cơ'), { target: { value: 'Vai' } });
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 250 bài tập');
    fireEvent.change(screen.getByLabelText('Nhóm cơ'), { target: { value: 'all' } });
    search('đức anh');
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 1000 bài tập');
  });

  it('sắp xếp theo tên/thời lượng, hiển thị rỗng và đặt lại được bộ lọc', () => {
    renderWithProviders(<LibraryPage />);
    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'name' } });
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Bật chậm 1');
    expect(EXERCISES[0].name).toBe('Đẩy tạ đơn 1');
    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'duration' } });
    expect(screen.getAllByRole('row')[1].querySelector('.duration')).toHaveTextContent('0:30');
    search('xyz');
    expect(screen.getByText('Không tìm thấy bài tập nào')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Đặt lại bộ lọc/ })[0]);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('status')).toHaveTextContent('Tìm thấy 10000 bài tập');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Đẩy tạ đơn 1');
  });

  it('các nút dùng đúng bài và Bắt đầu giữ đúng thứ tự kết quả đã lọc/sắp xếp', () => {
    renderWithProviders(<LibraryPage />, { routines: [
      { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      { id: 'r2', name: 'Ngày chân', exerciseIds: [] },
    ] });
    const first = rowByName('Đẩy tạ đơn 1');
    fireEvent.click(first.getByRole('button', { name: '+ Buổi tập' }));
    fireEvent.click(first.getByRole('button', { name: '+ Buổi tập' }));
    expect(useSessionStore.getState().queue.map((exercise) => exercise.id)).toEqual(['e1']);
    fireEvent.click(first.getByRole('button', { name: 'Lưu bài tập' }));
    expect(useSavedStore.getState().ids).toEqual(['e1']);
    expect(first.getByRole('button', { name: 'Bỏ lưu' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByLabelText('Giáo án đang chọn'), { target: { value: 'r2' } });
    fireEvent.click(first.getByRole('button', { name: '+ Giáo án' }));
    fireEvent.click(first.getByRole('button', { name: '+ Giáo án' }));
    expect(JSON.parse(localStorage.getItem('workout-routines')!)[1].exerciseIds).toEqual(['e1']);
    search('đẩy');
    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'duration' } });
    const rows = screen.getAllByRole('row').slice(1);
    const ids = rows.map((row) => row.dataset.exerciseId);
    fireEvent.click(within(rows[0]).getByRole('button', { name: 'Bắt đầu' }));
    expect(useSessionStore.getState().queue).toHaveLength(1250);
    expect(useSessionStore.getState().queue.slice(0, ids.length).map((exercise) => exercise.id)).toEqual(ids);
    search('xyz');
    expect(useSessionStore.getState().queue).toHaveLength(1250);
  });
});
