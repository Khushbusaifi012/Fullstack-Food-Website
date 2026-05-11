import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";

function PublicOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/menu" replace />;
  return children;
}

export default function App() {
  const { authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface font-sans dark:text-neutral-200">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/menu" element={<DashboardPage />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <SignupPage />
          </PublicOnly>
        }
      />
      <Route path="/dashboard" element={<Navigate to="/menu" replace />} />
      <Route path="/" element={<Navigate to="/menu" replace />} />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
}
