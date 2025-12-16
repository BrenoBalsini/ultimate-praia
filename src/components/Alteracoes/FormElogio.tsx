import { useState, useEffect } from 'react';
import { X, Award, Search, AlertCircle } from 'lucide-react';
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
  const [busca, setBusca] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitulo('');
      setDescricao('');
      setGvcsSelecionados([]);
      setBusca('');
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

  // Filtrar GVCs pela busca
  const gvcsFiltrados = gvcsDisponiveis
    .filter((gvc) => gvc.status === 'ativo')
    .filter((gvc) => 
      gvc.nome.toLowerCase().includes(busca.toLowerCase())
    );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Novo Elogio</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
                title="Fechar (ESC)"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Erro */}
            {erro && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-semibold text-gray-900 mb-2">
                Título <span className="text-red-600">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                placeholder="Ex: Resgate bem sucedido"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-semibold text-gray-900 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                placeholder="Descreva o elogio..."
                disabled={isSubmitting}
              />
            </div>

            {/* Seleção de GVCs com Busca */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Guarda-Vidas <span className="text-red-600">*</span>
                <span className="ml-2 text-gray-500 font-normal">
                  ({gvcsSelecionados.length} selecionado{gvcsSelecionados.length !== 1 ? 's' : ''})
                </span>
              </label>

              {/* Campo de Busca */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar guarda-vidas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              {/* Lista de GVCs */}
              <div className="border border-gray-300 rounded-xl p-3 max-h-64 overflow-y-auto space-y-1">
                {gvcsFiltrados.length > 0 ? (
                  gvcsFiltrados.map((gvc) => (
                    <label
                      key={gvc.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={gvcsSelecionados.includes(gvc.id || '')}
                        onChange={() => handleToggleGVC(gvc.id || '')}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{gvc.nome}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">
                    {busca ? 'Nenhum guarda-vidas encontrado' : 'Nenhum guarda-vidas ativo disponível'}
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
