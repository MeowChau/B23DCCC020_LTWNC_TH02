import { formatDuration } from '../../utils/format';
import { useSessionStore } from './useSessionStore';

export default function CountdownBar() {
  // Chỉ component này đăng ký elapsed; các phần còn lại không cập nhật theo giây.
  const elapsed = useSessionStore((state) => state.elapsed);
  const exercise = useSessionStore((state) => state.queue[state.currentIndex]);
  const isResting = useSessionStore((state) => state.isResting);
  const restRemaining = useSessionStore((state) => state.restRemaining);
  const restDuration = useSessionStore((state) => state.restDuration);
  const duration = exercise?.duration ?? 0;
  const remaining = isResting ? restRemaining : Math.max(0, duration - elapsed);
  const total = isResting ? restDuration : duration;
  const completed = isResting ? total - remaining : elapsed;
  const percentage = total <= 0 ? 0 : Math.min(100, Math.max(0, Math.round(completed / total * 100)));

  return (
    <div className="countdown-bar">
      <p className="countdown-label">{isResting ? 'Nghỉ còn:' : 'Còn lại:'} <strong>{formatDuration(remaining)}</strong><span>{percentage}%</span></p>
      <div className="session-progress" role="progressbar" aria-label={isResting ? 'Tiến trình nghỉ' : 'Tiến trình bài tập'}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}
        aria-valuetext={`${remaining} giây còn lại`}>
        <div className="session-progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
