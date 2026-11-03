import { lazy, Suspense } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import type { NavLinkRenderProps } from 'react-router-dom';
import { Icon } from './components/Icon';
import LibraryPage from './features/library/LibraryPage';
import SessionBar from './features/session/SessionBar';
import ThemeToggle from './components/ThemeToggle';
import { useSavedStore } from './features/saved/useSavedStore';

const SavedPage = lazy(() => import('./features/saved/SavedPage'));
const RoutinesPage = lazy(() => import('./features/routines/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./features/routines/RoutineDetailPage'));

function navLinkClass({ isActive }: NavLinkRenderProps): string {
  return isActive ? 'nav-link active' : 'nav-link';
}

function SavedCount() {
  const count = useSavedStore((state) => state.ids.length);
  return <span className="nav-count" aria-hidden="true">{count}</span>;
}

function Breadcrumbs() {
  const { pathname } = useLocation();
  const label = pathname === '/' ? 'Kho bài tập' : pathname === '/saved' ? 'Bài tập đã lưu'
    : pathname === '/routines' ? 'Giáo án' : pathname.startsWith('/routines/') ? 'Chi tiết giáo án' : 'Không tìm thấy trang';
  return <div className="breadcrumbs"><Link to="/">Không gian tập luyện</Link><Icon name="chevron" width="12" height="12" /><span>{label}</span></div>;
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
            <NavLink to="/saved" className={navLinkClass} aria-label="Đã lưu"><Icon name="saved" />Đã lưu<SavedCount /></NavLink>
            <NavLink to="/routines" className={navLinkClass}><Icon name="routines" />Giáo án</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className="main-container">
        <Breadcrumbs />
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
        <span className="footer-brand"><Icon name="dumbbell" width="15" height="15" /><strong>Bấm giờ</strong> tập luyện</span>
        <span>Bài đã lưu và giáo án được giữ trên thiết bị này.</span>
      </footer>
      <SessionBar />
    </div>
  );
}
