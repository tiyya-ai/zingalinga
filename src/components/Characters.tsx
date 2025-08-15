import React from 'react';

export const Kiki = ({ className = "" }: { className?: string }) => (
  <div className={`${className} animate-bounce`} style={{ animationDuration: '2s' }}>
    <div className="relative">
      {/* Kiki Image */}
      <img 
        src="/kiki.png" 
        alt="Kiki Character" 
        className="w-24 h-24 object-contain drop-shadow-lg"
      />
      {/* Musical notes */}
      <div className="absolute -top-4 -right-2 text-brand-blue animate-pulse">♪</div>
      <div className="absolute -top-6 right-2 text-brand-blue animate-pulse" style={{ animationDelay: '0.5s' }}>♫</div>
    </div>
  </div>
);

export const Tano = ({ className = "" }: { className?: string }) => (
  <div className={`${className} animate-bounce`} style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
    <div className="relative">
      {/* Tano Image */}
      <img 
        src="/tano.png" 
        alt="Tano Character" 
        className="w-24 h-24 object-contain drop-shadow-lg"
      />
    </div>
  </div>
);