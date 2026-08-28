import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

import Navbar from '../components/Navbar';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingMessage, setRatingMessage] = useState('');

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState('');

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // =========================================================
  // FETCH PROJECT
  // =========================================================

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await API.get(`/projects/${id}`);

      const projectData = res.data;

      setProject(projectData);
      setSelectedRating(projectData.userRating || 0);
      setLikeCount(projectData.likedBy?.length || 0);
      setIsLiked(projectData.userLiked || false);
    } catch (err) {
      console.error('Error fetching project:', err);

      setError(err.response?.data?.message || 'Project not found');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH COMMENTS
  // =========================================================

  useEffect(() => {
    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentError('');

      const res = await API.get(`/projects/${id}/comments`);

      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);

      setCommentError('Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  // =========================================================
  // LIKE
  // =========================================================

  const handleLike = async () => {
    try {
      setLikeLoading(true);
      setLikeError('');

      if (isLiked) {
        const res = await API.delete(`/projects/${id}/like`);

        setIsLiked(false);

        setLikeCount(res.data.likeCount ?? Math.max(likeCount - 1, 0));
      } else {
        const res = await API.post(`/projects/${id}/like`);

        setIsLiked(true);

        setLikeCount(res.data.likeCount ?? likeCount + 1);
      }
    } catch (err) {
      console.error('Error updating like:', err);

      setLikeError(err.response?.data?.message || 'Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  // =========================================================
  // RATING
  // =========================================================

  const handleRating = async (rating) => {
    try {
      setRatingLoading(true);
      setRatingError('');
      setRatingMessage('');

      const res = await API.post(`/projects/${id}/rating`, {
        rating,
      });

      setSelectedRating(rating);

      setProject((prev) => ({
        ...prev,
        averageRating: res.data.averageRating,
      }));

      setRatingMessage('Rating submitted successfully!');

      await fetchProject();
    } catch (err) {
      console.error('Error submitting rating:', err);

      setRatingError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  // =========================================================
  // DELETE PROJECT
  // =========================================================

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await API.delete(`/projects/${id}`);

        alert('Project deleted successfully');

        navigate('/feed');
      } catch (err) {
        console.error('Error deleting project:', err);

        alert(
          'Error deleting project: ' +
            (err.response?.data?.message || 'Something went wrong')
        );
      }
    }
  };

  // =========================================================
  // ADD COMMENT
  // =========================================================

  const handleAddComment = async (e) => {
    e.preventDefault();

    setCommentError('');

    if (!commentText.trim()) {
      setCommentError('Please write a comment before submitting.');

      return;
    }

    try {
      setAddingComment(true);

      const res = await API.post(`/projects/${id}/comments`, {
        text: commentText.trim(),
      });

      setComments((prevComments) => [res.data, ...prevComments]);

      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);

      setCommentError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      setDeletingCommentId(commentId);

      await API.delete(`/projects/${id}/comments/${commentId}`);

      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error('Error deleting comment:', err);

      setCommentError(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 h-[650px] animate-pulse rounded-3xl bg-white" />
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
        <Navbar />

        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error || 'Project not found'}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // CURRENT USER
  // =========================================================

  const userEmail = localStorage.getItem('userEmail');

  const isOwner = userEmail && project.creator?.email === userEmail;

  // =========================================================
  // RATING DATA
  // =========================================================

  const averageRating = Number(project.averageRating || 0);

  const totalRatings = project.ratings?.length || 0;

  // =========================================================
  // CREATOR ID
  // =========================================================
  //
  // IMPORTANT:
  // project.creator may be either:
  //
  // 1. An object:
  //    { _id: "...", name: "Arun" }
  //
  // OR
  //
  // 2. A string containing the MongoDB ID.
  //
  // We extract the actual ID before navigating.
  // This prevents:
  //
  // /profile/[object Object]
  //
  // =========================================================

  const creatorId =
    typeof project.creator === 'object' ? project.creator?._id : project.creator;

  // =========================================================
  // GO TO CREATOR PROFILE
  // =========================================================

  const handleCreatorClick = () => {
    if (!creatorId) {
      console.error('Creator ID is missing:', project.creator);

      return;
    }

    navigate(`/profile/${creatorId}`);
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <button
          onClick={() => navigate('/feed')}
          className="mb-6 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          ← Back to Projects
        </button>

        {/* =================================================
            PROJECT
        ================================================= */}

        <article className="overflow-hidden rounded-3xl border border-brand-100 bg-white/90 shadow-brand">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 px-6 py-8 text-white sm:px-9 sm:py-10">
            {project.coverImage && (
              <>
                <img
                  src={project.coverImage}
                  alt={`${project.title} cover`}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Scrim for text readability over the photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/60 to-brand-950/30" />
              </>
            )}

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    Project showcase
                  </div>

                  <h1 className="break-words text-3xl font-bold tracking-tight sm:text-5xl">
                    {project.title}
                  </h1>

                  {/* =================================================
                      CREATOR
                  ================================================= */}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <span>Created by</span>

                    <button
                      type="button"
                      onClick={handleCreatorClick}
                      disabled={!creatorId}
                      className="font-semibold text-brand-400 transition hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {project.creatorName}
                    </button>

                    <span>·</span>

                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* =================================================
                    OWNER BUTTONS
                ================================================= */}

                {isOwner && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => navigate(`/project/${id}/edit`)}
                      className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-brand-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={handleDelete}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* =================================================
                  TAGS
              ================================================= */}

              <div className="mt-7 flex flex-wrap gap-2">
                {project.tags?.length > 0 ? (
                  project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No tags</span>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              MAIN PROJECT CONTENT
          ================================================= */}

          <div className="p-6 sm:p-9">
            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex flex-col gap-4 border-b border-slate-100 pb-7 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-bold transition ${
                  isLiked
                    ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                } ${likeLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="text-xl">{isLiked ? '♥' : '♡'}</span>

                {likeLoading ? 'Saving...' : isLiked ? 'Liked' : 'Like'}

                <span className="text-slate-400">{likeCount}</span>
              </button>

              <div className="flex flex-wrap gap-3">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    GitHub ↗
                  </a>
                )}

                {project.demoLink && (
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/15 transition hover:bg-brand-700"
                  >
                    Live Demo ↗
                  </a>
                )}
              </div>
            </div>

            {/* =================================================
                LIKE ERROR
            ================================================= */}

            {likeError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {likeError}
              </div>
            )}

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <section className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Overview
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                About this project
              </h2>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-slate-600 sm:text-base">
                {project.description}
              </p>
            </section>

            {/* =================================================
                RATING
            ================================================= */}

            <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Community rating
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-4xl font-bold tracking-tight text-slate-950">
                      {averageRating.toFixed(1)}
                    </span>

                    <div className="text-xl text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= Math.round(averageRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <span className="text-sm text-slate-400">
                      {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">Your rating</p>

                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        disabled={ratingLoading}
                        title={`Rate ${star} out of 5`}
                        className={`text-3xl transition hover:scale-110 ${
                          star <= selectedRating
                            ? 'text-amber-400'
                            : 'text-slate-300 hover:text-amber-400'
                        } ${ratingLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedRating > 0 && (
                <p className="mt-4 text-xs text-slate-400">
                  You rated this project {selectedRating}/5
                </p>
              )}

              {ratingLoading && (
                <p className="mt-3 text-sm font-medium text-brand-600">
                  Submitting rating...
                </p>
              )}

              {ratingMessage && (
                <p className="mt-3 text-sm font-medium text-green-600">{ratingMessage}</p>
              )}

              {ratingError && (
                <p className="mt-3 text-sm font-medium text-red-600">{ratingError}</p>
              )}
            </section>
          </div>
        </article>

        {/* =================================================
            COMMENTS
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-brand-100 bg-white/70 p-6 shadow-brand backdrop-blur-sm sm:p-9">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Community discussion
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Comments
            </h2>
          </div>

          {/* =================================================
              ADD COMMENT
          ================================================= */}

          <form
            onSubmit={handleAddComment}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Share your thoughts
            </label>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What do you think about this project?"
              rows="4"
              disabled={addingComment}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
            />

            {commentError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {commentError}
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={addingComment}
                className="rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingComment ? 'Posting...' : 'Add Comment'}
              </button>
            </div>
          </form>

          {/* =================================================
              COMMENT LIST
          ================================================= */}

          <div className="mt-8">
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-100 p-5"
                  >
                    <div className="h-4 w-32 rounded bg-slate-200" />

                    <div className="mt-4 h-3 rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                  ◌
                </div>

                <h3 className="mt-4 font-bold text-slate-950">No comments yet</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Be the first person to start the discussion.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <article
                    key={comment._id}
                    className="rounded-2xl border border-brand-100 bg-white/80 p-5 transition hover:border-brand-200 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-800 to-brand-600 text-sm font-bold text-white">
                        {comment.author?.profileImage ? (
                          <img
                            src={comment.author.profileImage}
                            alt={comment.authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : comment.authorName ? (
                          comment.authorName.charAt(0).toUpperCase()
                        ) : (
                          '?'
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-bold text-slate-950">{comment.authorName}</p>

                          <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>

                            {(comment.author?.email === userEmail || isOwner) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment._id)}
                                disabled={deletingCommentId === comment._id}
                                className="text-xs font-semibold text-slate-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingCommentId === comment._id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}