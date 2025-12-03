import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import { ITENS_CAUTELA, type CondicaoItem, type TamanhoItem } from '../../types/cautelas';

interface ItemFormulario {
  item: string;
  tamanho: TamanhoItem;
  condicao: CondicaoItem;
}

interface FormCriarSolicitacaoProps {
  isOpen: boolean;
  onClose: () => void;
  gvcs: GVC[];
  onSubmit: (gvcId: string, gvcNome: string, itens: ItemFormulario[]) => Promise<void>;
}

export const FormCriarSolicitacao = ({
  isOpen,
  onClose,
  gvcs,
  onSubmit,
}: FormCriarSolicitacaoProps) => {
  const [gvcSelecionado, setGvcSelecionado] = useState('');
  const [itemAtual, setItemAtual] = useState<ItemFormulario>({
    item: '',
    tamanho: '-',
    condicao: 'Bom',
  });
  const [itensLista, setItensLista] = useState<ItemFormulario[]>([]);
  const [erro, setErro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const gvcsAtivos = gvcs.filter((g) => g.status === 'ativo');

  const handleAdicionarItem = () => {
    setErro('');

    if (!itemAtual.item) {
      setErro('Selecione um item');
      return;
    }

    setItensLista((prev) => [...prev, { ...itemAtual }]);
    setItemAtual({
      item: '',
      tamanho: '-',
      condicao: 'Bom',
    });
  };

  const handleRemoverItem = (index: number) => {
    setItensLista((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErro('');

    if (!gvcSelecionado) {
      setErro('Selecione um guarda-vidas');
      return;
    }

    if (itensLista.length === 0) {
      setErro('Adicione pelo menos um item');
      return;
    }

    const gvc = gvcsAtivos.find((g) => g.id === gvcSelecionado);
    if (!gvc) {
      setErro('GVC não encontrado');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(gvc.id!, gvc.nome, itensLista);
      
      // Reset
      setGvcSelecionado('');
      setItensLista([]);
      setItemAtual({
        item: '',
        tamanho: '-',
        condicao: 'Bom',
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      setErro('Erro ao criar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Criar Nova Solicitação</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selecionar GVC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guarda-Vida *
            </label>
            <select
              value={gvcSelecionado}
              onChange={(e) => setGvcSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Selecione...</option>
              {gvcsAtivos.map((gvc) => (
                <option key={gvc.id} value={gvc.id}>
                  {gvc.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Itens Solicitados */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">
              Itens Solicitados
            </h3>

            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Formulário de Item */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Item */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item *
                  </label>
                  <select
                    value={itemAtual.item}
                    onChange={(e) => setItemAtual({ ...itemAtual, item: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Ruim">Ruim</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdicionarItem}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Plus size={18} />
                Adicionar Mais Item
              </button>
            </div>

            {/* Lista de itens adicionados */}
            {itensLista.length > 0 && (
              <div className="mt-4 space-y-2">
                {itensLista.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                  >
                    <span className="text-sm text-gray-900">
                      • {item.item} {item.tamanho !== '-' && `(${item.tamanho})`} - {item.condicao}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoverItem(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
