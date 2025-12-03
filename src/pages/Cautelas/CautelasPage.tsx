import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { TabCautelasAtivas } from '../../components/Cautelas/TabCautelasAtivas';
import { TabSolicitacoesPendentes } from '../../components/Cautelas/TabSolicitacoesPendentes';
import { ModalDetalhesCautela } from '../../components/Cautelas/ModalDetalhesCautela';
import { FormAdicionarItem } from '../../components/Cautelas/FormAdicionarItem';
import type { GVC } from '../../services/gvcService';
import type { Cautela, ItemCautelado, CondicaoItem } from '../../types/cautelas';
import { obterGVCs } from '../../services/gvcService';
import {
  obterCautelaPorGVC,
  criarCautela,
  adicionarItemCautela,
  devolverItem,
} from '../../services/cautelasService';

type AbaAtiva = 'cautelas' | 'solicitacoes';

export const CautelasPage = () => {
  const [aba, setAba] = useState<AbaAtiva>('cautelas');
  const [gvcs, setGvcs] = useState<GVC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gvcSelecionado, setGvcSelecionado] = useState<GVC | null>(null);
  const [cautelaSelecionada, setCautelaSelecionada] = useState<Cautela | null>(null);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [isModalAdicionarOpen, setIsModalAdicionarOpen] = useState(false);

  useEffect(() => {
    carregarGVCs();
  }, []);

  const carregarGVCs = async () => {
    try {
      setIsLoading(true);
      const dados = await obterGVCs();
      setGvcs(dados);
    } catch (error) {
      console.error('Erro ao carregar GVCs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGVC = async (gvc: GVC) => {
    try {
      setGvcSelecionado(gvc);
      
      // Buscar ou criar cautela do GVC
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
      // Adicionar cada item
      for (const item of itens) {
        await adicionarItemCautela(cautelaSelecionada.id, item);
      }

      // Recarregar cautela
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
      
      // Recarregar cautela
      const cautelaAtualizada = await obterCautelaPorGVC(cautelaSelecionada.gvcId);
      setCautelaSelecionada(cautelaAtualizada);
    } catch (error) {
      console.error('Erro ao devolver item:', error);
      throw error;
    }
  };

  const handleSubstituirItem = (itemId: string) => {
    // TODO: Implementar modal de substituição
    alert('Funcionalidade de substituição em desenvolvimento');
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
              {aba === 'solicitacoes' && <TabSolicitacoesPendentes />}
            </>
          )}
        </div>
      </div>

      {/* Modais */}
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
