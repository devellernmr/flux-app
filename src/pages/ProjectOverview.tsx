import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, Plus, Trash2, Save, LayoutTemplate, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { BRIEFING_TEMPLATES, type BriefingBlock } from "@/lib/templates";
import { ProjectFiles } from "./ProjectFiles";
import { ProjectActivity } from "@/components/ProjectActivity";

export function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [briefingStatus, setBriefingStatus] = useState<'empty' | 'draft' | 'sent' | 'approved'>('empty');
  const [blocks, setBlocks] = useState<BriefingBlock[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProjectData();
    const channel = supabase.channel('briefing-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'briefings', filter: `project_id=eq.${id}` }, () => {
          toast.info("O cliente atualizou o briefing! 🔔");
          fetchProjectData();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function fetchProjectData() {
    if (!id) return;
    const { data: proj, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) { navigate("/dashboard"); return; }
    setProject(proj);

    const { data: brief } = await supabase.from('briefings').select('*').eq('project_id', id).single();
    if (brief) {
      setBriefingStatus(brief.status as any);
      if (brief.content && brief.content.length > 0) setBlocks(brief.content);
    }
    setLoading(false);
  }

  const loadTemplate = (key: any) => { setBlocks([...BRIEFING_TEMPLATES[key].blocks]); setIsEditing(true); };
  const updateBlock = (i: number, f: any, v: any) => { const n = [...blocks]; n[i] = { ...n[i], [f]: v }; setBlocks(n); };
  const removeBlock = (i: number) => setBlocks(blocks.filter((_, x) => x !== i));
  const addBlock = () => setBlocks([...blocks, { id: Date.now().toString(), type: 'text', label: "" }]);
  
  const saveBriefing = async () => {
    const contentToSave = blocks.map(b => ({ ...b, answer: b.answer || "" }));
    const { data: existing } = await supabase.from('briefings').select('id').eq('project_id', id).single();
    
    let error;
    if (existing) error = (await supabase.from('briefings').update({ content: contentToSave, status: 'draft' }).eq('id', existing.id)).error;
    else error = (await supabase.from('briefings').insert({ project_id: id, content: contentToSave, status: 'draft', template_type: 'custom' })).error;

    if (error) toast.error("Erro ao salvar");
    else { toast.success("Salvo!"); setBriefingStatus('draft'); setIsEditing(false); }
  };

  const copyLink = async () => {
    const { data } = await supabase.from('briefings').select('id').eq('project_id', id).single();
    if (data) {
        navigator.clipboard.writeText(`${window.location.origin}/share/${data.id}`);
        toast.success("Link copiado!");
    }
  };

  const resetBriefing = async () => {
      if(!confirm("Tem certeza? Isso apaga as perguntas atuais e volta para a seleção.")) return;
      await supabase.from('briefings').delete().eq('project_id', id);
      setBlocks([]);
      setBriefingStatus('empty');
      setIsEditing(false);
      toast.success("Resetado!");
  };

  if (loading) return <div className="h-screen bg-[#0F172A] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
      <header className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </Button>
          <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>
          <h1 className="font-semibold text-sm">{project?.name}</h1>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" size="sm" className="h-8 text-xs border-slate-700 bg-transparent hover:bg-slate-800" onClick={copyLink}>
                <ExternalLink className="mr-2 h-3 w-3" /> Briefing Link
             </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
         <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-700">
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="briefing" className="w-full">
                    <TabsList className="bg-slate-900/50 border border-slate-800 mb-8 p-1">
                        <TabsTrigger value="briefing" className="text-xs">Briefing</TabsTrigger>
                        <TabsTrigger value="files" className="text-xs">Arquivos & Design</TabsTrigger>
                    </TabsList>

                    <TabsContent value="briefing">
                        <Card className="bg-slate-900/50 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle>Briefing</CardTitle>
                                <CardDescription>Dados e requisitos do projeto.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* LÓGICA DE EXIBIÇÃO (RESPOSTAS) */}
                                { (briefingStatus === 'sent' || briefingStatus === 'approved') && !isEditing ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-green-900/20 p-4 rounded-lg border border-green-900/50">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">Respondido pelo cliente</h3>
                                                    <p className="text-[10px] text-slate-400">Status: {briefingStatus}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-xs h-7">Editar</Button>
                                        </div>
                                        <div className="space-y-4">
                                            {blocks.map((block: any, index) => (
                                                <div key={block.id} className="border-b border-slate-800 pb-4 last:border-0">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">0{index + 1} — {block.label}</p>
                                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{block.answer || <span className="italic opacity-50">Sem resposta</span>}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    // LÓGICA DE EDIÇÃO OU SELEÇÃO
                                    <div className="space-y-4">
                                        
                                        {/* SELETOR DE TEMPLATES (SÓ APARECE SE EMPTY E NAO EDITANDO) */}
                                        {briefingStatus === 'empty' && !isEditing && (
                                            <div className="space-y-6 py-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-semibold text-white mb-2">Escolha um Template</h3>
                                                    <p className="text-slate-400 text-sm">Estruturas prontas para você não perder tempo.</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries(BRIEFING_TEMPLATES).map(([key, template]) => (
                                                        <button 
                                                            key={key}
                                                            onClick={() => loadTemplate(key as any)}
                                                            className="group relative flex flex-col items-start p-5 border border-slate-800 bg-slate-900/50 rounded-xl hover:bg-slate-800 hover:border-blue-500/50 transition-all text-left"
                                                        >
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className={`p-2 rounded-lg ${key === 'custom' ? 'bg-slate-800 text-slate-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                                                    {key === 'custom' ? <Plus className="h-4 w-4"/> : <LayoutTemplate className="h-4 w-4"/>}
                                                                </div>
                                                                <span className="font-bold text-sm text-slate-200 group-hover:text-white">{template.name}</span>
                                                            </div>
                                                            <span className="text-xs text-slate-500">{template.description}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* EDITOR DE PERGUNTAS (APARECE QUANDO TEM DADOS OU ESTÁ EDITANDO) */}
                                        {(isEditing || briefingStatus === 'draft' || briefingStatus === 'sent') && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                
                                                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                                                    <h3 className="font-medium text-slate-300 text-sm">Editando Perguntas</h3>
                                                    <Button variant="ghost" size="sm" onClick={resetBriefing} className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-7 text-xs">
                                                        <Trash2 className="mr-2 h-3 w-3" /> Resetar Template
                                                    </Button>
                                                </div>

                                                {blocks.map((block, index) => (
                                                    <div key={block.id} className="bg-slate-950 p-4 rounded border border-slate-800 flex gap-3 items-start group">
                                                        <span className="text-xs text-slate-500 pt-3 font-mono">{index+1}.</span>
                                                        <div className="flex-1 space-y-2">
                                                            <Input 
                                                                value={block.label} 
                                                                onChange={(e) => updateBlock(index, 'label', e.target.value)} 
                                                                className="bg-transparent border-none text-sm font-medium focus-visible:ring-0 px-0" 
                                                                placeholder="Sua pergunta aqui..."
                                                            />
                                                            <div className="flex gap-2">
                                                                <select 
                                                                    value={block.type} 
                                                                    onChange={(e) => updateBlock(index, 'type', e.target.value)} 
                                                                    className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
                                                                >
                                                                    <option value="text">Texto Curto</option>
                                                                    <option value="textarea">Texto Longo</option>
                                                                    <option value="select">Seleção</option>
                                                                    <option value="upload">Upload</option>
                                                                </select>
                                                                {block.type === 'select' && (
                                                                    <Input 
                                                                        value={block.options?.join(',') || ''} 
                                                                        onChange={(e) => updateBlock(index, 'options', e.target.value.split(','))} 
                                                                        className="h-6 text-xs bg-slate-900 border-slate-700 w-40" 
                                                                        placeholder="Opções (vírgula)" 
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" onClick={() => removeBlock(index)} className="h-6 w-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                
                                                <div className="flex justify-between pt-4 border-t border-slate-800 mt-6">
                                                    <Button variant="ghost" onClick={addBlock} size="sm" className="text-slate-400 hover:text-white">
                                                        <Plus className="h-4 w-4 mr-2"/> Nova Pergunta
                                                    </Button>
                                                    <Button onClick={saveBriefing} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold">
                                                        <Save className="h-4 w-4 mr-2" /> Salvar Alterações
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="files">
                        <ProjectFiles projectId={id!} />
                    </TabsContent>
                </Tabs>
            </div>
         </main>

         <aside className="w-80 hidden lg:block shrink-0 border-l border-slate-800">
            <ProjectActivity projectId={id!} />
         </aside>
      </div>
    </div>
  );
}
