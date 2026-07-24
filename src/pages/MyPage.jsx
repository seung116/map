import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';
import { daysSince, formatDateLabel, loadDateStartDate, saveDateStartDate } from '../utils/dateProfile';

export default function MyPage() {
  const auth = useAuth();
  const userId = auth?.user?.uid;
  const [dateStartDate, setDateStartDate] = useState(() => loadDateStartDate(userId));
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);

  const updateDateStartDate = (value) => {
    setDateStartDate(value);
    saveDateStartDate(userId, value);
  };

  return (
    <AppShell>
      <main className="page my-page">
        <section className="section-heading">
          <h1>마이페이지</h1>
          <span>데이트 기록에 표시할 처음 만난 날을 관리합니다.</span>
        </section>

        <section className="date-start-panel my-date-panel" aria-label="만난 날짜 설정">
          <div>
            <span>처음 만난 날</span>
            <strong>{formatDateLabel(dateStartDate)}</strong>
          </div>
          <div>
            <span>함께한 시간</span>
            <strong>{dateDayCount ? `${dateDayCount}일째` : '날짜를 입력해주세요'}</strong>
          </div>
          <label>
            언제 만나기 시작했나요?
            <input type="date" value={dateStartDate} onChange={(event) => updateDateStartDate(event.target.value)} />
          </label>
        </section>
      </main>
    </AppShell>
  );
}
