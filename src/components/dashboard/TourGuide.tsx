import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { supabase } from "@/lib/supabase";

export const startTour = async () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(0, 0, 0, 0.9)",
    stageRadius: 16,
    stagePadding: 10,
    popoverClass: "fluxo-tour-popover",
    doneBtnText: "Pronto!",
    prevBtnText: "Voltar",
    nextBtnText: "Próximo",
    steps: [
      {
        element: "#dashboard-stats-wrapper",
        popover: {
          title: "🚀 Seu Painel de Controle",
          description:
            "Aqui você vê um resumo rápido de tudo: projetos ativos, espaço usado e o status do seu plano.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#dashboard-new-project-btn",
        popover: {
          title: "✨ Criar algo Incrível",
          description:
            "O ponto de partida para qualquer trabalho. Dê um nome ao seu projeto e comece a colaborar!",
          side: "left",
          align: "center",
        },
      },
      {
        element: "#sidebar-nav-analytics",
        popover: {
          title: "📈 Dados e Relatórios",
          description:
            "Acompanhe o crescimento da sua agência com gráficos detalhados e métricas de aprovação.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#sidebar-nav-settings",
        popover: {
          title: "⚙️ Identidade & White-Label",
          description:
            "Personalize o Fluxo com sua marca. Defina logos e cores que seus clientes verão em todas as páginas.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#sidebar-help-btn",
        popover: {
          title: "💡 Sempre aqui para você",
          description:
            "Ficou com dúvida? Quer rever esse tour? É só clicar aqui a qualquer momento.",
          side: "right",
          align: "center",
        },
      },
    ],
    onDestroyed: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.has_seen_tour) {
        await supabase.auth.updateUser({
          data: { has_seen_tour: true },
        });
      }
    },
  });

  driverObj.drive();
};

export const startAnalyticsTour = async () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(0, 0, 0, 0.9)",
    stageRadius: 16,
    stagePadding: 10,
    popoverClass: "fluxo-tour-popover",
    doneBtnText: "Entendido!",
    prevBtnText: "Voltar",
    nextBtnText: "Próximo",
    steps: [
      {
        element: "#project-analytics-stats",
        popover: {
          title: "📊 KPIs Principais",
          description:
            "Visualize sua taxa de aprovação, total de arquivos e produtividade em tempo real.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-analytics-filters",
        popover: {
          title: "📅 Filtros de Tempo",
          description:
            "Analise sua performance nos últimos 7, 30 ou 90 dias com um clique.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#analytics-charts-container",
        popover: {
          title: "📈 Tendências",
          description:
            "Gráficos interativos mostram o fluxo de trabalho e o desempenho dos seus projetos.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#project-analytics-export",
        popover: {
          title: "📄 Exportar Inteligente",
          description:
            "Gere relatórios profissionais em PDF para seus clientes ou exporte dados brutos em CSV.",
          side: "left",
          align: "center",
        },
      },
    ],
  });
  driverObj.drive();
};

export const startProjectTour = async (
  onTabChange?: (tabId: string) => void
) => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(0, 0, 0, 0.9)",
    stageRadius: 16,
    stagePadding: 10,
    popoverClass: "fluxo-tour-popover",
    doneBtnText: "Excelente!",
    prevBtnText: "Voltar",
    nextBtnText: "Próximo",
    steps: [
      {
        element: "#project-dash-card-deadline",
        onHighlightStarted: () => onTabChange?.("dashboard"),
        popover: {
          title: "📅 Prazos sobre Controle",
          description:
            "Aqui você vê a data prevista de entrega. O Fluxo te ajuda a não perder nenhum deadline.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-dash-card-briefing",
        onHighlightStarted: () => onTabChange?.("dashboard"),
        popover: {
          title: "📑 Status do Briefing",
          description:
            "Acompanhe se o briefing está em rascunho, enviado ou já aprovado pelo cliente.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-dash-card-approvals",
        onHighlightStarted: () => onTabChange?.("dashboard"),
        popover: {
          title: "✅ Pendências Rápidas",
          description:
            "Um atalho para ver quantos arquivos ainda esperam o feedback do seu cliente.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-dash-roadmap",
        onHighlightStarted: () => onTabChange?.("dashboard"),
        popover: {
          title: "🛤️ Roadmap do Sucesso",
          description:
            "Acompanhe visualmente em que etapa o projeto está, desde o rascunho até a entrega final.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#project-tab-briefing",
        popover: {
          title: "📝 Briefing Estratégico",
          description:
            "Defina o DNA do projeto. Use nossa **IA** para gerar perguntas inteligentes que extraiam o melhor do cliente.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#project-briefing-templates",
        onHighlightStarted: () => onTabChange?.("briefing"),
        popover: {
          title: "📋 Templates Prontos",
          description:
            "Economize tempo com estruturas validadas para Branding, Sites ou Social Media.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#project-briefing-ai-btn",
        onHighlightStarted: () => onTabChange?.("briefing"),
        popover: {
          title: "🤖 Inteligência Artificial",
          description:
            "Não sabe o que perguntar? Deixe nossa IA criar o briefing perfeito para você em segundos.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-tab-identidade",
        popover: {
          title: "🎨 Brand Kit",
          description:
            "Centralize cores e fontes. Use nossas ferramentas de extração para sugerir paletas automaticamente.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#project-brandkit-suggest-btn",
        onHighlightStarted: () => onTabChange?.("identidade"),
        popover: {
          title: "✨ Extrator de Cores",
          description:
            "Suba uma imagem ou logo para extrairmos a paleta de cores automaticamente.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-brandkit-figma-btn",
        onHighlightStarted: () => onTabChange?.("identidade"),
        popover: {
          title: "❖ Integração Figma",
          description:
            "Cole o link do seu arquivo design e nós buscamos todas as cores e estilos para você.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#project-tab-files",
        popover: {
          title: "📂 Gestão de Assets",
          description:
            "Organize todas as entregas. O Fluxo cuida das versões e garante que nada se perca.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#project-upload-btn",
        onHighlightStarted: () => onTabChange?.("files"),
        popover: {
          title: "☁️ Upload Rápido",
          description:
            "Simples, rápido e seguro. Arraste arquivos aqui para enviar versões e pedir aprovações.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#project-tab-approvals",
        popover: {
          title: "✅ Controle de Qualidade",
          description:
            "Acompanhe o que já foi validado pelo cliente e o que ainda precisa de atenção.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#project-tab-members",
        popover: {
          title: "🤝 Time & Clientes",
          description:
            "Gerencie acessos e convide as pessoas certas para colaborar no momento certo.",
          side: "right",
          align: "center",
        },
      },
      {
        element: "#project-dash-card-help",
        onHighlightStarted: () => onTabChange?.("dashboard"),
        popover: {
          title: "🚀 Pronto para Começar?",
          description:
            "Agora você conhece o básico. Se precisar rever este tour, clique aqui ou no botão de interrogação na lateral!",
          side: "top",
          align: "center",
        },
      },
    ],
    onDestroyed: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.has_seen_project_tour) {
        await supabase.auth.updateUser({
          data: { has_seen_project_tour: true },
        });
      }
    },
  });

  driverObj.drive();
};
