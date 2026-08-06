import { Link, useLocation, useNavigate } from 'react-router-dom';
import profileIcon from '../assets/header-profile-icon.svg';
import logoMark from '../assets/web-header-logo-black-transparent.png';
import { logoutUser } from '../services/authStore';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isTravelMode = pathname.startsWith('/travel');
  const isDateMode = pathname.startsWith('/date');
  const albumPath = isDateMode ? '/date/album' : '/travel/album';
  const statsPath = isDateMode ? '/date/stats' : '/travel/stats';

  const goHome = (event) => {
    event.preventDefault();
    navigate('/select', { state: { homeReset: Date.now() } });
  };

  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="홈으로 이동" onClick={goHome}>
        <span className="brand-mark brand-logo-image">
          <img src={logoMark} alt="" />
        </span>
        <img className="mobile-brand-image" src={logoMark} alt="" />
      </Link>
      <nav className="top-nav desktop-nav" aria-label="주요 메뉴">
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
      <nav className="top-nav mobile-figma-nav" aria-label="모바일 주요 메뉴">
        <Link to={albumPath}>앨범</Link>
        <Link to="/calendar">달력</Link>
        <Link to={statsPath}>통계</Link>
        <Link className="profile-nav-link" to="/mypage" aria-label="마이페이지">
          <img src={profileIcon} alt="" />
        </Link>
      </nav>
    </header>
  );
}
