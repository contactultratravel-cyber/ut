import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPage from './pages/auth/VerifyPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientsPage from './pages/clients/ClientsPage';
import TicketsPage from './pages/tickets/TicketsPage';
import HotelsPage from './pages/hotels/HotelsPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import UsersPage from './pages/users/UsersPage';
import InvitationsPage from './pages/invitations/InvitationsPage';
import BonPage from './pages/bon/BonPage';
import BonArchivePage from './pages/bon/BonArchivePage';
import DossiersPage from './pages/dossiers/DossiersPage';
import VisaAccordePage from './pages/visa/VisaAccordePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/verify"   element={<VerifyPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clients"    element={<ClientsPage />} />
        <Route path="tickets"    element={<TicketsPage />} />
        <Route path="hotels"     element={<HotelsPage />} />
        <Route path="statistics"  element={<StatisticsPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="bon"         element={<BonPage />} />
        <Route path="bon-archive" element={<BonArchivePage />} />
        <Route path="dossiers"    element={<DossiersPage />} />
        <Route path="visa-accorde" element={<VisaAccordePage />} />
        <Route path="users"       element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
