import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const { pathname } = useLocation();
  const isDateMode = pathname.startsWith('/date');
  const showBottomNav = pathname === '/calendar' || pathname.includes('/stats') || pathname === '/mypage';
  const writePath = isDateMode ? '/date/write' : '/travel/write';
  const albumPath = isDateMode ? '/date/album' : '/travel/album';
  const statsPath = isDateMode ? '/date/stats' : '/travel/stats';

  if (!showBottomNav) return null;

  return (
    <footer className="bottom-nav" aria-label="하단 메뉴">
      <Link to="/select">은솔</Link>
      <Link to={albumPath}>앨범</Link>
      <Link className="bottom-nav-write" to={writePath}>기록 +</Link>
      <Link to="/calendar">달력</Link>
      <Link to={statsPath}>통계</Link>
    </footer>
  );
}
