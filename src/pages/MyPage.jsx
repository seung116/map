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
  const [draftProfile, setDraftProfile] = useState(() => loadCoupleProfile(userId));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);

  const updateDateStartDate = (value) => {
    setDateStartDate(value);
    saveDateStartDate(userId, value);
  };

  const updateProfile = (key, value) => {
    setDraftProfile((current) => ({ ...current, [key]: value }));
  };

  const updateProfilePhoto = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile(key, reader.result || '');
    reader.readAsDataURL(file);
  };

  const editProfile = () => {
    setDraftProfile(coupleProfile);
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    setCoupleProfile(draftProfile);
    saveCoupleProfile(userId, draftProfile);
    setIsEditingProfile(false);
  };

  const cancelProfileEdit = () => {
    setDraftProfile(coupleProfile);
    setIsEditingProfile(false);
  };

  const profile = isEditingProfile ? draftProfile : coupleProfile;

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

        <section className="couple-profile-header">
          <div>
            <h2>커플 프로필</h2>
            <span>프로필 사진, 이름, 애칭, 특징을 저장해둘 수 있어요.</span>
          </div>
          <div className="profile-edit-actions">
            {isEditingProfile ? (
              <>
                <button className="secondary-button" type="button" onClick={cancelProfileEdit}>취소</button>
                <button className="primary-button" type="button" onClick={saveProfile}>저장</button>
              </>
            ) : (
              <button className="primary-button" type="button" onClick={editProfile}>수정</button>
            )}
          </div>
        </section>

        <section className="couple-profile-section" aria-label="커플 프로필">
          <article className="couple-profile-card boyfriend-profile">
            <label className="couple-profile-photo">
              {profile.boyfriendPhoto ? <img src={profile.boyfriendPhoto} alt="남자친구 프로필" /> : <span>남</span>}
              {isEditingProfile && <input type="file" accept="image/*" onChange={(event) => updateProfilePhoto('boyfriendPhoto', event.target.files?.[0])} />}
            </label>
            <div>
              <h2>남자친구 프로필</h2>
              <label>
                이름
                <input readOnly={!isEditingProfile} value={profile.boyfriendName} onChange={(event) => updateProfile('boyfriendName', event.target.value)} placeholder="이름을 입력하세요" />
              </label>
              <label>
                애칭
                <input readOnly={!isEditingProfile} value={profile.boyfriendNickname} onChange={(event) => updateProfile('boyfriendNickname', event.target.value)} placeholder="예: 곰돌이" />
              </label>
              <label>
                특징
                <textarea readOnly={!isEditingProfile} value={profile.boyfriendTraits} onChange={(event) => updateProfile('boyfriendTraits', event.target.value)} placeholder="좋아하는 것, 성격, 기억하고 싶은 특징" />
              </label>
            </div>
          </article>

          <article className="couple-profile-card girlfriend-profile">
            <label className="couple-profile-photo">
              {profile.girlfriendPhoto ? <img src={profile.girlfriendPhoto} alt="여자친구 프로필" /> : <span>여</span>}
              {isEditingProfile && <input type="file" accept="image/*" onChange={(event) => updateProfilePhoto('girlfriendPhoto', event.target.files?.[0])} />}
            </label>
            <div>
              <h2>여자친구 프로필</h2>
              <label>
                이름
                <input readOnly={!isEditingProfile} value={profile.girlfriendName} onChange={(event) => updateProfile('girlfriendName', event.target.value)} placeholder="이름을 입력하세요" />
              </label>
              <label>
                애칭
                <input readOnly={!isEditingProfile} value={profile.girlfriendNickname} onChange={(event) => updateProfile('girlfriendNickname', event.target.value)} placeholder="예: 토끼" />
              </label>
              <label>
                특징
                <textarea readOnly={!isEditingProfile} value={profile.girlfriendTraits} onChange={(event) => updateProfile('girlfriendTraits', event.target.value)} placeholder="좋아하는 것, 성격, 기억하고 싶은 특징" />
              </label>
            </div>
          </article>
        </section>
      </main>
    </AppShell>
  );
}
