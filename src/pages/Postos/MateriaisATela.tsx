import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  History,
  X,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "../../components/Navbar";
import type {
  NumeroPosto,
  TipoMaterialA,
  StatusMaterialA,
} from "../../types/postos";
import {
  getMateriaisAByPostoAndTipo,
  addMaterialA,
  updateMaterialAStatus,
  devolverMaterialA,
  deletarMaterialA,
  type MaterialADoc,
} from "../../services/materiaisAService";
import {
  registrarEventoMaterialA,
  buscarHistorico,
  type HistoricoDoc,
} from "../../services/historicoService";
import { TipoEvento } from "../../types/postos";
import {
  formatarLabelMaterial,
  formatarDataMaterial,
} from "../../utils/formatarDataMaterial";

const LABEL_POR_TIPO: Record<TipoMaterialA, string> = {
  binoculo: "Binóculo",
  guardassol: "Guarda-sol",
  radio: "Rádio",
};

const ICONE_POR_TIPO: Record<TipoMaterialA, string> = {
  binoculo: "🔭",
  guardassol: "☂️",
  radio: "📻",
};

const COR_STATUS: Record<StatusMaterialA, string> = {
  ausente: "bg-gray-200 text-gray-700",
  ok: "bg-emerald-100 text-emerald-800",
  avaria: "bg-yellow-100 text-yellow-800",
  quebrado: "bg-red-100 text-red-800",
};

interface EventoAgrupado {
  chave: string;
  titulo: string;
  icone: string;
  eventos: HistoricoDoc[];
}

interface TimelineEventoProps {
  evento: HistoricoDoc;
  isLast: boolean;
}

