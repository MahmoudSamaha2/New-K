
import React, { useState, ReactNode } from 'react';
import { FormData } from '../types';

interface WizardProps {
  initialData: FormData;
  onComplete: (data: FormData) => void;
  onBack: () => void;
}

// --- Sub-components ---

interface StepLayoutProps {
    stepNumber: string;
    date: string;
    subtitle: string;
    title: string;
    description: string;
    question: string;
    children: ReactNode;
}

const StepLayout: React.FC<StepLayoutProps> = ({ 
    stepNumber, date, subtitle, title, description, question, children 
}) => {
    return (
        <div className="h-full flex flex-col justify-end animate-fade-in pb-2">
            <div className="bg-stone-900/80 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-2xl shadow-2xl mx-4 md:mx-0">
                 {/* Header Section */}
                 <div className="mb-5 pb-5 border-b border-white/10">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <span className="text-gold-300 text-xs font-serif italic tracking-wider block mb-1">{date}</span>
                             <h3 className="text-2xl md:text-3xl font-cinzel text-white leading-none">{title}</h3>
                        </div>
                        <span className="text-stone-600 text-[10px] font-sans font-bold tracking-widest opacity-60 pt-1">{stepNumber}</span>
                    </div>
                    
                    <p className="text-stone-400 text-xs uppercase tracking-widest font-cinzel mb-3">{subtitle}</p>
                    
                    <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-serif italic border-l-2 border-gold-300/30 pl-3">
                        {description}
                    </p>
                 </div>
                 
                 {/* Question & Options */}
                 <div>
                    <p className="text-white font-medium text-sm md:text-base mb-3 md:mb-4">{question}</p>
                    <div className="space-y-2 md:space-y-3">
                        {children}
                    </div>
                 </div>
            </div>
        </div>
    );
};

interface RadioOptionProps {
    label: string;
    selected: boolean;
    onClick: () => void;
}

const RadioOption: React.FC<RadioOptionProps> = ({ label, selected, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                selected 
                ? 'bg-gold-300/20 border-gold-300 text-white' 
                : 'bg-black/20 border-white/10 text-stone-300 hover:bg-white/5'
            }`}
        >
            <div className="flex items-center justify-between relative z-10 gap-2">
                <span className="font-sans text-xs md:text-sm flex-1 line-clamp-2">{label}</span>
                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selected ? 'border-gold-300' : 'border-stone-500'}`}>
                    {selected && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gold-300 rounded-full" />}
                </div>
            </div>
        </button>
    );
};

const COUNTRY_CODES = [
    { code: '+20', flag: 'EG' },
    { code: '+971', flag: 'AE' },
    { code: '+966', flag: 'SA' },
    { code: '+965', flag: 'KW' },
    { code: '+974', flag: 'QA' },
    { code: '+44', flag: 'UK' },
    { code: '+1', flag: 'US' },
    { code: '+33', flag: 'FR' },
    { code: '+49', flag: 'DE' },
    { code: '+39', flag: 'IT' },
];

// Logical Step IDs:
// 0: Intro
// 1: Nubian Night
// 2: Wedding
// 3: Travel
// 4: Accommodation
// 5: Post Wedding
// 6: Return Plan
// 7: Contact

// New Requested Order: Intro (0) -> Travel (3) -> Accom (4) -> Nubian (1) -> Wedding (2) -> Post (5) -> Return (6) -> Contact (7)
const STEP_ORDER = [0, 3, 4, 1, 2, 5, 6, 7];


// --- Main Wizard Component ---

