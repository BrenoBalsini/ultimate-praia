import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, List, History, AlertTriangle } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { TabPostos } from "./TabPostos";
import { TabHistorico } from "./TabHistorico";
import { TabAvisos } from "./TabAvisos";
import { ModalListaMateriaisB } from "./ModalListaMateriaisB";

export const PostosMateriais = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"postos" | "historico" | "avisos">(
    "postos"
  );
  const [listaMateriaisOpen, setListaMateriaisOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Modal Lista de Materiais Tipo B */}
      <ModalListaMateriaisB
        open={listaMateriaisOpen}
        onClose={() => setListaMateriaisOpen(false)}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Dashboard
        </button>

        {/* Card Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          {/* Título e Botão */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-6 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Postos e Materiais
                </h1>
                <p className="text-blue-100 text-sm">
                  Gestão de equipamentos e inventário
                </p>
              </div>

              {activeTab === "postos" && (
                <button
                  onClick={() => setListaMateriaisOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A5F] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <List className="w-5 h-5" />
                  Lista de Materiais
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("postos")}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "postos"
                    ? "border-[#1E3A5F] text-[#1E3A5F] bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <List className="w-4 h-4" />
                  <span>Postos</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("historico")}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "historico"
                    ? "border-[#1E3A5F] text-[#1E3A5F] bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="w-4 h-4" />
                  <span>Histórico</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("avisos")}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "avisos"
                    ? "border-[#1E3A5F] text-[#1E3A5F] bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Avisos</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo das tabs */}
        <div>
          {activeTab === "postos" && <TabPostos />}
          {activeTab === "historico" && <TabHistorico />}
          {activeTab === "avisos" && <TabAvisos />}
        </div>
      </div>
    </div>
  );
};
