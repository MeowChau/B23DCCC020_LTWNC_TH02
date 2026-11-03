import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import type { Exercise } from '../../types';
import ExerciseRow from './ExerciseRow';

const exercise = EXERCISES[0];

describe('Dòng bài tập', () => {
  it('hiển thị tên, huấn luyện viên, nhóm cơ và thời lượng 0:30', () => {
    render(<ExerciseRow exercise={exercise} index={0} />);
    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('Ngực')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('bấm Bắt đầu gọi hàm mock với đúng bài tập', async () => {
    const onStart = vi.fn<(exercise: Exercise) => void>();
    const user = userEvent.setup();
    render(<ExerciseRow exercise={exercise} index={0} onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    expect(onStart).toHaveBeenCalledExactlyOnceWith(exercise);
  });

  it('nút lưu, thêm buổi tập và thêm giáo án gửi đúng ID hoặc bài tập', async () => {
    const onToggleSaved = vi.fn<(id: string) => void>();
    const onAddToSession = vi.fn<(exercise: Exercise) => void>();
    const onAddToRoutine = vi.fn<(exercise: Exercise) => void>();
    const user = userEvent.setup();
    render(<ExerciseRow exercise={exercise} index={0} isSaved onToggleSaved={onToggleSaved}
      onAddToSession={onAddToSession} onAddToRoutine={onAddToRoutine} showRoutineAction />);
    expect(screen.getByRole('button', { name: 'Bỏ lưu' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Bỏ lưu' }));
    await user.click(screen.getByRole('button', { name: '+ Buổi tập' }));
    await user.click(screen.getByRole('button', { name: '+ Giáo án' }));
    expect(onToggleSaved).toHaveBeenCalledWith('e1');
    expect(onAddToSession).toHaveBeenCalledWith(exercise);
    expect(onAddToRoutine).toHaveBeenCalledWith(exercise);
  });

  it('khóa nút thêm giáo án khi chưa có giáo án để chọn', () => {
    render(<ExerciseRow exercise={exercise} index={0} showRoutineAction />);
    expect(screen.getByRole('button', { name: '+ Giáo án' })).toBeDisabled();
  });
});
