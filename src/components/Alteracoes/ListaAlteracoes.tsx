import { Trash2, Calendar, Clock } from 'lucide-react';
import type { Alteracao } from '../../types/alteracoes';

interface ListaAlteracoesProps {
  items: Alteracao[];
  onDelete: (item: Alteracao) => void;
  onMarcarInserido: (item: Alteracao) => void;
  mostrarHistorico?: boolean;
}

export const ListaAlteracoes = ({
  items,
  onDelete,
  onMarcarInserido,
  mostrarHistorico = false,
}: ListaAlteracoesProps) => {
  const formatarData = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const calcularDiasRestantes = (criadoEm: any) => {
    if (!criadoEm) return 365;
    const dataCriacao = criadoEm.toDate ? criadoEm.toDate() : new Date(criadoEm);
    const hoje = new Date();
    const diffMs = hoje.getTime() - dataCriacao.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const restantes = 365 - diffDias;
    return restantes > 0 ? restantes : 0;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-sm sm:text-base text-gray-500">
          {mostrarHistorico ? 'Nenhum registro no histórico' : 'Nenhuma alteração encontrada'}
        </p>
      </div>
    );
  }

  // Cards para mobile e desktop - sempre cards agora!
  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item) => {
        const diasRestantes = !mostrarHistorico ? calcularDiasRestantes(item.criadoEm) : null;
        const corDias = diasRestantes !== null
          ? diasRestantes < 30 
            ? 'text-red-600 bg-red-50' 
            : diasRestantes < 90 
            ? 'text-yellow-600 bg-yellow-50' 
            : 'text-green-600 bg-green-50'
          : '';

        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">
                  {item.gvcNome}
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span>{formatarData(item.criadoEm)}</span>
                </div>
              </div>
              
              {/* Badge de Tipo */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                item.tipo === 'Suspensão' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {item.tipo === 'Suspensão' 
                  ? `Suspensão (${item.diasSuspensao}d)` 
                  : item.tipo}
              </span>
            </div>

            {/* Dias Restantes (apenas para ativos) */}
            {!mostrarHistorico && diasRestantes !== null && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md mb-3 ${corDias}`}>
                <Clock size={14} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">
                  {diasRestantes} dias restantes
                </span>
              </div>
            )}

            {/* Descrição */}
            <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
              {item.descricao || '-'}
            </p>

            {/* Ações (apenas para ativos) */}
            {!mostrarHistorico && (
              <div className="flex flex-col xs:flex-row gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onMarcarInserido(item)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  title="Inserido na Tabela"
                >
                  Inserido na Tabela
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center justify-center gap-2"
                  title="Deletar"
                >
                  <Trash2 size={16} />
                  Deletar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
