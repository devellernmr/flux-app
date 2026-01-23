import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/50 rounded-lg border border-slate-800 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Lamentamos o inconveniente. Ocorreu um erro inesperado na interface.
                        Nossa equipe foi notificada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = "/"}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            Voltar ao Início
                        </Button>
                        <Button
                            onClick={this.handleReset}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Tentar Novamente
                        </Button>
                    </div>
                    {import.meta.env.DEV && (
                        <div className="mt-8 p-4 bg-black/40 rounded text-left overflow-auto max-w-full text-xs font-mono text-red-400/80 border border-red-900/20">
                            {this.state.error?.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
