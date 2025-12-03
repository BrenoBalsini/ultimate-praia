
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Conceito } from '../../types/alteracoes';

interface ListaConceitosProps {
  items: Conceito[];
  onDelete: (item: Conceito) => void;
  onMarcarInserido: (item: Conceito) => void;
  mostrarHistorico?: boolean;
}

export const ListaConceitos = ({
  items,
  onDelete,
  onMarcarInserido,
  mostrarHistorico = false,
}: ListaConceitosProps) => {
  const formatarData = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">
          {mostrarHistorico ? 'Nenhum registro no histórico' : 'Nenhum conceito encontrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isPositivo = item.polaridade === 'Positivo';
        const corBorda = isPositivo ? 'border-green-200' : 'border-red-200';
        const corFundo = isPositivo ? 'bg-green-100' : 'bg-red-100';
        const corTexto = isPositivo ? 'text-green-600' : 'text-red-600';

        return (
          <div
            key={item.id}
            className={`bg-white rounded-lg border-2 ${corBorda} p-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 ${corFundo} rounded-lg`}>
                  {isPositivo ? (
                    <TrendingUp className={corTexto} size={20} />
                  ) : (
                    <TrendingDown className={corTexto} size={20} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.gvcNome}</h3>
                    <span className={`text-xs font-medium ${corTexto}`}>
                      ({item.polaridade})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatarData(item.criadoEm)}</p>
                </div>
              </div>

              {!mostrarHistorico && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onMarcarInserido(item)}
                    className={`px-3 py-1 text-xs font-medium text-white rounded ${
                      isPositivo
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title="Adicionado na Tabela"
                  >
                    Adicionado na Tabela
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Conceito */}
            <div className="mb-3">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                {item.conceito}
              </span>
            </div>

            {/* Descrição */}
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.descricao}</p>

            {/* Autor */}
            {item.criadoPor && (
              <p className="text-xs text-gray-400 mt-3">Por: {item.criadoPor}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
