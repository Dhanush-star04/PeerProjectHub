import { Link } from 'react-router-dom';
import logo from '../images/LOGO.jpeg';

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Brand */}
        <div className="flex flex-col items-center text-center">
          <Link to="/feed" className="group inline-flex flex-col items-center">
            <img
              src={logo}
              alt="PeerProjectHub Logo"
              className="h-14 w-14 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 transition duration-300 group-hover:scale-105"
            />

            <p className="mt-3 text-base font-bold text-slate-950">
              PeerProjectHub
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
              Developer Community
            </p>
          </Link>

          <p className="mt-3 max-w-md text-sm text-slate-500">
            Discover, share and explore projects built by students and developers.
          </p>
        </div>

        {/* Navigation */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-8 border-t border-slate-200 pt-8 sm:grid-cols-4 sm:gap-4">
          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </p>
            <Link
              to="/feed"
              className="block text-sm text-slate-500 transition hover:text-brand-700"
            >
              Feed
            </Link>
          </div>

          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              Community
            </p>
            <Link
              to="/favorites"
              className="block text-sm text-slate-500 transition hover:text-brand-700"
            >
              Favorites
            </Link>
          </div>

          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              Insights
            </p>
            <Link
              to="/analytics"
              className="block text-sm text-slate-500 transition hover:text-brand-700"
            >
              Analytics
            </Link>
          </div>

          <div className="text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
              Account
            </p>
            <Link
              to="/profile"
              className="block text-sm text-slate-500 transition hover:text-brand-700"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} PeerProjectHub. All rights reserved.
          </p>

          <p>
            Built for developers, by developers.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;