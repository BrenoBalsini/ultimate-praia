import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GVC } from '../../services/gvcService';

interface FormElogioProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    descricao?: string;
    gvcIds: string[];
    gvcNomes: string[];
  }) => Promise<void>;
  gvcsDisponiveis: GVC[];
}

export const FormElogio = ({
  isOpen,
  onClose,
  onSubmit,
  gvcsDisponiveis,
}: FormElogioProps) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [gvcsSelecionados, setGvcsSelecionados] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitulo('');
      setDescricao('');
      setGvcsSelecionados([]);
      setErro('');
    }
  }, [isOpen]);

  const handleToggleGVC = (gvcId: string) => {
    setGvcsSelecionados((prev) =>
      prev.includes(gvcId)
        ? prev.filter((id) => id !== gvcId)
        : [...prev, gvcId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!titulo.trim()) {
      setErro('O título é obrigatório');
      return;
    }

    if (gvcsSelecionados.length === 0) {
      setErro('Selecione pelo menos um guarda-vidas');
      return;
    }

    try {
      setIsSubmitting(true);

      const gvcsNomes = gvcsDisponiveis
        .filter((gvc) => gvcsSelecionados.includes(gvc.id || ''))
        .map((gvc) => gvc.nome);

      await onSubmit({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        gvcIds: gvcsSelecionados,
        gvcNomes: gvcsNomes,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Novo Elogio</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Resgate bem sucedido"
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o elogio..."
              disabled={isSubmitting}
            />
          </div>

          {/* Seleção de GVCs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guarda-Vidas * ({gvcsSelecionados.length} selecionado{gvcsSelecionados.length !== 1 ? 's' : ''})
            </label>
            <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
              {gvcsDisponiveis
                .filter((gvc) => gvc.status === 'ativo')
                .map((gvc) => (
                  <label
                    key={gvc.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={gvcsSelecionados.includes(gvc.id || '')}
                      onChange={() => handleToggleGVC(gvc.id || '')}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{gvc.nome}</span>
                  </label>
                ))}

              {gvcsDisponiveis.filter((gvc) => gvc.status === 'ativo').length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum guarda-vidas ativo disponível
                </p>
              )}
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
