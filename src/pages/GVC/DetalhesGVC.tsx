import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Power, 
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  AlertTriangle,
  Package,
  FileText,
  User,
  MapPin
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Navbar } from '../../components/Navbar';
import { obterDetalhesGVC, type DetalhesGVCCompleto } from '../../services/gvcDetalhesService';
import { FormGVC } from '../../components/GVC/FormGVC';
import { toggleStatusGVC, deletarGVC, atualizarGVC, type GVC } from '../../services/gvcService';
import type { Alteracao } from '../../types/alteracoes';
import type { CondicaoItem } from '../../types/cautelas';
import toast from 'react-hot-toast';

type SecaoExpandida = 'alteracoes' | 'elogios' | 'conceitos' | 'cautelas' | 'solicitacoes' | null;

export const DetalhesGVC = () => {
  const { gvcId } = useParams<{ gvcId: string }>();
  const navigate = useNavigate();
  const [detalhes, setDetalhes] = useState<DetalhesGVCCompleto | null>(null);
  const [alteracoesGVC, setAlteracoesGVC] = useState<Alteracao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [secaoExpandida, setSecaoExpandida] = useState<SecaoExpandida>(null);
  const [itensExpandidos, setItensExpandidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!gvcId) return;
    
    const carregarDetalhes = async () => {
      try {
        setIsLoading(true);
        const dados = await obterDetalhesGVC(gvcId);
        setDetalhes(dados);

        // Buscar alterações diretamente da coleção 'alteracoes'
        const alteracoesQuery = query(
          collection(db, 'alteracoes'),
          where('gvcId', '==', gvcId),
          orderBy('criadoEm', 'desc')
        );
        const alteracoesSnap = await getDocs(alteracoesQuery);
        const alteracoesList: Alteracao[] = alteracoesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Alteracao));
        
        setAlteracoesGVC(alteracoesList);
      } catch (error) {
        console.error('Erro ao carregar detalhes do GVC:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDetalhes();
  }, [gvcId]);

  const formatarDataCurta = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatarData = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getCondicaoBadge = (condicao: CondicaoItem) => {
    const cores = {
      Bom: 'bg-green-100 text-green-700',
      Regular: 'bg-yellow-100 text-yellow-700',
      Ruim: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cores[condicao]}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        {condicao}
      </span>
    );
  };

  const toggleSecao = (secao: SecaoExpandida) => {
    setSecaoExpandida(secaoExpandida === secao ? null : secao);
  };

  const toggleExpandir = (nomeItem: string) => {
    const novosExpandidos = new Set(itensExpandidos);
    if (novosExpandidos.has(nomeItem)) {
      novosExpandidos.delete(nomeItem);
    } else {
      novosExpandidos.add(nomeItem);
    }
    setItensExpandidos(novosExpandidos);
  };

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

  // Agrupar itens cautelados por nome
  const agruparItensCautela = () => {
    if (!detalhes?.cautelas) return [];
    
    const grupos = new Map<string, any[]>();
    
    detalhes.cautelas.forEach((cautela) => {
      cautela.itensAtivos?.forEach((item: any) => {
        const nomeItem = item.item.toLowerCase();
        if (!grupos.has(nomeItem)) {
          grupos.set(nomeItem, []);
        }
        grupos.get(nomeItem)!.push({ ...item, cautelaId: cautela.id });
      });
    });
    
    return Array.from(grupos.entries()).map(([nomeItem, itens]) => ({
      nomeItem,
      quantidade: itens.length,
      itens,
      expandido: itensExpandidos.has(nomeItem),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 font-medium">Carregando informações...</p>
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
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">GVC não encontrado</h2>
            <p className="text-sm text-gray-500 mb-6">O guarda-vidas solicitado não existe ou foi removido do sistema.</p>
            <button
              onClick={() => navigate('/gvcs')}
              className="px-6 py-3 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#2C5282] transition-colors"
            >
              Voltar para listagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { gvc, elogios, conceitos, cautelas, solicitacoes } = detalhes;

  const cautelasAtivas = cautelas.filter(c => c.itensAtivos && c.itensAtivos.length > 0);
  const totalItensCautelados = cautelasAtivas.reduce((acc, c) => acc + (c.itensAtivos?.length || 0), 0);
  const itensAgrupadosCautela = agruparItensCautela();
  const solicitacoesPendentes = solicitacoes.filter(s => s.itens && s.itens.some(i => !i.entregue));
  
  // Histórico de todas as cautelas
  const historicoTotal = cautelas.flatMap(c => c.historico || []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/gvcs')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Voltar para GVCs</span>
        </button>

        {/* Header Card */}
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Topo com gradiente */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{gvc.nome}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        gvc.status === 'ativo' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}>
                        {gvc.status === 'ativo' ? '● Ativo' : '● Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {gvc.postoFixo && (
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{gvc.postoFixo}</span>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleEditar}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={handleToggleStatus}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-colors"
                >
                  <Power className="w-4 h-4" />
                  <span>{gvc.status === 'ativo' ? 'Desativar' : 'Ativar'}</span>
                </button>

                <button
                  onClick={handleDeletar}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600/90 hover:bg-red-600 backdrop-blur-sm border border-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Deletar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t-4 border-[#C53030]">
            <div className="p-6 border-r-2 border-b-2 sm:border-b-0 border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{alteracoesGVC.length}</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Alterações</div>
              <div className="text-xs text-gray-500 mt-0.5">Disciplinares</div>
            </div>
            <div className="p-6 border-r-2 lg:border-r-2 border-b-2 sm:border-b-0 border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{elogios.length}</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Elogios</div>
              <div className="text-xs text-gray-500 mt-0.5">Reconhecimentos</div>
            </div>
            <div className="p-6 border-r-2 border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{conceitos.length}</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Conceitos</div>
              <div className="text-xs text-gray-500 mt-0.5">Avaliações</div>
            </div>
            <div className="p-6 border-r-2 lg:border-r-2 border-gray-100">
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalItensCautelados}</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Itens</div>
              <div className="text-xs text-gray-500 mt-0.5">Cautelados</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">{solicitacoesPendentes.length}</div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Solicitações</div>
              <div className="text-xs text-gray-500 mt-0.5">Pendentes</div>
            </div>
          </div>
        </div>

        {/* Seções Expansíveis */}
        <div className="space-y-4">
          {/* ALTERAÇÕES */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSecao('alteracoes')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900">Alterações Disciplinares</h3>
                  <p className="text-sm text-gray-500">{alteracoesGVC.length} registro(s)</p>
                </div>
              </div>
              {secaoExpandida === 'alteracoes' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {secaoExpandida === 'alteracoes' && (
              <div className="border-t-2 border-gray-100 p-6">
                {alteracoesGVC.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Nenhuma alteração registrada</p>
                ) : (
                  <div className="space-y-3">
                    {alteracoesGVC.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{alt.tipo}</p>
                            <p className="text-sm text-gray-700">{alt.descricao}</p>
                            {alt.tipo === 'Suspensão' && alt.diasSuspensao && (
                              <p className="text-sm text-red-600 mt-1">
                                <span className="font-medium">Dias de suspensão:</span> {alt.diasSuspensao}
                              </p>
                            )}
                          </div>
                          {alt.criadoEm && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatarDataCurta(alt.criadoEm)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ELOGIOS */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSecao('elogios')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900">Elogios e Reconhecimentos</h3>
                  <p className="text-sm text-gray-500">{elogios.length} registro(s)</p>
                </div>
              </div>
              {secaoExpandida === 'elogios' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {secaoExpandida === 'elogios' && (
              <div className="border-t-2 border-gray-100 p-6">
                {elogios.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Nenhum elogio registrado</p>
                ) : (
                  <div className="space-y-3">
                    {elogios.map((elog) => (
                      <div
                        key={elog.id}
                        className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{elog.titulo}</p>
                            {elog.descricao && (
                              <p className="text-sm text-gray-700">{elog.descricao}</p>
                            )}
                          </div>
                          {elog.criadoEm && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatarDataCurta(elog.criadoEm)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CONCEITOS */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSecao('conceitos')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900">Conceitos e Avaliações</h3>
                  <p className="text-sm text-gray-500">{conceitos.length} registro(s)</p>
                </div>
              </div>
              {secaoExpandida === 'conceitos' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {secaoExpandida === 'conceitos' && (
              <div className="border-t-2 border-gray-100 p-6">
                {conceitos.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Nenhum conceito registrado</p>
                ) : (
                  <div className="space-y-3">
                    {conceitos.map((conc) => (
                      <div
                        key={conc.id}
                        className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{conc.conceito}</p>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                conc.polaridade === 'Positivo' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {conc.polaridade}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{conc.descricao}</p>
                          </div>
                          {conc.criadoEm && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatarDataCurta(conc.criadoEm)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CAUTELAS */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSecao('cautelas')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900">Equipamentos Cautelados</h3>
                  <p className="text-sm text-gray-500">{totalItensCautelados} item(ns) ativo(s)</p>
                </div>
              </div>
              {secaoExpandida === 'cautelas' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {secaoExpandida === 'cautelas' && (
              <div className="border-t-2 border-gray-100 p-6 space-y-6">
                {/* ITENS ATIVOS */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Itens Cautelados
                  </h4>
                  
                  {itensAgrupadosCautela.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      Nenhum equipamento cautelado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {itensAgrupadosCautela.map((grupo) => (
                        <div key={grupo.nomeItem} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleExpandir(grupo.nomeItem)}
                            className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900 capitalize">
                                {grupo.nomeItem}
                              </span>
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                {grupo.quantidade}
                              </span>
                            </div>
                            {grupo.expandido ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>

                          {grupo.expandido && (
                            <div className="bg-white divide-y divide-gray-200">
                              {grupo.itens.map((item: any, idx: number) => (
                                <div key={idx} className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Tamanho:</span>
                                        <span className="text-sm font-semibold text-gray-900">{item.tamanho}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Condição:</span>
                                        {getCondicaoBadge(item.condicao)}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Data:</span> {formatarData(item.dataEmprestimo)}
                                      </div>
                                      {item.observacao && (
                                        <div className="text-sm text-gray-600 pt-2 border-t border-gray-100">
                                          <span className="font-medium">Obs:</span> {item.observacao}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HISTÓRICO */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Histórico
                  </h4>
                  
                  {historicoTotal.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      Nenhum registro no histórico
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {historicoTotal.map((hist, idx) => (
                        <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 capitalize">{hist.item}</span>
                            <span className="text-sm text-gray-600">{hist.tamanho}</span>
                          </div>
                          <div className="flex gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Inicial</p>
                              {getCondicaoBadge(hist.condicaoInicial)}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Final</p>
                              {getCondicaoBadge(hist.condicaoFinal)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>← {formatarData(hist.dataEmprestimo)}</div>
                            <div>→ {formatarData(hist.dataDevolucao)}</div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Tipo:</span> {hist.tipo}
                          </div>
                          {hist.observacao && (
                            <div className="text-sm text-gray-600 pt-2 border-t border-gray-100">
                              <span className="font-medium">Obs:</span> {hist.observacao}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SOLICITAÇÕES */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSecao('solicitacoes')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-gray-900">Solicitações de Equipamentos</h3>
                  <p className="text-sm text-gray-500">{solicitacoesPendentes.length} pendente(s)</p>
                </div>
              </div>
              {secaoExpandida === 'solicitacoes' ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {secaoExpandida === 'solicitacoes' && (
              <div className="border-t-2 border-gray-100 p-6">
                {solicitacoesPendentes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Nenhuma solicitação pendente</p>
                ) : (
                  <div className="space-y-3">
                    {solicitacoesPendentes.map((sol) => {
                      const itensPendentes = sol.itens?.filter(i => !i.entregue) || [];
                      return (
                        <div
                          key={sol.id}
                          className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-2">Solicitação</p>
                              <div className="space-y-1">
                                {itensPendentes.map((item) => (
                                  <div key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    <span>
                                      {item.item}
                                      {item.tamanho !== '-' && (
                                        <span className="text-gray-500 ml-1">({item.tamanho})</span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {sol.criadaEm && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatarDataCurta(sol.criadaEm)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
