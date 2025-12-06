import { Clock } from 'lucide-react';
import type { Solicitacao } from '../../../types/cautelas';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  solicitacoes: Solicitacao[];
  gvcNome: string;
}

export const SolicitacoesCard = ({ solicitacoes, gvcNome }: Props) => {
  if (solicitacoes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Solicitações de Equipamentos</h3>
        <p className="text-sm text-gray-600">{gvcNome} não possui solicitações registradas.</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'parcial':
        return 'Parcial';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Solicitações de Equipamentos
          <span className="ml-2 text-gray-500 font-normal">({solicitacoes.length})</span>
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {solicitacoes.map((sol) => (
          <div key={sol.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                sol.status === 'concluida'
                  ? 'bg-gray-900 text-white'
                  : sol.status === 'parcial'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-200 text-gray-900'
              }`}>
                {getStatusLabel(sol.status)}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {sol.criadaEm && formatDistanceToNow(sol.criadaEm.toDate(), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {sol.itens.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`p-3 rounded-lg border text-xs ${
                    item.entregue
                      ? 'bg-gray-50 border-gray-900'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <p className="font-semibold text-gray-900 mb-1">{item.item}</p>
                  <p className="text-gray-600">Tam. {item.tamanho}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
