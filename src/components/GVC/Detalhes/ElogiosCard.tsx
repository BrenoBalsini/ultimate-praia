import { Clock } from 'lucide-react';
import type { Elogio } from '../../../types/alteracoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  elogios: Elogio[];
  gvcNome: string;
}

export const ElogiosCard = ({ elogios, gvcNome }: Props) => {
  if (elogios.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Elogios e Reconhecimentos</h3>
        <p className="text-sm text-gray-600">{gvcNome} ainda não recebeu elogios.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Elogios e Reconhecimentos
          <span className="ml-2 text-gray-500 font-normal">({elogios.length})</span>
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {elogios.map((elog) => (
          <div key={elog.id} className="p-6 hover:bg-gray-50 transition-colors">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">{elog.titulo}</h4>
            {elog.descricao && (
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">{elog.descricao}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {elog.criadoEm && formatDistanceToNow(elog.criadoEm.toDate(), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
