import heroImage from '../assets/korea-travel-memories.png';

export const regions = [
  { id: 'seoul', name: '서울', type: '특별시', x: 42, y: 17, w: 9, h: 7 },
  { id: 'incheon', name: '인천', type: '광역시', x: 32, y: 19, w: 9, h: 7 },
  { id: 'gyeonggi', name: '경기', type: '도', x: 34, y: 10, w: 22, h: 21 },
  { id: 'gangwon', name: '강원', type: '도', x: 61, y: 8, w: 27, h: 22 },
  { id: 'chungbuk', name: '충북', type: '도', x: 50, y: 30, w: 18, h: 17 },
  { id: 'chungnam', name: '충남', type: '도', x: 30, y: 36, w: 22, h: 17 },
  { id: 'daejeon', name: '대전', type: '광역시', x: 45, y: 47, w: 11, h: 8 },
  { id: 'sejong', name: '세종', type: '특별자치시', x: 43, y: 38, w: 10, h: 7 },
  { id: 'gyeongbuk', name: '경북', type: '도', x: 64, y: 39, w: 24, h: 24 },
  { id: 'daegu', name: '대구', type: '광역시', x: 68, y: 59, w: 12, h: 8 },
  { id: 'ulsan', name: '울산', type: '광역시', x: 81, y: 66, w: 11, h: 8 },
  { id: 'busan', name: '부산', type: '광역시', x: 75, y: 75, w: 13, h: 9 },
  { id: 'gyeongnam', name: '경남', type: '도', x: 55, y: 66, w: 23, h: 18 },
  { id: 'jeonbuk', name: '전북', type: '도', x: 34, y: 57, w: 22, h: 17 },
  { id: 'gwangju', name: '광주', type: '광역시', x: 36, y: 73, w: 12, h: 8 },
  { id: 'jeonnam', name: '전남', type: '도', x: 24, y: 76, w: 27, h: 18 },
  { id: 'jeju', name: '제주', type: '특별자치도', x: 42, y: 94, w: 18, h: 6 },
];

