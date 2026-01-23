export interface TutorialStep {
    target: string; // CSS selector of the element to highlight
    title: string;
    description: string;
    position?: "top" | "bottom" | "left" | "right" | "center";
    action?: () => void; // Optional action to run when step starts (e.g., changing tabs)
}

export interface TutorialConfig {
    id: string;
    steps: TutorialStep[];
}

export interface TutorialContextType {
    isActive: boolean;
    currentStepIndex: number;
    currentStep: TutorialStep | null;
    startTutorial: (configId?: string) => void;
    endTutorial: () => void;
    nextStep: () => void;
    prevStep: () => void;
    targetRect: DOMRect | null;
}
