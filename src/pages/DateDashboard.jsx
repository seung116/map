import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import heroImage from '../assets/korea-travel-memories.png';
import { useAuth } from '../contexts/AuthContext';

function parseDate(value) {
  const time = value ? new Date(`${value}T00:00:00`).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function formatDateLabel(value) {
  if (!value) return '아직 입력 전';
  return value.replaceAll('-', '.');
}

function daysSince(value) {
  if (!value) return null;
  const start = new Date(`${value}T00:00:00`);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (Number.isNaN(start.getTime())) return null;

  const diff = todayDate.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

export default function DateDashboard({ records }) {
  const auth = useAuth();
  const relationshipStorageKey = `date-start-date-${auth?.user?.uid || 'local'}`;
  const [dateStartDate, setDateStartDate] = useState(() => localStorage.getItem(relationshipStorageKey) || '');
  const sortedRecords = [...records].sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));
  const latestRecords = sortedRecords.slice(0, 6);
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);

  const updateDateStartDate = (value) => {
    setDateStartDate(value);
    if (value) {
      localStorage.setItem(relationshipStorageKey, value);
      return;
    }

    localStorage.removeItem(relationshipStorageKey);
  };

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
            <Link className="secondary-button" to="/date/calendar">데이트 달력 보기</Link>
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
          <label>
            언제 만나기 시작했나요?
            <input type="date" value={dateStartDate} onChange={(event) => updateDateStartDate(event.target.value)} />
          </label>
        </section>

        <section className="date-timeline-section">
          <div className="section-heading inline">
            <div>
              <h2>최근 데이트</h2>
            </div>
            <div className="date-section-actions">
              <Link className="secondary-button" to="/date/album">앨범 보기</Link>
              <Link className="secondary-button" to="/date/calendar">달력 보기</Link>
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
