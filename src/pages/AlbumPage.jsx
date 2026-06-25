import { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/korea-travel-memories.png';
import AppShell from '../components/AppShell';
import { recordDateRange, recordEndDate, recordStartDate, regionName } from '../utils/travelUtils';

export default function AlbumPage({ records }) {
  const [selected, setSelected] = useState(null);
  const photos = records.flatMap((record) =>
    record.photos.map((photo) => ({
      ...photo,
      recordId: record.id,
      recordTitle: record.title,
      regionId: record.regionId,
      dateRange: recordDateRange(record),
      startDate: recordStartDate(record),
      endDate: recordEndDate(record),
      companions: record.companions,
      memo: record.memo,
      board: record.board,
    })),
  );

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <p>Photo Album</p>
          <h1>전체 여행 사진</h1>
        </section>
        <div className="album-grid">
          {photos.map((photo) => (
            <button key={`${photo.id}-${photo.recordTitle}`} className="album-item" type="button" onClick={() => setSelected(photo)}>
              <img src={photo.src || heroImage} alt={photo.caption} />
              <span>{regionName(photo.regionId)} · {photo.caption}</span>
            </button>
          ))}
        </div>
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
