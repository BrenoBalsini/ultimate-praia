import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { FormCriarSolicitacao } from '../Solicitacoes/FormCriarSolicitacao';
import { ListaSolicitacoes } from '../Solicitacoes/ListaSolicitacoes';
import { ModalConfirmarEntrega } from '../Solicitacoes/ModalConfirmarEntrega';
import type { GVC } from '../../services/gvcService';
import type { Solicitacao } from '../../types/cautelas';

interface TabSolicitacoesPendentesProps {
  gvcs: GVC[];
  solicitacoes: Solicitacao[];
  isModalCriarOpen: boolean;
  onOpenModalCriar: () => void;
  onCloseModalCriar: () => void;
  onCriarSolicitacao: (gvcId: string, gvcNome: string, itens: any[]) => Promise<void>;
  onRealizarEntrega: (solicitacao: Solicitacao) => void;
  solicitacaoSelecionada: Solicitacao | null;
  isModalEntregaOpen: boolean;
  onCloseModalEntrega: () => void;
  onConfirmarEntrega: (itensEntreguesIds: string[]) => Promise<void>;
}

export const TabSolicitacoesPendentes = ({
  gvcs,
  solicitacoes,
  isModalCriarOpen,
  onOpenModalCriar,
  onCloseModalCriar,
  onCriarSolicitacao,
  onRealizarEntrega,
  solicitacaoSelecionada,
  isModalEntregaOpen,
  onCloseModalEntrega,
  onConfirmarEntrega,
}: TabSolicitacoesPendentesProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar solicitações pela pesquisa
  const solicitacoesFiltradas = solicitacoes.filter((solicitacao) => {
    const matchSearch = solicitacao.gvcNome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header com botão e filtro */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Solicitações Pendentes</h2>
              <p className="text-sm text-gray-500 mt-1">
                {solicitacoesFiltradas.length === 0 
                  ? 'Nenhuma solicitação no momento'
                  : `${solicitacoesFiltradas.length} ${solicitacoesFiltradas.length === 1 ? 'solicitação' : 'solicitações'} aguardando entrega`
                }
              </p>
            </div>
            
            <button
              type="button"
              onClick={onOpenModalCriar}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Criar Nova Solicitação</span>
              <span className="sm:hidden">Nova Solicitação</span>
            </button>
          </div>

          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome do guarda-vidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors text-base"
            />
          </div>
        </div>

        {/* Lista */}
        <ListaSolicitacoes
          solicitacoes={solicitacoesFiltradas}
          onRealizarEntrega={onRealizarEntrega}
        />
      </div>

      {/* Modais */}
      <FormCriarSolicitacao
        isOpen={isModalCriarOpen}
        onClose={onCloseModalCriar}
        gvcs={gvcs}
        onSubmit={onCriarSolicitacao}
      />

      <ModalConfirmarEntrega
        isOpen={isModalEntregaOpen}
        onClose={onCloseModalEntrega}
        solicitacao={solicitacaoSelecionada}
        onConfirmar={onConfirmarEntrega}
      />
    </>
  );
};
