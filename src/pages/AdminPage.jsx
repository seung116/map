import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';
import { setUserApproval, setUserRole, subscribeUsers } from '../services/authStore';
import { countRemoteUserPhotos } from '../services/recordStore';

function adminErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return '회원가입 신청 목록을 읽을 권한이 없습니다. Firestore Rules에서 관리자가 users 컬렉션을 읽고 수정할 수 있게 허용해야 합니다. (permission-denied)';
  }

  return error?.message || '회원 목록을 불러오지 못했습니다.';
}

export default function AdminPage() {
  const auth = useAuth();
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pendingUsers = users.filter((user) => user.role !== 'admin' && !user.approved);
  const approvedUsers = users.filter((user) => user.role === 'admin' || user.approved);

  const sortUsers = (items) =>
    [...items].sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
    });

  useEffect(() => {
    if (!auth?.isAdmin) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = subscribeUsers(
      (nextUsers) => {
        setError('');
        setUsers(sortUsers(nextUsers));
        setLoading(false);
      },
      (subscribeError) => {
        console.error('User list subscribe failed:', subscribeError);
        setError(adminErrorMessage(subscribeError));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [auth?.isAdmin]);

  useEffect(() => {
    if (!auth?.isAdmin || !users.length) {
      return undefined;
    }

    let cancelled = false;

    async function loadPhotoCounts() {
      const entries = await Promise.all(
        users.map(async (user) => {
          try {
            return [user.uid, await countRemoteUserPhotos(user.uid)];
          } catch (countError) {
            console.error('User photo count failed:', countError);
            return [user.uid, null];
          }
        }),
      );

      if (!cancelled) {
        setPhotoCounts(Object.fromEntries(entries));
      }
    }

    loadPhotoCounts();

    return () => {
      cancelled = true;
    };
  }, [auth?.isAdmin, users]);

  const updateApproval = async (uid, approved) => {
    await setUserApproval(uid, approved);
  };

  const updateRole = async (uid, role) => {
    await setUserRole(uid, role);
  };

  const renderUserRow = (user) => (
    <div className="admin-row" key={user.uid}>
      <div>
        <strong>{user.displayName || '이름 없음'}</strong>
        <span>{user.email}</span>
        <code>{user.uid}</code>
      </div>
      <span>{user.role === 'admin' ? '관리자' : user.approved ? '승인됨' : '대기'}</span>
      <span className="admin-photo-count">
        사진 {photoCounts[user.uid] == null ? '-' : `${photoCounts[user.uid]}장`}
      </span>
      <button type="button" onClick={() => updateApproval(user.uid, !user.approved)}>
        {user.approved ? '승인 해제' : '승인'}
      </button>
      <button type="button" onClick={() => updateRole(user.uid, user.role === 'admin' ? 'member' : 'admin')}>
        {user.role === 'admin' ? '관리자 해제' : '관리자 지정'}
      </button>
    </div>
  );

  if (!auth?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <p>Admin</p>
          <h1>회원 관리</h1>
        </section>

        <section className="content-section admin-panel">
          {loading ? (
            <p>회원 정보를 불러오는 중...</p>
          ) : error ? (
            <p className="admin-empty">{error}</p>
          ) : (
            <>
              <div className="section-heading inline admin-subheading">
                <div>
                  <p>Pending</p>
                  <h2>가입 신청</h2>
                </div>
                <strong>{pendingUsers.length}명</strong>
              </div>
              <div className="admin-table">
                {pendingUsers.length ? pendingUsers.map(renderUserRow) : <p className="admin-empty">대기 중인 가입 신청이 없습니다.</p>}
              </div>

              <div className="section-heading inline admin-subheading">
                <div>
                  <p>Members</p>
                  <h2>승인된 회원</h2>
                </div>
                <strong>{approvedUsers.length}명</strong>
              </div>
              <div className="admin-table">
                {approvedUsers.length ? approvedUsers.map(renderUserRow) : <p className="admin-empty">승인된 회원이 없습니다.</p>}
              </div>
            </>
          )}
        </section>
      </main>
    </AppShell>
  );
}
