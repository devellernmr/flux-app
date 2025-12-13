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

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  user?: { email: string };
}

interface TeamInvite {
  id: string;
  email: string;
  token: string;
  created_at: string;
}

export function TeamManager({ projectId }: { projectId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, [projectId]);

  const fetchTeamData = async () => {
    try {
      // Busca membros
      const { data: members } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId);

      // Busca convites pendentes
      const { data: pendingInvites } = await supabase
        .from("team_invites")
        .select("*")
        .eq("project_id", projectId)
        .is("accepted_at", null);

      setTeamMembers(members || []);
      setInvites(pendingInvites || []);
    } catch (error) {
      console.error("Erro ao buscar team data:", error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email obrigatório");
      return;
    }

    setIsInviting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Verifica se já é membro
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user?.id);

      if (existingMember?.length) {
        toast.error("Usuário já é membro do projeto");
        setIsInviting(false);
        return;
      }

      const { error } = await supabase.from("team_invites").insert({
        project_id: projectId,
        email: inviteEmail,
        role: "editor",
      });

      if (error) throw error;

      toast.success("Convite enviado com sucesso!");
      setInviteEmail("");
      setShowDialog(false);
      fetchTeamData();
    } catch (error: any) {
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

      toast.success("Membro removido");
      fetchTeamData();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
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
      toast.error("Erro: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Time do Projeto ({teamMembers.length})
        </h3>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"
            >
              <div className="text-xs">
                <p className="text-white font-medium">{member.user?.email || "Email indisponível"}</p>
                <p className="text-zinc-500">
                  <Badge variant="secondary" className="text-[10px] mt-1 bg-zinc-800">
                    {member.role}
                  </Badge>
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-zinc-500 hover:text-red-400 h-8"
                onClick={() => removeMember(member.user_id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Convites Pendentes */}
      {invites.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 uppercase">Convites Pendentes</p>
          {invites.map((invite) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/20"
            >
              <div className="text-xs">
                <p className="text-white flex items-center gap-2">
                  <Mail className="w-3 h-3 text-amber-500" />
                  {invite.email}
                </p>
                <p className="text-zinc-500 text-[10px] mt-1">Aguardando resposta</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-zinc-500 hover:text-blue-400 h-8"
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
                  className="text-zinc-500 hover:text-red-400 h-8"
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
            <DialogTitle className="text-white">Convidar para o Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase block mb-2">Email</label>
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
                {isInviting ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
