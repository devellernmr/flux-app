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
  Check,
  Eye,
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
  if (
    lowerLabel.includes("manual da marca") ||
    lowerLabel.includes("brandbook")
  )
    return "Brandbook";
  if (lowerLabel.includes("foto") || lowerLabel.includes("imagem"))
    return "Imagens";
  if (lowerLabel.includes("documento") || lowerLabel.includes("contrato"))
    return "Documentos";
  if (lowerLabel.includes("anexar") || lowerLabel.includes("enviar"))
    return "Assets";
  // Fallback padrão
  return "Briefing Assets";
};

export function PublicBriefing() {
  const { id } = useParams();
  const [briefing, setBriefing] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Controle de Upload
  const [uploadingState, setUploadingState] = useState<{
    [key: number]: boolean;
  }>({});

  // Foco Visual
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBriefing() {
      if (!id) return;
      const { data, error } = await supabase
        .from("briefings")
        .select("*, projects(id, name)")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Briefing não encontrado.");
        setLoading(false);
        return;
      }
      setBriefing(data);

      if (data.content) {
        setBlocks(data.content);
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

  // --- FUNÇÃO DE UPLOAD COM INTEGRAÇÃO AO ProjectFiles ---
  const handleFileUpload = async (
    index: number,
    file: File,
    blockLabel: string
  ) => {
    if (!file || !briefing?.projects?.id) {
      toast.error("Erro: ID do projeto não encontrado.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 50MB.");
      return;
    }

    try {
      setUploadingState((prev) => ({ ...prev, [index]: true }));

      const projectId = briefing.projects.id;

      // 1. Determina o nome "inteligente" do grupo
      const groupName = getGroupNameFromLabel(blockLabel);
      const fileExt = file.name.split(".").pop();
      const finalFileName = `${groupName.replace(
        /\s+/g,
        "_"
      )}_Briefing_v01.${fileExt}`;

      // 2. Caminho único no Storage
      const storagePath = `${projectId}/${Date.now()}_${file.name}`;

      // 3. Upload para o bucket 'project-files'
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(storagePath, file);

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Erro de configuração: Bucket 'project-files' não encontrado no Supabase Storage."
          );
        }
        throw uploadError;
      }

      // 4. Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-files").getPublicUrl(storagePath);

      // 5. CRIAR REGISTRO NA TABELA 'files' (integração com ProjectFiles)
      const { error: dbError } = await supabase.from("files").insert({
        project_id: projectId,
        name: finalFileName,
        url: publicUrl,
        status: "pending",
      });

      if (dbError) throw dbError;

      // 6. Salvar URL na resposta do briefing
      handleInputChange(index, publicUrl);
      toast.success(`"${groupName}" enviado e adicionado ao projeto!`);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(error.message || "Erro ao enviar arquivo. Tente novamente.");
    } finally {
      setUploadingState((prev) => ({ ...prev, [index]: false }));
    }
  };

  const removeFile = (index: number) => {
    if (window.confirm("Tem certeza que deseja remover este arquivo?")) {
      handleInputChange(index, "");
    }
  };

  const submitBriefing = async () => {
    const hasAnswers = blocks.some(
      (b) => b.answer && b.answer.trim().length > 0
    );
    if (!hasAnswers) {
      toast.warning("Por favor, responda pelo menos uma pergunta.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("briefings")
      .update({
        content: blocks,
        status: "sent",
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao enviar briefing. Tente novamente.");
    } else {
      setCompleted(true);
      toast.success("Briefing enviado com sucesso!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSubmitting(false);
  };

  const answeredCount = blocks.filter(
    (b) => b.answer && b.answer.trim().length > 0
  ).length;
  const progress =
    blocks.length > 0 ? Math.round((answeredCount / blocks.length) * 100) : 0;

  // --- TELA DE CARREGAMENTO ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-zinc-500 text-sm animate-pulse">
            Preparando seu briefing...
          </p>
        </div>
      </div>
    );
  }

  // --- TELA DE SUCESSO ---
  if (completed)
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4 text-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-zinc-800/[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Recebido com Sucesso!
          </h1>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed mb-8">
            Suas respostas foram enviadas diretamente para nossa equipe. Vamos
            analisar tudo e entrar em contato em breve.
          </p>
          <Button
            variant="outline"
            className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
            onClick={() => window.close()}
          >
            Fechar Janela
          </Button>
        </motion.div>
      </div>
    );

  // --- TELA PRINCIPAL DO BRIEFING ---
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* Background Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-zinc-800/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full opacity-50" />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-widest mb-4 backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> Briefing de Projeto
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              {briefing?.projects?.name}
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Responda com calma. Essas informações são a base do nosso trabalho
              criativo.
            </p>
          </div>

          {/* Lista de Blocos */}
          <div className="space-y-8 md:space-y-12">
            {blocks.map((block: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-300 group ${
                  focusedIndex === index
                    ? "bg-zinc-900/40 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.05)]"
                    : "bg-zinc-900/20 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/30"
                }`}
                onClick={() => setFocusedIndex(index)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Número da Pergunta */}
                  <span
                    className={`hidden md:flex items-center justify-center h-8 w-8 shrink-0 rounded-lg text-sm font-bold border transition-colors ${
                      focusedIndex === index ||
                      (block.answer && block.answer.length > 0)
                        ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    }`}
                  >
                    {block.answer && block.answer.length > 0 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <div className="flex-1 space-y-4 w-full">
                    {/* Título da Pergunta */}
                    <label
                      className={`block text-lg md:text-xl font-medium transition-colors leading-snug ${
                        focusedIndex === index ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      <span className="md:hidden text-blue-500 mr-2 font-bold">
                        {index + 1}.
                      </span>
                      {block.label}
                    </label>

                    {/* Inputs */}
                    <div className="relative">
                      {block.type === "textarea" ? (
                        <Textarea
                          value={block.answer || ""}
                          onChange={(e) =>
                            handleInputChange(index, e.target.value)
                          }
                          onFocus={() => setFocusedIndex(index)}
                          onBlur={() => setFocusedIndex(null)}
                          placeholder={
                            block.placeholder ||
                            "Digite sua resposta detalhada aqui..."
                          }
                          className="min-h-[140px] bg-transparent border-0 border-b-2 border-zinc-800 rounded-none px-0 text-base md:text-lg focus-visible:ring-0 focus-visible:border-blue-500 placeholder:text-zinc-700 resize-none transition-all leading-relaxed"
                        />
                      ) : block.type === "select" ? (
                        <div className="relative">
                          <select
                            value={block.answer || ""}
                            onChange={(e) =>
                              handleInputChange(index, e.target.value)
                            }
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={() => setFocusedIndex(null)}
                            className="w-full bg-transparent border-0 border-b-2 border-zinc-800 rounded-none px-0 py-3 text-base md:text-lg text-zinc-300 focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
                          >
                            <option value="" disabled>
                              Selecione a melhor opção...
                            </option>
                            {block.options?.map((opt: string) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-zinc-900 text-zinc-300 py-2"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          {/* Custom Chevron */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <ArrowRight className="h-4 w-4 rotate-90" />
                          </div>
                        </div>
                      ) : block.type === "upload" ? (
                        // --- COMPONENTE DE UPLOAD COMPLETO ---
                        <div className="pt-4 animate-in fade-in zoom-in duration-300">
                          {block.answer ? (
                            // CARD DE ARQUIVO ENVIADO
                            <div className="relative overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 group/file hover:border-blue-500/30 transition-all">
                              {/* Fundo Gradiente sutil */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover/file:opacity-100 transition-opacity" />

                              <div className="flex items-center gap-4 p-4 relative z-10">
                                <div className="h-14 w-14 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-400 overflow-hidden">
                                  {block.answer.match(
                                    /\.(jpg|jpeg|png|gif|webp)$/i
                                  ) ? (
                                    <img
                                      src={block.answer}
                                      alt="Preview"
                                      className="h-full w-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <FileText className="h-7 w-7" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate mb-1">
                                    Arquivo anexado com sucesso!
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <a
                                      href={block.answer}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                    >
                                      <Eye className="h-3 w-3" /> Visualizar
                                    </a>
                                    <span className="text-zinc-700">|</span>
                                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" /> Salvo
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                  }}
                                  className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Remover arquivo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // ÁREA DE UPLOAD VAZIA
                            <div className="relative group/upload">
                              <input
                                type="file"
                                id={`file-upload-${index}`}
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(
                                      index,
                                      e.target.files[0],
                                      block.label
                                    );
                                  }
                                }}
                                disabled={uploadingState[index]}
                              />
                              <label
                                htmlFor={`file-upload-${index}`}
                                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-800 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-zinc-900/50 transition-all overflow-hidden ${
                                  uploadingState[index]
                                    ? "opacity-50 pointer-events-none"
                                    : ""
                                }`}
                              >
                                {/* Efeito de hover no background */}
                                <div className="absolute inset-0 bg-blue-500/5 scale-0 group-hover/upload:scale-100 transition-transform duration-500 rounded-xl origin-center" />

                                {uploadingState[index] ? (
                                  <div className="flex flex-col items-center relative z-10">
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3 relative z-10" />
                                    </div>
                                    <span className="text-sm text-zinc-300 font-medium">
                                      Enviando para o projeto...
                                    </span>
                                    <span className="text-xs text-zinc-500 mt-1">
                                      Aguarde um momento
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center relative z-10 text-center px-4">
                                    <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover/upload:bg-blue-500 group-hover/upload:text-white transition-all duration-300 text-zinc-500 shadow-lg shadow-black/20 group-hover/upload:shadow-blue-500/30">
                                      <UploadCloud className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm text-zinc-300 font-medium group-hover/upload:text-white transition-colors">
                                      Clique para selecionar ou arraste aqui
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-2 max-w-[200px]">
                                      Suporta Imagens, PDF, Docs (Max 50MB)
                                    </p>
                                  </div>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          value={block.answer || ""}
                          onChange={(e) =>
                            handleInputChange(index, e.target.value)
                          }
                          onFocus={() => setFocusedIndex(index)}
                          onBlur={() => setFocusedIndex(null)}
                          placeholder={
                            block.placeholder || "Sua resposta curta..."
                          }
                          className="bg-transparent border-0 border-b-2 border-zinc-800 rounded-none px-0 h-12 text-base md:text-lg focus-visible:ring-0 focus-visible:border-blue-500 placeholder:text-zinc-700 transition-all"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Botão de Envio */}
          <div className="mt-20 flex flex-col items-center gap-6 pb-20">
            <div className="text-center space-y-2">
              <p className="text-zinc-400 text-sm font-medium">
                Progresso: <span className="text-white">{progress}%</span>
              </p>
              <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Button
              onClick={submitBriefing}
              disabled={submitting}
              className="h-16 px-12 rounded-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] group relative overflow-hidden"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />

              {submitting ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-3 relative z-10">
                  Enviar Respostas
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <p className="text-zinc-600 text-xs max-w-xs text-center">
              Ao enviar, você concorda que todas as informações fornecidas são
              verdadeiras e finais para este projeto.
            </p>
          </div>
        </motion.div>

        {/* Footer Branding */}
        <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none opacity-30 z-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            Powered by Fluxo
          </p>
        </div>
      </div>
    </div>
  );
}
