import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

interface LanguageSelectorProps {
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-10 transition-all duration-300 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 group ${
            compact ? "w-10" : "w-auto px-4 gap-2"
          }`}
        >
          <Globe className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
          {!compact && (
            <>
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">
                {currentLanguage.name}
              </span>
              <span className="sm:hidden text-sm">{currentLanguage.flag}</span>
            </>
          )}
          {compact && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 border-2 border-[#090909] text-[8px] font-black text-white uppercase">
              {currentLanguage.code}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 bg-zinc-950/90 backdrop-blur-xl border-zinc-800/50 shadow-2xl rounded-2xl p-1.5 z-50"
      >
        <div className="px-3 py-2 mb-1">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Selecione o Idioma
          </p>
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
              i18n.language === lang.code
                ? "bg-blue-600/10 text-blue-400 font-bold"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{lang.name}</span>
              <span className="text-[10px] opacity-50 uppercase font-black">
                {lang.code}
              </span>
            </div>
            {i18n.language === lang.code && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
