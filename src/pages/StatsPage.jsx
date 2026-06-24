import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import { regions } from '../data/travelData';
import { countBy, recordStartDate, regionName, topItem } from '../utils/travelUtils';

export default function StatsPage({ records }) {
  const visitedCount = new Set(records.map((record) => record.regionId)).size;
  const completion = Math.round((visitedCount / regions.length) * 100);
  const regionCounts = countBy(records.map((record) => regionName(record.regionId)));
  const companionCounts = countBy(records.flatMap((record) => record.companions.split(',').map((name) => name.trim()).filter(Boolean)));
  const monthCounts = countBy(records.map((record) => recordStartDate(record).slice(5, 7) || '미정'));
  const mostRegion = topItem(regionCounts);
  const mostCompanion = topItem(companionCounts);
  const currentYear = String(new Date().getFullYear());
  const thisYear = records.filter((record) => recordStartDate(record).startsWith(currentYear)).length;

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <p>Travel Stats</p>
          <h1>내 여행 통계</h1>
        </section>
        <div className="stats-grid">
          <StatCard label="방문한 지역 수" value={`${visitedCount}곳`} />
          <StatCard label="한국 지도 완성률" value={`${completion}%`} />
          <StatCard label="가장 많이 간 지역" value={mostRegion || '-'} />
          <StatCard label="함께 여행을 가장 많이 간 사람" value={mostCompanion || '-'} />
          <StatCard label="올해 여행 기록" value={`${thisYear}개`} />
        </div>
        <section className="chart-panel">
          <h2>월별 여행 횟수</h2>
          <div className="bar-chart">
            {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((month) => {
              const value = monthCounts[month] || 0;
              return (
                <div key={month} className="bar-column">
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
