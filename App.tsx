
import React, { useState, useRef, useEffect, useCallback } from 'react';
import HeroVideo, { HeroVideoHandle } from './components/HeroVideo';
import Wizard from './components/Wizard';
import ThankYou from './components/ThankYou';
import SimpleLoader from './components/SimpleLoader';
import { ViewState, FormData } from './types';
import { sendFormEmail } from './utils/emailService';

const ASSETS = {
  video: 'https://www.internal-comm.com/assets/wedding-video.mp4',
  images: Array.from({ length: 7 }, (_, i) => `https://www.internal-comm.com/assets/bg${i + 1}.jpg`)
};

export default function App() {
  const [view, setView] = useState<ViewState>('video');
  const [showLoader, setShowLoader] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    nubianNight: '',
    wedding: '',
    travel: '',
    accommodation: '',
    postWedding: '',
    returnPlan: '',
    name: '',
    countryCode: '+20',
    phone: '',
    attendees: '1',
    notes: ''
  });

  const videoRef = useRef<HeroVideoHandle>(null);
  const loaderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    // Simple image preloading
    ASSETS.images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleVideoReady = useCallback(() => {
    // Ensure loader shows for at least 800ms (smooth transition but fast)
    const elapsedTime = Date.now() - loaderStartTime.current;
    const remainingTime = Math.max(800 - elapsedTime, 0);
    
    setTimeout(() => {
      setShowLoader(false);
    }, remainingTime);
  }, []);

  const handleVideoComplete = useCallback(() => {
    console.log('🎥 VIDEO COMPLETED');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Transitioning to RSVP form...');
    setView('wizard');
  }, []);

  const handleBackToVideo = useCallback(() => {
    console.log('🔙 Returning to video from Wizard');
    setView('video');
  }, []);

  const handleWizardComplete = async (finalData: FormData) => {
    setFormData(finalData);
    console.log('🎉 FORM SUBMISSION EVENT');
    console.log('Status: COMPLETED');
    console.log('All Questions Answered:', finalData);
    console.log('Timestamp:', new Date().toISOString());
    
    // Send email notification
    const emailSuccess = await sendFormEmail(finalData);
    
    if (emailSuccess) {
      console.log('📊 SUBMISSION STATUS: SUCCESS - Data logged and email sent');
    } else {
      console.log('📊 SUBMISSION STATUS: PARTIAL SUCCESS - Data logged but email failed');
    }
    
    setView('thankyou');
  };

  return (
    <div className="w-full h-screen bg-black p-0 font-sans overflow-hidden">
      
      {/* Full Screen Container */}
      <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
        
        {/* Simple Loader */}
        <SimpleLoader isVisible={showLoader} />
        
        {/* Dynamic Content */}
        <div className="absolute inset-0 w-full h-full bg-black">
          
          {view === 'video' && (
             <HeroVideo 
                ref={videoRef}
                src={ASSETS.video}
                onComplete={handleVideoComplete}
                onReady={handleVideoReady}
                className="z-0" 
             />
          )}
          
          {view === 'wizard' && (
            <Wizard 
              onComplete={handleWizardComplete} 
              onBack={handleBackToVideo}
              initialData={formData}
            />
          )}
          
          {view === 'thankyou' && <ThankYou />}
        </div>
      </div>
    </div>
  );
}
