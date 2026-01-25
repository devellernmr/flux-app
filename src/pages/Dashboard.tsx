import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Loader2,
  Menu,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NotificationSystem } from "@/components/NotificationSystem";

// --- HOOKS E COMPONENTES ---
import { UpgradeModal } from "@/components/UpgradeModal";
import { AIBriefingGenerator } from "@/components/AIBriefingGenerator";
import { DashboardStats } from "@/components/dashboard/Stats";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { DashboardStatsSkeleton, ProjectCardSkeleton } from "@/components/dashboard/Skeleton";
import { SubscriptionPlans } from "@/components/dashboard/SubscriptionPlans";
import { useDashboard } from "@/hooks/useDashboard";

// NEW TUTORIAL SYSTEM
import { TutorialProvider, useTutorial } from "@/components/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { useTranslation } from "react-i18next";

function DashboardContent() {
  const {
    user,
    projects,
    plan,
    usage,
    can,
    planLoading,
    isInitialLoading,
    showUpgrade,
    setShowUpgrade,
    upgradeFeature,
    setUpgradeFeature,
    isNewProjectOpen,
    setIsNewProjectOpen,
    newProjectName,
    setNewProjectName,
    isCreating,
    projectToDelete,
    setProjectToDelete,
    isDeleting,
    isAIModalOpen,
    setIsAIModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    activeMenu,
    setActiveMenu,
    isRedirectingPortal,
    settingsName,
    setSettingsName,
    settingsAvatar,
    setSettingsAvatar,
    settingsAgencyName,
    setSettingsAgencyName,
    isSavingSettings,
    handleLogout,
    handleCreateProject,
    handleDeleteProject,
    handleUpdateProfile,
    handleSubscribe,
    handleManageSubscription,
    handleInstantCreateFromAI,
  } = useDashboard();

  const { t } = useTranslation();
  const { startTutorial } = useTutorial();

  if (planLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // --- RENDERIZADORES DO CONTEÚDO PRINCIPAL ---
  const renderDashboardContent = () => {
    if (isInitialLoading) {
      return (
        <div className="space-y-8 animate-in fade-in duration-700">
          <DashboardStatsSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <ProjectCardSkeleton key={i} />)}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div id="dashboard-stats-wrapper">
          <DashboardStats user={user} projects={projects} plan={plan} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {t("dashboard.active_fluxs")}
              <span className="text-xs bg-white/10 text-zinc-300 px-2 py-1 rounded-full border border-white/10 font-bold">
                {projects.length}
              </span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1 font-medium">
              {t("dashboard.manage_desc")}
            </p>
          </div>
          <Button
            id="dashboard-new-project-btn"
            onClick={() => setIsNewProjectOpen(true)}
            className="bg-white hover:bg-zinc-200 text-black font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            {t("dashboard.new_project")}
          </Button>
        </div>

        <ProjectList
          projects={projects}
          onDelete={(project) => setProjectToDelete(project)}
        />
      </div>
    );
  };

  const renderDashboard = () => renderDashboardContent();

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return renderDashboard();
      case "subscription":
        return (
          <SubscriptionPlans
            currentPlan={plan}
            isRedirectingPortal={isRedirectingPortal}
            onSubscribe={handleSubscribe}
            onManageSubscription={handleManageSubscription}
          />
        );
      case "settings":
        return (
          <SettingsLayout
            user={user}
            settingsName={settingsName}
            setSettingsName={setSettingsName}
            settingsAgencyName={settingsAgencyName}
            setSettingsAgencyName={setSettingsAgencyName}
            settingsAvatar={settingsAvatar}
            setSettingsAvatar={setSettingsAvatar}
            isSavingSettings={isSavingSettings}
            handleUpdateProfile={handleUpdateProfile}
            plan={plan}
            usage={usage}
          />
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-white overflow-hidden relative selection:bg-blue-500/30">
      {/* GLOBAL OVERLAYS */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      {/* Tutorial Overlay */}
      <TutorialOverlay />

      {/* --- SIDEBAR --- */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        plan={plan}
        usage={usage}
        onLogout={handleLogout}
        user={user}
        onShowTutorial={startTutorial}
        canAccessAnalytics={can("analytics")}
      />

      {/* --- SIDEBAR MOBILE --- */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 bg-black border-r border-zinc-900 w-80">
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={(menu) => {
              setActiveMenu(menu);
              setIsMobileMenuOpen(false);
            }}
            plan={plan}
            usage={usage}
            onLogout={handleLogout}
            user={user}
            onShowTutorial={() => {
              startTutorial();
              setIsMobileMenuOpen(false);
            }}
            canAccessAnalytics={can("analytics")}
          />
        </SheetContent>
      </Sheet>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto h-screen relative z-10 no-scrollbar">
        {/* Header Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800/50 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="font-black text-white text-xs tracking-tighter">FLX</span>
            </div>
            <span className="font-bold text-white tracking-tight">Fluxs.</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <div className="p-4 md:p-8 lg:p-12 mb-20 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* --- MODAIS --- */}

      {/* MODAL: NOVO PROJETO */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="bg-zinc-950/90 border-zinc-800 backdrop-blur-xl sm:max-w-[500px] gap-6 p-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent pointer-events-none" />

          <DialogHeader className="p-8 pb-0">
            <div className="h-12 w-12 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-white tracking-tight">{t("dashboard.create_modal_title")}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {t("dashboard.create_modal_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 pt-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t("dashboard.project_name_label")}</Label>
              <Input
                placeholder={t("dashboard.project_name_placeholder")}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-black/50 border-zinc-800/50 text-white h-12 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium placeholder:text-zinc-700"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900 hover:border-blue-500/30 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] group transition-all"
                onClick={() => {
                  if (can("ai")) {
                    setIsAIModalOpen(true);
                    setIsNewProjectOpen(false);
                  } else {
                    setUpgradeFeature("Assistente IA");
                    setShowUpgrade(true);
                  }
                }}
              >
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-white mb-0.5">{t("dashboard.use_ai_btn")}</span>
                  <span className="block text-xs text-zinc-500">{t("dashboard.use_ai_desc")}</span>
                </div>
              </Button>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 bg-zinc-950/50 border-t border-white/5">
            <div className="flex gap-3 w-full">
              <Button
                variant="ghost"
                onClick={() => setIsNewProjectOpen(false)}
                className="flex-1 rounded-xl font-bold text-zinc-500 hover:text-white hover:bg-white/5"
              >
                {t("dashboard.cancel_btn")}
              </Button>
              <Button
                onClick={() => {
                  if (can("create_project")) {
                    handleCreateProject();
                  } else {
                    setUpgradeFeature("Limite de Projetos");
                    setShowUpgrade(true);
                    setIsNewProjectOpen(false);
                  }
                }}
                disabled={isCreating || !newProjectName.trim()}
                className="flex-1 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold shadow-lg shadow-white/5"
              >
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {t("dashboard.create_btn")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Briefing Modal */}
      <AIBriefingGenerator
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onUse={handleInstantCreateFromAI}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName={upgradeFeature}
      />

      {/* Delete Project Dialog */}
      <Dialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white">
          <DialogHeader>
            <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center">{t("dashboard.delete_confirm_title")}</DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              {t("dashboard.delete_confirm_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setProjectToDelete(null)}
              className="w-full border border-zinc-800 hover:bg-zinc-900 text-zinc-300"
            >
              {t("dashboard.cancel_btn")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-900"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("dashboard.delete_btn")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotificationSystem />
    </div>
  );
}

// Wrapper for Provider
export function Dashboard() {
  return (
    <TutorialProvider>
      <DashboardContent />
    </TutorialProvider>
  )
}
