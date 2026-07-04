import { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/korea-travel-memories.png';
import AppShell from '../components/AppShell';
import {
  recordDateRange,
  recordEndDate,
  recordRegionId,
  recordStartDate,
  recordTripEndDate,
  recordTripId,
  recordTripName,
  recordTripDayNumber,
  recordTripStartDate,
  recordTripDayLabel,
  regionName,
} from '../utils/travelUtils';

function parseDateValue(value) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function groupPhotosByTrip(photos) {
  return photos.reduce((trips, photo) => {
    let tripGroup = trips.find((group) => group.key === photo.tripId);
    if (!tripGroup) {
      tripGroup = {
        key: photo.tripId,
        label: photo.tripName,
        startDate: photo.tripStartDate,
        endDate: photo.tripEndDate,
        days: [],
      };
      trips.push(tripGroup);
    }

    if (!tripGroup.startDate || (photo.tripStartDate && photo.tripStartDate < tripGroup.startDate)) tripGroup.startDate = photo.tripStartDate;
    if (!tripGroup.endDate || (photo.tripEndDate && photo.tripEndDate > tripGroup.endDate)) tripGroup.endDate = photo.tripEndDate;

    let dayGroup = tripGroup.days.find((group) => group.key === photo.tripDayLabel);
    if (!dayGroup) {
      dayGroup = {
        key: photo.tripDayLabel,
        label: photo.tripDayLabel,
        dayNumber: photo.tripDayNumber,
        dateRange: photo.dateRange,
        items: [],
      };
      tripGroup.days.push(dayGroup);
    }

    dayGroup.items.push(photo);
    return trips;
  }, []).map((tripGroup) => ({
    ...tripGroup,
    days: [...tripGroup.days].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0)),
  }));
}

export default function AlbumPage({ records }) {
  const [selected, setSelected] = useState(null);
  const photos = records.flatMap((record) =>
    record.photos.map((photo) => {
      const startDate = recordStartDate(record);
      const endDate = recordEndDate(record);
      const sortDate = endDate || startDate;
      const displayRegionId = recordRegionId(record);
      return {
        ...photo,
        tripId: recordTripId(record),
        tripName: recordTripName(record),
        tripStartDate: recordTripStartDate(record),
        tripEndDate: recordTripEndDate(record),
        tripDayNumber: recordTripDayNumber(record),
        tripDayLabel: recordTripDayLabel(record),
        recordId: record.id,
        recordTitle: record.title,
        regionId: displayRegionId,
        cityName: record.cityName || '',
        dateRange: recordDateRange(record),
        startDate,
        endDate,
        sortDate,
        companions: record.companions,
        memo: record.memo,
        board: record.board,
      };
    }),
  ).sort((a, b) => {
    const endDiff = parseDateValue(b.sortDate) - parseDateValue(a.sortDate);
    if (endDiff !== 0) return endDiff;
    return parseDateValue(b.startDate) - parseDateValue(a.startDate);
  });
  const albumGroups = groupPhotosByTrip(photos);

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <h1>전체 여행 사진</h1>
        </section>
        {albumGroups.length > 0 ? (
          <div className="album-timeline">
            {albumGroups.map((yearGroup) => (
              <section className="album-year" key={yearGroup.key}>
                <div className="album-year-heading">
                  <div>
                    <h2>{yearGroup.label}</h2>
                    <span>{yearGroup.startDate === yearGroup.endDate ? yearGroup.startDate : `${yearGroup.startDate} ~ ${yearGroup.endDate}`}</span>
                  </div>
                </div>

                {yearGroup.days.map((dayGroup) => (
                  <section className="album-month" key={dayGroup.key}>
                    <div className="album-month-heading">
                      <h3>{dayGroup.label}</h3>
                      <span>{dayGroup.dateRange}</span>
                    </div>
                    <div className="album-grid">
                      {dayGroup.items.map((photo, index) => (
                        <button
                          key={`${photo.id}-${photo.recordTitle}`}
                          className="album-item"
                          type="button"
                          style={{ '--delay': `${Math.min(index, 8) * 24}ms` }}
                          onClick={() => setSelected(photo)}
                        >
                          <span className="album-photo">
                            <img src={photo.src || heroImage} alt={photo.caption} />
                          </span>
                          <span className="album-caption">
                            <strong>{photo.caption}</strong>
                            <small>{photo.cityName ? `${regionName(photo.regionId)} · ${photo.cityName}` : regionName(photo.regionId)} · {photo.dateRange} · {photo.tripDayLabel}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </section>
            ))}
          </div>
        ) : (
          <section className="empty-state">
            <h2>아직 앨범 사진이 없습니다</h2>
            <p>여행 기록에 사진을 추가하면 최신 날짜순으로 정리됩니다.</p>
            <Link className="primary-button" to="/write">기록 작성</Link>
          </section>
        )}
      </main>
      {selected && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelected(null)} aria-label="닫기">×</button>
            <div className="lightbox-layout">
              <img src={selected.src || heroImage} alt={selected.caption} />
              <div className="lightbox-details">
                <div className="card-meta">
                  <span>{selected.cityName ? `${regionName(selected.regionId)} · ${selected.cityName}` : regionName(selected.regionId)}</span>
                  <span>{selected.dateRange}</span>
                </div>
                <h2>{selected.caption}</h2>
                <h3>{selected.recordTitle}</h3>
                <p>{selected.memo || '저장된 메모가 없습니다.'}</p>
                <dl>
                  <div>
                    <dt>지역</dt>
                    <dd>{regionName(selected.regionId)}</dd>
                  </div>
                  <div>
                    <dt>시·구</dt>
                    <dd>{selected.cityName || '미지정'}</dd>
                  </div>
                  <div>
                    <dt>함께 간 사람</dt>
                    <dd>{selected.companions || '나'}</dd>
                  </div>
                  <div>
                    <dt>보드</dt>
                    <dd>{selected.board}</dd>
                  </div>
                </dl>
                <div className="card-actions">
                  <Link to={`/write/${selected.recordId}`}>기록 수정</Link>
                  <Link to={`/region/${selected.regionId}`}>지역 기록 보기</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
