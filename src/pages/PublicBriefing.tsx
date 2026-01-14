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
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Recebido com Sucesso!</h1>
        <p className="text-zinc-400 mb-8 max-w-sm">
          Analisaremos tudo e entraremos em contato.
        </p>
        <Button variant="outline" onClick={() => window.close()}>
          Fechar
        </Button>
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
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans pb-20">
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          {briefing?.projects?.custom_logo_url ? (
            <img
              src={briefing.projects.custom_logo_url}
              alt="Logo"
              className="h-12 mx-auto mb-6 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center gap-2 font-bold text-white mb-6">
              {briefing?.projects?.agency_name ? (
                <span className="text-xl tracking-tight">
                  {briefing.projects.agency_name}
                </span>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-blue-500" /> FLUXO.
                </>
              )}
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">
            {briefing?.projects?.name}
          </h1>
          <p className="text-zinc-500">
            Por favor, responda as questões abaixo.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-10">
          {blocks.map((block: any, index: number) => (
            <div key={index} className="space-y-4">
              <label className="text-sm font-medium text-zinc-400">
                {block.label}
              </label>
              {block.type === "textarea" ? (
                <Textarea
                  value={block.answer || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={block.placeholder}
                  className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500/50 min-h-[120px]"
                />
              ) : block.type === "file" ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-900/20">
                  {block.answer ? (
                    <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">Arquivo anexado</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInputChange(index, "")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <UploadCloud className="h-8 w-8 text-zinc-600" />
                      <p className="text-sm text-zinc-500">
                        {uploadingState[index]
                          ? "Enviando..."
                          : "Clique para enviar"}
                      </p>
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
                  className="bg-zinc-900/50 border-zinc-800"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-900">
          <Button
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold"
            onClick={submitBriefing}
            disabled={submitting}
          >
            {submitting ? "Enviando..." : "Enviar Briefing"}{" "}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
