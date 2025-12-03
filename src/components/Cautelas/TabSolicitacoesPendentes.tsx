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
      <div className="space-y-4">
        {/* Botão Criar */}
        <div>
          <button
            type="button"
            onClick={onOpenModalCriar}
            className="px-5 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            + Criar Nova Solicitação
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
