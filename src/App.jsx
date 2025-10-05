import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";

// Import Components
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import Dashboard from "./pages/Dashboard";
import CreateOrder from "./pages/orders/CreateOrder";
import OrderList from "./pages/orders/OrderList";
import PaymentMake from "./pages/payments/PaymentMake";
import PaymentOnline from "./pages/payments/PaymentOnline";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Downloads from "./pages/Downloads";

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import OrderOptions from "./pages/admin/OrderOptions";
import Inventory from "./pages/admin/Inventory";
// Layout
import Sidebar from "./components/layout/Sidebar";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// Public Route Component (for login/signup)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginForm />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignupForm />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/orders/create" element={
        <ProtectedRoute>
          <CreateOrder />
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute>
          <OrderList />
        </ProtectedRoute>
      } />

      <Route path="/payments/make" element={
        <ProtectedRoute>
          <PaymentMake />
        </ProtectedRoute>
      } />

      <Route path="/payments/online" element={
        <ProtectedRoute>
          <PaymentOnline />
        </ProtectedRoute>
      } />

      <Route path="/payments" element={
        <ProtectedRoute>
          <OrderList />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/support" element={
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      } />

      <Route path="/downloads" element={
        <ProtectedRoute>
          <Downloads />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/options" element={
        <ProtectedRoute>
          <OrderOptions />
        </ProtectedRoute>
      } />

      <Route path="/admin/inventory" element={
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      } />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <div>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;