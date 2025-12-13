import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Home, LogOut, User } from "lucide-react";

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] shadow-lg border-b-4 border-[#C53030]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-white font-bold text-lg leading-tight">
                Ultimate Praia
              </h1>
              <p className="text-blue-200 text-xs leading-tight">
                Bombeiro Militar SC
              </p>
            </div>
          </button>

          {/* User Info e Logout */}
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-medium">
                {user?.displayName || user?.email}
              </span>
            </div>

            {/* Botão Sair */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C53030] text-white font-semibold text-sm rounded-lg hover:bg-[#9B2C2C] transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
