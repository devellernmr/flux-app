import { useState, useEffect } from "react";
import { startAnalyticsTour } from "@/components/dashboard/TourGuide";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const [kpis, uploads, performance] = await Promise.all([
            fetchStats(user.id),
            fetchUploads(user.id),
            fetchPerformance(user.id),
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
  }, []);

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
      label: "Projetos Ativos",
      value: stats?.activeProjects.toString() || "0",
      change: "0",
      trend: "neutral",
      icon: FileCheck2,
      color: "text-blue-500",
    },
    {
      label: "Taxa de Aprovação",
      value: stats ? `${stats.approvalRate}%` : "0%",
      change: "0%",
      trend: "up",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Arquivos Enviados",
      value: stats?.totalFiles.toString() || "0",
      change: "+0",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "Arquivos Pendentes",
      value: stats?.pendingCount.toString() || "0",
      change: "0",
      trend: "down",
      icon: Clock,
      color: "text-amber-500",
    },
  ];

  const statusData = [
    { name: "Aprovados", value: stats?.approvedCount || 0, color: "#10b981" },
    { name: "Pendentes", value: stats?.pendingCount || 0, color: "#f59e0b" },
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
                  <span className="font-bold text-white">FLUXO.</span>
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
                    label: "Meus Projetos",
                    icon: Folder,
                    path: "/dashboard",
                  },
                  {
                    id: "analytics",
                    label: "Analytics",
                    icon: BarChart3,
                    path: "/analytics",
                  },
                  {
                    id: "settings",
                    label: "Configurações",
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${
                      activeMenu === item.id
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
                  Sair
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
        onShowTutorial={startAnalyticsTour}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* MOBILE HEADER */}
        <header className="md:hidden h-16 border-b border-zinc-900 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4 text-blue-500" /> FLUXO.
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  Relatórios & Analytics
                </h1>
                <p className="text-zinc-400 mt-2">
                  Acompanhe a performance da sua agência e projetos.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  id="project-analytics-filters"
                  className="bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 flex items-center"
                >
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                        dateRange === range
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {range === "7d"
                        ? "7 dias"
                        : range === "30d"
                        ? "30 dias"
                        : "3 Meses"}
                    </button>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      id="project-analytics-export"
                      variant="outline"
                      disabled={isExporting}
                      className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-zinc-900 border-zinc-800 text-zinc-300"
                  >
                    <DropdownMenuItem
                      onClick={handleExport}
                      className="cursor-pointer"
                    >
                      Relatório Completo (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportCSV}
                      className="cursor-pointer"
                    >
                      Dados Brutos (CSV)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* KPI Cards */}
            <div
              id="project-analytics-stats"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${kpi.color}`}
                    >
                      <kpi.icon className="h-5 w-5" />
                    </span>
                    <div
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 ${
                        kpi.trend === "up"
                          ? "text-emerald-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {kpi.change}
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-white">{kpi.value}</p>
                  </div>
                </div>
              ))}
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
          </div>
        </div>
      </main>
    </div>
  );
}
