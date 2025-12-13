import { useState } from "react";
import { Calendar, Trash2, Search, Filter, X, AlertTriangle } from "lucide-react";
import type { ItemOutro } from "../../services/outrosService";

interface HistoricoEntregasProps {
  entregas: ItemOutro[];
  isLoading: boolean;
  onExcluir: (id: string) => Promise<void>;
  onLimparHistorico: () => Promise<void>;
}

export const HistoricoEntregas = ({
  entregas,
  isLoading,
  onExcluir,
  onLimparHistorico,
}: HistoricoEntregasProps) => {
  const [busca, setBusca] = useState("");
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);

  // Obter lista única de materiais
  const materiaisUnicos = Array.from(new Set(entregas.map((e) => e.nomeItem))).sort();

  const toggleMaterial = (material: string) => {
    setMateriaisSelecionados((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const limparFiltros = () => {
    setBusca("");
    setMateriaisSelecionados([]);
  };

  const temFiltrosAtivos = busca.length > 0 || materiaisSelecionados.length > 0;

  // Filtrar entregas
  const entregasFiltradas = entregas.filter((entrega) => {
    // Filtro por busca
    if (busca && !entrega.nomeItem.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }

    // Filtro por materiais selecionados
    if (materiaisSelecionados.length > 0 && !materiaisSelecionados.includes(entrega.nomeItem)) {
      return false;
    }

    return true;
  });

  const handleExcluirClick = (id: string) => {
    setIdParaExcluir(id);
    setMostrarConfirmacao(true);
  };

  const confirmarExclusao = async () => {
    if (!idParaExcluir) return;

    setExcluindoId(idParaExcluir);
    try {
      await onExcluir(idParaExcluir);
    } finally {
      setExcluindoId(null);
      setMostrarConfirmacao(false);
      setIdParaExcluir(null);
    }
  };

  const handleLimparHistoricoClick = () => {
    setMostrarConfirmacaoLimpar(true);
  };

  const confirmarLimparHistorico = async () => {
    try {
      await onLimparHistorico();
    } finally {
      setMostrarConfirmacaoLimpar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar material..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
            />
          </div>

          {/* Botão Limpar Histórico */}
          {entregas.length > 0 && (
            <button
              onClick={handleLimparHistoricoClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpar Tudo</span>
              <span className="sm:hidden">Limpar</span>
            </button>
          )}
        </div>

        {/* Botão Filtros Avançados */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-[#1E3A5F] font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {materiaisSelecionados.length > 0 && (
              <span className="px-2 py-0.5 bg-[#1E3A5F] text-white text-xs rounded-full">
                {materiaisSelecionados.length}
              </span>
            )}
          </button>

          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>

        {/* Dropdown de Materiais */}
        {mostrarFiltros && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Selecionar Materiais:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {materiaisUnicos.map((material) => (
                <label
                  key={material}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={materiaisSelecionados.includes(material)}
                    onChange={() => toggleMaterial(material)}
                    className="w-4 h-4 text-[#1E3A5F] rounded focus:ring-[#1E3A5F]"
                  />
                  <span className="text-sm text-gray-700">{material}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {entregasFiltradas.length} {entregasFiltradas.length === 1 ? "registro" : "registros"}
          {temFiltrosAtivos && " encontrado(s)"}
        </span>
      </div>

      {/* Lista de Entregas */}
      {entregasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">
            {temFiltrosAtivos
              ? "Nenhum registro encontrado com os filtros aplicados"
              : "Nenhum registro encontrado"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entregasFiltradas.map((entrega) => (
            <div
              key={entrega.id}
              className="border border-gray-300 rounded-xl bg-white hover:border-gray-400 transition-all hover:shadow-md group"
            >
              <div className="p-4">
                {/* Header: Nome + Botão Excluir */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-base leading-tight flex-1">
                    {entrega.nomeItem}
                  </h3>
                  
                  {/* Botão Excluir */}
                  <button
                    onClick={() => handleExcluirClick(entrega.id!)}
                    disabled={excluindoId === entrega.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                    title="Excluir registro"
                  >
                    {excluindoId === entrega.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Informações em Grid Responsivo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {/* Quantidade */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Quantidade</span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {entrega.quantidadeEntregue}
                    </span>
                  </div>

                  {/* Data */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Data</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-900 text-sm font-medium">
                        {formatarData(entrega.dataEntrega)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observação (se tiver) */}
                {entrega.observacao && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {entrega.observacao}
                    </p>
                  </div>
                )}

                {/* Rodapé com hora do registro */}
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <span className="text-xs text-gray-400">
                    Registrado em {formatarData(entrega.criadoEm)} às {formatarHora(entrega.criadoEm)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Individual */}
      {mostrarConfirmacao && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-600">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir este registro do histórico?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarConfirmacao(false);
                  setIdParaExcluir(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Limpar Histórico */}
      {mostrarConfirmacaoLimpar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Limpar Todo o Histórico
                </h3>
                <p className="text-sm text-gray-600">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir <strong>TODOS</strong> os registros do histórico deste posto?
              <br />
              <span className="text-red-600 font-semibold">
                {entregas.length} {entregas.length === 1 ? "registro será excluído" : "registros serão excluídos"}.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmacaoLimpar(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarLimparHistorico}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
