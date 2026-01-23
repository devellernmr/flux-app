import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import type { User } from "@/types";

interface ProfileTabProps {
    user: User | null;
    settingsName: string;
    setSettingsName: (val: string) => void;
    settingsAgencyName: string;
    setSettingsAgencyName: (val: string) => void;
    settingsAvatar: string;
    setSettingsAvatar: (val: string) => void;
    isSavingSettings: boolean;
    handleUpdateProfile: () => void;
}

export function ProfileTab({
    user,
    settingsName,
    setSettingsName,
    settingsAgencyName,
    setSettingsAgencyName,
    settingsAvatar,
    setSettingsAvatar,
    isSavingSettings,
    handleUpdateProfile
}: ProfileTabProps) {
    return (
        <Card className="bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Perfil da Agência</CardTitle>
                <CardDescription>Informações visíveis para seus clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <Label className="text-zinc-400">Nome da Agência</Label>
                    <Input
                        value={settingsAgencyName}
                        onChange={(e) => setSettingsAgencyName(e.target.value)}
                        className="bg-black/50 border-zinc-800 focus:ring-blue-500/50 text-white"
                    />
                </div>
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-zinc-800">
                        <AvatarImage src={settingsAvatar} />
                        <AvatarFallback className="bg-zinc-800 text-xl text-zinc-400">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Label className="text-xs text-zinc-400 uppercase">
                            Avatar URL
                        </Label>
                        <Input
                            value={settingsAvatar}
                            onChange={(e) => setSettingsAvatar(e.target.value)}
                            placeholder="https://..."
                            className="bg-zinc-950/50 border-zinc-800 text-sm text-white"
                        />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Nome do Responsável</Label>
                        <Input
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="bg-black/50 border-zinc-800 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Email de Contato</Label>
                        <Input
                            value={user?.email || ""}
                            disabled
                            className="bg-black/50 border-zinc-800 opacity-50 text-white"
                        />
                    </div>
                </div>
                <Button
                    onClick={handleUpdateProfile}
                    disabled={isSavingSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                    {isSavingSettings ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Alterações
                </Button>
            </CardContent>
        </Card>
    );
}
