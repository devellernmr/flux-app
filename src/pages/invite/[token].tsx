import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      const { data, error } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", token)
        .is("accepted_at", null)
        .maybeSingle();

      if (error || !data) {
        toast.error("Convite inválido ou já utilizado.");
        navigate("/");
        return;
      }

      setInvite(data as Invite);
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
      const { error: memberError } = await supabase
        .from("team_members")
        .upsert(
          {
            project_id: invite.project_id,
            user_id: user.id,
            role: invite.role ?? "editor",
          },
          {
            onConflict: "project_id,user_id", // nomes das colunas da UNIQUE
            ignoreDuplicates: true,          // se sua versão suportar
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
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao aceitar convite: " + error.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando convite...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full space-y-4 p-6 border border-zinc-800 rounded-lg bg-zinc-900/50">
        <h1 className="text-xl font-semibold">Convite para projeto</h1>
        <p className="text-sm text-zinc-300">
          Você foi convidado para participar de um projeto no Fluxo com o papel{" "}
          <span className="font-semibold">{invite?.role}</span>.
        </p>
        <Button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full bg-blue-600 hover:bg-blue-500"
        >
          {accepting ? "Aceitando..." : "Aceitar convite"}
        </Button>
      </div>
    </div>
  );
}
