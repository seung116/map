import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import TravelCard from '../components/TravelCard';
import { regions } from '../data/travelData';
import { cityUnitLabel } from '../utils/travelUtils';

export default function RegionPage({ records, setRecords }) {
  const { regionId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedCity = searchParams.get('city') || '';
  const region = regions.find((item) => item.id === regionId);
  const regionRecords = records.filter((record) => (
    record.regionId === regionId && (!selectedCity || record.cityName === selectedCity)
  ));

  if (!region) return <Navigate to="/" replace />;

  const cityLabel = cityUnitLabel(region.id);
  const writePath = selectedCity
    ? `/write?region=${region.id}&city=${encodeURIComponent(selectedCity)}`
    : `/write?region=${region.id}`;

  const deleteRecord = (recordId) => {
    setRecords(records.filter((record) => record.id !== recordId));
  };

  return (
    <AppShell>
      <main className="page">
        <section className="region-header">
          <div>
            <p>{region.type}</p>
            <h1>{selectedCity ? `${region.name} ${selectedCity} 여행 기록` : `${region.name} 여행 기록`}</h1>
            <span>{regionRecords.length ? `${regionRecords.length}개의 추억이 저장되어 있어요` : `아직 기록이 없는 ${cityLabel}이에요`}</span>
          </div>
          <Link className="primary-button" to={writePath}>이 지역 기록하기</Link>
        </section>

        {regionRecords.length === 0 ? (
          <div className="empty-state">
            <h2>{selectedCity || region.name} 지도를 첫 번째 사진으로 채워보세요</h2>
            <p>여행 날짜, 함께 간 사람, 짧은 메모와 여러 장의 사진을 저장할 수 있습니다.</p>
          </div>
        ) : (
          <div className="record-grid">
            {regionRecords.map((record) => (
              <TravelCard key={record.id} record={record} onDelete={deleteRecord} />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
