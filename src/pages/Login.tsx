import { useState } from "react";
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
import { LegalModals } from "@/components/LegalModals";
import { useTranslation } from "react-i18next";

export function Login() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const redirect = searchParams.get("redirect") ?? undefined;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });
  };

  const resolveRedirect = () => {
    if (redirect && redirect.startsWith("http")) {
      return redirect;
    }
    return `${window.location.origin}/dashboard`;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const redirectTo = resolveRedirect();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      toast.error(t("login.auth_error_google"), { description: error.message });
    }

    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(t("login.auth_error_signup"), { description: error.message });
        } else {
          toast.success(t("login.auth_success_signup"));
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(t("login.auth_error_signin"), { description: error.message });
        } else {
          const redirectTo = resolveRedirect();
          window.location.href = redirectTo;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen grid lg:grid-cols-2 bg-[#050505] overflow-hidden font-sans text-white selection:bg-blue-500/30">
      {/* LADO ESQUERDO - FORMULÁRIO (Clean & Focus) */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Logo Mobile/Desktop */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">FLUXS.</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-white leading-none">
              {isSignUp ? t("login.title_signup") : t("login.title_signin")}
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              {isSignUp
                ? t("login.subtitle_signup")
                : t("login.subtitle_signin")}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-11 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-300 transition-all"
              onClick={handleGoogleLogin}
            >
              <Chrome className="mr-2 h-4 w-4" /> {t("login.google_login")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#050505] px-2 text-zinc-500">
                  {t("login.email_divider")}
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-400">
                  {t("login.label_email")}
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
                  {t("login.label_password")}
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

              <div className="flex items-start gap-3 py-2">
                <div className="relative flex items-center pt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="peer appearance-none w-4 h-4 bg-zinc-900 border border-zinc-800 rounded checked:bg-blue-600 checked:border-blue-500 transition-all cursor-pointer"
                  />
                  <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5 top-0.5" />
                </div>
                <label htmlFor="terms" className="text-[11px] text-zinc-500 leading-tight cursor-pointer select-none">
                  {t("login.terms_text")}{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
                  >
                    {t("login.terms_link")}
                  </button>{" "}
                  e a{" "}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
                  >
                    {t("login.privacy_link")}
                  </button>.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : isSignUp ? (
                  t("login.btn_signup")
                ) : (
                  t("login.btn_signin")
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4 opacity-70" />}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm text-zinc-500">
            {isSignUp ? t("login.footer_has_account") : t("login.footer_no_account")}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline transition-all"
            >
              {isSignUp ? t("login.link_signin") : t("login.link_signup")}
            </button>
          </div>
        </div>

        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-16 lg:translate-x-0 text-[10px] text-zinc-800 font-bold uppercase tracking-widest pointer-events-none whitespace-nowrap">
          © 2025 Fluxs Inc. All rights reserved.
        </p>
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
            transform: `translate(-50%, -50%) translate(${(mousePosition.x - window.innerWidth / 2) / 20
              }px, ${(mousePosition.y - window.innerHeight / 2) / 20}px)`,
          }}
        />

        {/* DECORATIVE CARD (Representando o Produto) */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="relative z-10 w-[420px] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 overflow-hidden group"
        >
          {/* Header do Card */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/40 border border-red-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/40 border border-green-500/50" />
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-white uppercase tracking-widest leading-none">
              v2.5.0 Stable
            </div>
          </div>

          <div className="space-y-6">
            {/* Linhas de Preview com Mini-Icons */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-2/3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full w-1/2 bg-blue-500/30 blur-sm"
                  />
                </div>
                <div className="h-2 w-1/3 bg-slate-800/50 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-full bg-slate-800 rounded-full" />
                <div className="h-2 w-1/2 bg-slate-800/50 rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-4 opacity-50">
              <div className="h-10 w-10 bg-zinc-500/10 rounded-xl border border-zinc-500/20 flex items-center justify-center text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-3/4 bg-slate-800 rounded-full" />
                <div className="h-2 w-1/4 bg-slate-800/50 rounded-full" />
              </div>
            </div>
          </div>

          {/* Floating Badge (Refinada) */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-2 bottom-8 bg-blue-600 border border-blue-400/30 text-white pl-4 pr-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black tracking-tight"
          >
            <div className="h-6 w-6 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            {t("login.decorative_badge")}
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
      <LegalModals
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        showPrivacy={showPrivacy}
        setShowPrivacy={setShowPrivacy}
      />
    </div>
  );
}
