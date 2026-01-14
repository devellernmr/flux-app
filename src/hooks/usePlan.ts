import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


import type { PlanType } from "@/types";

interface PlanLimits {
  projects: number; // -1 = ilimitado
  storage: number; // em bytes
  features: string[];
}

const PLANS: Record<PlanType, PlanLimits> = {
  starter: {
    projects: 2,
    storage: 1024 * 1024 * 1024 * 1, // 1GB
    features: [], // Lista vazia = bloqueia features extras
  },
  pro: {
    projects: -1,
    storage: 1024 * 1024 * 1024 * 10, // 10GB
    features: ["share_client", "upload_file"], // Adicionei upload_file aqui para diferenciar
  },
  agency: {
    projects: -1,
    storage: 1024 * 1024 * 1024 * 1000, // 1TB
    features: ["share_client", "upload_file", "white_label", "team"],
  },
};

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>("starter");
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ projects: 0, storage: 0 });

  const fetchPlanAndUsage = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return;

    // 1. BUSCA O PLANO
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    // Se não tiver assinatura ativa, assume starter
    const currentPlan = (sub?.plan_id as PlanType) || "starter";
    setPlan(currentPlan);

    // 2. CONTA O USO (Projetos)
    const { count: projectCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .neq("status", "archived");

    setUsage((prev) => ({ ...prev, projects: projectCount || 0 }));
    setLoading(false);
  };

  useEffect(() => {
    fetchPlanAndUsage();
  }, []);

  const can = (feature: string) => {
    // Proteção contra plano inválido
    const currentPlan = PLANS[plan] || PLANS["starter"];

    // 1. Regra para criar projetos
    if (feature === "create_project") {
      const limit = currentPlan.projects; 
      
      if (limit === -1) return true;
      return usage.projects < limit;
    }

    if (plan === "starter") {
      if (feature === "upload_file") return true;
      return false;
    }

    // Para Pro e Agency, verifica se a feature está na lista
    return PLANS[plan].features.includes(feature);
  };

  return {
    plan,
    usage,
    loading,
    can,
    isPro: plan === "pro" || plan === "agency",
    refreshPlan: fetchPlanAndUsage 
  };
}