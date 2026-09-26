import { NavLink, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function AppShell({ roleLabel, navItems }: { roleLabel: string; navItems: NavItem[] }) {
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg viewBox="0 0 26 26" fill="none" width="22" height="22">
            <circle cx="6" cy="13" r="3.4" stroke="var(--accent)" strokeWidth="1.6" />
            <circle cx="20" cy="6" r="3.4" stroke="var(--teal)" strokeWidth="1.6" />
            <circle cx="20" cy="20" r="3.4" stroke="var(--teal)" strokeWidth="1.6" />
            <line x1="9" y1="12" x2="17" y2="7.4" stroke="var(--on-navy)" strokeWidth="1.2" />
            <line x1="9" y1="14" x2="17" y2="18.6" stroke="var(--on-navy)" strokeWidth="1.2" />
          </svg>
          PraxisLink
        </div>
        <div className="sidebar-role">Perfil {roleLabel}</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "")} end>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button type="button" onClick={logout}>
            ← Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="main-col">
        <Outlet />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right && <div className="topbar-user">{right}</div>}
    </header>
  );
}
