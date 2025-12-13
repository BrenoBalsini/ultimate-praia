import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { FormRegistrarEntrega } from "../../components/Outros/FormRegistrarEntrega";
import { ListaItensAgregados } from "../../components/Outros/ListaItensAgregados";
import { HistoricoEntregas } from "../../components/Outros/HistoricoEntregas";
import { FaltasMaterialB } from "../../components/FaltasMateriais/FaltasMaterialB";
import {
  registrarEntregaBolsaAph,
  obterItensBolsaAphAgregados,
  obterEntregasBolsaAph,
  obterMateriaisBolsaAph,
  excluirEntregaBolsaAph,
  limparHistoricoPostoBolsaAph,
  type ItemBolsaAph,
  type ItemBolsaAphAgregado,
} from "../../services/bolsaAphService";
import { resolverFaltaMaterial } from "../../services/faltasService";
import { registrarEventoFaltaMaterial } from "../../services/historicoService";
import { TipoEvento } from "../../types/postos";
import { ArrowLeft, Plus, Package, History, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import type { NumeroPosto } from "../../types/postos";

interface FaltaItem {
  id: string;
  materialNome: string;
  observacaoRegistro?: string;
}

export const BolsaAphTela = () => {
  const { postoNumero } = useParams<{ postoNumero: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<"agregado" | "historico" | "faltas">(
    "agregado"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itensAgregados, setItensAgregados] = useState<ItemBolsaAphAgregado[]>([]);
  const [todosItens, setTodosItens] = useState<string[]>([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<ItemBolsaAph[]>([]);
  const [faltaParaResolver, setFaltaParaResolver] = useState<FaltaItem | null>(null);
  const [reloadFaltas, setReloadFaltas] = useState(0); // ✅ Contador para forçar reload

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
        obterItensBolsaAphAgregados(Number(postoNumero)),
        obterEntregasBolsaAph(Number(postoNumero)),
        obterMateriaisBolsaAph(),
      ]);

      setItensAgregados(agregados);
      setHistoricoCompleto(historico);
      setTodosItens(materiaisCadastrados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
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
      // Se estamos resolvendo uma falta, adicionar contexto
      let observacaoFinal = data.observacao;
      if (faltaParaResolver) {
        observacaoFinal = data.observacao
          ? `Resolução de falta: ${data.observacao}`
          : "Resolução de falta";
      }

      await registrarEntregaBolsaAph({
        postoNumero: Number(postoNumero),
        criadoPor: user.email,
        ...data,
        observacao: observacaoFinal,
      });

      // Se estava resolvendo uma falta, marcar como resolvida
      if (faltaParaResolver) {
        await resolverFaltaMaterial({
          id: faltaParaResolver.id,
          observacaoResolucao: data.observacao,
        });

        await registrarEventoFaltaMaterial({
          tipoEvento: TipoEvento.FALTA_RESOLVIDA,
          postoNumero: Number(postoNumero) as NumeroPosto,
          faltaMaterialId: faltaParaResolver.id,
          materialTipoBNome: faltaParaResolver.materialNome,
          materialTipoBCategoria: "bolsa_aph",
          observacao: data.observacao,
        });

        toast.success("Falta resolvida e entrega registrada!");
        setFaltaParaResolver(null);
        
        // ✅ Forçar reload do componente de faltas
        setReloadFaltas(prev => prev + 1);
      } else {
        toast.success("Entrega registrada com sucesso!");
      }

      await carregarDados();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
      toast.error("Erro ao registrar entrega");
      throw error;
    }
  };

  const handleRealizarEntrega = (falta: FaltaItem) => {
    setFaltaParaResolver(falta);
    setIsFormOpen(true);
  };

  const handleExcluirEntrega = async (id: string) => {
    try {
      await excluirEntregaBolsaAph(id);
      toast.success("Registro excluído com sucesso!");
      await carregarDados();
    } catch (error) {
      console.error("Erro ao excluir entrega:", error);
      toast.error("Erro ao excluir registro");
    }
  };

  const handleLimparHistorico = async () => {
    if (!postoNumero) return;

    try {
      await limparHistoricoPostoBolsaAph(Number(postoNumero));
      toast.success("Histórico limpo com sucesso!");
      await carregarDados();
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
      toast.error("Erro ao limpar histórico");
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFaltaParaResolver(null);
  };

  // ✅ Callback quando uma falta é registrada diretamente
  const handleFaltaRegistrada = () => {
    setReloadFaltas(prev => prev + 1);
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
                    {`Bolsa APH - Posto ${postoNumero}`}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Gestão de entregas e faltas da Bolsa APH
                  </p>
                </div>
              </div>

              {abaAtiva !== "faltas" && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A5F] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Entrega
                </button>
              )}
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
              <button
                onClick={() => setAbaAtiva("faltas")}
                className={`flex-1 px-6 py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  abaAtiva === "faltas"
                    ? "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                Faltas
              </button>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {abaAtiva === "agregado" && (
              <ListaItensAgregados
                itens={itensAgregados}
                todosItens={todosItens}
                isLoading={isLoading}
              />
            )}
            
            {abaAtiva === "historico" && (
              <HistoricoEntregas
                entregas={historicoCompleto}
                isLoading={isLoading}
                onExcluir={handleExcluirEntrega}
                onLimparHistorico={handleLimparHistorico}
              />
            )}
            
            {abaAtiva === "faltas" && postoNumero && (
              <FaltasMaterialB
                key={reloadFaltas} // ✅ Key muda quando resolve falta, forçando re-render
                postoNumero={Number(postoNumero) as NumeroPosto}
                categoria="bolsa_aph"
                onRealizarEntrega={handleRealizarEntrega}
                onFaltaRegistrada={handleFaltaRegistrada} // ✅ Callback para quando registrar falta
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Formulário de Entrega */}
      {postoNumero && (
        <FormRegistrarEntrega
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleRegistrarEntrega}
          postoNumero={Number(postoNumero)}
          categoria="bolsaAph"
          materialPreenchido={faltaParaResolver?.materialNome}
        />
      )}
    </div>
  );
};
