import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Criar Nova Cautela - {gvcNome}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulário */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">
              Itens a Cautelar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item *
                </label>
                <select
                  value={itemAtual.item}
                  onChange={(e) => setItemAtual({ ...itemAtual, item: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Observação */}
              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação
                </label>
                <textarea
                  value={itemAtual.observacao}
                  onChange={(e) => setItemAtual({ ...itemAtual, observacao: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>

              {/* Botão Adicionar */}
              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="button"
                  onClick={handleAdicionarLista}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Plus size={18} />
                  Adicionar à lista
                </button>
              </div>
            </div>
          </div>

          {/* Lista de itens adicionados */}
          {itensLista.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">
                Itens Adicionados ({itensLista.length})
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tamanho</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Condição</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Observação</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itensLista.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.item}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.tamanho}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.condicao}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Intl.DateTimeFormat('pt-BR').format(new Date(item.data))}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.observacao || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoverDaLista(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