export const provinceGroups = [
  {
    id: 'gyeonggi-do',
    name: '경기도',
    regionIds: ['seoul', 'incheon', 'gyeonggi'],
    note: '경기도 시 목록',
    points: '25,23 36,7 50,6 58,18 55,30 43,35 31,31',
    labelX: 42,
    labelY: 22,
    imagePolygon: '30% 8%, 50% 8%, 58% 19%, 52% 35%, 32% 37%, 22% 28%, 23% 16%',
    crop: { x: 150, y: 55, width: 270, height: 275 },
  },
  {
    id: 'gangwon-do',
    name: '강원특별자치도',
    regionIds: ['gangwon'],
    note: '강원 시 목록',
    points: '50,6 68,9 85,21 88,36 76,39 65,37 55,30 58,18',
    labelX: 70,
    labelY: 24,
    imagePolygon: '50% 8%, 63% 7%, 69% 2%, 76% 12%, 84% 33%, 74% 39%, 60% 35%, 54% 25%',
    crop: { x: 365, y: 12, width: 255, height: 335 },
  },
  {
    id: 'chungbuk-do',
    name: '충청북도',
    regionIds: ['chungbuk'],
    note: '충북 시 목록',
    points: '43,35 55,30 65,37 66,51 57,57 48,52 41,44',
    labelX: 54,
    labelY: 44,
    imagePolygon: '42% 36%, 56% 34%, 64% 44%, 58% 56%, 43% 53%, 38% 44%',
    crop: { x: 285, y: 285, width: 205, height: 215 },
  },
  {
    id: 'chungnam-do',
    name: '충청남도',
    regionIds: ['chungnam', 'daejeon', 'sejong'],
    note: '충남 시 목록',
    points: '18,36 31,31 43,35 41,44 48,52 40,60 27,57 18,51',
    labelX: 32,
    labelY: 46,
    imagePolygon: '20% 36%, 39% 36%, 45% 47%, 36% 60%, 19% 54%, 14% 45%',
    crop: { x: 88, y: 305, width: 290, height: 250 },
  },
  {
    id: 'jeonbuk-do',
    name: '전북특별자치도',
    regionIds: ['jeonbuk'],
    note: '전북 시 목록',
    points: '27,57 40,60 48,52 57,57 62,65 55,75 41,75 29,68',
    labelX: 44,
    labelY: 66,
    imagePolygon: '25% 55%, 45% 54%, 52% 65%, 45% 74%, 29% 72%, 21% 64%',
    crop: { x: 145, y: 465, width: 270, height: 220 },
  },
  {
    id: 'jeonnam-do',
    name: '전라남도',
    regionIds: ['jeonnam', 'gwangju'],
    note: '전남 시 목록',
    points: '29,68 41,75 55,75 59,84 52,89 42,96 28,91 17,82 23,67',
    labelX: 39,
    labelY: 82,
    imagePolygon: '19% 68%, 43% 70%, 48% 84%, 34% 93%, 13% 89%, 8% 77%',
    crop: { x: 35, y: 560, width: 355, height: 295 },
  },
  {
    id: 'gyeongbuk-do',
    name: '경상북도',
    regionIds: ['gyeongbuk', 'daegu'],
    note: '경북 시 목록',
    points: '65,37 76,39 88,36 91,54 84,70 72,68 62,65 57,57 66,51',
    labelX: 74,
    labelY: 53,
    imagePolygon: '56% 38%, 76% 38%, 84% 50%, 80% 68%, 62% 67%, 52% 56%',
    crop: { x: 380, y: 295, width: 285, height: 325 },
  },
  {
    id: 'gyeongnam-do',
    name: '경상남도',
    regionIds: ['gyeongnam', 'busan', 'ulsan'],
    note: '경남 시 목록',
    points: '62,65 72,68 84,70 80,82 67,91 59,84 55,75',
    labelX: 69,
    labelY: 77,
    imagePolygon: '48% 65%, 72% 65%, 82% 76%, 72% 86%, 51% 82%, 43% 73%',
    crop: { x: 310, y: 555, width: 340, height: 245 },
  },
  {
    id: 'jeju-do',
    name: '제주특별자치도',
    regionIds: ['jeju'],
    note: '제주 행정시 목록',
    points: '33,100 40,97 52,98 62,101 55,104 42,104',
    labelX: 48,
    labelY: 101.5,
    imagePolygon: '72% 83%, 94% 83%, 94% 98%, 72% 98%',
    crop: { x: 525, y: 730, width: 205, height: 145 },
  },
];

