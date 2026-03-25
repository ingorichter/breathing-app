import { NavLink } from 'react-router-dom';
import { Home, Settings, BarChart2 } from 'lucide-react';
import styles from './Nav.module.css';

const LINKS = [
  { to: '/',      icon: Home,      label: 'Home'  },
  { to: '/setup', icon: Settings,  label: 'Setup' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
];

export function Nav() {
  return (
    <nav className={`safe-bottom ${styles.nav}`}>
      {LINKS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.linkActive}` : ''}`}
        >
          <Icon size={20} strokeWidth={1.5} />
          <span className={styles.linkLabel}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
