import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { PublicBriefingSkeleton } from "@/components/dashboard/Skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BriefingFileUploader } from "@/components/BriefingFileUploader";

// --- PUBLIC BRIEFING ---
export function PublicBriefing() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [briefing, setBriefing] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function fetchBriefing() {
      if (!id) return;

      // Leitura pública segura (RPC SECURITY DEFINER) com fallback direto
      // para enquanto a migration 20260228 não estiver aplicada.
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_public_briefing",
        { p_briefing_id: id },
      );

      let data: any = !rpcError ? rpcData : null;

      if (rpcError || !data) {
        const res = await supabase
          .from("briefings")
          .select("*, projects(id, name, custom_logo_url, agency_name)")
          .eq("id", id)
          .single();

        if (res.error) {
          toast.error(t("public_briefing.toast.not_found"));
          setLoading(false);
          return;
        }

        data = res.data;
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

  const submitBriefing = async () => {
    if (!blocks.some((b) => b.answer?.trim().length > 0)) {
      toast.warning(t("public_briefing.toast.answer_required"));
      return;
    }
    setSubmitting(true);

    // Envio via RPC (grava content/status e recusa se já aprovado) com
    // fallback direto para o UPDATE na tabela.
    const { error: rpcError } = await supabase.rpc("submit_public_briefing", {
      p_briefing_id: id,
      p_content: blocks,
    });

    if (rpcError) {
      const { error } = await supabase
        .from("briefings")
        .update({ content: blocks, status: "sent" })
        .eq("id", id);

      if (error) {
        toast.error(t("public_briefing.toast.submit_error"));
        setSubmitting(false);
        return;
      }
    }

    setCompleted(true);
    toast.success(t("public_briefing.toast.success"));
    window.scrollTo(0, 0);
    setSubmitting(false);
  };

  if (loading) return <PublicBriefingSkeleton />;

  if (completed)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden relative">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute top-[10%] left-[5%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 rounded-[40px] border border-white/5 bg-zinc-900/10 backdrop-blur-3xl relative z-10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-4 leading-none">
            {t("public_briefing.success.title")}
          </h1>
          <p className="text-zinc-500 font-medium leading-relaxed mb-10">
            {t("public_briefing.success.message")}
          </p>
          <div className="space-y-4">
            <div className="h-px w-full bg-white/5 mb-6" />
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
              {t("public_briefing.success.powered_by")}
            </p>
          </div>
        </motion.div>
      </div>
    );

  const progress =
    blocks.length > 0
      ? Math.round(
          (blocks.filter((b) => b.answer?.trim().length > 0).length /
            blocks.length) *
            100,
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans pb-24 selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Global Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      {/* Top Fixed Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-zinc-900/80 backdrop-blur-md z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-5">
          {briefing?.projects?.custom_logo_url ? (
            <div className="inline-block p-4 bg-zinc-900/60 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl mb-2">
              <img
                src={briefing.projects.custom_logo_url}
                alt="Logo"
                className="h-12 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 font-black text-white mb-6 group">
              <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {briefing?.projects?.agency_name ? (
                <span className="text-2xl tracking-tighter uppercase font-black">
                  {briefing.projects.agency_name}
                </span>
              ) : (
                <span className="text-2xl tracking-tighter uppercase font-black">
                  FLUXS<span className="text-blue-500">.</span>
                </span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {briefing?.projects?.name}
            </h1>
            <p className="text-zinc-400 text-sm font-medium">
              {t("public_briefing.header.subtitle")} •{" "}
              <span className="text-zinc-500">
                {t("public_briefing.header.intel")}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {progress}% Respondido
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Form Question Blocks */}
        <div className="space-y-8">
          {blocks.map((block: any, index: number) => (
            <div
              key={index}
              className="p-6 md:p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <label className="text-sm font-bold text-white tracking-tight">
                  {block.label}
                </label>
              </div>

              {block.type === "textarea" ? (
                <Textarea
                  value={block.answer || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={block.placeholder || "Digite sua resposta..."}
                  className="bg-black/50 border-white/10 focus:border-blue-500/60 min-h-[140px] rounded-2xl p-5 text-white placeholder:text-zinc-600 transition-all text-sm leading-relaxed resize-none"
                />
              ) : block.type === "upload" ? (
                <BriefingFileUploader
                  value={block.answer || ""}
                  onChange={(val) => handleInputChange(index, val)}
                  projectId={briefing?.projects?.id}
                  blockLabel={block.label}
                />
              ) : (
                <Input
                  value={block.answer || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={block.placeholder || "Sua resposta..."}
                  className="bg-black/50 border-white/10 h-14 rounded-2xl px-5 text-white focus:border-blue-500/60 placeholder:text-zinc-600 transition-all font-medium text-sm"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Action */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col items-center gap-5">
          <Button
            className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl shadow-2xl shadow-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-lg"
            onClick={submitBriefing}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            {submitting
              ? t("public_briefing.form.processing")
              : t("public_briefing.form.submit_button")}
            {!submitting && <ArrowRight className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />{" "}
            {t("public_briefing.form.powered_by")}
          </div>
        </div>
      </div>
    </div>
  );
}
