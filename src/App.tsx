// src/App.tsx

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Login } from "@/pages/Login";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/pages/Dashboard";
import { ProjectOverview } from "@/pages/ProjectOverview";
import { PublicBriefing } from "@/pages/PublicBriefing";
import { FeedbackView } from "@/pages/FeedbackView";
import { PublicFeedback } from "@/pages/PublicFeedback";
import { InvitePage } from "@/pages/invite/[token]";

// ============ PROTECTED ROUTE COMPONENT ============
interface ProtectedRouteProps {
  element: React.ReactElement;
  session: any;
}

const ProtectedRoute = ({ element, session }: ProtectedRouteProps) => {
  return session ? element : <Navigate to="/" replace />;
};

// ============ PUBLIC ROUTE COMPONENT ============
interface PublicRouteProps {
  element: React.ReactElement;
  session: any;
}

const PublicRoute = ({ element, session }: PublicRouteProps) => {
  return !session ? element : <Navigate to="/dashboard" replace />;
};

// ============ MAIN APP COMPONENT ============
function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950 dark:bg-slate-950 text-white h-screen flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-slate-400">Carregando aplicação...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route
          path="/"
          element={<PublicRoute element={<Login />} session={session} />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} session={session} />}
        />

        {/* Overview */}
        <Route
          path="/project/:id"
          element={
            <ProtectedRoute element={<ProjectOverview />} session={session} />
          }
        />

        {/* Public */}
        <Route path="/share/:id" element={<PublicBriefing />} />
        <Route path="/feedback/:fileId" element={<FeedbackView />} />
        <Route path="/share/design/:fileId" element={<PublicFeedback />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/*Invite */}
        <Route path="/invite/:token" element={<InvitePage />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster richColors theme="dark" />
    </BrowserRouter>
  );
}

export default App;
