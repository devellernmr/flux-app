import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Login } from "@/pages/Login";
import { Toaster } from "@/components/ui/sonner"; // Importe do Toast
import { Dashboard } from "@/pages/Dashboard";
import { ProjectOverview } from "./pages/ProjectOverview";
import { PublicBriefing } from "@/pages/PublicBriefing";
import { FeedbackView } from "@/pages/FeedbackView";
import { PublicFeedback } from "@/pages/PublicFeedback";


// Dashboard Temporário (Para teste)

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="bg-black text-white h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/project/:id" element={<ProjectOverview />} />
        <Route path="/share/:id" element={<PublicBriefing />} />
        <Route path="/file/:fileId" element={<FeedbackView />} />
        <Route path="/share/design/:fileId" element={<PublicFeedback />} />
      </Routes>
      <Toaster richColors theme="dark" /> {/* Componente que exibe as mensagens */}
    </BrowserRouter>
  );
}

export default App;
