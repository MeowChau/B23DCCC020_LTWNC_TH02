import { useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { useSessionKeyboardShortcut } from '../../hooks/useSessionKeyboardShortcut';
import CountdownBar from './CountdownBar';
import { useSessionStore } from './useSessionStore';

export default function SessionBar() {
  const exercise = useSessionStore((state) => state.queue[state.currentIndex]);
  const queueLength = useSessionStore((state) => state.queue.length);
  const isRunning = useSessionStore((state) => state.isRunning);
  const tick = useSessionStore((state) => state.tick);
  const toggleRun = useSessionStore((state) => state.toggleRun);
  const next = useSessionStore((state) => state.next);
  const prev = useSessionStore((state) => state.prev);
  const isResting = useSessionStore((state) => state.isResting);
  const upcoming = useSessionStore((state) => state.isResting ? state.queue[state.currentIndex + 1] : undefined);

  useSessionKeyboardShortcut();

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRunning, tick]);

  return (
    <aside className="session-bar" aria-label="Đồng hồ buổi tập">
      <div className="session-inner">
        <div className="session-info">
          <span className="session-mark" data-running={isRunning}><Icon name="dumbbell" width="23" height="23" /></span>
          <div className="session-description">
            <p className="session-eyebrow">{isResting ? 'NGHỈ GIỮA BÀI' : 'ĐỒNG HỒ BUỔI TẬP'}</p>
            <p className="session-title">
              {isResting && upcoming
                ? <>Tiếp theo: <strong>{upcoming.name}</strong> – HLV {upcoming.trainer}</>
                : exercise
                ? <>Đang tập: <strong>{exercise.name}</strong> – HLV {exercise.trainer}</>
                : 'Chưa bắt đầu buổi tập'}
            </p>
          </div>
        </div>
        <CountdownBar />
        <div className="session-controls-area">
          <div className="session-controls" role="group" aria-label="Điều khiển buổi tập">
            <button type="button" className="session-step" onClick={prev} disabled={!exercise}>
              <Icon name="previous" width="15" height="15" /><span>Trước</span>
            </button>
            <button type="button" className="session-toggle" onClick={toggleRun} disabled={queueLength === 0} aria-keyshortcuts="Space">
              <Icon name={isRunning ? 'pause' : 'play'} width="16" height="16" />
              <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
            </button>
            <button type="button" className="session-step" onClick={next} disabled={!exercise}>
              <span>Sau</span><Icon name="next" width="15" height="15" />
            </button>
          </div>
          <p className="session-shortcut"><kbd>Space</kbd> tạm dừng / tiếp tục</p>
        </div>
        <p className="session-queue">Buổi tập: <strong>{queueLength}</strong> bài</p>
      </div>
    </aside>
  );
}
