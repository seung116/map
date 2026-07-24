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

function formatShortDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year.slice(-2)}/${month}/${day}`;
}

function formatShortDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '날짜 미정';
  if (!endDate || startDate === endDate) return formatShortDate(startDate || endDate);
  return `${formatShortDate(startDate)} ~ ${formatShortDate(endDate)}`;
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

function recordsForTrip(trip) {
  if (!trip) return [];
  const recordsById = new Map();

  trip.days.forEach((day) => {
    day.items.forEach((photo) => {
      const record = recordsById.get(photo.recordId) || {
        id: photo.recordId,
        title: photo.recordTitle,
        regionId: photo.regionId,
        cityName: photo.cityName,
        dateRange: photo.dateRange,
        tripDayLabel: photo.tripDayLabel,
        companions: photo.companions,
        memo: photo.memo,
        board: photo.board,
        photos: [],
      };
      record.photos.push(photo);
      recordsById.set(photo.recordId, record);
    });
  });

  return [...recordsById.values()];
}

function photosForTripRecords(records) {
  return records.flatMap((record) => record.photos.map((photo) => ({
    ...photo,
    recordId: record.id,
    recordTitle: record.title,
    regionId: record.regionId,
    cityName: record.cityName,
    dateRange: record.dateRange,
    tripDayLabel: record.tripDayLabel,
    companions: record.companions,
    memo: record.memo,
    board: record.board,
  })));
}

export default function AlbumPage({ records, basePath = '', archiveType = 'travel' }) {
  const isDateArchive = archiveType === 'date';
  const archiveLabel = isDateArchive ? '데이트' : '여행';
  const placeLabel = isDateArchive ? '장소' : '지역';
  const [selected, setSelected] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripPhotoIndex, setSelectedTripPhotoIndex] = useState(0);
  const photos = records.flatMap((record) =>
    record.photos.map((photo) => {
      const startDate = recordStartDate(record);
      const endDate = recordEndDate(record);
      const sortDate = endDate || startDate;
      const recordDate = startDate || recordDateRange(record);
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
        dateRange: recordDate,
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
  const selectedTripRecords = recordsForTrip(selectedTrip);
  const selectedTripPhotos = photosForTripRecords(selectedTripRecords);
  const selectedTripPhoto = selectedTripPhotos[selectedTripPhotoIndex] || selectedTripPhotos[0];
  const hasTripPhotoNav = selectedTripPhotos.length > 1;
  const openTrip = (trip) => {
    setSelectedTrip(trip);
    setSelectedTripPhotoIndex(0);
  };
  const closeTrip = () => setSelectedTrip(null);
  const moveTripPhoto = (direction) => {
    setSelectedTripPhotoIndex((current) => {
      if (!selectedTripPhotos.length) return 0;
      return (current + direction + selectedTripPhotos.length) % selectedTripPhotos.length;
    });
  };

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <h1>전체 {archiveLabel} 사진</h1>
        </section>
        {albumGroups.length > 0 ? (
          <div className="album-timeline">
            {albumGroups.map((yearGroup) => (
              <section className="album-year" key={yearGroup.key}>
                <div className="album-year-heading">
                  <div>
                    <button className="album-trip-title" type="button" onClick={() => openTrip(yearGroup)}>
                      <h2>{yearGroup.label}</h2>
                    </button>
                    <span>{formatShortDateRange(yearGroup.startDate, yearGroup.endDate)}</span>
                  </div>
                  <Link className="album-trip-edit" to={`${basePath}/write/${yearGroup.days[0]?.items[0]?.recordId || ''}`}>{archiveLabel} 수정</Link>
                </div>

                {yearGroup.days.map((dayGroup) => (
                  <section className="album-month" key={dayGroup.key}>
                    <div className="album-month-heading">
                      <h3>{dayGroup.label}</h3>
                      <span>{formatShortDate(dayGroup.dateRange)}</span>
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
            <p>{archiveLabel} 기록에 사진을 추가하면 최신 날짜순으로 정리됩니다.</p>
            <Link className="primary-button" to={`${basePath}/write`}>기록 작성</Link>
          </section>
        )}
      </main>
      {selected && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close-button" type="button" onClick={() => setSelected(null)} aria-label="닫기">×</button>
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
                    <dt>{placeLabel}</dt>
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
                  <Link to={`${basePath}/write/${selected.recordId}`}>기록 수정</Link>
                  {!isDateArchive && <Link to={`${basePath}/region/${selected.regionId}`}>지역 기록 보기</Link>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedTrip && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeTrip}>
          <div className="lightbox-card trip-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close-button" type="button" onClick={closeTrip} aria-label="닫기">×</button>
            <div className="trip-lightbox-header">
              <div>
                <span>{formatShortDateRange(selectedTrip.startDate, selectedTrip.endDate)}</span>
                <h2>{selectedTrip.label}</h2>
              </div>
              <Link to={`${basePath}/write/${selectedTripRecords[0]?.id || ''}`}>{archiveLabel} 수정</Link>
            </div>
            {selectedTripPhoto && (
              <article className="trip-photo-card">
                <div className="trip-photo-frame">
                  <img src={selectedTripPhoto.src || heroImage} alt={selectedTripPhoto.caption} />
                  {hasTripPhotoNav && (
                    <>
                      <button className="trip-slide-button previous" type="button" onClick={() => moveTripPhoto(-1)} aria-label="이전 사진">‹</button>
                      <button className="trip-slide-button next" type="button" onClick={() => moveTripPhoto(1)} aria-label="다음 사진">›</button>
                    </>
                  )}
                </div>
                <div className="trip-photo-details">
                  <div>
                    <div className="card-meta">
                      <span>{selectedTripPhoto.cityName ? `${regionName(selectedTripPhoto.regionId)} · ${selectedTripPhoto.cityName}` : regionName(selectedTripPhoto.regionId)}</span>
                      <span>{selectedTripPhoto.dateRange} · {selectedTripPhoto.tripDayLabel}</span>
                    </div>
                    <h3>{selectedTripPhoto.caption}</h3>
                    <h4>{selectedTripPhoto.recordTitle}</h4>
                    <p>{selectedTripPhoto.memo || '저장된 메모가 없습니다.'}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>함께 간 사람</dt>
                      <dd>{selectedTripPhoto.companions || '나'}</dd>
                    </div>
                    <div>
                      <dt>보드</dt>
                      <dd>{selectedTripPhoto.board}</dd>
                    </div>
                  </dl>
                  <div className="trip-photo-footer">
                    <span>{selectedTripPhotoIndex + 1} / {selectedTripPhotos.length}</span>
                    <div className="card-actions">
                      <Link to={`${basePath}/write/${selectedTripPhoto.recordId}`}>기록 수정</Link>
                      {!isDateArchive && <Link to={`${basePath}/region/${selectedTripPhoto.regionId}`}>지역 기록 보기</Link>}
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
