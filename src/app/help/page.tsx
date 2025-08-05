'use client';

import HelpPage from '../../page-components/HelpPage';

export default function Help() {
  const handleBack = () => {
    window.location.href = '/';
  };

  const handleNavigate = (page: string) => {
    window.location.href = page === 'home' ? '/' : `/${page}`;
  };

  return <HelpPage onBack={handleBack} onNavigate={handleNavigate} />;
}