import { useState, memo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Palette,
  Globe,
  Trash2,
  PenLine,
  CheckCircle2,
  UploadCloud,
  FileText,
  Copy,
  Save,
  Sparkles,
} from "lucide-react";
import { AIBriefingGenerator } from "@/components/AIBriefingGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { BriefingBlock } from "@/lib/templates";

// --- SUB-COMPONENTES ---

export function BriefingSuccessAction({
  onCopyLink,
}: {
  onCopyLink: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 md:mb-10 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center relative overflow-hidden group shadow-2xl shadow-emerald-900/10"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Briefing Salvo com Sucesso!
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto text-xs md:text-sm leading-relaxed">
            O conteúdo está pronto. Agora envie o link para o cliente preencher
            ou revisar as informações.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full justify-center">
          <button
            onClick={onCopyLink}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 font-medium flex items-center"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Link do Briefing
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function BriefingApprovedAction() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 p-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 text-center relative overflow-hidden group shadow-2xl shadow-blue-900/10"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <Sparkles className="h-8 w-8 text-blue-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Briefing Aprovado!
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
            As informações foram validadas. O projeto agora está na fase de
            desenvolvimento.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function TemplateCard({ icon, title, desc, color, onClick }: any) {
  const colors: any = {
    blue: "text-blue-500",
    pink: "text-pink-500",
    emerald: "text-emerald-500",
  };
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start p-4 md:p-5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl hover:border-zinc-700 transition-all text-left w-full overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div
        className={`h-9 w-9 md:h-10 md:w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-3 ${colors[color]} group-hover:scale-110 transition-transform relative z-10`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-200 text-xs md:text-sm group-hover:text-white relative z-10">
        {title}
      </h3>
      <p className="text-[10px] md:text-xs text-zinc-500 mt-1 relative z-10 line-clamp-2 md:line-clamp-none">
        {desc}
      </p>
    </button>
  );
}

// --- COMPONENTE PRINCIPAL ---

interface BriefingTabProps {
  briefingStatus:
    | "empty"
    | "draft"
    | "sent"
    | "awaiting_response"
    | "approved"
    | "active"
    | "completed";
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  blocks: BriefingBlock[];
  onCopyLink: () => void;
  onApprove: () => void;
  onLoadTemplate: (key: string) => void;
  onOpenResetDialog: () => void;
  onSave: () => void;
  isSaving: boolean;
  onUpdateBlock: (i: number, field: keyof BriefingBlock, value: any) => void;
  onRemoveBlock: (i: number) => void;
  onAddBlock: (block?: BriefingBlock) => void;
  setBlocks: (blocks: BriefingBlock[]) => void;
  can: (feature: string) => boolean;
  onShowUpgrade: (feature?: string) => void;
  containerVariants: any;
  itemVariants: any;
}

export const BriefingTab = memo(
  ({
    briefingStatus,
    isEditing,
    setIsEditing,
    blocks,
    setBlocks,
    can,
    onShowUpgrade,
    onCopyLink,
    onApprove,
    onLoadTemplate,
    onOpenResetDialog,
    onSave,
    isSaving,
    onUpdateBlock,
    onRemoveBlock,
    onAddBlock,
    containerVariants,
    itemVariants,
  }: BriefingTabProps) => {
    const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);

    const handleAIUse = (result: any) => {
      // Transform AI questions into blocks
      const newBlocks: BriefingBlock[] = result.questions.map((q: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: "textarea",
        label: q,
        placeholder: "Resposta aqui...",
        required: true,
        answer: "",
      }));

      // Replace existing blocks with new AI blocks
      setBlocks(newBlocks);
      setIsEditing(true);
      setIsAIGeneratorOpen(false);
      toast.success(
        "Perguntas da IA adicionadas (as anteriores foram removidas)!",
      );
    };
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Briefing
            </h2>
            <p className="text-zinc-400 mt-1 text-sm">
              Dados estratégicos e alinhamento.
            </p>
          </div>
        </div>

        {/* SEÇÃO PRINCIPAL: Card de Conteúdo */}
        <div
          id="project-briefing-viewer"
          className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-4 md:p-10 backdrop-blur-sm relative overflow-hidden shadow-xl shadow-black/20"
        >
          {/* 
          CENÁRIO 1: MODO VISUALIZAÇÃO (Já Salvo)
          Exibe: Ação de Sucesso (Topo) + Respostas (Baixo)
      */}
          {(briefingStatus === "sent" ||
            briefingStatus === "approved" ||
            briefingStatus === "awaiting_response") &&
          !isEditing ? (
            <div className="space-y-8">
              {/* COMPONENTE DE AÇÃO APROVADO OU SUCESSO AQUI */}
              {briefingStatus === "approved" ? (
                <BriefingApprovedAction />
              ) : (
                <BriefingSuccessAction onCopyLink={onCopyLink} />
              )}
              {/* Divisor Visual */}
              <div className="flex justify-between items-center border-b border-zinc-800/50 pb-6 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                  <h3 className="font-medium text-zinc-200 text-sm tracking-wide uppercase">
                    Respostas do Cliente
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-zinc-500 hover:text-white hover:bg-zinc-800 h-8 text-xs gap-2 px-3 rounded-full border border-transparent hover:border-zinc-700 transition-all"
                >
                  <PenLine className="h-3.5 w-3.5" />{" "}
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </div>

              {/* Lista de Respostas (Opacidade reduzida para foco no topo) */}
              <motion.div
                id="project-briefing-questions"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 opacity-90 hover:opacity-100 transition-opacity duration-300"
              >
                {blocks.map((block: any, i) => (
                  <motion.div
                    key={block.id}
                    variants={itemVariants as any}
                    className="group relative p-5 md:p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-all hover:shadow-lg hover:shadow-black/40 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-400 border border-blue-500/20 font-mono">
                        {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-200 tracking-tight leading-snug">
                        {block.label}
                      </h3>
                    </div>

                    {/* Conteúdo da Resposta */}
                    <div className="pl-0 md:pl-10 relative z-10">
                      {block.type === "upload" ? (
                        block.answer ? (
                          <div className="flex flex-wrap gap-3">
                            {(() => {
                              let fileList: string[] = [];
                              try {
                                if (
                                  block.answer.startsWith("[") ||
                                  block.answer.startsWith("{")
                                ) {
                                  fileList = JSON.parse(block.answer);
                                  if (!Array.isArray(fileList))
                                    fileList = [block.answer];
                                } else {
                                  fileList = [block.answer];
                                }
                              } catch (e) {
                                fileList = [block.answer];
                              }

                              return fileList.map(
                                (url: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 max-w-[240px] group/file"
                                  >
                                    <div className="h-10 w-10 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center text-blue-500 shrink-0 border border-white/5">
                                      {url.match(
                                        /\.(jpg|jpeg|png|gif|webp)$/i,
                                      ) ? (
                                        <img
                                          src={url}
                                          alt="Preview"
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <FileText className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">
                                        {url.match(
                                          /\.(jpg|jpeg|png|gif|webp)$/i,
                                        )
                                          ? "Imagem"
                                          : "Doc"}
                                      </p>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-zinc-300 hover:text-white truncate block font-medium hover:underline"
                                      >
                                        Ver Arquivo
                                      </a>
                                    </div>
                                  </div>
                                ),
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="italic text-zinc-600 flex items-center gap-2">
                            <UploadCloud className="h-4 w-4" /> Nenhum arquivo.
                          </span>
                        )
                      ) : (
                        <p className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap font-light">
                          {block.answer || (
                            <span className="italic text-zinc-600">
                              Ainda não respondido.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              {/* No final da exibição das respostas, adicione: */}

              {briefingStatus === "sent" && (
                <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                  <Button
                    onClick={onApprove}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Aprovar e Iniciar Desenvolvimento
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div id="project-briefing-content" className="space-y-6">
              {briefingStatus === "empty" && !isEditing && (
                <div
                  id="project-briefing-templates"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <TemplateCard
                    onClick={() => onLoadTemplate("custom")}
                    icon={<Plus className="h-5 w-5" />}
                    title="Em Branco"
                    desc="Começar do zero"
                    color="blue"
                  />
                  <TemplateCard
                    onClick={() => onLoadTemplate("branding")}
                    icon={<Palette className="h-5 w-5" />}
                    title="Identidade"
                    desc="Branding & Logo"
                    color="pink"
                  />
                  <TemplateCard
                    onClick={() => onLoadTemplate("landing_page")}
                    icon={<Globe className="h-5 w-5" />}
                    title="Website"
                    desc="Landing Pages"
                    color="emerald"
                  />
                </div>
              )}

              {(isEditing ||
                briefingStatus === "draft" ||
                briefingStatus === "sent") && (
                <div id="project-briefing-editor" className="space-y-6 pt-4">
                  <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                    <h3 className="font-medium text-zinc-200">
                      Editor de Perguntas
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onOpenResetDialog}
                      className="text-zinc-500 hover:text-red-400 text-xs h-7"
                    >
                      Limpar Tudo
                    </Button>
                  </div>

                  {/* Loop dos Blocos de Edição (Inputs) */}
                  {blocks.map((block, i) => (
                    <div
                      key={block.id}
                      className="group bg-zinc-950/50 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-4 items-start"
                    >
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs text-zinc-600 font-mono pt-0 md:pt-3">
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveBlock(i)}
                          className="md:hidden ml-auto text-zinc-600 hover:text-red-400 h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <Input
                          value={block.label}
                          onChange={(e) =>
                            onUpdateBlock(i, "label", e.target.value)
                          }
                          className="bg-transparent border-none text-sm font-medium px-0 h-auto focus-visible:ring-0 text-zinc-200 placeholder:text-zinc-700"
                          placeholder="Digite a pergunta aqui..."
                        />

                        <div className="flex flex-wrap gap-2 items-center opacity-100 md:opacity-50 group-hover:opacity-100 transition-opacity">
                          <select
                            value={block.type}
                            onChange={(e) =>
                              onUpdateBlock(i, "type", e.target.value)
                            }
                            className="bg-[#050505] text-xs text-zinc-400 border border-zinc-800 rounded px-2 py-1 focus:outline-none w-full md:w-auto"
                          >
                            <option value="text">Texto Curto</option>
                            <option value="textarea">Texto Longo</option>
                            <option value="select">Múltipla Escolha</option>
                            <option value="upload">Upload de Arquivo</option>
                          </select>
                          <Input
                            value={block.placeholder || ""}
                            onChange={(e) =>
                              onUpdateBlock(i, "placeholder", e.target.value)
                            }
                            className="bg-transparent border-none text-xs text-zinc-500 h-auto p-0 focus-visible:ring-0 w-full md:w-auto"
                            placeholder="Texto de exemplo (placeholder)..."
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveBlock(i)}
                        className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Botões de Ação do Editor */}
                  <div className="flex flex-col md:flex-row justify-between pt-6 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onAddBlock()}
                      className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 w-full md:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Pergunta
                    </Button>
                    <Button
                      id="project-briefing-ai-btn"
                      variant="outline"
                      onClick={() => {
                        if (can("ai")) {
                          setIsAIGeneratorOpen(true);
                        } else {
                          onShowUpgrade("Assistente IA");
                        }
                      }}
                      className="border-blue-600/30 bg-blue-600/5 text-blue-400 hover:bg-blue-600/10 w-full md:w-auto"
                    >
                      <Sparkles className="mr-2 h-4 w-4" /> Gerar com IA
                    </Button>
                    <Button
                      id="project-briefing-save-btn"
                      onClick={onSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-500 text-white w-full md:w-auto"
                    >
                      {isSaving ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Salvar Briefing
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AIBriefingGenerator
          isOpen={isAIGeneratorOpen}
          onClose={() => setIsAIGeneratorOpen(false)}
          onUse={handleAIUse}
        />
      </div>
    );
  },
);

BriefingTab.displayName = "BriefingTab";
