import { useEffect, useState } from 'react';
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
      console.error('Erro ao carregar materiais tipo B:', error);
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
      console.error('Erro ao adicionar material tipo B:', error);
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
      console.error('Erro ao remover material tipo B:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Lista de Materiais (Tipo B)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            Fechar
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
          {/* Formulário de novo material */}
          <div className="mb-4 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nome do material (ex: Gaze, Vassoura...)"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value as CategoriaMaterialB)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="whitemed">Whitemed</option>
                <option value="bolsa_aph">Bolsa APH</option>
                <option value="limpeza">Limpeza</option>
              </select>
            </div>
            <button
              onClick={handleAdicionar}
              disabled={saving || !novoNome.trim()}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Adicionando...' : 'Adicionar Material'}
            </button>
          </div>

          <hr className="my-3" />

          {/* Lista */}
          {loading ? (
            <p className="text-gray-600 text-sm">Carregando materiais...</p>
          ) : materiais.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Nenhum material cadastrado ainda. Use o campo acima para adicionar.
            </p>
          ) : (
            <div className="space-y-3">
              {(['whitemed', 'bolsa_aph', 'limpeza'] as CategoriaMaterialB[]).map(
                (categoria) => {
                  const daCategoria = materiais.filter(
                    (m) => m.categoria === categoria,
                  );
                  if (daCategoria.length === 0) return null;

                  return (
                    <div key={categoria}>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">
                        {CATEGORIAS_LABEL[categoria]}
                      </h3>
                      <ul className="space-y-1">
                        {daCategoria.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm text-gray-800">{m.nome}</span>
                            <button
                              onClick={() => handleRemover(m.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
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
    </div>
  );
};
