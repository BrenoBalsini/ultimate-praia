import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { Conceito } from '../../../types/alteracoes';

interface Props {
  conceitos: Conceito[];
  gvcNome: string;
}

export const ConceitosCard = ({ conceitos, gvcNome }: Props) => {
  if (conceitos.length === 0) {
    return (
      <div className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-r-lg">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-semibold text-gray-700">Sem Conceitos</h3>
            <p className="text-sm text-gray-600">{gvcNome} não possui conceitos registrados.</p>
          </div>
        </div>
      </div>
    );
  }

  const positivos = conceitos.filter((c) => c.polaridade === 'Positivo');
  const negativos = conceitos.filter((c) => c.polaridade === 'Negativo');

  return (
    <div className="border-l-4 border-purple-500 bg-white rounded-r-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">
              Conceitos ({conceitos.length})
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              {positivos.length} positivos
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <TrendingDown className="w-4 h-4" />
              {negativos.length} negativos
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conceitos.map((conc) => (
            <div
              key={conc.id}
              className={`p-3 rounded-lg border-2 ${
                conc.polaridade === 'Positivo'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-2">
                {conc.polaridade === 'Positivo' ? (
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h5 className="font-medium text-sm text-gray-900 mb-1">
                    {conc.conceito}
                  </h5>
                  <p className="text-xs text-gray-700">{conc.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
