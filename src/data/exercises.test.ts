import { describe, expect, it } from 'vitest';
import { generateExercises, GROUPS } from './exercises';

describe('Bộ dữ liệu bài tập', () => {
  it('sinh đủ 10.000 bài, ID duy nhất và mọi thời lượng từ 30 đến 120 giây', () => {
    const exercises = generateExercises(10000);
    expect(exercises).toHaveLength(10000);
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(10000);
    expect(exercises.every((exercise) => exercise.duration >= 30 && exercise.duration <= 120)).toBe(true);
    expect(exercises.every((exercise) => GROUPS.includes(exercise.group))).toBe(true);
  });

  it('luôn sinh cùng dữ liệu và khớp ba ví dụ đầu của đề', () => {
    expect(generateExercises(3)).toEqual([
      { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 },
      { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 },
      { id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104 },
    ]);
    expect(generateExercises(100)).toEqual(generateExercises(100));
  });
});
