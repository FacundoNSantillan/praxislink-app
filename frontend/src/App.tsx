import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { ToastProvider } from "./components/Toast";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PlanPage } from "./pages/PlanPage";
import { EmpresaDashboardPage } from "./pages/empresa/DashboardPage";
import { PublishOfferPage } from "./pages/empresa/PublishOfferPage";
import { CandidatesPage } from "./pages/empresa/CandidatesPage";
import { EmpresaProfilePage } from "./pages/empresa/ProfilePage";
import { EstudianteProfilePage } from "./pages/estudiante/ProfilePage";
import { SearchOffersPage } from "./pages/estudiante/SearchOffersPage";
import { MyApplicationsPage } from "./pages/estudiante/MyApplicationsPage";
import { AgreementsPage } from "./pages/universidad/AgreementsPage";
import { StudentsPage } from "./pages/universidad/StudentsPage";
import { UniversidadProfilePage } from "./pages/universidad/ProfilePage";
import { IconGrid, IconPlus, IconPeople, IconBuilding, IconUser, IconSearch, IconList, IconCap, IconCard } from "./components/icons";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/empresa"
        element={
          <ProtectedRoute role="empresa">
            <AppShell
              roleLabel="empresa"
              navItems={[
                { to: "/empresa", label: "Panel", icon: <IconGrid /> },
                { to: "/empresa/publicar", label: "Publicar oferta", icon: <IconPlus /> },
                { to: "/empresa/postulantes", label: "Postulantes", icon: <IconPeople /> },
                { to: "/empresa/perfil", label: "Perfil de empresa", icon: <IconBuilding /> },
                { to: "/empresa/plan", label: "Mi plan", icon: <IconCard /> },
              ]}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmpresaDashboardPage />} />
        <Route path="publicar" element={<PublishOfferPage />} />
        <Route path="postulantes" element={<CandidatesPage />} />
        <Route path="perfil" element={<EmpresaProfilePage />} />
        <Route path="plan" element={<PlanPage />} />
      </Route>

      <Route
        path="/estudiante"
        element={
          <ProtectedRoute role="estudiante">
            <AppShell
              roleLabel="estudiante"
              navItems={[
                { to: "/estudiante", label: "Mi perfil", icon: <IconUser /> },
                { to: "/estudiante/buscar", label: "Buscar ofertas", icon: <IconSearch /> },
                { to: "/estudiante/postulaciones", label: "Mis postulaciones", icon: <IconList /> },
              ]}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<EstudianteProfilePage />} />
        <Route path="buscar" element={<SearchOffersPage />} />
        <Route path="postulaciones" element={<MyApplicationsPage />} />
      </Route>

      <Route
        path="/universidad"
        element={
          <ProtectedRoute role="universidad">
            <AppShell
              roleLabel="universidad"
              navItems={[
                { to: "/universidad", label: "Panel de convenios", icon: <IconCap /> },
                { to: "/universidad/alumnos", label: "Alumnos en proceso", icon: <IconPeople /> },
                { to: "/universidad/perfil", label: "Perfil de universidad", icon: <IconBuilding /> },
                { to: "/universidad/plan", label: "Mi plan", icon: <IconCard /> },
              ]}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgreementsPage />} />
        <Route path="alumnos" element={<StudentsPage />} />
        <Route path="perfil" element={<UniversidadProfilePage />} />
        <Route path="plan" element={<PlanPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
