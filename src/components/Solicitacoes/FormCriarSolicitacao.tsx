import { useState } from 'react';
import { X, Plus, Trash2, ClipboardList } from 'lucide-react';
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
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full sm:max-w-3xl bg-white sm:rounded-xl shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 sm:px-6 py-4 sm:rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Nova Solicitação
                    </h2>
                    <p className="text-sm text-blue-100">Criar solicitação de equipamentos</p>
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
              {/* Selecionar GVC */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guarda-Vida *
                </label>
                <select
                  value={gvcSelecionado}
                  onChange={(e) => setGvcSelecionado(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  <option value="">Selecione um guarda-vidas...</option>
                  {gvcsAtivos.map((gvc) => (
                    <option key={gvc.id} value={gvc.id}>
                      {gvc.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formulário de Itens */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Adicionar Itens
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
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
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
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
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
                </div>

                <button
                  type="button"
                  onClick={handleAdicionarItem}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Adicionar à Lista
                </button>
              </div>

              {/* Lista de itens adicionados */}
              {itensLista.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Itens na Solicitação
                    </h3>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {itensLista.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {itensLista.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.item}
                            {item.tamanho !== '-' && (
                              <span className="text-gray-500 ml-1">({item.tamanho})</span>
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Erro */}
              {erro && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{erro}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-100 px-4 sm:px-6 py-4 sm:rounded-b-xl">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || itensLista.length === 0}
                  className="flex-1 sm:flex-auto px-6 py-3 text-sm font-semibold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#2C5282] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Criando...' : `Criar Solicitação ${itensLista.length > 0 ? `(${itensLista.length})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