export const detailLayouts = {
  'gyeonggi-do': {
    viewBox: '0 0 100 104',
    coast: 'M16 25 C24 17 29 10 40 8 M17 37 C10 48 15 62 25 71 M78 25 C85 37 85 55 77 68',
    islands: [
      { cx: 13, cy: 45, r: 2.2 },
      { cx: 17, cy: 54, r: 1.4 },
    ],
    shapes: [
      { id: 'gyeonggi', points: '28,18 43,7 62,10 78,27 75,54 61,75 38,75 20,60 18,39', labelX: 53, labelY: 25 },
      { id: 'incheon', points: '15,38 28,34 38,42 35,56 22,60 13,51', labelX: 25, labelY: 48 },
      { id: 'seoul', points: '43,37 53,34 61,41 58,51 47,53 39,45', labelX: 50, labelY: 45 },
    ],
  },
  'gangwon-do': {
    viewBox: '0 0 100 104',
    coast: 'M78 7 C84 21 89 38 86 56 C84 70 76 82 68 92',
    shapes: [
      { id: 'gangwon', points: '26,13 51,5 75,11 88,31 84,58 69,85 43,91 22,72 17,42', labelX: 55, labelY: 48 },
    ],
  },
  'chungbuk-do': {
    viewBox: '0 0 100 104',
    coast: 'M41 14 C54 19 65 28 74 41 M25 66 C40 77 56 84 72 82',
    shapes: [
      { id: 'chungbuk', points: '37,12 61,20 76,42 71,68 53,88 30,75 21,51 25,28', labelX: 50, labelY: 52 },
    ],
  },
  'chungnam-do': {
    viewBox: '0 0 100 104',
    coast: 'M20 23 C10 36 9 54 18 71 M16 79 C27 87 42 91 57 86',
    islands: [
      { cx: 13, cy: 39, r: 2 },
      { cx: 11, cy: 53, r: 1.5 },
      { cx: 18, cy: 66, r: 1.4 },
    ],
    shapes: [
      { id: 'chungnam', points: '21,25 45,16 66,26 72,49 61,72 38,82 18,68 13,45', labelX: 38, labelY: 47 },
      { id: 'sejong', points: '56,37 67,39 68,49 58,53 51,46', labelX: 60, labelY: 46 },
      { id: 'daejeon', points: '55,58 67,56 73,64 68,74 56,73 50,65', labelX: 62, labelY: 66 },
    ],
  },
  'jeonbuk-do': {
    viewBox: '0 0 100 104',
    coast: 'M23 28 C14 42 14 59 25 75 M25 82 C41 91 62 90 77 78',
    shapes: [
      { id: 'jeonbuk', points: '25,23 51,15 75,25 83,48 74,73 50,88 27,77 16,55', labelX: 50, labelY: 52 },
    ],
  },
  'jeonnam-do': {
    viewBox: '0 0 100 104',
    coast: 'M15 23 C8 40 8 63 20 78 C33 94 58 97 79 84 M22 81 C17 88 12 93 7 97',
    islands: [
      { cx: 18, cy: 85, r: 1.8 },
      { cx: 27, cy: 92, r: 1.4 },
      { cx: 36, cy: 88, r: 1.6 },
      { cx: 48, cy: 94, r: 1.3 },
    ],
    shapes: [
      { id: 'jeonnam', points: '21,22 44,15 69,24 83,45 80,70 62,88 35,85 15,68 12,43', labelX: 48, labelY: 55 },
      { id: 'gwangju', points: '43,44 55,42 63,49 60,60 48,63 39,55', labelX: 51, labelY: 53 },
    ],
  },
  'gyeongbuk-do': {
    viewBox: '0 0 100 104',
    coast: 'M78 12 C88 29 91 51 85 72 C81 84 73 91 64 96',
    shapes: [
      { id: 'gyeongbuk', points: '29,13 55,8 78,17 88,38 84,66 68,87 42,90 23,73 18,43', labelX: 55, labelY: 42 },
      { id: 'daegu', points: '50,61 63,58 71,66 67,78 53,79 45,69', labelX: 58, labelY: 69 },
    ],
  },
  'gyeongnam-do': {
    viewBox: '0 0 100 104',
    coast: 'M18 48 C22 72 44 89 68 84 C80 81 88 70 91 57 M28 83 C37 93 53 96 66 91',
    islands: [
      { cx: 47, cy: 88, r: 1.5 },
      { cx: 56, cy: 91, r: 1.3 },
      { cx: 34, cy: 82, r: 1.2 },
    ],
    shapes: [
      { id: 'gyeongnam', points: '18,37 42,25 68,32 77,54 69,77 45,86 23,73 12,54', labelX: 42, labelY: 56 },
      { id: 'ulsan', points: '72,29 86,34 91,48 84,60 72,56 67,42', labelX: 79, labelY: 46 },
      { id: 'busan', points: '66,65 80,62 89,71 84,83 68,82 61,73', labelX: 75, labelY: 74 },
    ],
  },
  'jeju-do': {
    viewBox: '0 0 100 104',
    coast: 'M18 53 C32 39 60 34 81 46 C90 52 88 63 77 70 C56 82 26 75 16 63',
    islands: [
      { cx: 78, cy: 34, r: 1.6 },
      { cx: 83, cy: 38, r: 1.1 },
    ],
    shapes: [
      { id: 'jeju', points: '17,54 32,43 55,39 78,46 86,58 76,70 52,77 27,71 12,62', labelX: 50, labelY: 59 },
    ],
  },
};

