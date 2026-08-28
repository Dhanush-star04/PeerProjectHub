import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';

export default function Favorites() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const res = await API.get('/projects/bookmarks');

      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (projectId) => {
    try {
      setRemovingId(projectId);

      await API.delete(
        `/projects/${projectId}/bookmark`
      );

      setProjects((prev) =>
        prev.filter(
          (project) => project._id !== projectId
        )
      );
    } catch (err) {
      console.error(
        'Error removing bookmark:',
        err
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Your collection
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Your Favorites
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Projects you've saved for later.
                Keep your best discoveries in one place.
              </p>
            </div>

            <div className="rounded-xl border border-brand-100 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-700 shadow-brand">
              {projects.length} saved
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-brand-100 bg-white/80 p-5"
              >
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-6 h-3 rounded bg-slate-100" />
                <div className="mt-2 h-3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white/70 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl text-amber-500">
              ★
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
              No favorites yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Bookmark projects you love and they
              will appear here.
            </p>

            <button
              onClick={() => navigate('/feed')}
              className="mt-6 rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Explore Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                bookmarked
                bookmarkLoading={
                  removingId === project._id
                }
                onBookmark={removeBookmark}
                onClick={() =>
                  navigate(
                    `/project/${project._id}`
                  )
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}