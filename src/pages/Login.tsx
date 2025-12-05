import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Login com Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error("Erro no Google", { description: error.message });
    setLoading(false);
  };

  // Login/Cadastro com Email
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        toast.error("Erro ao criar conta", { description: error.message });
      } else {
        toast.success("Conta criada!", {
          description: "Verifique seu e-mail ou faça login.",
        });
      }
    } else {
      // Login
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans p-4">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 md:p-8 z-20">
        <img src="/logo.svg" alt="Fluxs Logo" className="h-6 md:h-8 w-auto" />

        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm text-gray-400 hidden sm:inline-block">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[400px] z-10 px-2 sm:px-0 mt-10 md:mt-0">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-normal mb-2 tracking-tight font-[Inter]">
            {isSignUp ? "Create an account." : "Welcome to Fluxs."}
          </h1>
          <p className="text-gray-400">
            {isSignUp
              ? "Start your 7-day free trial."
              : "Please enter your details."}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 bg-transparent border-gray-700 hover:bg-gray-800 text-white mb-6"
          onClick={handleGoogleLogin}
        >
          <Chrome className="mr-2 h-5 w-5" />
          Login with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#050505] px-2 text-gray-500">Or</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="bg-[#0F1216] border-gray-800 focus:ring-blue-600 h-11 text-white placeholder:text-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-[#0F1216] border-gray-800 focus:ring-blue-600 h-11 text-white placeholder:text-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-0"
                />
                <span className="text-gray-400">Remember for 30 days</span>
              </label>
              <a href="#" className="text-gray-400 hover:text-white">
                Forgot password?
              </a>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-6"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