export const detailPlaces = {
  seoul: ['종로구', '중구', '마포구', '용산구', '성동구', '강남구'],
  incheon: ['중구', '연수구', '강화군', '옹진군', '부평구'],
  gyeonggi: [
    '수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '동두천시',
    '평택시', '안산시', '고양시', '과천시', '구리시', '남양주시', '오산시',
    '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시',
    '안성시', '김포시', '화성시', '광주시', '양주시', '포천시', '여주시',
  ],
  gangwon: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시'],
  chungbuk: ['청주시', '충주시', '제천시'],
  chungnam: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시'],
  daejeon: ['동구', '중구', '서구', '유성구', '대덕구'],
  sejong: ['조치원읍', '금남면', '한솔동', '도담동'],
  gyeongbuk: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시'],
  daegu: ['중구', '수성구', '달서구', '군위군'],
  ulsan: ['중구', '남구', '동구', '울주군'],
  busan: ['해운대구', '수영구', '중구', '영도구', '기장군'],
  gyeongnam: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
  jeonbuk: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'],
  gwangju: ['동구', '서구', '남구', '북구', '광산구'],
  jeonnam: ['목포시', '여수시', '순천시', '나주시', '광양시'],
  jeju: ['제주시', '서귀포시'],
};

export const boards = ['내 한국 여행 지도', '커플 여행 지도', '친구 여행 지도', '가족 여행 지도'];

export const starterRecords = [
  {
    id: 1,
    regionId: 'jeju',
    startDate: '2026-04-14',
    endDate: '2026-04-16',
    title: '바람 많은 제주 산책',
    companions: '엄마, 아빠',
    memo: '협재 바다 앞에서 오래 앉아 있었고, 저녁에는 작은 식당에서 갈치구이를 먹었다.',
    board: '가족 여행 지도',
    photos: [
      { id: 101, src: heroImage, caption: '햇빛이 들어오던 여행 노트' },
    ],
  },
  {
    id: 2,
    regionId: 'seoul',
    startDate: '2026-05-02',
    endDate: '2026-05-02',
    title: '궁 옆 골목 카페',
    companions: '지민',
    memo: '걸어서 만난 오래된 골목과 하늘색 문이 마음에 남았다.',
    board: '친구 여행 지도',
    photos: [
      { id: 201, src: heroImage, caption: '서울에서 모은 장면들' },
    ],
  },
  {
    id: 3,
    regionId: 'busan',
    startDate: '2026-05-21',
    endDate: '2026-05-22',
    title: '해운대 밤바다',
    companions: '현우',
    memo: '파도 소리를 들으면서 다음 여행지를 같이 골랐다.',
    board: '커플 여행 지도',
    photos: [
      { id: 301, src: heroImage, caption: '바다 여행 엽서' },
    ],
  },
];

export const emptyForm = {
  regionId: 'seoul',
  startDate: '',
  endDate: '',
  title: '',
  companions: '',
  memo: '',
  board: boards[0],
  photos: [],
};

export const districtCells = [
  { points: '30,54 46,50 50,63 36,70 25,63', labelX: 37, labelY: 61 },
  { points: '49,50 66,52 73,65 57,71 50,63', labelX: 61, labelY: 62 },
  { points: '24,66 37,72 38,86 22,84 14,74', labelX: 27, labelY: 78 },
  { points: '39,72 56,70 59,86 43,91 38,84', labelX: 49, labelY: 81 },
  { points: '58,70 74,66 86,76 78,89 60,86', labelX: 70, labelY: 79 },
  { points: '33,37 52,32 65,42 49,50 32,49', labelX: 49, labelY: 43 },
];
