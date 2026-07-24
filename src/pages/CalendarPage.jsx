import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import {
  recordRegionId,
  recordStartDate,
  recordTripEndDate,
  recordTripId,
  recordTripName,
  recordTripStartDate,
  regionName,
} from '../utils/travelUtils';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const calendarColorOptions = ['#fde5dc', '#dcebd9', '#dcecf4', '#f3e8cf', '#eadff1', '#f8d7df', '#d8eadf', '#e7e1d3'];

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateKey(date) {
  return `${formatMonthKey(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  return `${year}년 ${Number(month)}월`;
}

function buildCalendarDays(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDate = new Date(year, month - 1, 1);
  const startDate = new Date(firstDate);
  startDate.setDate(firstDate.getDate() - firstDate.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      key: formatDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month - 1,
      isToday: formatDateKey(date) === formatDateKey(new Date()),
    };
  });
}

function moveMonth(monthKey, offset) {
  const [year, month] = monthKey.split('-').map(Number);
  return formatMonthKey(new Date(year, month - 1 + offset, 1));
}

function dateLabel(dateKey) {
  const date = parseLocalDate(dateKey);
  if (!date) return '날짜 미정';

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`;
}

function dateKeysBetween(startKey, endKey) {
  const startDate = parseLocalDate(startKey);
  const endDate = parseLocalDate(endKey);
  if (!startDate || !endDate || startDate > endDate) return [];

  const keys = [];
  for (let date = startDate, count = 0; date <= endDate && count < 370; date = addDays(date, 1), count += 1) {
    keys.push(formatDateKey(date));
  }
  return keys;
}

function buildTripBlocksByDate(records) {
  const trips = new Map();

  records.forEach((record) => {
    const dateKey = recordStartDate(record);
    if (!dateKey) return;

    const tripId = recordTripId(record);
    if (!trips.has(tripId)) {
      trips.set(tripId, {
        id: tripId,
        name: recordTripName(record),
        regionId: recordRegionId(record),
        cityName: record.cityName,
        startDate: recordTripStartDate(record) || dateKey,
        endDate: recordTripEndDate(record) || dateKey,
        records: [],
      });
    }

    const trip = trips.get(tripId);
    trip.records.push(record);
    const startDate = recordTripStartDate(record) || dateKey;
    const endDate = recordTripEndDate(record) || dateKey;
    if (startDate && startDate < trip.startDate) trip.startDate = startDate;
    if (endDate && endDate > trip.endDate) trip.endDate = endDate;
  });

  return [...trips.values()]
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id))
    .reduce((groups, trip, tripIndex) => {
      const recordsByDate = trip.records.reduce((dateGroups, record) => {
        const dateKey = recordStartDate(record);
        if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
        dateGroups[dateKey].push(record);
        return dateGroups;
      }, {});
      const dateKeys = dateKeysBetween(trip.startDate, trip.endDate);
      const firstRecord = trip.records[0];

      dateKeys.forEach((dateKey, dateIndex) => {
        const date = parseLocalDate(dateKey);
        const dayRecords = recordsByDate[dateKey] || [];
        const isStart = dateIndex === 0 || date.getDay() === 0;
        const isEnd = dateIndex === dateKeys.length - 1 || date.getDay() === 6;

        if (!groups[dateKey]) groups[dateKey] = [];
        const displayRecord = dayRecords[0] || firstRecord;
        const displayName = displayRecord.type === 'date'
          ? displayRecord.memo || '기분 기록 없음'
          : trip.name;
        groups[dateKey].push({
          ...trip,
          name: displayName,
          calendarColor: displayRecord.calendarColor || firstRecord.calendarColor || '',
          colorIndex: tripIndex % 5,
          dayRecords,
          isStart,
          isEnd,
          showLabel: isStart,
          linkRecordId: dayRecords[0]?.id || firstRecord.id,
        });
      });

      return groups;
    }, {});
}

