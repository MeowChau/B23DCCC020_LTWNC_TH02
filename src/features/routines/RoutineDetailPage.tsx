import { useCallback, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { EXERCISES } from '../../data/exercises';
import type { Exercise, Routine } from '../../types';
import { formatDuration } from '../../utils/format';
import { useSessionStore } from '../session/useSessionStore';
import { useRoutineDispatch, useRoutines } from './RoutineContext';
import { getRoutineNameError } from './routineReducer';
import type { RoutineNameError } from './routineReducer';

const EXERCISE_BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

function RoutineRenameForm({ routine }: { routine: Routine }) {
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();
  const [name, setName] = useState(routine.name);
  const [error, setError] = useState<RoutineNameError>();
  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setError(undefined);
  }, []);
  const handleRename = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameError = getRoutineNameError(name, routines, routine.id);
    setError(nameError);
    if (!nameError) dispatch({ type: 'rename', payload: { id: routine.id, name } });
  }, [dispatch, name, routine.id, routines]);

  return (
    <form className="routine-rename-form" onSubmit={handleRename} noValidate aria-label="Đổi tên giáo án">
      <label htmlFor="rename-routine">Tên giáo án mới</label>
      <div className="routine-form-fields">
        <input id="rename-routine" type="text" value={name} onChange={handleNameChange}
          aria-invalid={Boolean(error)} aria-describedby={error ? 'routine-rename-error' : undefined} />
        <button className="secondary-button" type="submit"><Icon name="edit" width="15" height="15" />Đổi tên</button>
      </div>
      {error && <p className="form-error" id="routine-rename-error" role="alert">{error}</p>}
    </form>
  );
}

function RoutineExerciseItem({ exercise, index, onRemove }: {
  exercise: Exercise;
  index: number;
  onRemove: (id: string) => void;
}) {
  const handleRemove = useCallback(() => onRemove(exercise.id), [exercise.id, onRemove]);
  return (
    <li className="routine-exercise" data-exercise-id={exercise.id}>
      <span className="routine-exercise-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="routine-exercise-mark"><Icon name="dumbbell" width="20" height="20" /></span>
      <div className="routine-exercise-info"><h3>{exercise.name}</h3><p>HLV {exercise.trainer} <span>· {exercise.group}</span></p></div>
      <span className="duration">{formatDuration(exercise.duration)}</span>
      <button className="danger-button" type="button" onClick={handleRemove} aria-label={`Bỏ ${exercise.name}`}>Bỏ</button>
    </li>
  );
}

function RoutineDetail({ routine }: { routine: Routine }) {
  const dispatch = useRoutineDispatch();
  const startSession = useSessionStore((state) => state.startSession);
  const exercises = useMemo(() => routine.exerciseIds
    .map((id) => EXERCISE_BY_ID.get(id))
    .filter((exercise): exercise is Exercise => exercise !== undefined), [routine.exerciseIds]);
  const totalDuration = useMemo(() => exercises.reduce((total, exercise) => total + exercise.duration, 0), [exercises]);
  const handleStartAll = useCallback(() => startSession(exercises, 0), [exercises, startSession]);
  const handleRemoveExercise = useCallback((exerciseId: string) => {
    dispatch({ type: 'removeExercise', payload: { routineId: routine.id, exerciseId } });
  }, [dispatch, routine.id]);

  return (
    <>
      <Link className="text-link back-link" to="/routines"><span aria-hidden="true">←</span>Tất cả giáo án</Link>
      <section className="page-intro routine-detail-intro" aria-labelledby="routine-detail-title">
        <div>
          <p className="eyebrow">CHI TIẾT GIÁO ÁN</p>
          <h1 id="routine-detail-title">{routine.name}</h1>
          <p className="intro-description">{exercises.length} bài tập · Tập theo thứ tự trong danh sách.</p>
        </div>
        <button className="primary-button" type="button" onClick={handleStartAll} disabled={exercises.length === 0}>
          <Icon name="play" width="16" height="16" />Tập tất cả
        </button>
      </section>

      <div className="routine-detail-workspace">
        <section className="library-panel routine-detail-panel" aria-label="Các bài trong giáo án">
          <div className="routine-detail-toolbar"><h2>Danh sách bài tập</h2><Link className="text-link" to="/">Thêm bài từ kho <Icon name="plus" width="15" height="15" /></Link></div>
          {exercises.length > 0 ? (
            <ol className="routine-exercise-list">
              {exercises.map((exercise, index) => <RoutineExerciseItem key={exercise.id} exercise={exercise} index={index} onRemove={handleRemoveExercise} />)}
            </ol>
          ) : (
            <div className="routine-detail-empty"><Icon name="routines" width="30" height="30" /><h2>Giáo án chưa có bài tập</h2><p>Chọn giáo án này tại kho bài tập, rồi nhấn + Giáo án.</p></div>
          )}
          <p className="routine-total"><Icon name="clock" width="17" height="17" />Tổng thời gian: {Math.floor(totalDuration / 60)} phút {totalDuration % 60} giây</p>
        </section>
        <aside className="routine-settings-panel">
          <div className="section-heading"><h2>Thông tin giáo án</h2><Icon name="edit" width="16" height="16" /></div>
          <RoutineRenameForm routine={routine} />
          <p className="routine-create-note">Tên mới được lưu khi bạn bấm Đổi tên.</p>
        </aside>
      </div>
    </>
  );
}

export default function RoutineDetailPage() {
  const { id } = useParams();
  const routines = useRoutines();
  const routine = routines.find((item) => item.id === id);

  if (!routine) {
    return (
      <section className="placeholder-page">
        <span className="empty-icon"><Icon name="routines" width="28" height="28" /></span>
        <h1>Không tìm thấy giáo án</h1>
        <p>Giáo án này không tồn tại hoặc đã được xóa.</p>
        <Link className="text-link" to="/routines">Quay lại danh sách giáo án <Icon name="arrow" /></Link>
      </section>
    );
  }
  return <RoutineDetail key={routine.id} routine={routine} />;
}
