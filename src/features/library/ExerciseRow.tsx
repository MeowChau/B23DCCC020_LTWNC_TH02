import { memo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';

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
      <span role="cell" className="exercise-name" title={exercise.name}>{exercise.name}</span>
      <span role="cell" className="trainer-name">{exercise.trainer}</span>
      <span role="cell"><span className="muscle-tag" data-group={exercise.group}>{exercise.group}</span></span>
      <span role="cell" className="duration">{formatDuration(exercise.duration)}</span>
      <div role="cell" className="row-actions">
        <button type="button" className="button-start" disabled={!onStart} onClick={handleStart}>Bắt đầu</button>
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
