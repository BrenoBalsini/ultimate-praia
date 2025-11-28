import { signInWithGoogle } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            Gerenciamento de Praia
          </h1>
          <p className="text-gray-600">
            Sistema para Bombeiros Militares
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Entrar com Google
        </button>

        <p className="text-sm text-gray-500 text-center">
          Faça login com sua conta do Google para acessar o sistema
        </p>
      </div>
    </div>
  </div>
);
};