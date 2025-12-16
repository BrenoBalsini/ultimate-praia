import { Trash2, Calendar, Clock } from 'lucide-react';
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
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm sm:text-base text-gray-500">
          {mostrarHistorico ? 'Nenhum registro no histórico' : 'Nenhum elogio encontrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const diasRestantes = !mostrarHistorico ? calcularDiasRestantes(item.criadoEm) : null;
        const corDias = diasRestantes !== null
          ? diasRestantes < 30 
            ? 'text-red-700 bg-red-50 border-red-100' 
            : diasRestantes < 90 
            ? 'text-amber-700 bg-amber-50 border-amber-100' 
            : 'text-emerald-700 bg-emerald-50 border-emerald-100'
          : '';

        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-600"
          >
            <div className="p-5">
              {/* Header: Título e Ações */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.titulo}
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

              {/* Data e Dias Restantes */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>{formatarData(item.criadoEm)}</span>
                </div>
                
                {!mostrarHistorico && diasRestantes !== null && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${corDias}`}>
                    <Clock size={14} />
                    <span>{diasRestantes} dias restantes</span>
                  </div>
                )}
              </div>

              {/* Lista de GVCs com badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {item.gvcNomes.map((nome, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md"
                  >
                    {nome}
                  </span>
                ))}
              </div>

              {/* Descrição */}
              {item.descricao && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.descricao}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
