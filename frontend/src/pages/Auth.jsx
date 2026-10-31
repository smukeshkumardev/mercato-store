import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      nav(state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">{isRegister ? 'Create your account' : 'Log in'}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {isRegister && (
          <label className="block text-sm font-medium">Name
            <input required className="input mt-1" autoComplete="name" {...field('name')} />
          </label>
        )}
        <label className="block text-sm font-medium">Email
          <input required type="email" className="input mt-1" autoComplete="email" {...field('email')} />
        </label>
        <label className="block text-sm font-medium">Password
          <input required type="password" minLength={6} className="input mt-1" autoComplete={isRegister ? 'new-password' : 'current-password'} {...field('password')} />
          {isRegister && <span className="text-xs text-ink/60">At least 6 characters</span>}
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}</button>
      </form>
      <p className="mt-4 text-sm">
        {isRegister ? 'Already have an account? ' : 'New here? '}
        <Link className="font-bold text-brand underline" to={isRegister ? '/login' : '/register'} state={state}>
          {isRegister ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </div>
  );
}
