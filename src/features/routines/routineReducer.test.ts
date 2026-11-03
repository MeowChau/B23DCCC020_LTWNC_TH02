import { beforeEach, describe, expect, it } from 'vitest';
import type { Routine } from '../../types';
import { routineReducer } from './routineReducer';

let state: Routine[];

beforeEach(() => {
  state = [
    { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] },
    { id: 'r2', name: 'Ngày chân', exerciseIds: [] },
  ];
  state.forEach((routine) => { Object.freeze(routine.exerciseIds); Object.freeze(routine); });
  Object.freeze(state);
});

describe('Reducer giáo án', () => {
  it('tạo giáo án mới, chuẩn hóa khoảng trắng và không sửa state gốc', () => {
    const next = routineReducer(state, { type: 'create', payload: { id: 'r3', name: '  Vai  ' } });
    expect(next).toHaveLength(3);
    expect(next[2]).toEqual({ id: 'r3', name: 'Vai', exerciseIds: [] });
    expect(state).toHaveLength(2);
    expect(next[0]).toBe(state[0]);
  });

  it.each(['   ', 'ngày NGỰC'])('không tạo giáo án với tên không hợp lệ: "%s"', (name) => {
    expect(routineReducer(state, { type: 'create', payload: { id: 'r3', name } })).toBe(state);
  });

  it('đổi tên một giáo án và giữ nguyên các giáo án khác', () => {
    const next = routineReducer(state, { type: 'rename', payload: { id: 'r1', name: 'Ngực nâng cao' } });
    expect(next[0].name).toBe('Ngực nâng cao');
    expect(next[1]).toBe(state[1]);
    expect(state[0].name).toBe('Ngày ngực');
    expect(routineReducer(state, { type: 'rename', payload: { id: 'r1', name: 'Ngày chân' } })).toBe(state);
  });

  it('thêm bài đúng giáo án và không thêm trùng ID', () => {
    const next = routineReducer(state, { type: 'addExercise', payload: { routineId: 'r2', exerciseId: 'e3' } });
    expect(next[1].exerciseIds).toEqual(['e3']);
    expect(state[1].exerciseIds).toEqual([]);
    expect(routineReducer(state, { type: 'addExercise', payload: { routineId: 'r1', exerciseId: 'e1' } })).toBe(state);
  });

  it('bỏ đúng bài khỏi giáo án mà không sửa mảng ID cũ', () => {
    const next = routineReducer(state, { type: 'removeExercise', payload: { routineId: 'r1', exerciseId: 'e1' } });
    expect(next[0].exerciseIds).toEqual(['e2']);
    expect(state[0].exerciseIds).toEqual(['e1', 'e2']);
    expect(next[1]).toBe(state[1]);
  });

  it('xóa giáo án được chọn và giữ nguyên state khi xóa ID không tồn tại', () => {
    expect(routineReducer(state, { type: 'remove', payload: { id: 'r1' } })).toEqual([state[1]]);
    expect(routineReducer(state, { type: 'remove', payload: { id: 'không-tồn-tại' } })).toEqual(state);
  });
});
