import { useState } from 'react';
import { CheckCircle, Package } from 'lucide-react';
import type { Solicitacao } from '../../types/cautelas';

interface ModalConfirmarEntregaProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: Solicitacao | null;
  onConfirmar: (itensEntreguesIds: string[]) => Promise<void>;
}

export const ModalConfirmarEntrega = ({
  isOpen,
  onClose,
  solicitacao,
  onConfirmar,
}: ModalConfirmarEntregaProps) => {
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !solicitacao) return null;

  const itensPendentes = solicitacao.itens.filter((item) => !item.entregue);

  const handleToggleItem = (itemId: string) => {
    setItensSelecionados((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelecionarTodos = () => {
    if (itensSelecionados.length === itensPendentes.length) {
      setItensSelecionados([]);
    } else {
      setItensSelecionados(itensPendentes.map((item) => item.id!));
    }
  };

  const handleConfirmar = async () => {
    if (itensSelecionados.length === 0) {
      alert('Selecione pelo menos um item para entregar');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmar(itensSelecionados);
      setItensSelecionados([]);
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      alert('Erro ao realizar entrega. Tente novamente.');
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
            className="w-full sm:max-w-lg bg-white sm:rounded-xl shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 sm:px-6 py-4 sm:rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    Confirmar Entrega
                  </h2>
                  <p className="text-sm text-blue-100 truncate">{solicitacao.gvcNome}</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Título e contador */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  Selecione os itens entregues
                </p>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {itensSelecionados.length}/{itensPendentes.length}
                </span>
              </div>

              {/* Botão selecionar todos */}
              <button
                type="button"
                onClick={handleSelecionarTodos}
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-sm font-medium text-[#1E3A5F] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {itensSelecionados.length === itensPendentes.length 
                  ? 'Desmarcar Todos' 
                  : 'Selecionar Todos'
                }
              </button>

              {/* Lista de itens */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {itensPendentes.map((item) => {
                  const isSelected = itensSelecionados.includes(item.id!);
                  
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleItem(item.id!)}
                          disabled={isSubmitting}
                          className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        {isSelected && (
                          <CheckCircle className="absolute w-5 h-5 text-green-600 pointer-events-none" />
                        )}
                      </div>
                      <span className={`text-sm flex-1 ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {item.item}
                        {item.tamanho !== '-' && (
                          <span className="text-gray-500 ml-1">({item.tamanho})</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 sm:rounded-b-xl border-t-2 border-gray-100">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={isSubmitting || itensSelecionados.length === 0}
                  className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isSubmitting 
                    ? 'Confirmando...' 
                    : `Confirmar${itensSelecionados.length > 0 ? ` (${itensSelecionados.length})` : ''}`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
