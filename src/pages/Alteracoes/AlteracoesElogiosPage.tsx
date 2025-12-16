import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { FormAlteracao } from '../../components/Alteracoes/FormAlteracao';
import { ListaAlteracoes } from '../../components/Alteracoes/ListaAlteracoes';
import { FormElogio } from '../../components/Alteracoes/FormElogio';
import { ListaElogios } from '../../components/Alteracoes/ListaElogios';
import { FormConceito } from '../../components/Alteracoes/FormConceito';
import { ListaConceitos } from '../../components/Alteracoes/ListaConceitos';
import { AlertCircle, Award, Target } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import type { Alteracao, Elogio, Conceito } from '../../types/alteracoes';
import { obterGVCs } from '../../services/gvcService';
import {
  criarAlteracao,
  obterAlteracoesAtivas,
  obterHistoricoAlteracoes,
  marcarAlteracaoComoInserida,
  deletarAlteracao,
  criarElogio,
  obterElogiosAtivos,
  obterHistoricoElogios,
  marcarElogioComoInserido,
  deletarElogio,
  criarConceito,
  obterConceitosAtivos,
  obterHistoricoConceitos,
  marcarConceitoComoInserido,
  deletarConceito,
} from '../../services/alteracoesElogiosService';
import { useAuth } from '../../hooks/useAuth';

type AbaAtiva = 'alteracoes' | 'elogios' | 'conceitos';
type SubAba = 'ativos' | 'historico';

