import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';

export default function Dashboard({ records }) {
  return (
    <AppShell>
      <main>
        <section className="content-grid map-section home-map-section">
          <div className="home-map-layout">
            <div className="home-map-heading">
              <div>
                <h1>날 기억할 지도...</h1>
                <span>다녀온 지역을 지도에 남기고, 여행의 날짜와 사진을 한 번에 이어봅니다.</span>
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
