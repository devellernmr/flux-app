import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Invite = {
  id: string;
  project_id: string;
  email: string;
  role: string;
  token: string;
  accepted_at: string | null;
};

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadInvite = async () => {
      // Fetch Invite with Project and Owner details
      const { data, error } = await supabase
        .from("team_invites")
        .select(
          `
            *,
            projects (
                name,
                agency_name,
                custom_logo_url,
                owner_id
            )
        `
        )
        .eq("token", token)
        .is("accepted_at", null)
        .maybeSingle();

      if (error || !data) {
        toast.error("Convite inválido ou já utilizado.");
        navigate("/");
        return;
      }

      setInvite(data as any);
      setLoading(false);
    };

    loadInvite();
  }, [token, navigate]);

  const handleAccept = async () => {
    try {
      setAccepting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Você precisa estar logado para aceitar o convite.");
        setAccepting(false);
        return;
      }

      if (!invite) {
        toast.error("Convite inválido ou expirado.");
        setAccepting(false);
        return;
      }

      // 1) Garante que existe uma linha em team_members, sem duplicar
      const { error: memberError } = await supabase.from("team_members").upsert(
        {
          project_id: invite.project_id,
          user_id: user.id,
          role: invite.role ?? "editor",
        },
        {
          onConflict: "project_id,user_id", // nomes das colunas da UNIQUE
          ignoreDuplicates: true, // se sua versão suportar
        }
      );

      if (memberError) throw memberError;

      // 2) Marca convite como aceito
      const { error: updateError } = await supabase
        .from("team_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      if (updateError) throw updateError;

      toast.success("Convite aceito! Você agora faz parte do projeto.");
      navigate(`/project/${invite.project_id}`);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao aceitar convite: " + message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // @ts-ignore
  const project = invite?.projects;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
      <div className="max-w-md w-full space-y-6 p-8 border border-zinc-800 rounded-2xl bg-zinc-900/30 backdrop-blur-xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

        <div className="text-center space-y-2">
          {project?.custom_logo_url && (
            <img
              src={project.custom_logo_url}
              className="h-10 mx-auto mb-4 object-contain"
              alt="Logo"
            />
          )}
          {!project?.custom_logo_url && project?.agency_name && (
            <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">
              {project.agency_name}
            </div>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Convite para Colaborar
          </h1>
          <p className="text-zinc-400">
            Você foi convidado para participar do projeto{" "}
            <span className="text-white font-medium">{project?.name}</span> como{" "}
            <span className="text-white font-medium">{invite?.role}</span>.
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
          >
            {accepting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {accepting ? "Entrando..." : "Aceitar e Participar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
