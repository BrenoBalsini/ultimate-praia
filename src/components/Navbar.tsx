import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


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
    <div className="bg-blue-600 px-6 py-4 shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">🏖️ Gestão de Praia</h2>

        <div className="flex items-center gap-4">
          <div className="text-white text-sm">
            {user?.displayName || user?.email}
          </div>
          <button
            className="px-4 py-1.5 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-blue-600 text-sm transition-colors"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};
