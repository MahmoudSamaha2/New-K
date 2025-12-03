import React, { useState } from 'react';

interface LoaderProps {
  onStart: () => void;
  onFadeComplete: () => void;
  progress: number;
  isReady: boolean;
}

const Loader: React.FC<LoaderProps> = ({ onStart, onFadeComplete, progress, isReady }) => {
  const [fading, setFading] = useState(false);

  const handleTap = () => {
    if (!isReady) return;
    
    // Critical: Trigger video play IMMEDIATELY within the event handler
    onStart();
    
    // Start visual transition
    setFading(true);
    
    // Unmount after animation
    setTimeout(() => {
      onFadeComplete();
    }, 600);
  };

  return (
    <div 
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-stone-100 to-stone-200 text-stone-900 transition-opacity duration-700 ease-out ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Central Content */}
      <div className="flex flex-col items-center gap-8 mb-12">
        {/* Ring Loader Animation with Progress */}
        <div className="relative w-32 h-32 flex items-center justify-center">
           {/* Background Circle */}
           <svg className="absolute inset-0 w-full h-full transform -rotate-90">
             <circle 
               cx="64" cy="64" r="60" 
               stroke="currentColor" 
               strokeWidth="2" 
               fill="transparent" 
               className="text-stone-300 opacity-30" 
             />
             {/* Progress Circle */}
             <circle 
               cx="64" cy="64" r="60" 
               stroke="currentColor" 
               strokeWidth="2" 
               fill="transparent" 
               strokeDasharray={377} // 2 * pi * r
               strokeDashoffset={377 - (377 * progress) / 100}
               className="text-stone-800 transition-all duration-300 ease-out"
             />
           </svg>
           
           {/* Center Content */}
           <div className="absolute inset-0 flex items-center justify-center">
             {isReady ? (
               <img src="assets/ring-favicon.png" alt="Ring" className="w-8 h-8 opacity-60 animate-pulse" />
             ) : (
                <span className="font-sans text-xs font-bold text-stone-400">{Math.round(progress)}%</span>
             )}
           </div>
        </div>

        <div className="text-center space-y-3">
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-500 animate-pulse">
              {isReady ? "A night of love is loading..." : "Preparing experience..."}
            </p>
            <h1 className="font-cinzel text-5xl font-semibold text-stone-800 tracking-wider">S &amp; M</h1>
            <p className="font-serif italic text-stone-600 text-lg">March 21, 2026</p>
        </div>
      </div>

      {/* Button */}
      <div className="absolute bottom-20 flex flex-col items-center gap-6 w-full px-8">
        <button 
          onClick={handleTap}
          disabled={!isReady}
          className={`w-full max-w-xs px-8 py-4 rounded-full font-serif tracking-widest text-sm uppercase transition-all duration-500 transform shadow-xl border border-stone-700 
            ${isReady 
              ? 'bg-stone-900 text-gold-100 hover:bg-stone-800 hover:scale-105 cursor-pointer opacity-100' 
              : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-50 scale-95'
            }`}
        >
          {isReady ? 'Tap to begin' : 'Loading...'}
        </button>
        <p className={`text-[10px] text-stone-500 flex items-center gap-2 uppercase tracking-widest transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
          <span>💍</span> Sound on for the full experience
        </p>
      </div>
    </div>
  );
};

export default Loader;