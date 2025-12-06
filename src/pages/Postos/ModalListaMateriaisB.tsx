import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import type { CategoriaMaterialB } from '../../types/postos';
import {
  listarMateriaisTipoB,
  adicionarMaterialTipoB,
  removerMaterialTipoB,
  type MaterialTipoBDoc,
} from '../../services/materiaisBService';

interface ModalListaMateriaisBProps {
  open: boolean;
  onClose: () => void;
}

type MaterialTipoBItem = MaterialTipoBDoc & { id: string };

const CATEGORIAS_LABEL: Record<CategoriaMaterialB, string> = {
  whitemed: 'Whitemed',
  bolsa_aph: 'Bolsa APH',
  limpeza: 'Limpeza',
};

export const ModalListaMateriaisB = ({ open, onClose }: ModalListaMateriaisBProps) => {
  const [materiais, setMateriais] = useState<MaterialTipoBItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<CategoriaMaterialB>('whitemed');

  const carregar = async () => {
    try {
      setLoading(true);
      const lista = await listarMateriaisTipoB();
      // ordenar por categoria e nome
      lista.sort((a, b) => {
        if (a.categoria === b.categoria) {
          return a.nome.localeCompare(b.nome);
        }
        return a.categoria.localeCompare(b.categoria);
      });
      setMateriais(lista);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      carregar();
    }
  }, [open]);

  const handleAdicionar = async () => {
    if (!novoNome.trim()) return;
    try {
      setSaving(true);
      await adicionarMaterialTipoB({
        nome: novoNome.trim(),
        categoria: novaCategoria,
      });
      setNovoNome('');
      await carregar();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemover = async (id: string) => {
    const confirmar = window.confirm('Tem certeza que deseja remover este material da lista?');
    if (!confirmar) return;

    try {
      await removerMaterialTipoB(id);
      await carregar();
    } catch (error) {
      console.error('Erro ao remover material:', error);
    }
  };

  if (!open) return null;

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Lista de Materiais
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
                title="Fechar (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 overflow-y-auto flex-1">
            {/* Formulário de Adicionar */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Adicionar Novo Material
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nome do Material
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Gaze, Vassoura, Álcool..."
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && novoNome.trim()) {
                        handleAdicionar();
                      }
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value as CategoriaMaterialB)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors cursor-pointer"
                  >
                    <option value="whitemed">Whitemed</option>
                    <option value="bolsa_aph">Bolsa</option>
                    <option value="limpeza">Limpeza</option>
                  </select>
                </div>

                <button
                  onClick={handleAdicionar}
                  disabled={saving || !novoNome.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? 'Adicionando...' : 'Adicionar Material'}
                </button>
              </div>
            </div>

            {/* Lista de Materiais */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Materiais Cadastrados
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-3 w-10 h-10 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-600">Carregando materiais...</p>
                </div>
              ) : materiais.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Nenhum material cadastrado
                  </p>
                  <p className="text-xs text-gray-500">
                    Use o formulário acima para adicionar materiais
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {(['whitemed', 'bolsa_aph', 'limpeza'] as CategoriaMaterialB[]).map(
                    (categoria) => {
                      const daCategoria = materiais.filter(
                        (m) => m.categoria === categoria,
                      );
                      if (daCategoria.length === 0) return null;

                      return (
                        <div key={categoria}>
                          <div className="flex items-center gap-2 mb-3">
                            
                            <h4 className="text-md font-bold text-gray-800">
                              {CATEGORIAS_LABEL[categoria]}
                            </h4>
                            <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {daCategoria.length} {daCategoria.length === 1 ? 'item' : 'itens'}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {daCategoria.map((m) => (
                              <li
                                key={m.id}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors group"
                              >
                                <span className="text-sm text-gray-900">
                                  {m.nome}
                                </span>
                                <button
                                  onClick={() => handleRemover(m.id)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remover
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
