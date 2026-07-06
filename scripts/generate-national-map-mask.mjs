import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const inputPath = new URL('../src/assets/korea-province-map.png', import.meta.url);
const outputPath = new URL('../src/assets/korea-province-mask.png', import.meta.url);

const regionSeeds = [
  { id: 'incheon', value: 1, seed: [255, 325] },
  { id: 'seoul', value: 2, seed: [360, 315] },
  { id: 'gyeonggi', value: 3, seed: [390, 405] },
  { id: 'gangwon', value: 4, seed: [690, 275] },
  { id: 'chungbuk', value: 5, seed: [585, 500] },
  { id: 'sejong', value: 6, seed: [375, 570] },
  { id: 'chungnam', value: 7, seed: [305, 610] },
  { id: 'daejeon', value: 8, seed: [445, 665] },
  { id: 'gyeongbuk', value: 9, seed: [785, 635] },
  { id: 'daegu', value: 10, seed: [760, 780] },
  { id: 'ulsan', value: 11, seed: [900, 855] },
  { id: 'busan', value: 12, seed: [850, 950] },
  { id: 'gyeongnam', value: 13, seed: [665, 915] },
  { id: 'jeonbuk', value: 14, seed: [400, 805] },
  { id: 'gwangju', value: 15, seed: [340, 950] },
  { id: 'jeonnam', value: 16, seed: [335, 1030] },
  { id: 'jeju', value: 17, seed: [305, 1325] },
];

const componentOverrides = [
  { id: 'gyeongnam-detached-south-coast', regionId: 'gyeongnam', seed: [705, 1070] },
  { id: 'jeonnam-southwest-island-1', regionId: 'jeonnam', seed: [130, 1174], minSize: 16 },
  { id: 'jeonnam-southwest-island-2', regionId: 'jeonnam', seed: [257, 1204], minSize: 16 },
  { id: 'jeonnam-southwest-island-3', regionId: 'jeonnam', seed: [209, 1251], minSize: 16 },
  { id: 'jeonnam-southwest-island-4', regionId: 'jeonnam', seed: [345, 1192], minSize: 16 },
  { id: 'jeonnam-southwest-island-5', regionId: 'jeonnam', seed: [82, 1223], minSize: 16 },
  { id: 'jeonnam-southwest-island-6', regionId: 'jeonnam', seed: [286, 1184], minSize: 16 },
  { id: 'jeonnam-southwest-island-7', regionId: 'jeonnam', seed: [301, 1247], minSize: 16 },
  { id: 'jeonnam-southwest-island-8', regionId: 'jeonnam', seed: [294, 1204], minSize: 16 },
];

const polygonCorrections = [
  {
    id: 'sejong-overassigned-to-chungnam',
    regionId: 'chungnam',
    polygon: [
      [250, 450],
      [525, 450],
      [525, 785],
      [250, 785],
    ],
    replaceValues: ['sejong'],
  },
  {
    id: 'sejong-main-area',
    regionId: 'sejong',
    polygon: [
      [391, 548],
      [400, 548],
      [416, 554],
      [409, 574],
      [415, 593],
      [430, 616],
      [417, 628],
      [401, 632],
      [394, 617],
      [388, 596],
      [386, 576],
      [389, 559],
    ],
    replaceValues: ['chungnam', 'sejong', 'chungbuk'],
  },
];

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function readChunk(buffer, offset) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
  const data = buffer.subarray(offset + 8, offset + 8 + length);
  return { length, type, data, nextOffset: offset + 12 + length };
}