export const AlteracoesElogiosPage = () => {
  const { user } = useAuth();
  const [aba, setAba] = useState<AbaAtiva>('alteracoes');
  const [subAba, setSubAba] = useState<SubAba>('ativos');
  const [gvcs, setGvcs] = useState<GVC[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Alterações
  const [alteracoesAtivas, setAlteracoesAtivas] = useState<Alteracao[]>([]);
  const [historicoAlteracoes, setHistoricoAlteracoes] = useState<Alteracao[]>([]);
  const [isModalAlteracaoOpen, setIsModalAlteracaoOpen] = useState(false);

  // Elogios
  const [elogiosAtivos, setElogiosAtivos] = useState<Elogio[]>([]);
  const [historicoElogios, setHistoricoElogios] = useState<Elogio[]>([]);
  const [isModalElogioOpen, setIsModalElogioOpen] = useState(false);

  // Conceitos
  const [conceitosAtivos, setConceitosAtivos] = useState<Conceito[]>([]);
  const [historicoConceitos, setHistoricoConceitos] = useState<Conceito[]>([]);
  const [isModalConceitoOpen, setIsModalConceitoOpen] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [
        gvcsData,
        alteracoesAtivasData,
        historicoAlteracoesData,
        elogiosAtivosData,
        historicoElogiosData,
        conceitosAtivosData,
        historicoConceitosData,
      ] = await Promise.all([
        obterGVCs(),
        obterAlteracoesAtivas(),
        obterHistoricoAlteracoes(),
        obterElogiosAtivos(),
        obterHistoricoElogios(),
        obterConceitosAtivos(),
        obterHistoricoConceitos(),
      ]);

      setGvcs(gvcsData);
      setAlteracoesAtivas(alteracoesAtivasData);
      setHistoricoAlteracoes(historicoAlteracoesData);
      setElogiosAtivos(elogiosAtivosData);
      setHistoricoElogios(historicoElogiosData);
      setConceitosAtivos(conceitosAtivosData);
      setHistoricoConceitos(historicoConceitosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ALTERAÇÕES =====
  const handleCriarAlteracao = async (data: any) => {
    try {
      await criarAlteracao(data, user?.email || undefined);
      const novasAlteracoes = await obterAlteracoesAtivas();
      setAlteracoesAtivas(novasAlteracoes);
    } catch (error) {
      console.error('Erro ao criar alteração:', error);
      throw error;
    }
  };

  const handleMarcarAlteracaoInserida = async (alteracao: Alteracao) => {
    if (!alteracao.id) return;
    
    if (window.confirm('Marcar esta alteração como inserida na tabela?')) {
      try {
        await marcarAlteracaoComoInserida(alteracao.id);
        const [novasAtivas, novoHistorico] = await Promise.all([
          obterAlteracoesAtivas(),
          obterHistoricoAlteracoes(),
        ]);
        setAlteracoesAtivas(novasAtivas);
        setHistoricoAlteracoes(novoHistorico);
      } catch (error) {
        console.error('Erro ao marcar alteração:', error);
        alert('Erro ao marcar. Tente novamente.');
      }
    }
  };

  const handleDeletarAlteracao = (alteracao: Alteracao) => {
    if (!alteracao.id) return;

    if (window.confirm(`Tem certeza que deseja deletar esta alteração?`)) {
      deletarAlteracao(alteracao.id)
        .then(async () => {
          const novasAlteracoes = await obterAlteracoesAtivas();
          setAlteracoesAtivas(novasAlteracoes);
        })
        .catch((error) => {
          console.error('Erro ao deletar alteração:', error);
          alert('Erro ao deletar. Tente novamente.');
        });
    }
  };

  // ===== ELOGIOS =====
  const handleCriarElogio = async (data: any) => {
    try {
      await criarElogio(data, user?.email || undefined);
      const novosElogios = await obterElogiosAtivos();
      setElogiosAtivos(novosElogios);
    } catch (error) {
      console.error('Erro ao criar elogio:', error);
      throw error;
    }
  };

  const handleMarcarElogioInserido = async (elogio: Elogio) => {
    if (!elogio.id) return;
    
    if (window.confirm('Marcar este elogio como adicionado na tabela?')) {
      try {
        await marcarElogioComoInserido(elogio.id);
        const [novosAtivos, novoHistorico] = await Promise.all([
          obterElogiosAtivos(),
          obterHistoricoElogios(),
        ]);
        setElogiosAtivos(novosAtivos);
        setHistoricoElogios(novoHistorico);
      } catch (error) {
        console.error('Erro ao marcar elogio:', error);
        alert('Erro ao marcar. Tente novamente.');
      }
    }
  };

  const handleDeletarElogio = (elogio: Elogio) => {
    if (!elogio.id) return;

    if (window.confirm(`Tem certeza que deseja deletar este elogio?`)) {
      deletarElogio(elogio.id)
        .then(async () => {
          const novosElogios = await obterElogiosAtivos();
          setElogiosAtivos(novosElogios);
        })
        .catch((error) => {
          console.error('Erro ao deletar elogio:', error);
          alert('Erro ao deletar. Tente novamente.');
        });
    }
  };

  // ===== CONCEITOS =====
  const handleCriarConceito = async (data: any) => {
    try {
      await criarConceito(data, user?.email || undefined);
      const novosConceitos = await obterConceitosAtivos();
      setConceitosAtivos(novosConceitos);
    } catch (error) {
      console.error('Erro ao criar conceito:', error);
      throw error;
    }
  };

  const handleMarcarConceitoInserido = async (conceito: Conceito) => {
    if (!conceito.id) return;
    
    if (window.confirm('Marcar este conceito como adicionado na tabela?')) {
      try {
        await marcarConceitoComoInserido(conceito.id);
        const [novosAtivos, novoHistorico] = await Promise.all([
          obterConceitosAtivos(),
          obterHistoricoConceitos(),
        ]);
        setConceitosAtivos(novosAtivos);
        setHistoricoConceitos(novoHistorico);
      } catch (error) {
        console.error('Erro ao marcar conceito:', error);
        alert('Erro ao marcar. Tente novamente.');
      }
    }
  };

  const handleDeletarConceito = (conceito: Conceito) => {
    if (!conceito.id) return;

    if (window.confirm(`Tem certeza que deseja deletar este conceito?`)) {
      deletarConceito(conceito.id)
        .then(async () => {
          const novosConceitos = await obterConceitosAtivos();
          setConceitosAtivos(novosConceitos);
        })
        .catch((error) => {
          console.error('Erro ao deletar conceito:', error);
          alert('Erro ao deletar. Tente novamente.');
        });
    }
  };

  // Função para renderizar o botão de adicionar correto
  const renderBotaoAdicionar = () => {
    if (subAba !== 'ativos') return null;

    const configs = {
      alteracoes: {
        onClick: () => setIsModalAlteracaoOpen(true),
        icon: AlertCircle,
        label: 'Adicionar Alteração',
        gradient: 'from-red-600 to-red-700',
      },
      elogios: {
        onClick: () => setIsModalElogioOpen(true),
        icon: Award,
        label: 'Novo Elogio',
        gradient: 'from-green-600 to-green-700',
      },
      conceitos: {
        onClick: () => setIsModalConceitoOpen(true),
        icon: Target,
        label: 'Adicionar Conceito',
        gradient: 'from-blue-600 to-blue-700',
      },
    };

    const config = configs[aba];
    const Icon = config.icon;

    return (
      <button
        type="button"
        onClick={config.onClick}
        className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white text-sm font-semibold hover:shadow-lg transition-all`}
      >
        <Icon size={18} />
        {config.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-2xl shadow-xl px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Alterações e Elogios</h1>
                <p className="text-blue-100">Gerencie alterações, elogios e conceitos dos guarda-vidas</p>
              </div>
              {renderBotaoAdicionar()}
            </div>
          </div>

          {/* Abas Principais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex gap-2 p-2">
              <button
                type="button"
                onClick={() => {
                  setAba('alteracoes');
                  setSubAba('ativos');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  aba === 'alteracoes'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlertCircle size={18} />
                Alterações
              </button>
              <button
                type="button"
                onClick={() => {
                  setAba('elogios');
                  setSubAba('ativos');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  aba === 'elogios'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Award size={18} />
                Elogios
              </button>
              <button
                type="button"
                onClick={() => {
                  setAba('conceitos');
                  setSubAba('ativos');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  aba === 'conceitos'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Target size={18} />
                Conceito
              </button>
            </div>
          </div>

          {/* Sub-abas (Ativos / Histórico) */}
          <div className="flex items-center justify-center">
            <div className="inline-flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
              <button
                type="button"
                onClick={() => setSubAba('ativos')}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  subAba === 'ativos'
                    ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setSubAba('historico')}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  subAba === 'historico'
                    ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="mx-auto mb-4 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : (
            <>
              {/* ALTERAÇÕES */}
              {aba === 'alteracoes' && (
                <ListaAlteracoes
                  items={subAba === 'ativos' ? alteracoesAtivas : historicoAlteracoes}
                  onDelete={handleDeletarAlteracao}
                  onMarcarInserido={handleMarcarAlteracaoInserida}
                  mostrarHistorico={subAba === 'historico'}
                />
              )}

              {/* ELOGIOS */}
              {aba === 'elogios' && (
                <ListaElogios
                  items={subAba === 'ativos' ? elogiosAtivos : historicoElogios}
                  onDelete={handleDeletarElogio}
                  onMarcarInserido={handleMarcarElogioInserido}
                  mostrarHistorico={subAba === 'historico'}
                />
              )}

              {/* CONCEITOS */}
              {aba === 'conceitos' && (
                <ListaConceitos
                  items={subAba === 'ativos' ? conceitosAtivos : historicoConceitos}
                  onDelete={handleDeletarConceito}
                  onMarcarInserido={handleMarcarConceitoInserido}
                  mostrarHistorico={subAba === 'historico'}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modais */}
      <FormAlteracao
        isOpen={isModalAlteracaoOpen}
        onClose={() => setIsModalAlteracaoOpen(false)}
        onSubmit={handleCriarAlteracao}
        gvcsDisponiveis={gvcs}
      />

      <FormElogio
        isOpen={isModalElogioOpen}
        onClose={() => setIsModalElogioOpen(false)}
        onSubmit={handleCriarElogio}
        gvcsDisponiveis={gvcs}
      />

      <FormConceito
        isOpen={isModalConceitoOpen}
        onClose={() => setIsModalConceitoOpen(false)}
        onSubmit={handleCriarConceito}
        gvcsDisponiveis={gvcs}
      />
    </div>
  );
};
