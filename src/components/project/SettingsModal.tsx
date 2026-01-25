import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  setProjectName: (val: string) => void;
  projectDescription: string;
  setProjectDescription: (val: string) => void;
  projectStatus: "active" | "paused" | "done" | "archived";
  setProjectStatus: (val: "active" | "paused" | "done" | "archived") => void;
  projectDueDate: string;
  setProjectDueDate: (val: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  onArchive: () => Promise<void>;
  isArchiving: boolean;
  customLogoUrl?: string;
  setCustomLogoUrl: (url: string) => void;
  agencyName?: string;
  setAgencyName: (val: string) => void;
}

export function SettingsModal({
  isOpen,
  onOpenChange,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  projectStatus,
  setProjectStatus,
  projectDueDate,
  setProjectDueDate,
  onSave,
  isSaving,
  onArchive,
  isArchiving,
  customLogoUrl,
  setCustomLogoUrl,
  agencyName,
  setAgencyName,
}: SettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("O logo deve ter no máximo 2MB.");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `project-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("project-assets").getPublicUrl(filePath);

      setCustomLogoUrl(publicUrl);
      toast.success("Logo enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload do logo:", error);
      toast.error(
        "Erro ao enviar o logo. Verifique as configurações do bucket 'project-assets'."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = () => {
    setCustomLogoUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Configurações do Projeto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-400">
              Nome do Projeto
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agency" className="text-zinc-400">
              Nome da Agência (White-label)
            </Label>
            <Input
              id="agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Ex: Minha Agência Design"
              className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-zinc-400">
              Descrição / Objetivo
            </Label>
            <Textarea
              id="desc"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Status</Label>
              <Select
                value={projectStatus}
                onValueChange={(val: any) => setProjectStatus(val)}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due" className="text-zinc-400">
                Prazo de Entrega
              </Label>
              <Input
                id="due"
                type="date"
                value={projectDueDate}
                onChange={(e) => setProjectDueDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-zinc-400">
              Logo do Projeto (White-label)
            </Label>
            {customLogoUrl ? (
              <div className="relative group rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 p-4 flex items-center justify-between">
                <img
                  src={customLogoUrl}
                  alt="Logo"
                  className="h-10 max-w-[150px] object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeLogo}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-blue-500/30 transition-colors bg-zinc-900/30">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  ) : (
                    <>
                      <UploadCloud className="h-6 w-6 text-zinc-500" />
                      <p className="text-xs text-zinc-500">
                        Clique para enviar logo (PNG, SVG)
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
            <p className="text-[10px] text-zinc-500">
              Este logo substituirá o padrão do FLUXS. nas visualizações enviadas
              para os clientes.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onArchive}
            disabled={isArchiving || isSaving}
            className="text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
          >
            {isArchiving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Arquivar Projeto
          </Button>
          <div className="flex-1" />
          <Button
            onClick={onSave}
            disabled={isSaving || isArchiving || isUploading}
            className="bg-blue-600 hover:bg-blue-700 font-bold"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
