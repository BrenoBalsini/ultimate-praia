import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { TabCautelasAtivas } from '../../components/Cautelas/TabCautelasAtivas';
import { TabSolicitacoesPendentes } from '../../components/Cautelas/TabSolicitacoesPendentes';
import { ModalDetalhesCautela } from '../../components/Cautelas/ModalDetalhesCautela';
import { FormAdicionarItem } from '../../components/Cautelas/FormAdicionarItem';
import { FormSubstituirItem } from '../../components/Cautelas/FormSubstituirItem';
import { ModalGerenciarItens } from '../../components/Cautelas/ModalGerenciarItens';
import { Timestamp } from 'firebase/firestore';
import { Settings } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import type { Cautela, ItemCautelado, CondicaoItem } from '../../types/cautelas';
import { obterGVCs } from '../../services/gvcService';
import {
  obterCautelaPorGVC,
  criarCautela,
  adicionarItemCautela,
  devolverItem,
  adicionarMultiplosItens,
  substituirItem,
} from '../../services/cautelasService';
import {
  criarSolicitacao,
  obterSolicitacoesPendentes,
  obterItensParaEntrega,
  marcarItensEntregues,
} from '../../services/solicitacoesService';
import type { Solicitacao } from '../../types/cautelas';

type AbaAtiva = 'cautelas' | 'solicitacoes';

