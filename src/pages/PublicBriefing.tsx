import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  UploadCloud,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// --- FUNÇÃO "INTELIGENTE" PARA NOMEAR ARQUIVOS ---
const getGroupNameFromLabel = (label: string): string => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("logo")) return "Logo";
  if (lowerLabel.includes("referência") || lowerLabel.includes("inspiração"))
    return "Referencias";
  if (lowerLabel.includes("manual") || lowerLabel.includes("brandbook"))
    return "Brandbook";
  if (lowerLabel.includes("foto") || lowerLabel.includes("imagem"))
    return "Imagens";
  return "Assets";
};

export function PublicBriefing() {
  const { id } = useParams();
  const [briefing, setBriefing] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [uploadingState, setUploadingState] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    async function fetchBriefing() {
      if (!id) return;
      const { data, error } = await supabase
        .from("briefings")
        .select("*, projects(id, name, custom_logo_url, agency_name)")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Briefing não encontrado.");
        setLoading(false);
        return;
      }
      setBriefing(data);
      if (data.content) setBlocks(data.content);
      if (data.projects?.name) {
        document.title = `Briefing | ${data.projects.name}`;
      }
      setLoading(false);
    }
    fetchBriefing();
  }, [id]);

  const handleInputChange = (index: number, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index].answer = value;
    setBlocks(newBlocks);
  };

  const handleFileUpload = async (
    index: number,
    file: File,
    blockLabel: string
  ) => {
    if (!file || !briefing?.projects?.id) return;
    try {
      setUploadingState((prev) => ({ ...prev, [index]: true }));
      const projectId = briefing.projects.id;
      const groupName = getGroupNameFromLabel(blockLabel);
      const fileExt = file.name.split(".").pop();
      const finalFileName = `${groupName}_Briefing_v01.${fileExt}`;
      const storagePath = `${projectId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(storagePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-files").getPublicUrl(storagePath);
      await supabase.from("files").insert({
        project_id: projectId,
        name: finalFileName,
        url: publicUrl,
        status: "pending",
      });
      handleInputChange(index, publicUrl);
      toast.success("Arquivo enviado!");
    } catch (error: any) {
      toast.error("Erro no upload.");
    } finally {
      setUploadingState((prev) => ({ ...prev, [index]: false }));
    }
  };

  const submitBriefing = async () => {
    if (!blocks.some((b) => b.answer?.trim().length > 0)) {
      toast.warning("Responda algo.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("briefings")
      .update({ content: blocks, status: "sent" })
      .eq("id", id);
    if (error) toast.error("Erro ao enviar.");
    else {
      setCompleted(true);
      toast.success("Sucesso!");
      window.scrollTo(0, 0);
    }
    setSubmitting(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );

  if (completed)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden relative">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[10%] left-[5%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 rounded-[40px] border border-white/5 bg-zinc-900/10 backdrop-blur-3xl relative z-10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-4 leading-none">Briefing Enviado!</h1>
          <p className="text-zinc-500 font-medium leading-relaxed mb-10">
            Recebemos seus dados com sucesso. Nossa inteligência está processando tudo e nossa equipe entrará em contato em breve.
          </p>
          <div className="space-y-4">
            <div className="h-px w-full bg-white/5 mb-6" />
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Powered by Fluxs Intelligence</p>
          </div>
        </motion.div>
      </div>
    );

  const progress =
    blocks.length > 0
      ? Math.round(
        (blocks.filter((b) => b.answer?.trim().length > 0).length /
          blocks.length) *
        100
      )
      : 0;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans pb-20 selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* GLOBAL OVERLAYS */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          {briefing?.projects?.custom_logo_url ? (
            <div className="inline-block p-4 bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl mb-2">
              <img
                src={briefing.projects.custom_logo_url}
                alt="Logo"
                className="h-12 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 font-black text-white mb-8 group">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              {briefing?.projects?.agency_name ? (
                <span className="text-2xl tracking-tighter uppercase font-black">
                  {briefing.projects.agency_name}
                </span>
              ) : (
                <span className="text-2xl tracking-tighter uppercase font-black">
                  FLUXS.
                </span>
              )}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
              {briefing?.projects?.name}
            </h1>
            <p className="text-zinc-500 font-medium tracking-tight">
              Central de Coleta Dinâmica • <span className="text-zinc-400">Fluxs Intel</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-12">
          {blocks.map((block: any, index: number) => (
            <div key={index} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">
                {block.label}
              </label>
              {block.type === "textarea" ? (
                <Textarea
                  value={block.answer || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={block.placeholder}
                  className="bg-zinc-900/40 border-zinc-800 focus:border-blue-500/50 min-h-[160px] rounded-3xl p-6 text-white placeholder:text-zinc-700 transition-all text-sm leading-relaxed"
                />
              ) : block.type === "file" ? (
                <div className="relative border border-dashed border-zinc-800 rounded-3xl p-10 text-center bg-zinc-900/20 group hover:border-blue-500/30 transition-all backdrop-blur-sm shadow-xl hover:bg-zinc-900/30">
                  {block.answer ? (
                    <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-zinc-800 group-hover:border-blue-500/20">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                          <FileText className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-white">Arquivo anexado</span>
                          <span className="block text-[10px] text-zinc-500 uppercase tracking-widest">Documento v01</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        onClick={() => handleInputChange(index, "")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-8 w-8 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">
                          {uploadingState[index]
                            ? "Enviando arquivo..."
                            : "Subir Arquivo de Referência"}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">Clique ou arraste para enviar</p>
                      </div>
                      <input
                        type="file"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(
                            index,
                            e.target.files[0],
                            block.label
                          )
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingState[index]}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  value={block.answer || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={block.placeholder}
                  className="bg-zinc-900/40 border-zinc-800 h-14 rounded-2xl px-6 text-white focus:ring-blue-500/20 placeholder:text-zinc-700 transition-all font-bold"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-900 flex flex-col items-center gap-6">
          <Button
            className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl shadow-2xl shadow-blue-500/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
            onClick={submitBriefing}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            {submitting ? "PROCESSANDO..." : "FINALIZAR E ENVIAR BRIEFING"}
            {!submitting && <ArrowRight className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
            <Sparkles className="h-3 w-3" /> Powered by Fluxs Intelligence
          </div>
        </div>
      </div>
    </div>
  );
}
