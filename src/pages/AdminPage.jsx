import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { listUsers, setUserApproval, setUserRole } from '../services/authStore';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setUsers(await listUsers());
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    listUsers()
      .then((nextUsers) => {
        if (active) setUsers(nextUsers);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateApproval = async (uid, approved) => {
    await setUserApproval(uid, approved);
    await refresh();
  };

  const updateRole = async (uid, role) => {
    await setUserRole(uid, role);
    await refresh();
  };

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
          ) : (
            <div className="admin-table">
              {users.map((user) => (
                <div className="admin-row" key={user.uid}>
                  <div>
                    <strong>{user.displayName || '이름 없음'}</strong>
                    <span>{user.email}</span>
                  </div>
                  <span>{user.role === 'admin' ? '관리자' : user.approved ? '승인됨' : '대기'}</span>
                  <button type="button" onClick={() => updateApproval(user.uid, !user.approved)}>
                    {user.approved ? '승인 해제' : '승인'}
                  </button>
                  <button type="button" onClick={() => updateRole(user.uid, user.role === 'admin' ? 'member' : 'admin')}>
                    {user.role === 'admin' ? '관리자 해제' : '관리자 지정'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
