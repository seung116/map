import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import heroImage from '../assets/korea-travel-memories.png';
import { useAuth } from '../contexts/AuthContext';
import { daysSince, formatDateLabel, loadDateStartDate } from '../utils/dateProfile';

function parseDate(value) {
  const time = value ? new Date(`${value}T00:00:00`).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function shortDateLabel(value) {
  if (!value) return '날짜 미정';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year.slice(-2)}.${month}.${day}`;
}

export default function DateDashboard({ records }) {
  const auth = useAuth();
  const dateStartDate = loadDateStartDate(auth?.user?.uid);
  const sortedRecords = [...records].sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
  const latestRecords = sortedRecords.slice(0, 6);
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);

  return (
    <AppShell>
      <main className="page date-dashboard-page">
        <section className="date-hero">
          <div>
            <h1>우리의 데이트 기록</h1>
            <span>함께 간 장소와 사진, 그날의 감정을 시간순으로 모아봅니다.</span>
          </div>
          <div className="date-hero-actions">
            <Link className="primary-button" to="/date/write">데이트 기록하기</Link>
            <Link className="secondary-button" to="/date/album">데이트 앨범 보기</Link>
            <Link className="secondary-button" to="/calendar">달력 보기</Link>
          </div>
        </section>

        <section className="date-start-panel" aria-label="만난 날짜">
          <div>
            <span>처음 만난 날</span>
            <strong>{formatDateLabel(dateStartDate)}</strong>
          </div>
          <div>
            <span>함께한 시간</span>
            <strong>{dateDayCount ? `${dateDayCount}일째` : '날짜를 입력해주세요'}</strong>
          </div>
        </section>

        <section className="date-timeline-section">
          <div className="section-heading inline">
            <div>
              <h2>최근 데이트</h2>
            </div>
            <div className="date-section-actions">
              <Link className="secondary-button" to="/date/album">앨범 보기</Link>
              <Link className="secondary-button" to="/calendar">달력 보기</Link>
              <Link className="secondary-button" to="/date/write">추가하기</Link>
            </div>
          </div>

          {latestRecords.length > 0 ? (
            <div className="date-timeline">
              {latestRecords.map((record) => (
                <Link className="date-record-card" key={record.id} to={`/date/write/${record.id}`}>
                  <img src={record.photos?.[0]?.src || heroImage} alt={record.photos?.[0]?.caption || record.title} />
                  <div className="date-record-card-title">
                    <h3>{record.title}</h3>
                    <p>{record.memo || '기분 기록 없음'}</p>
                    <time dateTime={record.startDate || ''}>{shortDateLabel(record.startDate)}</time>
                  </div>
                </Link>
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
