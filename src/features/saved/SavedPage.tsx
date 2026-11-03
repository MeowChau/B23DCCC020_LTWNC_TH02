import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { EXERCISES } from '../../data/exercises';
import type { Exercise } from '../../types';
import ExerciseRow from '../library/ExerciseRow';
import { useSessionStore } from '../session/useSessionStore';
import { useSavedStore } from './useSavedStore';
import { formatDuration } from '../../utils/format';

export default function SavedPage() {
  const ids = useSavedStore((state) => state.ids);
  const toggle = useSavedStore((state) => state.toggle);
  const startSession = useSessionStore((state) => state.startSession);
  const addToSession = useSessionStore((state) => state.addToSession);
  const restDuration = useSessionStore((state) => state.restDuration);

  const exercises = useMemo(() => {
    const savedIds = new Set(ids);
    return EXERCISES.filter((exercise) => savedIds.has(exercise.id));
  }, [ids]);
  const totalDuration = useMemo(() => exercises.reduce((total, exercise) => total + exercise.duration, 0), [exercises]);

  const handleStart = useCallback((exercise: Exercise) => {
    startSession(exercises, exercises.findIndex((item) => item.id === exercise.id));
  }, [exercises, startSession]);
  const handleStartAll = useCallback(() => startSession(exercises, 0), [exercises, startSession]);
  const handleToggleSaved = useCallback((id: string) => toggle(id), [toggle]);
  const handleAddToSession = useCallback((exercise: Exercise) => addToSession(exercise), [addToSession]);

  return (
    <>
      <section className="page-intro" aria-labelledby="saved-title">
        <div>
          <p className="eyebrow">BỘ SƯU TẬP CÁ NHÂN</p>
          <h1 id="saved-title">Bài tập đã lưu<span className="heading-count">{exercises.length}</span></h1>
          <p className="intro-description">Những bài tập bạn muốn giữ lại cho lần tập tiếp theo.</p>
        </div>
        <div className="page-intro-actions">
          <div className="compact-stat"><span>Tổng thời lượng</span><strong>{formatDuration(totalDuration)}</strong></div>
          <button type="button" className="primary-button" onClick={handleStartAll} disabled={exercises.length === 0}>
            <Icon name="play" width="16" height="16" />Tập tất cả
          </button>
        </div>
      </section>

      <div className="saved-workspace">
        <section className="saved-collection" aria-label="Các bài tập đã lưu">
          {exercises.length === 0 ? (
            <div className="empty-state saved-empty">
              <span className="empty-icon"><Icon name="saved" width="28" height="28" /></span>
              <h2>Bạn chưa lưu bài tập nào</h2>
              <p>Nhấn ☆ ở bài tập bạn thích để lưu lại cho lần sau.</p>
              <Link className="text-link" to="/">Khám phá kho bài tập <Icon name="arrow" width="17" height="17" /></Link>
            </div>
          ) : (
            <div className="saved-cards">
              <div className="exercise-table saved-list" role="table" aria-label="Bài tập đã lưu" aria-colcount={6} aria-rowcount={exercises.length + 1}>
                <div role="row" className="table-heading exercise-grid">
                  <span role="columnheader">#</span>
                  <span role="columnheader">Bài tập</span>
                  <span role="columnheader">Huấn luyện viên</span>
                  <span role="columnheader">Nhóm cơ</span>
                  <span role="columnheader">Thời lượng</span>
                  <span role="columnheader" className="action-heading">Thao tác</span>
                </div>
                {exercises.map((exercise, index) => (
                  <ExerciseRow key={exercise.id} exercise={exercise} index={index} isSaved
                    onStart={handleStart} onToggleSaved={handleToggleSaved} onAddToSession={handleAddToSession} />
                ))}
              </div>
            </div>
          )}
        </section>
        <aside className="saved-aside">
          <section className="note-panel">
            <span className="note-icon"><Icon name="shield" width="20" height="20" /></span>
            <h2>Được giữ trên thiết bị này</h2>
            <p>Bài đã lưu vẫn còn khi bạn tải lại trang. Dùng cùng trình duyệt để mở lại bộ sưu tập.</p>
            <span className="note-foot"><Icon name="saved" width="13" height="13" />{exercises.length} bài đang được lưu</span>
          </section>
          <section className="note-panel note-panel-subtle">
            <h2>Chia bài thành từng buổi</h2>
            <p>Tạo giáo án để xếp riêng bài tập cho ngày ngực, ngày chân hoặc buổi tập toàn thân.</p>
            <Link className="text-link" to="/routines">Mở giáo án <Icon name="arrow" width="15" height="15" /></Link>
          </section>
          <p className="saved-rest-note"><Icon name="clock" width="14" height="14" />Nghỉ giữa hai bài: {restDuration} giây</p>
        </aside>
      </div>
    </>
  );
}
