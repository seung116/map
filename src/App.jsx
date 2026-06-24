import { HashRouter, Route, Routes } from 'react-router-dom';
import { useTravelRecords } from './hooks/useTravelRecords';
import AlbumPage from './pages/AlbumPage';
import BoardsPage from './pages/BoardsPage';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import RecordFormPage from './pages/RecordFormPage';
import RegionPage from './pages/RegionPage';
import StatsPage from './pages/StatsPage';
import './App.css';

export default function App() {
  const { records, setRecords, ready } = useTravelRecords();

  if (!ready) {
    return (
      <div className="page" style={{ paddingTop: '20vh', textAlign: 'center' }}>
        기록을 불러오는 중...
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard records={records} />} />
        <Route path="/region/:regionId" element={<RegionPage records={records} setRecords={setRecords} />} />
        <Route path="/write" element={<RecordFormPage records={records} setRecords={setRecords} />} />
        <Route path="/write/:recordId" element={<RecordFormPage records={records} setRecords={setRecords} />} />
        <Route path="/album" element={<AlbumPage records={records} />} />
        <Route path="/stats" element={<StatsPage records={records} />} />
        <Route path="/boards" element={<BoardsPage records={records} />} />
        <Route path="/mypage" element={<MyPage records={records} setRecords={setRecords} />} />
      </Routes>
    </HashRouter>
  );
}
