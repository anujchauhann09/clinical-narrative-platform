import { ArrowRight, ShieldCheck, Stethoscope, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { ROUTES } from '../constants/app.js';

export const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <span className="eyebrow">The Future of Medical Records</span>
            <h1 className="hero__title">
              Your Clinical Narrative, <span className="text-highlight">Unified</span>.
            </h1>
            <p className="hero__subtitle">
              Transform fragmented medical data into a cohesive, chronological timeline. Empowering healthcare professionals with clear, actionable insights.
            </p>
            <div className="hero__actions">
              <Button as={Link} to={ROUTES.SIGNUP} className="button--large button--primary">
                Get Started <ArrowRight size={18} />
              </Button>
              <Button as={Link} to={ROUTES.ABOUT} className="button--large button--secondary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features__container">
          <h2 className="section-title">Built for Healthcare Professionals</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-card__icon">
                <Clock size={28} />
              </div>
              <h3 className="feature-card__title">Chronological Timeline</h3>
              <p className="feature-card__desc">
                View patient histories in an intuitive, beautifully rendered timeline that highlights key events and progression.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">
                <Stethoscope size={28} />
              </div>
              <h3 className="feature-card__title">Clinical Insights</h3>
              <p className="feature-card__desc">
                Leverage automated insights that identify critical patterns and potential health risks hidden in the data.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">
                <ShieldCheck size={28} />
              </div>
              <h3 className="feature-card__title">Secure & Compliant</h3>
              <p className="feature-card__desc">
                Engineered with healthcare-grade security, ensuring that sensitive patient information is always protected.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
