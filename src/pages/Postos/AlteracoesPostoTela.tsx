import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { NumeroPosto } from '../../types/postos';
import {
  listarAlteracoesAbertasPorPosto,
  registrarAlteracaoPosto,
  resolverAlteracaoPosto,
  type AlteracaoPostoDoc,
} from '../../services/alteracoesService';
import { registrarEventoAlteracaoPosto } from '../../services/historicoService';
import { TipoEvento } from '../../types/postos';

interface AlteracaoItem extends AlteracaoPostoDoc {
  id: string;
}

export const AlteracoesPostoTela = () => {
  const navigate = useNavigate();
  const params = useParams<{ postoNumero: string }>();

  const postoNumero = Number(params.postoNumero) as NumeroPosto;

  const [descricao, setDescricao] = useState('');
  const [alteracoes, setAlteracoes] = useState<AlteracaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const titulo = `Alterações do Posto ${postoNumero}`;

  const carregar = async () => {
    try {
      setLoading(true);
      const lista = await listarAlteracoesAbertasPorPosto(postoNumero);
      lista.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setAlteracoes(lista);
    } catch (error) {
      console.error('Erro ao carregar alterações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(postoNumero)) carregar();
  }, [postoNumero]);

  const handleAdicionar = async () => {
    if (!descricao.trim()) return;
    try {
      setSalvando(true);
      const id = await registrarAlteracaoPosto({
        postoNumero,
        descricao: descricao.trim(),
      });

      await registrarEventoAlteracaoPosto({
        tipoEvento: TipoEvento.ALTERACAO_ADICIONADA,
        postoNumero,
        alteracaoPostoId: id,
        observacao: descricao.trim(),
      });

      setDescricao('');
      await carregar();
    } catch (error) {
      console.error('Erro ao registrar alteração:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleResolver = async (alt: AlteracaoItem) => {
    const obs = window.prompt('Observação da resolução (opcional):') ?? undefined;

    try {
      await resolverAlteracaoPosto({ id: alt.id, observacaoResolucao: obs });

      await registrarEventoAlteracaoPosto({
        tipoEvento: TipoEvento.ALTERACAO_RESOLVIDA,
        postoNumero,
        alteracaoPostoId: alt.id,
        observacao: obs,
      });

      await carregar();
    } catch (error) {
      console.error('Erro ao resolver alteração:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/postos')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">Voltar</span>
            </button>

            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {titulo}
            </h1>

            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Adicionar alteração */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Registrar nova alteração de estrutura
          </h2>
          <textarea
            placeholder='Ex: "Caixa d&apos;água quebrada", "Escada solta"...'
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y min-h-[80px]"
          />
          <button
            onClick={handleAdicionar}
            disabled={salvando || !descricao.trim()}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {salvando ? 'Salvando...' : 'Adicionar Alteração'}
          </button>
        </div>

        {/* Lista de alterações em aberto */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Alterações em aberto
          </h2>
          {loading ? (
            <p className="text-sm text-gray-600">Carregando...</p>
          ) : alteracoes.length === 0 ? (
            <p className="text-sm text-gray-600">
              Nenhuma alteração em aberto neste posto.
            </p>
          ) : (
            <ul className="space-y-2">
              {alteracoes.map((alt) => (
                <li
                  key={alt.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2"
                >
                  <p className="text-sm text-orange-900 whitespace-pre-line">
                    {alt.descricao}
                  </p>
                  <button
                    onClick={() => handleResolver(alt)}
                    className="self-start sm:self-auto px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    Resolver
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
