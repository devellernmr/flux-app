import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Chrome,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Login() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Efeito de "Spotlight" sutil que segue o mouse no lado direito
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error("Erro no Google", { description: error.message });
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error)
        toast.error("Erro ao criar conta", { description: error.message });
      else
        toast.success("Conta criada!", {
          description: "Verifique seu e-mail.",
        });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        toast.error("Credenciais inválidas", { description: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-screen grid lg:grid-cols-2 bg-[#050505] overflow-hidden font-sans text-white selection:bg-blue-500/30">
      {/* LADO ESQUERDO - FORMULÁRIO (Clean & Focus) */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Logo Mobile/Desktop */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">FLUXO.</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {isSignUp ? "Comece sua jornada" : "Bem-vindo de volta"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp
                ? "Gerenciamento de projetos inteligente para times modernos."
                : "Insira suas credenciais para acessar o painel."}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-11 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 transition-all"
              onClick={handleGoogleLogin}
            >
              <Chrome className="mr-2 h-4 w-4" /> Continuar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#050505] px-2 text-zinc-500">
                  Ou continue com email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-400">
                  Email corporativo
                </Label>
                <Input
                  type="email"
                  placeholder="nome@empresa.com"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20 h-11 transition-all placeholder:text-zinc-600 text-zinc-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-400">
                  Senha
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20 h-11 transition-all placeholder:text-zinc-600 text-zinc-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : isSignUp ? (
                  "Criar Conta Grátis"
                ) : (
                  "Entrar"
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4 opacity-70" />}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm text-zinc-500">
            {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline transition-all"
            >
              {isSignUp ? "Fazer Login" : "Cadastre-se"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full text-center lg:text-left lg:pl-16 text-[10px] text-zinc-700 font-medium">
          © 2025 Fluxs Inc. Privacidade & Termos.
        </div>
      </div>

      {/* LADO DIREITO - VISUAL (Branding & Vibe) - Só aparece no Desktop */}
      <div
        className="hidden lg:flex relative bg-[#020617] items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* GRID BACKGROUND */}
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-slate-700/[0.05] z-0" />

        {/* SPOTLIGHT EFFECT */}
        <div
          className="absolute w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0 transition-transform duration-200 ease-out"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${
              (mousePosition.x - window.innerWidth / 2) / 20
            }px, ${(mousePosition.y - window.innerHeight / 2) / 20}px)`,
          }}
        />

        {/* DECORATIVE CARD (Representando o Produto) */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="relative z-10 w-[400px] bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/50"
        >
          {/* Fake UI Elements */}
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="space-y-3">
            <div className="h-2 w-2/3 bg-slate-800 rounded animate-pulse" />
            <div className="h-2 w-full bg-slate-800 rounded animate-pulse delay-75" />
            <div className="h-2 w-5/6 bg-slate-800 rounded animate-pulse delay-150" />
          </div>

          {/* Floating Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-6 -bottom-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <CheckCircle2 className="h-4 w-4" /> Projeto Aprovado
          </motion.div>
        </motion.div>

        {/* NOISE TEXTURE OVERLAY */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none z-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </div>
  );
}
