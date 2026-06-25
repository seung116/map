import { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/korea-travel-memories.png';
import AppShell from '../components/AppShell';
import { recordDateRange, recordEndDate, recordStartDate, regionName } from '../utils/travelUtils';

const monthFormatter = new Intl.DateTimeFormat('ko-KR', { month: 'long' });

function parseDateValue(value) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function albumDateParts(dateValue) {
  if (!dateValue) {
    return {
      yearKey: 'unknown',
      yearLabel: '날짜 미정',
      monthKey: 'unknown',
      monthLabel: '날짜 미정',
    };
  }

  const date = new Date(dateValue);
  return {
    yearKey: String(date.getFullYear()),
    yearLabel: `${date.getFullYear()}년`,
    monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    monthLabel: monthFormatter.format(date),
  };
}

function groupPhotosByDate(photos) {
  return photos.reduce((years, photo) => {
    let yearGroup = years.find((group) => group.key === photo.yearKey);
    if (!yearGroup) {
      yearGroup = { key: photo.yearKey, label: photo.yearLabel, count: 0, months: [] };
      years.push(yearGroup);
    }

    let monthGroup = yearGroup.months.find((group) => group.key === photo.monthKey);
    if (!monthGroup) {
      monthGroup = { key: photo.monthKey, label: photo.monthLabel, items: [] };
      yearGroup.months.push(monthGroup);
    }

    monthGroup.items.push(photo);
    yearGroup.count += 1;
    return years;
  }, []);
}

export default function AlbumPage({ records }) {
  const [selected, setSelected] = useState(null);
  const photos = records.flatMap((record) =>
    record.photos.map((photo) => {
      const startDate = recordStartDate(record);
      const endDate = recordEndDate(record);
      const sortDate = endDate || startDate;
      return {
        ...photo,
        ...albumDateParts(sortDate),
        recordId: record.id,
        recordTitle: record.title,
        regionId: record.regionId,
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
  const albumGroups = groupPhotosByDate(photos);

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <p>Photo Album</p>
          <h1>전체 여행 사진</h1>
        </section>
        {albumGroups.length > 0 ? (
          <div className="album-timeline">
            {albumGroups.map((yearGroup) => (
              <section className="album-year" key={yearGroup.key}>
                <div className="album-year-heading">
                  <div>
                    <p>Travel Photos</p>
                    <h2>{yearGroup.label}</h2>
                  </div>
                  <strong>{yearGroup.count}장</strong>
                </div>

                {yearGroup.months.map((monthGroup) => (
                  <section className="album-month" key={monthGroup.key}>
                    <div className="album-month-heading">
                      <h3>{monthGroup.label}</h3>
                      <span>{monthGroup.items.length}장</span>
                    </div>
                    <div className="album-grid">
                      {monthGroup.items.map((photo, index) => (
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
                            <small>{regionName(photo.regionId)} · {photo.dateRange}</small>
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
                  <span>{regionName(selected.regionId)}</span>
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
