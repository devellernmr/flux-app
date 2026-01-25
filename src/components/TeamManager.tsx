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
  role: "owner" | "editor" | "viewer" | "partner";
  color: MemberColor | null;
  email?: string; // da view
  user?: { email: string };
}

const roleLabelMap: Record<string, string> = {
  owner: "Gestor",
  editor: "Staff",
  viewer: "Observador",
  partner: "Parceiro",
};

const roleColorMap: Record<string, string> = {
  owner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  editor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  viewer: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  partner: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function TeamManager({ projectId }: { projectId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer" | "partner">("editor");
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
        role: inviteRole,
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
                  <span className="text-xs text-zinc-100 font-bold truncate">
                    {member.email || member.user?.email || "Email indisponível"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md border font-black uppercase tracking-widest ${roleColorMap[member.role] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                      {roleLabelMap[member.role] || member.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* DIREITA: seletor de cor + remover */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
                  {MEMBER_COLORS.map((c) => {
                    const isActive = member.color === c;
                    const { bg } = colorMap[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateMemberColor(member.id, c)}
                        className={`h-3 w-3 rounded-full transition-all hover:scale-125 ${bg} ${isActive
                          ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-950 scale-110"
                          : "opacity-40"
                          }`}
                      />
                    );
                  })}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  onClick={() => removeMember(member.user_id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Convites Pendentes */}
      {invites.length > 0 && (
        <div className="space-y-3 mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Convites Pendentes
            </p>
            <div className="h-4 w-4 bg-amber-500/10 rounded flex items-center justify-center border border-amber-500/20">
              <span className="text-[8px] font-black text-amber-500">{invites.length}</span>
            </div>
          </div>
          {invites.map((invite) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-4 bg-amber-500/[0.03] rounded-2xl border border-amber-500/10 group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-bold text-zinc-200">
                    {invite.email}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
                    Aguardando Confirmação
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-blue-400 hover:border-blue-500/30 rounded-xl transition-all"
                  onClick={() => copyInviteLink(invite.token)}
                >
                  {copiedId === invite.token ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                  onClick={() => deleteInvite(invite.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog de Convite */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-950 border-white/5 rounded-[32px] p-8 max-w-md shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-white tracking-tighter">Convidar Colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                E-mail do convidado
              </label>
              <Input
                placeholder="exemplo@agencia.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 h-12 rounded-2xl px-5 text-white focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                Nível de Acesso
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "editor", label: "Staff" },
                  { id: "partner", label: "Parceiro" },
                  { id: "viewer", label: "Ops." },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setInviteRole(role.id as any)}
                    className={`h-11 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${inviteRole === role.id
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-white/10"
                      }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDialog(false)}
                className="flex-1 h-12 rounded-2xl font-black text-zinc-500 hover:text-white"
              >
                CANCELAR
              </Button>
              <Button
                onClick={handleInvite}
                disabled={isInviting}
                className="flex-1 h-12 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black transition-all active:scale-95"
              >
                {isInviting ? "PROCESSANDO..." : "GERAR CONVITE"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
