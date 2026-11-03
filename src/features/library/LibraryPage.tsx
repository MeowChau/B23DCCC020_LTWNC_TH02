import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, HTMLAttributes } from 'react';
import { FixedSizeList, areEqual } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { Icon } from '../../components/Icon';
import { EXERCISES, GROUPS } from '../../data/exercises';
import { useDebounce } from '../../hooks/useDebounce';
import type { Exercise, MuscleGroup } from '../../types';
import ExerciseRow from './ExerciseRow';

type SortOrder = 'default' | 'name' | 'duration';
type GroupFilter = 'all' | MuscleGroup;

interface ExerciseListData {
  exercises: Exercise[];
}

const ListViewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ListViewport(props, ref) {
    return <div {...props} ref={ref} tabIndex={0} aria-label="Danh sách bài tập, có thể cuộn" />;
  },
);

const VirtualExerciseRow = memo(function VirtualExerciseRow({
  index, style, data,
}: ListChildComponentProps<ExerciseListData>) {
  return <ExerciseRow exercise={data.exercises[index]} index={index} style={style} />;
}, areEqual);

function exerciseKey(index: number, data: ExerciseListData): string {
  return data.exercises[index].id;
}

export default function LibraryPage() {
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<GroupFilter>('all');
  const [sort, setSort] = useState<SortOrder>('default');
  const debouncedKeyword = useDebounce(keyword, 300);
  const listRef = useRef<FixedSizeList<ExerciseListData>>(null);

  const filteredExercises = useMemo(() => {
    const query = debouncedKeyword.trim().toLocaleLowerCase('vi');
    const result = EXERCISES.filter((exercise) => {
      const matchesKeyword = exercise.name.toLocaleLowerCase('vi').includes(query)
        || exercise.trainer.toLocaleLowerCase('vi').includes(query);
      return matchesKeyword && (group === 'all' || exercise.group === group);
    });

    if (sort === 'name') {
      return [...result].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }
    if (sort === 'duration') {
      return [...result].sort((a, b) => a.duration - b.duration);
    }
    return result;
  }, [debouncedKeyword, group, sort]);

  const listData = useMemo<ExerciseListData>(() => ({ exercises: filteredExercises }), [filteredExercises]);

  useEffect(() => {
    listRef.current?.scrollToItem(0, 'start');
  }, [filteredExercises]);

  const handleKeywordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }, []);

  const handleGroupChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'all' || GROUPS.some((item) => item === value)) {
      setGroup(value as GroupFilter);
    }
  }, []);

  const handleSortChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'default' || value === 'name' || value === 'duration') setSort(value);
  }, []);

  const handleReset = useCallback(() => {
    setKeyword('');
    setGroup('all');
    setSort('default');
  }, []);

  const hasFilters = keyword !== '' || group !== 'all' || sort !== 'default';

  return (
    <>
      <section className="page-intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow"><span />THƯ VIỆN TẬP LUYỆN</p>
          <h1 id="page-title">Kho bài tập<span className="title-dot">.</span></h1>
          <p className="intro-description">Tìm bài phù hợp. Sẵn sàng cho một buổi tập tốt hơn.</p>
        </div>
        <div className="library-stats" aria-label="Thống kê kho bài tập">
          <div><strong>10.000</strong><span>bài tập</span></div>
          <div><strong>05</strong><span>nhóm cơ</span></div>
          <div><strong>30–120<span className="stat-unit">s</span></strong><span>mỗi bài tập</span></div>
        </div>
      </section>

      <section className="library-panel" aria-label="Tra cứu bài tập">
        <div className="filter-bar">
          <div className="search-field">
            <label htmlFor="keyword">Tìm kiếm</label>
            <div className="input-with-icon">
              <Icon name="search" />
              <input id="keyword" type="search" value={keyword} onChange={handleKeywordChange}
                placeholder="Tên bài tập hoặc huấn luyện viên..." autoComplete="off" />
            </div>
          </div>
          <div className="select-field">
            <label htmlFor="muscle-group">Nhóm cơ</label>
            <select id="muscle-group" value={group} onChange={handleGroupChange}>
              <option value="all">Tất cả</option>
              {GROUPS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="select-field sort-field">
            <label htmlFor="sort-order">Sắp xếp</label>
            <select id="sort-order" value={sort} onChange={handleSortChange}>
              <option value="default">Mặc định</option>
              <option value="name">Tên A–Z</option>
              <option value="duration">Thời lượng tăng dần</option>
            </select>
          </div>
        </div>

        <div className="results-toolbar">
          <p role="status" aria-live="polite">Tìm thấy <strong>{filteredExercises.length}</strong> bài tập</p>
          {hasFilters
            ? <button className="reset-button" type="button" onClick={handleReset}>Đặt lại bộ lọc <span aria-hidden="true">↺</span></button>
            : <span className="results-note"><Icon name="clock" width="15" height="15" />Một khởi đầu cho mọi mục tiêu</span>}
        </div>

        {filteredExercises.length > 0 ? (
          <div className="table-scroll">
            <div className="exercise-table" role="table" aria-label="Kho bài tập" aria-rowcount={filteredExercises.length + 1} aria-colcount={6}>
              <div role="row" className="table-heading exercise-grid">
                <span role="columnheader">#</span>
                <span role="columnheader">Bài tập</span>
                <span role="columnheader">Huấn luyện viên</span>
                <span role="columnheader">Nhóm cơ</span>
                <span role="columnheader">Thời lượng</span>
                <span role="columnheader" className="action-heading">Thao tác</span>
              </div>
              <FixedSizeList ref={listRef} height={560} itemSize={56} width="100%"
                itemCount={filteredExercises.length} itemData={listData}
                itemKey={exerciseKey} overscanCount={2} outerElementType={ListViewport}>
                {VirtualExerciseRow}
              </FixedSizeList>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="search" width="28" height="28" /></span>
            <h2>Không tìm thấy bài tập nào</h2>
            <p>Thử một từ khóa khác hoặc điều chỉnh nhóm cơ.</p>
            <button className="reset-button" type="button" onClick={handleReset}>Đặt lại bộ lọc <Icon name="arrow" width="17" height="17" /></button>
          </div>
        )}
        <div className="panel-footer"><span className="status-dot" /><span>Chọn nhịp độ phù hợp với bạn</span><span className="scroll-hint">Cuộn để khám phá thêm ↓</span></div>
      </section>
    </>
  );
}
