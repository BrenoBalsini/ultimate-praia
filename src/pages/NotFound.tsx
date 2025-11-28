
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-lg text-gray-600">
        Página não encontrada
      </p>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Voltar ao Dashboard
      </button>
    </div>
  </div>
);
};