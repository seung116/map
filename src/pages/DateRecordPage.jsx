import { Link, Navigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import heroImage from '../assets/korea-travel-memories.png';

function dateLabel(value) {
  if (!value) return '날짜 미정';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
}

export default function DateRecordPage({ records }) {
  const { recordId } = useParams();
  const record = records.find((item) => String(item.id) === recordId);

  if (!record) {
    return <Navigate to="/date" replace />;
  }

  const photos = record.photos?.length ? record.photos : [{ id: 'fallback', src: heroImage, caption: record.title }];

  return (
    <AppShell>
      <main className="page date-detail-page">
        <section className="date-detail-hero">
          <img src={photos[0].src || heroImage} alt={photos[0].caption || record.title} />
          <div>
            <span>{dateLabel(record.startDate)}</span>
            <h1>{record.title}</h1>
            <p>{record.memo || '기분 기록 없음'}</p>
            <dl>
              <div>
                <dt>장소</dt>
                <dd>{record.cityName || '장소 미정'}</dd>
              </div>
              <div>
                <dt>함께한 사람</dt>
                <dd>{record.companions || '미입력'}</dd>
              </div>
            </dl>
            <div className="date-detail-actions">
              <Link className="primary-button" to={`/date/write/${record.id}`}>기록 수정</Link>
              <Link className="secondary-button" to="/date">목록으로</Link>
            </div>
          </div>
        </section>

        {photos.length > 1 && (
          <section className="date-detail-gallery" aria-label="데이트 사진">
            {photos.map((photo) => (
              <img key={photo.id} src={photo.src || heroImage} alt={photo.caption || record.title} />
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}
