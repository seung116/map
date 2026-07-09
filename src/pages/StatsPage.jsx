import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import { regions } from '../data/travelData';
import { countBy, countTripsByRegion, groupRecordsByTrip, recordRegionId, recordStartDate, regionName, topItem } from '../utils/travelUtils';

export default function StatsPage({ records }) {
  const visitedRegionIds = new Set(records.map((record) => recordRegionId(record)));
  const visitedCount = visitedRegionIds.size;
  const unvisitedCount = Math.max(0, regions.length - visitedCount);
  const completion = Math.round((visitedCount / regions.length) * 100);
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

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <p>Travel Stats</p>
          <h1>내 여행 통계</h1>
        </section>
        <section className="stats-progress-panel">
          <div className="progress-ring" style={{ '--progress': `${completion}%` }}>
            <strong>{completion}%</strong>
            <span>완성률</span>
          </div>
          <div>
            <p>Map Completion</p>
            <h2>전국 {regions.length}개 시도 중 {visitedCount}곳 방문</h2>
            <span>달성률 {completion}% · 아직 {unvisitedCount}곳의 여행 발자국이 남아 있습니다.</span>
          </div>
        </section>
        <div className="stats-grid">
          <StatCard label="방문한 지역 수" value={`${visitedCount}곳`} />
          <StatCard label="안 가본 지역 수" value={`${unvisitedCount}곳`} />
          <StatCard label="가장 많이 간 지역" value={mostRegion || '-'} />
          <StatCard label="최근 방문 지역" value={recentRegion} />
          <StatCard label="올해 여행 횟수" value={`${thisYearTripCount}회`} />
        </div>
        <section className="chart-panel">
          <h2>월별 여행 횟수</h2>
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
