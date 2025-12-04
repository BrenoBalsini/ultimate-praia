import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { TabCautelasAtivas } from '../../components/Cautelas/TabCautelasAtivas';
import { TabSolicitacoesPendentes } from '../../components/Cautelas/TabSolicitacoesPendentes';
import { ModalDetalhesCautela } from '../../components/Cautelas/ModalDetalhesCautela';
import { FormAdicionarItem } from '../../components/Cautelas/FormAdicionarItem';
import { Timestamp } from 'firebase/firestore';
import type { GVC } from '../../services/gvcService';
import type { Cautela, ItemCautelado, CondicaoItem, Solicitacao } from '../../types/cautelas';
import { obterGVCs } from '../../services/gvcService';
import {
  obterCautelaPorGVC,
  criarCautela,
  adicionarItemCautela,
  devolverItem,
  adicionarMultiplosItens,
} from '../../services/cautelasService';
import {
  criarSolicitacao,
  obterSolicitacoesPendentes,
  obterItensParaEntrega,
  marcarItensEntregues,
} from '../../services/solicitacoesService';

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
  
  // Solicitações
  const [isModalCriarSolicitacaoOpen, setIsModalCriarSolicitacaoOpen] = useState(false);
  const [isModalEntregaOpen, setIsModalEntregaOpen] = useState(false);
  const [solicitacaoParaEntrega, setSolicitacaoParaEntrega] = useState<Solicitacao | null>(null);

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

  const handleSubstituirItem = () => {
    alert('Funcionalidade de substituição em desenvolvimento');
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
      // 1. Obter os itens que foram marcados para entrega
      const itensParaEntrega = await obterItensParaEntrega(
        solicitacaoParaEntrega.id!,
        itensEntreguesIds
      );

      // 2. Buscar ou criar cautela do GVC
      let cautela = await obterCautelaPorGVC(solicitacaoParaEntrega.gvcId);
      if (!cautela) {
        cautela = await criarCautela(
          solicitacaoParaEntrega.gvcId,
          solicitacaoParaEntrega.gvcNome
        );
      }

      // 3. Converter itens solicitados para ItemCautelado com data atual
      const itensParaCautela: ItemCautelado[] = itensParaEntrega.map((item) => ({
        item: item.item,
        tamanho: item.tamanho,
        condicao: item.condicao,
        dataEmprestimo: Timestamp.now(), // Data de hoje
        observacao: '',
      }));

      // 4. Adicionar itens à cautela
      await adicionarMultiplosItens(cautela.id!, itensParaCautela);

      // 5. Marcar itens como entregues na solicitação
      await marcarItensEntregues(solicitacaoParaEntrega.id!, itensEntreguesIds);

      // 6. Atualizar lista de solicitações
      const solicitacoesAtualizadas = await obterSolicitacoesPendentes();
      setSolicitacoes(solicitacoesAtualizadas);

      alert('Itens entregues com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cautelas e Solicitações</h1>
          </div>

          {/* Abas */}
          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAba('cautelas')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  aba === 'cautelas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Cautelas Ativas
              </button>
              <button
                type="button"
                onClick={() => setAba('solicitacoes')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  aba === 'solicitacoes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Solicitações Pendentes
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Carregando...</p>
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
        onSubstituirItem={handleSubstituirItem}
      />

      <FormAdicionarItem
        isOpen={isModalAdicionarOpen}
        onClose={() => setIsModalAdicionarOpen(false)}
        gvcNome={gvcSelecionado?.nome || ''}
        onConfirmar={handleAdicionarItens}
      />
    </div>
  );
};
