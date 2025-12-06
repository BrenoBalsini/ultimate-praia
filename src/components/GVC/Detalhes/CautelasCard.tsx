import { Clock } from 'lucide-react';
import type { Cautela } from '../../../types/cautelas';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  cautelas: Cautela[];
  gvcNome: string;
}

export const CautelasCard = ({ cautelas, gvcNome }: Props) => {
  const cautelasAtivas = cautelas.filter((c) => c.itensAtivos.length > 0);

  if (cautelasAtivas.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Equipamentos Cautelados</h3>
        <p className="text-sm text-gray-600">{gvcNome} não possui itens cautelados no momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Equipamentos Cautelados
          <span className="ml-2 text-gray-500 font-normal">({cautelasAtivas.length})</span>
        </h3>
      </div>

      <div className="p-6">
        {cautelasAtivas.map((cautela) => (
          <div key={cautela.id} className="mb-6 last:mb-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cautela.itensAtivos.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{item.item}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-white border border-gray-200 text-gray-700">
                        Tam. {item.tamanho}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.condicao === 'Bom'
                          ? 'bg-gray-900 text-white'
                          : item.condicao === 'Regular'
                          ? 'bg-gray-200 text-gray-900'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {item.condicao}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(item.dataEmprestimo.toDate(), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