export default function CalendarPage({ records, setRecords, basePath = '', archiveType = 'travel' }) {
  const isDateArchive = archiveType === 'date';
  const isAllArchive = archiveType === 'all';
  const archiveLabel = isAllArchive ? '전체' : isDateArchive ? '데이트' : '여행';
  const initialMonth = useMemo(() => {
    const latestRecord = records.reduce((latest, record) => {
      const currentDate = recordStartDate(record);
      if (!currentDate) return latest;
      if (!latest || currentDate > recordStartDate(latest)) return record;
      return latest;
    }, null);

    const latestDate = latestRecord ? parseLocalDate(recordStartDate(latestRecord)) : null;
    return formatMonthKey(latestDate || new Date());
  }, [records]);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  const recordsByDate = useMemo(() => records.reduce((groups, record) => {
    const dateKey = recordStartDate(record);
    if (!dateKey) return groups;

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(record);
    return groups;
  }, {}), [records]);
  const tripBlocksByDate = useMemo(() => buildTripBlocksByDate(records), [records]);
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const currentMonthRecordCount = calendarDays
    .filter((day) => day.isCurrentMonth)
    .reduce((total, day) => total + (recordsByDate[day.key]?.length || 0), 0);
  const selectedDateRecords = recordsByDate[selectedDate] || [];
  const updateCalendarColor = async (targetRecord, color) => {
    if (!setRecords) return;
    const targetTripId = recordTripId(targetRecord);
    const nextRecords = records.map((record) => {
      const isSameDateRecord = String(record.id) === String(targetRecord.id);
      const isSameTravelTrip = targetRecord.type !== 'date' && record.type !== 'date' && recordTripId(record) === targetTripId;
      if (!isSameDateRecord && !isSameTravelTrip) return record;
      return { ...record, calendarColor: color };
    });

    await setRecords(nextRecords);
  };

  return (
    <AppShell>
      <main className="page calendar-page">
        <section className="section-heading inline calendar-heading">
          <div>
            <h1>{isAllArchive ? '달력' : `${archiveLabel} 달력`}</h1>
            <span className="calendar-summary">
              {isAllArchive ? '여행 기록과 데이트 기록을 한 달 단위로 함께 모아봅니다.' : `${archiveLabel} 기록을 저장한 날짜에 맞춰 한 달 단위로 모아봅니다.`}
            </span>
          </div>
          <div className="calendar-controls" aria-label="달력 월 이동">
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))}>이전</button>
            <strong>{monthLabel(currentMonth)}</strong>
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))}>다음</button>
            <button type="button" onClick={() => setCurrentMonth(formatMonthKey(new Date()))}>오늘</button>
          </div>
        </section>

        <section className="calendar-panel" aria-label={`${monthLabel(currentMonth)} ${archiveLabel} 기록 달력`}>
          <div className="calendar-month-meta">
            <strong>{currentMonthRecordCount}개 기록</strong>
            <span>{monthLabel(currentMonth)}에 저장된 {isAllArchive ? '여행과 데이트 기록' : `${archiveLabel} 기록`}</span>
          </div>
          <div className="calendar-weekdays">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day) => {
              const tripBlocks = tripBlocksByDate[day.key] || [];
              return (
                <article
                  className={`calendar-day ${day.isCurrentMonth ? '' : 'is-muted'} ${day.isToday ? 'is-today' : ''} ${selectedDate === day.key ? 'is-selected' : ''}`}
                  key={day.key}
                >
                  <button
                    className="calendar-day-top"
                    type="button"
                    onClick={() => setSelectedDate(day.key)}
                    aria-label={`${dateLabel(day.key)} 기록 보기`}
                  >
                    <time dateTime={day.key}>{day.day}</time>
                  </button>
                  <div className="calendar-trip-blocks">
                    {tripBlocks.map((trip) => (
                      <button
                        key={trip.id}
                        className={`calendar-trip-block trip-color-${trip.colorIndex} ${trip.isStart ? 'is-start' : 'is-middle'} ${trip.isEnd ? 'is-end' : ''}`}
                        style={trip.calendarColor ? { '--calendar-block-bg': trip.calendarColor } : undefined}
                        type="button"
                        onClick={() => setSelectedDate(day.key)}
                        aria-label={trip.records[0]?.type === 'date' ? `데이트 · ${trip.name}` : `여행 · ${trip.name} · ${regionName(trip.regionId)}${trip.cityName ? ` ${trip.cityName}` : ''}`}
                        title={trip.records[0]?.type === 'date' ? `데이트 · ${trip.name}` : `여행 · ${trip.name} · ${regionName(trip.regionId)}${trip.cityName ? ` ${trip.cityName}` : ''}`}
                      >
                        <span className={`calendar-trip-label ${trip.showLabel ? '' : 'is-hidden'}`} aria-hidden={!trip.showLabel}>
                          <strong>{trip.name}</strong>
                          <small>{trip.records[0]?.type === 'date' ? '데이트' : `${isAllArchive ? '여행 · ' : ''}${regionName(trip.regionId)}${trip.cityName ? ` ${trip.cityName}` : ''}`}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="calendar-detail-panel" aria-label={`${dateLabel(selectedDate)} ${archiveLabel} 기록`}>
          <div className="calendar-detail-heading">
            <div>
              <h2>{dateLabel(selectedDate)}</h2>
            </div>
            <strong>{selectedDateRecords.length}개 기록</strong>
          </div>
          {selectedDateRecords.length > 0 ? (
            <div className="calendar-detail-list">
              {selectedDateRecords.map((record) => (
                <article key={record.id} className="calendar-detail-record-card">
                  <Link
                    className="calendar-detail-record"
                    style={record.calendarColor ? { '--calendar-detail-bg': record.calendarColor } : undefined}
                    to={`${basePath || (record.type === 'date' ? '/date' : '/travel')}/write/${record.id}`}
                  >
                    <span>{recordTripName(record)}</span>
                    <strong>{record.title}</strong>
                    <small>{record.type === 'date' ? `데이트 · ${record.cityName || '장소 미정'}` : `${isAllArchive ? '여행 · ' : ''}${regionName(recordRegionId(record))}${record.cityName ? ` ${record.cityName}` : ''}`}</small>
                  </Link>
                  <div className="calendar-color-picker" aria-label={`${record.title} 달력 색상 선택`}>
                    {calendarColorOptions.map((color) => (
                      <button
                        key={color}
                        className={record.calendarColor === color ? 'is-selected' : ''}
                        type="button"
                        style={{ '--swatch-color': color }}
                        onClick={() => updateCalendarColor(record, color)}
                        aria-label={`${record.title} 색상 변경`}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="calendar-detail-empty">선택한 날짜에 저장된 {isAllArchive ? '여행이나 데이트' : archiveLabel} 기록이 없습니다.</p>
          )}
        </section>
      </main>
    </AppShell>
  );
}
