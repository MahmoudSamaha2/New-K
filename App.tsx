import React, { useState, useRef, useEffect } from 'react';
import HeroVideo, { HeroVideoHandle } from './components/HeroVideo';
import Wizard from './components/Wizard';
import ThankYou from './components/ThankYou';
import SimpleLoader from './components/SimpleLoader';
import { ViewState, FormData } from './types';
import { sendFormEmail } from './utils/emailService';

const ASSETS = {
  video: 'https://soussyandkae.com/assets/video/Kholi-wedding-inv-vid.m3u8',
  images: Array.from({ length: 7 }, (_, i) => `http://soussyandkae.com/assets/bg${i + 1}.jpg`)
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

  const handleVideoReady = () => {
    // Ensure loader shows for at least 2 seconds
    const elapsedTime = Date.now() - loaderStartTime.current;
    const remainingTime = Math.max(2000 - elapsedTime, 0);
    
    setTimeout(() => {
      setShowLoader(false);
    }, remainingTime);
  };

  const handleVideoComplete = () => {
    console.log('🎥 VIDEO COMPLETED');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Transitioning to RSVP form...');
    setView('wizard');
  };

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
              initialData={formData}
            />
          )}
          
          {view === 'thankyou' && <ThankYou />}
        </div>
      </div>
    </div>
  );
}