import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PublicBriefing() {
  const { id } = useParams(); 
  const [briefing, setBriefing] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function fetchBriefing() {
      if (!id) return;
      const { data, error } = await supabase.from('briefings').select('*, projects(name)').eq('id', id).single();
      if (error) {
         console.error(error); // Log erro no console para debug
         setLoading(false); // Para de carregar mesmo com erro
         return;
      }
      setBriefing(data);
      if (data.content) {
          // Inicializa respostas vazias, mas respeita se já tiver algo salvo (opcional)
          setAnswers(new Array(data.content.length).fill(""));
      }
      setLoading(false);
    }
    fetchBriefing();
  }, [id]);

  const submitBriefing = async () => {
    if (answers.some(a => a.trim() === "")) {
        toast.error("Please answer all questions.");
        return;
    }

    setSubmitting(true);
    
    const finalContent = briefing.content.map((item: any, index: number) => ({
        question: item.question,
        answer: answers[index]
    }));

    const { error } = await supabase
        .from('briefings')
        .update({ 
            content: finalContent,
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
  
  if (!briefing) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white">Briefing not found.</div>;

  if (completed) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="bg-green-500/20 p-6 rounded-full mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-slate-400 max-w-md">
            Your answers have been sent to the design team. We will start working on your project immediately.
        </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
            <img src="/logo.svg" className="h-8 w-auto mx-auto mb-6 opacity-50" alt="Logo" />
            <h1 className="text-3xl font-bold">Project Briefing</h1>
            <p className="text-slate-400">for {briefing?.projects?.name}</p>
        </div>

        <Card className="bg-[#0F1216] border-slate-800 text-white">
            <CardHeader>
                <CardTitle>Please answer carefully</CardTitle>
                <CardDescription>These answers will guide the entire design process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {briefing.content.map((item: any, index: number) => (
                    <div key={index} className="space-y-3">
                        <label className="block text-base font-medium text-slate-200">
                            <span className="text-blue-500 mr-2">{index + 1}.</span>
                            {item.question}
                        </label>
                        <Textarea 
                            placeholder="Type your answer here..."
                            className="bg-[#050505] border-slate-800 min-h-[100px] text-white focus:ring-blue-600"
                            value={answers[index]}
                            onChange={(e) => {
                                const newAns = [...answers];
                                newAns[index] = e.target.value;
                                setAnswers(newAns);
                            }}
                        />
                    </div>
                ))}

                <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-lg"
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
