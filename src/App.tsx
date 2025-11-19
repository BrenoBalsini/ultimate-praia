import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './components/ui/provider';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ListarGVC } from './pages/GVC/ListarGVC';
import { NotFound } from './pages/NotFound';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Provider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/gvcs"
              element={
                <ProtectedRoute>
                  <ListarGVC />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
