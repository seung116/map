import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { useTravelRecords } from './hooks/useTravelRecords';
import AdminPage from './pages/AdminPage';
import AlbumPage from './pages/AlbumPage';
import AuthPage from './pages/AuthPage';
import BoardsPage from './pages/BoardsPage';
import CalendarPage from './pages/CalendarPage';
import Dashboard from './pages/Dashboard';
import DateDashboard from './pages/DateDashboard';
import ModeSelectPage from './pages/ModeSelectPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import RecordFormPage from './pages/RecordFormPage';
import RegionPage from './pages/RegionPage';
import StatsPage from './pages/StatsPage';
import './App.css';

function LegacyRegionRedirect() {
  const { regionId } = useParams();
  return <Navigate to={`/travel/region/${regionId}`} replace />;
}

function LegacyWriteRedirect() {
  const { recordId } = useParams();
  return <Navigate to={`/travel/write/${recordId}`} replace />;
}

export default function App() {
  const auth = useAuthState();
  const canUseRecords = Boolean(auth.user && auth.isApproved);
  const { records, setRecords, ready } = useTravelRecords(canUseRecords, auth.user?.uid);
  const travelRecords = records.filter((record) => record.type !== 'date');
  const dateRecords = records.filter((record) => record.type === 'date');

  if (auth.loading) {
    return (
      <div className="page" style={{ paddingTop: '20vh', textAlign: 'center' }}>
        계정을 확인하는 중...
      </div>
    );
  }

  if (!auth.user) {
    return <AuthPage />;
  }

  if (!auth.isApproved) {
    return <PendingApprovalPage profile={auth.profile} user={auth.user} />;
  }

  if (!ready) {
    return (
      <div className="page" style={{ paddingTop: '20vh', textAlign: 'center' }}>
        기록을 불러오는 중...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/select" replace />} />
          <Route path="/select" element={<ModeSelectPage />} />

          <Route path="/travel" element={<Dashboard records={travelRecords} />} />
          <Route path="/travel/region/:regionId" element={<RegionPage records={travelRecords} setRecords={setRecords} basePath="/travel" />} />
          <Route path="/travel/write" element={<RecordFormPage records={records} setRecords={setRecords} mode="travel" />} />
          <Route path="/travel/write/:recordId" element={<RecordFormPage records={records} setRecords={setRecords} mode="travel" />} />
          <Route path="/travel/album" element={<AlbumPage records={travelRecords} basePath="/travel" />} />
          <Route path="/travel/calendar" element={<CalendarPage records={travelRecords} basePath="/travel" />} />
          <Route path="/travel/stats" element={<StatsPage records={travelRecords} />} />

          <Route path="/date" element={<DateDashboard records={dateRecords} />} />
          <Route path="/date/write" element={<RecordFormPage records={records} setRecords={setRecords} mode="date" />} />
          <Route path="/date/write/:recordId" element={<RecordFormPage records={records} setRecords={setRecords} mode="date" />} />
          <Route path="/date/album" element={<AlbumPage records={dateRecords} basePath="/date" archiveType="date" />} />
          <Route path="/date/calendar" element={<CalendarPage records={dateRecords} basePath="/date" archiveType="date" />} />
          <Route path="/date/stats" element={<StatsPage records={dateRecords} archiveType="date" />} />

          <Route path="/region/:regionId" element={<LegacyRegionRedirect />} />
          <Route path="/write" element={<Navigate to="/travel/write" replace />} />
          <Route path="/write/:recordId" element={<LegacyWriteRedirect />} />
          <Route path="/album" element={<Navigate to="/travel/album" replace />} />
          <Route path="/calendar" element={<Navigate to="/travel/calendar" replace />} />
          <Route path="/stats" element={<Navigate to="/travel/stats" replace />} />

          <Route path="/boards" element={<BoardsPage records={records} />} />
          <Route path="/admin" element={auth.isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/select" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
