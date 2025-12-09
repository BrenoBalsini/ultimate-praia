import { useState } from "react";
import { Calendar, MessageSquare, Search, Filter, X } from "lucide-react";
import type { ItemOutroAgregado } from "../../services/outrosService";

interface ListaItensAgregadosProps {
  itens: ItemOutroAgregado[];
  todosItens: string[];
  isLoading: boolean;
}

export const ListaItensAgregados = ({
  itens,
  todosItens,
  isLoading,
}: ListaItensAgregadosProps) => {
  const [busca, setBusca] = useState("");
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

  // Filtrar itens
  const itensFiltrados = todosItens.filter((nomeItem) => {
    // Filtro por busca
    if (busca && !nomeItem.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }

    // Filtro por materiais selecionados
    if (materiaisSelecionados.length > 0 && !materiaisSelecionados.includes(nomeItem)) {
      return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Carregando itens...</p>
        </div>
      </div>
    );
  }

  const formatarData = (data?: Date) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const itensMap = new Map(itens.map((item) => [item.nomeItem, item]));

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar material..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
          />
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
              {todosItens.map((material) => (
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
          {itensFiltrados.length} {itensFiltrados.length === 1 ? "item" : "itens"}
          {temFiltrosAtivos && " encontrado(s)"}
        </span>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-3">
        {itensFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">
              {temFiltrosAtivos
                ? "Nenhum item encontrado com os filtros aplicados"
                : "Nenhum item cadastrado no sistema"}
            </p>
          </div>
        ) : (
          itensFiltrados.map((nomeItem) => {
            const item = itensMap.get(nomeItem);
            const temEntrega = !!item;

            return (
              <div
                key={nomeItem}
                className={`border rounded-xl transition-all ${
                  temEntrega
                    ? "bg-white border-gray-300 hover:border-gray-400 hover:shadow-md"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="p-4">
                  {/* Nome do Material */}
                  <h3
                    className={`font-bold text-base leading-tight mb-3 ${
                      temEntrega ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {nomeItem}
                  </h3>

                  {/* Dados da Última Entrega ou Estado Vazio */}
                  {temEntrega && item ? (
                    <>
                      {/* Grid de Informações */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Quantidade */}
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Qtd</span>
                          <span className="font-semibold text-gray-900 text-sm">
                            {item.ultimaQuantidade}
                          </span>
                        </div>

                        {/* Data */}
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Data</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-900 text-xs font-medium">
                              {formatarData(item.ultimaData)}
                            </span>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Total</span>
                          <span className="font-semibold text-[#1E3A5F] text-sm">
                            {item.totalEntregue}
                          </span>
                        </div>
                      </div>

                      {/* Observação (se tiver) */}
                      {item.ultimaObservacao && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-start gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 leading-relaxed">
                              {item.ultimaObservacao}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-2">
                      <span className="text-sm text-gray-400 italic">
                        Sem entregas registradas
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
