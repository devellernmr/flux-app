import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, Zap } from "lucide-react";
import { useState } from "react";

export function NotificationsTab() {
    const [emailDigest, setEmailDigest] = useState(true);
    const [projectAlerts, setProjectAlerts] = useState(true);
    const [marketing, setMarketing] = useState(false);

    return (
        <Card className="bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-xl font-bold text-white">Preferências de Notificação</CardTitle>
                </div>
                <CardDescription>Escolha como e quando você quer ser avisado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Email Digest */}
                <div className="flex items-center justify-between space-x-2 py-4 border-b border-zinc-800/50">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Mail className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email-digest" className="text-base font-bold text-white">
                                Resumo Diário por Email
                            </Label>
                            <p className="text-sm text-zinc-500">
                                Receba um resumo matinal com as tarefas e atualizações do dia.
                            </p>
                        </div>
                    </div>
                    <Switch id="email-digest" checked={emailDigest} onCheckedChange={setEmailDigest} />
                </div>

                {/* Project Alerts */}
                <div className="flex items-center justify-between space-x-2 py-4 border-b border-zinc-800/50">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Zap className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="project-alerts" className="text-base font-bold text-white">
                                Atividade do Projeto
                            </Label>
                            <p className="text-sm text-zinc-500">
                                Notificações em tempo real quando: arquivos forem aprovados, rejeitados ou novos comentários.
                            </p>
                        </div>
                    </div>
                    <Switch id="project-alerts" checked={projectAlerts} onCheckedChange={setProjectAlerts} />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Bell className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="marketing" className="text-base font-bold text-white">
                                Dicas e Novidades
                            </Label>
                            <p className="text-sm text-zinc-500">
                                Receba dicas de produtividade e novidades sobre novas features do Fluxs.
                            </p>
                        </div>
                    </div>
                    <Switch id="marketing" checked={marketing} onCheckedChange={setMarketing} />
                </div>

            </CardContent>
        </Card>
    );
}
