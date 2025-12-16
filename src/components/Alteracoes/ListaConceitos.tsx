import { Trash2, Calendar } from 'lucide-react';
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
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const obterNomesGVCs = (item: Conceito): string[] => {
    if (item.gvcNomes && Array.isArray(item.gvcNomes)) {
      return item.gvcNomes;
    }
    if ((item as any).gvcNome) {
      return [(item as any).gvcNome];
    }
    return ['GVC não especificado'];
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm sm:text-base text-gray-500">
          {mostrarHistorico ? 'Nenhum registro no histórico' : 'Nenhum conceito encontrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const corBordaLateral = item.polaridade === 'Positivo'
          ? 'border-l-emerald-600'
          : 'border-l-red-600';

        const nomesGVCs = obterNomesGVCs(item);

        return (
          <div
            key={item.id}
            className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow border-l-4 ${corBordaLateral}`}
          >
            <div className="p-5">
              {/* Header: Conceito e Ações */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.conceito}
                </h3>
                
                {/* Ações no canto superior direito (apenas para ativos) */}
                {!mostrarHistorico && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMarcarInserido(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>Inserido na Tabela</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={16} color="black" />
                    </button>
                  </div>
                )}
              </div>

              {/* Badge de Polaridade logo abaixo do conceito */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                  item.polaridade === 'Positivo'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {item.polaridade}
                </span>
              </div>

              {/* Data */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <Calendar size={14} />
                <span>{formatarData(item.criadoEm)}</span>
              </div>

              {/* Lista de GVCs com badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {nomesGVCs.map((nome, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md"
                  >
                    {nome}
                  </span>
                ))}
              </div>

              {/* Descrição */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.descricao || '-'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
