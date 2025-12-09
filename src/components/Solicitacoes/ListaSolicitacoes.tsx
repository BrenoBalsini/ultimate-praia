import { Package, Clock, User } from 'lucide-react';
import type { Solicitacao } from '../../types/cautelas';

interface ListaSolicitacoesProps {
  solicitacoes: Solicitacao[];
  onRealizarEntrega: (solicitacao: Solicitacao) => void;
}

export const ListaSolicitacoes = ({
  solicitacoes,
  onRealizarEntrega,
}: ListaSolicitacoesProps) => {
  const formatarData = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (solicitacoes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium mb-2">Nenhuma solicitação pendente</p>
        <p className="text-sm text-gray-400">As solicitações criadas aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {solicitacoes.map((solicitacao) => {
        const itensPendentes = solicitacao.itens.filter((item) => !item.entregue);

        if (itensPendentes.length === 0) return null;

        return (
          <div
            key={solicitacao.id}
            className="group bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4 flex-shrink-0" />
                <h3 className="font-bold text-sm truncate">{solicitacao.gvcNome}</h3>
              </div>
              {solicitacao.criadaEm && (
                <div className="flex items-center gap-1.5 text-blue-100 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatarData(solicitacao.criadaEm)}</span>
                </div>
              )}
            </div>

            {/* Itens */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Itens Pendentes
                </span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  {itensPendentes.length}
                </span>
              </div>

              {/* Desktop: Lista simples */}
              <div className="hidden sm:block space-y-1.5 max-h-32 overflow-y-auto">
                {itensPendentes.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="flex-1 truncate">
                      {item.item}
                      {item.tamanho !== '-' && (
                        <span className="text-gray-500 ml-1">({item.tamanho})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile: Lista compacta */}
              <div className="sm:hidden space-y-1.5 max-h-32 overflow-y-auto">
                {itensPendentes.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="flex-1">
                      {item.item}
                      {item.tamanho !== '-' && (
                        <span className="text-gray-500 text-xs ml-1">({item.tamanho})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer com botão */}
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={() => onRealizarEntrega(solicitacao)}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Realizar Entrega
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
