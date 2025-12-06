import type { Conceito } from '../../../types/alteracoes';

interface Props {
  conceitos: Conceito[];
  gvcNome: string;
}

export const ConceitosCard = ({ conceitos, gvcNome }: Props) => {
  if (conceitos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Conceitos e Avaliações</h3>
        <p className="text-sm text-gray-600">{gvcNome} não possui conceitos registrados.</p>
      </div>
    );
  }

  const positivos = conceitos.filter((c) => c.polaridade === 'Positivo');
  const negativos = conceitos.filter((c) => c.polaridade === 'Negativo');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Conceitos e Avaliações
            <span className="ml-2 text-gray-500 font-normal">({conceitos.length})</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-600">
              {positivos.length} positivos
            </span>
            <span className="text-gray-600">
              {negativos.length} negativos
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conceitos.map((conc) => (
            <div
              key={conc.id}
              className={`p-4 rounded-lg border ${
                conc.polaridade === 'Positivo'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="text-sm font-semibold text-gray-900">
                      {conc.conceito}
                    </h5>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      conc.polaridade === 'Positivo'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {conc.polaridade}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{conc.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
