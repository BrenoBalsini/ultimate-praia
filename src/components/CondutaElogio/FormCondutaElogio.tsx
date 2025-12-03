import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import type { CondutaElogio } from '../../types/conduta';

interface FormCondutaElogioProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CondutaElogio, 'id' | 'criadoEm' | 'criadoPor'>) => Promise<void>;
  tipo: 'conduta' | 'elogio';
  gvcsDisponiveis: GVC[];
}

export const FormCondutaElogio = ({
  isOpen,
  onClose,
  onSubmit,
  tipo,
  gvcsDisponiveis,
}: FormCondutaElogioProps) => {
  const [descricao, setDescricao] = useState('');
  const [gvcsSelecionados, setGvcsSelecionados] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  // Resetar form ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
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

    // Validações
    if (!descricao.trim()) {
      setErro('A descrição é obrigatória');
      return;
    }

    if (gvcsSelecionados.length === 0) {
      setErro('Selecione pelo menos um guarda-vidas');
      return;
    }

    try {
      setIsSubmitting(true);

      // Buscar nomes dos GVCs selecionados
      const gvcsNomes = gvcsDisponiveis
        .filter((gvc) => gvcsSelecionados.includes(gvc.id || ''))
        .map((gvc) => gvc.nome);

      await onSubmit({
        tipo,
        descricao: descricao.trim(),
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

  const titulo = tipo === 'conduta' ? 'Nova Conduta' : 'Novo Elogio';
  const corBotao = tipo === 'conduta' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Descreva o ${tipo === 'conduta' ? 'ocorrido' : 'elogio'}...`}
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
                    <span className="text-sm text-gray-900">
                      {gvc.nome} <span className="text-gray-500">(Posição {gvc.posicao})</span>
                    </span>
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
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${corBotao}`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
