import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, ShieldCheck, FileText } from "lucide-react";

interface LegalModalsProps {
    showTerms: boolean;
    setShowTerms: (show: boolean) => void;
    showPrivacy: boolean;
    setShowPrivacy: (show: boolean) => void;
}

export function LegalModals({
    showTerms,
    setShowTerms,
    showPrivacy,
    setShowPrivacy,
}: LegalModalsProps) {
    return (
        <>
            {/* MODAL: TERMOS DE SERVIÇO */}
            <Dialog open={showTerms} onOpenChange={setShowTerms}>
                <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden rounded-[32px] gap-0">
                    <div className="p-8 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent border-b border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-blue-600/10 rounded-2xl border border-blue-600/20 flex items-center justify-center text-blue-500">
                                <Scale className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white tracking-tight">Termos de Serviço</DialogTitle>
                                <DialogDescription className="text-zinc-500 text-sm">Última atualização: 25 de Janeiro, 2025</DialogDescription>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="max-h-[60vh] p-8 pt-6">
                        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    1. Aceitação dos Termos
                                </h3>
                                <p>Ao acessar e utilizar a plataforma Fluxs., você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    2. Descrição do Serviço
                                </h3>
                                <p>O Fluxs. é uma plataforma de gerenciamento de projetos assistida por inteligência artificial, focada em agências e freelancers. Os recursos incluem geração de briefings, roadmaps, gestão financeira e analytics.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    3. Contas de Usuário
                                </h3>
                                <p>Para usar certos recursos, você deve criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    4. Propriedade Intelectual
                                </h3>
                                <p>Todo o conteúdo, design e tecnologia por trás do Fluxs. são propriedade intelectual da Fluxs Inc. Seus próprios dados de projeto e arquivos carregados permanecem como sua propriedade exclusiva.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    5. Limitação de Responsabilidade
                                </h3>
                                <p>O Fluxs. é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Em nenhum caso a Fluxs Inc. será responsável por quaisquer danos indiretos ou consequentes.</p>
                            </section>
                        </div>
                    </ScrollArea>

                    <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex justify-end">
                        <button
                            onClick={() => setShowTerms(false)}
                            className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* MODAL: POLÍTICA DE PRIVACIDADE */}
            <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
                <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden rounded-[32px] gap-0">
                    <div className="p-8 bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent border-b border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-emerald-600/10 rounded-2xl border border-emerald-600/20 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white tracking-tight">Política de Privacidade</DialogTitle>
                                <DialogDescription className="text-zinc-500 text-sm">Proteção de dados e transparência</DialogDescription>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="max-h-[60vh] p-8 pt-6">
                        <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                            <section className="space-y-3">
                                <h3 className="text-white font-bold">1. Coleta de Informações</h3>
                                <p>Coletamos informações que você nos fornece diretamente (como nome, e-mail e dados de login via Google) e informações geradas pelo uso da plataforma (como logs de atividade e dados de projetos).</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold">2. Uso dos Dados</h3>
                                <p>Utilizamos seus dados para fornecer, manter e melhorar nossos serviços, além de processar pagamentos através de nossos provedores (como Stripe) e enviar comunicações importantes sobre sua conta.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold">3. Compartilhamento de Dados</h3>
                                <p>Não vendemos seus dados para terceiros. O compartilhamento ocorre apenas com parceiros essenciais para o funcionamento do serviço (hospedagem, processamento de pagamento) e quando exigido por lei.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold">4. Segurança da Informação</h3>
                                <p>Implementamos medidas de segurança técnicas e organizacionais robustas para proteger seus dados, incluindo criptografia SSL e autenticação segura via Supabase.</p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-white font-bold">5. Seus Direitos</h3>
                                <p>Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações da sua conta no Fluxs.</p>
                            </section>
                        </div>
                    </ScrollArea>

                    <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex justify-end">
                        <button
                            onClick={() => setShowPrivacy(false)}
                            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors"
                        >
                            Concordo
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
