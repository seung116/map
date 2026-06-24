import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTravelRecords } from './hooks/useTravelRecords';
import AlbumPage from './pages/AlbumPage';
import BoardsPage from './pages/BoardsPage';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import RecordFormPage from './pages/RecordFormPage';
import RegionPage from './pages/RegionPage';
import StatsPage from './pages/StatsPage';
import './App.css';

function AppRoutes() {
  const { records, setRecords } = useTravelRecords();
  const routeProps = { records, setRecords };

  return (
    <Routes>
      <Route path="/" element={<Dashboard records={records} />} />
      <Route path="/region/:regionId" element={<RegionPage {...routeProps} />} />
      <Route path="/write" element={<RecordFormPage {...routeProps} />} />
      <Route path="/write/:recordId" element={<RecordFormPage {...routeProps} />} />
      <Route path="/album" element={<AlbumPage records={records} />} />
      <Route path="/stats" element={<StatsPage records={records} />} />
      <Route path="/boards" element={<BoardsPage records={records} />} />
      <Route path="/mypage" element={<MyPage {...routeProps} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
