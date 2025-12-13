import { useEffect, useState } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, Package } from 'lucide-react';
import type { CategoriaMaterialB } from '../../types/postos';
import {
  listarMateriaisTipoB,
  adicionarMaterialTipoB,
  atualizarMaterialTipoB,
  removerMaterialTipoB,
  type MaterialTipoBDoc,
} from '../../services/materiaisBService';
import toast from 'react-hot-toast';

interface ModalListaMateriaisBProps {
  open: boolean;
  onClose: () => void;
}

type MaterialTipoBItem = MaterialTipoBDoc & { id: string };

const CATEGORIAS_LABEL: Record<CategoriaMaterialB, string> = {
  whitemed: 'Whitemed',
  bolsa_aph: 'Bolsa APH',
  outros: 'Outros',
};

export const ModalListaMateriaisB = ({ open, onClose }: ModalListaMateriaisBProps) => {
  const [materiais, setMateriais] = useState<MaterialTipoBItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<string | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaMaterialB>('whitemed');

  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<CategoriaMaterialB>('whitemed');

  const carregar = async () => {
    try {
      setLoading(true);
      const lista = await listarMateriaisTipoB(false); // ✅ false = todos (ativos e inativos)
      
      // Ordenar por categoria e nome
      lista.sort((a, b) => {
        if (a.categoria === b.categoria) {
          return a.nome.localeCompare(b.nome);
        }
        return a.categoria.localeCompare(b.categoria);
      });
      setMateriais(lista);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast.error('Erro ao carregar materiais');
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
    if (!novoNome.trim()) {
      toast.error('Digite o nome do material');
      return;
    }

    // Verificar se já existe
    const jaExiste = materiais.some(
      m => m.nome.toLowerCase() === novoNome.trim().toLowerCase() &&
           m.categoria === novaCategoria
    );

    if (jaExiste) {
      toast.error('Este material já existe nesta categoria');
      return;
    }

    try {
      setSaving(true);
      await adicionarMaterialTipoB({
        nome: novoNome.trim(),
        categoria: novaCategoria,
      });
      setNovoNome('');
      toast.success('Material adicionado com sucesso!');
      await carregar();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      toast.error('Erro ao adicionar material');
    } finally {
      setSaving(false);
    }
  };

  const handleIniciarEdicao = (item: MaterialTipoBItem) => {
    setItemEmEdicao(item.id);
    setNomeEditando(item.nome);
    setCategoriaEditando(item.categoria);
  };

  const handleSalvarEdicao = async (id: string) => {
    if (!nomeEditando.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    try {
      await atualizarMaterialTipoB(id, {
        nome: nomeEditando.trim(),
        categoria: categoriaEditando,
      });
      toast.success('Material atualizado!');
      setItemEmEdicao(null);
      setNomeEditando('');
      await carregar();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  const handleCancelarEdicao = () => {
    setItemEmEdicao(null);
    setNomeEditando('');
  };

  const handleToggleAtivo = async (id: string, ativoAtual: boolean) => {
    try {
      await atualizarMaterialTipoB(id, { ativo: !ativoAtual });
      toast.success(ativoAtual ? 'Material desativado' : 'Material ativado');
      await carregar();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleRemover = async (id: string, nome: string) => {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    try {
      await removerMaterialTipoB(id);
      toast.success('Material excluído');
      await carregar();
    } catch (error) {
      console.error('Erro ao remover material:', error);
      toast.error('Erro ao remover material');
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Gerenciar Materiais
                  </h2>
                  <p className="text-sm text-blue-100">
                    Configure os materiais disponíveis no sistema
                  </p>
                </div>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Adicionar Novo Material
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nome do material (ex: Luva, Vassoura...)"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && novoNome.trim()) {
                      handleAdicionar();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                  disabled={saving}
                />
                <select
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value as CategoriaMaterialB)}
                  className="sm:w-40 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors cursor-pointer"
                  disabled={saving}
                >
                  <option value="whitemed">Whitemed</option>
                  <option value="bolsa_aph">Bolsa APH</option>
                  <option value="outros">Outros</option>
                </select>
                <button
                  onClick={handleAdicionar}
                  disabled={saving || !novoNome.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Lista de Materiais */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Materiais Cadastrados
                </h3>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {materiais.length}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12">
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
                  {(['whitemed', 'bolsa_aph', 'outros'] as CategoriaMaterialB[]).map(
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
                          <div className="space-y-2">
                            {daCategoria.map((m) => (
                              <div
                                key={m.id}
                                className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                                  m.ativo
                                    ? 'bg-white border-gray-200 hover:border-[#1E3A5F]'
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                              >
                                {/* Conteúdo */}
                                <div className="flex-1">
                                  {itemEmEdicao === m.id ? (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={nomeEditando}
                                        onChange={(e) => setNomeEditando(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSalvarEdicao(m.id);
                                          if (e.key === 'Escape') handleCancelarEdicao();
                                        }}
                                        className="flex-1 px-3 py-1.5 border border-[#1E3A5F] rounded-lg focus:ring-2 focus:ring-[#1E3A5F]"
                                        autoFocus
                                      />
                                      <select
                                        value={categoriaEditando}
                                        onChange={(e) => setCategoriaEditando(e.target.value as CategoriaMaterialB)}
                                        className="px-3 py-1.5 border border-[#1E3A5F] rounded-lg focus:ring-2 focus:ring-[#1E3A5F]"
                                      >
                                        <option value="whitemed">Whitemed</option>
                                        <option value="bolsa_aph">Bolsa APH</option>
                                        <option value="outros">Outros</option>
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-900 font-medium">
                                        {m.nome}
                                      </span>
                                      {!m.ativo && (
                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                                          Inativo
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Ações */}
                                <div className="flex items-center gap-1">
                                  {itemEmEdicao === m.id ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSalvarEdicao(m.id)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Salvar"
                                      >
                                        <Save size={18} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelarEdicao}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Cancelar"
                                      >
                                        <XCircle size={18} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleIniciarEdicao(m)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                      >
                                        <Edit2 size={18} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAtivo(m.id, m.ativo)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                          m.ativo
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                        title={m.ativo ? 'Desativar' : 'Ativar'}
                                      >
                                        {m.ativo ? 'Ativo' : 'Inativo'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemover(m.id, m.nome)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
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
              className="w-full px-4 py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#2C5282] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
