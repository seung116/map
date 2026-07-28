import { useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';
import { firebaseEnabled } from '../lib/firebase';
import { saveUserDateProfile } from '../services/authStore';
import {
  daysSince,
  formatDateLabel,
  loadCoupleProfile,
  loadDateStartDate,
  normalizeCoupleProfile,
  saveCoupleProfile,
  saveDateStartDate,
} from '../utils/dateProfile';

function compressProfilePhoto(file, maxWidth = 480, quality = 0.82) {
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
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    reader.onload = () => {
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function MyPage() {
  const auth = useAuth();
  const userId = auth?.user?.uid;
  const initialDateStartDate = auth?.profile?.dateStartDate || loadDateStartDate(userId);
  const initialCoupleProfile = normalizeCoupleProfile(auth?.profile?.coupleProfile || loadCoupleProfile(userId));
  const [dateStartDate, setDateStartDate] = useState(() => initialDateStartDate);
  const [draftDateStartDate, setDraftDateStartDate] = useState(() => initialDateStartDate);
  const [coupleProfile, setCoupleProfile] = useState(() => initialCoupleProfile);
  const [draftProfile, setDraftProfile] = useState(() => initialCoupleProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const dateDayCount = useMemo(() => daysSince(dateStartDate), [dateStartDate]);
  const draftDateDayCount = useMemo(() => daysSince(draftDateStartDate), [draftDateStartDate]);
  const displayDateStartDate = isEditingProfile ? draftDateStartDate : dateStartDate;
  const displayDateDayCount = isEditingProfile ? draftDateDayCount : dateDayCount;

  const updateDateStartDate = (value) => {
    setDraftDateStartDate(value);
  };

  const updateProfile = (key, value) => {
    setDraftProfile((current) => ({ ...current, [key]: value }));
  };

  const updateProfilePhoto = async (key, file) => {
    if (!file) return;
    try {
      const compressedPhoto = await compressProfilePhoto(file);
      updateProfile(key, compressedPhoto);
    } catch (error) {
      console.error('Profile photo load failed:', error);
      window.alert('프로필 사진을 불러오지 못했습니다. 다른 사진을 선택해주세요.');
    }
  };

  const editProfile = () => {
    setDraftProfile(coupleProfile);
    setDraftDateStartDate(dateStartDate);
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    try {
      setIsSavingProfile(true);
      let savedProfile = draftProfile;
      if (firebaseEnabled && userId) {
        savedProfile = await saveUserDateProfile(userId, {
          dateStartDate: draftDateStartDate,
          coupleProfile: draftProfile,
        });
      }

      setDateStartDate(draftDateStartDate);
      setCoupleProfile(savedProfile);
      setDraftProfile(savedProfile);
      saveDateStartDate(userId, draftDateStartDate);
      saveCoupleProfile(userId, savedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Date profile save failed:', error);
      window.alert('프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const cancelProfileEdit = () => {
    if (isSavingProfile) return;
    setDraftProfile(coupleProfile);
    setDraftDateStartDate(dateStartDate);
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
            <strong>{formatDateLabel(displayDateStartDate)}</strong>
          </div>
          <div>
            <span>함께한 시간</span>
            <strong>{displayDateDayCount ? `${displayDateDayCount}일째` : '날짜를 입력해주세요'}</strong>
          </div>
          <label>
            언제 만나기 시작했나요?
            <input readOnly={!isEditingProfile} type="date" value={displayDateStartDate} onChange={(event) => updateDateStartDate(event.target.value)} />
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
                <button className="secondary-button" type="button" onClick={cancelProfileEdit} disabled={isSavingProfile}>취소</button>
                <button className="primary-button" type="button" onClick={saveProfile} disabled={isSavingProfile}>{isSavingProfile ? '저장 중' : '저장'}</button>
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
              {isEditingProfile && <input type="file" accept="image/*" onChange={(event) => updateProfilePhoto('boyfriendPhoto', event.target.files?.[0])} disabled={isSavingProfile} />}
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
                생일
                <input readOnly={!isEditingProfile} type="date" value={profile.boyfriendBirthday} onChange={(event) => updateProfile('boyfriendBirthday', event.target.value)} />
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
              {isEditingProfile && <input type="file" accept="image/*" onChange={(event) => updateProfilePhoto('girlfriendPhoto', event.target.files?.[0])} disabled={isSavingProfile} />}
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
                생일
                <input readOnly={!isEditingProfile} type="date" value={profile.girlfriendBirthday} onChange={(event) => updateProfile('girlfriendBirthday', event.target.value)} />
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
