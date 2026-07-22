import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';
import { regions } from '../data/travelData';
import { countTripsByRegion, groupRecordsByTrip } from '../utils/travelUtils';

export default function Dashboard({ records }) {
  const tripGroups = groupRecordsByTrip(records);
  const visitedCount = countTripsByRegion(records).size;
  const latestTrip = tripGroups[0];

  return (
    <AppShell>
      <main>
        <section className="content-grid map-section home-map-section">
          <div className="home-map-layout">
            <div className="home-map-heading">
              <div>
                <p>Travel Map</p>
                <h1>날 기억할 지도...</h1>
                <span>다녀온 지역을 지도에 남기고, 여행의 날짜와 사진을 한 번에 이어봅니다.</span>
              </div>
              <div className="home-map-actions">
                <Link className="primary-button" to="/write">기록하기</Link>
                <Link className="secondary-button" to="/album">앨범 보기</Link>
              </div>
            </div>

            <div className="home-summary-strip" aria-label="여행 기록 요약">
              <div>
                <span>방문 지역</span>
                <strong>{visitedCount}/{regions.length}</strong>
              </div>
              <div>
                <span>여행 묶음</span>
                <strong>{tripGroups.length}</strong>
              </div>
              <div>
                <span>저장 기록</span>
                <strong>{records.length}</strong>
              </div>
              <div>
                <span>최근 여행</span>
                <strong>{latestTrip?.name || '아직 없음'}</strong>
              </div>
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
