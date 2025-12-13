import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  UploadCloud,
  Eye,
  CheckCircle2,
  FolderOpen,
  Layout,
  Share2,
  Plus,
  Upload,
  Sparkles,
  FileInput,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal"; // <--- NOVO IMPORT

// ... (Interfaces FileData e FileGroup mantidas iguais)
interface FileData {
  id: string;
  name: string;
  url: string;
  created_at: string;
  status: "approved" | "pending" | "rejected";
  project_id: string;
}

interface FileGroup {
  name: string;
  files: FileData[];
}

export function ProjectFiles({ projectId }: { projectId: string }) {
  const [setFiles] = useState<FileData[]>([]);
  const [briefingFiles, setBriefingFiles] = useState<FileData[]>([]);
  const [designGroups, setDesignGroups] = useState<FileGroup[]>([]);

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("design");
  const [uploadTargetGroup, setUploadTargetGroup] = useState<string | null>(
    null
  );

  // --- TRAVAS DE PLANO ---
  const { can } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  useEffect(() => {
    fetchFiles();
    const channel = supabase
      .channel("public-files")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "files",
          filter: `project_id=eq.${projectId}`,
        },
        () => fetchFiles()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchFiles = async () => {
    // ... (Código de fetchFiles mantido idêntico ao anterior)
    if (!projectId) return;

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) return;

    const allFiles = data || [];
    const clientAssets = allFiles.filter(
      (f) => f.name.startsWith("Asset_") || f.name.startsWith("Client_")
    );
    const designFiles = allFiles.filter(
      (f) => !f.name.startsWith("Asset_") && !f.name.startsWith("Client_")
    );

    setBriefingFiles(clientAssets);
    setFiles(designFiles);

    const groups: Record<string, FileData[]> = {};
    designFiles.forEach((file) => {
      let baseName = file.name.split(".")[0];
      baseName = baseName.replace(/[-_ ]v\d+$/i, "");
      baseName = baseName.replace(/_Briefing/i, "");
      const displayName = baseName.replace(/[-_]/g, " ").trim();

      if (!groups[displayName]) groups[displayName] = [];
      groups[displayName].push(file);
    });

    const groupsArray = Object.keys(groups).map((key) => ({
      name: key,
      files: groups[key].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));

    setDesignGroups(groupsArray);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "design" | "client",
    targetGroupName?: string
  ) => {
    // --- TRAVA DE UPLOAD (Opcional, se quiser limitar storage no futuro) ---
    // if (!can("upload_file")) {
    //   setUpgradeFeature("Armazenamento e Uploads");
    //   setShowUpgrade(true);
    //   event.target.value = "";
    //   return;
    // }
    // -----------------------------------------------------------------------

    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      let finalName = file.name;

      if (type === "client" && !file.name.startsWith("Asset_")) {
        finalName = `Asset_${file.name}`;
      } else if (type === "design") {
        if (targetGroupName) {
          const safeBaseName = targetGroupName.replace(/\s+/g, "_");
          const currentGroup = designGroups.find(
            (g) => g.name === targetGroupName
          );
          const designOnlyFiles =
            currentGroup?.files.filter((f) => !f.name.includes("Briefing")) ||
            [];
          const nextVersion = designOnlyFiles.length + 1;
          const versionString =
            nextVersion < 10 ? `0${nextVersion}` : nextVersion;

          finalName = `${safeBaseName}_v${versionString}.${fileExt}`;
        } else {
          if (!file.name.match(/[-_ ]v\d+/i)) {
            const nameWithoutExt = file.name.replace(`.${fileExt}`, "");
            finalName = `${nameWithoutExt}_v01.${fileExt}`;
          }
        }
      }

      const fileName = `${projectId}/${Date.now()}_${finalName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(fileName, file);

      if (uploadError) throw new Error("Erro no upload.");

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-files").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("files").insert({
        project_id: projectId,
        name: finalName,
        url: publicUrl,
        status: "pending",
      });

      if (dbError) throw dbError;

      toast.success(type === "design" ? "Nova versão!" : "Arquivo salvo!");
      fetchFiles();
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
      setUploadTargetGroup(null);
      event.target.value = "";
    }
  };

  const copyReviewLink = (fileId: string) => {
    // --- GATILHO DO ANÚNCIO (Share) ---
    if (!can("share_client")) {
      setUpgradeFeature("Compartilhamento com Cliente");
      setShowUpgrade(true);
      return;
    }
    // ----------------------------------

    const linkUrl = `${window.location.origin}/feedback/${fileId}`;
    navigator.clipboard.writeText(linkUrl);
    toast.success("Link copiado!");
  };

  const openReview = (url: string) => {
    window.open(url, "_blank");
  };

  const triggerGroupUpload = (groupName: string) => {
    setUploadTargetGroup(groupName);
    const input = document.getElementById(
      "upload-btn-design"
    ) as HTMLInputElement;
    if (input) input.click();
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* --- O COMPONENTE MODAL ENTRA AQUI --- */}
      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName={upgradeFeature}
      />

      {/* INPUTS ESCONDIDOS */}
      <input
        type="file"
        id="upload-btn-design"
        className="hidden"
        onChange={(e) =>
          handleFileUpload(e, "design", uploadTargetGroup || undefined)
        }
        accept="image/*,application/pdf"
        disabled={uploading}
      />
      <input
        type="file"
        id="upload-btn-client"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "client")}
        accept="image/*,application/pdf"
        disabled={uploading}
      />

      <Tabs
        defaultValue="design"
        className="h-full flex flex-col"
        onValueChange={setActiveTab}
      >
        {/* HEADER */}
        <div className="top-0 z-30 pt-4 backdrop-blur-xl border-b border-white/5 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-1">
            <TabsList className="bg-zinc-900/50 border border-white/10 p-1 h-11 sm:h-10 rounded-xl flex items-center w-full sm:w-auto shadow-inner">
              <TabsTrigger
                value="design"
                className="flex-1 sm:flex-none data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-white/5 text-zinc-500 hover:text-zinc-300 rounded-lg px-2 sm:px-4 h-9 sm:h-8 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <Layout className="w-3.5 h-3.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="client"
                className="flex-1 sm:flex-none data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-white/5 text-zinc-500 hover:text-zinc-300 rounded-lg px-2 sm:px-4 h-9 sm:h-8 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Assets Gerais
              </TabsTrigger>
            </TabsList>

            <label
              htmlFor={
                activeTab === "design"
                  ? "upload-btn-design"
                  : "upload-btn-client"
              }
              onClick={() => setUploadTargetGroup(null)}
              className={`w-full sm:w-auto h-11 sm:h-9 px-6 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 select-none shadow-lg shadow-blue-600/20 active:scale-95 hover:brightness-110 ${
                uploading
                  ? "bg-zinc-800 text-zinc-500 cursor-wait border border-white/5"
                  : "bg-blue-600 text-white border border-blue-500/50"
              }`}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 stroke-[3px]" />
              )}
              <span className="text-sm sm:text-xs font-bold tracking-wide">
                {uploading
                  ? "Enviando..."
                  : activeTab === "design"
                  ? "Nova Entrega"
                  : "Adicionar Asset"}
              </span>
            </label>
          </div>
        </div>

        {/* TIMELINE (DESIGN) */}
        <TabsContent
          value="design"
          className="flex-1 overflow-y-auto pr-0 sm:pr-2 space-y-10 pt-2 pb-32 outline-none scrollbar-thin scrollbar-thumb-zinc-800/50 scrollbar-track-transparent"
        >
          {designGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800/50 rounded-3xl bg-zinc-900/10 mx-2 mt-4">
              <div className="h-14 w-14 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 shadow-inner">
                <Sparkles className="h-5 w-5 text-blue-500 opacity-60" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                Nenhum arquivo ainda
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px] text-center">
                Aguardando uploads.
              </p>
            </div>
          )}

          {designGroups.map((group) => (
            <div
              key={group.name}
              className="relative pl-3 sm:pl-6 group/timeline"
            >
              <div className="absolute left-[5px] sm:left-2.5 top-8 bottom-[-40px] w-[1px] bg-gradient-to-b from-blue-500/30 via-zinc-800 to-transparent group-last/timeline:hidden" />

              <div className="flex items-center justify-between mb-5 relative pr-1">
                <div className="flex items-center gap-3 sm:gap-4 pl-2 sm:pl-0">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 -ml-[5px] sm:-ml-[6px]" />
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-zinc-100 capitalize tracking-tight flex items-center gap-2">
                      {group.name}
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      {group.files.length} vers
                      {group.files.length > 1 ? "ões" : "ão"} •{" "}
                      {new Date(group.files[0].created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerGroupUpload(group.name)}
                  className="h-7 text-[10px] text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md px-2.5 border border-transparent hover:border-blue-500/20 transition-all"
                  disabled={uploading}
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Nova Versão
                </Button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide px-1 snap-x snap-mandatory">
                {group.files.map((file, index) => {
                  const isLatest = index === 0;
                  const isBriefingFile = file.name
                    .toLowerCase()
                    .includes("briefing");

                  let badgeLabel = "";
                  if (isBriefingFile) badgeLabel = "Cliente / Briefing";
                  else {
                    const match = file.name.match(/v(\d+)/i);
                    badgeLabel = match ? `v${match[1]}` : "Design";
                  }

                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative flex-shrink-0 flex flex-col gap-2 snap-center group ${
                        isLatest
                          ? "w-[85vw] sm:w-[300px]"
                          : "w-[70vw] sm:w-[220px] opacity-70 hover:opacity-100 transition-opacity"
                      }`}
                    >
                      <div
                        className={`relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-900 border transition-all duration-300 ${
                          isLatest
                            ? "border-zinc-700 shadow-xl shadow-black/50 ring-1 ring-white/5"
                            : "border-zinc-800/50 grayscale-[0.3] hover:grayscale-0"
                        }`}
                      >
                        {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img
                            src={file.url}
                            className="w-full h-full object-cover"
                            alt={file.name}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 gap-2">
                            <FileInput className="h-8 w-8 opacity-50" />
                            <span className="text-[10px]">Documento</span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1 ${
                              isBriefingFile
                                ? "bg-purple-600/90 text-white"
                                : isLatest
                                ? "bg-blue-600/90 text-white"
                                : "bg-zinc-900/80 text-zinc-400"
                            }`}
                          >
                            {badgeLabel}
                          </div>
                          {file.status === "approved" && (
                            <div className="px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Aprovado
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-2 translate-y-[2px] sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300">
                          <Button
                            onClick={() => openReview(file.url)}
                            className="flex-1 h-8 bg-white/95 hover:bg-white text-zinc-900 text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm active:scale-95 transition-all border-0"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                            Ver
                          </Button>
                          <Button
                            onClick={() => copyReviewLink(file.id)}
                            size="icon"
                            className="h-8 w-8 bg-zinc-800/60 hover:bg-zinc-700/80 text-white border border-white/10 rounded-lg backdrop-blur-md shadow-lg active:scale-95 transition-all"
                          >
                            {!can("share_client") ? (
                              <Lock className="w-3.5 h-3.5 text-zinc-400" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="px-1 flex justify-between items-center">
                        <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                          {file.name}
                        </p>
                        {!isLatest && (
                          <span className="text-[9px] text-zinc-600">
                            Anterior
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ASSETS GERAIS */}
        <TabsContent
          value="client"
          className="flex-1 overflow-y-auto pb-32 outline-none px-1"
        >
          {/* ... Conteúdo Assets mantido igual ... */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 pt-2">
            <label
              htmlFor="upload-btn-client"
              className="aspect-square border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 cursor-pointer transition-all flex flex-col items-center justify-center group"
            >
              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-zinc-500" />
              </div>
              <span className="text-[9px] text-zinc-500 mt-2 font-medium">
                Novo Asset
              </span>
            </label>

            {briefingFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 hover:shadow-md transition-all"
              >
                <div className="aspect-square relative bg-black/20">
                  <img
                    src={file.url}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    alt={file.name}
                  />
                  <a
                    href={file.url}
                    target="_blank"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <UploadCloud className="w-5 h-5 text-white drop-shadow-md" />
                  </a>
                </div>
                <div className="p-2 border-t border-white/5 bg-zinc-900">
                  <p
                    className="text-[9px] text-zinc-400 truncate font-medium"
                    title={file.name}
                  >
                    {file.name.replace("Asset_", "").replace("Client_", "")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
