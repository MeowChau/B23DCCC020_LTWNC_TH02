import { describe, expect, it } from 'vitest';
import { formatDuration } from './format';

describe('Định dạng thời lượng', () => {
  it.each([
    { seconds: 0, expected: '0:00' },
    { seconds: 67, expected: '1:07' },
    { seconds: 120, expected: '2:00' },
  ])('đổi $seconds giây thành $expected', ({ seconds, expected }) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
