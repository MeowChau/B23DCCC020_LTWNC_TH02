import { lazy, Suspense } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import type { NavLinkRenderProps } from 'react-router-dom';
import { Icon } from './components/Icon';
import LibraryPage from './features/library/LibraryPage';
import SessionBar from './features/session/SessionBar';
import ThemeToggle from './components/ThemeToggle';

const SavedPage = lazy(() => import('./features/saved/SavedPage'));
const RoutinesPage = lazy(() => import('./features/routines/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./features/routines/RoutineDetailPage'));

function navLinkClass({ isActive }: NavLinkRenderProps): string {
  return isActive ? 'nav-link active' : 'nav-link';
}

function NotFoundPage() {
  return (
    <section className="placeholder-page">
      <span className="empty-icon"><Icon name="routines" width="28" height="28" /></span>
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này không tồn tại. Hãy quay lại kho bài tập.</p>
      <Link className="text-link" to="/">Khám phá kho bài tập <Icon name="arrow" /></Link>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="Bấm giờ tập luyện - Trang chủ">
            <span className="brand-mark"><Icon name="dumbbell" width="25" height="25" /></span>
            <span>Bấm giờ<span className="brand-subtitle">TẬP LUYỆN</span></span>
          </Link>
          <nav aria-label="Điều hướng chính">
            <NavLink to="/" end className={navLinkClass}><Icon name="library" />Kho bài tập</NavLink>
            <NavLink to="/saved" className={navLinkClass}><Icon name="saved" />Đã lưu</NavLink>
            <NavLink to="/routines" className={navLinkClass}><Icon name="routines" />Giáo án</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="main-container">
        <Suspense fallback={<p className="route-loading" role="status">Đang tải trang...</p>}>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/routines/:id" element={<RoutineDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="site-footer">
        <span>Bấm giờ tập luyện</span>
        <span>Tập đúng nhịp. Tiến từng ngày.</span>
      </footer>
      <SessionBar />
    </div>
  );
}
