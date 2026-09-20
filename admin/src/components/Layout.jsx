import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';

const links = [
  ['/', 'Dashboard'],
  ['/courses', 'Courses'],
  ['/units', 'Units'],
  ['/lessons', 'Lessons'],
  ['/community', 'Community'],
  ['/users', 'Users'],
  ['/translations', 'Translations'],
];

export default function Layout() {
  const { logout, profile } = useAdminAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Bridge Academy Admin</h1>
        <p style={{ opacity: 0.8, fontSize: 13, marginBottom: 20 }}>{profile?.email}</p>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button style={{ marginTop: 24, width: '100%' }} onClick={logout}>
          Sign out
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
