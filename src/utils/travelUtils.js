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

export function detailShapeFor(regionId) {
  return Object.values(detailLayouts)
    .flatMap((layout) => layout.shapes)
    .find((shape) => shape.id === regionId);
}

export function districtCellFor(cells, index) {
  return cells[index % cells.length];
}

export function cityPlacesFor(regionId) {
  const places = (detailPlaces[regionId] || []).filter((place) => place.endsWith('시'));
  return regionId === 'gyeonggi' ? ['서울', ...places] : places;
}

export function cityUnitLabel(regionId) {
  return regionId === 'jeju' ? '행정시' : '시';
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

function compressImage(file, index, maxWidth = 640, quality = 0.62) {
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
      .slice(0, 4)
      .map((file, index) => compressImage(file, index)),
  );
}
