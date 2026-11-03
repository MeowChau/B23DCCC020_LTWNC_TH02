import { Link, NavLink, Route, Routes } from 'react-router-dom';
import type { NavLinkRenderProps } from 'react-router-dom';
import { Icon } from './components/Icon';
import LibraryPage from './features/library/LibraryPage';

function navLinkClass({ isActive }: NavLinkRenderProps): string {
  return isActive ? 'nav-link active' : 'nav-link';
}

function PendingPage({ title, description }: { title: string; description: string }) {
  return (
    <section className="placeholder-page">
      <span className="empty-icon"><Icon name="routines" width="28" height="28" /></span>
      <h1>{title}</h1>
      <p>{description}</p>
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
          <span className="header-note"><span />Mỗi ngày, một bước tiến.</span>
        </div>
      </header>

      <main id="main-content" className="main-container">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/saved" element={<PendingPage title="Bài tập đã lưu" description="Các bài tập bạn lưu sẽ xuất hiện ở đây." />} />
          <Route path="/routines" element={<PendingPage title="Giáo án" description="Không gian dành cho những buổi tập của riêng bạn." />} />
          <Route path="/routines/:id" element={<PendingPage title="Chi tiết giáo án" description="Chọn một giáo án để xem các bài tập." />} />
          <Route path="*" element={<PendingPage title="Không tìm thấy trang" description="Đường dẫn này không tồn tại. Hãy quay lại kho bài tập." />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>Bấm giờ tập luyện</span>
        <span>Tập đúng nhịp. Tiến từng ngày.</span>
      </footer>
    </div>
  );
}
