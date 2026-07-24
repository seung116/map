import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';
import {
  daysSince,
  formatDateLabel,
  loadCoupleProfile,
  loadDateStartDate,
  saveCoupleProfile,
  saveDateStartDate,
} from '../utils/dateProfile';

export default function MyPage() {
  const auth = useAuth();
  const userId = auth?.user?.uid;
  const [dateStartDate, setDateStartDate] = useState(() => loadDateStartDate(userId));
  const [coupleProfile, setCoupleProfile] = useState(() => loadCoupleProfile(userId));
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);

  const updateDateStartDate = (value) => {
    setDateStartDate(value);
    saveDateStartDate(userId, value);
  };

  const updateProfile = (key, value) => {
    setCoupleProfile((current) => {
      const nextProfile = { ...current, [key]: value };
      saveCoupleProfile(userId, nextProfile);
      return nextProfile;
    });
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

        <section className="couple-profile-section" aria-label="커플 프로필">
          <article className="couple-profile-card boyfriend-profile">
            <div className="couple-profile-avatar">남</div>
            <div>
              <h2>남자친구 프로필</h2>
              <label>
                이름
                <input value={coupleProfile.boyfriendName} onChange={(event) => updateProfile('boyfriendName', event.target.value)} placeholder="이름을 입력하세요" />
              </label>
              <label>
                애칭
                <input value={coupleProfile.boyfriendNickname} onChange={(event) => updateProfile('boyfriendNickname', event.target.value)} placeholder="예: 곰돌이" />
              </label>
            </div>
          </article>

          <article className="couple-profile-card girlfriend-profile">
            <div className="couple-profile-avatar">여</div>
            <div>
              <h2>여자친구 프로필</h2>
              <label>
                이름
                <input value={coupleProfile.girlfriendName} onChange={(event) => updateProfile('girlfriendName', event.target.value)} placeholder="이름을 입력하세요" />
              </label>
              <label>
                애칭
                <input value={coupleProfile.girlfriendNickname} onChange={(event) => updateProfile('girlfriendNickname', event.target.value)} placeholder="예: 토끼" />
              </label>
            </div>
          </article>
        </section>
      </main>
    </AppShell>
  );
}
