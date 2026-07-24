import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import TravelCard from '../components/TravelCard';
import { regions } from '../data/travelData';
import { cityUnitLabel, groupRecordsByTrip, recordMatchesRegion } from '../utils/travelUtils';

export default function RegionPage({ records, setRecords, basePath = '' }) {
  const { regionId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedCity = searchParams.get('city') || '';
  const region = regions.find((item) => item.id === regionId);
  const regionRecords = records.filter((record) => (
    recordMatchesRegion(record, regionId) && (!selectedCity || record.cityName === selectedCity)
  ));
  const tripGroups = groupRecordsByTrip(regionRecords);

  if (!region) return <Navigate to={`${basePath || '/travel'}`} replace />;

  const cityLabel = cityUnitLabel(region.id);
  const writePath = selectedCity
    ? `${basePath}/write?region=${region.id}&city=${encodeURIComponent(selectedCity)}`
    : `${basePath}/write?region=${region.id}`;

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
          <div className="trip-timeline">
            {tripGroups.map((trip) => (
              <section className="trip-group" key={trip.id}>
                <div className="trip-heading">
                  <div>
                    <p>Travel Group</p>
                    <h2>{trip.name}</h2>
                    <span>{trip.startDate === trip.endDate ? trip.startDate : `${trip.startDate} ~ ${trip.endDate}`}</span>
                  </div>
                  <strong>{trip.records.length}개 기록</strong>
                </div>
                <div className="trip-days">
                  {trip.dayGroups.map((dayGroup) => (
                    <section className="trip-day" key={dayGroup.key}>
                      <div className="trip-day-heading">
                        <h3>{dayGroup.label}</h3>
                        <span>{dayGroup.records.length}개</span>
                      </div>
                      <div className="record-grid">
                        {dayGroup.records.map((record) => (
                          <TravelCard key={record.id} record={record} onDelete={deleteRecord} basePath={basePath} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
