import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nationalMapMask from '../assets/korea-province-mask.png';
import adminMapImage from '../assets/korea-province-map.png';
import { nationalMapAreas } from '../data/travelData';
import { countTripsByRegion } from '../utils/travelUtils';

const nationalMapAreaByMaskValue = new Map(nationalMapAreas.map((area, index) => [index + 1, area]));
const visitLevelColors = {
  none: { r: 210, g: 214, b: 211, alpha: 104 },
  low: { r: 248, g: 203, b: 185, alpha: 122 },
  medium: { r: 239, g: 143, b: 104, alpha: 140 },
  high: { r: 194, g: 78, b: 52, alpha: 158 },
};

function visitLevelForCount(count) {
  if (count >= 4) return 'high';
  if (count >= 2) return 'medium';
  if (count === 1) return 'low';
  return 'none';
}

function sampleMaskValue(maskData, x, y) {
  if (!maskData || x < 0 || y < 0 || x >= maskData.width || y >= maskData.height) return 0;
  return maskData.data[(y * maskData.width + x) * 4];
}

function sampleNearbyMaskValue(maskData, x, y) {
  const exact = sampleMaskValue(maskData, x, y);
  if (exact) return exact;

  const counts = new Map();
  for (let dy = -5; dy <= 5; dy += 1) {
    for (let dx = -5; dx <= 5; dx += 1) {
      if (dx * dx + dy * dy > 25) continue;
      const value = sampleMaskValue(maskData, x + dx, y + dy);
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || (ranked[1] && ranked[1][1] > ranked[0][1] * 0.45)) return 0;
  return ranked[0][0];
}

export default function MapExplorer({ records, basePath = '' }) {
  const navigate = useNavigate();
  const regionVisitCounts = useMemo(() => countTripsByRegion(records), [records]);
  const overlayCanvasRef = useRef(null);
  const maskDataRef = useRef(null);
  const [hoveredNationalArea, setHoveredNationalArea] = useState(null);
  const [maskReady, setMaskReady] = useState(false);
  const nationalAreaVisitCounts = useMemo(
    () => new Map(nationalMapAreas.map((area, index) => [
      index + 1,
      area.regionIds.reduce((total, id) => total + (regionVisitCounts.get(id) || 0), 0),
    ])),
    [regionVisitCounts],
  );

  const selectNationalArea = (area) => {
    navigate(`${basePath}/region/${area.regionIds[0]}`);
  };

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.src = nationalMapMask;
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      maskDataRef.current = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
      setMaskReady(true);
    };

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const maskData = maskDataRef.current;
    if (!canvas || !maskData) return;

    if (canvas.width !== maskData.width || canvas.height !== maskData.height) {
      canvas.width = maskData.width;
      canvas.height = maskData.height;
    }

    const context = canvas.getContext('2d');
    const output = context.createImageData(maskData.width, maskData.height);
    const hoveredValue = hoveredNationalArea
      ? [...nationalMapAreaByMaskValue.entries()].find(([, area]) => area.id === hoveredNationalArea.id)?.[0]
      : 0;

    for (let pixel = 0; pixel < maskData.width * maskData.height; pixel += 1) {
      const value = maskData.data[pixel * 4];
      if (!value) continue;

      const target = pixel * 4;
      const count = nationalAreaVisitCounts.get(value) || 0;
      const color = visitLevelColors[visitLevelForCount(count)];
      output.data[target] = color.r;
      output.data[target + 1] = color.g;
      output.data[target + 2] = color.b;
      output.data[target + 3] = value === hoveredValue ? Math.min(color.alpha + 34, 210) : color.alpha;
    }

    context.putImageData(output, 0, 0);
  }, [hoveredNationalArea, maskReady, nationalAreaVisitCounts]);

  const findNationalAreaFromPointer = (event) => {
    const maskData = maskDataRef.current;
    if (!maskData) return null;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * maskData.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * maskData.height);
    const value = sampleNearbyMaskValue(maskData, x, y);
    return nationalMapAreaByMaskValue.get(value) || null;
  };

  const moveNationalMapPointer = (event) => {
    const area = findNationalAreaFromPointer(event);
    setHoveredNationalArea((current) => (current?.id === area?.id ? current : area));
  };

  const openNationalMapArea = (event) => {
    const area = findNationalAreaFromPointer(event) || hoveredNationalArea;
    if (area) selectNationalArea(area);
  };

  return (
    <div className="map-shell staged-map-shell" aria-label="단계별 한국 여행 지도">
      <div className="map-toolbar">
        <span>전국 도 단위</span>
      </div>

      <div className="staged-map">
        <div className="province-image-map" role="img" aria-label="전국 도 단위로 나뉜 한국 행정 지도">
          <img src={adminMapImage} alt="" aria-hidden="true" />
          <canvas
            ref={overlayCanvasRef}
            className={`province-click-layer national-map-overlay ${hoveredNationalArea ? 'is-interactive' : ''}`}
            onPointerMove={moveNationalMapPointer}
            onPointerLeave={() => setHoveredNationalArea(null)}
            onClick={openNationalMapArea}
            aria-label={hoveredNationalArea ? `${hoveredNationalArea.name} 지도 영역` : '전국 지도 영역'}
          />
        </div>
      </div>

      <div className="province-list">
        {nationalMapAreas.map((area) => {
          const visitCount = area.regionIds.reduce((total, id) => total + (regionVisitCounts.get(id) || 0), 0);
          const visitLevel = visitLevelForCount(visitCount);
          return (
            <button key={area.id} type="button" className={`visit-level-${visitLevel}`} onClick={() => selectNationalArea(area)}>
              <strong>{area.name}</strong>
              <span>{visitCount ? `${visitCount}회 · 여행 기록` : '0회 · 여행 기록'}</span>
            </button>
          );
        })}
      </div>

      <div className="map-legend">
        <span><i className="legend-dot visit-dot-none" />0회</span>
        <span><i className="legend-dot visit-dot-low" />1회</span>
        <span><i className="legend-dot visit-dot-medium" />2~3회</span>
        <span><i className="legend-dot visit-dot-high" />4회 이상</span>
      </div>
    </div>
  );
}
