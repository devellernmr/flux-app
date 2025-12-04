import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import type { BriefingBlock } from "@/lib/templates";

export function PublicBriefing() {
  const { id } = useParams(); 
  const [briefing, setBriefing] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function fetchBriefing() {
      if (!id) return;
      const { data, error } = await supabase.from('briefings').select('*, projects(name)').eq('id', id).single();
      
      if (error) {
         toast.error("Briefing not found");
         return;
      }
      setBriefing(data);
      
      if (data.content) {
          // Carrega o conteúdo do banco (que já tem a estrutura de blocos)
          setBlocks(data.content);
      }
      setLoading(false);
    }
    fetchBriefing();
  }, [id]);

  const handleInputChange = (index: number, value: string) => {
      const newBlocks = [...blocks];
      newBlocks[index].answer = value; // Salva a resposta dentro do próprio objeto do bloco
      setBlocks(newBlocks);
  };

  const submitBriefing = async () => {
    // Validação simples: checa se tem alguma resposta vazia (opcional)
    // if (blocks.some(b => !b.answer || b.answer.trim() === "")) {
    //     toast.error("Please answer all questions.");
    //     return;
    // }

    setSubmitting(true);
    
    const { error } = await supabase
        .from('briefings')
        .update({ 
            content: blocks, // Salva o array inteiro atualizado com as respostas
            status: 'sent'
        })
        .eq('id', id);

    if (error) {
        toast.error("Error submitting briefing");
    } else {
        setCompleted(true);
        toast.success("Briefing sent successfully!");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white">Loading Briefing...</div>;
  
  if (completed) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="bg-green-500/20 p-6 rounded-full mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-slate-400 max-w-md">
            Your answers have been sent to the design team.
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
            <div className="bg-slate-800 p-2 rounded text-xs font-bold text-slate-300 inline-block mb-4">FLUXO</div>
            <h1 className="text-3xl font-bold">Project Briefing</h1>
            <p className="text-slate-400">for {briefing?.projects?.name}</p>
        </div>

        <Card className="bg-[#0F1216] border-slate-800 text-white">
            <CardHeader>
                <CardTitle>Please answer carefully</CardTitle>
                <CardDescription>These answers will guide the design process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {blocks.map((block: BriefingBlock & { answer?: string }, index) => (
                    <div key={index} className="space-y-3">
                        <label className="block text-base font-medium text-slate-200">
                            <span className="text-blue-500 mr-2">{index + 1}.</span>
                            {block.label}
                        </label>
                        
                        {/* Renderiza o input baseado no TIPO do bloco */}
                        {block.type === 'textarea' ? (
                            <Textarea 
                                placeholder={block.placeholder || "Type your answer here..."}
                                className="bg-[#050505] border-slate-800 min-h-[100px] text-white focus:ring-blue-600"
                                value={block.answer || ''}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                            />
                        ) : block.type === 'select' ? (
                            <select
                                className="w-full bg-[#050505] border border-slate-800 rounded-md p-3 text-white focus:outline-none focus:border-blue-600"
                                value={block.answer || ''}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                            >
                                <option value="" disabled>Select an option...</option>
                                {block.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : block.type === 'upload' ? (
                           <div className="border-2 border-dashed border-slate-800 rounded-lg p-6 text-center hover:bg-slate-900/50 transition-colors cursor-pointer">
                               <UploadCloud className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                               <p className="text-sm text-slate-400">Upload functionality coming soon</p>
                               {/* (Futuramente implementaremos o upload aqui) */}
                           </div>
                        ) : (
                            <Input 
                                type="text"
                                placeholder={block.placeholder || "Type your answer here..."}
                                className="bg-[#050505] border-slate-800 text-white focus:ring-blue-600 h-12"
                                value={block.answer || ''}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-lg mt-8"
                    onClick={submitBriefing}
                    disabled={submitting}
                >
                    {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Submit Briefing
                </Button>
            </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-600">Powered by Fluxs</p>
      </div>
    </div>
  );
}
