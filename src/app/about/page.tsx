'use client';

import AboutPage from '../../page-components/AboutPage';

export default function About() {
  const handleBack = () => {
    window.location.href = '/';
  };

  const handleNavigate = (page: string) => {
    window.location.href = page === 'home' ? '/' : `/${page}`;
  };

  return <AboutPage onBack={handleBack} onNavigate={handleNavigate} />;
}