import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import heroImage from '../assets/korea-travel-memories.png';
import { recordDateRange } from '../utils/travelUtils';

function parseDate(value) {
  const time = value ? new Date(`${value}T00:00:00`).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function firstDateLabel(records) {
  const first = [...records]
    .filter((record) => record.startDate)
    .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate))[0];

  if (!first) return '아직 없음';
  return first.startDate.replaceAll('-', '.');
}

function favoritePlace(records) {
  const ranked = [...records.reduce((places, record) => {
    const key = record.cityName || record.tripName || '미지정';
    places.set(key, (places.get(key) || 0) + 1);
    return places;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  return ranked[0]?.[0] || '아직 없음';
}

export default function DateDashboard({ records }) {
  const sortedRecords = [...records].sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
  const photoCount = records.reduce((total, record) => total + (record.photos?.length || 0), 0);
  const latestRecords = sortedRecords.slice(0, 6);

  return (
    <AppShell>
      <main className="page date-dashboard-page">
        <section className="date-hero">
          <div>
            <p>Date Archive</p>
            <h1>우리의 데이트 기록</h1>
            <span>함께 간 장소와 사진, 그날의 감정을 시간순으로 모아봅니다.</span>
          </div>
          <div className="date-hero-actions">
            <Link className="primary-button" to="/date/write">데이트 기록하기</Link>
            <Link className="secondary-button" to="/date/album">데이트 앨범 보기</Link>
          </div>
        </section>

        <section className="date-summary-grid" aria-label="데이트 기록 요약">
          <article>
            <span>함께한 데이트</span>
            <strong>{records.length}번</strong>
          </article>
          <article>
            <span>가장 자주 간 곳</span>
            <strong>{favoritePlace(records)}</strong>
          </article>
          <article>
            <span>첫 데이트</span>
            <strong>{firstDateLabel(records)}</strong>
          </article>
          <article>
            <span>데이트 사진</span>
            <strong>{photoCount}장</strong>
          </article>
        </section>

        <section className="date-timeline-section">
          <div className="section-heading inline">
            <div>
              <p>Timeline</p>
              <h2>최근 데이트</h2>
            </div>
            <div className="date-section-actions">
              <Link className="secondary-button" to="/date/album">앨범 보기</Link>
              <Link className="secondary-button" to="/date/write">추가하기</Link>
            </div>
          </div>

          {latestRecords.length > 0 ? (
            <div className="date-timeline">
              {latestRecords.map((record) => (
                <article className="date-record-card" key={record.id}>
                  <img src={record.photos?.[0]?.src || heroImage} alt={record.photos?.[0]?.caption || record.title} />
                  <div>
                    <span>{recordDateRange(record)}</span>
                    <h3>{record.title}</h3>
                    <p>{record.memo || '저장된 메모가 없습니다.'}</p>
                    <Link to={`/date/write/${record.id}`}>기록 수정</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>아직 데이트 기록이 없습니다</h2>
              <p>첫 데이트 장소와 사진을 남겨보세요.</p>
              <Link className="primary-button" to="/date/write">데이트 기록하기</Link>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
