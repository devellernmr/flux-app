import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Image as Trash2, FileText, Loader2 } from "lucide-react"; // Adicionei Loader2 e FileText
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ProjectFilesProps {
  projectId: string;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [category, setCategory] = useState("layout");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Novo estado visual

  const categories = [
      { id: 'layout', label: 'Layouts (V1, V2)' },
      { id: 'assets', label: 'Assets (Logos, Fonts)' },
      { id: 'refs', label: 'References' }
  ];

  useEffect(() => {
    fetchFiles();
  }, [projectId, category]);

  const fetchFiles = async () => {
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (data) setFiles(data);
  };

  // Função unificada de Upload (Aceita o arquivo direto)
  const processUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${category}/${Date.now()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('files').insert({ 
          project_id: projectId, 
          url: publicUrl, 
          name: file.name,
          category: category
      });

      if (dbError) throw dbError;
      toast.success("Upload concluído!");
      fetchFiles();
    } catch (error: any) {
      toast.error("Erro no upload", { description: error.message });
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  // Eventos de Drag & Drop
  const onDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processUpload(e.dataTransfer.files[0]);
      }
  }, [category]); // Importante: depende da categoria atual

  // Evento do Input Tradicional
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) processUpload(e.target.files[0]);
  };

  return (
    <div 
        className="space-y-6 min-h-[300px]"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
      
      {/* Header e Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs value={category} onValueChange={setCategory} className="w-full md:w-auto">
            <TabsList className="bg-slate-900 border border-slate-800">
            {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
                    {cat.label}
                </TabsTrigger>
            ))}
            </TabsList>
        </Tabs>

        <div className="relative">
            <input type="file" id="file-upload" className="hidden" onChange={handleInputChange} disabled={uploading} />
            <label htmlFor="file-upload">
                <Button asChild className="bg-white text-slate-900 hover:bg-slate-200 cursor-pointer font-bold" disabled={uploading}>
                    <span>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {uploading ? "Uploading..." : "Upload File"}
                    </span>
                </Button>
            </label>
        </div>
      </div>

      {/* Área de Drop Visual (Aparece só quando arrasta) */}
      {isDragging && (
          <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900 p-6 rounded-xl flex flex-col items-center animate-bounce">
                  <UploadCloud className="h-12 w-12 text-blue-500 mb-2" />
                  <h3 className="text-xl font-bold text-white">Solte para enviar para "{categories.find(c => c.id === category)?.label}"</h3>
              </div>
          </div>
      )}

      {/* Grid de Arquivos */}
      {files.length === 0 ? (
         <div className={`text-center py-16 border-2 border-dashed rounded-xl transition-all ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
             <div className="bg-slate-800 p-4 rounded-full inline-block mb-4">
                 <UploadCloud className="h-8 w-8 text-slate-500" />
             </div>
             <h3 className="text-lg font-medium text-white mb-1">Arraste arquivos aqui</h3>
             <p className="text-slate-400 text-sm">Ou clique no botão de upload acima</p>
         </div>
      ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file) => (
                <div key={file.id} className="group relative bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all">
                    
                    {/* Preview Inteligente */}
                    <div className="aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden">
                        {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={file.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                            <FileText className="h-12 w-12 text-slate-700" />
                        )}
                        
                        {/* Overlay (Só aparece em layouts que podem receber feedback) */}
                        {category === 'layout' && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Link to={`/file/${file.id}`}>
                                    <Button variant="secondary" size="sm" className="h-8 text-xs font-bold">
                                        Abrir Feedback
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="p-3 flex justify-between items-center">
                        <div className="truncate pr-2">
                            <p className="text-xs font-medium text-white truncate" title={file.name}>{file.name}</p>
                            <p className="text-[10px] text-slate-500">{new Date(file.created_at).toLocaleDateString()}</p>
                        </div>
                         {/* Botão de Delete (Opcional, funcionalidade visual por enquanto) */}
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-red-400 h-6 w-6">
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            ))}
         </div>
      )}
    </div>
  );
}
