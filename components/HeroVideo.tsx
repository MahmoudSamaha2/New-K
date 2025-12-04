import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';

interface HeroVideoProps {
  onComplete: () => void;
  onReady?: () => void;
  className?: string;
  src: string;
}

export interface HeroVideoHandle {
  play: () => Promise<void>;
}

const HeroVideo = forwardRef<HeroVideoHandle, HeroVideoProps>(({ onComplete, onReady, className, src }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasEndedOnce = useRef<boolean>(false);
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSoundNote, setShowSoundNote] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log("🎥 Setting video source to MP4:", src);
    video.src = src;
    video.load(); // Explicit load call helps some browsers start fetching immediately

    const handleCanPlay = () => {
         console.log("🎥 Video event: canplay - Ready to start");
         setIsBuffering(false);
         onReady?.();
    };

    const handleWaiting = () => {
        console.log("⏳ Video buffering...");
        setIsBuffering(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      if (!hasEndedOnce.current) setShowSoundNote(true);

      // Enable scroll up after 45 seconds of playback
      if (!timerRef.current) {
         timerRef.current = setTimeout(() => {
             console.log("🔓 45s elapsed: Enabling scroll interaction");
             setShowHint(true);
         }, 45000);
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => console.error("Video Error:", video.error);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [src, onReady]);

  // Auto-hide sound note after 3 seconds
  useEffect(() => {
    if (showSoundNote) {
      const timer = setTimeout(() => {
        setShowSoundNote(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSoundNote]);

  const handleManualPlay = async () => {
    if (videoRef.current) {
        videoRef.current.muted = false;
        try {
            await videoRef.current.play();
            setIsPlaying(true);
        } catch (e) {
            console.error("Manual play failed", e);
            // No fallback logic needed now as src is the fallback
        }
    }
};

  useImperativeHandle(ref, () => ({
    play: async () => {
      await handleManualPlay();
    }
  }));

  const handleVideoEnded = () => {
    // Show hint when video finishes the first time
    setShowHint(true);
    hasEndedOnce.current = true;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Prevent interaction until video has finished (hint is shown)
    if (!showHint) return;

    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // Swipe up (dragged finger up) means positive difference
    if (diff > 50) { 
      onComplete();
    }
    touchStartY.current = null;
  };

  return (
    <div 
      className={`absolute inset-0 bg-black overflow-hidden select-none touch-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-fade-in">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-white/10 border-t-gold-300 rounded-full animate-spin"></div>
             </div>
        </div>
      )}

      {/* Manual Play Button (Only visible if not playing AND video hasn't finished yet) */}
      {!isPlaying && !hasEndedOnce.current && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 animate-fade-in">
          <button 
            onClick={handleManualPlay}
            className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/20 backdrop-blur-md border border-gold-300/30 transition-all duration-500 hover:bg-black/40 hover:border-gold-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(197,160,89,0.15)]"
            title="Play video"
          >
             {/* Animated Ring */}
             <div className="absolute inset-0 rounded-full border border-gold-100/20 scale-100 group-hover:scale-110 transition-transform duration-700 ease-out" />
             
             {/* Icon */}
             <svg className="w-8 h-8 md:w-10 md:h-10 text-gold-200 ml-1 group-hover:text-gold-100 transition-colors drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
               <path d="M8 5v14l11-7z" />
             </svg>
          </button>
        </div>
      )}

   

      {/* Swipe Hint */}
      <div 
          className={`absolute bottom-6 md:bottom-8 left-0 w-full flex flex-col items-center justify-center text-white/70 transition-opacity duration-1000 ${showHint ? 'opacity-100 animate-bounce-slow cursor-pointer' : 'opacity-0 pointer-events-none'}`}
          onClick={onComplete}
      >
          <span className="text-[10px] uppercase tracking-widest mb-2">Scroll Up</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
      </div>
    </div>
  );
});

export default HeroVideo;