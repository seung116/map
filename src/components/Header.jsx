import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authStore';

export default function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

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
        <Link to="/select">선택</Link>
        <Link to="/travel">여행</Link>
        <Link to="/travel/write">기록</Link>
        <Link to="/travel/album">앨범</Link>
        <Link to="/travel/calendar">달력</Link>
        <Link to="/travel/stats">통계</Link>
        <Link to="/date">데이트</Link>
        {auth?.isAdmin && <Link to="/admin">관리</Link>}
        <button className="nav-button" type="button" onClick={logoutUser}>로그아웃</button>
      </nav>
    </header>
  );
}
