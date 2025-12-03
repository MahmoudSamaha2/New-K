
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
  const hasEndedOnce = useRef<boolean>(false); // Track if we've handled the first end
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSoundNote, setShowSoundNote] = useState(false);
  const [showUnmuteIcon, setShowUnmuteIcon] = useState(false);
  const touchStartY = useRef<number | null>(null);

  // Setup video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set playing state based on video events
    const handlePlay = () => {
      setIsPlaying(true);
      // Show sound note on play, but only if we haven't finished the first loop (where scroll hint takes over)
      if (!hasEndedOnce.current) {
        setShowSoundNote(true);
      }
    };
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    let readyTimeout: ReturnType<typeof setTimeout>;

    // Setup HLS support for cross-browser compatibility
    if (src.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari supports HLS natively
        console.log('🎥 Using native HLS support (Safari)');
        video.src = src;
        onReady?.();
      } else if ((window as any).Hls && (window as any).Hls.isSupported()) {
        // Use HLS.js for other browsers
        console.log('🎥 Using HLS.js library for HLS support');
        const hls = new (window as any).Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        
        // Timeout fallback if manifest doesn't load
        readyTimeout = setTimeout(() => {
          console.log('🎥 Video ready (timeout fallback)');
          onReady?.();
        }, 3000);
        
        hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
          console.log('🎥 HLS manifest loaded successfully');
          clearTimeout(readyTimeout);
          onReady?.();
        });
        hls.on((window as any).Hls.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            console.error('🎥 HLS fatal error:', data);
            hls.destroy();
            clearTimeout(readyTimeout);
            onReady?.();
          }
        });
      } else {
        console.error('🎥 HLS support not available in this browser');
        video.src = src;
        onReady?.();
      }
    } else {
      video.src = src;
      onReady?.();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      clearTimeout(readyTimeout);
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
      await videoRef.current.play().catch(() => {
        console.error("Manual play failed");
      });
      setIsPlaying(true);
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
    
    // Video stops automatically at the end. We do not restart it.
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
      className={`absolute inset-0 bg-black overflow-hidden select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={src}
        playsInline
        preload="auto"
        // Loop removed to allow onEnded to fire
        onEnded={handleVideoEnded}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

      {/* Unmute Icon (flashes if sound is muted) */}
      {showUnmuteIcon && (
        <div className="absolute top-6 left-6 z-30 animate-pulse">
          <svg className="w-6 h-6 text-gold-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </div>
      )}

      {/* Manual Play Button (Only visible if not playing AND video hasn't finished yet) */}
      {!isPlaying && !hasEndedOnce.current && (
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
          <span className="text-[10px] uppercase tracking-widest mb-2">Scroll to RSVP</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
      </div>
    </div>
  );
});

export default HeroVideo;
    