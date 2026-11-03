import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, resetWorkoutStores } from '../../test/renderWithProviders';
import { useSessionStore } from '../session/useSessionStore';
import { useSavedStore } from './useSavedStore';
import SavedPage from './SavedPage';

beforeEach(resetWorkoutStores);

describe('Trang bài tập đã lưu', () => {
  it('chưa có bài thì hiện thông báo và khóa Tập tất cả', () => {
    renderWithProviders(<SavedPage />);
    expect(screen.getByText('Bạn chưa lưu bài tập nào')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tập tất cả' })).toBeDisabled();
  });

  it('liệt kê đúng bài, thêm buổi tập, tập tất cả và bắt đầu từ một dòng', async () => {
    useSavedStore.setState({ ids: ['e1', 'e3'] });
    const user = userEvent.setup();
    renderWithProviders(<SavedPage />);
    const row = screen.getByText('Gập tạ đơn 1').closest<HTMLElement>('[role=row]')!;
    await user.click(within(row).getByRole('button', { name: '+ Buổi tập' }));
    expect(useSessionStore.getState().queue.map((exercise) => exercise.id)).toEqual(['e3']);
    await user.click(screen.getByRole('button', { name: 'Tập tất cả' }));
    expect(useSessionStore.getState().queue.map((exercise) => exercise.id)).toEqual(['e1', 'e3']);
    expect(useSessionStore.getState().currentIndex).toBe(0);
    await user.click(within(row).getByRole('button', { name: 'Bắt đầu' }));
    expect(useSessionStore.getState().currentIndex).toBe(1);
    await user.click(within(row).getByRole('button', { name: 'Bỏ lưu' }));
    expect(screen.queryByText('Gập tạ đơn 1')).not.toBeInTheDocument();
    expect(useSavedStore.getState().ids).toEqual(['e1']);
    expect(useSessionStore.getState().queue).toHaveLength(2);
  });
});
