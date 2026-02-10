export const PLANS = {
  starter: {
    label: "Starter",
    limits: {
      projects: 1,         // Limite de 1 projeto
      storageMB: 1024,     // 1GB
      features: []         // Sem features extras
    }
  },
  pro: {
    label: "Pro",
    limits: {
      projects: Infinity,  // Ilimitado
      storageMB: 10240,    // 10GB
      features: ['ai_briefing', 'client_sharing', 'priority_support']
    }
  },
  agency: {
    label: "Agency",
    limits: {
      projects: Infinity,
      storageMB: 1048576,  // 1TB
      features: ['ai_briefing', 'client_sharing', 'priority_support', 'multiple_users']
    }
  }
};

export type PlanType = keyof typeof PLANS;
