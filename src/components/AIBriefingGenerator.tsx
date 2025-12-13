import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Target, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase'; // <--- VERIFIQUE ESTE CAMINHO

interface BriefingResult {
  title: string;
  questions: string[];
}

interface AIBriefingGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  // Esta função recebe o resultado e manda para o pai
  onUse: (data: BriefingResult) => void; 
  initialNiche?: string;
  initialType?: string;
}

export function AIBriefingGenerator({ 
  isOpen, 
  onClose, 
  onUse, 
  initialNiche = '', 
  initialType = '' 
}: AIBriefingGeneratorProps) {
  
  const [niche, setNiche] = useState(initialNiche);
  const [projectType, setProjectType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Atualiza os estados locais quando o modal abre ou as props mudam
  useEffect(() => {
    if (isOpen) {
      setNiche(initialNiche);
      setProjectType(initialType);
      setResult(null); // Reseta resultado anterior ao abrir
      setError(null);
    }
  }, [isOpen, initialNiche, initialType]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!niche || !projectType) {
      setError("Por favor, preencha ambos os campos.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-briefing', {
        body: { niche, projectType }
      });

      if (error) throw error;

      // Validação de segurança para garantir que o formato veio certo
      if (data && data.title && Array.isArray(data.questions)) {
        setResult(data);
      } else {
        throw new Error("Formato de resposta inválido da IA");
      }

    } catch (err: any) {
      console.error("Erro ao gerar:", err);
      setError(err.message || "Falha ao conectar com a IA.");
    } finally {
      setLoading(false);
    }
  };

  // A FUNÇÃO QUE FALTAVA
  const handleUseBriefing = () => {
    if (result) {
      onUse(result); // Envia os dados para o formulário pai
      onClose();     // Fecha o modal
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Assistente de Briefing
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" />
                Tipo de Projeto
              </label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="Ex: Landing Page"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                Nicho do Cliente
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ex: Odontologia"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Botão Gerar */}
          <button
            onClick={handleGenerate}
            disabled={loading || !niche || !projectType}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Estratégia...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Briefing Automático
              </>
            )}
          </button>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-bottom-2">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-white text-sm border-b border-zinc-800 pb-2">
                  {result.title}
                </h4>
                
                <div className="space-y-2">
                  {result.questions.map((q, i) => (
                    <div key={i} className="flex gap-3 text-sm text-zinc-300">
                      <span className="text-zinc-600 font-mono text-xs pt-0.5">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* O BOTÃO QUE FUNCIONA */}
              <button
                onClick={handleUseBriefing}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700 flex items-center justify-center gap-2"
              >
                Usar neste Projeto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
