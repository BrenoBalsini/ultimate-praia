import { AlertTriangle, Award, Star, Package, FileText, Clock } from 'lucide-react';
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
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhum evento registrado ainda.</p>
      </div>
    );
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'alteracao':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'elogio':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'conceito':
        return <Star className="w-5 h-5 text-purple-600" />;
      case 'cautela':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'solicitacao':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'alteracao':
        return 'border-red-500 bg-red-50';
      case 'elogio':
        return 'border-green-500 bg-green-50';
      case 'conceito':
        return 'border-purple-500 bg-purple-50';
      case 'cautela':
        return 'border-blue-500 bg-blue-50';
      case 'solicitacao':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {historico.map((evento, index) => (
        <div
          key={evento.id + index}
          className={`relative pl-8 pb-4 ${
            index !== historico.length - 1 ? 'border-l-2 border-gray-200' : ''
          }`}
        >
          {/* Ícone */}
          <div className={`absolute left-0 -translate-x-1/2 p-2 rounded-full border-2 ${getColor(evento.tipo)}`}>
            {getIcon(evento.tipo)}
          </div>

          {/* Conteúdo */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 ml-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="font-medium text-gray-900">{evento.descricao}</h4>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {format(evento.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {evento.tipo}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
