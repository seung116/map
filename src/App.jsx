import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { useAuthState } from './hooks/useAuthState';
import { useTravelRecords } from './hooks/useTravelRecords';
import AdminPage from './pages/AdminPage';
import AlbumPage from './pages/AlbumPage';
import AuthPage from './pages/AuthPage';
import BoardsPage from './pages/BoardsPage';
import CalendarPage from './pages/CalendarPage';
import Dashboard from './pages/Dashboard';
import PendingApprovalPage from './pages/PendingApprovalPage';
import RecordFormPage from './pages/RecordFormPage';
import RegionPage from './pages/RegionPage';
import StatsPage from './pages/StatsPage';
import './App.css';

export default function App() {
  const auth = useAuthState();
  const canUseRecords = Boolean(auth.user && auth.isApproved);
  const { records, setRecords, ready } = useTravelRecords(canUseRecords, auth.user?.uid);

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
          <Route path="/" element={<Dashboard records={records} />} />
          <Route path="/region/:regionId" element={<RegionPage records={records} setRecords={setRecords} />} />
          <Route path="/write" element={<RecordFormPage records={records} setRecords={setRecords} />} />
          <Route path="/write/:recordId" element={<RecordFormPage records={records} setRecords={setRecords} />} />
          <Route path="/album" element={<AlbumPage records={records} />} />
          <Route path="/calendar" element={<CalendarPage records={records} />} />
          <Route path="/stats" element={<StatsPage records={records} />} />
          <Route path="/boards" element={<BoardsPage records={records} />} />
          <Route path="/admin" element={auth.isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Dashboard records={records} />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
