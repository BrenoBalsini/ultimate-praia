import { useState, useEffect } from 'react';
import {
  buscarTodasPendencias,
  type Pendencia,
  type PendenciaFalta,
  type PendenciaAlteracao,
} from '../../services/pendenciasService';
import { POSTOS_FIXOS, type NumeroPosto } from '../../types/postos';

const LABEL_CATEGORIA: Record<string, string> = {
  whitemed: 'Whitemed',
  bolsa_aph: 'Bolsa APH',
  limpeza: 'Limpeza',
};

const ICONE_PENDENCIA = (pendencia: Pendencia) => {
  if (pendencia.tipo === 'falta') {
    return '⚠️';
  }
  return '🔧';
};

const COR_PENDENCIA = (pendencia: Pendencia) => {
  if (pendencia.tipo === 'falta') {
    return 'border-l-4 border-yellow-500 bg-yellow-50';
  }
  return 'border-l-4 border-orange-500 bg-orange-50';
};

const PendenciaCard = ({ pendencia }: { pendencia: Pendencia }) => {
  const data = new Date(pendencia.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const navegarParaDetalhes = () => {
    if (pendencia.tipo === 'falta') {
      const falta = pendencia as PendenciaFalta;
      window.location.href = `/postos/${falta.postoNumero}/faltas/${falta.categoria}`;
    } else {
      const alteracao = pendencia as PendenciaAlteracao;
      window.location.href = `/postos/${alteracao.postoNumero}/alteracoes`;
    }
  };

  const titulo = () => {
    if (pendencia.tipo === 'falta') {
      const falta = pendencia as PendenciaFalta;
      return `${LABEL_CATEGORIA[falta.categoria]} - ${falta.materialNome}`;
    }
    const alteracao = pendencia as PendenciaAlteracao;
    return `Alteração estrutural`;
  };

  return (
    <li
      className={`cursor-pointer hover:shadow-md transition-shadow ${COR_PENDENCIA(
        pendencia,
      )}`}
      onClick={navegarParaDetalhes}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xl">{ICONE_PENDENCIA(pendencia)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  Posto {pendencia.postoNumero}
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white text-gray-700">
                  {pendencia.tipo === 'falta' ? 'Falta' : 'Alteração'}
                </span>
              </div>
              <p className="text-sm text-gray-800">{titulo()}</p>
              {pendencia.tipo === 'falta' && (
                <>
                  <p className="text-xs text-gray-600 mt-1">
                    {LABEL_CATEGORIA[(pendencia as PendenciaFalta).categoria]}
                  </p>
                  {(pendencia as PendenciaFalta).observacaoRegistro && (
                    <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                      {(pendencia as PendenciaFalta).observacaoRegistro}
                    </p>
                  )}
                </>
              )}
              {pendencia.tipo === 'alteracao' && (
                <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                  {(pendencia as PendenciaAlteracao).descricao}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500 min-w-[80px] text-right">
            {data}
          </span>
        </div>
      </div>
    </li>
  );
};

export const TabAvisos = () => {
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [filtroPosto, setFiltroPosto] = useState<NumeroPosto | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'falta' | 'alteracao' | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPendencias = async () => {
    try {
      setLoading(true);
      const todas = await buscarTodasPendencias();
      setPendencias(todas);
    } catch (error) {
      console.error('Erro ao carregar pendências:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPendencias();
  }, []);

  const pendenciasFiltradas = pendencias.filter((p) => {
    if (filtroPosto && p.postoNumero !== filtroPosto) return false;
    if (filtroTipo && p.tipo !== filtroTipo) return false;
    return true;
  });

  // Agrupar por posto
  const pendenciasPorPosto = pendenciasFiltradas.reduce((acc, p) => {
    if (!acc[p.postoNumero]) acc[p.postoNumero] = [];
    acc[p.postoNumero].push(p);
    return acc;
  }, {} as Record<NumeroPosto, Pendencia[]>);

  const limparFiltros = () => {
    setFiltroPosto(null);
    setFiltroTipo(null);
  };

  const totalFaltas = pendencias.filter((p) => p.tipo === 'falta').length;
  const totalAlteracoes = pendencias.filter((p) => p.tipo === 'alteracao').length;
  const totalGeral = pendencias.length;

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando avisos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
          <h3 className="text-2xl font-bold text-yellow-600">{totalFaltas}</h3>
          <p className="text-sm text-gray-600 mt-1">Faltas em aberto</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-orange-500">
          <h3 className="text-2xl font-bold text-orange-600">{totalAlteracoes}</h3>
          <p className="text-sm text-gray-600 mt-1">Alterações pendentes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border-l-4 border-teal-500">
          <h3 className="text-2xl font-bold text-teal-600">{totalGeral}</h3>
          <p className="text-sm text-gray-600 mt-1">Total de pendências</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Filtro por Posto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filtrar por Posto
            </label>
            <select
              value={filtroPosto || ''}
              onChange={(e) =>
                setFiltroPosto(e.target.value ? (Number(e.target.value) as NumeroPosto) : null)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todos os postos</option>
              {POSTOS_FIXOS.map((numero) => (
                <option key={numero} value={numero}>
                  Posto {numero}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filtrar por Tipo
            </label>
            <select
              value={filtroTipo || ''}
              onChange={(e) => {
                if (e.target.value === '') setFiltroTipo(null);
                else setFiltroTipo(e.target.value as 'falta' | 'alteracao');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todos os tipos</option>
              <option value="falta">Faltas de Material</option>
              <option value="alteracao">Alterações de Posto</option>
            </select>
          </div>
        </div>

        <button
          onClick={limparFiltros}
          className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Pendências por Posto */}
      {Object.entries(pendenciasPorPosto)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([postoNumStr, pendenciasPosto]) => {
          const postoNumero = Number(postoNumStr) as NumeroPosto;
          return (
            <div key={postoNumero} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h2 className="text-sm font-semibold text-gray-800">
                  📍 Posto {postoNumero} ({pendenciasPosto.length} pendência
                  {pendenciasPosto.length !== 1 ? 's' : ''})
                </h2>
              </div>
              <ul className="space-y-2">
                {pendenciasPosto.map((pendencia) => (
                  <PendenciaCard key={pendencia.id} pendencia={pendencia} />
                ))}
              </ul>
            </div>
          );
        })}

      {/* Mensagem quando não há pendências */}
      {pendenciasFiltradas.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-green-600 mb-2">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma pendência!</h3>
          <p className="text-gray-600">
            Todos os materiais estão OK e não há alterações pendentes nos postos.
          </p>
          {filtroPosto || filtroTipo ? (
            <button
              onClick={limparFiltros}
              className="mt-4 text-xs text-teal-600 hover:text-teal-800"
            >
              Remover filtros para ver todas as pendências
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
