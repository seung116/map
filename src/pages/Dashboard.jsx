import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import heroImage from '../assets/korea-travel-memories.png';
import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';
import TravelCard from '../components/TravelCard';
import { regions } from '../data/travelData';
import { recordRegionId, recordStartDate } from '../utils/travelUtils';

export default function Dashboard({ records }) {
  const location = useLocation();
  const [mapSelectionActive, setMapSelectionActive] = useState(false);
  const homeReset = location.state?.homeReset || 0;
  const visitedCount = new Set(records.map((record) => recordRegionId(record))).size;
  const completion = Math.round((visitedCount / regions.length) * 100);
  const latest = [...records].sort((a, b) => recordStartDate(b).localeCompare(recordStartDate(a))).slice(0, 3);

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
              <h1>여은솔 멍청이 지도</h1>
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
              <h2>한국 지도 위에 표시되는 나의 여행 발자국</h2>
            </div>
            <MapExplorer key={homeReset} records={records} onSelectionChange={setMapSelectionActive} />
          </div>

          <aside className="summary-panel">
            <div className="progress-ring" style={{ '--progress': `${completion}%` }}>
              <strong>{completion}%</strong>
              <span>완성률</span>
            </div>
            <div className="stat-row">
              <span>방문 지역</span>
              <strong>{visitedCount} / {regions.length}</strong>
            </div>
            <div className="stat-row">
              <span>저장된 기록</span>
              <strong>{records.length}개</strong>
            </div>
            <div className="stat-row">
              <span>사진</span>
              <strong>{records.reduce((sum, record) => sum + record.photos.length, 0)}장</strong>
            </div>
            <Link className="wide-button" to="/stats">통계 자세히 보기</Link>
          </aside>
        </section>

        <section className="content-section">
          <div className="section-heading inline">
            <div>
              <p>Recent Memories</p>
              <h2>최근 여행 기록</h2>
            </div>
            <Link to="/write">새 기록 추가</Link>
          </div>
          <div className="record-grid">
            {latest.map((record) => (
              <TravelCard key={record.id} record={record} />
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
