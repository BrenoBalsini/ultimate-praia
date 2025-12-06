import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, AlertTriangle, Award, Star, Package, FileText, TrendingUp } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { obterDetalhesGVC, type DetalhesGVCCompleto } from "../../services/gvcDetalhesService";
import { AlteracoesCard } from '../../components/GVC/Detalhes/AlteracoesCard';
import { ElogiosCard } from '../../components/GVC/Detalhes/ElogiosCard';
import { ConceitosCard } from '../../components/GVC/Detalhes/ConceitosCard';
import { CautelasCard } from '../../components/GVC/Detalhes/CautelasCard';
import { SolicitacoesCard } from '../../components/GVC/Detalhes/SolicitacoesCard';
import { HistoricoTimeline } from '../../components/GVC/Detalhes/HistoricoTimeline';

export const DetalhesGVC = () => {
  const { gvcId } = useParams<{ gvcId: string }>();
  const navigate = useNavigate();
  const [detalhes, setDetalhes] = useState<DetalhesGVCCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState<'resumo' | 'historico'>('resumo');

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando informações...</p>
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
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 w-16 h-16 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">GVC não encontrado</h2>
            <button
              onClick={() => navigate('/gvcs')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Voltar para listagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { gvc, alteracoes, elogios, conceitos, cautelas, solicitacoes, historico } = detalhes;

  // Estatísticas rápidas
  const stats = {
    alteracoes: alteracoes.length,
    elogios: elogios.length,
    conceitos: conceitos.length,
    cautelasAtivas: cautelas.filter(c => c.itensAtivos.length > 0).length,
    solicitacoesPendentes: solicitacoes.filter(s => s.status !== 'concluida').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {/* Header com Voltar */}
        <button
          onClick={() => navigate('/gvcs')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para GVCs</span>
        </button>

        {/* Card de Informações Principais */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{gvc.nome}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <strong>RE:</strong> {gvc.re}
                  </span>
                  <span className="flex items-center gap-1">
                    <strong>Posto Fixo:</strong> {gvc.postoFixo || 'Não definido'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gvc.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {gvc.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.alteracoes}</p>
                <p className="text-xs text-gray-600 mt-1">Alterações</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.elogios}</p>
                <p className="text-xs text-gray-600 mt-1">Elogios</p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.conceitos}</p>
                <p className="text-xs text-gray-600 mt-1">Conceitos</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.cautelasAtivas}</p>
                <p className="text-xs text-gray-600 mt-1">Cautelas Ativas</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.solicitacoesPendentes}</p>
                <p className="text-xs text-gray-600 mt-1">Solicitações</p>
              </div>
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setTabAtiva('resumo')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tabAtiva === 'resumo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Resumo Geral
                </div>
              </button>
              <button
                onClick={() => setTabAtiva('historico')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tabAtiva === 'historico'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Histórico Completo
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {tabAtiva === 'resumo' ? (
              <div className="space-y-6">
                {/* Alterações */}
                <AlteracoesCard alteracoes={alteracoes} gvcNome={gvc.nome} />
                
                {/* Elogios */}
                <ElogiosCard elogios={elogios} gvcNome={gvc.nome} />
                
                {/* Conceitos */}
                <ConceitosCard conceitos={conceitos} gvcNome={gvc.nome} />
                
                {/* Cautelas Ativas */}
                <CautelasCard cautelas={cautelas} gvcNome={gvc.nome} />
                
                {/* Solicitações */}
                <SolicitacoesCard solicitacoes={solicitacoes} gvcNome={gvc.nome} />
              </div>
            ) : (
              <HistoricoTimeline historico={historico} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
