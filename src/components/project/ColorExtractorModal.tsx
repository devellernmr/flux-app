import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { extractColorsFromImage } from "@/lib/colorUtils";
import { Upload, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface ColorExtractorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onColorsExtracted: (colors: string[]) => void;
}

export function ColorExtractorModal({
  isOpen,
  onOpenChange,
  onColorsExtracted,
}: ColorExtractorModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor envie uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      setImage(url);
      setColors([]);
      setSelectedColors([]);

      setIsExtracting(true);
      try {
        const extracted = await extractColorsFromImage(url, 8); // Extract up to 8 colors
        setColors(extracted);
        setSelectedColors(extracted); // Select all by default
      } catch (err) {
        toast.error("Erro ao extrair cores.");
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const toggleColorDetails = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleSave = () => {
    onColorsExtracted(selectedColors);
    onOpenChange(false);
    reset();
  };

  const reset = () => {
    setImage(null);
    setColors([]);
    setSelectedColors([]);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) reset();
        onOpenChange(val);
      }}
    >
      <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extrair Cores de Imagem</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Envie uma imagem (logo, banner, etc) para detectarmos a paleta
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* DROPZONE */}
          {!image ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                <Upload className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                Clique para enviar ou arraste aqui
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                JPG, PNG, WebP (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 h-40 flex items-center justify-center group">
                <img
                  src={image}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Check className="w-4 h-4" />{" "}
                  {/* Actually should be X or change icon */}
                </button>
              </div>

              {/* COLORS GRID */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Cores Detectadas
                  </h4>
                  <span className="text-xs text-zinc-500">
                    {selectedColors.length} selecionadas
                  </span>
                </div>

                {isExtracting ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map((color) => (
                      <div
                        key={color}
                        onClick={() => toggleColorDetails(color)}
                        className={`group relative aspect-square rounded-lg cursor-pointer border-2 transition-all ${
                          selectedColors.includes(color)
                            ? "border-blue-500 scale-100"
                            : "border-transparent scale-95 opacity-50 hover:opacity-100 hover:scale-100"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColors.includes(color) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check
                              className={`w-5 h-5 drop-shadow-md ${
                                // Simple brightness check for icon contrast
                                parseInt(color.slice(1), 16) > 0xffffff / 2
                                  ? "text-black"
                                  : "text-white"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {colors.length === 0 && !isExtracting && (
                      <p className="col-span-4 text-center text-xs text-zinc-500 py-4">
                        Nenhuma cor dominante encontrada.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedColors.length === 0 || isExtracting}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Adicionar{" "}
            {selectedColors.length > 0 ? `${selectedColors.length} Cores` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
