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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alterações e Elogios</h1>
            <p className="text-gray-600">Gerencie alterações, elogios e conceitos dos guarda-vidas</p>
          </div>

          {/* Abas Principais */}
          <div className="border-b border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setAba('alteracoes');
                  setSubAba('ativos');
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  aba === 'alteracoes'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Alterações
              </button>
              <button
                type="button"
                onClick={() => {
                  setAba('elogios');
                  setSubAba('ativos');
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  aba === 'elogios'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Elogios
              </button>
              <button
                type="button"
                onClick={() => {
                  setAba('conceitos');
                  setSubAba('ativos');
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  aba === 'conceitos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Conceito
              </button>
            </div>
          </div>

          {/* Sub-abas (Ativos / Histórico) */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSubAba('ativos')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  subAba === 'ativos'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setSubAba('historico')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  subAba === 'historico'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Histórico
              </button>
            </div>

            {/* Botão Adicionar (apenas em ativos) */}
            {subAba === 'ativos' && (
              <div>
                {aba === 'alteracoes' && (
                  <button
                    type="button"
                    onClick={() => setIsModalAlteracaoOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <AlertCircle size={18} />
                    Adicionar Alteração
                  </button>
                )}
                {aba === 'elogios' && (
                  <button
                    type="button"
                    onClick={() => setIsModalElogioOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <Award size={18} />
                    Novo Elogio
                  </button>
                )}
                {aba === 'conceitos' && (
                  <button
                    type="button"
                    onClick={() => setIsModalConceitoOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Target size={18} />
                    Adicionar Conceito
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <div className="text-center py-12">
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
