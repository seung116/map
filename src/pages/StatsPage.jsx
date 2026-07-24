import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import { regions } from '../data/travelData';
import { countBy, countTripsByRegion, groupRecordsByTrip, recordRegionId, recordStartDate, regionName, topItem } from '../utils/travelUtils';

export default function StatsPage({ records, archiveType = 'travel' }) {
  const isDateArchive = archiveType === 'date';
  const visitedRegionIds = new Set(records.map((record) => recordRegionId(record)));
  const visitedCount = visitedRegionIds.size;
  const unvisitedCount = Math.max(0, regions.length - visitedCount);
  const completion = isDateArchive ? Math.min(100, records.length * 5) : Math.round((visitedCount / regions.length) * 100);
  const regionCounts = Object.fromEntries(
    [...countTripsByRegion(records).entries()].map(([regionId, count]) => [regionName(regionId), count]),
  );
  const tripGroups = groupRecordsByTrip(records);
  const monthCounts = countBy(tripGroups.map((trip) => (trip.startDate || '').slice(5, 7) || '미정'));
  const mostRegion = topItem(regionCounts);
  const recentRecord = records.reduce((latest, record) => (
    !latest || recordStartDate(record) > recordStartDate(latest) ? record : latest
  ), null);
  const recentRegion = recentRecord ? regionName(recordRegionId(recentRecord)) : '-';
  const currentYear = String(new Date().getFullYear());
  const thisYearTripCount = tripGroups.filter((trip) => (trip.startDate || '').startsWith(currentYear)).length;
  const archiveLabel = isDateArchive ? '데이트' : '여행';

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <h1>내 {archiveLabel} 통계</h1>
        </section>
        <section className="stats-progress-panel">
          <div className="progress-ring" style={{ '--progress': `${completion}%` }}>
            <strong>{isDateArchive ? records.length : `${completion}%`}</strong>
            <span>{isDateArchive ? '데이트' : '완성률'}</span>
          </div>
          <div>
            <h2>{isDateArchive ? `총 ${records.length}번의 데이트 기록` : `전국 ${regions.length}개 시도 중 ${visitedCount}곳 방문`}</h2>
            <span>{isDateArchive ? `올해 ${thisYearTripCount}번의 데이트를 기록했습니다.` : `달성률 ${completion}% · 아직 ${unvisitedCount}곳의 여행 발자국이 남아 있습니다.`}</span>
          </div>
        </section>
        <div className="stats-grid">
          <StatCard label={isDateArchive ? '데이트한 지역 수' : '방문한 지역 수'} value={`${visitedCount}곳`} />
          {!isDateArchive && <StatCard label="안 가본 지역 수" value={`${unvisitedCount}곳`} />}
          <StatCard label={isDateArchive ? '가장 자주 간 곳' : '가장 많이 간 지역'} value={mostRegion || '-'} />
          <StatCard label={isDateArchive ? '최근 데이트 장소' : '최근 방문 지역'} value={recentRegion} />
          <StatCard label={`올해 ${archiveLabel} 횟수`} value={`${thisYearTripCount}회`} />
        </div>
        <section className="chart-panel">
          <h2>월별 {archiveLabel} 횟수</h2>
          <div className="bar-chart">
            {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((month) => {
              const value = monthCounts[month] || 0;
              return (
                <div key={month} className="bar-column">
                  <strong>{value}회</strong>
                  <span style={{ height: `${Math.max(8, value * 34)}px` }} />
                  <small>{Number(month)}월</small>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
