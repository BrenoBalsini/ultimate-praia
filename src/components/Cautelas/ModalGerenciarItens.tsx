import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, Settings } from 'lucide-react';
import type { ItemCautelavel } from '../../types/cautelas';
import {
  obterItensCautelaveis,
  criarItemCautelavel,
  atualizarItemCautelavel,
  excluirItemCautelavel,
  inicializarItensPadrao,
} from '../../services/itensCautelaveisService';
import toast from 'react-hot-toast';

interface ModalGerenciarItensProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalGerenciarItens = ({ isOpen, onClose }: ModalGerenciarItensProps) => {
  const [itens, setItens] = useState<ItemCautelavel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemEmEdicao, setItemEmEdicao] = useState<string | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [novoItemNome, setNovoItemNome] = useState('');
  const [isAdicionando, setIsAdicionando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarItens();
    }
  }, [isOpen]);

  const carregarItens = async () => {
    try {
      setIsLoading(true);
      const dados = await obterItensCautelaveis(false); // Todos os itens, ativos e inativos
      
      if (dados.length === 0) {
        // Inicializar com itens padrão se não houver nenhum
        await inicializarItensPadrao();
        const dadosAposInicializacao = await obterItensCautelaveis(false);
        setItens(dadosAposInicializacao);
      } else {
        setItens(dados);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdicionarItem = async () => {
    if (!novoItemNome.trim()) {
      toast.error('Digite o nome do item');
      return;
    }

    // Verificar se já existe
    const jaExiste = itens.some(
      item => item.nome.toLowerCase() === novoItemNome.trim().toLowerCase()
    );

    if (jaExiste) {
      toast.error('Este item já existe na lista');
      return;
    }

    try {
      setIsAdicionando(true);
      const novoItem = await criarItemCautelavel(novoItemNome);
      setItens(prev => [...prev, novoItem]);
      setNovoItemNome('');
      toast.success('Item adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    } finally {
      setIsAdicionando(false);
    }
  };

  const handleIniciarEdicao = (item: ItemCautelavel) => {
    setItemEmEdicao(item.id!);
    setNomeEditando(item.nome);
  };

  const handleSalvarEdicao = async (id: string) => {
    if (!nomeEditando.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    try {
      await atualizarItemCautelavel(id, { nome: nomeEditando });
      setItens(prev =>
        prev.map(item =>
          item.id === id ? { ...item, nome: nomeEditando.trim().toLowerCase() } : item
        )
      );
      setItemEmEdicao(null);
      setNomeEditando('');
      toast.success('Item atualizado!');
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
      await atualizarItemCautelavel(id, { ativo: !ativoAtual });
      setItens(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ativo: !ativoAtual } : item
        )
      );
      toast.success(ativoAtual ? 'Item desativado' : 'Item ativado');
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await excluirItemCautelavel(id);
      setItens(prev => prev.filter(item => item.id !== id));
      toast.success('Item excluído');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir item');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="w-full sm:max-w-3xl bg-white sm:rounded-lg shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Gerenciar Itens Cauteláveis
                    </h2>
                    <p className="text-sm text-blue-100">
                      Configure os itens disponíveis para cautela
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Formulário Adicionar */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Adicionar Novo Item
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoItemNome}
                    onChange={(e) => setNovoItemNome(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdicionarItem()}
                    placeholder="Nome do item (ex: toalha, protetor solar...)"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                    disabled={isAdicionando}
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarItem}
                    disabled={isAdicionando || !novoItemNome.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={18} />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Lista de Itens */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 w-10 h-10 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600 text-sm">Carregando itens...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Itens Cadastrados
                    </h3>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {itens.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {itens.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nenhum item cadastrado ainda.</p>
                        <p className="text-sm mt-1">Adicione o primeiro item acima!</p>
                      </div>
                    ) : (
                      itens.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                            item.ativo
                              ? 'bg-white border-gray-200 hover:border-[#1E3A5F]'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                        >
                          {/* Conteúdo */}
                          <div className="flex-1">
                            {itemEmEdicao === item.id ? (
                              <input
                                type="text"
                                value={nomeEditando}
                                onChange={(e) => setNomeEditando(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSalvarEdicao(item.id!);
                                  if (e.key === 'Escape') handleCancelarEdicao();
                                }}
                                className="w-full px-3 py-1.5 border border-[#1E3A5F] rounded focus:ring-2 focus:ring-[#1E3A5F]"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-medium capitalize">
                                  {item.nome}
                                </span>
                                {!item.ativo && (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                                    Inativo
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-1">
                            {itemEmEdicao === item.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSalvarEdicao(item.id!)}
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
                                  onClick={() => handleIniciarEdicao(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAtivo(item.id!, item.ativo)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    item.ativo
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                  title={item.ativo ? 'Desativar' : 'Ativar'}
                                >
                                  {item.ativo ? 'Ativo' : 'Inativo'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExcluir(item.id!, item.nome)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-2.5 text-sm font-semibold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#2C5282] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
