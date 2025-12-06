import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  disabled?: boolean;
}

const cards: DashboardCard[] = [
  {
    title: "👥 Guarda-Vidas",
    description: "Gerenciar guarda-vidas do sistema",
    icon: "👥",
    route: "/gvcs",
  },
  {
    title: "📍 Postos e Materiais",
    description: "Gerenciar materiais nos postos (guarda-sóis, rádios, etc)",
    icon: "📍",
    route: "/postos",
  },

  {
    title: "⭐ Conduta e Elogios",
    description: "Registrar alterações e elogios de guarda-vidas",
    icon: "⭐",
    route: "/conduta",
  },

  {
    title: "🎒 Cautelas e Solicitações",
    description: "Sistema de empréstimo de equipamentos",
    icon: "🎒",
    route: "/cautelas",
  },

  {
    title: "🚗 Alterações de Veículos",
    description: "Controlar avarias em veículos",
    icon: "🚗",
    route: "/alteracoes-veiculos",
    disabled: true,
  },
  
  {
    title: "📋 Solicitações GVC",
    description: "Gerenciar solicitações dos guarda-vidas",
    icon: "📋",
    route: "/solicitacoes-gvc",
    disabled: true,
  },
];
export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-start gap-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bem-vindo ao Sistema de Gestão
            </h1>
            <p className="text-gray-600">
              Selecione uma funcionalidade abaixo para começar
            </p>
          </div>

          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <button
                key={card.route}
                type="button"
                onClick={() => navigate(card.route)}
                disabled={card.disabled}
                className={
                  card.disabled
                    ? "bg-gray-200 p-6 rounded-lg shadow-md text-left"
                    : "bg-white p-6 rounded-lg shadow-md cursor-pointer transition-transform transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
                }
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <h2 className="text-sm font-semibold mb-2">{card.title}</h2>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
