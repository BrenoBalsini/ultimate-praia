import { useState } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import type { ItemCautelado, CondicaoItem, TamanhoItem } from '../../types/cautelas';
import { ITENS_CAUTELA } from '../../types/cautelas';

interface FormAdicionarItemProps {
  isOpen: boolean;
  onClose: () => void;
  gvcNome: string;
  onConfirmar: (itens: ItemCautelado[]) => Promise<void>;
}

interface ItemFormulario extends Omit<ItemCautelado, 'id' | 'dataEmprestimo'> {
  data: string;
}

export const FormAdicionarItem = ({
  isOpen,
  onClose,
  gvcNome,
  onConfirmar,
}: FormAdicionarItemProps) => {
  const [itemAtual, setItemAtual] = useState<ItemFormulario>({
    item: '',
    tamanho: '-',
    condicao: 'Bom',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
  });

  const [itensLista, setItensLista] = useState<ItemFormulario[]>([]);
  const [erro, setErro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  const formatarData = (dataString: string) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dataString));
  };

  const handleAdicionarLista = () => {
    setErro('');

    if (!itemAtual.item) {
      setErro('Selecione um item');
      return;
    }

    if (!itemAtual.data) {
      setErro('Selecione uma data');
      return;
    }

    setItensLista((prev) => [...prev, { ...itemAtual }]);
    
    // Reset form
    setItemAtual({
      item: '',
      tamanho: '-',
      condicao: 'Bom',
      data: new Date().toISOString().split('T')[0],
      observacao: '',
    });
  };

  const handleRemoverDaLista = (index: number) => {
    setItensLista((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmar = async () => {
    setErro('');

    if (itensLista.length === 0) {
      setErro('Adicione pelo menos um item à lista');
      return;
    }

    try {
      setIsSubmitting(true);

      // Converter datas string para Timestamp
      const itensParaSalvar: ItemCautelado[] = itensLista.map((item) => ({
        item: item.item,
        tamanho: item.tamanho,
        condicao: item.condicao,
        dataEmprestimo: Timestamp.fromDate(new Date(item.data)),
        observacao: item.observacao,
      }));

      await onConfirmar(itensParaSalvar);
      
      // Reset e fechar
      setItensLista([]);
      setItemAtual({
        item: '',
        tamanho: '-',
        condicao: 'Bom',
        data: new Date().toISOString().split('T')[0],
        observacao: '',
      });
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar:', error);
      setErro('Erro ao salvar itens. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full sm:max-w-4xl bg-white sm:rounded-lg shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Adicionar Empréstimo
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
              {/* Formulário */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Novo Item
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item *
                    </label>
                    <select
                      value={itemAtual.item}
                      onChange={(e) => setItemAtual({ ...itemAtual, item: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                    >
                      <option value="">Selecione...</option>
                      {ITENS_CAUTELA.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tamanho */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamanho
                    </label>
                    <select
                      value={itemAtual.tamanho}
                      onChange={(e) => setItemAtual({ ...itemAtual, tamanho: e.target.value as TamanhoItem })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
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
                      value={itemAtual.condicao}
                      onChange={(e) => setItemAtual({ ...itemAtual, condicao: e.target.value as CondicaoItem })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                    >
                      <option value="Bom">Bom</option>
                      <option value="Regular">Regular</option>
                      <option value="Ruim">Ruim</option>
                    </select>
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={itemAtual.data}
                      onChange={(e) => setItemAtual({ ...itemAtual, data: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                    />
                  </div>

                  {/* Observação */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observação
                    </label>
                    <textarea
                      value={itemAtual.observacao}
                      onChange={(e) => setItemAtual({ ...itemAtual, observacao: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors resize-none"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Botão Adicionar */}
                <button
                  type="button"
                  onClick={handleAdicionarLista}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Adicionar à lista
                </button>
              </div>

              {/* Lista de itens adicionados */}
              {itensLista.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Itens Adicionados
                    </h3>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {itensLista.length}
                    </span>
                  </div>

                  {/* Desktop: Tabela */}
                  <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tamanho</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Condição</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Data</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Observação</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase w-20">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {itensLista.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium capitalize">{item.item}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.tamanho}</td>
                            <td className="px-4 py-3">{getCondicaoBadge(item.condicao)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatarData(item.data)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.observacao || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoverDaLista(index)}
                                className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remover"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: Cards */}
                  <div className="sm:hidden space-y-3">
                    {itensLista.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 capitalize mb-1">{item.item}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Tamanho: {item.tamanho}</span>
                              <span>•</span>
                              <span>{formatarData(item.data)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoverDaLista(index)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Condição:</span>
                          {getCondicaoBadge(item.condicao)}
                        </div>

                        {item.observacao && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Obs:</span> {item.observacao}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  disabled={isSubmitting || itensLista.length === 0}
                  className="flex-1 sm:flex-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#2C5282] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Confirmando...' : `Confirmar ${itensLista.length > 0 ? `(${itensLista.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
