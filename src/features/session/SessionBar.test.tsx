import { Profiler, StrictMode } from 'react';
import type { ComponentProps } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExerciseRowProps } from '../library/ExerciseRow';
import { EXERCISES } from '../../data/exercises';
import LibraryPage from '../library/LibraryPage';
import SessionBar from './SessionBar';
import { useSessionStore } from './useSessionStore';
import { useSavedStore } from '../saved/useSavedStore';
import { RoutineProvider } from '../routines/RoutineContext';

const probes = vi.hoisted(() => ({ library: 0, controls: 0, rows: [] as string[] }));
vi.mock('../../components/Icon', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../components/Icon')>();
  return { ...actual, Icon: (props: ComponentProps<typeof actual.Icon>) => {
    if (['previous', 'next', 'play', 'pause'].includes(props.name)) probes.controls++;
    return <actual.Icon {...props} />;
  } };
});
vi.mock('../library/ExerciseRow', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../library/ExerciseRow')>();
  return { ...actual, default: (props: ExerciseRowProps) => {
    probes.rows.push(props.exercise.id);
    return <actual.default {...props} />;
  } };
});

beforeEach(() => {
  vi.useFakeTimers();
  useSessionStore.setState({ queue: [], currentIndex: -1, elapsed: 0, isRunning: false,
    restDuration: 0, isResting: false, restRemaining: 0 });
  useSavedStore.setState({ ids: [] });
  probes.library = 0;
  probes.controls = 0;
  probes.rows = [];
});


describe('Kiểm tra hồi quy Phần 2 tại máy phát triển', () => {
  it('hiển thị đếm nghỉ, tạm dừng trong lúc nghỉ và chỉ sang bài sau khi hết nghỉ', () => {
    useSessionStore.setState({ restDuration: 10 });
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    render(<SessionBar />);
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('NGHỈ GIỮA BÀI')).toBeInTheDocument();
    expect(screen.getByText('0:10')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Tiến trình nghỉ' })).toHaveAttribute('aria-valuenow', '0');
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('0:10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    act(() => vi.advanceTimersByTime(9000));
    expect(screen.getByText('0:01')).toBeInTheDocument();
    expect(useSessionStore.getState().currentIndex).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('NGHỈ GIỮA BÀI')).not.toBeInTheDocument();
    expect(screen.getByText('1:07')).toBeInTheDocument();
    expect(useSessionStore.getState().currentIndex).toBe(1);
  });

  it('chưa có buổi tập hiển thị 0:00 và khóa các nút điều khiển', () => {
    render(<SessionBar />);
    expect(screen.getByText('Chưa bắt đầu buổi tập')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bắt đầu' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sau' })).toBeDisabled();
  });

  it('các nút Trước, Sau, Tạm dừng và Bắt đầu điều khiển đúng buổi tập', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 3), 0);
    render(<SessionBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Kéo tạ đơn 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Trước' }));
    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(useSessionStore.getState().elapsed).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('0:29')).toBeInTheDocument();
  });

  it('tự chuyển bài khi hết giờ và kết thúc ở 0:00, tiến trình 100%', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    render(<SessionBar />);
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('Kéo tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('1:07')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(67000));
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(useSessionStore.getState().isRunning).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('chỉ đồng hồ cập nhật mỗi giây; kho, các dòng và nút điều khiển không render lại', () => {
    const view = render(
      <StrictMode>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RoutineProvider>
          <Profiler id="library" onRender={() => probes.library++}><LibraryPage /></Profiler>
          </RoutineProvider>
        </MemoryRouter>
        <SessionBar />
      </StrictMode>,
    );
    // Chờ debounce/scroll-reset lúc mount hoàn tất trước khi đo cập nhật theo giây.
    act(() => vi.advanceTimersByTime(300));
    act(() => useSessionStore.getState().startSession(EXERCISES, 1));
    probes.library = 0; probes.controls = 0; probes.rows = [];
    for (let second = 0; second < 5; second++) act(() => vi.advanceTimersByTime(1000));
    expect(useSessionStore.getState().elapsed).toBe(5);
    expect(screen.getByText('1:02')).toBeInTheDocument();
    expect(probes.library).toBe(0);
    expect(probes.controls).toBe(0);
    expect(probes.rows).toEqual([]);
    useSessionStore.setState({ restDuration: 10, elapsed: EXERCISES[1].duration - 1 });
    act(() => vi.advanceTimersByTime(1000));
    expect(useSessionStore.getState().isResting).toBe(true);
    probes.library = 0; probes.controls = 0; probes.rows = [];
    for (let second = 0; second < 3; second++) act(() => vi.advanceTimersByTime(1000));
    expect(useSessionStore.getState().restRemaining).toBe(7);
    expect(probes.library).toBe(0);
    expect(probes.controls).toBe(0);
    expect(probes.rows).toEqual([]);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('StrictMode không tạo đồng hồ trùng; dừng và unmount đều hủy interval', () => {
    const created = vi.spyOn(window, 'setInterval');
    const cleared = vi.spyOn(window, 'clearInterval');
    const activeIntervals = () => created.mock.results.filter((result) => result.type === 'return'
      && !cleared.mock.calls.some(([id]) => id === result.value)).length;
    useSessionStore.getState().startSession(EXERCISES, 1);
    const view = render(<StrictMode><SessionBar /></StrictMode>);
    expect(activeIntervals()).toBe(1);
    act(() => vi.advanceTimersByTime(5000));
    expect(useSessionStore.getState().elapsed).toBe(5);
    act(() => useSessionStore.getState().toggleRun());
    expect(activeIntervals()).toBe(0);
    act(() => vi.advanceTimersByTime(3000));
    expect(useSessionStore.getState().elapsed).toBe(5);
    act(() => useSessionStore.getState().toggleRun());
    expect(activeIntervals()).toBe(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(useSessionStore.getState().elapsed).toBe(6);
    view.unmount();
    expect(activeIntervals()).toBe(0);
    act(() => vi.advanceTimersByTime(2000));
    expect(useSessionStore.getState().elapsed).toBe(6);
  });

  it('bấm lưu chỉ render lại dòng có ID tương ứng', () => {
    const view = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><RoutineProvider><LibraryPage /></RoutineProvider></MemoryRouter>,
    );
    probes.rows = [];
    act(() => useSavedStore.getState().toggle('e1'));
    expect([...new Set(probes.rows)]).toEqual(['e1']);
    expect(screen.getByRole('button', { name: 'Bỏ lưu' })).toHaveAttribute('aria-pressed', 'true');
    probes.rows = [];
    act(() => useSavedStore.getState().toggle('e3'));
    expect([...new Set(probes.rows)]).toEqual(['e3']);
    expect(screen.getAllByRole('button', { name: 'Bỏ lưu' })).toHaveLength(2);
    view.unmount();
  });
});
