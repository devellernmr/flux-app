import { AnimatePresence, motion } from "framer-motion";
import { useTutorial } from "./TutorialContext";
import { X, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TutorialOverlay = () => {
    const { isActive, currentStep, targetRect, nextStep, prevStep, endTutorial, currentStepIndex } = useTutorial();

    if (!isActive) return null;

    // Calculate generic spotlight position (fallback center)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const rect = targetRect || {
        top: centerY - 50,
        left: centerX - 100,
        width: 200,
        height: 100,
        bottom: centerY + 50,
        right: centerX + 100,
    } as DOMRect;

    // Spotlight Hole definition
    // We use a massive box shadow to darken the rest of the screen, or an SVG mask.
    // SVG Mask is smoother for animations.

    // Let's use the SVG Mask approach for "Cinema Mode"
    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* 1. The Dark Layer with Hole */}
            {/* Use a massive div with a clip-path or mask-image might be tricky for smooth transition of the hole coordinates. */}
            {/* Alternative: SVG overlay covering the screen with a 'hole' */}

            <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <defs>
                    <mask id="spotlight-mask">
                        {/* White rect covers everything (visible) */}
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {/* Black rect is the hole (invisible/transparent) */}
                        {/* Note: Animating these attributes directly is performant enough usually, or use framer motion on the rect */}
                        <motion.rect
                            initial={false}
                            animate={{
                                x: rect.left - 8,
                                y: rect.top - 8,
                                width: rect.width + 16,
                                height: rect.height + 16,
                                rx: 16 // Radius
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 20
                            }}
                            fill="black"
                        />
                    </mask>
                </defs>

                {/* The Dark Overlay, masked */}
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(3, 3, 3, 0.85)"
                    mask="url(#spotlight-mask)"
                    className="backdrop-blur-[4px]" // Optional subtle blur
                />

                {/* The Glowing Ring around the target */}
                <motion.rect
                    initial={false}
                    animate={{
                        x: rect.left - 8,
                        y: rect.top - 8,
                        width: rect.width + 16,
                        height: rect.height + 16,
                        rx: 16
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 20
                    }}
                    fill="transparent"
                    stroke="url(#gradient-stroke)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                />
                <defs>
                    <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                </defs>
            </svg>

            {/* 2. active interaction layer over the hole? 
          Actually, we want the USER to be able to click the target? 
          Usually tutorials BLOCK interaction unless specified.
          For now, pointer-events-none on the overlay allows clicking THROUGH to the hole?
          The mask makes the hole transparent, but the SVG element itself blocks clicks unless pointer-events none.
          But if pointer-events is none, we can click ANYWHERE.
          We want to block clicks OUTSIDE the hole.
          
          Solution: The SVG path fills the outside. Set pointer-events-auto on the SVG path (complex) or 
          just block interactions generally and provide "Next" buttons. 
          Usually simpler to BLOCK everything. "Look but don't touch" mode for this type of tour.
      */}
            <div className="absolute inset-0 pointer-events-auto" style={{ clipPath: `path('M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z')` }}>
                {/* This invisible layer captures clicks? 
             Actually, simpler: Just let the SVG overlay block clicks. 
             If we set pointer-events: auto on the SVG rect (the dark part), it blocks.
             The hole is distinct.
         */}
            </div>


            {/* 3. Floating Card */}
            <AnimatePresence mode="wait">
                {currentStep && (
                    <TutorialCard
                        key={currentStepIndex} // Key change triggers re-mount animation
                        step={currentStep}
                        rect={rect}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onClose={endTutorial}
                        stepIndex={currentStepIndex}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper to determine card position
const TutorialCard = ({ step, rect, onNext, onPrev, onClose, stepIndex }: any) => {
    // Basic positioning logic
    // If position is 'right', place to right of rect.

    let x = rect.left + rect.width + 24;
    let y = rect.top;

    // Safety check for screen edges would go here (simplified for now)
    // Default to right-aligned for dashboard sidebar

    // Manual adjustments based on step.position
    if (step.position === "bottom") {
        x = rect.left + (rect.width / 2) - 150; // Center horiz
        y = rect.bottom + 24;
    } else if (step.position === "left") {
        x = rect.left - 340;
        y = rect.top;
    } else if (step.position === "center") {
        x = window.innerWidth / 2 - 160;
        y = window.innerHeight / 2 - 100;
    }

    // Boundary checks (basic)
    if (x + 320 > window.innerWidth) x = window.innerWidth - 340;
    if (x < 20) x = 20;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            style={{
                position: "fixed",
                left: x,
                top: y,
                width: 320,
            }}
            className="z-[10000] pointer-events-auto"
        >
            <div className="relative bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden group">

                {/* Glossy gradient top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg animate-pulse">
                            <Zap className="w-4 h-4 text-blue-400" fill="currentColor" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                            Passo {stepIndex + 1}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 leading-tight relative z-10">
                    {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-medium relative z-10">
                    {step.description}
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between relative z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onPrev}
                        disabled={stepIndex === 0}
                        className="text-zinc-500 hover:text-white hover:bg-white/5"
                    >
                        Voltar
                    </Button>

                    <Button
                        size="sm"
                        onClick={onNext}
                        className="bg-white text-black hover:bg-zinc-200 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
                    >
                        {stepIndex === 3 ? "Concluir" : "Próximo"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                {/* Background Decor */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
            </div>
        </motion.div>
    );
};
