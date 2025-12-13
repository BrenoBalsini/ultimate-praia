import { Package, Clock, User } from 'lucide-react';
import type { Solicitacao, ItemSolicitado } from '../../types/cautelas';
import type { Timestamp } from 'firebase/firestore';

interface ListaSolicitacoesProps {
  solicitacoes: Solicitacao[];
  onRealizarEntrega: (solicitacao: Solicitacao) => void;
}

// Interface para solicitações agrupadas
interface SolicitacaoAgrupada {
  gvcId: string;
  gvcNome: string;
  solicitacoes: Solicitacao[];
  totalItensPendentes: number;
  dataUltimaSolicitacao: Timestamp | undefined;
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

  // Agrupar solicitações por GVC
  const agruparPorGVC = (solicitacoes: Solicitacao[]): SolicitacaoAgrupada[] => {
    const grupos = new Map<string, SolicitacaoAgrupada>();

    solicitacoes.forEach((solicitacao) => {
      const itensPendentes = solicitacao.itens.filter((item) => !item.entregue);
      
      if (itensPendentes.length === 0) return; // Pular solicitações sem itens pendentes

      const chave = solicitacao.gvcId;

      if (!grupos.has(chave)) {
        grupos.set(chave, {
          gvcId: solicitacao.gvcId,
          gvcNome: solicitacao.gvcNome,
          solicitacoes: [],
          totalItensPendentes: 0,
          dataUltimaSolicitacao: solicitacao.criadaEm,
        });
      }

      const grupo = grupos.get(chave)!;
      grupo.solicitacoes.push(solicitacao);
      grupo.totalItensPendentes += itensPendentes.length;

      // Manter a data mais recente
      if (solicitacao.criadaEm && grupo.dataUltimaSolicitacao) {
        const dataAtual = solicitacao.criadaEm.toDate();
        const dataGrupo = grupo.dataUltimaSolicitacao.toDate();
        
        if (dataAtual > dataGrupo) {
          grupo.dataUltimaSolicitacao = solicitacao.criadaEm;
        }
      } else if (solicitacao.criadaEm && !grupo.dataUltimaSolicitacao) {
        grupo.dataUltimaSolicitacao = solicitacao.criadaEm;
      }
    });

    // Ordenar por data mais recente
    return Array.from(grupos.values()).sort((a, b) => {
      if (!a.dataUltimaSolicitacao || !b.dataUltimaSolicitacao) return 0;
      const dataA = a.dataUltimaSolicitacao.toDate();
      const dataB = b.dataUltimaSolicitacao.toDate();
      return dataB.getTime() - dataA.getTime();
    });
  };

  const solicitacoesAgrupadas = agruparPorGVC(solicitacoes);

  if (solicitacoesAgrupadas.length === 0) {
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
      {solicitacoesAgrupadas.map((grupo) => {
        // Coletar todos os itens pendentes de todas as solicitações do grupo
        const todosItensPendentes: ItemSolicitado[] = [];
        grupo.solicitacoes.forEach((sol) => {
          const itensPendentes = sol.itens.filter((item) => !item.entregue);
          todosItensPendentes.push(...itensPendentes);
        });

        return (
          <div
            key={grupo.gvcId}
            className="group bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4 flex-shrink-0" />
                <h3 className="font-bold text-sm truncate">{grupo.gvcNome}</h3>
              </div>
              {grupo.dataUltimaSolicitacao && (
                <div className="flex items-center gap-1.5 text-blue-100 text-xs mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatarData(grupo.dataUltimaSolicitacao)}</span>
                </div>
              )}
              {grupo.solicitacoes.length > 1 && (
                <div className="mt-1.5 px-2 py-0.5 bg-white/20 rounded text-xs text-white inline-block">
                  {grupo.solicitacoes.length} solicitações
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
                  {grupo.totalItensPendentes}
                </span>
              </div>

              {/* Lista de itens */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {todosItensPendentes.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="flex-1 capitalize">
                      {item.item}
                      {item.tamanho !== '-' && (
                        <span className="text-gray-500 text-xs ml-1">({item.tamanho})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer com botão(s) */}
            <div className="px-4 pb-4 space-y-2">
              {grupo.solicitacoes.length === 1 ? (
                // Uma solicitação - botão único
                <button
                  type="button"
                  onClick={() => onRealizarEntrega(grupo.solicitacoes[0])}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Realizar Entrega
                </button>
              ) : (
                // Múltiplas solicitações - mostrar todas
                <>
                  <p className="text-xs font-medium text-gray-600 mb-2">Escolha qual entregar:</p>
                  {grupo.solicitacoes.map((sol) => {
                    const itensPendentes = sol.itens.filter((item) => !item.entregue);
                    return (
                      <button
                        key={sol.id}
                        type="button"
                        onClick={() => onRealizarEntrega(sol)}
                        className="w-full px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-between"
                      >
                        <span>{formatarData(sol.criadaEm)}</span>
                        <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                          {itensPendentes.length} {itensPendentes.length === 1 ? 'item' : 'itens'}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
