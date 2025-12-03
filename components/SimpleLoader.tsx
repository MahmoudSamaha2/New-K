import React from 'react';

interface SimpleLoaderProps {
  isVisible: boolean;
}

const SimpleLoader: React.FC<SimpleLoaderProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 border-4 border-stone-700 border-t-gold-300 rounded-full animate-spin" />
      <p className="text-xs text-stone-400 text-center px-6">🔊 Better with sound on</p>
    </div>
  );
};

export default SimpleLoader;
