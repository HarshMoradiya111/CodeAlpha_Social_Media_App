import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import AuthPage from './pages/AuthPage';

function Shell({ children }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Pulse Loop
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Feed</NavLink>
          {isAuthenticated && user?.id ? <NavLink to={`/profile/${user.id}`}>Profile</NavLink> : null}
          <NavLink to="/login">Login</NavLink>
        </nav>

        <div className="auth-links">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.name}</span>
              <button className="secondary-button compact" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="secondary-button compact" to="/login">
                Login
              </Link>
              <Link className="primary-button compact" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="page-shell">{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Shell>
            <FeedPage />
          </Shell>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <Shell>
            <ProfilePage />
          </Shell>
        }
      />
      <Route
        path="/post/:id"
        element={
          <Shell>
            <PostDetailPage />
          </Shell>
        }
      />
      <Route
        path="/login"
        element={
          <Shell>
            <AuthPage initialMode="login" />
          </Shell>
        }
      />
      <Route
        path="/register"
        element={
          <Shell>
            <AuthPage initialMode="register" />
          </Shell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
