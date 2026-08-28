import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Feed from './pages/Feed';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import EditProject from './pages/Editproject';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

import Footer from './components/Footer';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950 shadow-xl">
            P
          </div>

          <p className="mt-5 text-sm font-medium text-slate-400">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex-1">
        {children}
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ==================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ==================================================
            FEED
        ================================================== */}

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Feed />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            CREATE PROJECT
        ================================================== */}

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CreateProject />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            PROJECT DETAIL
        ================================================== */}

        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <ProjectDetail />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            EDIT PROJECT
        ================================================== */}

        <Route
          path="/project/:id/edit"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <EditProject />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            FAVORITES
        ================================================== */}

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Favorites />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            MY PROFILE
        ================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            OTHER USER PROFILE
        ================================================== */}

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Analytics />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            DEFAULT
        ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/feed"
              replace
            />
          }
        />

        {/* ==================================================
            404
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/feed"
              replace
            />
          }
        />

      </Routes>
    </Router>
  );
}

