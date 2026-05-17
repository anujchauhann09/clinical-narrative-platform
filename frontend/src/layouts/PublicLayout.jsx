import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { APP_NAME, ROUTES } from '../constants/app.js';

export const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-header__container">
          <Link to={ROUTES.HOME} className="public-brand" onClick={closeMenu}>
            <span className="public-brand__mark">
              <Activity aria-hidden="true" size={20} />
            </span>
            <span>{APP_NAME}</span>
          </Link>

          <button className="public-mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`public-nav ${isMenuOpen ? 'public-nav--open' : ''}`}>
            <div className="public-nav__links">
              <NavLink to={ROUTES.HOME} end className="public-nav__link" onClick={closeMenu}>Home</NavLink>
              <NavLink to={ROUTES.ABOUT} className="public-nav__link" onClick={closeMenu}>About</NavLink>
              <NavLink to={ROUTES.PRIVACY} className="public-nav__link" onClick={closeMenu}>Privacy</NavLink>
            </div>
            <div className="public-nav__auth">
              <Button as={Link} to={ROUTES.LOGIN} variant="ghost" onClick={closeMenu}>Login</Button>
              <Button as={Link} to={ROUTES.SIGNUP} variant="primary" onClick={closeMenu}>Sign Up</Button>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer__container">
          <div className="public-footer__brand">
            <span className="public-brand__mark">
              <Activity aria-hidden="true" size={16} />
            </span>
            <span>{APP_NAME}</span>
          </div>
          <p className="public-footer__copyright">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
