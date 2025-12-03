import { useState } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Confirmar Entrega - {solicitacao.gvcNome}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700 font-medium">
            Quais itens foram entregues?
          </p>

          <div className="space-y-2">
            {itensPendentes.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={itensSelecionados.includes(item.id!)}
                  onChange={() => handleToggleItem(item.id!)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">
                  {item.item} {item.tamanho !== '-' && `(${item.tamanho})`}
                </span>
              </label>
            ))}
          </div>
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
            {isSubmitting ? 'Confirmando...' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
