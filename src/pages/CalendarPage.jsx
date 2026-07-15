import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { recordRegionId, recordStartDate, regionName } from '../utils/travelUtils';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

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

export default function CalendarPage({ records }) {
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

  const recordsByDate = useMemo(() => records.reduce((groups, record) => {
    const dateKey = recordStartDate(record);
    if (!dateKey) return groups;

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(record);
    return groups;
  }, {}), [records]);
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const currentMonthRecordCount = calendarDays
    .filter((day) => day.isCurrentMonth)
    .reduce((total, day) => total + (recordsByDate[day.key]?.length || 0), 0);

  return (
    <AppShell>
      <main className="page calendar-page">
        <section className="section-heading inline calendar-heading">
          <div>
            <p>Travel Calendar</p>
            <h1>여행 달력</h1>
            <span className="calendar-summary">
              여행 기록을 저장한 날짜에 맞춰 한 달 단위로 모아봅니다.
            </span>
          </div>
          <div className="calendar-controls" aria-label="달력 월 이동">
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))}>이전</button>
            <strong>{monthLabel(currentMonth)}</strong>
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))}>다음</button>
            <button type="button" onClick={() => setCurrentMonth(formatMonthKey(new Date()))}>오늘</button>
          </div>
        </section>

        <section className="calendar-panel" aria-label={`${monthLabel(currentMonth)} 여행 기록 달력`}>
          <div className="calendar-month-meta">
            <strong>{currentMonthRecordCount}개 기록</strong>
            <span>{monthLabel(currentMonth)}에 저장된 여행 기록</span>
          </div>
          <div className="calendar-weekdays">
            {weekdays.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDays.map((day) => {
              const dayRecords = recordsByDate[day.key] || [];
              return (
                <article
                  className={`calendar-day ${day.isCurrentMonth ? '' : 'is-muted'} ${day.isToday ? 'is-today' : ''}`}
                  key={day.key}
                >
                  <div className="calendar-day-top">
                    <time dateTime={day.key}>{day.day}</time>
                    {dayRecords.length > 0 && <span>{dayRecords.length}</span>}
                  </div>
                  <div className="calendar-records">
                    {dayRecords.map((record) => (
                      <Link key={record.id} className="calendar-record" to={`/write/${record.id}`}>
                        <strong>{record.title}</strong>
                        <small>{regionName(recordRegionId(record))}{record.cityName ? ` ${record.cityName}` : ''}</small>
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
