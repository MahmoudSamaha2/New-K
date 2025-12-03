
import React, { useState, ReactNode } from 'react';
import { FormData } from '../types';

interface WizardProps {
  initialData: FormData;
  onComplete: (data: FormData) => void;
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
        <div className="h-full flex flex-col justify-end animate-fade-in">
            {/* Top Date Badge */}
            <div className="absolute top-8 md:top-12 left-4 md:left-6 border-l-2 border-gold-300 pl-3 md:pl-4">
                <p className="text-gold-200 text-xs font-serif italic">{date}</p>
                <p className="text-white font-cinzel text-lg md:text-xl line-clamp-2">{subtitle}</p>
            </div>

            <div className="bg-stone-900/40 backdrop-blur-md border border-white/10 p-4 md:p-6 rounded-2xl shadow-xl mx-4 md:mx-0">
                 <div className="flex justify-between items-end mb-3 md:mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-cinzel text-white line-clamp-2">{title}</h3>
                    </div>
                 </div>
                 
                 <p className="text-stone-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 font-serif italic border-l border-stone-500 pl-2 md:pl-3 line-clamp-3">
                    {description}
                 </p>
                 
                 <div className="mb-4 md:mb-6">
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


// --- Main Wizard Component ---

const Wizard: React.FC<WizardProps> = ({ initialData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 7;

  // Log form started
  React.useEffect(() => {
    console.log('📋 RSVP FORM STARTED');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Initial Data:', initialData);
  }, []);

  // Background mapping
  const getBgImage = (stepId: number) => `url('http://soussyandkae.com/assets/bg${stepId}.jpg')`;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 5) {
       // Conditional Logic: If "No", skip to Step 7
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
    if (step === 7) {
        // If we came from step 5 (skipped 6), go back to 5
        if (formData.postWedding.startsWith("No")) {
            setStep(5);
            return;
        }
    }
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const isCurrentStepValid = () => {
    switch (step) {
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

  // Render Step Content
  const renderStepContent = () => {
    switch(step) {
        case 1:
            return (
                <StepLayout 
                   stepNumber="01"
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
        case 2:
            return (
                <StepLayout 
                   stepNumber="02"
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
        case 3:
             return (
                <StepLayout 
                   stepNumber="03"
                   date="Traveling"
                   subtitle="Getting There"
                   title="Travel Plans"
                   description="We’re organizing group travel options."
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
        case 4:
             return (
                <StepLayout 
                   stepNumber="04"
                   date="Accommodation"
                   subtitle="Staying Together"
                   title="Hotel Booking"
                   description="One roof. One vibe. One long sleepover."
                   question="Do you want to stay at the group hotel?"
                >
                    <RadioOption 
                        label="Yes, book me in" 
                        selected={formData.accommodation === "Yes"}
                        onClick={() => handleInputChange('accommodation', "Yes")}
                    />
                    <RadioOption 
                        label="I’ll try my luck elsewhere" 
                        selected={formData.accommodation === "No"}
                        onClick={() => handleInputChange('accommodation', "No")}
                    />
                </StepLayout>
            );
        case 5:
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
        case 6:
             return (
                <StepLayout 
                   stepNumber="06"
                   date="Return"
                   subtitle="The Journey Home"
                   title="Return Plan"
                   description="Since you're joining the post-wedding trip:"
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
        case 7:
            return (
                 <div className="flex flex-col h-full justify-end animate-fade-in">
                    {/* Changed h-[85%] to h-auto max-h-[85%] to allow shrinking and reduce whitespace */}
                    <div className="bg-stone-900/70 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-t-3xl shadow-2xl h-auto max-h-[85%] overflow-y-auto no-scrollbar">
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
                        
                        <div className="pt-3 text-center">
                            <p className="text-[10px] md:text-xs text-stone-500 leading-relaxed">
                                Our lovely friend Nourhan will be in touch.<br/>
                                You can also reach her at: +20 122 0105839
                            </p>
                        </div>
                    </div>
                </div>
            )
    }
  }

  return (
    <div 
        className="relative w-full h-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: getBgImage(step) }}
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
                    disabled={step === 1}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20 text-white/70 text-xs md:text-sm font-sans uppercase tracking-wider hover:bg-white/10 transition-colors whitespace-nowrap ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
                    ) : step === totalSteps ? 'Submit RSVP' : 'Next'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default Wizard;
