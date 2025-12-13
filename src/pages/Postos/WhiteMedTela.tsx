import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { FormRegistrarEntrega } from "../../components/Outros/FormRegistrarEntrega";
import { ListaItensAgregados } from "../../components/Outros/ListaItensAgregados";
import { HistoricoEntregas } from "../../components/Outros/HistoricoEntregas";
import { FaltasMaterialB } from "../../components/FaltasMateriais/FaltasMaterialB";
import {
  registrarEntregaWhiteMed,
  obterItensWhiteMedAgregados,
  obterEntregasWhiteMed,
  obterMateriaisWhiteMed,
  excluirEntregaWhiteMed,
  limparHistoricoPostoWhiteMed,
  marcarWhiteMedAusente,
  verificarWhiteMedAusente,
  type ItemWhiteMed,
  type ItemWhiteMedAgregado,
} from "../../services/whiteMedService";
import { resolverFaltaMaterial } from "../../services/faltasService";
import { registrarEventoFaltaMaterial } from "../../services/historicoService";
import { TipoEvento } from "../../types/postos";
import { ArrowLeft, Plus, Package, History, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import type { NumeroPosto } from "../../types/postos";

interface FaltaItem {
  id: string;
  materialNome: string;
  observacaoRegistro?: string;
}

export const WhiteMedTela = () => {
  const { postoNumero } = useParams<{ postoNumero: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<"agregado" | "historico" | "faltas">(
    "agregado"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itensAgregados, setItensAgregados] = useState<ItemWhiteMedAgregado[]>([]);
  const [todosItens, setTodosItens] = useState<string[]>([]);
  const [historicoCompleto, setHistoricoCompleto] = useState<ItemWhiteMed[]>([]);
  const [faltaParaResolver, setFaltaParaResolver] = useState<FaltaItem | null>(null);
  const [reloadFaltas, setReloadFaltas] = useState(0);
  const [whiteMedAusente, setWhiteMedAusente] = useState(false);

  useEffect(() => {
    if (postoNumero) {
      carregarDados();
      carregarStatusAusente();
    }
  }, [postoNumero]);

  const carregarDados = async () => {
    if (!postoNumero) return;

    setIsLoading(true);
    try {
      const [agregados, historico, materiaisCadastrados] = await Promise.all([
        obterItensWhiteMedAgregados(Number(postoNumero)),
        obterEntregasWhiteMed(Number(postoNumero)),
        obterMateriaisWhiteMed(),
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

  const carregarStatusAusente = async () => {
    if (!postoNumero) return;
    
    try {
      const ausente = await verificarWhiteMedAusente(Number(postoNumero));
      setWhiteMedAusente(ausente);
    } catch (error) {
      console.error("Erro ao carregar status ausente:", error);
    }
  };

  const handleToggleAusente = async () => {
    if (!postoNumero) return;

    const novoStatus = !whiteMedAusente;
    const confirmar = window.confirm(
      novoStatus
        ? "Deseja marcar o WhiteMed como AUSENTE neste posto?"
        : "Deseja marcar o WhiteMed como PRESENTE neste posto?"
    );

    if (!confirmar) return;

    try {
      await marcarWhiteMedAusente(Number(postoNumero), novoStatus);
      setWhiteMedAusente(novoStatus);
      toast.success(
        novoStatus 
          ? "WhiteMed marcado como ausente" 
          : "WhiteMed marcado como presente"
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status");
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
      let observacaoFinal = data.observacao;
      if (faltaParaResolver) {
        observacaoFinal = data.observacao
          ? `Resolução de falta: ${data.observacao}`
          : "Resolução de falta";
      }

      await registrarEntregaWhiteMed({
        postoNumero: Number(postoNumero),
        criadoPor: user.email,
        ...data,
        observacao: observacaoFinal,
      });

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
          materialTipoBCategoria: "whitemed",
          observacao: data.observacao,
        });

        toast.success("Falta resolvida e entrega registrada!");
        setFaltaParaResolver(null);
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
    if (!postoNumero) return;

    try {
      await excluirEntregaWhiteMed(id);
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
      await limparHistoricoPostoWhiteMed(Number(postoNumero));
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
                    {`WhiteMed - Posto ${postoNumero}`}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Gestão de entregas e faltas do WhiteMed
                  </p>
                </div>
              </div>

              {/* Botões do Header */}
              <div className="flex items-center gap-2">
                {/* Botão Toggle Ausente/Presente */}
                <button
                  onClick={handleToggleAusente}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    whiteMedAusente
                      ? "bg-gray-500 hover:bg-gray-600 text-white"
                      : "bg-white text-[#1E3A5F] hover:bg-gray-50"
                  }`}
                >
                  {whiteMedAusente ? (
                    <>
                      <EyeOff className="w-5 h-5" />
                      Ausente
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      Presente
                    </>
                  )}
                </button>

                {/* Botão Registrar Entrega */}
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
                key={reloadFaltas}
                postoNumero={Number(postoNumero) as NumeroPosto}
                categoria="whitemed"
                onRealizarEntrega={handleRealizarEntrega}
                onFaltaRegistrada={handleFaltaRegistrada}
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
          categoria="whiteMed"
          materialPreenchido={faltaParaResolver?.materialNome}
        />
      )}
    </div>
  );
};
