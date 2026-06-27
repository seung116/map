import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import heroImage from '../assets/hero-travel-archive.png';
import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';

export default function Dashboard({ records }) {
  const location = useLocation();
  const [mapSelectionActive, setMapSelectionActive] = useState(false);
  const homeReset = location.state?.homeReset || 0;

  useEffect(() => {
    setMapSelectionActive(false);
  }, [homeReset]);

  return (
    <AppShell>
      <main>
        {!mapSelectionActive && (
          <section className="hero">
            <img src={heroImage} alt="한국 여행 사진과 엽서가 놓인 따뜻한 테이블" />
            <div className="hero-copy">
              <p>한국 아카이브</p>
              <h1>우리의 여행 발자국</h1>
              <div className="hero-actions">
                <Link className="primary-button" to="/write">여행 기록하기</Link>
                <Link className="secondary-button" to="/album">사진 모아보기</Link>
              </div>
            </div>
          </section>
        )}

        <section className="content-grid map-section">
          <div>
            <div className="section-heading">
              <p>Travel Map</p>
              <h2>한국 지도 위에 차곡차곡 남기는 여행 발자국</h2>
            </div>
            <MapExplorer key={homeReset} records={records} onSelectionChange={setMapSelectionActive} />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
