import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';
import { loadCoupleProfile, loadDateStartDate, normalizeCoupleProfile } from '../utils/dateProfile';
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
const coupleDayMilestones = [100, 200, 300];

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

function eventDateKeyForYear(dateValue, year) {
  if (!dateValue) return '';
  const [, month, day] = dateValue.split('-');
  if (!month || !day) return '';
  return `${year}-${month}-${day}`;
}

function anniversaryDateKey(startDateValue, years) {
  const startDate = parseLocalDate(startDateValue);
  if (!startDate) return '';
  const nextDate = new Date(startDate);
  nextDate.setFullYear(startDate.getFullYear() + years);
  return formatDateKey(nextDate);
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

function addSpecialEvent(groups, event) {
  if (!event.dateKey) return;
  if (!groups[event.dateKey]) groups[event.dateKey] = [];
  groups[event.dateKey].push(event);
}

function buildSpecialEventsByDate(calendarDays, dateStartDate, coupleProfile) {
  const visibleDateKeys = new Set(calendarDays.map((day) => day.key));
  const visibleYears = [...new Set(calendarDays.map((day) => Number(day.key.slice(0, 4))))];
  const groups = {};
  const startDate = parseLocalDate(dateStartDate);

  if (startDate) {
    coupleDayMilestones.forEach((milestone) => {
      const dateKey = formatDateKey(addDays(startDate, milestone - 1));
      if (visibleDateKeys.has(dateKey)) {
        addSpecialEvent(groups, {
          id: `couple-${milestone}`,
          dateKey,
          title: `${milestone}일`,
          detail: '커플 기념일',
        });
      }
    });

    visibleYears.forEach((year) => {
      const yearsTogether = year - startDate.getFullYear();
      if (yearsTogether <= 0) return;
      const dateKey = anniversaryDateKey(dateStartDate, yearsTogether);
      if (visibleDateKeys.has(dateKey)) {
        addSpecialEvent(groups, {
          id: `anniversary-${yearsTogether}`,
          dateKey,
          title: `${yearsTogether}주년`,
          detail: '커플 기념일',
        });
      }
    });
  }

  visibleYears.forEach((year) => {
    const boyfriendBirthdayKey = eventDateKeyForYear(coupleProfile.boyfriendBirthday, year);
    if (visibleDateKeys.has(boyfriendBirthdayKey)) {
      addSpecialEvent(groups, {
        id: `boyfriend-birthday-${year}`,
        dateKey: boyfriendBirthdayKey,
        title: `${coupleProfile.boyfriendNickname || coupleProfile.boyfriendName || '남자친구'} 생일`,
        detail: '생일',
      });
    }

    const girlfriendBirthdayKey = eventDateKeyForYear(coupleProfile.girlfriendBirthday, year);
    if (visibleDateKeys.has(girlfriendBirthdayKey)) {
      addSpecialEvent(groups, {
        id: `girlfriend-birthday-${year}`,
        dateKey: girlfriendBirthdayKey,
        title: `${coupleProfile.girlfriendNickname || coupleProfile.girlfriendName || '여자친구'} 생일`,
        detail: '생일',
      });
    }
  });

  return groups;
}

export default function CalendarPage({ records, setRecords, basePath = '', archiveType = 'travel' }) {
  const auth = useAuth();
  const isDateArchive = archiveType === 'date';
  const isAllArchive = archiveType === 'all';
  const archiveLabel = isAllArchive ? '전체' : isDateArchive ? '데이트' : '여행';
  const dateStartDate = auth?.profile?.dateStartDate || loadDateStartDate(auth?.user?.uid);
  const coupleProfile = normalizeCoupleProfile(auth?.profile?.coupleProfile || loadCoupleProfile(auth?.user?.uid));
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
  const specialEventsByDate = useMemo(
    () => buildSpecialEventsByDate(calendarDays, dateStartDate, coupleProfile),
    [calendarDays, dateStartDate, coupleProfile],
  );
  const currentMonthRecordCount = calendarDays
    .filter((day) => day.isCurrentMonth)
    .reduce((total, day) => total + (recordsByDate[day.key]?.length || 0), 0);
  const currentMonthSpecialCount = calendarDays
    .filter((day) => day.isCurrentMonth)
    .reduce((total, day) => total + (specialEventsByDate[day.key]?.length || 0), 0);
  const selectedDateRecords = recordsByDate[selectedDate] || [];
  const selectedDateEvents = specialEventsByDate[selectedDate] || [];
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
            <strong>{currentMonthRecordCount + currentMonthSpecialCount}개 일정</strong>
            <span>{monthLabel(currentMonth)}에 저장된 기록과 기념일</span>
          </div>
          <div className="calendar-weekdays">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day) => {
              const tripBlocks = tripBlocksByDate[day.key] || [];
              const specialEvents = specialEventsByDate[day.key] || [];
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
                    {specialEvents.map((event) => (
                      <button
                        key={event.id}
                        className="calendar-special-block"
                        type="button"
                        onClick={() => setSelectedDate(day.key)}
                        aria-label={`${event.title} · ${event.detail}`}
                        title={`${event.title} · ${event.detail}`}
                      >
                        <span className="calendar-trip-label">
                          <strong>{event.title}</strong>
                          <small>{event.detail}</small>
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
            <strong>{selectedDateRecords.length + selectedDateEvents.length}개 일정</strong>
          </div>
          {selectedDateRecords.length > 0 || selectedDateEvents.length > 0 ? (
            <div className="calendar-detail-list">
              {selectedDateEvents.map((event) => (
                <article key={event.id} className="calendar-anniversary-card">
                  <span>{event.detail}</span>
                  <strong>{event.title}</strong>
                  <small>{dateLabel(event.dateKey)}</small>
                </article>
              ))}
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
            <p className="calendar-detail-empty">선택한 날짜에 저장된 {isAllArchive ? '기록이나 기념일' : `${archiveLabel} 기록`}이 없습니다.</p>
          )}
        </section>
      </main>
    </AppShell>
  );
}
