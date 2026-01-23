import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, X, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { logProjectActivity } from "@/lib/activity";

interface TeamInvite {
  id: string;
  email: string;
  token: string;
  created_at: string;
}

type MemberColor = "blue" | "pink" | "emerald" | "amber" | "violet";

const MEMBER_COLORS: MemberColor[] = [
  "blue",
  "pink",
  "emerald",
  "amber",
  "violet",
];

const colorMap: Record<MemberColor, { bg: string }> = {
  blue: { bg: "bg-blue-500/60" },
  pink: { bg: "bg-pink-500/60" },
  emerald: { bg: "bg-emerald-500/60" },
  amber: { bg: "bg-amber-500/60" },
  violet: { bg: "bg-violet-500/60" },
};

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  color: MemberColor | null;
  email?: string; // da view
  user?: { email: string };
}

export function TeamManager({ projectId }: { projectId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTeamData = async () => {
    try {
      const { data: members, error: membersError } = await supabase
        .from("team_members_with_email")
        .select("id, user_id, role, color, email")
        .eq("project_id", projectId);

      if (membersError) {
        console.error("Erro ao buscar membros:", membersError);
      }

      const { data: pendingInvites, error: invitesError } = await supabase
        .from("team_invites")
        .select("*")
        .eq("project_id", projectId)
        .is("accepted_at", null);

      if (invitesError) {
        console.error("Erro ao buscar invites:", invitesError);
      }

      setTeamMembers(
        (members || []).map((m) => ({
          ...m,
          color: (m.color as MemberColor | null) ?? "blue",
          user: { email: m.email ?? "" },
        }))
      );
      setInvites(pendingInvites || []);
    } catch (error) {
      console.error("Erro ao buscar team data:", error);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [projectId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email obrigatório");
      return;
    }

    setIsInviting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar logado.");
        setIsInviting(false);
        return;
      }

      const { data: existingInvite, error: inviteErr } = await supabase
        .from("team_invites")
        .select("id")
        .eq("project_id", projectId)
        .eq("email", inviteEmail)
        .is("accepted_at", null);

      if (inviteErr) throw inviteErr;

      if (existingInvite?.length) {
        toast.error("Esse e-mail já tem um convite pendente.");
        setIsInviting(false);
        return;
      }

      const { error } = await supabase.from("team_invites").insert({
        project_id: projectId,
        email: inviteEmail,
        role: "editor",
      });

      if (error) throw error;

      await logProjectActivity({
        projectId,
        content: `Novo convite enviado para ${inviteEmail}`,
        type: "member_add"
      });

      toast.success("Convite criado! Copie o link e envie para a pessoa.");
      setInviteEmail("");
      setShowDialog(false);
      fetchTeamData();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro: " + error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copiado!");
  };

  const removeMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) throw error;

      await logProjectActivity({
        projectId,
        content: `Membro removido do projeto`,
        type: "member_remove"
      });

      toast.success("Membro removido");
      fetchTeamData();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const updateMemberColor = async (memberId: string, color: MemberColor) => {
    const { error } = await supabase
      .from("team_members")
      .update({ color })
      .eq("id", memberId);

    if (error) {
      toast.error("Não foi possível atualizar a cor.");
      return;
    }

    setTeamMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, color } : m))
    );
    toast.success("Cor atualizada.");
  };

  const deleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("team_invites")
        .delete()
        .eq("id", inviteId);

      if (error) throw error;

      toast.success("Convite cancelado");
      fetchTeamData();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-white">
              Time do projeto
            </h3>
          </div>
          <p className="text-[11px] text-zinc-500">
            {teamMembers.length === 0
              ? "Nenhum membro adicionado ainda."
              : `${teamMembers.length} membro${teamMembers.length > 1 ? "s" : ""
              } com acesso a este projeto.`}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white h-8"
          onClick={() => setShowDialog(true)}
        >
          + Convidar
        </Button>
      </div>

      {/* Membros Atuais */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-lg border border-zinc-800"
            >
              {/* ESQUERDA: avatar + email + role */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-zinc-50 ${colorMap[(member.color || "blue") as MemberColor].bg
                    }`}
                >
                  {(member.email || member.user?.email || "??")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-zinc-100 truncate">
                    {member.email || member.user?.email || "Email indisponível"}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0 bg-zinc-800"
                    >
                      {member.role}
                    </Badge>
                  </span>
                </div>
              </div>

              {/* DIREITA: seletor de cor + remover */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {MEMBER_COLORS.map((c) => {
                    const isActive = member.color === c;
                    const { bg } = colorMap[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateMemberColor(member.id, c)}
                        className={`h-4 w-4 rounded-full border border-zinc-700 ${bg} ${isActive
                          ? "ring-2 ring-offset-[1px] ring-offset-zinc-950"
                          : ""
                          }`}
                      />
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-zinc-500 hover:text-red-400 h-8"
                  onClick={() => removeMember(member.user_id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Convites Pendentes */}
      {invites.length > 0 && (
        <div className="space-y-2 mt-6 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Convites pendentes
            </p>
            <span className="text-[11px] text-zinc-500">
              {invites.length} convite{invites.length > 1 ? "s" : ""}
            </span>
          </div>
          {invites.map((invite) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/20"
            >
              <div className="text-xs">
                <p className="text-white flex items-center gap-2">
                  <Mail className="w-3 h-3 text-amber-500" />
                  {invite.email}
                </p>
                <p className="text-zinc-500 text-[10px] mt-1">
                  Aguardando aceite do convite.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-zinc-400 hover:text-blue-400 h-8"
                  onClick={() => copyInviteLink(invite.token)}
                  title="Copiar link de convite"
                >
                  {copiedId === invite.token ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-zinc-400 hover:text-red-400 h-8"
                  onClick={() => deleteInvite(invite.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog de Convite */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0A0A0A] border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Convidar para o Time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase block mb-2">
                Email
              </label>
              <Input
                placeholder="colega@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInvite}
                disabled={isInviting}
                className="flex-1 bg-blue-600 hover:bg-blue-500"
              >
                {isInviting ? "Criando..." : "Criar Convite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
