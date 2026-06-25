import { Link } from 'react-router-dom';
import heroImage from '../assets/korea-travel-memories.png';
import { recordDateRange, recordRegionId, regionName } from '../utils/travelUtils';

export default function TravelCard({ record, onDelete }) {
  const displayRegionId = recordRegionId(record);

  return (
    <article className="travel-card">
      <Link to={`/region/${displayRegionId}`} className="travel-photo">
        <img src={record.photos[0]?.src || heroImage} alt={record.photos[0]?.caption || record.title} />
      </Link>
      <div className="travel-card-body">
        <div className="card-meta">
          <span>{record.cityName ? `${regionName(displayRegionId)} · ${record.cityName}` : regionName(displayRegionId)}</span>
          <span>{recordDateRange(record)}</span>
        </div>
        <h3>{record.title}</h3>
        <p>{record.memo}</p>
        <div className="chip-row">
          {record.companions.split(',').filter(Boolean).map((person) => (
            <span key={person.trim()}>{person.trim()}</span>
          ))}
        </div>
        <div className="card-actions">
          <Link to={`/write/${record.id}`}>수정</Link>
          {onDelete && <button type="button" onClick={() => onDelete(record.id)}>삭제</button>}
        </div>
      </div>
    </article>
  );
}
