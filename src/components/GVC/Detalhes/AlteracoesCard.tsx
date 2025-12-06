import { AlertTriangle, Clock } from 'lucide-react';
import type { Alteracao } from '../../../types/alteracoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  alteracoes: Alteracao[];
  gvcNome: string;
}

export const AlteracoesCard = ({ alteracoes, gvcNome }: Props) => {
  if (alteracoes.length === 0) {
    return (
      <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Sem Alterações</h3>
            <p className="text-sm text-green-700">{gvcNome} não possui alterações registradas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-red-500 bg-white rounded-r-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">
            Alterações ({alteracoes.length})
          </h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {alteracoes.map((alt) => (
          <div key={alt.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alt.tipo === 'Advertência'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {alt.tipo}
                  </span>
                  {alt.tipo === 'Suspensão' && alt.diasSuspensao && (
                    <span className="text-xs text-gray-600">
                      {alt.diasSuspensao} {alt.diasSuspensao === 1 ? 'dia' : 'dias'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{alt.descricao}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {alt.criadoEm && formatDistanceToNow(alt.criadoEm.toDate(), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Dias restantes</p>
                <p className="text-lg font-bold text-gray-900">{alt.diasRestantes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
