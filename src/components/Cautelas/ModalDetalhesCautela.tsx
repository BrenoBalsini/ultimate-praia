import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Cautela, CondicaoItem } from '../../types/cautelas';

interface ModalDetalhesCautelaProps {
  isOpen: boolean;
  onClose: () => void;
  cautela: Cautela | null;
  onAdicionarItem: () => void;
  onDevolverItem: (itemId: string, condicaoFinal: CondicaoItem, observacao?: string) => Promise<void>;
  onSubstituirItem: (itemId: string) => void;
}

export const ModalDetalhesCautela = ({
  isOpen,
  onClose,
  cautela,
  onAdicionarItem,
  onDevolverItem,
  onSubstituirItem,
}: ModalDetalhesCautelaProps) => {
  const [itemDevolucao, setItemDevolucao] = useState<string | null>(null);
  const [condicaoDevolucao, setCondicaoDevolucao] = useState<CondicaoItem>('Bom');
  const [observacaoDevolucao, setObservacaoDevolucao] = useState('');

  if (!isOpen || !cautela) return null;

  const formatarData = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getCondicaoBadge = (condicao: CondicaoItem) => {
    const cores = {
      Bom: 'bg-green-100 text-green-700',
      Regular: 'bg-yellow-100 text-yellow-700',
      Ruim: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cores[condicao]}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        {condicao}
      </span>
    );
  };

  const handleDevolverClick = (itemId: string) => {
    setItemDevolucao(itemId);
  };

  const handleConfirmarDevolucao = async () => {
    if (!itemDevolucao) return;
    
    try {
      await onDevolverItem(itemDevolucao, condicaoDevolucao, observacaoDevolucao);
      setItemDevolucao(null);
      setCondicaoDevolucao('Bom');
      setObservacaoDevolucao('');
    } catch (error) {
      console.error('Erro ao devolver:', error);
    }
  };

  const handleGerarPDF = () => {
    // TODO: Implementar geração de PDF
    alert('Funcionalidade de PDF em desenvolvimento');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-900">{cautela.gvcNome}</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onAdicionarItem}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                + Adicionar Empréstimo
              </button>
              <button
                type="button"
                onClick={handleGerarPDF}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Gerar PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* ITENS CAUTELADOS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">
                Itens Cautelados
              </h3>
              
              {cautela.itensAtivos.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 italic">Nenhum item cautelado no momento</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tamanho</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Condição</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Observação</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cautela.itensAtivos.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.item}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.tamanho}</td>
                          <td className="px-4 py-3">{getCondicaoBadge(item.condicao)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatarData(item.dataEmprestimo)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.observacao || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleDevolverClick(item.id!)}
                                className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                              >
                                Devolver
                              </button>
                              <button
                                type="button"
                                onClick={() => onSubstituirItem(item.id!)}
                                className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                              >
                                Substituir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* HISTÓRICO */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">
                Histórico
              </h3>
              
              {!cautela.historico || cautela.historico.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-400 italic">Nenhum registro no histórico</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tamanho</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cond. Inicial</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cond. Final</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Datas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cautela.historico.map((hist) => (
                        <tr key={hist.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{hist.item}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{hist.tamanho}</td>
                          <td className="px-4 py-3">{getCondicaoBadge(hist.condicaoInicial)}</td>
                          <td className="px-4 py-3">{getCondicaoBadge(hist.condicaoFinal)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex flex-col gap-1">
                              <span>← {formatarData(hist.dataEmprestimo)}</span>
                              <span>→ {formatarData(hist.dataDevolucao)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{hist.tipo}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{hist.observacao || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Devolução */}
      {itemDevolucao && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4">Devolver Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condição Final *
                </label>
                <select
                  value={condicaoDevolucao}
                  onChange={(e) => setCondicaoDevolucao(e.target.value as CondicaoItem)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Bom">Bom</option>
                  <option value="Regular">Regular</option>
                  <option value="Ruim">Ruim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação
                </label>
                <textarea
                  value={observacaoDevolucao}
                  onChange={(e) => setObservacaoDevolucao(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setItemDevolucao(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDevolucao}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Confirmar Devolução
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
