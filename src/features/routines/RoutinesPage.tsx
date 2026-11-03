import { memo, useCallback, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import type { Routine } from '../../types';
import RoutineCreateForm from './RoutineCreateForm';
import { useRoutineDispatch, useRoutines } from './RoutineContext';
import { getRoutineNameError } from './routineReducer';

const RoutineCard = memo(function RoutineCard({ routine, onRemove }: {
  routine: Routine;
  onRemove: (id: string) => void;
}) {
  const handleRemove = useCallback(() => onRemove(routine.id), [onRemove, routine.id]);
  return (
    <article className="routine-card" data-routine-id={routine.id}>
      <span className="routine-card-icon"><Icon name="routines" width="23" height="23" /></span>
      <h2><Link to={`/routines/${routine.id}`}>{routine.name}</Link></h2>
      <p>{routine.exerciseIds.length} bài</p>
      <div className="routine-card-footer">
        <Link className="text-link" to={`/routines/${routine.id}`}>Xem chi tiết <Icon name="arrow" width="16" height="16" /></Link>
        <button className="danger-button" type="button" onClick={handleRemove} aria-label={`Xóa giáo án ${routine.name}`}>
          <Icon name="trash" width="14" height="14" />Xóa
        </button>
      </div>
    </article>
  );
});

export default function RoutinesPage() {
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();
  const routinesRef = useRef(routines);

  useLayoutEffect(() => {
    routinesRef.current = routines;
  }, [routines]);

  // Validator có tham chiếu ổn định; form chỉ đăng ký DispatchContext.
  const validateName = useCallback((name: string) => getRoutineNameError(name, routinesRef.current), []);
  const handleRemove = useCallback((id: string) => dispatch({ type: 'remove', payload: { id } }), [dispatch]);

  return (
    <>
      <section className="page-intro" aria-labelledby="routines-title">
        <div>
          <p className="eyebrow"><span />LÊN KẾ HOẠCH. GIỮ NHỊP TẬP.</p>
          <h1 id="routines-title">Giáo án của bạn<span className="title-dot">.</span></h1>
          <p className="intro-description">Sắp xếp những bài tập yêu thích thành buổi tập của riêng bạn.</p>
        </div>
        <span className="routine-count-badge">{routines.length} giáo án</span>
      </section>

      <section className="routine-create-panel" aria-label="Giáo án mới">
        <div className="routine-create-intro"><Icon name="plus" width="22" height="22" /><div><h2>Tạo một buổi tập mới</h2><p>Bắt đầu với một cái tên, thêm bài tập từ kho.</p></div></div>
        <RoutineCreateForm validateName={validateName} />
      </section>

      {routines.length > 0 ? (
        <section className="routine-grid" aria-label="Danh sách giáo án">
          {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} onRemove={handleRemove} />)}
        </section>
      ) : (
        <section className="routine-empty" aria-label="Danh sách giáo án">
          <span className="empty-icon"><Icon name="routines" width="28" height="28" /></span>
          <h2>Bạn chưa có giáo án nào</h2>
          <p>Tạo giáo án đầu tiên để xây dựng buổi tập theo cách của bạn.</p>
        </section>
      )}
    </>
  );
}
