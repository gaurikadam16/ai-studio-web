import { useState } from 'react';
import Icon from './Icons.jsx';
import { login, signup } from '../api/client.js';

// First screen when the tool opens: Sign up / Log in
export default function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = isSignup
        ? await signup(form.name.trim(), form.email.trim(), form.password)
        : await login(form.email.trim(), form.password);
      onAuthed(data, isSignup);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-side" aria-hidden="true">
        <div className="auth-side-inner">
          <span className="brand-name big">Aaryans Technology</span>
          <h2>Transform Ideas into Visual Experiences</h2>
          <ul>
            <li><Icon name="image" size={16} /> Realistic images in seconds</li>
            <li><Icon name="video" size={16} /> Cinematic videos with sound</li>
            <li><Icon name="folder" size={16} /> Projects, gallery and favorites</li>
          </ul>
        </div>
      </div>

      <form className="auth-card" onSubmit={submit} noValidate>
        <div>
          <h1 className="h1 auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">{isSignup ? 'Get 500 free credits to start creating.' : 'Log in to see your chats and creations.'}</p>
        </div>

        {isSignup && (
          <label className="stack8">
            <span className="field-label">Name</span>
            <input className="input" value={form.name} onChange={update('name')} autoComplete="name" placeholder="Your name" required maxLength={60} />
          </label>
        )}

        <label className="stack8">
          <span className="field-label">Email</span>
          <input className="input" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@example.com" required />
        </label>

        <label className="stack8">
          <span className="field-label">Password</span>
          <div className="password-row">
            <input
              className="input grow"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={update('password')}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
              required
            />
            <button type="button" className="btn-ghost sm fit" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
        </button>

        <p className="muted small center">
          {isSignup ? 'Already have an account? ' : 'New here? '}
          <button type="button" className="text-btn" onClick={switchMode}>
            {isSignup ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  );
}