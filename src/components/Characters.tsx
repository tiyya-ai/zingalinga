import React from 'react';

export const Kiki = ({ className = "" }: { className?: string }) => (
  <div className={`${className} animate-bounce`} style={{ animationDuration: '2s' }} suppressHydrationWarning>
    <div className="relative">
      {/* Monkey body */}
      <div className="w-16 h-20 bg-gradient-to-b from-brand-yellow to-yellow-500 rounded-full relative">
        {/* Head */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-b from-brand-yellow to-yellow-400 rounded-full">
          {/* Eyes */}
          <div className="absolute top-3 left-2 w-2 h-2 bg-white rounded-full">
            <div className="w-1 h-1 bg-black rounded-full ml-0.5 mt-0.5"></div>
          </div>
          <div className="absolute top-3 right-2 w-2 h-2 bg-white rounded-full">
            <div className="w-1 h-1 bg-black rounded-full ml-0.5 mt-0.5"></div>
          </div>
          {/* Nose */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></div>
        </div>
        {/* Arms */}
        <div className="absolute top-2 -left-3 w-6 h-3 bg-brand-yellow rounded-full transform rotate-45"></div>
        <div className="absolute top-2 -right-3 w-6 h-3 bg-brand-yellow rounded-full transform -rotate-45"></div>
        {/* Tail */}
        <div className="absolute -bottom-2 -right-4 w-8 h-2 bg-brand-yellow rounded-full transform rotate-45"></div>
      </div>
      {/* Musical notes */}
      <div className="absolute -top-4 -right-2 text-brand-blue animate-pulse">♪</div>
      <div className="absolute -top-6 right-2 text-brand-blue animate-pulse" style={{ animationDelay: '0.5s' }}>♫</div>
    </div>
  </div>
);

export const Tano = ({ className = "" }: { className?: string }) => (
  <div className={`${className} animate-bounce`} style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} suppressHydrationWarning>
    <div className="relative">
      {/* Elephant body */}
      <div className="w-20 h-16 bg-gradient-to-b from-brand-pink to-pink-500 rounded-full relative">
        {/* Head */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-10 bg-gradient-to-b from-brand-pink to-pink-400 rounded-full">
          {/* Eyes */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full">
            <div className="w-1 h-1 bg-black rounded-full ml-0.5 mt-0.5"></div>
          </div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full">
            <div className="w-1 h-1 bg-black rounded-full ml-0.5 mt-0.5"></div>
          </div>
          {/* Trunk */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-8 bg-brand-pink rounded-full"></div>
          {/* Ears */}
          <div className="absolute top-1 -left-2 w-4 h-6 bg-brand-pink rounded-full transform -rotate-12"></div>
          <div className="absolute top-1 -right-2 w-4 h-6 bg-brand-pink rounded-full transform rotate-12"></div>
        </div>
        {/* Legs */}
        <div className="absolute -bottom-2 left-1 w-3 h-4 bg-brand-pink rounded-full"></div>
        <div className="absolute -bottom-2 right-1 w-3 h-4 bg-brand-pink rounded-full"></div>
      </div>
      {/* Camera */}
      <div className="absolute -top-2 -right-3 w-4 h-3 bg-black rounded-sm">
        <div className="absolute top-0.5 left-0.5 w-2 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  </div>
);