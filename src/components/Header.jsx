import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authStore';

export default function Header() {
  const auth = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="홈으로 이동">
        <span className="brand-mark">KR</span>
        <span>
          <strong>여행지도</strong>
          <small>사진으로 채우는 한국 기록</small>
        </span>
      </Link>
      <nav className="top-nav" aria-label="주요 메뉴">
        <Link to="/write">기록</Link>
        <Link to="/album">앨범</Link>
        <Link to="/stats">통계</Link>
        <Link to="/mypage">마이</Link>
        {auth?.isAdmin && <Link to="/admin">관리</Link>}
        <button className="nav-button" type="button" onClick={logoutUser}>로그아웃</button>
      </nav>
    </header>
  );
}