const Wizard: React.FC<WizardProps> = ({ initialData, onComplete, onBack }) => {
  // 'step' now refers to the index in the STEP_ORDER array
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = STEP_ORDER.length - 1; // 7

  // Log form started
  React.useEffect(() => {
    console.log('📋 RSVP FORM STARTED');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Initial Data:', initialData);
  }, []);

  const currentLogicalStep = STEP_ORDER[step];

  // Background mapping based on logical step
  const getBgImage = (logicalStepId: number) => {
      const imageIndex = logicalStepId === 0 ? 7 : logicalStepId;
      return `url('https://www.internal-comm.com/assets/bg${imageIndex}.jpg')`;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    // Check logical step for conditional logic
    if (currentLogicalStep === 5) {
       // Conditional Logic: If "No" on Post Wedding, skip Return Plan (Logical 6)
       // In STEP_ORDER [0, 3, 4, 1, 2, 5, 6, 7], Logical 5 is at index 5.
       // Logical 6 is at index 6. Logical 7 is at index 7.
       // So we want to skip to index 7.
       if (formData.postWedding.startsWith("No")) {
         setStep(7);
         return;
       }
    }
    
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('📤 Submission in progress...');
    
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('❌ Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    // If we are at logical step 7 (Contact), check if we came from skipped step
    if (currentLogicalStep === 7) {
        if (formData.postWedding.startsWith("No")) {
            // Go back to Logical Step 5 (Post Wedding), which is index 5 in our order
            setStep(5);
            return;
        }
    }

    if (step > 0) {
      setStep(prev => prev - 1);
    } else if (step === 0) {
        onBack();
    }
  };

  const isCurrentStepValid = () => {
    switch (currentLogicalStep) {
      case 0: return true; // Intro always valid
      case 1: return !!formData.nubianNight;
      case 2: return !!formData.wedding;
      case 3: return !!formData.travel;
      case 4: return !!formData.accommodation;
      case 5: return !!formData.postWedding;
      case 6: return !!formData.returnPlan; 
      case 7: return !!formData.name && !!formData.phone && formData.phone.length >= 6 && !!formData.attendees;
      default: return false;
    }
  };

  // Render Step Content based on Logical Step ID
  const renderStepContent = () => {
    switch(currentLogicalStep) {
        case 0: // Intro
            return (
                <div className="h-full flex flex-col justify-center animate-fade-in pb-8">
                    <div className="bg-stone-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl mx-4 md:mx-0">
                        {/* Header Section */}
                        <div className="mb-6 pb-4 border-b border-white/10 text-center">
                            <p className="text-stone-400 text-xs uppercase tracking-widest font-cinzel mb-2">Welcome</p>
                            
                            <p className="text-stone-300 text-sm md:text-base leading-relaxed font-serif italic px-2">
                                You’ve seen a glimpse of what’s to come, now let’s shape your journey.
                            </p>
                        </div>
                        
                        {/* Body Text */}
                        <div className="space-y-4 text-stone-200 text-sm font-serif leading-relaxed">
                            <p>We’re planning three unforgettable days by the Nile:</p>
                            <ul className="space-y-3 list-none text-stone-300">
                                <li className="flex gap-3 items-start">
                                    <span className="text-gold-300 mt-1.5 text-[10px]">●</span>
                                    <span>A <span className="text-gold-200">Nubian night</span> on March 20, where music, color, and joy fill the air.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="text-gold-300 mt-1.5 text-[10px]">●</span>
                                    <span>A <span className="text-gold-200">classic wedding</span> on March 21, elegant and full of meaning.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <span className="text-gold-300 mt-1.5 text-[10px]">●</span>
                                    <span>And on March 22, a <span className="text-gold-200">relaxed farewell</span> to unwind and explore Aswan a little more.</span>
                                </li>
                            </ul>
                            <p className="text-xs md:text-sm text-stone-400 mt-6 italic border-t border-white/5 pt-4 text-center">
                                To help us plan your travel, stay, and experience, just answer a few quick questions below.
                            </p>
                        </div>
                    </div>
                </div>
            );
        case 1: // Nubian Night (Sequence 3 -> Step 03)
            return (
                <StepLayout 
                   stepNumber="03"
                   date="March 20"
                   subtitle="The Day Before"
                   title="Nubian Night"
                   description="Drums, colors, dancing under the stars. A barefoot balady celebration."
                   question="Will you join the pre-wedding party, 7ena Balady?"
                >
                    <RadioOption 
                        label="Yes, I’m dancing already" 
                        selected={formData.nubianNight === "Yes"}
                        onClick={() => handleInputChange('nubianNight', "Yes")}
                    />
                    <RadioOption 
                        label="Not sure yet" 
                        selected={formData.nubianNight === "Not sure"}
                        onClick={() => handleInputChange('nubianNight', "Not sure")}
                    />
                </StepLayout>
            );
        case 2: // Wedding (Sequence 4 -> Step 04)
            return (
                <StepLayout 
                   stepNumber="04"
                   date="March 21"
                   subtitle="The Big Day"
                   title="The Ceremony"
                   description="The Nile. The vows. The people. The moment."
                   question="Will you attend the wedding in Aswan?"
                >
                    <RadioOption 
                        label="Absolutely — I’ll be there" 
                        selected={formData.wedding === "Yes"}
                        onClick={() => handleInputChange('wedding', "Yes")}
                    />
                    <RadioOption 
                        label="Of course — wouldn’t miss it" 
                        selected={formData.wedding === "Of course"}
                        onClick={() => handleInputChange('wedding', "Of course")}
                    />
                </StepLayout>
            );
        case 3: // Travel (Sequence 1 -> Step 01)
             return (
                <StepLayout 
                   stepNumber="01"
                   date="Getting There"
                   subtitle=" "
                   title=" "
                   description="We’re organizing group travel — so you don’t miss the laughter on the way or the stories en route."
                   question="How would you like to travel to Aswan?"
                >
                    <RadioOption 
                        label="By plane – quick and easy" 
                        selected={formData.travel === "Plane"}
                        onClick={() => handleInputChange('travel', "Plane")}
                    />
                    <RadioOption 
                        label="By train – scenic and relaxed" 
                        selected={formData.travel === "Train"}
                        onClick={() => handleInputChange('travel', "Train")}
                    />
                </StepLayout>
            );
        case 4: // Accommodation (Sequence 2 -> Step 02)
             return (
                <StepLayout 
                   stepNumber="02"
                   date="Staying Together"
                   subtitle=""
                   title=" "
                   description="One roof. One vibe. One long sleepover."
                   question="We’re booking a hotel for everyone to stay together. Want to be part of it?"
                >
                    <RadioOption 
                        label="Yes, book me in" 
                        selected={formData.accommodation === "Yes"}
                        onClick={() => handleInputChange('accommodation', "Yes")}
                    />
                    <RadioOption 
                        label="No thanks, I’ll arrange my own stay" 
                        selected={formData.accommodation === "No"}
                        onClick={() => handleInputChange('accommodation', "No")}
                    />
                </StepLayout>
            );
        case 5: // Post Wedding (Sequence 5 -> Step 05)
             return (
                <StepLayout 
                   stepNumber="05"
                   date="March 22"
                   subtitle="The Day After"
                   title="Post Wedding"
                   description="Temples, boats, and sunsets after the “I do.”"
                   question="Will you join the post-wedding Aswan trip?"
                >
                    <RadioOption 
                        label="Yes, I’m in" 
                        selected={formData.postWedding === "Yes, I’m in"}
                        onClick={() => handleInputChange('postWedding', "Yes, I’m in")}
                    />
                    <RadioOption 
                        label="No — have to head back" 
                        selected={formData.postWedding === "No — have to head back"}
                        onClick={() => handleInputChange('postWedding', "No — have to head back")}
                    />
                </StepLayout>
            );
        case 6: // Return Plan (Sequence 6 -> Step 06)
             return (
                <StepLayout 
                   stepNumber="06"
                   date="The Journey Home"
                   subtitle=" "
                   title=" "
                   description="If you're joining the post-wedding trip:"
                   question="How would you like to return?"
                >
                    <RadioOption 
                        label="I’ll return with the group on the 22nd" 
                        selected={formData.returnPlan === "Group Return"}
                        onClick={() => handleInputChange('returnPlan', "Group Return")}
                    />
                    <RadioOption 
                        label="I’ll continue exploring on my own" 
                        selected={formData.returnPlan === "Own Return"}
                        onClick={() => handleInputChange('returnPlan', "Own Return")}
                    />
                </StepLayout>
            );
        case 7: // Contact (Sequence 7 -> Final)
            return (
                 <div className="h-full flex flex-col justify-center animate-fade-in pb-8">
                    <div className="bg-stone-900/90 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-2xl shadow-2xl mx-4 md:mx-0">
                        <div className="text-gold-300 text-xs font-serif uppercase tracking-widest mb-2">Final Step</div>
                        <h3 className="text-2xl md:text-3xl font-cinzel text-white mb-2">Contact Details</h3>
                        <p className="text-stone-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">Just so we can stay connected.</p>
                        
                        <div className="space-y-3 md:space-y-4">
                             <div className="space-y-1">
                                <label className="text-xs text-stone-400 uppercase tracking-wider pl-1">Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Your full name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full bg-stone-900/50 border border-stone-600 rounded-lg p-3 text-sm md:text-base text-white placeholder-stone-600 focus:outline-none focus:border-gold-300 transition-colors"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-xs text-stone-400 uppercase tracking-wider pl-1">Phone</label>
                                <div className="flex gap-2">
                                    <div className="relative w-[110px] flex-shrink-0 group">
                                        <select
                                            value={formData.countryCode || '+20'}
                                            onChange={(e) => handleInputChange('countryCode', e.target.value)}
                                            className="w-full h-full appearance-none bg-stone-900/50 border border-stone-600 rounded-lg pl-3 pr-8 py-3 text-sm md:text-base text-white focus:outline-none focus:border-gold-300 transition-colors cursor-pointer"
                                        >
                                            {COUNTRY_CODES.map((c) => (
                                                <option key={c.code} value={c.code} className="bg-stone-900 text-white">
                                                    {c.flag} {c.code}
                                                </option>
                                            ))}
                                            <option value="other" className="bg-stone-900 text-white">Other</option>
                                        </select>
                                        {/* Custom Arrow */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-hover:text-gold-300 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input 
                                        type="tel" 
                                        inputMode="numeric"
                                        placeholder="1234567890"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            // Validate: Only numbers
                                            const val = e.target.value.replace(/\D/g, '');
                                            handleInputChange('phone', val);
                                        }}
                                        className="flex-1 bg-stone-900/50 border border-stone-600 rounded-lg p-3 text-sm md:text-base text-white placeholder-stone-600 focus:outline-none focus:border-gold-300 transition-colors"
                                    />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-xs text-stone-400 uppercase tracking-wider pl-1">Total Attendees</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    max="10"
                                    value={formData.attendees}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            handleInputChange('attendees', '');
                                            return;
                                        }
                                        const num = parseInt(val, 10);
                                        if (!isNaN(num)) {
                                            if (num < 1) handleInputChange('attendees', '1');
                                            else if (num > 10) handleInputChange('attendees', '10');
                                            else handleInputChange('attendees', val);
                                        }
                                    }}
                                    className="w-full bg-stone-900/50 border border-stone-600 rounded-lg p-3 text-sm md:text-base text-white placeholder-stone-600 focus:outline-none focus:border-gold-300 transition-colors"
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-xs text-stone-400 uppercase tracking-wider pl-1">Optional Notes</label>
                                <textarea 
                                    placeholder="Anything else we should know?"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={2}
                                    className="w-full bg-stone-900/50 border border-stone-600 rounded-lg p-3 text-sm md:text-base text-white placeholder-stone-600 focus:outline-none focus:border-gold-300 transition-colors resize-none"
                                />
                             </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                            <p className="text-sm text-stone-300 font-serif italic mb-2">
                                Our lovely friend Nourhan will be in touch to confirm the details and help with any arrangements you might need.
                            </p>
                            <div className="inline-flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/5 mt-1">
                                <span className="text-[10px] text-stone-500 uppercase tracking-widest">You can also reach her at:</span>
                                <a href="tel:+201220105839" className="text-gold-300 font-sans font-bold hover:text-gold-200 transition-colors">
                                    +20 122 0105839
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )
    }
  }

  // Helper text for button
  const getButtonText = () => {
    if (isSubmitting) return "Submitting...";
    if (step === 0) return "Next";
    if (step === totalSteps) return "Submit";
    return "Next";
  };

  return (
    <div 
        className="relative w-full h-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: getBgImage(currentLogicalStep) }}
    >
      {/* Fade and Flash Transition Overlay */}
      <div 
        className="absolute inset-0 bg-black pointer-events-none animate-fade-flash"
        key={`flash-${step}`}
      />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 transition-opacity duration-500" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 pb-20 md:pb-12">
            <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-end">
                {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-3 md:mt-4 flex items-center justify-between gap-2 md:gap-4 max-w-md mx-auto w-full z-20 px-4 md:px-0">
                <button 
                    onClick={prevStep}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20 text-white/70 text-xs md:text-sm font-sans uppercase tracking-wider hover:bg-white/10 transition-colors whitespace-nowrap opacity-100`}
                >
                    Back
                </button>

                <button 
                    onClick={nextStep}
                    disabled={!isCurrentStepValid() || isSubmitting}
                    className={`flex-1 bg-gold-300 text-stone-900 px-4 md:px-6 py-2 md:py-3 rounded-full font-serif font-bold text-xs md:text-sm uppercase tracking-widest shadow-lg transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-1 md:gap-2">
                            <span className="inline-block w-3 h-3 md:w-4 md:h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></span>
                            <span className="hidden sm:inline">Submitting...</span>
                            <span className="sm:hidden">...</span>
                        </span>
                    ) : getButtonText()}
                </button>
            </div>
        </div>
    </div>
  );
};

export default Wizard;
