import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/LOGO.jpeg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }

      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Brand panel */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-slate-950 p-12 text-white xl:p-16">
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="PeerProjectHub logo"
                className="h-14 w-14 rounded-xl object-cover"
              />

              <span className="text-2xl font-bold tracking-tight">
                PeerProjectHub
              </span>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Built for developers
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Build.
              <br />
              Share.
              <br />
              <span className="text-brand-400">
                Inspire.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Discover projects from fellow developers,
              share what you're building, and grow
              together through peer feedback.
            </p>
          </div>

          <p className="relative text-xs text-slate-500">
            A community for builders and learners.
          </p>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src={logo}
                alt="PeerProjectHub logo"
                className="h-14 w-14 rounded-xl object-cover"
              />

              <span className="text-xl font-bold tracking-tight text-slate-950">
                PeerProjectHub
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">

              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                  {isSignup ? 'Join the community' : 'Welcome back'}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {isSignup
                    ? 'Create your account'
                    : 'Sign in to your account'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isSignup
                    ? 'Start sharing your projects with developers around you.'
                    : 'Continue discovering and sharing great projects.'}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium leading-5 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Please wait...'
                    : isSignup
                    ? 'Create Account'
                    : 'Sign In'}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">
                  OR
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                {isSignup
                  ? 'Already have an account?'
                  : "Don't have an account?"}

                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError('');
                  }}
                  className="ml-1 font-bold text-brand-600 hover:text-brand-700"
                >
                  {isSignup ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}