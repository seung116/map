import { detailLayouts, detailPlaces, regions } from '../data/travelData';

export function regionName(id) {
  return regions.find((region) => region.id === id)?.name ?? '알 수 없음';
}

export function recordStartDate(record) {
  return record.startDate || record.date || '';
}

export function recordEndDate(record) {
  return record.endDate || record.startDate || record.date || '';
}

export function recordDateRange(record) {
  const start = recordStartDate(record);
  const end = recordEndDate(record);
  if (!start && !end) return '날짜 미정';
  if (!end || start === end) return start;
  return `${start} ~ ${end}`;
}

export function normalizeRecordDates(record) {
  const startDate = recordStartDate(record);
  const endDate = recordEndDate(record) || startDate;
  return { ...record, startDate, endDate };
}

export function recordTripId(record) {
  if (record?.tripId) return record.tripId;
  return `trip-${recordStartDate(record) || 'unknown'}-${recordEndDate(record) || 'unknown'}`;
}

export function recordTripName(record) {
  if (record?.tripName) return record.tripName;
  const dateRange = recordDateRange(record);
  return dateRange === '날짜 미정' ? '묶이지 않은 여행' : `${dateRange} 여행`;
}

export function recordDayLabel(record) {
  return recordDateRange(record);
}

export function groupRecordsByTrip(records) {
  const groups = [];

  records.forEach((record) => {
    const tripId = recordTripId(record);
    let group = groups.find((item) => item.id === tripId);
    if (!group) {
      group = {
        id: tripId,
        name: recordTripName(record),
        startDate: recordStartDate(record),
        endDate: recordEndDate(record),
        records: [],
        dayGroups: [],
      };
      groups.push(group);
    }

    group.records.push(record);
    const startDate = recordStartDate(record);
    const endDate = recordEndDate(record);
    if (!group.startDate || (startDate && startDate < group.startDate)) group.startDate = startDate;
    if (!group.endDate || (endDate && endDate > group.endDate)) group.endDate = endDate;
  });

  groups.forEach((group) => {
    group.records.sort((a, b) => recordStartDate(b).localeCompare(recordStartDate(a)) || String(b.id).localeCompare(String(a.id)));
    group.dayGroups = group.records.reduce((days, record) => {
      const dayKey = recordDayLabel(record);
      let dayGroup = days.find((item) => item.key === dayKey);
      if (!dayGroup) {
        dayGroup = { key: dayKey, label: dayKey, records: [] };
        days.push(dayGroup);
      }
      dayGroup.records.push(record);
      return days;
    }, []);
  });

  return groups.sort((a, b) => (b.endDate || '').localeCompare(a.endDate || ''));
}

export function detailShapeFor(regionId) {
  return Object.values(detailLayouts)
    .flatMap((layout) => layout.shapes)
    .find((shape) => shape.id === regionId);
}

export function districtCellFor(cells, index) {
  return cells[index % cells.length];
}

export function cityPlacesFor(regionId) {
  if (regionId === 'seoul') {
    return detailPlaces.seoul || [];
  }

  const places = (detailPlaces[regionId] || []).filter((place) => place.endsWith('시'));
  return places;
}

export function recordPlaceOptionsFor(regionId) {
  const places = detailPlaces[regionId] || [];
  const cityPlaces = cityPlacesFor(regionId);
  return cityPlaces.length ? cityPlaces : places;
}

export function recordRegionId(record) {
  if (!record?.cityName) return record?.regionId;

  const savedRegionPlaces = recordPlaceOptionsFor(record.regionId);
  if (savedRegionPlaces.includes(record.cityName)) return record.regionId;

  return regions.find((region) => recordPlaceOptionsFor(region.id).includes(record.cityName))?.id || record.regionId;
}

export function recordMatchesRegion(record, regionId) {
  return recordRegionId(record) === regionId;
}

export function cityUnitLabel(regionId) {
  if (regionId === 'seoul') return '구';
  if (regionId === 'jeju') return '행정시';

  const places = recordPlaceOptionsFor(regionId);
  if (places.length > 0 && places.every((place) => !place.endsWith('시'))) return '구·군';

  return '시';
}

export function countBy(items) {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

export function topItem(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function compressImage(file, index, maxWidth = 1200, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const image = new Image();

    reader.onerror = reject;
    image.onerror = reject;

    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      resolve({
        id: Date.now() + index,
        src: canvas.toDataURL('image/jpeg', quality),
        caption: file.name.replace(/\.[^/.]+$/, ''),
      });
    };

    reader.onload = () => {
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export function toPhotoFiles(files) {
  return Promise.all(
    Array.from(files)
      .slice(0, 3)
      .map((file, index) => compressImage(file, index)),
  );
}
