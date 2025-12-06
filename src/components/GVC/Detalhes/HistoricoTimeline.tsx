import { Clock } from 'lucide-react';
import type { EventoHistorico } from '../../../services/gvcDetalhesService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  historico: EventoHistorico[];
}

export const HistoricoTimeline = ({ historico }: Props) => {
  if (historico.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">Nenhum evento registrado ainda.</p>
      </div>
    );
  }

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      alteracao: 'Alteração',
      elogio: 'Elogio',
      conceito: 'Conceito',
      cautela: 'Cautela',
      solicitacao: 'Solicitação',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      {historico.map((evento, index) => (
        <div
          key={evento.id + index}
          className="relative pl-8 pb-6 last:pb-0"
        >
          {/* Linha vertical */}
          {index !== historico.length - 1 && (
            <div className="absolute left-2 top-8 bottom-0 w-px bg-gray-200" />
          )}

          {/* Ponto */}
          <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gray-900 border-4 border-white" />

          {/* Conteúdo */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 ml-4 hover:border-gray-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-900">{evento.descricao}</h4>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {format(evento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {getTypeLabel(evento.tipo)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
