export function dateStartStorageKey(userId) {
  return `date-start-date-${userId || 'local'}`;
}

export function coupleProfileStorageKey(userId) {
  return `couple-profile-${userId || 'local'}`;
}

export function loadDateStartDate(userId) {
  return localStorage.getItem(dateStartStorageKey(userId)) || '';
}

export function saveDateStartDate(userId, value) {
  const storageKey = dateStartStorageKey(userId);
  if (value) {
    localStorage.setItem(storageKey, value);
    return;
  }

  localStorage.removeItem(storageKey);
}

export function loadCoupleProfile(userId) {
  const saved = localStorage.getItem(coupleProfileStorageKey(userId));
  if (!saved) {
    return {
      boyfriendName: '',
      boyfriendNickname: '',
      girlfriendName: '',
      girlfriendNickname: '',
    };
  }

  try {
    return {
      boyfriendName: '',
      boyfriendNickname: '',
      girlfriendName: '',
      girlfriendNickname: '',
      ...JSON.parse(saved),
    };
  } catch {
    return {
      boyfriendName: '',
      boyfriendNickname: '',
      girlfriendName: '',
      girlfriendNickname: '',
    };
  }
}

export function saveCoupleProfile(userId, profile) {
  localStorage.setItem(coupleProfileStorageKey(userId), JSON.stringify(profile));
}

export function formatDateLabel(value) {
  if (!value) return '아직 입력 전';
  return value.replaceAll('-', '.');
}

export function daysSince(value) {
  if (!value) return null;
  const start = new Date(`${value}T00:00:00`);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (Number.isNaN(start.getTime())) return null;

  const diff = todayDate.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}
