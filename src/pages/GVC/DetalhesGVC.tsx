import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Power } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { obterDetalhesGVC, type DetalhesGVCCompleto } from '../../services/gvcDetalhesService';
import { AlteracoesCard } from '../../components/GVC/Detalhes/AlteracoesCard';
import { ElogiosCard } from '../../components/GVC/Detalhes/ElogiosCard';
import { ConceitosCard } from '../../components/GVC/Detalhes/ConceitosCard';
import { CautelasCard } from '../../components/GVC/Detalhes/CautelasCard';
import { SolicitacoesCard } from '../../components/GVC/Detalhes/SolicitacoesCard';
import { HistoricoTimeline } from '../../components/GVC/Detalhes/HistoricoTimeline';
import { FormGVC } from '../../components/GVC/FormGVC';
import { toggleStatusGVC, deletarGVC, atualizarGVC, type GVC } from '../../services/gvcService';
import toast from 'react-hot-toast';

export const DetalhesGVC = () => {
  const { gvcId } = useParams<{ gvcId: string }>();
  const navigate = useNavigate();
  const [detalhes, setDetalhes] = useState<DetalhesGVCCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState<'resumo' | 'historico'>('resumo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!gvcId) return;
    
    const carregarDetalhes = async () => {
      try {
        setIsLoading(true);
        const dados = await obterDetalhesGVC(gvcId);
        setDetalhes(dados);
      } catch (error) {
        console.error('Erro ao carregar detalhes do GVC:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDetalhes();
  }, [gvcId]);

  const handleToggleStatus = async () => {
    if (!detalhes?.gvc.id) return;

    try {
      const novoStatus = await toggleStatusGVC(detalhes.gvc.id, detalhes.gvc.status);
      setDetalhes({
        ...detalhes,
        gvc: {
          ...detalhes.gvc,
          status: novoStatus as 'ativo' | 'inativo',
        },
      });
      toast.success(`GVC ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do GVC');
    }
  };

  const handleEditar = () => {
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (formData: Omit<GVC, 'id'>) => {
    if (!detalhes?.gvc.id) return;

    try {
      await atualizarGVC(detalhes.gvc.id, formData);
      
      // Atualizar estado local
      setDetalhes({
        ...detalhes,
        gvc: {
          ...detalhes.gvc,
          ...formData,
        },
      });
      
      toast.success('GVC atualizado com sucesso');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar GVC:', error);
      toast.error('Erro ao atualizar GVC');
      throw error;
    }
  };

  const handleDeletar = async () => {
    if (!detalhes?.gvc.id) return;

    if (window.confirm(`Tem certeza que deseja deletar ${detalhes.gvc.nome}? Esta ação não pode ser desfeita.`)) {
      try {
        await deletarGVC(detalhes.gvc.id);
        toast.success('GVC deletado com sucesso');
        navigate('/gvcs');
      } catch (error) {
        console.error('Erro ao deletar GVC:', error);
        toast.error('Erro ao deletar GVC');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!detalhes) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">GVC não encontrado</h2>
            <p className="text-sm text-gray-500 mb-6">O guarda-vidas solicitado não existe ou foi removido do sistema.</p>
            <button
              onClick={() => navigate('/gvcs')}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Voltar para listagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { gvc, alteracoes, elogios, conceitos, cautelas, solicitacoes, historico } = detalhes;

  // Estatísticas
  const stats = [
    {
      label: 'Alterações',
      value: alteracoes.length,
      description: 'Registros disciplinares',
    },
    {
      label: 'Elogios',
      value: elogios.length,
      description: 'Reconhecimentos',
    },
    {
      label: 'Conceitos',
      value: conceitos.length,
      description: 'Avaliações',
    },
    {
      label: 'Cautelas Ativas',
      value: cautelas.filter(c => c.itensAtivos.length > 0).length,
      description: 'Equipamentos em uso',
    },
    {
      label: 'Solicitações',
      value: solicitacoes.filter(s => s.status !== 'concluida').length,
      description: 'Pendentes',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/gvcs')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para GVCs
        </button>

        {/* Card Principal */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Informações do GVC */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{gvc.nome}</h1>
                    <span className="text-gray-600">{gvc.re}</span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
 

                  {gvc.postoFixo && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Posto Fixo:</span>{' '}
                      <span className="text-gray-600">{gvc.postoFixo}</span>
                    </div>
                  )}
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      gvc.status === 'ativo' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {gvc.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                <button
                  onClick={handleEditar}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                <button
                  onClick={handleToggleStatus}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    gvc.status === 'ativo'
                      ? 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {gvc.status === 'ativo' ? 'Desativar' : 'Ativar'}
                  </span>
                </button>

                <button
                  onClick={handleDeletar}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Deletar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-4 sm:p-6 ${
                  index < stats.length - 1 ? 'border-r border-gray-200' : ''
                } ${index >= 2 && index < stats.length - 1 ? 'lg:border-r' : ''} ${
                  index === 2 ? 'border-r-0 sm:border-r lg:border-r' : ''
                }`}
              >
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setTabAtiva('resumo')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tabAtiva === 'resumo'
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Resumo Geral
              </button>
              <button
                onClick={() => setTabAtiva('historico')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tabAtiva === 'historico'
                    ? 'border-gray-900 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Histórico Completo
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {tabAtiva === 'resumo' ? (
              <div className="space-y-6">
                <AlteracoesCard alteracoes={alteracoes} gvcNome={gvc.nome} />
                <ElogiosCard elogios={elogios} gvcNome={gvc.nome} />
                <ConceitosCard conceitos={conceitos} gvcNome={gvc.nome} />
                <CautelasCard cautelas={cautelas} gvcNome={gvc.nome} />
                <SolicitacoesCard solicitacoes={solicitacoes} gvcNome={gvc.nome} />
              </div>
            ) : (
              <HistoricoTimeline historico={historico} />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <FormGVC
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        gvcInicial={gvc}
        isEditing={true}
        permitirCadastroEmLote={false}
      />
    </div>
  );
};
