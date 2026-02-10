import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Zap } from "lucide-react";

import { useProject } from "@/hooks/useProject";
import { usePlan } from "@/hooks/usePlan";
import { ProjectSidebar } from "@/components/project/ProjectSidebar";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectDashboardTab } from "@/components/project/ProjectDashboardTab";

import { BrandKitTab } from "@/components/project/BrandKitTab";
import { ApprovalsHub } from "@/components/project/ApprovalsHub";
import { ProjectFiles } from "./ProjectFiles";
import { BriefingTab } from "@/components/project/BriefingTab";
import { FinanceTab } from "@/components/project/FinanceTab";
import { HelpTab } from "@/components/project/HelpTab";
import { TeamManager } from "@/components/TeamManager";
import { ProjectActivity } from "@/components/ProjectActivity";
import { SettingsModal } from "@/components/project/SettingsModal";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  TutorialProvider,
  useTutorial,
} from "@/components/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";

export function ProjectOverviewContent() {
  const { id } = useParams();
  const { setNavigationHandler } = useTutorial();
  const { can, plan } = usePlan();
  const {
    user,
    project,
    loading,
    blocks,
    setBlocks,
    isEditing,
    setIsEditing,
    isSavingBriefing,
    briefingStatus,
    projectName,
    setProjectName,
    projectDescription,
    setProjectDescription,
    projectStatus,
    setProjectStatus,
    projectDueDate,
    setProjectDueDate,
    savingSettings,
    customLogoUrl,
    setCustomLogoUrl,
    agencyName,
    setAgencyName,
    pendingApprovalsCount,
    saveBriefing,
    saveProjectSettings,
    archiveProject,
    resetBriefing,
    handleLogout,
    copyLink,
    useTemplate,
    updateBlock,
    removeBlock,
    addBlock,
    handleApproveBriefing,
    isArchiving,
    budget,
    expenses,
    estimatedHours,
    targetHourlyRate,
  } = useProject(id);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState(
    "Financeiro Avançado",
  );
  const [isActivityOpen, setIsActivityOpen] = useState(
    window.innerWidth >= 1600,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileActivityOpen, setIsMobileActivityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const toggleActivity = () => {
    if (window.innerWidth >= 1280) setIsActivityOpen(!isActivityOpen);
    else setIsMobileActivityOpen(true);
  };

  useEffect(() => {
    setNavigationHandler(setActiveTab);
  }, [setActiveTab]);

  if (loading)
    return (
      <div className="h-screen bg-[#030303] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative z-10" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans overflow-hidden selection:bg-blue-500/30 relative">
      <TutorialOverlay />
      {/* Platinum Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute -bottom-[10%] -right-[5%] w-[60%] h-[60%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute inset-0 bg-[size:40px_40px] bg-grid-white/[0.01]" />
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/95 z-40 md:hidden backdrop-blur-xl"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#030303] border-r border-zinc-900/50 z-50 flex flex-col md:hidden"
            >
              <ProjectSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                customLogoUrl={customLogoUrl}
                pendingApprovalsCount={pendingApprovalsCount}
                handleLogout={handleLogout}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                isOwner={project?.user_id === user?.id}
                mobileMode={true}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileActivityOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileActivityOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 xl:hidden backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#080808] border-l border-white/5 z-50 flex flex-col xl:hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <Zap className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-widest">
                    Atividade do Fluxs.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl h-10 w-10 text-zinc-500 hover:text-white"
                  onClick={() => setIsMobileActivityOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                {id ? <ProjectActivity projectId={id} /> : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProjectSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        customLogoUrl={customLogoUrl}
        pendingApprovalsCount={pendingApprovalsCount}
        handleLogout={handleLogout}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isOwner={project?.user_id === user?.id}
        desktopMode={true}
        className="shrink-0"
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <ProjectHeader
          projectName={projectName}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          toggleActivity={toggleActivity}
          isActivityOpen={isActivityOpen}
          copyLink={copyLink}
          setIsSettingsOpen={setIsSettingsOpen}
          project={project}
        />

        {/* --- PLATINUM MOBILE TAB NAVIGATION --- */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar px-6 py-4 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl sticky top-20 z-20">
          {[
            { id: "dashboard", label: "Fluxs." },
            { id: "briefing", label: "Docs" },
            { id: "identidade", label: "Brand" },
            { id: "approvals", label: "Tasks" },
            { id: "files", label: "Cloud" },
            { id: "finance", label: "Fin" },
            { id: "members", label: "Team" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
                activeTab === tab.id
                  ? "bg-white text-black border-white shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)]"
                  : "bg-zinc-900/50 border-zinc-800/80 text-zinc-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 no-scrollbar">
          <div className="max-w-[1700px] mx-auto flex gap-6 xl:gap-12 h-full pb-24 md:pb-0">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  {activeTab === "dashboard" && (
                    <ProjectDashboardTab
                      key="dash"
                      project={project}
                      briefingStatus={briefingStatus}
                      pendingApprovalsCount={pendingApprovalsCount}
                      setActiveTab={setActiveTab}
                      projectStatus={projectStatus}
                      milestones={project?.milestones}
                    />
                  )}
                  {activeTab === "briefing" && (
                    <BriefingTab
                      key="brief"
                      blocks={blocks}
                      setBlocks={setBlocks}
                      isEditing={isEditing}
                      isSaving={isSavingBriefing}
                      briefingStatus={briefingStatus}
                      onCopyLink={copyLink}
                      onApprove={handleApproveBriefing}
                      onLoadTemplate={useTemplate}
                      onOpenResetDialog={() => setShowResetDialog(true)}
                      onSave={saveBriefing}
                      onUpdateBlock={updateBlock}
                      onAddBlock={addBlock}
                      onRemoveBlock={removeBlock}
                      setIsEditing={setIsEditing}
                      can={can}
                      onShowUpgrade={(feat) => {
                        setUpgradeFeatureName(feat || "Assistente IA");
                        setShowUpgradeModal(true);
                      }}
                      containerVariants={{}}
                      itemVariants={{}}
                    />
                  )}
                  {activeTab === "identidade" && (
                    <BrandKitTab key="brand" projectId={id!} />
                  )}
                  {activeTab === "approvals" && (
                    <ApprovalsHub key="approvals" projectId={id!} />
                  )}
                  {activeTab === "files" && (
                    <ProjectFiles key="files" projectId={id!} />
                  )}
                  {activeTab === "members" && (
                    <TeamManager key="members" projectId={id!} />
                  )}
                  {activeTab === "finance" &&
                    (can("finance") ? (
                      <FinanceTab
                        key="finance"
                        projectId={id!}
                        initialBudget={budget}
                        initialExpenses={expenses}
                        initialEstimatedHours={estimatedHours}
                        initialTargetHourlyRate={targetHourlyRate}
                        currency={project?.currency}
                        projectName={projectName}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="text-center max-w-md">
                          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full">
                            <Zap className="w-8 h-8 text-purple-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Financeiro Avançado
                          </h3>
                          <p className="text-zinc-400 mb-6">
                            O módulo de Financeiro está disponível apenas no
                            plano{" "}
                            <span className="text-purple-400 font-bold">
                              Agency
                            </span>
                            .
                          </p>
                          <Button
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold"
                          >
                            <Zap className="w-4 h-4 mr-2 fill-current" />
                            Fazer Upgrade
                          </Button>
                        </div>
                      </div>
                    ))}
                  {activeTab === "help" && <HelpTab key="help" />}
                </motion.div>
              </AnimatePresence>
            </div>

            {isActivityOpen && id && (
              <aside className="w-[320px] 2xl:w-[420px] hidden xl:flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 shrink-0">
                <section className="flex-1 bg-zinc-950/40 border border-white/5 rounded-[40px] overflow-hidden flex flex-col backdrop-blur-md shadow-2xl">
                  <div className="p-8 border-b border-white/5 bg-zinc-900/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                        Fluxs. de Inteligência
                      </h2>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden p-6">
                    <ProjectActivity projectId={id} />
                  </div>
                </section>
              </aside>
            )}
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        projectName={projectName}
        setProjectName={setProjectName}
        projectDescription={projectDescription}
        setProjectDescription={setProjectDescription}
        projectStatus={projectStatus}
        setProjectStatus={setProjectStatus}
        projectDueDate={projectDueDate}
        setProjectDueDate={setProjectDueDate}
        isSaving={savingSettings}
        onSave={saveProjectSettings}
        onArchive={archiveProject}
        isArchiving={isArchiving}
        customLogoUrl={customLogoUrl}
        setCustomLogoUrl={setCustomLogoUrl}
        agencyName={agencyName}
        setAgencyName={setAgencyName}
      />

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-zinc-950 border-white/5 rounded-[32px] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white tracking-tighter">
              Resetar Workflow?
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium">
              Esta ação removerá todos os dados do briefing permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowResetDialog(false)}
              className="text-zinc-500 hover:text-white rounded-2xl h-12 px-6"
            >
              Manter Dados
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetBriefing();
                setShowResetDialog(false);
              }}
              className="bg-red-600 hover:bg-red-500 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-tight"
            >
              Resetar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        featureName={upgradeFeatureName}
        currentPlan={plan}
      />
    </div>
  );
}

export function ProjectOverview() {
  return (
    <TutorialProvider>
      <ProjectOverviewContent />
    </TutorialProvider>
  );
}
