import { Calendar, MessageSquare } from "lucide-react";
import type { ItemOutroAgregado } from "../../services/outrosService";

interface ListaItensAgregadosProps {
  itens: ItemOutroAgregado[];
  todosItens: string[]; // Lista de TODOS os itens do sistema
  isLoading: boolean;
}

export const ListaItensAgregados = ({
  itens,
  todosItens,
  isLoading,
}: ListaItensAgregadosProps) => {
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

  // Criar map para busca rápida
  const itensMap = new Map(itens.map((item) => [item.nomeItem, item]));

  return (
    <div className="space-y-2">
      {todosItens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            Nenhum item cadastrado no sistema
          </p>
        </div>
      ) : (
        todosItens.map((nomeItem) => {
          const item = itensMap.get(nomeItem);
          const temEntrega = !!item;

          return (
            <div
              key={nomeItem}
              className={`border rounded-lg transition-colors ${
                temEntrega
                  ? "bg-white border-gray-300 hover:border-gray-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  {/* Nome do Item */}
                  <div className="flex-1">
                    <span
                      className={`font-semibold ${
                        temEntrega ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {nomeItem}
                    </span>
                  </div>

                  {/* Dados da Última Entrega */}
                  {temEntrega && item ? (
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Qtd:</span>
                        <span className="font-semibold text-gray-900">
                          {item.ultimaQuantidade}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatarData(item.ultimaData)}</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        Total: {item.totalEntregue}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      Sem entregas
                    </span>
                  )}
                </div>

                {/* Observação (se tiver) */}
                {temEntrega && item?.ultimaObservacao && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        {item.ultimaObservacao}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
