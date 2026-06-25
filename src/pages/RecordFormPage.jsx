import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import heroImage from '../assets/korea-travel-memories.png';
import AppShell from '../components/AppShell';
import { emptyForm, regions } from '../data/travelData';
import { normalizeRecordDates, toPhotoFiles } from '../utils/travelUtils';

export default function RecordFormPage({ records, setRecords }) {
  const navigate = useNavigate();
  const params = useParams();
  const queryRegion = new URLSearchParams(window.location.search).get('region');
  const editing = records.find((record) => String(record.id) === params.recordId);
  const [form, setForm] = useState(() =>
    editing ? normalizeRecordDates(editing) : { ...emptyForm, regionId: queryRegion || emptyForm.regionId },
  );

  const update = (key, value) => setForm((current) => {
    if (key === 'startDate' && current.endDate && current.endDate < value) {
      return { ...current, startDate: value, endDate: value };
    }
    return { ...current, [key]: value };
  });

  const addPhotos = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const remainingSlots = Math.max(0, 1 - form.photos.length);
    const nextPhotos = await toPhotoFiles(selectedFiles.slice(0, remainingSlots));
    update('photos', [...form.photos, ...nextPhotos]);
    event.target.value = '';

    if (selectedFiles.length > remainingSlots) {
      window.alert('공유 저장 안정성을 위해 사진은 기록당 1장만 저장됩니다.');
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
    const nextRecord = {
      ...normalizeRecordDates(form),
      id: editing?.id || Date.now(),
      photos: form.photos.length ? form.photos : [{ id: Date.now() + 1, src: heroImage, caption: '여행 대표 사진' }],
    };

    const nextRecords = editing
      ? records.map((record) => (record.id === editing.id ? nextRecord : record))
      : [nextRecord, ...records];

    const saved = await setRecords(nextRecords);
    if (saved) {
      navigate(`/region/${nextRecord.regionId}`);
      return;
    }

    window.alert('기록 저장에 실패했습니다. 사진을 줄이거나 잠시 후 다시 시도해주세요.');
  };

  const deleteRecord = () => {
    if (!editing) return;

    if (window.confirm(`"${editing.title}" 기록을 삭제할까요?`)) {
      setRecords(records.filter((record) => record.id !== editing.id));
      navigate('/mypage');
    }
  };

  return (
    <AppShell>
      <main className="page form-page">
        <section className="section-heading">
          <p>Travel Note</p>
          <h1>{editing ? '여행 기록 수정' : '새 여행 기록 작성'}</h1>
        </section>

        <form className="record-form" onSubmit={saveRecord}>
          <label>
            여행 지역
            <select value={form.regionId} onChange={(event) => update('regionId', event.target.value)}>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </label>
          <label>
            여행 시작일
            <input required type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} />
          </label>
          <label>
            여행 종료일
            <input required type="date" min={form.startDate} value={form.endDate} onChange={(event) => update('endDate', event.target.value)} />
          </label>
          <label className="span-2">
            여행 제목
            <input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="예: 봄비가 그친 전주 한옥마을" />
          </label>
          <label>
            함께 간 사람
            <input value={form.companions} onChange={(event) => update('companions', event.target.value)} placeholder="쉼표로 구분해 입력" />
          </label>
          <label className="span-2">
            여행 메모
            <textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} placeholder="사진 속 장면과 같이 기억하고 싶은 문장을 적어보세요." />
          </label>
          <label className="upload-box span-2">
            <input type="file" multiple accept="image/*" onChange={addPhotos} />
            <strong>사진 업로드</strong>
            <span>선택한 사진은 공유용 썸네일로 저장되어 앨범에 표시됩니다.</span>
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
