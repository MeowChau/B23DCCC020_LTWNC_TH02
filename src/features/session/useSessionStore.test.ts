import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { useSessionStore } from './useSessionStore';

const exercises = EXERCISES.slice(0, 3);

beforeEach(() => {
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
});

describe('Store buổi tập', () => {
  it('bắt đầu đúng bài, đặt lại thời gian và giữ queue độc lập với mảng đầu vào', () => {
    useSessionStore.setState({ elapsed: 15 });
    useSessionStore.getState().startSession(exercises, 1);
    const state = useSessionStore.getState();
    expect(state.queue).toEqual(exercises);
    expect(state.queue).not.toBe(exercises);
    expect(state.queue[state.currentIndex].id).toBe('e2');
    expect(state.elapsed).toBe(0);
    expect(state.isRunning).toBe(true);
  });

  it('tick ở giây cuối tự chuyển bài và đặt thời gian bài mới về 0', () => {
    useSessionStore.getState().startSession(exercises, 0);
    useSessionStore.setState({ elapsed: exercises[0].duration - 1 });
    useSessionStore.getState().tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, isRunning: true });
  });

  it('bấm Sau ở bài cuối dừng đồng hồ và không vượt quá queue', () => {
    useSessionStore.getState().startSession(exercises, 2);
    useSessionStore.getState().next();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 2, isRunning: false });
  });

  it('hết bài cuối giữ thời gian ở thời lượng tối đa và cho phép bắt đầu lại', () => {
    useSessionStore.getState().startSession(exercises, 2);
    useSessionStore.setState({ elapsed: exercises[2].duration - 1 });
    useSessionStore.getState().tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 2, elapsed: 104, isRunning: false });
    useSessionStore.getState().toggleRun();
    expect(useSessionStore.getState()).toMatchObject({ elapsed: 0, isRunning: true });
  });

  it('tạm dừng giữ thời gian, tiếp tục tăng từ thời điểm đã dừng', () => {
    useSessionStore.getState().startSession(exercises, 0);
    useSessionStore.getState().tick();
    useSessionStore.getState().toggleRun();
    useSessionStore.getState().tick();
    expect(useSessionStore.getState().elapsed).toBe(1);
    useSessionStore.getState().toggleRun();
    useSessionStore.getState().tick();
    expect(useSessionStore.getState().elapsed).toBe(2);
  });

  it.each([
    { elapsed: 4, expectedIndex: 1 },
    { elapsed: 3, expectedIndex: 0 },
  ])('bấm Trước ở giây $elapsed chọn đúng bài theo ngưỡng 3 giây', ({ elapsed, expectedIndex }) => {
    useSessionStore.getState().startSession(exercises, 1);
    useSessionStore.setState({ elapsed });
    useSessionStore.getState().prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: expectedIndex, elapsed: 0, isRunning: true });
  });

  it('bấm Trước ở bài đầu đặt lại thời gian và không tạo chỉ số âm', () => {
    useSessionStore.getState().startSession(exercises, 0);
    useSessionStore.setState({ elapsed: 2 });
    useSessionStore.getState().prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, elapsed: 0 });
  });

  it('thêm cuối queue theo ID, bỏ qua bài trùng và khởi động được queue thêm thủ công', () => {
    useSessionStore.getState().addToSession(exercises[0]);
    useSessionStore.getState().addToSession({ ...exercises[0] });
    useSessionStore.getState().addToSession(exercises[2]);
    expect(useSessionStore.getState().queue.map((exercise) => exercise.id)).toEqual(['e1', 'e3']);
    expect(useSessionStore.getState().currentIndex).toBe(-1);
    useSessionStore.getState().toggleRun();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, isRunning: true });
  });

  it('các điều khiển không thay đổi buổi tập rỗng và bỏ qua đầu vào bắt đầu không hợp lệ', () => {
    const state = useSessionStore.getState();
    state.tick(); state.next(); state.prev(); state.toggleRun();
    state.startSession([], 0); state.startSession(exercises, -1); state.startSession(exercises, 0.5);
    expect(useSessionStore.getState()).toBe(state);
  });
});
