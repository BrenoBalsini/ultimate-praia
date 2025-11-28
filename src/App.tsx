import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ListarGVC } from "./pages/GVC/ListarGVC";
import { PostosMateriais } from "./pages/Postos/PostosMateriais";
import { NotFound } from "./pages/NotFound";
import { MateriaisATela } from "./pages/Postos/MateriaisATela";
import { FaltasMateriaisTela } from "./pages/Postos/FaltasMateriaisTela";

function App() {
  return (
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

            <Route
              path="/postos"
              element={
                <ProtectedRoute>
                  <PostosMateriais />
                </ProtectedRoute>
              }
            />

            <Route
              path="/postos/:postoNumero/materiais/:tipo"
              element={
                <ProtectedRoute>
                  <MateriaisATela />
                </ProtectedRoute>
              }
            />

            <Route
              path="/postos/:postoNumero/faltas/:categoria"
              element={
                <ProtectedRoute>
                  <FaltasMateriaisTela />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
