import { useState } from 'react';

export type Page = 'home' | 'activity-logs';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  const navItems: { page: Page; label: string; icon: string }[] = [
    { page: 'home', label: 'Home', icon: '🏠' },
    { page: 'activity-logs', label: 'Activity Logs', icon: '📋' },
  ];

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? '☰' : '✕'}
      </button>

      {!collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">🧪 John Test</div>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                className={`sidebar-link ${currentPage === item.page ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.page);
                  setCollapsed(true);
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