export const CautelasPage = () => {
  const [aba, setAba] = useState<AbaAtiva>('cautelas');
  const [gvcs, setGvcs] = useState<GVC[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cautelas
  const [gvcSelecionado, setGvcSelecionado] = useState<GVC | null>(null);
  const [cautelaSelecionada, setCautelaSelecionada] = useState<Cautela | null>(null);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [isModalAdicionarOpen, setIsModalAdicionarOpen] = useState(false);
  const [isModalSubstituirOpen, setIsModalSubstituirOpen] = useState(false);
  const [itemParaSubstituir, setItemParaSubstituir] = useState<ItemCautelado | null>(null);
  
  // Solicitações
  const [isModalCriarSolicitacaoOpen, setIsModalCriarSolicitacaoOpen] = useState(false);
  const [isModalEntregaOpen, setIsModalEntregaOpen] = useState(false);
  const [solicitacaoParaEntrega, setSolicitacaoParaEntrega] = useState<Solicitacao | null>(null);

  // NOVO: Modal Gerenciar Itens
  const [isModalGerenciarItensOpen, setIsModalGerenciarItensOpen] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [gvcsData, solicitacoesData] = await Promise.all([
        obterGVCs(),
        obterSolicitacoesPendentes(),
      ]);
      setGvcs(gvcsData);
      setSolicitacoes(solicitacoesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== CAUTELAS =====
  const handleSelectGVC = async (gvc: GVC) => {
    try {
      setGvcSelecionado(gvc);
      
      let cautela = await obterCautelaPorGVC(gvc.id!);
      
      if (!cautela) {
        cautela = await criarCautela(gvc.id!, gvc.nome);
      }
      
      setCautelaSelecionada(cautela);
      setIsModalDetalhesOpen(true);
    } catch (error) {
      console.error('Erro ao abrir cautela:', error);
      alert('Erro ao carregar dados. Tente novamente.');
    }
  };

  const handleAdicionarItens = async (itens: ItemCautelado[]) => {
    if (!cautelaSelecionada?.id) return;

    try {
      for (const item of itens) {
        await adicionarItemCautela(cautelaSelecionada.id, item);
      }

      const cautelaAtualizada = await obterCautelaPorGVC(cautelaSelecionada.gvcId);
      setCautelaSelecionada(cautelaAtualizada);
    } catch (error) {
      console.error('Erro ao adicionar itens:', error);
      throw error;
    }
  };

  const handleDevolverItem = async (
    itemId: string,
    condicaoFinal: CondicaoItem,
    observacao?: string
  ) => {
    if (!cautelaSelecionada?.id) return;

    try {
      await devolverItem(cautelaSelecionada.id, itemId, condicaoFinal, observacao);
      
      const cautelaAtualizada = await obterCautelaPorGVC(cautelaSelecionada.gvcId);
      setCautelaSelecionada(cautelaAtualizada);
    } catch (error) {
      console.error('Erro ao devolver item:', error);
      throw error;
    }
  };

  const handleAbrirSubstituir = (itemId: string) => {
    if (!cautelaSelecionada) return;
    
    const item = cautelaSelecionada.itensAtivos.find(i => i.id === itemId);
    if (item) {
      setItemParaSubstituir(item);
      setIsModalSubstituirOpen(true);
    }
  };

  const handleConfirmarSubstituicao = async (
    novoItem: ItemCautelado,
    condicaoFinalAntigo: CondicaoItem,
    observacao: string
  ) => {
    if (!cautelaSelecionada?.id || !itemParaSubstituir?.id) return;

    try {
      await substituirItem(
        cautelaSelecionada.id,
        itemParaSubstituir.id,
        novoItem,
        condicaoFinalAntigo,
        observacao
      );

      const cautelaAtualizada = await obterCautelaPorGVC(cautelaSelecionada.gvcId);
      setCautelaSelecionada(cautelaAtualizada);
      setIsModalSubstituirOpen(false);
      setItemParaSubstituir(null);
    } catch (error) {
      console.error('Erro ao substituir item:', error);
      throw error;
    }
  };

  // ===== SOLICITAÇÕES =====
  const handleCriarSolicitacao = async (
    gvcId: string,
    gvcNome: string,
    itens: any[]
  ) => {
    try {
      await criarSolicitacao(gvcId, gvcNome, itens);
      const solicitacoesAtualizadas = await obterSolicitacoesPendentes();
      setSolicitacoes(solicitacoesAtualizadas);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      throw error;
    }
  };

  const handleRealizarEntrega = (solicitacao: Solicitacao) => {
    setSolicitacaoParaEntrega(solicitacao);
    setIsModalEntregaOpen(true);
  };

  const handleConfirmarEntrega = async (itensEntreguesIds: string[]) => {
    if (!solicitacaoParaEntrega) return;

    try {
      const itensParaEntrega = await obterItensParaEntrega(
        solicitacaoParaEntrega.id!,
        itensEntreguesIds
      );

      let cautela = await obterCautelaPorGVC(solicitacaoParaEntrega.gvcId);
      if (!cautela) {
        cautela = await criarCautela(
          solicitacaoParaEntrega.gvcId,
          solicitacaoParaEntrega.gvcNome
        );
      }

      const itensParaCautela: ItemCautelado[] = itensParaEntrega.map((item) => ({
        item: item.item,
        tamanho: item.tamanho,
        condicao: item.condicao,
        dataEmprestimo: Timestamp.now(),
        observacao: '',
      }));

      await adicionarMultiplosItens(cautela.id!, itensParaCautela);
      await marcarItensEntregues(solicitacaoParaEntrega.id!, itensEntreguesIds);

      const solicitacoesAtualizadas = await obterSolicitacoesPendentes();
      setSolicitacoes(solicitacoesAtualizadas);

      alert('Itens entregues com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                  Cautelas e Solicitações
                </h1>
                <p className="text-blue-100 text-sm">
                  Gerenciamento de empréstimos e solicitações de equipamentos
                </p>
              </div>

              {/* NOVO: Botão Gerenciar Itens */}
              <button
                type="button"
                onClick={() => setIsModalGerenciarItensOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                <Settings className="w-5 h-5" />
                Lista de Itens
              </button>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="bg-white rounded-t-2xl border-b-2 border-gray-200 shadow-sm">
          <div className="flex gap-4 px-6">
            <button
              type="button"
              onClick={() => setAba('cautelas')}
              className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                aba === 'cautelas'
                  ? 'border-[#1E3A5F] text-[#1E3A5F]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Cautelas Ativas
            </button>
            <button
              type="button"
              onClick={() => setAba('solicitacoes')}
              className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                aba === 'solicitacoes'
                  ? 'border-[#1E3A5F] text-[#1E3A5F]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Solicitações Pendentes
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-b-2xl shadow-lg border border-gray-200 border-t-0">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="mx-auto mb-4 w-10 h-10 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Carregando...</p>
            </div>
          ) : (
            <>
              {aba === 'cautelas' && (
                <TabCautelasAtivas gvcs={gvcs} onSelectGVC={handleSelectGVC} />
              )}
              {aba === 'solicitacoes' && (
                <TabSolicitacoesPendentes
                  gvcs={gvcs}
                  solicitacoes={solicitacoes}
                  isModalCriarOpen={isModalCriarSolicitacaoOpen}
                  onOpenModalCriar={() => setIsModalCriarSolicitacaoOpen(true)}
                  onCloseModalCriar={() => setIsModalCriarSolicitacaoOpen(false)}
                  onCriarSolicitacao={handleCriarSolicitacao}
                  onRealizarEntrega={handleRealizarEntrega}
                  solicitacaoSelecionada={solicitacaoParaEntrega}
                  isModalEntregaOpen={isModalEntregaOpen}
                  onCloseModalEntrega={() => {
                    setIsModalEntregaOpen(false);
                    setSolicitacaoParaEntrega(null);
                  }}
                  onConfirmarEntrega={handleConfirmarEntrega}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modais de Cautelas */}
      <ModalDetalhesCautela
        isOpen={isModalDetalhesOpen}
        onClose={() => {
          setIsModalDetalhesOpen(false);
          setCautelaSelecionada(null);
          setGvcSelecionado(null);
        }}
        cautela={cautelaSelecionada}
        onAdicionarItem={() => setIsModalAdicionarOpen(true)}
        onDevolverItem={handleDevolverItem}
        onSubstituirItem={handleAbrirSubstituir}
      />

      <FormAdicionarItem
        isOpen={isModalAdicionarOpen}
        onClose={() => setIsModalAdicionarOpen(false)}
        gvcNome={gvcSelecionado?.nome || ''}
        onConfirmar={handleAdicionarItens}
      />

      <FormSubstituirItem
        isOpen={isModalSubstituirOpen}
        onClose={() => {
          setIsModalSubstituirOpen(false);
          setItemParaSubstituir(null);
        }}
        gvcNome={gvcSelecionado?.nome || ''}
        itemAntigo={itemParaSubstituir}
        onConfirmar={handleConfirmarSubstituicao}
      />

      {/* NOVO: Modal Gerenciar Itens */}
      <ModalGerenciarItens
        isOpen={isModalGerenciarItensOpen}
        onClose={() => setIsModalGerenciarItensOpen(false)}
      />
    </div>
  );
};
