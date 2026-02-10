import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react";
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
      const { data, error } = await supabase
        .from("briefings")
        .select("*, projects(id, name, custom_logo_url, agency_name)")
        .eq("id", id)
        .single();
      if (error) {
        toast.error(t("public_briefing.toast.not_found"));
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

  const submitBriefing = async () => {
    if (!blocks.some((b) => b.answer?.trim().length > 0)) {
      toast.warning(t("public_briefing.toast.answer_required"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("briefings")
      .update({ content: blocks, status: "sent" })
      .eq("id", id);
    if (error) toast.error(t("public_briefing.toast.submit_error"));
    else {
      setCompleted(true);
      toast.success(t("public_briefing.toast.success"));
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
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none">
              {briefing?.projects?.name}
            </h1>
            <p className="text-zinc-500 font-medium tracking-tight">
              {t("public_briefing.header.subtitle")} •{" "}
              <span className="text-zinc-400">
                {t("public_briefing.header.intel")}
              </span>
            </p>
            <LanguageSelector />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-12">
          {blocks.map((block: any, index: number) => (
            <div
              key={index}
              className="space-y-4 animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
            {submitting
              ? t("public_briefing.form.processing")
              : t("public_briefing.form.submit_button")}
            {!submitting && <ArrowRight className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
            <Sparkles className="h-3 w-3" />{" "}
            {t("public_briefing.form.powered_by")}
          </div>
        </div>
      </div>
    </div>
  );
}
