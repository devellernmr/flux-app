import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, Smartphone, LogOut } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function SecurityTab() {
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.email) {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: window.location.origin + '/reset-password',
            });

            if (error) {
                toast.error("Erro ao enviar email", {
                    description: error.message,
                });
            } else {
                toast.success("Email enviado!", {
                    description: "Verifique sua caixa de entrada para redefinir a senha.",
                });
            }
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-xl font-bold text-white">Segurança da Conta</CardTitle>
                    </div>
                    <CardDescription>Gerencie sua senha e métodos de autenticação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
                        <div className="space-y-1">
                            <span className="text-sm font-bold text-white block">Redefinir Senha</span>
                            <span className="text-xs text-zinc-500 block">Enviaremos um link para seu email cadastrado.</span>
                        </div>
                        <Button
                            onClick={handlePasswordReset}
                            disabled={loading}
                            variant="outline"
                            className="border-zinc-700 hover:bg-zinc-800 text-white"
                        >
                            {loading ? "Enviando..." : "Enviar Link"}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl opacity-75">
                        <div className="space-y-1">
                            <span className="text-sm font-bold text-white block flex items-center gap-2">
                                Autenticação em 2 Fatores (2FA)
                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-black">Pro</span>
                            </span>
                            <span className="text-xs text-zinc-500 block">Adicione uma camada extra de segurança.</span>
                        </div>
                        <Button disabled variant="outline" className="border-zinc-800 text-zinc-600">
                            Em breve
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-emerald-500" />
                        <CardTitle className="text-xl font-bold text-white">Sessões Ativas</CardTitle>
                    </div>
                    <CardDescription>Gerencie onde sua conta está conectada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-950/30">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                                <Shield className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Este dispositivo</p>
                                <p className="text-xs text-emerald-500 font-medium">Ativo agora</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" disabled>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