const TimelineEvento = ({ evento, isLast }: TimelineEventoProps) => {
  const tipoTexto = () => {
    const mapa: Record<string, string> = {
      material_a_adicionado: "Material adicionado",
      material_a_avaria: "Marcado como avaria",
      material_a_quebrado: "Marcado como quebrado",
      material_a_resolvido: "Resolvido (OK)",
      material_a_devolvido: "Material devolvido",
      material_a_deletado: "Material deletado",
    };
    return mapa[evento.tipo] || evento.tipo;
  };

  const corBolinha = () => {
    if (evento.tipo.includes("resolvid")) return "bg-emerald-500";
    if (evento.tipo.includes("adicionad")) return "bg-blue-500";
    if (evento.tipo.includes("avaria")) return "bg-yellow-500";
    if (evento.tipo.includes("quebrado")) return "bg-red-500";
    if (evento.tipo.includes("devolvido")) return "bg-gray-500";
    if (evento.tipo.includes("deletado")) return "bg-red-600";
    return "bg-gray-400";
  };

  const data = new Date(evento.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const temObservacao =
    evento.observacao &&
    typeof evento.observacao === "string" &&
    evento.observacao.trim().length > 0;

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${corBolinha()} ring-4 ring-white flex-shrink-0 mt-1.5`}
        />
        {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
      </div>

      <div className="flex-1 pb-6">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 group-hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {tipoTexto()}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {data}
            </div>
          </div>

          {temObservacao && (
            <p
              className="text-xs text-gray-700 mt-2 leading-relaxed break-words overflow-hidden"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              {evento.observacao}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface TimelineCardProps {
  grupo: EventoAgrupado;
}

const TimelineCard = ({ grupo }: TimelineCardProps) => {
  const [expandido, setExpandido] = useState(true);

  const eventoRecente = grupo.eventos[0];
  const dataRecente = new Date(eventoRecente.createdAt).toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{grupo.icone}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {grupo.titulo}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-600">
                  {grupo.eventos.length} evento
                  {grupo.eventos.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">
                  Última atualização: {dataRecente}
                </span>
              </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight
              className={`w-5 h-5 transition-transform ${
                expandido ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {expandido && (
        <div className="p-6 pt-4">
          {grupo.eventos.map((evento, index) => (
            <TimelineEvento
              key={evento.id || `evento-${index}-${evento.createdAt}`}
              evento={evento}
              isLast={index === grupo.eventos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ModalConfirmacaoProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  tipo: "deletar" | "acao";
  onConfirm: (observacao: string) => void;
  onCancel: () => void;
  temObservacao?: boolean;
  observacao?: string;
  setObservacao?: (value: string) => void;
}

const ModalConfirmacao = ({
  isOpen,
  titulo,
  mensagem,
  tipo,
  onConfirm,
  onCancel,
  temObservacao,
  observacao = "",
  setObservacao,
}: ModalConfirmacaoProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(observacao);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`px-6 py-5 rounded-t-2xl ${
              tipo === "deletar"
                ? "bg-gradient-to-r from-red-600 to-red-700"
                : "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{titulo}</h3>
              <button
                onClick={onCancel}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
              {mensagem}
            </p>

            {temObservacao && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Observação (opcional)
                </label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao?.(e.target.value)}
                  placeholder="Adicione detalhes sobre esta ação..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] resize-none"
                />
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${
                tipo === "deletar"
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  : "bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:from-[#2C5282] hover:to-[#1E3A5F]"
              }`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

type ModalConfig = {
  titulo: string;
  mensagem: string;
  tipo: "deletar" | "acao";
  temObservacao: boolean;
  onConfirm: (observacao: string) => Promise<void> | void;
};

export const MateriaisATela = () => {
  const navigate = useNavigate();
  const params = useParams<{ postoNumero: string; tipo: string }>();

  const postoNumero = Number(params.postoNumero) as NumeroPosto;
  const tipo = params.tipo as TipoMaterialA;

  const [materiais, setMateriais] = useState<(MaterialADoc & { id: string })[]>(
    []
  );
  const [todosEventos, setTodosEventos] = useState<HistoricoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [observacaoModal, setObservacaoModal] = useState("");

  const titulo = `${LABEL_POR_TIPO[tipo] ?? "Material"}`;
  const icone = ICONE_POR_TIPO[tipo] ?? "📦";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dados = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
        // ✅ Ordena por data (número agora é timestamp)
        dados.sort((a, b) => b.numero - a.numero); // Mais recente primeiro
        setMateriais(dados);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(postoNumero) && tipo) {
      load();
    }
  }, [postoNumero, tipo]);

  useEffect(() => {
    const loadHistorico = async () => {
      try {
        setLoadingHistorico(true);
        const eventos = await buscarHistorico();

        const eventosFiltrados = eventos.filter(
          (evento) =>
            evento.postoNumero === postoNumero && evento.materialATipo === tipo
        );

        setTodosEventos(eventosFiltrados);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoadingHistorico(false);
      }
    };

    if (!isNaN(postoNumero) && tipo) {
      loadHistorico();
    }
  }, [postoNumero, tipo]);

  const eventosAgrupados = useMemo(() => {
    const grupos: Record<string, EventoAgrupado> = {};

    todosEventos.forEach((evento) => {
      if (evento.materialANumero) {
        const chave = `material-${tipo}-${evento.materialANumero}`;

        if (!grupos[chave]) {
          grupos[chave] = {
            chave,
            // ✅ Usa função para formatar com data
            titulo: formatarLabelMaterial(tipo, evento.materialANumero),
            icone: ICONE_POR_TIPO[tipo],
            eventos: [],
          };
        }

        grupos[chave].eventos.push(evento);
      }
    });

    Object.values(grupos).forEach((grupo) => {
      grupo.eventos.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return Object.values(grupos).sort((a, b) => {
      const dataA = new Date(a.eventos[0].createdAt).getTime();
      const dataB = new Date(b.eventos[0].createdAt).getTime();
      return dataB - dataA;
    });
  }, [todosEventos, tipo]);

  const recarregar = async () => {
    const dados = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
    dados.sort((a, b) => b.numero - a.numero);
    setMateriais(dados);

    const eventos = await buscarHistorico();
    const eventosFiltrados = eventos.filter(
      (evento) =>
        evento.postoNumero === postoNumero && evento.materialATipo === tipo
    );
    setTodosEventos(eventosFiltrados);
  };

  const abrirModal = (config: ModalConfig) => {
    setModalConfig(config);
    setObservacaoModal("");
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalConfig(null);
    setObservacaoModal("");
  };

  const handleAdicionar = () => {
    abrirModal({
      titulo: `Adicionar ${LABEL_POR_TIPO[tipo]}`,
      mensagem: `Deseja adicionar um novo ${LABEL_POR_TIPO[tipo]} ao Posto ${postoNumero}?`,
      tipo: "acao",
      temObservacao: true,
      onConfirm: async (obsDigitada) => {
        try {
          setAdding(true);
          const obsTexto = obsDigitada.trim();
          const obs = obsTexto.length > 0 ? obsTexto : undefined;

          fecharModal();

          const id = await addMaterialA({ postoNumero, tipo, observacao: obs });

          const lista = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
          const material = lista.find((m) => m.id === id);
          const numero = material?.numero ?? Date.now();

          await registrarEventoMaterialA({
            tipoEvento: TipoEvento.MATERIAL_A_ADICIONADO,
            postoNumero,
            materialAId: id,
            materialATipo: tipo,
            materialANumero: numero,
            observacao: obs,
          });

          await recarregar();
        } catch (error) {
          console.error("Erro ao adicionar material:", error);
        } finally {
          setAdding(false);
        }
      },
    });
  };

  const handleMudarStatus = (id: string, status: StatusMaterialA) => {
    const statusLabel = {
      ausente: "Ausente",
      avaria: "Avaria",
      quebrado: "Quebrado",
      ok: "OK (Resolvido)",
    }[status];

    abrirModal({
      titulo: `Marcar como ${statusLabel}`,
      mensagem: `Deseja marcar este material como ${statusLabel}?`,
      tipo: "acao",
      temObservacao: true,
      onConfirm: async (obsDigitada) => {
        try {
          const obsTexto = obsDigitada.trim();
          const obs = obsTexto.length > 0 ? obsTexto : undefined;

          fecharModal();

          await updateMaterialAStatus({ id, status, observacao: obs });

          const lista = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
          const material = lista.find((m) => m.id === id);
          if (material) {
            let tipoEvento: (typeof TipoEvento)[keyof typeof TipoEvento];

            if (status === "avaria") {
              tipoEvento = TipoEvento.MATERIAL_A_AVARIA;
            } else if (status === "quebrado") {
              tipoEvento = TipoEvento.MATERIAL_A_QUEBRADO;
            } else {
              tipoEvento = TipoEvento.MATERIAL_A_RESOLVIDO;
            }

            await registrarEventoMaterialA({
              tipoEvento,
              postoNumero,
              materialAId: id,
              materialATipo: tipo,
              materialANumero: material.numero,
              observacao: obs,
            });
          }

          await recarregar();
        } catch (error) {
          console.error("Erro ao atualizar material:", error);
        }
      },
    });
  };

  const handleDevolver = (id: string) => {
    abrirModal({
      titulo: "Devolver Material",
      mensagem: "Deseja registrar a devolução deste material?",
      tipo: "acao",
      temObservacao: true,
      onConfirm: async (obsDigitada) => {
        try {
          const obsTexto = obsDigitada.trim();
          const obs = obsTexto.length > 0 ? obsTexto : undefined;

          fecharModal();

          await devolverMaterialA({ id, observacao: obs });

          const lista = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
          const material = lista.find((m) => m.id === id);
          if (material) {
            await registrarEventoMaterialA({
              tipoEvento: TipoEvento.MATERIAL_A_DEVOLVIDO,
              postoNumero,
              materialAId: id,
              materialATipo: tipo,
              materialANumero: material.numero,
              observacao: obs,
            });
          }

          await recarregar();
        } catch (error) {
          console.error("Erro ao devolver material:", error);
        }
      },
    });
  };

  const handleDeletar = (id: string, numero: number) => {
    abrirModal({
      titulo: "Deletar Material Permanentemente",
      // ✅ Mostra data no modal de deletar
      mensagem: `Tem certeza que deseja DELETAR o ${formatarLabelMaterial(
        tipo,
        numero
      )}?\n\n⚠️ Esta ação não pode ser desfeita!\n\nO material será removido permanentemente do sistema, mas o histórico será preservado para registro.`,
      tipo: "deletar",
      temObservacao: true,
      onConfirm: async (obsDigitada) => {
        try {
          const obsTexto = obsDigitada.trim();
          const obs = obsTexto.length > 0 ? obsTexto : undefined;

          fecharModal();

          await registrarEventoMaterialA({
            tipoEvento: TipoEvento.MATERIAL_A_DELETADO,
            postoNumero,
            materialAId: id,
            materialATipo: tipo,
            materialANumero: numero,
            observacao: obs,
          });

          await deletarMaterialA(id);
          await recarregar();
        } catch (error) {
          console.error("Erro ao deletar material:", error);
          alert("Erro ao deletar material. Tente novamente.");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/postos")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Postos
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl">{icone}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {titulo} - Posto {postoNumero}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Gerenciamento de equipamentos
                  </p>
                </div>
              </div>

              <button
                onClick={handleAdicionar}
                disabled={adding}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A5F] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                <Plus className="w-5 h-5" />
                {adding
                  ? "Adicionando..."
                  : `Adicionar ${LABEL_POR_TIPO[tipo]}`}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Equipamentos Cadastrados
            </h2>

            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Carregando materiais...</p>
              </div>
            ) : materiais.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-3xl">{icone}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum {LABEL_POR_TIPO[tipo]} cadastrado
                </h3>
                <p className="text-gray-600 text-sm">
                  Clique em "Adicionar" para registrar o primeiro equipamento
                </p>
              </div>
            ) : (
              materiais.map((material, index) => (
                <div
                  key={material.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-5 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* ✅ MUDANÇA: Mostra índice + 1 */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {formatarLabelMaterial(
                            material.tipo,
                            material.numero
                          )}
                        </h3>
                        <span
                          className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            COR_STATUS[material.status]
                          }`}
                        >
                          {material.status === "ok"
                            ? "OK"
                            : material.status === "avaria"
                            ? "Avaria"
                            : material.status === "quebrado"
                            ? "Quebrado"
                            : "Ausente"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleDeletar(material.id, material.numero)
                      }
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                      title="Deletar permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {material.observacao && (
                    <div className="mb-3 flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p
                        className="text-xs text-blue-900 leading-relaxed break-words overflow-hidden"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {material.observacao}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleMudarStatus(material.id, "avaria")}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                    >
                      Avaria
                    </button>
                    <button
                      onClick={() => handleMudarStatus(material.id, "quebrado")}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    >
                      Quebrado
                    </button>
                    <button
                      onClick={() => handleMudarStatus(material.id, "ok")}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => handleDevolver(material.id)}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                    >
                      Devolver
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Timeline de Eventos
              </h2>
              <button
                onClick={() => setMostrarHistorico(!mostrarHistorico)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {mostrarHistorico ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {mostrarHistorico && (
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {loadingHistorico ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="mx-auto mb-3 w-10 h-10 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">
                      Carregando histórico...
                    </p>
                  </div>
                ) : eventosAgrupados.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Nenhum evento registrado ainda
                    </p>
                  </div>
                ) : (
                  eventosAgrupados.map((grupo) => (
                    <TimelineCard key={grupo.chave} grupo={grupo} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalConfig && (
        <ModalConfirmacao
          isOpen={modalAberto}
          titulo={modalConfig.titulo}
          mensagem={modalConfig.mensagem}
          tipo={modalConfig.tipo}
          onConfirm={(obs) => modalConfig.onConfirm(obs)}
          onCancel={fecharModal}
          temObservacao={modalConfig.temObservacao}
          observacao={observacaoModal}
          setObservacao={setObservacaoModal}
        />
      )}
    </div>
  );
};
