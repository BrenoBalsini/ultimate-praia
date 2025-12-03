import type { Solicitacao } from '../../types/cautelas';

interface ListaSolicitacoesProps {
  solicitacoes: Solicitacao[];
  onRealizarEntrega: (solicitacao: Solicitacao) => void;
}

export const ListaSolicitacoes = ({
  solicitacoes,
  onRealizarEntrega,
}: ListaSolicitacoesProps) => {
  if (solicitacoes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-400 italic">Nenhuma solicitação pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {solicitacoes.map((solicitacao) => {
        const itensPendentes = solicitacao.itens.filter((item) => !item.entregue);

        if (itensPendentes.length === 0) return null;

        return (
          <div
            key={solicitacao.id}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {solicitacao.gvcNome}
                </h3>
                <div className="space-y-1">
                  {itensPendentes.map((item) => (
                    <p key={item.id} className="text-sm text-gray-700">
                      • {item.item} {item.tamanho !== '-' && `(${item.tamanho})`}
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRealizarEntrega(solicitacao)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap"
              >
                Realizar Entrega
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
