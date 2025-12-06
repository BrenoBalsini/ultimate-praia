import { Package, Clock } from 'lucide-react';
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
      <div className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-700">Sem Cautelas Ativas</h3>
            <p className="text-sm text-gray-600">{gvcNome} não possui itens cautelados no momento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-blue-500 bg-white rounded-r-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Cautelas Ativas ({cautelasAtivas.length})
          </h3>
        </div>
      </div>

      <div className="p-4">
        {cautelasAtivas.map((cautela) => (
          <div key={cautela.id} className="mb-4 last:mb-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cautela.itensAtivos.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{item.item}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-white text-gray-700">
                          {item.tamanho}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.condicao === 'Bom'
                            ? 'bg-green-100 text-green-800'
                            : item.condicao === 'Regular'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.condicao}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3" />
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
