import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { emptyForm, regions } from '../data/travelData';
import { getLastRecordSaveError } from '../services/recordStore';
import {
  cityUnitLabel,
  groupRecordsByTrip,
  normalizeRecordDates,
  recordDateRange,
  recordPlaceOptionsFor,
  recordTripEndDate,
  recordTripId,
  recordTripName,
  recordTripStartDate,
  toPhotoFiles,
} from '../utils/travelUtils';

function saveFailureMessage() {
  const error = getLastRecordSaveError();
  const code = error?.code || '';

  if (code === 'storage/unauthorized') {
    return '사진 저장 권한이 막혀 있습니다. Firebase Storage Rules와 계정 승인 상태를 확인해주세요. (storage/unauthorized)';
  }

  if (code === 'storage/bucket-not-found') {
    return 'Firebase Storage 버킷을 찾지 못했습니다. Storage 생성 여부와 VITE_FIREBASE_STORAGE_BUCKET 값을 확인해주세요. (storage/bucket-not-found)';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Firebase Storage 무료 사용량 또는 업로드 한도에 걸렸습니다. 사진 크기를 줄이거나 Firebase 사용량을 확인해주세요. (storage/quota-exceeded)';
  }

  if (code) {
    return `기록 저장에 실패했습니다. Firebase 오류: ${code}`;
  }

  return '기록 저장에 실패했습니다. 사진을 줄이거나 잠시 후 다시 시도해주세요.';
}

