import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authStore';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isTravelMode = pathname.startsWith('/travel');
  const isDateMode = pathname.startsWith('/date');

  const goHome = (event) => {
    event.preventDefault();
    navigate('/select', { state: { homeReset: Date.now() } });
  };

  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="홈으로 이동" onClick={goHome}>
        <span className="brand-mark">KR</span>
      </Link>
      <nav className="top-nav" aria-label="주요 메뉴">
        {isTravelMode && (
          <>
            <Link to="/travel/write">기록</Link>
            <Link to="/travel/album">앨범</Link>
            <Link to="/calendar">달력</Link>
            <Link to="/travel/stats">통계</Link>
            <Link to="/mypage">마이페이지</Link>
          </>
        )}
        {isDateMode && (
          <>
            <Link to="/date/write">기록</Link>
            <Link to="/date/album">앨범</Link>
            <Link to="/calendar">달력</Link>
            <Link to="/date/stats">통계</Link>
            <Link to="/mypage">마이페이지</Link>
          </>
        )}
        <button className="nav-button" type="button" onClick={logoutUser}>로그아웃</button>
      </nav>
    </header>
  );
}
