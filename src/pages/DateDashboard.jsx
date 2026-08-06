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
  const isDesignPreview = auth?.user?.uid === 'design-preview-user';
  const dateStartDate = auth?.profile?.dateStartDate || loadDateStartDate(auth?.user?.uid);
  const sortedRecords = [...records].sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
  const latestRecords = sortedRecords.slice(0, 6);
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);
  const mobileDayCount = isDesignPreview ? 128 : dateDayCount;
  const mobileDateCount = isDesignPreview ? 24 : records.length;

  return (
    <AppShell>
      <main className="page mobile-screen date-dashboard-page">
        <section className="date-figma-screen" aria-label="데이트 기록 모바일 홈">
          <h1>데이트기록</h1>
          <p>장소, 사진, 기념일을 한곳에 모아요.</p>

          <div className="figma-date-actions">
            <Link to="/date/write">기록하기</Link>
            <Link to="/date/album">앨범 보기</Link>
          </div>

          <div className="figma-date-stats">
            <article>
              <span>함께한 날</span>
              <strong>{mobileDayCount ? `D + ${mobileDayCount}` : formatDateLabel(dateStartDate)}</strong>
            </article>
            <article>
              <span>데이트</span>
              <strong>{mobileDateCount}회</strong>
            </article>
          </div>

          <section className="figma-recent-dates">
            <h2>최근 데이트</h2>
            {latestRecords.length > 0 ? (
              <div>
                {latestRecords.map((record) => (
                  <Link className="figma-date-row" key={record.id} to={`/date/record/${record.id}`}>
                    <time dateTime={record.startDate || ''}>{shortDateLabel(record.startDate)}</time>
                    <span>{record.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <Link className="figma-date-row" to="/date/write">
                <time>--.--.--</time>
                <span>첫 데이트 기록하기</span>
              </Link>
            )}
          </section>
        </section>

        <div className="date-legacy-content">
          <section className="date-hero">
            <div>
              <h1>데이트기록</h1>
              <span>함께 간 장소와 사진, 그날의 감정을 시간순으로 모아봅니다.</span>
            </div>
            <div className="date-hero-actions">
              <Link className="primary-button" to="/date/write">기록하기</Link>
              <Link className="secondary-button" to="/date/album">앨범 보기</Link>
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
                  <Link className="date-record-card" key={record.id} to={`/date/record/${record.id}`}>
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
        </div>
      </main>
    </AppShell>
  );
}
