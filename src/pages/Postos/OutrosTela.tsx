import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { FormRegistrarEntrega } from "../../components/Outros/FormRegistrarEntrega";
import { ListaItensAgregados } from "../../components/Outros/ListaItensAgregados";
import { HistoricoEntregas } from "../../components/Outros/HistoricoEntregas";
import {
  registrarEntregaOutro,
  obterItensAgregados,
  obterEntregasPosto,
  obterMateriaisOutros,
  type ItemOutro,
  type ItemOutroAgregado,
} from "../../services/outrosService";
import { ArrowLeft, Plus, Package, History } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const OutrosTela = () => {
  const { postoNumero } = useParams<{ postoNumero: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<"agregado" | "historico">(
    "agregado"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itensAgregados, setItensAgregados] = useState<ItemOutroAgregado[]>([]);
  const [todosItens, setTodosItens] = useState<string[]>([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<ItemOutro[]>([]);

  useEffect(() => {
    if (postoNumero) {
      carregarDados();
    }
  }, [postoNumero]);

  const carregarDados = async () => {
    if (!postoNumero) return;

    setIsLoading(true);
    try {
      const [agregados, historico, materiaisCadastrados] = await Promise.all([
        obterItensAgregados(Number(postoNumero)),
        obterEntregasPosto(Number(postoNumero)),
        obterMateriaisOutros(), // ← MUDOU
      ]);

      setItensAgregados(agregados);
      setHistoricoCompleto(historico);
      setTodosItens(materiaisCadastrados); // ← Lista dos 5 materiais cadastrados
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrarEntrega = async (data: {
    nomeItem: string;
    quantidadeEntregue: number;
    dataEntrega: Date;
    observacao?: string;
  }) => {
    if (!postoNumero || !user?.email) return;

    try {
      await registrarEntregaOutro({
        postoNumero: Number(postoNumero),
        criadoPor: user.email,
        ...data,
      });

      await carregarDados();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/postos")}
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                    {`Outros - Posto ${postoNumero}`}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Registro de entregas de materiais diversos
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A5F] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Registrar Entrega
              </button>
            </div>
          </div>
        </div>
        

        {/* Abas */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setAbaAtiva("agregado")}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  abaAtiva === "agregado"
                    ? "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Package className="w-5 h-5" />
                Visão Geral
              </button>
              <button
                onClick={() => setAbaAtiva("historico")}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  abaAtiva === "historico"
                    ? "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <History className="w-5 h-5" />
                Histórico Completo
              </button>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {abaAtiva === "agregado" ? (
              <ListaItensAgregados
                itens={itensAgregados}
                todosItens={todosItens}
                isLoading={isLoading}
              />
            ) : (
              <HistoricoEntregas
                entregas={historicoCompleto}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      {postoNumero && (
        <FormRegistrarEntrega
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleRegistrarEntrega}
          postoNumero={Number(postoNumero)}
        />
      )}
    </div>
  );
};
