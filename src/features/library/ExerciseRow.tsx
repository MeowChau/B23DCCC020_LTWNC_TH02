import { memo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';
import { Icon } from '../../components/Icon';

export interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  style?: CSSProperties;
  isSaved?: boolean;
  onStart?: (exercise: Exercise) => void;
  onToggleSaved?: (id: string) => void;
  onAddToSession?: (exercise: Exercise) => void;
  onAddToRoutine?: (exercise: Exercise) => void;
  showRoutineAction?: boolean;
}

const ExerciseRow = memo(function ExerciseRow({
  exercise, index, style, isSaved = false, onStart, onToggleSaved, onAddToSession,
  onAddToRoutine, showRoutineAction = false,
}: ExerciseRowProps) {
  const handleStart = useCallback(() => onStart?.(exercise), [onStart, exercise]);
  const handleToggleSaved = useCallback(() => onToggleSaved?.(exercise.id), [onToggleSaved, exercise.id]);
  const handleAddToSession = useCallback(() => onAddToSession?.(exercise), [onAddToSession, exercise]);
  const handleAddToRoutine = useCallback(() => onAddToRoutine?.(exercise), [onAddToRoutine, exercise]);

  return (
    <div role="row" aria-rowindex={index + 2} style={style}
      className="exercise-row exercise-grid" data-exercise-id={exercise.id}>
      <span role="cell" className="row-number">{index + 1}</span>
      <span role="cell" className="exercise-name" title={exercise.name}>
        <span className="exercise-cell-icon"><Icon name="dumbbell" width="18" height="18" /></span>
        <span className="exercise-name-copy"><span className="exercise-name-title">{exercise.name}</span><span className="exercise-code">{exercise.id.toUpperCase()}</span></span>
      </span>
      <span role="cell" className="trainer-name"><Icon name="person" width="13" height="13" />{exercise.trainer}</span>
      <span role="cell" className="muscle-cell"><span className="cell-caption">Nhóm cơ</span><span className="muscle-tag" data-group={exercise.group}>{exercise.group}</span></span>
      <span role="cell" className="duration"><span className="cell-caption">Thời lượng</span><span className="duration-value">{formatDuration(exercise.duration)}</span></span>
      <div role="cell" className="row-actions">
        <button type="button" className="button-start" disabled={!onStart} onClick={handleStart}><Icon name="play" width="12" height="12" />Bắt đầu</button>
        <button type="button" className="button-save" disabled={!onToggleSaved}
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu bài tập'} aria-pressed={isSaved}
          onClick={handleToggleSaved}>{isSaved ? '★' : '☆'}</button>
        <button type="button" className="button-queue" disabled={!onAddToSession}
          onClick={handleAddToSession}>+ Buổi tập</button>
        {showRoutineAction && (
          <button type="button" className="button-queue button-routine" disabled={!onAddToRoutine}
            onClick={handleAddToRoutine}>+ Giáo án</button>
        )}
      </div>
    </div>
  );
});

export default ExerciseRow;
