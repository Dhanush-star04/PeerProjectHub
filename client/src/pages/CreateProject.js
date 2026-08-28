import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

import Navbar from '../components/Navbar';

export default function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    githubLink: '',
    demoLink: '',
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const { data: newProject } = await API.post('/projects', payload);

      // If a cover image was picked, upload it now that we have the project id
      if (coverFile) {
        const coverData = new FormData();
        coverData.append('coverImage', coverFile);

        await API.post(`/projects/${newProject._id}/cover-photo`, coverData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-100 via-brand-50 to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        <button
          onClick={() => navigate('/feed')}
          className="mb-6 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          ← Back to Feed
        </button>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Share your work
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Create New Project
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tell the community what you've built.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-brand-100 bg-white/90 shadow-brand sm:p-8"
        >
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cover Image
              </label>

              <label
                htmlFor="coverImage"
                className="flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="text-2xl">🖼️</span>
                    <span className="text-xs font-semibold">
                      Click to upload a cover image
                    </span>
                    <span className="text-[11px] text-slate-400">
                      PNG or JPG, up to 5MB
                    </span>
                  </div>
                )}
              </label>

              <input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Project Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. AI Study Assistant"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe what your project does, the problem it solves, and what you learned..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Technologies / Tags
              </label>

              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="React, MongoDB, Node.js"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate each tag with a comma.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  GitHub Repository *
                </label>

                <input
                  type="url"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Live Demo
                </label>

                <input
                  type="url"
                  name="demoLink"
                  value={formData.demoLink}
                  onChange={handleChange}
                  placeholder="https://your-project.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-900/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}