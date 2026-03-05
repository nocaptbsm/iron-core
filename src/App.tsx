import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GymProvider, useGym } from "@/context/GymContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import Payments from "./pages/Payments";
import Subscriptions from "./pages/Subscriptions";
import Reminders from "./pages/Reminders";
import NotFound from "./pages/NotFound";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

const ProtectedRoute = ({ children, requireGym = false }: { children: JSX.Element, requireGym?: boolean }) => {
  const { session, loading, role, selectedGymId } = useGym();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If a subroute requires a gym to be selected, but the super admin hasn't picked one yet, kick them back to the gateway.
  if (requireGym && role === 'super_admin' && !selectedGymId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { role, selectedGymId } = useGym();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          {role === 'super_admin' && !selectedGymId ? <SuperAdminDashboard /> : <Dashboard />}
        </ProtectedRoute>
      } />
      <Route path="/customers" element={<ProtectedRoute requireGym><Customers /></ProtectedRoute>} />
      <Route path="/add-customer" element={<ProtectedRoute requireGym><AddCustomer /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute requireGym><Payments /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute requireGym><Subscriptions /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute requireGym><Reminders /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <GymProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </GymProvider>
);

export default App;
