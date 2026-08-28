import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const [photo, setPhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // =========================================================
  // IS THIS MY PROFILE?
  // =========================================================

  const isOwnProfile = !id;

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const endpoint = id ? `/users/${id}` : '/users/me';

      const res = await API.get(endpoint);

      const user = res.data.user;

      setProfile(user);
      setProjects(res.data.projects || []);

      setName(user.name || '');
      setBio(user.bio || '');

      const backendPhoto = user.profileImage || user.avatar || user.photoURL || '';

      setPhoto(backendPhoto);
      setPhotoPreview(backendPhoto);
      setPhotoRemoved(false);
    } catch (err) {
      console.error('Error fetching profile:', err);

      console.error('Backend response:', err.response?.data);

      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN EDIT PROFILE
  // =========================================================

  const openEditProfile = () => {
    if (!isOwnProfile) return;

    setName(profile.name || '');
    setBio(profile.bio || '');

    const backendPhoto = profile.profileImage || profile.avatar || profile.photoURL || '';

    setPhoto(backendPhoto);
    setPhotoPreview(backendPhoto);
    setPhotoRemoved(false);

    setSaveMessage('');
    setSaveError('');

    setEditing(true);
  };

  // =========================================================
  // CLOSE EDIT PROFILE
  // =========================================================

  const closeEditProfile = () => {
    if (saving) return;

    setName(profile.name || '');
    setBio(profile.bio || '');

    const backendPhoto = profile.profileImage || profile.avatar || profile.photoURL || '';

    setPhoto(backendPhoto);
    setPhotoPreview(backendPhoto);
    setPhotoRemoved(false);

    setSaveError('');
    setEditing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // CHOOSE PHOTO
  // =========================================================

  const handleChoosePhoto = () => {
    if (!isOwnProfile) return;

    fileInputRef.current?.click();
  };

  // =========================================================
  // PHOTO CHANGE
  // =========================================================

  const handlePhotoChange = (e) => {
    if (!isOwnProfile) return;

    const file = e.target.files?.[0];

    if (!file) return;

    setSaveError('');

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select an image file.');

      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Please choose an image smaller than 5MB.');

      e.target.value = '';
      return;
    }

    setPhoto(file);
    setPhotoRemoved(false);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // REMOVE PHOTO
  // =========================================================

  const removePhoto = () => {
    if (!isOwnProfile) return;

    setPhoto('');
    setPhotoPreview('');
    setPhotoRemoved(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =========================================================
  // UPLOAD PHOTO
  // =========================================================

  const uploadProfilePhoto = async (file) => {
    const formData = new FormData();

    formData.append('profileImage', file);

    const res = await API.post('/users/profile/photo', formData);

    return res.data.profileImage || res.data.user?.profileImage || '';
  };

  // =========================================================
  // DELETE PHOTO
  // =========================================================

  const deleteProfilePhoto = async () => {
    await API.delete('/users/profile/photo');
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!isOwnProfile) return;

    setSaveMessage('');
    setSaveError('');

    if (!name.trim()) {
      setSaveError('Name cannot be empty.');

      return;
    }

    try {
      setSaving(true);

      let updatedPhoto = profile.profileImage || profile.avatar || profile.photoURL || '';

      // =====================================================
      // REMOVE EXISTING PHOTO
      // =====================================================

      if (photoRemoved && !photo && updatedPhoto) {
        await deleteProfilePhoto();

        updatedPhoto = '';
      }

      // =====================================================
      // UPLOAD NEW PHOTO
      // =====================================================

      if (photo instanceof File) {
        updatedPhoto = await uploadProfilePhoto(photo);
      }

      // =====================================================
      // UPDATE NAME + BIO
      // =====================================================

      const res = await API.patch('/users/profile', {
        name: name.trim(),
        bio: bio.trim(),
      });

      const updatedUser = {
        ...res.data.user,

        profileImage: updatedPhoto || res.data.user?.profileImage || '',
      };

      // =====================================================
      // UPDATE FRONTEND
      // =====================================================

      setProfile(updatedUser);

      setProjects(res.data.projects || []);

      setName(updatedUser.name || '');

      setBio(updatedUser.bio || '');

      setPhoto(updatedUser.profileImage || '');

      setPhotoPreview(updatedUser.profileImage || '');

      setPhotoRemoved(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setEditing(false);

      setSaveMessage('Profile updated successfully!');

      // Automatically hide success message
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (err) {
      console.error('Profile update error:', err);

      console.error('Backend response:', err.response?.data);

      setSaveError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="animate-pulse overflow-hidden rounded-[28px] border border-brand-100 bg-white/80">
            <div className="h-40 bg-slate-200 sm:h-52" />

            <div className="p-6 sm:p-10">
              <div className="-mt-20 h-28 w-28 rounded-full bg-slate-200" />

              <div className="mt-6 h-7 w-48 rounded bg-slate-200" />

              <div className="mt-3 h-4 w-64 rounded bg-slate-100" />

              <div className="mt-8 h-20 max-w-2xl rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="h-52 animate-pulse rounded-2xl bg-white" />

            <div className="h-52 animate-pulse rounded-2xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <button
            onClick={() => navigate('/feed')}
            className="mb-6 text-sm font-semibold text-slate-500 hover:text-slate-950"
          >
            ← Back to Projects
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error || 'Profile not found'}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // AVATAR INITIAL
  // =========================================================

  const initial = profile.name?.charAt(0)?.toUpperCase() || '?';

  // =========================================================
  // MAIN PROFILE
  // =========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* ===================================================
            PROFILE CARD
        =================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-brand-100 bg-white/90 shadow-brand">
          {/* Banner */}

          <div className="relative h-36 overflow-hidden bg-[#080d2b] sm:h-48 lg:h-52">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-800 to-brand-600" />

            <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full border border-white/10" />

            <div className="absolute right-0 top-0 h-full w-1/2 opacity-30">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              />
            </div>
          </div>

          {/* Profile content */}

          <div className="relative px-5 pb-8 sm:px-8 sm:pb-10 lg:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* Left */}

              <div className="flex min-w-0 flex-col sm:flex-row sm:items-end">
                {/* Avatar */}

                <div className="-mt-14 sm:-mt-16">
                  <div className="relative">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.name}
                        className="h-28 w-28 rounded-full border-[5px] border-white object-cover shadow-[0_10px_30px_rgba(15,23,42,0.20)] sm:h-32 sm:w-32"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-[5px] border-white bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-4xl font-bold text-white shadow-[0_10px_30px_rgba(15,23,42,0.20)] sm:h-32 sm:w-32">
                        {initial}
                      </div>
                    )}

                    {/* Camera button only for own profile */}

                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={openEditProfile}
                        aria-label="Change profile photo"
                        className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-800 to-brand-600 text-white shadow-lg transition hover:scale-105"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 4h-5L8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-1.5-3Z" />

                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Name */}

                <div className="mt-4 min-w-0 sm:ml-5 sm:mb-1 sm:mt-0">
                  <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {profile.name}
                  </h1>

                  <p className="mt-1 break-all text-sm text-slate-400 sm:text-base">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Edit button */}

              {isOwnProfile && (
                <button
                  onClick={openEditProfile}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-100 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:w-auto"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />

                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {/* Bio */}

            <div className="mt-8 max-w-3xl">
              <p className="text-sm leading-7 text-slate-600 sm:text-base">
                {profile.bio ||
                  'No bio added yet. Tell the community a little about yourself.'}
              </p>
            </div>

            {/* Stats */}

            <div className="mt-7 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />

                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                </div>

                <div>
                  <p className="text-xl font-bold text-slate-950">{projects.length}</p>

                  <p className="text-sm font-medium text-slate-400">Projects</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                    <circle cx="9" cy="7" r="4" />

                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-medium text-brand-500">Community</p>

                  <p className="text-base font-bold text-brand-700">Developer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            PROJECTS
        =================================================== */}

        <section className="mt-12">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                Portfolio
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {isOwnProfile ? 'My Projects' : `${profile.name}'s Projects`}
              </h2>
            </div>

            <span className="text-sm font-medium text-slate-400">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-brand-200 bg-white/70 px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                +
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">No projects yet</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {isOwnProfile
                  ? 'Start building your portfolio by sharing your first project with the community.'
                  : 'This user has not shared any projects yet.'}
              </p>

              {isOwnProfile && (
                <button
                  onClick={() => navigate('/create')}
                  className="mt-6 rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="group cursor-pointer overflow-hidden rounded-[22px] border border-brand-100 bg-white/70 p-6 shadow-brand backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="break-words text-lg font-bold tracking-tight text-slate-950 transition group-hover:text-brand-600">
                      {project.title}
                    </h3>

                    <span className="shrink-0 text-lg text-slate-300 transition group-hover:text-brand-500">
                      ↗
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-400">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {editing && isOwnProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[28px] border border-brand-100 bg-white/95 shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Edit Profile</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditProfile}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="px-5 py-6 sm:px-7">
              {/* PROFILE PHOTO */}

              <div className="flex flex-col items-center">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-4xl font-bold text-white shadow-xl">
                      {initial}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleChoosePhoto}
                    disabled={saving}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-50"
                    aria-label="Choose profile photo"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 4h-5L8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-1.5-3Z" />

                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleChoosePhoto}
                  disabled={saving}
                  className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  Choose profile photo
                </button>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={saving}
                    className="mt-1 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove photo
                  </button>
                )}

                <p className="mt-2 text-center text-xs text-slate-400">
                  JPG, PNG or WEBP • Maximum 5MB • Optional
                </p>
              </div>

              {/* NAME */}

              <div className="mt-7">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  placeholder="Your name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                />
              </div>

              {/* EMAIL */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Email is managed by your account.
                </p>
              </div>

              {/* BIO */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                  disabled={saving}
                  placeholder="Tell the community about yourself..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Optional — you can leave this empty.
                </p>
              </div>

              {/* ERROR */}

              {saveError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {saveError}
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditProfile}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {saveMessage && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-green-700 shadow-xl">
          {saveMessage}
        </div>
      )}
    </div>
  );
}