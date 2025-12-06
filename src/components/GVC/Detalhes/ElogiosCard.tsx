import { Award, Clock } from 'lucide-react';
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
      <div className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-700">Sem Elogios</h3>
            <p className="text-sm text-gray-600">{gvcNome} ainda não recebeu elogios.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-green-500 bg-white rounded-r-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">
            Elogios ({elogios.length})
          </h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {elogios.map((elog) => (
          <div key={elog.id} className="p-4 hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900 mb-2">{elog.titulo}</h4>
            {elog.descricao && (
              <p className="text-sm text-gray-700 mb-2">{elog.descricao}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
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
