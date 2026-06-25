import { useState } from 'react';
import { loginUser, loginWithGoogle, registerUser } from '../services/authStore';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        await registerUser(form);
        setMessage('가입 신청이 접수되었습니다. 관리자가 승인하면 사용할 수 있습니다.');
        return;
      }

      await loginUser(form);
    } catch (authError) {
      setError(authError.message || '로그인 처리에 실패했습니다.');
    }
  };

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <span className="brand-mark large">KR</span>
        <h1>{mode === 'signup' ? '회원가입' : '로그인'}</h1>
        <p>승인된 회원만 여행 기록을 볼 수 있습니다.</p>

        {mode === 'signup' && (
          <label>
            이름
            <input required value={form.displayName} onChange={(event) => update('displayName', event.target.value)} />
          </label>
        )}
        <label>
          이메일
          <input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </label>
        <label>
          비밀번호
          <input required minLength={6} type="password" value={form.password} onChange={(event) => update('password', event.target.value)} />
        </label>

        {error && <strong className="form-error">{error}</strong>}
        {message && <strong className="form-message">{message}</strong>}

        <button type="submit">{mode === 'signup' ? '가입 신청' : '로그인'}</button>
        <button
          className="secondary-login"
          type="button"
          onClick={async () => {
            setError('');
            setMessage('');
            try {
              await loginWithGoogle();
            } catch (authError) {
              setError(authError.message || 'Google 로그인에 실패했습니다.');
            }
          }}
        >
          Google로 계속하기
        </button>
        <button className="secondary-login" type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
          {mode === 'signup' ? '로그인으로 돌아가기' : '회원가입 신청'}
        </button>
      </form>
    </main>
  );
}
