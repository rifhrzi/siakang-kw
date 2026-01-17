import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { navSections } from '../data/siteData';

export default function Layout({ semesterLabel, integrationLabel }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth > 960) return;
      if (
        sidebarRef.current?.contains(event.target) ||
        toggleRef.current?.contains(event.target)
      ) {
        return;
      }
      setSidebarOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}
        ref={sidebarRef}
        aria-label="Navigasi utama"
      >
        <div className="brand">
          <div className="logo-mark" aria-hidden="true">
            SU
          </div>
          <div>
            <div className="brand-title">XYZ Untirta</div>
            <div className="brand-subtitle">Academic Portal</div>
          </div>
        </div>

        <nav className="nav">
          {navSections.map((section) => (
            <div className="nav-group" key={section.heading}>
              <p className="nav-heading">{section.heading}</p>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'is-active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="top-bar">
          <button
            ref={toggleRef}
            className="nav-toggle"
            aria-label="Toggle navigasi"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            ☰
          </button>
          <div className="semester-pill">{semesterLabel}</div>
          <div className="integration-pill">{integrationLabel}</div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

