import { useState } from 'react';
import { logoutUser, requestApproval } from '../services/authStore';

export default function PendingApprovalPage({ profile, user }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resend = async () => {
    setMessage('');
    setError('');

    try {
      await requestApproval(user, profile?.displayName || user?.displayName || user?.email);
      setMessage('가입 신청을 다시 보냈습니다. 관리자 페이지에서 확인하세요.');
    } catch (requestError) {
      setError(requestError.message || '가입 신청을 다시 보내지 못했습니다.');
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <span className="brand-mark large">KR</span>
        <h1>승인 대기 중</h1>
        <p>{profile?.email || user?.email} 계정은 관리자의 승인이 필요합니다.</p>
        {user?.uid && (
          <code className="uid-box">{user.uid}</code>
        )}
        {message && <strong className="form-message">{message}</strong>}
        {error && <strong className="form-error">{error}</strong>}
        <button type="button" onClick={resend}>가입 신청 다시 보내기</button>
        <button type="button" onClick={logoutUser}>로그아웃</button>
      </section>
    </main>
  );
}
