import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminMapImage from '../assets/korea-province-map.png';
import provinceGangwon from '../assets/province-gangwon.png';
import provinceGyeonggi from '../assets/province-gyeonggi.png';
import provinceGyeongbuk from '../assets/province-gyeongbuk.png';
import provinceGyeongnam from '../assets/province-gyeongnam.png';
import provinceJeju from '../assets/province-jeju.png';
import provinceJeonbuk from '../assets/province-jeonbuk.png';
import provinceJeonnam from '../assets/province-jeonnam.png';
import provinceChungbuk from '../assets/province-chungbuk.png';
import provinceChungnam from '../assets/province-chungnam.png';
import { detailLayouts, detailPlaces, districtCells, provinceGroups, regions } from '../data/travelData';
import { cityPlacesFor, cityUnitLabel, detailShapeFor, districtCellFor, recordMatchesRegion, recordRegionId } from '../utils/travelUtils';

const provinceImages = {
  'gyeonggi-do': provinceGyeonggi,
  'gangwon-do': provinceGangwon,
  'chungbuk-do': provinceChungbuk,
  'chungnam-do': provinceChungnam,
  'jeonbuk-do': provinceJeonbuk,
  'jeonnam-do': provinceJeonnam,
  'gyeongbuk-do': provinceGyeongbuk,
  'gyeongnam-do': provinceGyeongnam,
  'jeju-do': provinceJeju,
};

function polygonPointsFromPercent(polygon) {
  return polygon
    .split(',')
    .map((point) => point.trim().replace(/%/g, '').replace(/\s+/, ','))
    .join(' ');
}

function provinceRenderOrder(groups) {
  return [...groups].sort((a, b) => {
    if (a.id === 'seoul-si') return 1;
    if (b.id === 'seoul-si') return -1;
    return 0;
  });
}

function scrollToPageTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export default function MapExplorer({ records, onSelectionChange }) {
  const navigate = useNavigate();
  const visitedIds = new Set(records.map((record) => recordRegionId(record)));
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const province = provinceGroups.find((group) => group.id === selectedProvince);
  const detailLayout = province ? detailLayouts[province.id] : null;
  const provinceImage = province ? provinceImages[province.id] : null;
  const provinceCrop = province?.crop;
  const provinceRegion = province
    ? regions.find((region) => province.regionIds.includes(region.id) && region.type.includes('도'))
      || regions.find((region) => province.regionIds.includes(region.id))
    : null;
  const allProvinceCities = provinceRegion ? cityPlacesFor(provinceRegion.id) : [];
  const recordedCityNames = new Set(
    records
      .filter((record) => recordMatchesRegion(record, provinceRegion?.id) && record.cityName)
      .map((record) => record.cityName),
  );
  const provinceCities = allProvinceCities.filter((city) => recordedCityNames.has(city));
  const provinceCityUnit = provinceRegion ? cityUnitLabel(provinceRegion.id) : '시';
  const currentRegion = regions.find((region) => region.id === selectedRegion);
  const currentRegionShape = currentRegion ? detailShapeFor(currentRegion.id) : null;
  const selectProvince = (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedRegion(null);
    onSelectionChange?.(true);
    scrollToPageTop();
  };

  const resetProvince = () => {
    setSelectedProvince(null);
    setSelectedRegion(null);
    onSelectionChange?.(false);
  };

  return (
    <div className="map-shell staged-map-shell" aria-label="단계별 한국 여행 지도">
      <div className="map-toolbar">
        <button type="button" onClick={resetProvince}>
          전국 도 단위
        </button>
        {province && (
          <button type="button" onClick={() => setSelectedRegion(null)}>
            {province.name}
          </button>
        )}
        {currentRegion && <span>{currentRegion.name} 세부 지역</span>}
      </div>

      <div className={`staged-map ${province ? 'has-detail-panel' : ''}`}>
        {!province && (
          <div className="province-image-map" aria-label="전국 도 단위로 나뉜 한국 행정 지도">
            <svg className="province-outline-map" viewBox="0 0 100 100" role="img">
              <title>전국 도 단위로 나뉜 한국 행정 지도</title>
              {provinceRenderOrder(provinceGroups).map((group) => {
                const visited = group.regionIds.some((id) => visitedIds.has(id));
                return (
                  <g
                    key={group.id}
                    className={`province-hotspot ${visited ? 'visited' : ''}`}
                    role="button"
                    tabIndex="0"
                    onClick={() => selectProvince(group.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectProvince(group.id);
                      }
                    }}
                    aria-label={`${group.name} ${visited ? '방문 기록 있음' : '미방문'}`}
                  >
                    <title>{group.name}</title>
                    <polygon points={polygonPointsFromPercent(group.imagePolygon)} />
                    <text x={group.mapLabelX} y={group.mapLabelY}>{group.mapLabel ?? group.name}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {province && !currentRegion && (
          <div className="province-detail-stage">
            <div
              className={`province-crop-map ${provinceImage ? 'province-asset-map' : ''}`}
              role="img"
              aria-label={`${province.name} 지도`}
              style={provinceImage || !provinceCrop ? undefined : { aspectRatio: `${provinceCrop.width} / ${provinceCrop.height}` }}
            >
              {provinceImage ? (
                <img
                  src={provinceImage}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <img
                  src={adminMapImage}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: `${(740 / provinceCrop.width) * 100}%`,
                    left: `-${(provinceCrop.x / provinceCrop.width) * 100}%`,
                    top: `-${(provinceCrop.y / provinceCrop.height) * 100}%`,
                  }}
                />
              )}
            </div>
            <div className="drill-panel">
              <div>
                <p>선택한 지역</p>
                <h3>{province.name}</h3>
                <span>{provinceCities.length ? `기록이 있는 ${provinceCityUnit} 지역만 표시합니다.` : `아직 ${provinceCityUnit} 단위로 저장된 기록이 없습니다.`}</span>
              </div>
              <div className="detail-region-grid">
                {provinceCities.length > 0 ? (
                  provinceCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="visited"
                      onClick={() => navigate(`/region/${provinceRegion.id}?city=${encodeURIComponent(city)}`)}
                    >
                      <strong>{city}</strong>
                    </button>
                  ))
                ) : (
                  <p className="drill-empty">새 기록을 작성할 때 {provinceCityUnit}를 선택하면 여기에 나타납니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentRegion && (
          <div className="province-detail-stage">
            <svg viewBox="0 0 100 104" role="img" className="province-map detail-map">
              <title>{currentRegion.name} 세부 지역 지도</title>
              {detailLayout?.coast && <path className="map-coastline" d={detailLayout.coast} />}
              {detailLayout?.islands?.map((island) => (
                <circle key={`${island.cx}-${island.cy}`} className="map-island" cx={island.cx} cy={island.cy} r={island.r} />
              ))}
              <g className="detail-shape visited active">
                <polygon points={currentRegionShape?.points ?? `${currentRegion.x},${currentRegion.y} ${currentRegion.x + currentRegion.w},${currentRegion.y} ${currentRegion.x + currentRegion.w},${currentRegion.y + currentRegion.h} ${currentRegion.x},${currentRegion.y + currentRegion.h}`} />
                <text x={currentRegionShape?.labelX ?? currentRegion.x + currentRegion.w / 2} y={currentRegionShape?.labelY ?? currentRegion.y + currentRegion.h / 2 + 1.8}>{currentRegion.name}</text>
              </g>
              {(detailPlaces[currentRegion.id] || []).map((place, index) => {
                const cell = districtCellFor(districtCells, index);
                return (
                  <g
                    key={place}
                    className="district-shape"
                    onClick={() => navigate(`/region/${currentRegion.id}`)}
                    role="button"
                    tabIndex="0"
                  >
                    <polygon points={cell.points} />
                    <text x={cell.labelX} y={cell.labelY}>{place}</text>
                  </g>
                );
              })}
            </svg>
            <div className="drill-panel district-panel">
              <div>
                <p>{currentRegion.type}</p>
                <h3>{currentRegion.name}</h3>
                <span>시·군·구 단위로 둘러본 뒤 이 지역 기록을 열 수 있습니다.</span>
              </div>
              <div className="district-grid">
                {(detailPlaces[currentRegion.id] || []).map((place) => (
                  <button key={place} type="button" onClick={() => navigate(`/region/${currentRegion.id}`)}>
                    {place}
                  </button>
                ))}
              </div>
              <button className="open-region-button" type="button" onClick={() => navigate(`/region/${currentRegion.id}`)}>
                {currentRegion.name} 여행 기록 열기
              </button>
            </div>
          </div>
        )}
      </div>

      {!province && (
        <div className="province-list">
          {provinceGroups.map((group) => {
            const visited = group.regionIds.some((id) => visitedIds.has(id));
            return (
              <button key={group.id} type="button" className={visited ? 'visited' : ''} onClick={() => selectProvince(group.id)}>
                <strong>{group.name}</strong>
                <span>{group.note}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="map-legend">
        <span><i className="legend-dot visited-dot" />방문한 지역</span>
        <span><i className="legend-dot empty-dot" />아직 남은 지역</span>
      </div>
    </div>
  );
}
