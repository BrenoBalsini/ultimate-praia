import { Clock } from 'lucide-react';
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Alterações Disciplinares</h3>
        <p className="text-sm text-gray-600">{gvcNome} não possui alterações registradas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Alterações Disciplinares
          <span className="ml-2 text-gray-500 font-normal">({alteracoes.length})</span>
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {alteracoes.map((alt) => (
          <div key={alt.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    alt.tipo === 'Advertência'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    {alt.tipo}
                  </span>
                  {alt.tipo === 'Suspensão' && alt.diasSuspensao && (
                    <span className="text-sm text-gray-600">
                      {alt.diasSuspensao} {alt.diasSuspensao === 1 ? 'dia' : 'dias'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{alt.descricao}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {alt.criadoEm && formatDistanceToNow(alt.criadoEm.toDate(), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500 mb-1">Dias restantes</div>
                <div className="text-2xl font-bold text-gray-900">{alt.diasRestantes}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
