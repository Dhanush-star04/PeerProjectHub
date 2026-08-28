import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../images/LOGO.jpeg';
import NotificationBell from './NotificationBell';

const navItems = [
  { label: 'Feed', path: '/feed', icon: '⌂' },
  { label: 'Favorites', path: '/favorites', icon: '★' },
  { label: 'Analytics', path: '/analytics', icon: '◫' },
  { label: 'Profile', path: '/profile', icon: '◉' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <button
          onClick={() => handleNavigate('/feed')}
          className="group flex items-center gap-3"
        >
          <img
            src={logo}
            alt="PeerProjectHub logo"
            className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-slate-950/10 transition group-hover:scale-105"
          />

          <div className="text-left">
            <div className="text-[15px] font-bold tracking-tight text-slate-950">
              PeerProjectHub
            </div>

            <div className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">
              Developer Community
            </div>
          </div>
        </button>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-brand-800 to-brand-600 text-white shadow-md shadow-brand-900/20'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-brand-800'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          <div className="mx-2 h-6 w-px bg-slate-200" />

          <NotificationBell />

          <button
            onClick={logout}
            className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-1 md:hidden">
          <NotificationBell />

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-50"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 md:hidden">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-gradient-to-r from-brand-800 to-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}