import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { TutorialConfig, TutorialContextType } from "./types";
import { useLocation } from "react-router-dom";

// Configuration for our tours (We can move this to a separate file later)
export const DASHBOARD_TOUR: TutorialConfig = {
    id: "dashboard",
    steps: [
        {
            target: "#dashboard-stats-wrapper",
            title: "🏛️ Centro de Comando",
            description: "Sua visão panorâmica da agência. Métricas vitais e insights financeiros em tempo real.",
            position: "bottom"
        },
        {
            target: "#dashboard-new-project-btn",
            title: "⚡ Novo Fluxo Instantâneo",
            description: "Comece aqui. Crie projetos do zero ou use nossa IA para gerar o briefing perfeito em segundos.",
            position: "left"
        },
        {
            target: "#sidebar-nav-analytics",
            title: "🔭 Intelligence Hub",
            description: "Dados que contam histórias. Gráficos preditivos para decisões baseadas em fatos.",
            position: "right"
        },
        {
            target: "#sidebar-nav-settings",
            title: "🎭 Identidade Secreta",
            description: "Personalize o Portal do Cliente com sua marca, cores e domínio. Faça eles se sentirem em casa.",
            position: "right"
        },
    ]
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [activeConfig, setActiveConfig] = useState<TutorialConfig>(DASHBOARD_TOUR);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const location = useLocation();

    // Reset when route changes if needed, or persist
    useEffect(() => {
        if (isActive) {
            endTutorial();
        }
    }, [location.pathname]);

    const updateTargetRect = useCallback(() => {
        if (!isActive) return;
        const step = activeConfig.steps[currentStepIndex];
        if (step) {
            const element = document.querySelector(step.target);
            if (element) {
                // Scroll into view if needed
                element.scrollIntoView({ behavior: "smooth", block: "center" });

                // Wait for scroll/render? Using a small timeout or ResizeObserver might be better
                // For now, simpler approach:
                setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    setTargetRect(rect);
                }, 100);
            } else {
                // Element not found? Skip or just show center?
                setTargetRect(null);
            }
        }
    }, [isActive, currentStepIndex, activeConfig]);

    useEffect(() => {
        updateTargetRect();
        window.addEventListener("resize", updateTargetRect);
        return () => window.removeEventListener("resize", updateTargetRect);
    }, [updateTargetRect]);

    // Execute action if present (e.g. switch tabs)
    useEffect(() => {
        if (isActive) {
            const step = activeConfig.steps[currentStepIndex];
            if (step?.action) {
                step.action();
                // Re-calculate rect after action (give slight delay for UI update)
                setTimeout(updateTargetRect, 300);
            }
        }
    }, [currentStepIndex, isActive, activeConfig]);


    const startTutorial = () => {
        setIsActive(true);
        setCurrentStepIndex(0);
        // Logic to select config based on ID can be expanded
        setActiveConfig(DASHBOARD_TOUR);
    };

    const endTutorial = () => {
        setIsActive(false);
        setTargetRect(null);
        setCurrentStepIndex(0);
    };

    const nextStep = () => {
        if (currentStepIndex < activeConfig.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            endTutorial();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const currentStep = activeConfig.steps[currentStepIndex] || null;

    return (
        <TutorialContext.Provider value={{
            isActive,
            currentStepIndex,
            currentStep,
            startTutorial,
            endTutorial,
            nextStep,
            prevStep,
            targetRect
        }}>
            {children}
        </TutorialContext.Provider>
    );
};

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error("useTutorial must be used within a TutorialProvider");
    }
    return context;
};
