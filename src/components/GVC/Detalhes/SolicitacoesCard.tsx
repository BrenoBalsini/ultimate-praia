import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
      <div className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-700">Sem Solicitações</h3>
            <p className="text-sm text-gray-600">{gvcNome} não possui solicitações registradas.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'parcial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'parcial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="border-l-4 border-orange-500 bg-white rounded-r-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">
            Solicitações ({solicitacoes.length})
          </h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {solicitacoes.map((sol) => (
          <div key={sol.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(sol.status)}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sol.status)}`}>
                  {sol.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {sol.criadaEm && formatDistanceToNow(sol.criadaEm.toDate(), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sol.itens.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`p-2 rounded text-xs ${
                    item.entregue
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <p className="font-medium text-gray-900">{item.item}</p>
                  <p className="text-gray-600">{item.tamanho}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
