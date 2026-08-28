import { useNavigate } from 'react-router-dom';

export default function ProjectCard({
  project,
  onClick,
  bookmarked = false,
  bookmarkLoading = false,
  onBookmark,
}) {
  const navigate = useNavigate();

  const initial = project.creatorName
    ? project.creatorName.charAt(0).toUpperCase()
    : '?';

  // Get MongoDB user ID safely
  const creatorId =
    typeof project.creator === 'object'
      ? project.creator?._id
      : project.creator;

  const handleAuthorClick = (e) => {
    e.stopPropagation();

    if (!creatorId) {
      console.error(
        'Creator ID not found:',
        project.creator
      );
      return;
    }

    navigate(`/profile/${creatorId}`);
  };

  return (
    <article
      onClick={onClick}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/10 hover:ring-brand-200"
    >
      {/* Accent line - always visible, brightens on hover */}
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 opacity-70 transition-opacity group-hover:opacity-100" />

      {/* Cover image */}
      {project.coverImage ? (
        <div className="h-36 w-full overflow-hidden bg-slate-100">
          <img
            src={project.coverImage}
            alt={`${project.title} cover`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
          {/* Subtle dot-grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Diagonal sheen */}
          <div className="absolute -left-1/4 -top-1/2 h-[200%] w-1/2 rotate-12 bg-white/10 blur-2xl transition-transform duration-500 group-hover:translate-x-16" />

          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-bold tracking-tight text-white backdrop-blur-sm">
            {project.title?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">

            <h3 className="truncate text-lg font-bold tracking-tight text-slate-950 transition-colors group-hover:text-brand-600">
              {project.title}
            </h3>

            {/* AUTHOR */}
            {project.creatorName && (
              <button
                type="button"
                onClick={handleAuthorClick}
                className="mt-1.5 flex items-center gap-1.5 rounded-md text-left transition hover:opacity-80"
              >
                {project.creator?.profileImage ? (
                  <img
                    src={project.creator.profileImage}
                    alt={project.creatorName}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-500">
                    {initial}
                  </span>
                )}

                <span className="text-xs font-medium text-slate-400 transition-colors hover:text-brand-600">
                  by {project.creatorName}
                </span>
              </button>
            )}
          </div>

          {/* Bookmark */}
          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(project._id);
              }}
              disabled={bookmarkLoading}
              title={
                bookmarked
                  ? 'Remove bookmark'
                  : 'Bookmark project'
              }
              aria-label={
                bookmarked
                  ? 'Remove bookmark'
                  : 'Bookmark project'
              }
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                bookmarked
                  ? 'border-amber-200 bg-amber-50 text-amber-500'
                  : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-500'
              } ${
                bookmarkLoading
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              }`}
            >
              {bookmarked ? '★' : '☆'}
            </button>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
              >
                {tag}
              </span>
            ))}

            {project.tags.length > 5 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                +{project.tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-400">

            {project.likeCount !== undefined && (
              <span className="flex items-center gap-1">
                <span>♥</span>
                {project.likeCount}
              </span>
            )}

            {project.averageRating !== undefined && (
              <span className="flex items-center gap-1">
                <span className="text-amber-400">★</span>
                {Number(
                  project.averageRating || 0
                ).toFixed(1)}
              </span>
            )}

            {project.commentCount !== undefined && (
              <span className="flex items-center gap-1">
                <span>◌</span>
                {project.commentCount}
              </span>
            )}

          </div>

          {/* Links */}
          <div className="flex items-center gap-3">

            {/* GitHub */}
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="text-xs font-semibold text-slate-400 transition hover:text-slate-950"
              >
                GitHub ↗
              </a>
            )}

            {/* Demo */}
            {project.demoLink && (
              <a
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="text-xs font-semibold text-brand-600 transition hover:text-brand-700"
              >
                Demo ↗
              </a>
            )}

          </div>
        </div>
      </div>
    </article>
  );
}