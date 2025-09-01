import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img src="/morich_logo.png" alt="株式会社morich ロゴ" className="h-10 w-10" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              タグ生成<span className="text-red-600">Marker</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};
