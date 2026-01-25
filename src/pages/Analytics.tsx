import { useState, useEffect } from "react";
// import { startAnalyticsTour } from "@/components/dashboard/TourGuide";
import { Sidebar } from "@/components/layout/Sidebar";
import { supabase } from "@/lib/supabase";
import { usePlan } from "@/hooks/usePlan";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Download,
  Loader2,
  Menu,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileCheck2,
  X,
  Folder,
  Settings,
  LogOut,
  DollarSign,
  Briefcase,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationSystem } from "@/components/NotificationSystem";
import type { User } from "@/types";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { useTranslation } from "react-i18next";

import {
  getAnalyticsStats as fetchStats,
  getUploadsHistory as fetchUploads,
  getProjectPerformance as fetchPerformance,
  type AnalyticsStats,
} from "@/lib/analytics";
import { generateAnalyticsPDF, generateAnalyticsCSV } from "@/lib/export";

export function Analytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { plan, usage } = usePlan();
  const [activeMenu, setActiveMenu] = useState("analytics");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // State for Export
  const [isExporting, setIsExporting] = useState(false);

  // States for Analytics
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [uploadsData, setUploadsData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Filtro de data
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Ensure loading state is shown during refetch
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const [kpis, uploads, performance] = await Promise.all([
            fetchStats(user.id, dateRange),
            fetchUploads(user.id, dateRange),
            fetchPerformance(user.id, dateRange),
          ]);
          setStats(kpis);
          setUploadsData(uploads);
          setPerformanceData(performance);
        } catch (error) {
          console.error(error);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [dateRange]); // Added dateRange dependency

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleExport = async () => {
    if (!stats) return;
    setIsExporting(true);
    try {
      await generateAnalyticsPDF(
        {
          stats,
          chartsIds: ["analytics-charts-container"],
        },
        (user?.user_metadata?.agency_name as string) || "Agência"
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;
    generateAnalyticsCSV(
      { stats },
      (user?.user_metadata?.agency_name as string) || "Agência"
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const kpis = [
    {
      label: t("analytics.cards.active_projects"),
      value: stats?.activeProjects.toString() || "0",
      change: "0",
      trend: "neutral",
      icon: FileCheck2,
      color: "text-blue-500",
    },
    {
      label: t("analytics.cards.approval_rate"),
      value: stats ? `${stats.approvalRate}%` : "0%",
      change: "0%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: t("analytics.cards.files_sent"),
      value: stats?.totalFiles.toString() || "0",
      change: "+0",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: t("analytics.cards.files_pending"),
      value: stats?.pendingCount.toString() || "0",
      change: "0",
      trend: "down",
      icon: Clock,
      color: "text-amber-500",
    },
    {
      label: t("analytics.cards.total_pipeline"),
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalBudget || 0),
      change: "+0%",
      trend: "neutral",
      icon: Briefcase,
      color: "text-blue-400",
    },
    {
      label: t("analytics.cards.est_profit"),
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.estimatedProfit || 0),
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      label: t("analytics.cards.avg_margin"),
      value: `${Math.round(stats?.avgMargin || 0)}%`,
      change: "+0%",
      trend: "up",
      icon: Layers,
      color: "text-purple-400",
    },
  ];

  const statusData = [
    { name: t("analytics.table.approved"), value: stats?.approvedCount || 0, color: "#10b981" },
    { name: t("analytics.table.pending"), value: stats?.pendingCount || 0, color: "#f59e0b" },
    { name: "Com Ajustes", value: stats?.rejectedCount || 0, color: "#f43f5e" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans overflow-hidden selection:bg-blue-500/30 relative">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-zinc-800/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      {/* SIDEBAR DESKTOP */}
      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 z-40 md:hidden backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#050505] border-r border-zinc-900 z-50 flex flex-col md:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="font-bold text-white">FLUXS.</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </Button>
              </div>

              <nav className="flex-1 px-4 mt-6">
                {[
                  {
                    id: "projects",
                    label: t("sidebar.dashboard"),
                    icon: Folder,
                    path: "/dashboard",
                  },
                  {
                    id: "analytics",
                    label: t("sidebar.analytics"),
                    icon: BarChart3,
                    path: "/analytics",
                  },
                  {
                    id: "settings",
                    label: t("common.settings"),
                    icon: Settings,
                    path: "/dashboard",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.path === "/analytics") {
                        setActiveMenu("analytics");
                      } else {
                        navigate(item.path, { state: { activeMenu: item.id } });
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${activeMenu === item.id
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "text-zinc-500 hover:text-white"
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-zinc-900 mt-auto">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-zinc-500 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("common.logout")}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Sidebar
        user={user}
        plan={plan}
        usage={usage}
        activeMenu={activeMenu}
        setActiveMenu={(menu) => {
          if (menu === "projects") {
            navigate("/dashboard", { state: { activeMenu: "projects" } });
          } else if (menu === "settings") {
            navigate("/dashboard", { state: { activeMenu: "settings" } });
          } else {
            setActiveMenu(menu);
          }
        }}
        onLogout={handleLogout}
      // onShowTutorial={startAnalyticsTour}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* MOBILE HEADER */}
        <header className="md:hidden h-16 border-b border-zinc-900 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4 text-blue-500" /> FLUXS.
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-zinc-400" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-8 border-b border-zinc-900/50">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest"
                >
                  <BarChart3 className="h-3 w-3" /> {t("analytics.intelligence_hub")}
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2">
                    {t("analytics.title").split(" ")[0]} <span className="text-zinc-500">{t("analytics.title").substring(t("analytics.title").indexOf(" ") + 1) || "& Insights"}</span>
                  </h1>
                  <p className="text-zinc-500 max-w-xl font-medium">
                    {t("analytics.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                <div
                  id="project-analytics-filters"
                  className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto"
                >
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`relative px-4 py-2 rounded-lg text-xs font-black transition-all flex-1 sm:flex-none text-center transform active:scale-95 ${dateRange === range
                        ? "text-white bg-zinc-800 shadow-lg shadow-black/20"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        }`}
                    >
                      {range === "7d"
                        ? t("analytics.tabs.7d")
                        : range === "30d"
                          ? t("analytics.tabs.30d")
                          : t("analytics.tabs.90d")}
                    </button>
                  ))}
                </div>

                <div className="h-8 w-[1px] bg-zinc-800 hidden sm:block" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="project-analytics-export"
                      variant="ghost"
                      disabled={isExporting}
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl h-10 px-4 w-full sm:w-auto justify-between sm:justify-center"
                    >
                      <span className="text-xs font-bold mr-2">{t("analytics.export_btn")}</span>
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#0A0A0A] border-zinc-800 text-zinc-300 min-w-[200px]"
                  >
                    <DropdownMenuItem
                      onClick={handleExport}
                      className="cursor-pointer focus:bg-zinc-900 focus:text-white p-3 font-medium"
                    >
                      <FileCheck2 className="h-4 w-4 mr-2 text-blue-500" />
                      {t("analytics.export_pdf")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportCSV}
                      className="cursor-pointer focus:bg-zinc-900 focus:text-white p-3 font-medium"
                    >
                      <Layers className="h-4 w-4 mr-2 text-emerald-500" />
                      {t("analytics.export_csv")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* KPI Cards */}
            {/* KPI Groups */}
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Group 1: Produção & Qualidade */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">{t("analytics.sections.production")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {kpis.filter(k => [t("analytics.cards.active_projects"), t("analytics.cards.approval_rate"), t("analytics.cards.files_sent")].includes(k.label)).map((kpi, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={kpi.label}
                    >
                      <KpiCard kpi={kpi} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Group 2: Financeiro & Pipeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">{t("analytics.sections.finance")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {kpis.filter(k => [t("analytics.cards.total_pipeline"), t("analytics.cards.est_profit"), t("analytics.cards.avg_margin")].includes(k.label)).map((kpi, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      key={kpi.label}
                    >
                      <KpiCard kpi={kpi} />
                    </motion.div>
                  ))}
                  {/* Destaque para Pendências na linha financeira/pipeline */}
                  {kpis.filter(k => [t("analytics.cards.files_pending")].includes(k.label)).map(kpi => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      key={kpi.label}
                    >
                      <KpiCard kpi={kpi} isWarning />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div id="analytics-charts-container">
              <AnalyticsCharts
                dateRange={dateRange}
                uploadData={uploadsData}
                statusData={statusData}
                projectPerformance={performanceData}
              />
            </div>

            {/* DETAILED REPORT SECTION (Restored per user request) */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <div className="flex items-center gap-3 px-2 border-l-2 border-blue-500 pl-4">
                <h3 className="text-xl font-bold text-white tracking-tight">{t("analytics.sections.performance")}</h3>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{t("analytics.sections.top_active")}</span>
              </div>

              <div className="bg-[#0A0A0A] border border-zinc-800/50 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 p-4 bg-zinc-900/30 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                  <div className="col-span-2">{t("analytics.table.project_name")}</div>
                  <div className="text-center">{t("analytics.table.approved")}</div>
                  <div className="text-right">{t("analytics.table.pending")}</div>
                </div>
                {performanceData.length > 0 ? (
                  performanceData.map((project, i) => (
                    <div key={i} className="grid grid-cols-4 p-4 border-b border-zinc-800/20 last:border-0 hover:bg-zinc-900/20 transition-colors items-center">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          i === 1 ? "bg-zinc-800 text-zinc-400" :
                            "bg-zinc-900 text-zinc-600"
                          }`}>
                          #{i + 1}
                        </div>
                        <span className="font-bold text-zinc-200">{project.name}</span>
                      </div>
                      <div className="text-center">
                        <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                          {project.completed}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${project.pending > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-zinc-900 text-zinc-600 border-zinc-800"}`}>
                          {project.pending}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    {t("analytics.table.no_data")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ kpi, isWarning }: { kpi: any, isWarning?: boolean }) {
  // Configuração de cores baseada no ícone para o fundo do ícone
  const getIconBg = () => {
    if (isWarning) return "bg-amber-500/10 border-amber-500/20";
    if (kpi.color.includes("blue")) return "bg-blue-500/10 border-blue-500/20";
    if (kpi.color.includes("emerald")) return "bg-emerald-500/10 border-emerald-500/20";
    if (kpi.color.includes("purple")) return "bg-purple-500/10 border-purple-500/20";
    return "bg-zinc-800 border-zinc-700";
  }

  return (
    <div className={`relative h-full overflow-hidden rounded-[24px] border p-6 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl ${isWarning
      ? 'bg-amber-950/10 border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-900/20'
      : 'bg-[#0A0A0A] border-zinc-800/60 hover:border-zinc-700 hover:shadow-zinc-950/50'
      }`}>
      {/* Background Glow Effect */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${isWarning ? 'bg-amber-500/10' : kpi.color.replace('text-', 'bg-').replace('500', '500/10')
        }`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-colors duration-300 ${getIconBg()}`}>
            <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${kpi.trend === "up"
            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
            : kpi.trend === "down"
              ? "bg-red-500/5 border-red-500/10 text-red-500"
              : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
            }`}>
            {kpi.change}
            {kpi.trend === "up" && <TrendingUp className="h-3 w-3" />}
            {kpi.trend === "down" && <TrendingDown className="h-3 w-3" />}
          </div>
        </div>

        <div>
          <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{kpi.label}</h4>
          <p className="text-3xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
            {kpi.value}
          </p>
        </div>
      </div>
    </div>
  )
}
