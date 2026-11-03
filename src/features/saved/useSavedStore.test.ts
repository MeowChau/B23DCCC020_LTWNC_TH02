import { beforeEach, describe, expect, it } from 'vitest';
import { useSavedStore } from './useSavedStore';

beforeEach(() => useSavedStore.setState({ ids: [] }));

describe('Store bài tập đã lưu', () => {
  it('toggle thêm/bỏ đúng ID và chỉ ghi ids vào workout-saved', () => {
    useSavedStore.getState().toggle('e1');
    useSavedStore.getState().toggle('e3');
    expect(useSavedStore.getState().ids).toEqual(['e1', 'e3']);
    expect(JSON.parse(localStorage.getItem('workout-saved')!).state).toEqual({ ids: ['e1', 'e3'] });
    useSavedStore.getState().toggle('e1');
    expect(useSavedStore.getState().ids).toEqual(['e3']);
  });

  it('rehydrate khôi phục các ID đã lưu như khi tải lại trang', async () => {
    localStorage.setItem('workout-saved', JSON.stringify({ state: { ids: ['e1', 'e3'] }, version: 0 }));
    await useSavedStore.persist.rehydrate();
    expect(useSavedStore.getState().ids).toEqual(['e1', 'e3']);
  });
});
