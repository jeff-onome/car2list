
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-white animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white animate-pulse">Loading...</p>
        <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-600 font-bold">Synchronizing Registry Assets</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
