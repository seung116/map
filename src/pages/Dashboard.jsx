import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';

export default function Dashboard({ records }) {
  return (
    <AppShell>
      <main className="mobile-screen travel-map-page">
        <section className="travel-figma-screen" aria-label="여행지도 모바일 홈">
          <h1>날 기억할 지도...</h1>
          <p>다녀온 지역을 지도와 사진으로 이어봅니다.</p>

          <div className="figma-travel-actions">
            <Link to="/travel/write">기록하기</Link>
            <Link to="/travel/album">앨범 보기</Link>
          </div>

          <div className="figma-travel-map-slot">
            <MapExplorer
              records={records}
              basePath="/travel"
            />
          </div>
        </section>

        <section className="content-grid map-section home-map-section travel-legacy-content">
          <div className="home-map-layout">
            <div className="home-map-heading">
              <div>
                <h1>날 기억할 지도...</h1>
                <span>다녀온 지역을 지도와 사진으로 이어봅니다.</span>
              </div>
              <div className="home-map-actions">
                <Link className="primary-button" to="/travel/write">기록하기</Link>
                <Link className="secondary-button" to="/travel/album">앨범 보기</Link>
              </div>
            </div>

            <MapExplorer
              records={records}
              basePath="/travel"
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
