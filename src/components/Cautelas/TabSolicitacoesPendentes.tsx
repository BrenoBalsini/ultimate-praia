import { Plus } from 'lucide-react';
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
  return (
    <>
      <div className="space-y-6">
        {/* Header com botão */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Solicitações Pendentes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {solicitacoes.length === 0 
                ? 'Nenhuma solicitação no momento'
                : `${solicitacoes.length} ${solicitacoes.length === 1 ? 'solicitação' : 'solicitações'} aguardando entrega`
              }
            </p>
          </div>
          
          <button
            type="button"
            onClick={onOpenModalCriar}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Solicitação</span>
          </button>
        </div>

        {/* Lista */}
        <ListaSolicitacoes
          solicitacoes={solicitacoes}
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
