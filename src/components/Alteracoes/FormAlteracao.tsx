import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import type { TipoAlteracao } from '../../types/alteracoes';

interface FormAlteracaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    tipo: TipoAlteracao;
    diasSuspensao?: number;
    gvcId: string;
    gvcNome: string;
    descricao: string;
  }) => Promise<void>;
  gvcsDisponiveis: GVC[];
}

export const FormAlteracao = ({
  isOpen,
  onClose,
  onSubmit,
  gvcsDisponiveis,
}: FormAlteracaoProps) => {
  const [tipo, setTipo] = useState<TipoAlteracao>('Advertência');
  const [diasSuspensao, setDiasSuspensao] = useState<number>(5);
  const [gvcSelecionado, setGvcSelecionado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTipo('Advertência');
      setDiasSuspensao(5);
      setGvcSelecionado('');
      setDescricao('');
      setErro('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!gvcSelecionado) {
      setErro('Selecione um guarda-vidas');
      return;
    }

    if (!descricao.trim()) {
      setErro('A descrição é obrigatória');
      return;
    }

    if (tipo === 'Suspensão' && diasSuspensao < 1) {
      setErro('Informe a quantidade de dias de suspensão');
      return;
    }

    try {
      setIsSubmitting(true);

      const gvc = gvcsDisponiveis.find((g) => g.id === gvcSelecionado);
      if (!gvc) {
        setErro('GVC não encontrado');
        return;
      }

      await onSubmit({
        tipo,
        diasSuspensao: tipo === 'Suspensão' ? diasSuspensao : undefined,
        gvcId: gvc.id!,
        gvcNome: gvc.nome,
        descricao: descricao.trim(),
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
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Nova Alteração</h2>
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

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tipo <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Advertência"
                    checked={tipo === 'Advertência'}
                    onChange={(e) => setTipo(e.target.value as TipoAlteracao)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm text-gray-900">Advertência</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Suspensão"
                    checked={tipo === 'Suspensão'}
                    onChange={(e) => setTipo(e.target.value as TipoAlteracao)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm text-gray-900">Suspensão</span>
                </label>
              </div>
            </div>

            {/* Dias de Suspensão (condicional) */}
            {tipo === 'Suspensão' && (
              <div>
                <label htmlFor="diasSuspensao" className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantidade de Dias <span className="text-red-600">*</span>
                </label>
                <input
                  id="diasSuspensao"
                  type="number"
                  min="1"
                  max="365"
                  value={diasSuspensao}
                  onChange={(e) => setDiasSuspensao(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                />
              </div>
            )}

            {/* GVC */}
            <div>
              <label htmlFor="gvc" className="block text-sm font-semibold text-gray-900 mb-2">
                Guarda-Vidas <span className="text-red-600">*</span>
              </label>
              <select
                id="gvc"
                value={gvcSelecionado}
                onChange={(e) => setGvcSelecionado(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors cursor-pointer"
              >
                <option value="">Selecione...</option>
                {gvcsDisponiveis
                  .filter((gvc) => gvc.status === 'ativo')
                  .map((gvc) => (
                    <option key={gvc.id} value={gvc.id}>
                      {gvc.nome}
                    </option>
                  ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-semibold text-gray-900 mb-2">
                Descrição <span className="text-red-600">*</span>
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
                placeholder="Descreva o ocorrido..."
                disabled={isSubmitting}
              />
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
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
