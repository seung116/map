import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-travel-archive.png';
import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';

export default function Dashboard({ records }) {
  return (
    <AppShell>
      <main>
        <section className="hero">
          <img src={heroImage} alt="한국 여행 사진과 엽서가 놓인 따뜻한 테이블" />
          <div className="hero-copy">
            <h1>날 기억할 지도...</h1>
            <div className="hero-actions">
              <Link className="primary-button" to="/write">여행 기록하기</Link>
              <Link className="secondary-button" to="/album">사진 모아보기</Link>
            </div>
          </div>
        </section>

        <section className="content-grid map-section">
          <div>
            <div className="section-heading">
              <p>Map</p>
              <h2>여행 지도</h2>
            </div>
            <MapExplorer
              records={records}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
