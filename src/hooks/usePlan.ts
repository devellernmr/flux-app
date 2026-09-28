import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


import type { PlanType } from "@/types";

interface PlanLimits {
  projects: number; // -1 = ilimitado
  storage: number; // em bytes
  features: string[];
}

const PLANS: Record<PlanType, PlanLimits> = {
  starter: {
    projects: 1,
    storage: 1024 * 1024 * 1024 * 1, // 1GB
    features: [], // Lista vazia = bloqueia features extras
  },
  pro: {
    projects: -1,
    storage: 1024 * 1024 * 1024 * 10, // 10GB
    features: ["share_client", "upload_file", "ai"],
  },
  agency: {
    projects: -1,
    storage: 1024 * 1024 * 1024 * 1000, // 1TB
    features: ["share_client", "upload_file", "white_label", "team", "analytics", "finance", "ai"],
  },
};

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>("starter");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState({ projects: 0, storage: 0 });

  const fetchPlanAndUsage = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return;
      }

      // 1. BUSCA O PLANO
      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (subError) {
        console.warn("Não foi possível carregar a assinatura:", subError.message);
      }

      // Se não tiver assinatura ativa, assume starter
      const currentPlan = (sub?.plan_id as PlanType) || "starter";
      setPlan(PLANS[currentPlan] ? currentPlan : "starter");

      // 2. CONTA O USO (Projetos)
      const { count: projectCount, error: countError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("status", "archived");

      if (countError) {
        console.warn("Não foi possível contar os projetos:", countError.message);
      }

      setUsage((prev) => ({ ...prev, projects: projectCount || 0 }));
    } catch (err) {
      // Nunca deixamos o app preso no estado de carregamento:
      // em caso de falha permanecemos no plano padrão (starter).
      const message = err instanceof Error ? err.message : String(err);
      console.error("Erro ao carregar plano e uso:", message);
      setError(message);
    } finally {
      // Garantido: sempre resolve o flag de loading, mesmo com erro de rede.
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanAndUsage();
  }, [fetchPlanAndUsage]);

  /**
   * Verifica se o plano atual libera uma feature.
   * Importante: durante o carregamento (`loading === true`) o valor reflete
   * apenas o estado local (starter por padrão). Use `planReady` nas telas de
   * trava/upsell para não exibir bloqueios indevidos antes da resposta.
   */
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
    return currentPlan.features.includes(feature);
  };

  return {
    plan,
    usage,
    loading,
    /** `true` quando plano e uso já foram resolvidos (sucesso ou erro). */
    planReady: !loading,
    error,
    can,
    isPro: plan === "pro" || plan === "agency",
    refreshPlan: fetchPlanAndUsage
  };
}