function decodePng(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error('Unsupported PNG signature');
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  for (let offset = 8; offset < buffer.length;) {
    const chunk = readChunk(buffer, offset);
    offset = chunk.nextOffset;

    if (chunk.type === 'IHDR') {
      width = chunk.data.readUInt32BE(0);
      height = chunk.data.readUInt32BE(4);
      bitDepth = chunk.data[8];
      colorType = chunk.data[9];
    } else if (chunk.type === 'IDAT') {
      idat.push(chunk.data);
    } else if (chunk.type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(width * height * 4);
  let sourceOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const row = Buffer.from(inflated.subarray(sourceOffset, sourceOffset + stride));
    sourceOffset += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;

      if (filter === 1) {
        row[x] = (row[x] + left) & 0xff;
      } else if (filter === 2) {
        row[x] = (row[x] + up) & 0xff;
      } else if (filter === 3) {
        row[x] = (row[x] + Math.floor((left + up) / 2)) & 0xff;
      } else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        row[x] = (row[x] + predictor) & 0xff;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter ${filter}`);
      }
    }

    for (let x = 0; x < width; x += 1) {
      const source = x * channels;
      const target = (y * width + x) * 4;
      pixels[target] = row[source];
      pixels[target + 1] = row[source + 1];
      pixels[target + 2] = row[source + 2];
      pixels[target + 3] = channels === 4 ? row[source + 3] : 255;
    }

    previous = row;
  }

  return { width, height, pixels };
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodeRgbPng(width, height, rgb) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const rows = Buffer.alloc((width * 3 + 1) * height);
  let source = 0;
  let target = 0;
  for (let y = 0; y < height; y += 1) {
    rows[target] = 0;
    target += 1;
    rgb.copy(rows, target, source, source + width * 3);
    source += width * 3;
    target += width * 3;
  }

  return Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function indexFor(width, x, y) {
  return y * width + x;
}

function isBarrier(pixels, index) {
  const offset = index * 4;
  const r = pixels[offset];
  const g = pixels[offset + 1];
  const b = pixels[offset + 2];
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 220;
}

function buildBarrierMask(image) {
  const raw = new Uint8Array(image.width * image.height);
  for (let i = 0; i < raw.length; i += 1) {
    raw[i] = isBarrier(image.pixels, i) ? 1 : 0;
  }

  const mask = new Uint8Array(raw);
  for (let y = 2; y < image.height - 2; y += 1) {
    for (let x = 2; x < image.width - 2; x += 1) {
      const index = indexFor(image.width, x, y);
      if (!raw[index]) continue;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          mask[indexFor(image.width, x + dx, y + dy)] = 1;
        }
      }
    }
  }

  return mask;
}

function labelComponents(width, height, barrier) {
  const labels = new Int32Array(width * height);
  labels.fill(-1);
  const components = [{ size: 0, touchesBorder: false, sumX: 0, sumY: 0 }];
  const queue = new Int32Array(width * height);
  const directions = [1, -1, width, -width];

  for (let start = 0; start < labels.length; start += 1) {
    if (barrier[start] || labels[start] !== -1) continue;

    const id = components.length;
    const component = { size: 0, touchesBorder: false, sumX: 0, sumY: 0 };
    let head = 0;
    let tail = 0;
    queue[tail] = start;
    tail += 1;
    labels[start] = id;

    while (head < tail) {
      const current = queue[head];
      head += 1;
      const x = current % width;
      const y = Math.floor(current / width);
      component.size += 1;
      component.sumX += x;
      component.sumY += y;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        component.touchesBorder = true;
      }

      for (const step of directions) {
        const next = current + step;
        if (step === 1 && x === width - 1) continue;
        if (step === -1 && x === 0) continue;
        if (next < 0 || next >= labels.length || barrier[next] || labels[next] !== -1) continue;
        labels[next] = id;
        queue[tail] = next;
        tail += 1;
      }
    }

    component.centerX = component.sumX / component.size;
    component.centerY = component.sumY / component.size;
    components.push(component);
  }

  return { labels, components };
}

function nearestRegion(component) {
  let nearest = null;
  let shortest = Number.POSITIVE_INFINITY;

  for (const region of regionSeeds) {
    const dx = component.centerX - region.seed[0];
    const dy = component.centerY - region.seed[1];
    const distance = dx * dx + dy * dy;
    if (distance < shortest) {
      shortest = distance;
      nearest = region;
    }
  }

  return nearest;
}

function nearestRegionForPixel(regions, x, y) {
  let nearest = null;
  let shortest = Number.POSITIVE_INFINITY;

  for (const region of regions) {
    const dx = x - region.seed[0];
    const dy = y - region.seed[1];
    const distance = dx * dx + dy * dy;
    if (distance < shortest) {
      shortest = distance;
      nearest = region;
    }
  }

  return nearest;
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = ((yi > y) !== (yj > y))
      && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function findClosedComponentNear(width, height, labels, components, x, y, maxRadius = 48, minSize = 600) {
  for (let radius = 0; radius <= maxRadius; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const nextX = x + dx;
        const nextY = y + dy;
        if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue;

        const componentId = labels[indexFor(width, nextX, nextY)];
        const component = components[componentId];
        if (component && !component.touchesBorder && component.size >= minSize) {
          return { componentId, x: nextX, y: nextY };
        }
      }
    }
  }

  return null;
}

function buildRegionMask(image) {
  const barrier = buildBarrierMask(image);
  const { labels, components } = labelComponents(image.width, image.height, barrier);
  const componentRegions = new Map();
  const regionById = new Map(regionSeeds.map((region) => [region.id, region]));

  for (const region of regionSeeds) {
    const [x, y] = region.seed;
    const seedMatch = findClosedComponentNear(image.width, image.height, labels, components, x, y);
    const componentId = seedMatch?.componentId ?? -1;
    const component = components[componentId];
    if (!component || component.touchesBorder) {
      const offset = indexFor(image.width, x, y) * 4;
      const rgb = [
        image.pixels[offset],
        image.pixels[offset + 1],
        image.pixels[offset + 2],
      ].join(',');
      throw new Error(
        `Seed for ${region.id} is not inside a closed map area `
        + `(seed=${x},${y}, rgb=${rgb}, component=${componentId}, touchesBorder=${component?.touchesBorder ?? 'n/a'}, size=${component?.size ?? 'n/a'})`,
      );
    }
    region.seed = [seedMatch.x, seedMatch.y];
    const regions = componentRegions.get(componentId) || [];
    regions.push(region);
    componentRegions.set(componentId, regions);
  }

  for (const override of componentOverrides) {
    const [x, y] = override.seed;
    const seedMatch = findClosedComponentNear(image.width, image.height, labels, components, x, y, 48, override.minSize);
    const componentId = seedMatch?.componentId ?? -1;
    const component = components[componentId];
    const region = regionById.get(override.regionId);
    if (!component || component.touchesBorder || !region) {
      throw new Error(
        `Component override ${override.id} could not be resolved `
        + `(seed=${x},${y}, region=${override.regionId}, component=${componentId}, touchesBorder=${component?.touchesBorder ?? 'n/a'}, size=${component?.size ?? 'n/a'})`,
      );
    }
    componentRegions.set(componentId, [region]);
  }

  for (let id = 1; id < components.length; id += 1) {
    const component = components[id];
    if (componentRegions.has(id) || component.touchesBorder || component.size < 16) continue;
    componentRegions.set(id, [nearestRegion(component)]);
  }

  const rgb = Buffer.alloc(image.width * image.height * 3);
  for (let i = 0; i < labels.length; i += 1) {
    const regions = componentRegions.get(labels[i]);
    if (!regions) continue;
    const x = i % image.width;
    const y = Math.floor(i / image.width);
    const region = regions.length === 1 ? regions[0] : nearestRegionForPixel(regions, x, y);
    const target = i * 3;
    rgb[target] = region.value;
    rgb[target + 1] = 0;
    rgb[target + 2] = 0;
  }

  for (const correction of polygonCorrections) {
    const region = regionById.get(correction.regionId);
    const replaceValues = new Set(correction.replaceValues.map((regionId) => regionById.get(regionId)?.value).filter(Boolean));
    if (!region || !replaceValues.size) {
      throw new Error(`Polygon correction ${correction.id} could not be resolved`);
    }

    const minX = Math.max(0, Math.floor(Math.min(...correction.polygon.map(([x]) => x))));
    const maxX = Math.min(image.width - 1, Math.ceil(Math.max(...correction.polygon.map(([x]) => x))));
    const minY = Math.max(0, Math.floor(Math.min(...correction.polygon.map(([, y]) => y))));
    const maxY = Math.min(image.height - 1, Math.ceil(Math.max(...correction.polygon.map(([, y]) => y))));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (!pointInPolygon(x + 0.5, y + 0.5, correction.polygon)) continue;
        const target = indexFor(image.width, x, y) * 3;
        if (!replaceValues.has(rgb[target])) continue;
        rgb[target] = region.value;
      }
    }
  }

  return { rgb, componentRegions, components };
}

const image = decodePng(inputPath);
const { rgb, componentRegions, components } = buildRegionMask(image);
fs.writeFileSync(outputPath, encodeRgbPng(image.width, image.height, rgb));

if (process.env.MASK_PREVIEW) {
  const previewRegion = process.env.MASK_PREVIEW === 'all' ? null : regionSeeds.find((region) => region.id === process.env.MASK_PREVIEW);
  const preview = Buffer.alloc(image.width * image.height * 3);
  for (let pixel = 0; pixel < image.width * image.height; pixel += 1) {
    const source = pixel * 4;
    const target = pixel * 3;
    const value = rgb[target];
    const active = previewRegion ? value === previewRegion.value : value > 0;
    const alpha = active ? 0.38 : 0;
    preview[target] = Math.round(image.pixels[source] * (1 - alpha) + 223 * alpha);
    preview[target + 1] = Math.round(image.pixels[source + 1] * (1 - alpha) + 111 * alpha);
    preview[target + 2] = Math.round(image.pixels[source + 2] * (1 - alpha) + 67 * alpha);
  }
  const previewPath = path.join(os.tmpdir(), `national-map-${process.env.MASK_PREVIEW}-preview.png`);
  fs.writeFileSync(previewPath, encodeRgbPng(image.width, image.height, preview));
  console.log(`Wrote ${previewPath}`);
}

const assignedComponents = new Set(componentRegions.keys());
const assignedPixels = [...assignedComponents].reduce((sum, id) => sum + components[id].size, 0);
console.log(`Wrote ${outputPath.pathname}`);
console.log(`Map size: ${image.width}x${image.height}`);
console.log(`Assigned components: ${assignedComponents.size}`);
console.log(`Assigned pixels: ${assignedPixels}`);
