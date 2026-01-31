import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { TutorialConfig, TutorialContextType } from "./types";
import { useLocation } from "react-router-dom";

// Configuration for our tours (We can move this to a separate file later)
export const DASHBOARD_TOUR: TutorialConfig = {
  id: "dashboard",
  steps: [
    {
      target: "#dashboard-stats-wrapper",
      title: "🏛️ Centro de Comando",
      description:
        "Sua visão panorâmica da agência. Métricas vitais e insights financeiros em tempo real.",
      position: "bottom",
    },
    {
      target: "#dashboard-new-project-btn",
      title: "⚡ Novo Fluxo Instantâneo",
      description:
        "Comece aqui. Crie projetos do zero ou use nossa IA para gerar o briefing perfeito em segundos.",
      position: "left",
    },
    {
      target: "#sidebar-nav-analytics",
      title: "🔭 Intelligence Hub",
      description:
        "Dados que contam histórias. Gráficos preditivos para decisões baseadas em fatos.",
      position: "right",
      action: () => {
        /* No direct navigation needed, just highlighting */
      },
    },
    {
      target: "#sidebar-nav-settings",
      title: "🎭 Identidade Secreta",
      description:
        "Personalize o Portal do Cliente com sua marca, cores e domínio. Faça eles se sentirem em casa.",
      position: "right",
      action: () => {
        /* Logic to switch to settings tab if we were using a handler */
      },
    },
  ],
};

export const PROJECT_TOUR: TutorialConfig = {
  id: "project",
  steps: [
    {
      target: "#project-dash-card-deadline",
      title: "⏱️ Controle de Prazos",
      description:
        "Acompanhe a entrega final do projeto. Mantenha seu fluxo no trilho.",
      position: "bottom",
    },
    {
      target: "#project-dash-card-briefing",
      title: "📖 Documentação Viva",
      description:
        "Aqui reside o DNA do projeto. Visualize as respostas do cliente e aprove o briefing para liberar a produção.",
      position: "bottom",
    },
    {
      target: "#project-tab-briefing",
      title: "📝 Briefing & Docs",
      description:
        "Acesse todos os detalhes técnicos e aprovações do briefing nesta aba.",
      position: "right",
      action: (handler: any) => handler?.("briefing"),
    },
    {
      target: "#project-tab-identidade",
      title: "🎨 Brand Kit",
      description:
        "Ativos de marca sempre à mão. Cores, logos e fontes extraídos automaticamente para consistência visual.",
      position: "right",
      action: (handler: any) => handler?.("identidade"),
    },
    {
      target: "#project-tab-approvals",
      title: "🎯 Central de Tasks",
      description:
        "Gerencie aprovações e ajustes em um só lugar. Menos vai-e-vem, mais entregas aprovadas.",
      position: "right",
      action: (handler: any) => handler?.("approvals"),
    },
    {
      target: "#project-tab-files",
      title: "📁 Cloud de Arquivos",
      description:
        "Todos os assets e entregas organizados e versionados automaticamente.",
      position: "right",
      action: (handler: any) => handler?.("files"),
    },
    {
      target: "#project-tab-finance",
      title: "💰 Inteligência Financeira",
      description:
        "Controle orçamentos, horas trabalhadas e margem de lucro em tempo real.",
      position: "right",
      action: (handler: any) => handler?.("finance"),
    },
    {
      target: "#project-tab-members",
      title: "👥 Team Manager",
      description:
        "Gerencie quem tem acesso a este projeto e suas respectivas permissões.",
      position: "right",
      action: (handler: any) => handler?.("members"),
    },
  ],
};

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeConfig, setActiveConfig] =
    useState<TutorialConfig>(DASHBOARD_TOUR);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [navigationHandler, setNavHandler] = useState<
    ((id: string) => void) | null
  >(null);

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
        }, 300); // Increased delay to account for tab switches
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
        // @ts-ignore - passing handler to action
        step.action(navigationHandler);
        // Re-calculate rect after action (give slight delay for UI update)
        setTimeout(updateTargetRect, 500);
      }
    }
  }, [currentStepIndex, isActive, activeConfig, navigationHandler]);

  const startTutorial = (configId: string = "dashboard") => {
    setIsActive(true);
    setCurrentStepIndex(0);

    if (configId === "project") {
      setActiveConfig(PROJECT_TOUR);
    } else {
      setActiveConfig(DASHBOARD_TOUR);
    }
  };

  const endTutorial = () => {
    setIsActive(false);
    setTargetRect(null);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < activeConfig.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const setNavigationHandler = (handler: (id: string) => void) => {
    setNavHandler(() => handler);
  };

  const currentStep = activeConfig.steps[currentStepIndex] || null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        targetRect,
        setNavigationHandler,
      }}
    >
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
