import React from 'react';

const ThankYou = () => {
  return (
    <div className="relative w-full h-full bg-[url('http://soussyandkae.com/assets/bg7.jpg')] bg-cover bg-center">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-stone-950/80" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center animate-fade-in z-10">
         <div className="mb-6 md:mb-8 text-4xl md:text-5xl animate-bounce-slow">🕊️</div>
         
         <div className="space-y-1 md:space-y-2 mb-6 md:mb-8">
            <h2 className="font-cinzel text-3xl md:text-5xl text-gold-200 line-clamp-2">Thank You</h2>
            <p className="font-serif italic text-stone-400 text-base md:text-lg">See you by the Nile</p>
         </div>
         
         <div className="bg-white/5 backdrop-blur-sm p-4 md:p-8 rounded-2xl border border-white/10 max-w-sm w-full shadow-2xl mx-4">
             <p className="font-serif italic text-stone-200 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                Your part in this celebration means the world to us.
             </p>
             <p className="font-serif italic text-stone-200 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
                We truly can't wait to celebrate with you.
             </p>
             <p className="font-serif italic text-stone-200 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
                See you by the Nile.
             </p>
             <p className="font-serif text-stone-300 text-xs md:text-sm leading-relaxed">
                With love,<br/><span className="font-cinzel text-gold-300">Sarah & Kholi</span>
             </p>
         </div>
         
         <div className="absolute bottom-8 md:bottom-12 left-0 w-full text-center px-4">
             <div className="w-8 md:w-12 h-px bg-stone-700 mx-auto mb-3 md:mb-4"></div>
             <p className="text-stone-500 text-[10px] md:text-xs font-sans uppercase tracking-widest">
                You can close this page now,<br/>or keep it to revisit the details.
             </p>
         </div>
      </div>
    </div>
  );
};

export default ThankYou;