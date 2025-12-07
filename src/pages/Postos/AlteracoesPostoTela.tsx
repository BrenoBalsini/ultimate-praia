import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, AlertCircle, Clock, History, X, ArrowRight, Navigation } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import type { NumeroPosto } from '../../types/postos';
import {
  getAlteracoesPostoByNumero,
  addAlteracaoPosto,
  resolverAlteracaoPosto,
  adicionarAndamento,
  type AlteracaoPostoDoc,
} from '../../services/alteracoesService';
import { 
  registrarEventoAlteracaoPosto, 
  registrarAndamentoAlteracao,
  buscarHistorico, 
  type HistoricoDoc 
} from '../../services/historicoService';
import { TipoEvento } from '../../types/postos';

interface EventoAgrupado {
  chave: string;
  titulo: string;
  descricao: string;
  eventos: HistoricoDoc[];
  status: 'aberta' | 'resolvida' | 'em_andamento';
}

interface TimelineEventoProps {
  evento: HistoricoDoc;
  isLast: boolean;
}

const TimelineEvento = ({ evento, isLast }: TimelineEventoProps) => {
  const tipoTexto = () => {
    const mapa: Record<string, string> = {
      alteracao_adicionada: 'Problema registrado',
      alteracao_resolvida: 'Problema resolvido',
      alteracao_posto_andamento: 'Atualização de andamento',
    };
    return mapa[evento.tipo] || evento.tipo;
  };

  const corBolinha = () => {
    if (evento.tipo === 'alteracao_resolvida') return 'bg-emerald-500';
    if (evento.tipo === 'alteracao_adicionada') return 'bg-red-500';
    if (evento.tipo === 'alteracao_posto_andamento') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const data = new Date(evento.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${corBolinha()} ring-4 ring-white flex-shrink-0 mt-1.5`} />
        {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
      </div>

      <div className="flex-1 pb-6">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 group-hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {tipoTexto()}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {data}
            </div>
          </div>

          {evento.observacao && evento.observacao.trim().length > 0 && (
            <p className="text-xs text-gray-700 mt-2 leading-relaxed break-words">
              {evento.observacao}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface TimelineCardProps {
  grupo: EventoAgrupado;
}

const TimelineCard = ({ grupo }: TimelineCardProps) => {
  const [expandido, setExpandido] = useState(true);

  const eventoRecente = grupo.eventos[0];
  const dataRecente = new Date(eventoRecente.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const corBadge = () => {
    if (grupo.status === 'resolvida') return 'bg-emerald-100 text-emerald-800';
    if (grupo.status === 'em_andamento') return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  const textoBadge = () => {
    if (grupo.status === 'resolvida') return 'Resolvida';
    if (grupo.status === 'em_andamento') return 'Em andamento';
    return 'Aberta';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {grupo.titulo}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${corBadge()}`}>
                  {textoBadge()}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                {grupo.descricao}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">
                  {grupo.eventos.length} evento{grupo.eventos.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">
                  {dataRecente}
                </span>
              </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight 
              className={`w-5 h-5 transition-transform ${expandido ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </div>

      {expandido && (
        <div className="p-6 pt-4">
          {grupo.eventos.map((evento, index) => (
            <TimelineEvento
              key={evento.id || `evento-${index}-${evento.createdAt}`}
              evento={evento}
              isLast={index === grupo.eventos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  titulo: string;
  mensagem?: string;
  tipo: 'criar' | 'resolver' | 'andamento';
  onConfirm: (observacao: string) => void;
  onCancel: () => void;
  observacao?: string;
  setObservacao?: (value: string) => void;
  placeholder?: string;
}

const Modal = ({ 
  isOpen, 
  titulo, 
  mensagem,
  tipo,
  onConfirm, 
  onCancel,
  observacao = '',
  setObservacao,
  placeholder = 'Adicione detalhes...'
}: ModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(observacao);
  };

  const corHeader = () => {
    if (tipo === 'resolver') return 'from-emerald-600 to-emerald-700';
    if (tipo === 'andamento') return 'from-blue-600 to-blue-700';
    return 'from-orange-600 to-orange-700';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className={`px-6 py-5 rounded-t-2xl bg-gradient-to-r ${corHeader()}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{titulo}</h3>
              <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {mensagem && (
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {mensagem}
              </p>
            )}

            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {tipo === 'criar' ? 'Descrição do problema' : tipo === 'resolver' ? 'Observação da resolução' : 'Atualização de andamento'}
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao?.(e.target.value)}
              placeholder={placeholder}
              rows={tipo === 'criar' ? 4 : 3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              disabled={tipo === 'criar' && observacao.trim().length === 0}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${corHeader()} hover:opacity-90`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

type ModalConfig = {
  titulo: string;
  mensagem?: string;
  tipo: 'criar' | 'resolver' | 'andamento';
  placeholder?: string;
  onConfirm: (observacao: string) => Promise<void> | void;
};

export const AlteracoesPostoTela = () => {
  const navigate = useNavigate();
  const params = useParams<{ postoNumero: string }>();
  const postoNumero = Number(params.postoNumero) as NumeroPosto;

  const [alteracoes, setAlteracoes] = useState<(AlteracaoPostoDoc & { id: string })[]>([]);
  const [todosEventos, setTodosEventos] = useState<HistoricoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [observacaoModal, setObservacaoModal] = useState('');

  useEffect(() => {
    carregarAlteracoes();
  }, [postoNumero]);

  useEffect(() => {
    carregarHistorico();
  }, [postoNumero]);

  const carregarAlteracoes = async () => {
    try {
      setLoading(true);
      const dados = await getAlteracoesPostoByNumero(postoNumero);
      dados.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAlteracoes(dados);
    } catch (error) {
      console.error('Erro ao carregar alterações:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      setLoadingHistorico(true);
      const eventos = await buscarHistorico();
      const eventosFiltrados = eventos.filter(e => e.postoNumero === postoNumero);
      setTodosEventos(eventosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const eventosAgrupados = useMemo(() => {
    const grupos: Record<string, EventoAgrupado> = {};

    todosEventos.forEach((evento) => {
      if (evento.alteracaoPostoId) {
        const chave = `alteracao-${evento.alteracaoPostoId}`;
        
        if (!grupos[chave]) {
          const alteracao = alteracoes.find(a => a.id === evento.alteracaoPostoId);
          const temAndamento = todosEventos.some(e => 
            e.alteracaoPostoId === evento.alteracaoPostoId && 
            e.tipo === 'alteracao_posto_andamento'
          );
          const estaResolvida = todosEventos.some(e => 
            e.alteracaoPostoId === evento.alteracaoPostoId && 
            e.tipo === 'alteracao_resolvida'
          );

          let status: 'aberta' | 'resolvida' | 'em_andamento' = 'aberta';
          if (estaResolvida) status = 'resolvida';
          else if (temAndamento) status = 'em_andamento';

          grupos[chave] = {
            chave,
            titulo: evento.descricaoAlteracao || alteracao?.descricao || 'Alteração',
            descricao: evento.descricaoAlteracao || alteracao?.descricao || '',
            eventos: [],
            status,
          };
        }

        grupos[chave].eventos.push(evento);
      }
    });

    Object.values(grupos).forEach((grupo) => {
      grupo.eventos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return Object.values(grupos).sort((a, b) => {
      const dataA = new Date(a.eventos[0].createdAt).getTime();
      const dataB = new Date(b.eventos[0].createdAt).getTime();
      return dataB - dataA;
    });
  }, [todosEventos, alteracoes]);

  const abrirModal = (config: ModalConfig) => {
    setModalConfig(config);
    setObservacaoModal('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalConfig(null);
    setObservacaoModal('');
  };

  const handleAdicionar = () => {
    abrirModal({
      titulo: 'Registrar Nova Alteração',
      tipo: 'criar',
      placeholder: 'Ex: "Porta ferrada", "Caixa d\'água quebrada"...',
      onConfirm: async (descricao) => {
        try {
          setAdding(true);
          fecharModal();

          const id = await addAlteracaoPosto({ postoNumero, descricao });

          await registrarEventoAlteracaoPosto({
            tipoEvento: TipoEvento.ALTERACAO_ADICIONADA,
            postoNumero,
            alteracaoPostoId: id,
            observacao: descricao,
          });

          await carregarAlteracoes();
          await carregarHistorico();
        } finally {
          setAdding(false);
        }
      }
    });
  };

  const handleResolver = (id: string, descricao: string) => {
    abrirModal({
      titulo: 'Resolver Problema',
      mensagem: `Marcar como resolvido: "${descricao}"`,
      tipo: 'resolver',
      placeholder: 'Como foi resolvido? (opcional)',
      onConfirm: async (obs) => {
        try {
          fecharModal();
          const observacao = obs.trim().length > 0 ? obs : undefined;

          await resolverAlteracaoPosto({ id, observacao });

          await registrarEventoAlteracaoPosto({
            tipoEvento: TipoEvento.ALTERACAO_RESOLVIDA,
            postoNumero,
            alteracaoPostoId: id,
            observacao,
          });

          await carregarAlteracoes();
          await carregarHistorico();
        } catch (error) {
          console.error('Erro ao resolver:', error);
        }
      }
    });
  };

  const handleDarDestino = (id: string, descricao: string) => {
    abrirModal({
      titulo: 'Atualizar Andamento',
      mensagem: `Adicionar atualização sobre: "${descricao}"`,
      tipo: 'andamento',
      placeholder: 'Ex: "Avisei a prefeitura", "Comprado, aguardando entrega"...',
      onConfirm: async (obs) => {
        try {
          fecharModal();
          
          if (obs.trim().length === 0) return;

          await adicionarAndamento({ alteracaoId: id, observacao: obs });

          await registrarAndamentoAlteracao({
            postoNumero,
            alteracaoPostoId: id,
            descricaoAlteracao: descricao,
            observacao: obs,
          });

          await carregarAlteracoes();
          await carregarHistorico();
        } catch (error) {
          console.error('Erro ao adicionar andamento:', error);
        }
      }
    });
  };

  const abertas = alteracoes.filter(a => !a.resolvido);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/postos')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Alterações do Posto {postoNumero}
                  </h1>
                  <p className="text-orange-100 text-sm">
                    Registros de problemas estruturais
                  </p>
                </div>
              </div>

              <button
                onClick={handleAdicionar}
                disabled={adding}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-all shadow-lg disabled:opacity-60"
              >
                <Plus className="w-5 h-5" />
                {adding ? 'Adicionando...' : 'Adicionar Alteração'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Alterações em Aberto</h2>
            
            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg border">
                <div className="mx-auto mb-4 w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : abertas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma alteração em aberto
                </h3>
                <p className="text-gray-600 text-sm">
                  Todos os problemas foram resolvidos!
                </p>
              </div>
            ) : (
              abertas.map((alt) => {
                const corCard = alt.emAndamento ? 'border-blue-300 bg-blue-50/30' : 'border-orange-200 bg-orange-50/30';
                const corBadge = alt.emAndamento ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
                const textoBadge = alt.emAndamento ? 'Em andamento' : 'Aberta';

                return (
                  <div key={alt.id} className={`bg-white rounded-2xl shadow-lg border-2 ${corCard} p-5 hover:shadow-xl transition-all`}>
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-base font-bold text-gray-900 break-words flex-1">
                          {alt.descricao}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${corBadge}`}>
                          {textoBadge}
                        </span>
                      </div>

                      {alt.emAndamento && alt.ultimoAndamento && (
                        <div className="flex items-start gap-2 p-2.5 bg-blue-100 rounded-lg border border-blue-200 mt-3">
                          <Navigation className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Último andamento:</p>
                            <p className="text-xs text-blue-800 leading-relaxed break-words">
                              {alt.ultimoAndamento}
                            </p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Registrado em {new Date(alt.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDarDestino(alt.id, alt.descricao)}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Dar Destino
                      </button>
                      <button
                        onClick={() => handleResolver(alt.id, alt.descricao)}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      >
                        Resolver
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Timeline de Eventos
              </h2>
              <button
                onClick={() => setMostrarHistorico(!mostrarHistorico)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {mostrarHistorico ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {mostrarHistorico && (
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {loadingHistorico ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg border">
                    <div className="mx-auto mb-3 w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">Carregando histórico...</p>
                  </div>
                ) : eventosAgrupados.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border p-12 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600">Nenhum evento registrado ainda</p>
                  </div>
                ) : (
                  eventosAgrupados.map((grupo) => (
                    <TimelineCard key={grupo.chave} grupo={grupo} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalConfig && (
        <Modal
          isOpen={modalAberto}
          titulo={modalConfig.titulo}
          mensagem={modalConfig.mensagem}
          tipo={modalConfig.tipo}
          onConfirm={modalConfig.onConfirm}
          onCancel={fecharModal}
          observacao={observacaoModal}
          setObservacao={setObservacaoModal}
          placeholder={modalConfig.placeholder}
        />
      )}
    </div>
  );
};
