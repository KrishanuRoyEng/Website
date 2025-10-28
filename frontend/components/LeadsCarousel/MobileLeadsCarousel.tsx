import { Member } from "@/lib/types";
import MemberCard from "@/components/MemberCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface MobileLeadsCarouselProps {
  leads: Member[];
  loading: boolean;
}

export default function MobileLeadsCarousel({ leads, loading }: MobileLeadsCarouselProps) {
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sort leads: user ID 1 first, then others
  const sortedLeads = [...leads].sort((a, b) => {
    if (a.user.id === 1) return -1;
    if (b.user.id === 1) return 1;
    return 0;
  });

  const nextLead = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentLeadIndex((prev) => (prev + 1) % sortedLeads.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevLead = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentLeadIndex((prev) => (prev - 1 + sortedLeads.length) % sortedLeads.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextLead();
    } else if (isRightSwipe) {
      prevLead();
    }
  };

  // Auto-scroll for mobile
  useEffect(() => {
    if (sortedLeads.length <= 1 || isTransitioning) return;

    const interval = setInterval(() => {
      setCurrentLeadIndex((prev) => (prev + 1) % sortedLeads.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [sortedLeads.length, isTransitioning]);

  if (loading) {
    return (
      <div className="flex justify-center items-center gap-3 h-80">
        {/* Left shadow card */}
        <div className="w-32 h-64 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900 opacity-60 transform rotate-y-12" />
        {/* Center focus card */}
        <div className="w-40 h-72 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
        {/* Right shadow card */}
        <div className="w-32 h-64 card animate-pulse bg-gradient-to-br from-slate-800 to-slate-900 opacity-60 transform -rotate-y-12" />
      </div>
    );
  }

  if (sortedLeads.length === 0) {
    return (
      <div className="card p-8 text-center h-80 flex items-center justify-center">
        <div>
          <p className="text-slate-400 text-base">No leads available yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Our community leaders will be featured here soon!
          </p>
        </div>
      </div>
    );
  }

  // Calculate indices for previous, current, and next cards
  const prevIndex = (currentLeadIndex - 1 + sortedLeads.length) % sortedLeads.length;
  const nextIndex = (currentLeadIndex + 1) % sortedLeads.length;

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div 
        className="relative h-80 flex items-center justify-center overflow-visible mx-auto max-w-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Shadow Card */}
        {sortedLeads.length > 1 && (
          <div
            className="absolute transition-all duration-500 ease-out z-10"
            style={{
              transform: 'translateX(-120px) scale(0.85) rotateY(15deg)',
              opacity: 0.7,
            }}
          >
            <div className="w-36 h-64">
              <div className="relative shadow-xl shadow-slate-900/50">
                <MemberCard member={sortedLeads[prevIndex]} />
                <div className="absolute inset-0 bg-slate-900/40 rounded-xl pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Center Focus Card */}
        <div
          className="absolute transition-all duration-500 ease-out z-20"
          style={{
            transform: 'translateX(0) scale(1) rotateY(0)',
          }}
        >
          <div className="w-44 h-72">
            <div className="relative shadow-2xl shadow-accent/20">
              <MemberCard member={sortedLeads[currentLeadIndex]} />
            </div>
          </div>
        </div>

        {/* Right Shadow Card */}
        {sortedLeads.length > 1 && (
          <div
            className="absolute transition-all duration-500 ease-out z-10"
            style={{
              transform: 'translateX(120px) scale(0.85) rotateY(-15deg)',
              opacity: 0.7,
            }}
          >
            <div className="w-36 h-64">
              <div className="relative shadow-xl shadow-slate-900/50">
                <MemberCard member={sortedLeads[nextIndex]} />
                <div className="absolute inset-0 bg-slate-900/40 rounded-xl pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {sortedLeads.length > 1 && (
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={prevLead}
            disabled={isTransitioning}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          
          {/* Dots Indicator */}
          <div className="flex space-x-2">
            {sortedLeads.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentLeadIndex(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
                disabled={isTransitioning}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentLeadIndex
                    ? "bg-accent scale-125"
                    : "bg-slate-600 hover:bg-slate-400"
                } ${isTransitioning ? 'opacity-50' : ''}`}
              />
            ))}
          </div>

          <button
            onClick={nextLead}
            disabled={isTransitioning}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full transition-all duration-300 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      )}

      {/* Swipe Hint */}
      {sortedLeads.length > 1 && (
        <div className="text-center mt-4">
          <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
            <span>Swipe or use arrows to navigate</span>
          </p>
        </div>
      )}

      {/* Loading state during transition */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-slate-900/10 rounded-xl pointer-events-none z-30" />
      )}
    </div>
  );
}