import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Mail, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@/types";

interface TeamTabProps {
    currentUser: User | null;
}

export function TeamTab({ currentUser }: TeamTabProps) {
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);

    // Mock initial team data
    const [team, setTeam] = useState([
        {
            id: currentUser?.id || "1",
            name: currentUser?.user_metadata?.full_name || "Você",
            email: currentUser?.email || "seu@email.com",
            role: "Dono",
            avatar: currentUser?.user_metadata?.avatar_url,
            status: "active"
        },
        // We could add dummy members here if we wanted to show a populated list
    ]);

    const handleInvite = () => {
        if (!inviteEmail || !inviteEmail.includes("@")) {
            toast.error("Email inválido", {
                description: "Por favor insira um email válido.",
            });
            return;
        }

        setIsInviting(true);
        // Simulate API call
        setTimeout(() => {
            setTeam(prev => [
                ...prev,
                {
                    id: Math.random().toString(),
                    name: inviteEmail.split("@")[0],
                    email: inviteEmail,
                    role: "Membro",
                    avatar: "",
                    status: "pending"
                }
            ]);
            setInviteEmail("");
            setIsInviting(false);
            toast.success("Convite enviado!", {
                description: `Enviamos um email para ${inviteEmail} entrar no time.`,
            });
        }, 1000);
    };

    const handleRemove = (id: string) => {
        if (id === currentUser?.id) return;
        setTeam(prev => prev.filter(m => m.id !== id));
        toast.info("Membro removido", {
            description: "O acesso foi revogado.",
        });
    }

    return (
        <Card className="bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-xl font-bold text-white">Gerenciamento de Equipe</CardTitle>
                    </div>
                    <CardDescription>Convide membros para colaborar nos seus projetos.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Invite Section */}
                <div className="flex gap-3 items-end bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                    <div className="grid gap-1.5 flex-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                            Convidar novo membro
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="email@exemplo.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="pl-9 bg-zinc-900 border-zinc-800 text-white"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleInvite}
                        disabled={isInviting || !inviteEmail}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    >
                        {isInviting ? "Enviando..." : <><Plus className="h-4 w-4 mr-2" /> Convidar</>}
                    </Button>
                </div>

                {/* Team List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">Membros ({team.length})</h3>
                    <div className="grid gap-3">
                        {team.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-zinc-800">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            {member.name}
                                            {member.status === 'pending' && (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">Pendente</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-zinc-500">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md border ${member.role === 'Dono'
                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                        {member.role}
                                    </span>

                                    {member.id !== currentUser?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(member.id)}
                                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
