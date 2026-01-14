import { ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmbedViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

export function EmbedViewer({
  isOpen,
  onOpenChange,
  url,
  title,
}: EmbedViewerProps) {
  // Helper to get actual embed URL
  const getEmbedUrl = (rawUrl: string) => {
    if (rawUrl.includes("figma.com")) {
      if (rawUrl.includes("figma.com/embed")) return rawUrl;
      return `https://www.figma.com/embed?embed_host=fluxo&url=${encodeURIComponent(
        rawUrl
      )}`;
    }
    if (rawUrl.includes("canva.com")) {
      if (rawUrl.includes("embed")) return rawUrl;
      // Ensure it uses /view instead of /edit or other suffixes
      let cleanUrl = rawUrl.split("?")[0];
      if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);

      const parts = cleanUrl.split("/");
      const lastPart = parts[parts.length - 1];

      // If it doesn't end in view or watch, try to replace the last part or append view
      if (lastPart !== "view" && lastPart !== "watch") {
        if (cleanUrl.includes("/design/")) {
          // Replace the action (edit/publish) with view if present
          cleanUrl = cleanUrl.replace(/\/(edit|publish|watch)$/, "/view");
          if (!cleanUrl.endsWith("/view")) cleanUrl += "/view";
        }
      }
      return `${cleanUrl}?embed`;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 bg-[#050505] border-zinc-800 overflow-hidden flex flex-col gap-0 shadow-2xl">
        <DialogHeader className="p-4 border-b border-zinc-900 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Maximize2 className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold tracking-tight">
                {title}
              </DialogTitle>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
                Visualização ao Vivo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] text-zinc-400 hover:text-white"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
              Abrir Original
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-zinc-950 relative group">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="clipboard-write"
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-none md:pointer-events-auto">
            <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl backdrop-blur-md shadow-2xl text-[11px] text-zinc-400 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="text-amber-500 font-bold uppercase mr-1.5">
                Dica:
              </span>
              Viu um erro 403? Certifique-se que o design no Canva está em
              <span
                className="text-white font-medium ml-1 cursor-help"
                title="Configurações de compartilhamento > Qualquer pessoa com o link pode ver"
              >
                "Público"
              </span>
              .
            </div>
          </div>

          {/* Overlay sutil para indicar carregamento/iframe */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
