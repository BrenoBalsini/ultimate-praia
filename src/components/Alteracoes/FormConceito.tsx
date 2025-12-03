import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import { CONCEITOS_DISPONIVEIS, type TipoConceito, type PolaridadeConceito } from '../../types/alteracoes';

interface FormConceitoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    gvcId: string;
    gvcNome: string;
    conceito: TipoConceito;
    polaridade: PolaridadeConceito;
    descricao: string;
  }) => Promise<void>;
  gvcsDisponiveis: GVC[];
}

export const FormConceito = ({
  isOpen,
  onClose,
  onSubmit,
  gvcsDisponiveis,
}: FormConceitoProps) => {
  const [gvcSelecionado, setGvcSelecionado] = useState('');
  const [conceito, setConceito] = useState<TipoConceito>('Assiduidade');
  const [polaridade, setPolaridade] = useState<PolaridadeConceito>('Positivo');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setGvcSelecionado('');
      setConceito('Assiduidade');
      setPolaridade('Positivo');
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

    try {
      setIsSubmitting(true);

      const gvc = gvcsDisponiveis.find((g) => g.id === gvcSelecionado);
      if (!gvc) {
        setErro('GVC não encontrado');
        return;
      }

      await onSubmit({
        gvcId: gvc.id!,
        gvcNome: gvc.nome,
        conceito,
        polaridade,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Novo Conceito</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* GVC */}
          <div>
            <label htmlFor="gvc" className="block text-sm font-medium text-gray-700 mb-2">
              Guarda-Vidas *
            </label>
            <select
              id="gvc"
              value={gvcSelecionado}
              onChange={(e) => setGvcSelecionado(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Conceito */}
          <div>
            <label htmlFor="conceito" className="block text-sm font-medium text-gray-700 mb-2">
              Conceito *
            </label>
            <select
              id="conceito"
              value={conceito}
              onChange={(e) => setConceito(e.target.value as TipoConceito)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONCEITOS_DISPONIVEIS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Polaridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Positivo"
                  checked={polaridade === 'Positivo'}
                  onChange={(e) => setPolaridade(e.target.value as PolaridadeConceito)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-900">Positivo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Negativo"
                  checked={polaridade === 'Negativo'}
                  onChange={(e) => setPolaridade(e.target.value as PolaridadeConceito)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm text-gray-900">Negativo</span>
              </label>
            </div>
          </div>

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
              placeholder="Descreva o conceito..."
              disabled={isSubmitting}
            />
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
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${
                polaridade === 'Positivo'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
