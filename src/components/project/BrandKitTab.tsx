import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ColorExtractorModal } from "./ColorExtractorModal";
import {
  Palette,
  Type,
  Plus,
  Trash2,
  Check,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function BrandKitTab({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<{ name: string; weight: string }[]>([]);
  const [newColor, setNewColor] = useState("#3b82f6");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isExtractingFigma, setIsExtractingFigma] = useState(false);

  useEffect(() => {
    fetchBrandKit();

    const channel = supabase
      .channel(`brand-kit-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).branding) {
            const branding = (payload.new as any).branding;
            setColors(branding.colors || []);
            setFonts(branding.fonts || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchBrandKit = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("branding")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      if (data?.branding) {
        setColors(data.branding.colors || []);
        setFonts(data.branding.fonts || []);
      }
    } catch (err: any) {
      if (err.message?.includes('column "branding" does not exist')) {
        console.warn(
          "Recurso de Brand Kit requer atualização do banco (coluna 'branding')."
        );
      } else {
        console.error("Erro ao buscar Brand Kit:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveBrandKit = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          branding: { colors, fonts },
        })
        .eq("id", projectId);

      if (error) throw error;
      toast.success("Brand Kit salvo com sucesso!");
    } catch (err: any) {
      if (
        err.code === "PGRST204" ||
        err.message?.includes('column "branding" does not exist')
      ) {
        toast.error(
          "A coluna 'branding' não existe no seu banco de dados. Entre em contato com o suporte para habilitar esta função."
        );
      } else {
        toast.error("Erro ao salvar Brand Kit.");
      }
    } finally {
      setSaving(false);
    }
  };

  const addColor = () => {
    if (!colors.includes(newColor)) {
      setColors([...colors, newColor]);
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
    toast.success("Copiado!");
  };

  const addFont = () => {
    setFonts([...fonts, { name: "", weight: "Regular" }]);
  };

  const updateFont = (
    index: number,
    field: "name" | "weight",
    value: string
  ) => {
    const newFonts = [...fonts];
    newFonts[index][field] = value;
    setFonts(newFonts);
  };

  const removeFont = (index: number) => {
    setFonts(fonts.filter((_, i) => i !== index));
  };

  const [isExtractorOpen, setIsExtractorOpen] = useState(false);

  const handleColorsAdded = (newColors: string[]) => {
    const finalColors = [...colors];
    newColors.forEach((c) => {
      if (!finalColors.includes(c)) finalColors.push(c);
    });
    setColors(finalColors);
    toast.success(`${newColors.length} cores adicionadas!`);
  };

  // Mantendo a função antiga para compatibilidade se for chamada de outro lugar, ou apenas para usar a utility
  const extractColorsFromImages = async () => {
    // Agora isso deve abrir o modal preferencialmente
    setIsExtractorOpen(true);
  };

  const extractColorsFromFigma = async () => {
    if (!figmaUrl.trim()) {
      toast.error("Cole o link do Figma primeiro!");
      return;
    }

    setIsExtractingFigma(true);
    try {
      // Get Figma token from user metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const figmaToken = user?.user_metadata?.figma_token;

      if (!figmaToken) {
        toast.error(
          "Configure seu Figma Token nas Configurações do Dashboard primeiro!"
        );
        return;
      }

      // Parse Figma URL to extract file key (supports both /file/ and /design/ formats)
      const fileKeyMatch = figmaUrl.match(/(?:file|design)\/([a-zA-Z0-9]+)/);
      if (!fileKeyMatch) {
        toast.error("URL do Figma inválido!");
        return;
      }

      const fileKey = fileKeyMatch[1];

      // Call Figma API

      const response = await fetch(
        `https://api.figma.com/v1/files/${fileKey}`,
        {
          headers: {
            "X-Figma-Token": figmaToken,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404)
          throw new Error("Arquivo não encontrado. Verifique a URL.");
        if (response.status === 403)
          throw new Error("Acesso negado. Verifique seu Figma Token.");
        throw new Error(`Erro na API do Figma (${response.status})`);
      }

      const data = await response.json();

      // Extract colors from fills and strokes
      const extractedColors = new Set<string>();

      const traverseNode = (node: any) => {
        const processPaint = (paint: any) => {
          if (paint.type === "SOLID" && paint.color) {
            const { r, g, b } = paint.color;
            const hex = `#${Math.round(r * 255)
              .toString(16)
              .padStart(2, "0")}${Math.round(g * 255)
                .toString(16)
                .padStart(2, "0")}${Math.round(b * 255)
                  .toString(16)
                  .padStart(2, "0")}`;
            extractedColors.add(hex);
          } else if (paint.type.includes("GRADIENT") && paint.gradientStops) {
            paint.gradientStops.forEach((stop: any) => {
              if (stop.color) {
                const { r, g, b } = stop.color;
                const hex = `#${Math.round(r * 255)
                  .toString(16)
                  .padStart(2, "0")}${Math.round(g * 255)
                    .toString(16)
                    .padStart(2, "0")}${Math.round(b * 255)
                      .toString(16)
                      .padStart(2, "0")}`;
                extractedColors.add(hex);
              }
            });
          }
        };

        if (node.fills) node.fills.forEach(processPaint);
        if (node.strokes) node.strokes.forEach(processPaint);

        if (node.children) {
          node.children.forEach(traverseNode);
        }
      };

      traverseNode(data.document);

      // Get only unique colors, filter out white/black if too many
      const colorArray = Array.from(extractedColors);
      const filteredColors = colorArray.filter(
        (c) => c !== "#ffffff" && c !== "#000000"
      );

      const finalColors = [...colors];
      filteredColors.slice(0, 8).forEach((c) => {
        if (!finalColors.includes(c)) finalColors.push(c);
      });

      setColors(finalColors);
      toast.success("Cores extraídas do Figma com sucesso!");
      setFigmaUrl("");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao extrair cores do Figma: " + err.message);
    } finally {
      setIsExtractingFigma(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Identidade Visual
          </h2>
          <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
            Defina as cores e tipografia da marca.
          </p>
        </div>
        <Button
          onClick={saveBrandKit}
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white gap-2 h-11 sm:h-auto font-bold"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Brand Kit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CORES */}
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Palette className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Paleta de Cores
              </h3>
            </div>
            <Button
              id="project-brandkit-suggest-btn"
              variant="ghost"
              size="sm"
              onClick={extractColorsFromImages}
              className="text-[10px] uppercase font-bold tracking-widest text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-xl px-4"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Sugerir Cores
            </Button>
          </div>

          <div className="space-y-3 pb-4 border-b border-zinc-800">
            <Label className="text-xs text-zinc-400 uppercase flex items-center gap-2">
              Extrair do Figma
              <span className="text-[9px] normal-case bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
                Beta
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="Cole o link do arquivo no Figma"
                className="bg-zinc-900/50 border-zinc-800 text-xs flex-1"
              />
              <Button
                id="project-brandkit-figma-btn"
                variant="outline"
                size="sm"
                onClick={extractColorsFromFigma}
                disabled={isExtractingFigma || !figmaUrl.trim()}
                className="border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
              >
                {isExtractingFigma ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Extrair"
                )}
              </Button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Configure seu Figma Token nas Configurações do Dashboard primeiro.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-3 md:gap-4">
            {colors.map((color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="group relative"
              >
                <div
                  className="w-full aspect-square sm:w-16 sm:h-16 rounded-xl md:rounded-2xl border border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: color }}
                  onClick={() => copyToClipboard(color)}
                >
                  {copiedColor === color && (
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
                  )}
                </div>
                <button
                  onClick={() => removeColor(color)}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
                <span className="block text-[8px] md:text-[10px] font-mono text-zinc-500 text-center mt-2 uppercase">
                  {color}
                </span>
              </motion.div>
            ))}

            <div className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square sm:w-16 sm:h-16 rounded-xl md:rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center p-0.5 md:p-1 bg-zinc-900/50">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full h-full bg-transparent border-0 cursor-pointer"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={addColor}
                className="h-6 px-1 md:px-2 text-[9px] md:text-[10px] text-zinc-400 hover:text-blue-400"
              >
                <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" /> Add
              </Button>
            </div>
          </div>
        </section>

        {/* TIPOGRAFIA */}
        <section
          id="project-brand-kit-typography"
          className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Type className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Tipografia
            </h3>
          </div>

          <div className="space-y-4">
            {fonts.map((font, i) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50"
              >
                <Input
                  placeholder="Nome da Fonte (ex: Inter)"
                  value={font.name}
                  onChange={(e) => updateFont(i, "name", e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-purple-500/50"
                  style={{ fontFamily: font.name }}
                />
                <Input
                  placeholder="Peso (ex: Bold)"
                  value={font.weight}
                  onChange={(e) => updateFont(i, "weight", e.target.value)}
                  className="bg-transparent border-0 w-24 text-zinc-500 text-xs focus-visible:ring-1 focus-visible:ring-purple-500/50"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFont(i)}
                  className="text-zinc-700 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}

            <Button
              variant="outline"
              onClick={addFont}
              className="w-full h-11 border-dashed border-zinc-800 bg-transparent text-zinc-500 hover:text-purple-400 hover:border-purple-500/30 transition-all rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fonte
            </Button>
          </div>
        </section>
      </div>
      <ColorExtractorModal
        isOpen={isExtractorOpen}
        onOpenChange={setIsExtractorOpen}
        onColorsExtracted={handleColorsAdded}
      />
    </div>
  );
}
