import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAdmin } from "@/hooks/useAdmin";

// Lazy-loaded pages for optimized bundle splitting & faster first paint
const LandingPage = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import("@/pages/Login").then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Analytics = lazy(() => import("@/pages/Analytics").then(m => ({ default: m.Analytics })));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ProjectOverview = lazy(() => import("@/pages/ProjectOverview").then(m => ({ default: m.ProjectOverview })));
const PublicBriefing = lazy(() => import("@/pages/PublicBriefing").then(m => ({ default: m.PublicBriefing })));
const FeedbackView = lazy(() => import("@/pages/FeedbackView").then(m => ({ default: m.FeedbackView })));
const PublicFeedback = lazy(() => import("@/pages/PublicFeedback").then(m => ({ default: m.PublicFeedback })));
const InvitePage = lazy(() => import("@/pages/invite/[token]").then(m => ({ default: m.InvitePage })));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("@/pages/TermsOfService").then(m => ({ default: m.TermsOfService })));

import { initTracking, trackPageView } from "@/lib/tracking";
import { useLocation } from "react-router-dom";

// Automated Route Tracking Component
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

// Global Page Fallback Loader
function PageLoadingFallback() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border border-blue-500/20 animate-ping absolute" />
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mt-2">Carregando...</span>
    </div>
  );
}

// ============ PROTECTED ROUTE COMPONENT ============
interface ProtectedRouteProps {
  element: React.ReactElement;
  session: any;
}

const ProtectedRoute = ({ element, session }: ProtectedRouteProps) => {
  return session ? element : <Navigate to="/" replace />;
};

// ============ ADMIN ROUTE COMPONENT ============
interface AdminRouteProps {
  element: React.ReactElement;
  session: any;
}

const AdminRoute = ({ element, session }: AdminRouteProps) => {
  const { isAdmin, loading } = useAdmin();

  if (!session) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="bg-black text-white h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
          Verificando Credenciais...
        </p>
      </div>
    );
  }

  return isAdmin ? element : <Navigate to="/dashboard" replace />;
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
    // Initialize Meta / GA4 pixels
    initTracking();

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
      <RouteTracker />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={<PublicRoute element={<Login />} session={session} />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} session={session} />}
          />
          <Route
            path="/analytics"
            element={<ProtectedRoute element={<Analytics />} session={session} />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute element={<AdminDashboard />} session={session} />
            }
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

          {/* Legal / Compliance */}
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/termos" element={<TermsOfService />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/*Invite */}
          <Route path="/invite/:token" element={<InvitePage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Toast Notifications */}
      <Toaster richColors theme="dark" />
    </BrowserRouter>
  );
}

export default App;

