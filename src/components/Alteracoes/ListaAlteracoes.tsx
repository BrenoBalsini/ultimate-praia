import { Trash2, Check, AlertCircle } from 'lucide-react';
import type { Alteracao } from '../../types/alteracoes';

interface ListaAlteracoesProps {
  items: Alteracao[];
  onDelete: (item: Alteracao) => void;
  onMarcarInserido: (item: Alteracao) => void;
  mostrarHistorico?: boolean;
}

export const ListaAlteracoes = ({
  items,
  onDelete,
  onMarcarInserido,
  mostrarHistorico = false,
}: ListaAlteracoesProps) => {
  const formatarData = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const calcularDiasRestantes = (criadoEm: any) => {
    if (!criadoEm) return 365;
    const dataCriacao = criadoEm.toDate ? criadoEm.toDate() : new Date(criadoEm);
    const hoje = new Date();
    const diffMs = hoje.getTime() - dataCriacao.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const restantes = 365 - diffDias;
    return restantes > 0 ? restantes : 0;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">
          {mostrarHistorico ? 'Nenhum registro no histórico' : 'Nenhuma alteração encontrada'}
        </p>
      </div>
    );
  }

  if (mostrarHistorico) {
    // Visualização simplificada para histórico (sem tabela)
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{item.gvcNome}</h3>
              <span className="text-xs text-gray-500">{formatarData(item.criadoEm)}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">
                {item.tipo}{item.tipo === 'Suspensão' && ` (${item.diasSuspensao} dias)`}
              </span>
            </p>
            <p className="text-sm text-gray-600">{item.descricao}</p>
          </div>
        ))}
      </div>
    );
  }

  // Visualização em tabela para itens ativos
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Data</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Dias Restantes</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Observações</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => {
            const diasRestantes = calcularDiasRestantes(item.criadoEm);
            const corDias = diasRestantes < 30 ? 'text-red-600' : diasRestantes < 90 ? 'text-yellow-600' : 'text-gray-900';

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{item.gvcNome}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.tipo === 'Suspensão' ? `Suspensão (${item.diasSuspensao} dias)` : item.tipo}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatarData(item.criadoEm)}</td>
                <td className={`px-4 py-3 text-sm font-semibold ${corDias}`}>{diasRestantes} dias</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.descricao || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onMarcarInserido(item)}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                      title="Inserido na Tabela"
                    >
                      Inserido na Tabela
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