function dateInRange(date, startDate, endDate) {
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function tripDateLabel(trip) {
  if (!trip.startDate && !trip.endDate) return '기간 미정';
  if (!trip.endDate || trip.startDate === trip.endDate) return trip.startDate;
  return `${trip.startDate} ~ ${trip.endDate}`;
}

export default function RecordFormPage({ records, setRecords }) {
  const navigate = useNavigate();
  const params = useParams();
  const queryRegion = new URLSearchParams(window.location.search).get('region');
  const queryCity = new URLSearchParams(window.location.search).get('city');
  const editing = records.find((record) => String(record.id) === params.recordId);
  const tripGroups = groupRecordsByTrip(records);
  const [form, setForm] = useState(() => {
    const baseForm = editing
      ? normalizeRecordDates(editing)
      : { ...emptyForm, regionId: queryRegion || emptyForm.regionId };
    const cityOptionsForRegion = recordPlaceOptionsFor(baseForm.regionId);
    const cityName = cityOptionsForRegion.includes(queryCity)
      ? queryCity
      : cityOptionsForRegion.includes(baseForm.cityName)
        ? baseForm.cityName
        : cityOptionsForRegion[0] || '';

    return {
      ...baseForm,
      cityName,
      tripId: editing ? recordTripId(editing) : baseForm.tripId,
      tripName: editing ? recordTripName(editing) : baseForm.tripName,
      tripStartDate: editing ? recordTripStartDate(editing) : baseForm.tripStartDate,
      tripEndDate: editing ? recordTripEndDate(editing) : baseForm.tripEndDate,
    };
  });
  const [tripMode, setTripMode] = useState(() => (editing?.tripId ? 'existing' : 'new'));
  const cityOptions = recordPlaceOptionsFor(form.regionId);
  const cityLabel = cityUnitLabel(form.regionId);
  const selectedTrip = tripGroups.find((group) => group.id === form.tripId);
  const activeTripStartDate = tripMode === 'existing' ? selectedTrip?.startDate || form.tripStartDate : form.tripStartDate;
  const activeTripEndDate = tripMode === 'existing' ? selectedTrip?.endDate || form.tripEndDate : form.tripEndDate;

  const applyTripToForm = (trip) => {
    if (!trip) return;

    setForm((current) => {
      const recordDate = dateInRange(current.startDate, trip.startDate, trip.endDate)
        ? current.startDate
        : trip.startDate;

      return {
        ...current,
        tripId: trip.id,
        tripName: trip.name,
        tripStartDate: trip.startDate,
        tripEndDate: trip.endDate,
        startDate: recordDate,
        endDate: recordDate,
      };
    });
  };

  const selectTripMode = (value) => {
    setTripMode(value);
    if (value === 'existing') {
      applyTripToForm(tripGroups[0]);
      return;
    }

    setForm((current) => ({
      ...current,
      tripId: '',
      tripName: '',
      tripStartDate: '',
      tripEndDate: '',
      startDate: '',
      endDate: '',
    }));
  };

  const selectExistingTrip = (tripId) => {
    const trip = tripGroups.find((group) => group.id === tripId);
    applyTripToForm(trip);
  };

  const update = (key, value) => setForm((current) => {
    if (key === 'tripStartDate') {
      const tripEndDate = current.tripEndDate && current.tripEndDate < value ? value : current.tripEndDate;
      const recordDate = dateInRange(current.startDate, value, tripEndDate) ? current.startDate : value;
      return { ...current, tripStartDate: value, tripEndDate, startDate: recordDate, endDate: recordDate };
    }

    if (key === 'tripEndDate') {
      const tripStartDate = current.tripStartDate && current.tripStartDate > value ? value : current.tripStartDate;
      const recordDate = dateInRange(current.startDate, tripStartDate, value) ? current.startDate : value;
      return { ...current, tripStartDate, tripEndDate: value, startDate: recordDate, endDate: recordDate };
    }

    if (key === 'startDate') {
      return { ...current, startDate: value, endDate: value };
    }

    if (key === 'regionId') {
      const nextCityOptions = recordPlaceOptionsFor(value);
      const cityName = nextCityOptions.includes(current.cityName) ? current.cityName : nextCityOptions[0] || '';
      return { ...current, regionId: value, cityName };
    }

    return { ...current, [key]: value };
  });

  const addPhotos = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const remainingSlots = Math.max(0, 3 - form.photos.length);
    const nextPhotos = await toPhotoFiles(selectedFiles.slice(0, remainingSlots));
    update('photos', [...form.photos, ...nextPhotos]);
    event.target.value = '';

    if (selectedFiles.length > remainingSlots) {
      window.alert('무료 사용량 관리를 위해 사진은 기록당 최대 3장까지 저장됩니다.');
    }
  };

  const updateCaption = (photoId, caption) => {
    update(
      'photos',
      form.photos.map((photo) => (photo.id === photoId ? { ...photo, caption } : photo)),
    );
  };

  const removePhoto = (photoId) => {
    update('photos', form.photos.filter((photo) => photo.id !== photoId));
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    const normalizedForm = normalizeRecordDates(form);
    const tripName = (normalizedForm.tripName || normalizedForm.title || recordDateRange(normalizedForm)).trim();
    const tripId = tripMode === 'existing' && normalizedForm.tripId
      ? normalizedForm.tripId
      : `trip-${Date.now()}`;
    const tripStartDate = tripMode === 'existing'
      ? activeTripStartDate
      : normalizedForm.tripStartDate;
    const tripEndDate = tripMode === 'existing'
      ? activeTripEndDate
      : normalizedForm.tripEndDate;
    const nextRecord = {
      ...normalizedForm,
      id: editing?.id || Date.now(),
      tripId,
      tripName,
      tripStartDate,
      tripEndDate,
      endDate: normalizedForm.startDate,
      photos: form.photos,
    };

    const nextRecords = editing
      ? records.map((record) => (record.id === editing.id ? nextRecord : record))
      : [nextRecord, ...records];

    const saved = await setRecords(nextRecords);
    if (saved) {
      navigate(`/region/${nextRecord.regionId}`);
      return;
    }

    window.alert(saveFailureMessage());
  };

  const deleteRecord = () => {
    if (!editing) return;

    if (window.confirm(`"${editing.title}" 기록을 삭제할까요?`)) {
      setRecords(records.filter((record) => record.id !== editing.id));
      navigate(`/region/${editing.regionId}`);
    }
  };

  return (
    <AppShell>
      <main className="page form-page">
        <section className="section-heading">
          <p>Travel Note</p>
          <h1>{editing ? '여행 기록 수정' : '새 여행 기록 작성'}</h1>
          <span className="form-intro">오늘 남기고 싶은 장면을 사진과 문장으로 천천히 채워보세요.</span>
        </section>

        <form className="record-form" onSubmit={saveRecord}>
          <div className="form-field span-2 trip-field">
            <span>여행 만들기</span>
            <div className="segmented-control">
              <button className={tripMode === 'new' ? 'is-active' : ''} type="button" onClick={() => selectTripMode('new')}>새 여행</button>
              <button className={tripMode === 'existing' ? 'is-active' : ''} type="button" onClick={() => selectTripMode('existing')} disabled={tripGroups.length === 0}>기존 여행</button>
            </div>
            {tripMode === 'existing' && tripGroups.length > 0 ? (
              <>
                <select value={form.tripId || tripGroups[0].id} onChange={(event) => selectExistingTrip(event.target.value)}>
                  {tripGroups.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.name} · {tripDateLabel(trip)} · {trip.records.length}개 기록
                    </option>
                  ))}
                </select>
                <strong className="trip-period-summary">여행 기간 {tripDateLabel(selectedTrip || tripGroups[0])}</strong>
              </>
            ) : (
              <div className="trip-setup-grid">
                <label>
                  여행 이름
                  <input required value={form.tripName} onChange={(event) => update('tripName', event.target.value)} placeholder="예: 2026 제주 가족여행" />
                </label>
                <label>
                  여행 시작일
                  <input required type="date" value={form.tripStartDate} onChange={(event) => update('tripStartDate', event.target.value)} />
                </label>
                <label>
                  여행 종료일
                  <input required type="date" min={form.tripStartDate} value={form.tripEndDate} onChange={(event) => update('tripEndDate', event.target.value)} />
                </label>
              </div>
            )}
          </div>
          <label className="form-field span-2">
            사진 저장 날짜
            <input
              required
              type="date"
              min={activeTripStartDate || undefined}
              max={activeTripEndDate || undefined}
              value={form.startDate}
              onChange={(event) => update('startDate', event.target.value)}
            />
          </label>
          <label className="form-field">
            여행 도/광역시
            <select value={form.regionId} onChange={(event) => update('regionId', event.target.value)}>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            여행 {cityLabel}
            <select required value={form.cityName || ''} onChange={(event) => update('cityName', event.target.value)}>
              <option value="" disabled>{cityLabel} 선택</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
          <label className="form-field span-2">
            날짜별 기록 제목
            <input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="예: 첫날 협재 해변" />
          </label>
          <label className="form-field">
            함께 간 사람
            <input value={form.companions} onChange={(event) => update('companions', event.target.value)} placeholder="쉼표로 구분해 입력" />
          </label>
          <label className="form-field span-2">
            여행 메모
            <textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="사진 속 장면과 같이 기억하고 싶은 문장을 적어보세요." />
          </label>
          <label className="upload-box span-2">
            <input type="file" multiple accept="image/*" onChange={addPhotos} />
            <strong>사진 업로드</strong>
            <span>선택한 사진은 Firebase Storage에 저장되어 앨범에 표시됩니다.</span>
          </label>

          {form.photos.length > 0 && (
            <div className="photo-editor span-2">
              {form.photos.map((photo) => (
                <div key={photo.id} className="photo-edit-card">
                  <img src={photo.src} alt={photo.caption} />
                  <input value={photo.caption} onChange={(event) => updateCaption(photo.id, event.target.value)} />
                  <button type="button" onClick={() => removePhoto(photo.id)}>사진 삭제</button>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions span-2">
            {editing && (
              <button className="delete-record-button" type="button" onClick={deleteRecord}>
                기록 삭제
              </button>
            )}
            <button className="submit-button" type="submit">{editing ? '수정 저장' : '기록 저장'}</button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}
