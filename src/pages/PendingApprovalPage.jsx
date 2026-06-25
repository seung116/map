import { logoutUser } from '../services/authStore';

export default function PendingApprovalPage({ profile, user }) {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <span className="brand-mark large">KR</span>
        <h1>승인 대기 중</h1>
        <p>{profile?.email || user?.email} 계정은 관리자의 승인이 필요합니다.</p>
        {user?.uid && (
          <code className="uid-box">{user.uid}</code>
        )}
        <button type="button" onClick={logoutUser}>로그아웃</button>
      </section>
    </main>
  );
}
