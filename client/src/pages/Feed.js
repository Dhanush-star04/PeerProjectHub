import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';

export default function Feed() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState({});

  const projectsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTag]);

  useEffect(() => {
    fetchProjects();
  }, [search, selectedTag, currentPage]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: projectsPerPage,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedTag) {
        params.tag = selectedTag;
      }

      const res = await API.get('/projects', {
        params,
      });

      setProjects(res.data.projects);
      setTotalPages(res.data.totalPages);
      setTotalProjects(res.data.totalProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await API.get('/projects/bookmarks');

      const bookmarkIds = res.data.map(
        (project) => project._id
      );

      setBookmarkedProjects(bookmarkIds);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const toggleBookmark = async (projectId) => {
    try {
      setBookmarkLoading((prev) => ({
        ...prev,
        [projectId]: true,
      }));

      const isBookmarked =
        bookmarkedProjects.includes(projectId);

      if (isBookmarked) {
        await API.delete(
          `/projects/${projectId}/bookmark`
        );

        setBookmarkedProjects((prev) =>
          prev.filter((id) => id !== projectId)
        );
      } else {
        await API.post(
          `/projects/${projectId}/bookmark`
        );

        setBookmarkedProjects((prev) => [
          ...prev,
          projectId,
        ]);
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
    } finally {
      setBookmarkLoading((prev) => ({
        ...prev,
        [projectId]: false,
      }));
    }
  };

  const allTags = [
    ...new Set(
      projects.flatMap(
        (project) => project.tags || []
      )
    ),
  ];

  const clearFilters = () => {
    setSearch('');
    setSelectedTag('');
    setCurrentPage(1);
  };

  const hasFilters =
    search.trim() || selectedTag;

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const startProject =
    totalProjects === 0
      ? 0
      : (currentPage - 1) * projectsPerPage + 1;

  const endProject = Math.min(
    currentPage * projectsPerPage,
    totalProjects
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 lg:py-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                Community showcase
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Discover Amazing
                <span className="block text-brand-400">
                  Projects.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Explore what developers are building,
                discover new ideas, and share your own
                projects with the community.
              </p>
            </div>

            <button
              onClick={() => navigate('/create')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              <span className="text-lg">+</span>
              Create Project
            </button>
          </div>
        </section>

        {/* Search + Section heading band */}
        <section className="mb-8 rounded-3xl border border-brand-100 bg-white/70 p-5 shadow-brand backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-600">
                Search projects
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by title, description, tag, or creator..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <div className="lg:w-60">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-600">
                Filter by tag
              </label>

              <select
                value={selectedTag}
                onChange={(e) =>
                  setSelectedTag(e.target.value)
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              >
                <option value="">All Tags</option>

                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Section heading (merged into the same card) */}
          <div className="mt-5 flex flex-col gap-2 border-t border-brand-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Explore
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Project Feed
              </h2>
            </div>

            {!loading && (
              <p className="text-sm text-slate-400">
                {totalProjects} project
                {totalProjects !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </section>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-brand-100 bg-white/80 p-5"
              >
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
                <div className="mt-7 space-y-2">
                  <div className="h-3 rounded bg-slate-100" />
                  <div className="h-3 rounded bg-slate-100" />
                  <div className="h-3 w-4/5 rounded bg-slate-100" />
                </div>
                <div className="mt-8 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-slate-100" />
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white/70 px-6 py-16 text-center shadow-brand">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-400">
              ⌕
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              {hasFilters
                ? 'No projects found'
                : 'No projects yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {hasFilters
                ? 'Try changing your search or filters to discover more projects.'
                : 'Be the first person to share a project with the community.'}
            </p>

            <button
              onClick={
                hasFilters
                  ? clearFilters
                  : () => navigate('/create')
              }
              className="mt-6 rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {hasFilters
                ? 'Clear Filters'
                : 'Create Project'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  bookmarked={bookmarkedProjects.includes(project._id)}
                  bookmarkLoading={
                    bookmarkLoading[project._id]
                  }
                  onBookmark={toggleBookmark}
                  onClick={() =>
                    navigate(
                      `/project/${project._id}`
                    )
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-4">
                <p className="text-xs font-medium text-slate-400">
                  Showing {startProject}-{endProject} of{' '}
                  {totalProjects} projects
                </p>

                <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-brand-100 bg-white/80 p-2 shadow-sm">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ←
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`h-9 min-w-9 rounded-xl px-3 text-sm font-bold transition ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-brand-800 to-brand-600 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}