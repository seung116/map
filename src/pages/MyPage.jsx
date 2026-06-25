import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import StatCard from '../components/StatCard';
import TravelCard from '../components/TravelCard';
import { recordRegionId, recordStartDate } from '../utils/travelUtils';

export default function MyPage({ records, setRecords }) {
  const sortedRecords = [...records].sort((a, b) => recordStartDate(b).localeCompare(recordStartDate(a)));
  const visitedCount = new Set(records.map((record) => recordRegionId(record))).size;
  const photoCount = records.reduce((sum, record) => sum + record.photos.length, 0);

  const deleteRecord = (recordId) => {
    const record = records.find((item) => item.id === recordId);
    if (!record) return;

    if (window.confirm(`"${record.title}" 기록을 삭제할까요?`)) {
      setRecords(records.filter((item) => item.id !== recordId));
    }
  };

  return (
    <AppShell>
      <main className="page">
        <section className="profile-panel">
          <div className="avatar">나</div>
          <div>
            <p>여행자 프로필</p>
            <h1>나의 여행 발자국</h1>
            <span>{records.length}개의 기록이 저장되어 있습니다.</span>
          </div>
        </section>

        <section className="my-summary-grid">
          <StatCard label="내 기록" value={`${records.length}개`} />
          <StatCard label="방문 지역" value={`${visitedCount}곳`} />
          <StatCard label="저장 사진" value={`${photoCount}장`} />
        </section>

        <section className="content-section my-records-section">
          <div className="section-heading inline">
            <div>
              <p>My Records</p>
              <h2>내가 기록한 여행</h2>
            </div>
            <Link to="/write">새 기록 추가</Link>
          </div>

          {sortedRecords.length === 0 ? (
            <div className="empty-state">
              <h2>아직 저장된 기록이 없습니다</h2>
              <p>여행 날짜, 사진, 메모를 남기면 이곳에서 수정하거나 삭제할 수 있습니다.</p>
              <Link className="primary-button" to="/write">첫 기록 작성하기</Link>
            </div>
          ) : (
            <div className="record-grid">
              {sortedRecords.map((record) => (
                <TravelCard key={record.id} record={record} onDelete={deleteRecord} />
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
