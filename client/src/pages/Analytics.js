import { useEffect, useState } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

// ---------------------------------------------------------
// KPI card — headline platform metrics
// ---------------------------------------------------------
const StatCard = ({ label, value, icon, description, accent }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-brand-100 bg-white/70 p-6 shadow-brand backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
    {/* decorative glow */}
    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-400/10 blur-2xl transition group-hover:bg-brand-500/20" />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-slate-950">
          {value}
        </p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition group-hover:scale-105 ${
          accent || 'bg-brand-50 text-brand-600'
        }`}
      >
        {icon}
      </div>
    </div>

    {description && (
      <p className="relative mt-4 text-xs leading-5 text-slate-400">
        {description}
      </p>
    )}
  </div>
);

// ---------------------------------------------------------
// Radial gauge — average rating out of 5, built from real data
// ---------------------------------------------------------
const RatingGauge = ({ rating }) => {
  const clamped = Math.max(0, Math.min(5, Number(rating) || 0));
  const pct = (clamped / 5) * 100;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-40 w-40 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#2f6690 ${pct}%, #e6f0f7 ${pct}%)`,
        }}
      >
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-slate-950">
            {clamped.toFixed(2)}
          </span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            out of 5
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= Math.round(clamped) ? '' : 'text-slate-200'}>
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Simple horizontal comparison bar — used for likes vs ratings
// ---------------------------------------------------------
const CompareBar = ({ label, value, max, colorClass }) => {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">{label}</span>
        <span className="tabular-nums text-slate-950">{value}</span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/projects/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Analytics error:', err);
        console.error('Response:', err.response?.data);

        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-white/70" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded-lg bg-white/50" />

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl border border-brand-100 bg-white/70"
              />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-2xl border border-brand-100 bg-white/70 lg:col-span-1" />
            <div className="h-64 animate-pulse rounded-2xl border border-brand-100 bg-white/70 lg:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) return null;

  const likeCount = analytics.mostLikedProject?.likeCount || 0;
  const ratingCount = analytics.mostRatedProject?.ratingCount || 0;
  const compareMax = Math.max(likeCount, ratingCount, 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Platform insights
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              A live snapshot of activity, engagement, and top-performing
              projects across PeerProjectHub.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-brand-100 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Live data
          </div>
        </section>

        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Projects"
            value={analytics.totalProjects}
            icon="▣"
            description="Projects currently on the platform"
          />

          <StatCard
            label="Total Users"
            value={analytics.totalUsers}
            icon="◉"
            description="Registered community members"
          />

          <StatCard
            label="Total Comments"
            value={analytics.totalComments}
            icon="◌"
            description="Community discussion activity"
          />

          <StatCard
            label="Average Rating"
            value={`${analytics.averageRating}★`}
            icon="★"
            accent="bg-amber-50 text-amber-500"
            description="Average rating across all projects"
          />
        </section>

        {/* Project performance */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Project performance
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Top-performing projects
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* Rating gauge - overall platform quality */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-100 bg-white/70 p-7 text-center shadow-brand backdrop-blur-sm lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Platform quality
              </p>

              <div className="mt-5">
                <RatingGauge rating={analytics.averageRating} />
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-400">
                Average rating across every project on PeerProjectHub
              </p>
            </div>

            {/* Spotlight cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">

              {/* Most liked */}
              <div className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-800 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-7 text-white shadow-brand">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-brand-400/10 blur-3xl" />

                <div className="relative flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                      ♥
                    </span>

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
                      Community favorite
                    </p>
                  </div>

                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand-300">
                    Most Liked Project
                  </h3>

                  <p className="mt-2 truncate text-2xl font-bold tracking-tight">
                    {analytics.mostLikedProject?.title || 'No projects yet'}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </p>
                </div>

                <div className="relative mt-6">
                  <CompareBar
                    label="Likes"
                    value={likeCount}
                    max={compareMax}
                    colorClass="bg-gradient-to-r from-brand-400 to-white"
                  />
                </div>
              </div>

              {/* Most rated */}
              <div className="flex flex-col rounded-2xl border border-brand-100 bg-white/70 p-7 shadow-brand backdrop-blur-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                      ★
                    </span>

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Highest rated
                    </p>
                  </div>

                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-brand-600">
                    Most Rated Project
                  </h3>

                  <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
                    {analytics.mostRatedProject?.title || 'No projects yet'}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'} ·{' '}
                    {analytics.mostRatedProject?.averageRating
                      ? Number(analytics.mostRatedProject.averageRating).toFixed(2)
                      : 'N/A'}{' '}
                    average
                  </p>
                </div>

                <div className="mt-6">
                  <CompareBar
                    label="Ratings"
                    value={ratingCount}
                    max={compareMax}
                    colorClass="bg-gradient-to-r from-brand-700 to-brand-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}