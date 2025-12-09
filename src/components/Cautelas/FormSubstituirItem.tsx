import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import type { ItemCautelado, CondicaoItem, TamanhoItem } from '../../types/cautelas';

interface FormSubstituirItemProps {
  isOpen: boolean;
  onClose: () => void;
  gvcNome: string;
  itemAntigo: ItemCautelado | null;
  onConfirmar: (novoItem: ItemCautelado, condicaoFinalAntigo: CondicaoItem, observacao: string) => Promise<void>;
}

export const FormSubstituirItem = ({
  isOpen,
  onClose,
  gvcNome,
  itemAntigo,
  onConfirmar,
}: FormSubstituirItemProps) => {
  const [condicaoFinalAntigo, setCondicaoFinalAntigo] = useState<CondicaoItem>('Bom');
  const [observacaoAntigo, setObservacaoAntigo] = useState('');
  
  const [novoItem, setNovoItem] = useState<{
    tamanho: TamanhoItem;
    condicao: CondicaoItem;
    data: string;
    observacao: string;
  }>({
    tamanho: itemAntigo?.tamanho || '-',
    condicao: 'Bom',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
  });

  const [erro, setErro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !itemAntigo) return null;

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

  const handleConfirmar = async () => {
    setErro('');

    if (!novoItem.data) {
      setErro('Selecione uma data');
      return;
    }

    try {
      setIsSubmitting(true);

      const itemParaSalvar: ItemCautelado = {
        item: itemAntigo.item, // Mantém o mesmo item
        tamanho: novoItem.tamanho,
        condicao: novoItem.condicao,
        dataEmprestimo: Timestamp.fromDate(new Date(novoItem.data)),
        observacao: novoItem.observacao,
      };

      await onConfirmar(itemParaSalvar, condicaoFinalAntigo, observacaoAntigo);
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar substituição:', error);
      setErro('Erro ao substituir item. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full sm:max-w-3xl bg-white sm:rounded-lg shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Substituir Item
                    </h2>
                    <p className="text-sm text-blue-100">{gvcNome}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Item Antigo */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <h3 className="text-sm font-semibold text-red-900 uppercase tracking-wide">
                    Item a ser Devolvido
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Item</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{itemAntigo.item}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tamanho</p>
                    <p className="text-sm font-semibold text-gray-900">{itemAntigo.tamanho}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Condição Inicial</p>
                    {getCondicaoBadge(itemAntigo.condicao)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Data Empréstimo</p>
                    <p className="text-sm font-semibold text-gray-900">{formatarData(itemAntigo.dataEmprestimo)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condição Final *
                    </label>
                    <select
                      value={condicaoFinalAntigo}
                      onChange={(e) => setCondicaoFinalAntigo(e.target.value as CondicaoItem)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    >
                      <option value="Bom">Bom</option>
                      <option value="Regular">Regular</option>
                      <option value="Ruim">Ruim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo da Devolução
                    </label>
                    <input
                      type="text"
                      value={observacaoAntigo}
                      onChange={(e) => setObservacaoAntigo(e.target.value)}
                      placeholder="Ex: Desgaste, dano, etc"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Novo Item */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">
                    Novo Item a ser Entregue
                  </h3>
                </div>

                {/* Item (apenas leitura) */}
                <div className="mb-4 p-3 bg-white border border-green-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Item</p>
                  <p className="text-base font-bold text-gray-900 capitalize">{itemAntigo.item}</p>
                  <p className="text-xs text-green-600 mt-1">O item não pode ser alterado em uma substituição</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tamanho */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamanho
                    </label>
                    <select
                      value={novoItem.tamanho}
                      onChange={(e) => setNovoItem({ ...novoItem, tamanho: e.target.value as TamanhoItem })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="-">-</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XG">XG</option>
                      <option value="XXG">XXG</option>
                    </select>
                  </div>

                  {/* Condição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condição *
                    </label>
                    <select
                      value={novoItem.condicao}
                      onChange={(e) => setNovoItem({ ...novoItem, condicao: e.target.value as CondicaoItem })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="Bom">Bom</option>
                      <option value="Regular">Regular</option>
                      <option value="Ruim">Ruim</option>
                    </select>
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Entrega *
                    </label>
                    <input
                      type="date"
                      value={novoItem.data}
                      onChange={(e) => setNovoItem({ ...novoItem, data: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>

                  {/* Observação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observação
                    </label>
                    <input
                      type="text"
                      value={novoItem.observacao}
                      onChange={(e) => setNovoItem({ ...novoItem, observacao: e.target.value })}
                      placeholder="Opcional"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{erro}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#2C5282] disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Substituindo...' : 'Confirmar Substituição'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
