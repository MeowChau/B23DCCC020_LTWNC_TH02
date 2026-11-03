import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import RoutinesPage from './RoutinesPage';

beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));

describe('Trang giáo án', () => {
  it('bấm Tạo khi ô trống hiển thị lỗi tên giáo án không được để trống', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án không được để trống');
    expect(screen.getByLabelText('Tên giáo án')).toHaveAttribute('aria-invalid', 'true');
  });

  it('nhập tên và bấm Tạo thì tên xuất hiện trong danh sách, ô nhập được xóa', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);
    await user.type(screen.getByLabelText('Tên giáo án'), 'Ngày ngực');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('heading', { name: 'Ngày ngực' })).toBeInTheDocument();
    expect(screen.getByText('0 bài')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên giáo án')).toHaveValue('');
  });

  it('tên chỉ khác hoa thường bị từ chối ngay sau khi tạo giáo án đầu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);
    await user.type(screen.getByLabelText('Tên giáo án'), 'Ngày ngực');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    await user.type(screen.getByLabelText('Tên giáo án'), 'ngày NGỰC');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án đã tồn tại');
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('bấm Xóa bỏ giáo án và đưa danh sách về trạng thái rỗng', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />, { routines: [{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }] });
    expect(screen.getByRole('link', { name: 'Ngày ngực' })).toHaveAttribute('href', '/routines/r1');
    await user.click(screen.getByRole('button', { name: 'Xóa giáo án Ngày ngực' }));
    expect(screen.getByRole('heading', { name: 'Bạn chưa có giáo án nào' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('workout-routines')!)).toEqual([]);
  });
});
