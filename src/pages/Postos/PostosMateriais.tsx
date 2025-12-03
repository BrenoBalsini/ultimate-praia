import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabPostos } from "./TabPostos";
import { TabHistorico } from "./TabHistorico";
import { TabAvisos } from "./TabAvisos";
import { ModalListaMateriaisB } from "./ModalListaMateriaisB";
import { useToast } from "../../hooks/useToast";

export const PostosMateriais = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"postos" | "historico" | "avisos">(
    "postos"
  );
  const [listaMateriaisOpen, setListaMateriaisOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal Lista de Materiais Tipo B */}
      <ModalListaMateriaisB
        open={listaMateriaisOpen}
        onClose={() => setListaMateriaisOpen(false)}
      />

      {/* Header fixo */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ✅ BOTÃO DE TESTE ROXO */}

            {/* Botão Voltar */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Voltar</span>
            </button>

            {/* Título centralizado */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
              Postos e Materiais
            </h1>

            {/* Botão Lista de Materiais (visível apenas na tab Postos) */}
            {activeTab === "postos" ? (
              <div>
                <button
                  onClick={() => setListaMateriaisOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Lista de Materiais
                </button>

                <button
                  onClick={() => {
                    const { success, error, warning } = useToast();
                    success("✅ Material adicionado com sucesso!", "Sucesso");
                    setTimeout(
                      () => warning("⚠️ Falta registrada!", "Aviso"),
                      500
                    );
                    setTimeout(() => error("❌ Erro ao salvar!", "Erro"), 1000);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  🎨 Test Cores
                </button>
              </div>
            ) : (
              <div className="w-32" />
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab("postos")}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === "postos"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Postos
            </button>
            <button
              onClick={() => setActiveTab("historico")}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === "historico"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setActiveTab("avisos")}
              className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                activeTab === "avisos"
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Avisos
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "postos" && <TabPostos />}

        {activeTab === "historico" && <TabHistorico />}

        {activeTab === "avisos" && <TabAvisos />}
      </div>
    </div>
  );
};
