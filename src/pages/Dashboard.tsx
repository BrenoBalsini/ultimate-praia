import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { 
  Users, 
  MapPin, 
  Award, 
  Package, 
  Truck, 
  ClipboardList,
  ChevronRight,
  Lock
} from "lucide-react";

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  disabled?: boolean;
  category: 'primary' | 'secondary';
}

const cards: DashboardCard[] = [
  {
    title: "Guarda-Vidas",
    description: "Gerenciamento completo do efetivo operacional",
    icon: <Users className="w-6 h-6" />,
    route: "/gvcs",
    category: 'primary',
  },
  {
    title: "Postos e Materiais",
    description: "Controle de equipamentos e inventário dos postos",
    icon: <MapPin className="w-6 h-6" />,
    route: "/postos",
    category: 'primary',
  },
  {
    title: "Conduta e Elogios",
    description: "Registro de alterações disciplinares e reconhecimentos",
    icon: <Award className="w-6 h-6" />,
    route: "/conduta",
    category: 'primary',
  },
  {
    title: "Cautelas",
    description: "Sistema de empréstimo e devolução de equipamentos",
    icon: <Package className="w-6 h-6" />,
    route: "/cautelas",
    category: 'primary',
  },
  {
    title: "Alterações de Veículos",
    description: "Controle de avarias e manutenção da frota",
    icon: <Truck className="w-6 h-6" />,
    route: "/alteracoes-veiculos",
    category: 'secondary',
    disabled: true,
  },
  {
    title: "Solicitações GVC",
    description: "Gerenciamento de demandas dos guarda-vidas",
    icon: <ClipboardList className="w-6 h-6" />,
    route: "/solicitacoes-gvc",
    category: 'secondary',
    disabled: true,
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();

  const cardsAtivos = cards.filter(c => !c.disabled);
  const cardsDesabilitados = cards.filter(c => c.disabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">


        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {cardsAtivos.map((card) => (
            <button
              key={card.route}
              type="button"
              onClick={() => navigate(card.route)}
              className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#1E3A5F] hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1E3A5F] transition-colors" />
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1E3A5F] transition-colors">
                {card.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {card.description}
              </p>
            </button>
          ))}
        </div>

        {/* Cards Desabilitados (Em Desenvolvimento) */}
        {cardsDesabilitados.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Em Desenvolvimento
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {cardsDesabilitados.map((card) => (
                <div
                  key={card.route}
                  className="bg-gray-50 border-2 border-gray-200 border-dashed rounded-2xl p-6 opacity-60"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">
                      {card.icon}
                    </div>
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>

                  <h2 className="text-lg font-bold text-gray-600 mb-2">
                    {card.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
