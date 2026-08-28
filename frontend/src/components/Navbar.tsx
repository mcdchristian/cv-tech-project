import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">📄</div>
        CV-Tech
      </Link>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Dashboard</Link>
        <Link to="/cv/new" className={isActive('/cv/new')}>+ Créer</Link>
        <Link to="/stats" className={isActive('/stats')}>Stats</Link>
      </div>
      <div className="navbar-user">
        <div className="navbar-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="navbar-username">{user?.username}</span>
        <button className="btn-logout" onClick={handleLogout}>Déconnexion</button>
      </div>
    </nav>
  );
}
