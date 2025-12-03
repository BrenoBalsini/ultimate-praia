import { Trash2, Award } from 'lucide-react';
import type { Elogio } from '../../types/alteracoes';

interface ListaElogiosProps {
  items: Elogio[];
  onDelete: (item: Elogio) => void;
  onMarcarInserido: (item: Elogio) => void;
  mostrarHistorico?: boolean;
}

export const ListaElogios = ({
  items,
  onDelete,
  onMarcarInserido,
  mostrarHistorico = false,
}: ListaElogiosProps) => {
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
          {mostrarHistorico ? 'Nenhum registro no histórico' : 'Nenhum elogio encontrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border-2 border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.titulo}</h3>
                <p className="text-xs text-gray-500">{formatarData(item.criadoEm)}</p>
              </div>
            </div>

            {!mostrarHistorico && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onMarcarInserido(item)}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
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

          {/* Descrição */}
          {item.descricao && (
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{item.descricao}</p>
          )}

          {/* GVCs */}
          <div className="flex flex-wrap gap-2">
            {item.gvcNomes.map((nome, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"
              >
                {nome}
              </span>
            ))}
          </div>

          {/* Autor */}
          {item.criadoPor && (
            <p className="text-xs text-gray-400 mt-3">Por: {item.criadoPor}</p>
          )}
        </div>
      ))}
    </div>
  );
};
