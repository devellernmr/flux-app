import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Send,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [briefingStatus, setBriefingStatus] = useState<
    "empty" | "draft" | "sent" | "approved"
  >("empty");

  // Estado do Briefing (Lista de Perguntas)
  const [questions, setQuestions] = useState<string[]>([""]); // Começa com 1 pergunta vazia
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      const { data: proj, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        navigate("/dashboard");
        return;
      }
      setProject(proj);

      // Busca se já tem briefing salvo
      const { data: brief } = await supabase
        .from("briefings")
        .select("*")
        .eq("project_id", id)
        .single();
      if (brief) {
        setBriefingStatus(brief.status as any);
        if (brief.content && Array.isArray(brief.content)) {
          setQuestions(brief.content.map((q: any) => q.question)); // Simplificação: pegando só o texto
        }
      }
      setLoading(false);
    }
    fetchProject();
  }, [id, navigate]);

  // Adicionar nova pergunta
  const addQuestion = () => setQuestions([...questions, ""]);

  // Atualizar texto da pergunta
  const updateQuestion = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = text;
    setQuestions(newQuestions);
  };

  // Remover pergunta
  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Salvar Briefing no Banco
  const saveBriefing = async () => {
    // Filtra perguntas vazias
    const validQuestions = questions
      .filter((q) => q.trim() !== "")
      .map((q) => ({ question: q, answer: "" }));

    if (validQuestions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta.");
      return;
    }

    // Verifica se já existe para fazer Update ou Insert
    const { data: existing } = await supabase
      .from("briefings")
      .select("id")
      .eq("project_id", id)
      .single();

    let error;
    if (existing) {
      const { error: err } = await supabase
        .from("briefings")
        .update({ content: validQuestions, status: "draft" })
        .eq("id", existing.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("briefings")
        .insert({
          project_id: id,
          content: validQuestions,
          status: "draft",
          template_type: "custom",
        });
      error = err;
    }

    if (error) {
      toast.error("Erro ao salvar briefing");
    } else {
      toast.success("Briefing salvo com sucesso!");
      setBriefingStatus("draft");
      setIsEditing(false);
    }
  };

  const copyLink = async () => {
    const { data } = await supabase
      .from("briefings")
      .select("id")
      .eq("project_id", id)
      .single();

    if (data) {
      const link = `${window.location.origin}/share/${data.id}`;
      navigator.clipboard.writeText(link);
      toast.success("Link copied!", { description: "Send it to your client." });
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0F172A] text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-[#020617]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{project?.name}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  briefingStatus === "approved"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              ></span>
              <p className="text-xs text-slate-400 uppercase">
                {briefingStatus === "empty" ? "Setup Phase" : "Briefing Phase"}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          Project Settings
        </Button>
      </header>

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="briefing" className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800 mb-8">
            <TabsTrigger value="briefing">1. Intelligent Briefing</TabsTrigger>
            <TabsTrigger value="files">2. Files & Feedback</TabsTrigger>
            <TabsTrigger value="delivery">3. Final Delivery</TabsTrigger>
          </TabsList>

          <TabsContent
            value="briefing"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Coluna Principal */}
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                  <CardTitle>Briefing Setup</CardTitle>
                  <CardDescription>
                    Defina as perguntas que seu cliente deve responder.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* MODO VAZIO: Criar novo */}
                  {briefingStatus === "empty" && !isEditing && (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg">
                      <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Briefing Created
                      </h3>
                      <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                        Crie um questionário para formalizar o escopo.
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsEditing(true)}
                      >
                        Create from Scratch
                      </Button>
                    </div>
                  )}

                  {/* MODO EDIÇÃO ou DRAFT */}
                  {(isEditing || briefingStatus === "draft") && (
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <span className="mt-3 text-sm text-slate-500 w-6 font-mono">
                            Q{index + 1}.
                          </span>
                          <Input
                            value={q}
                            onChange={(e) =>
                              updateQuestion(index, e.target.value)
                            }
                            placeholder="Escreva sua pergunta aqui..."
                            className="bg-slate-950 border-slate-800"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(index)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="pt-4 flex justify-between border-t border-slate-800 mt-6">
                        <Button
                          variant="outline"
                          onClick={addQuestion}
                          className="border-dashed border-slate-700 text-slate-400"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                        <Button
                          onClick={saveBriefing}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="mr-2 h-4 w-4" /> Save Briefing
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna Timeline */}
            <div className="space-y-4">
              <Card className="bg-[#020617] border-slate-800 text-white sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <TimelineItem
                    icon={FileText}
                    title="Briefing Created"
                    done={briefingStatus !== "empty"}
                  />
                  <TimelineItem
                    icon={Send}
                    title="Sent to Client"
                    done={
                      briefingStatus === "sent" || briefingStatus === "approved"
                    }
                  />
                  <TimelineItem
                    icon={CheckCircle2}
                    title="Client Approved"
                    done={briefingStatus === "approved"}
                  />

                  {briefingStatus === "draft" && (
                    <div className="pt-4 border-t border-slate-800">
                      <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-semibold"
                      onClick={copyLink}
                      >
                        <Send className="mr-2 h-4 w-4" /> Send to Client
                      </Button>
                      <p className="text-xs text-slate-500 text-center mt-2">
                        Envia link público
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="files"
            className="text-center text-slate-500 py-20"
          >
            Briefing must be approved first.
          </TabsContent>
          <TabsContent
            value="delivery"
            className="text-center text-slate-500 py-20"
          >
            Project not ready.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente auxiliar de Timeline
function TimelineItem({
  icon: Icon,
  title,
  done,
}: {
  icon: any;
  title: string;
  done: boolean;
}) {
  return (
    <div className="flex gap-3 items-center">
      <div
        className={`p-1 rounded-full ${
          done ? "bg-blue-900/30 text-blue-400" : "bg-slate-800 text-slate-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p
        className={`text-sm font-medium ${
          done ? "text-white" : "text-slate-500"
        }`}
      >
        {title}
      </p>
    </div>
  );
}
