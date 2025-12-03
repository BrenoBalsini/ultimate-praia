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
import { AlteracoesPostoTela } from "./pages/Postos/AlteracoesPostoTela";
import { GlobalToaster } from "./components/ui/GlobalToaster";
import { CautelasPage } from "./pages/Cautelas/CautelasPage";
import { AlteracoesElogiosPage } from "./pages/Alteracoes/AlteracoesElogiosPage";

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

          <Route
            path="/postos/:postoNumero/alteracoes"
            element={
              <ProtectedRoute>
                <AlteracoesPostoTela />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cautelas"
            element={
              <ProtectedRoute>
                <CautelasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/conduta"
            element={
              <ProtectedRoute>
                <AlteracoesElogiosPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalToaster></GlobalToaster>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
