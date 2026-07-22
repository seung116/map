import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authStore';

export default function Header() {
  const auth = useAuth();
  const navigate = useNavigate();

  const goHome = (event) => {
    event.preventDefault();
    navigate('/', { state: { homeReset: Date.now() } });
  };

  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="홈으로 이동" onClick={goHome}>
        <span className="brand-mark">KR</span>
      </Link>
      <nav className="top-nav" aria-label="주요 메뉴">
        <Link to="/write">기록</Link>
        <Link to="/album">앨범</Link>
        <Link to="/calendar">달력</Link>
        <Link to="/stats">통계</Link>
        {auth?.isAdmin && <Link to="/admin">관리</Link>}
        <button className="nav-button" type="button" onClick={logoutUser}>로그아웃</button>
      </nav>
    </header>
  );
}
