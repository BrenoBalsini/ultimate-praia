import { useState, useEffect } from 'react';
import {  Filter, X, ChevronRight } from 'lucide-react';
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
  outros: 'Outros',
};

const ICONE_PENDENCIA = (pendencia: Pendencia) => {
  if (pendencia.tipo === 'falta') return '⚠️';
  return '🔧';
};

const COR_PENDENCIA = (pendencia: Pendencia) => {
  if (pendencia.tipo === 'falta') return 'border-l-4 border-yellow-500';
  return 'border-l-4 border-orange-500';
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
    return `Alteração estrutural`;
  };

  return (
    <li
      className={`bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all group ${COR_PENDENCIA(pendencia)}`}
      onClick={navegarParaDetalhes}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{ICONE_PENDENCIA(pendencia)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">Posto {pendencia.postoNumero}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                  pendencia.tipo === 'falta' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {pendencia.tipo === 'falta' ? 'Falta' : 'Alteração'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-800">{titulo()}</p>
              {pendencia.tipo === 'falta' && (pendencia as PendenciaFalta).observacaoRegistro && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {(pendencia as PendenciaFalta).observacaoRegistro}
                </p>
              )}
              {pendencia.tipo === 'alteracao' && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {(pendencia as PendenciaAlteracao).descricao}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">{data}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1E3A5F] transition-colors flex-shrink-0" />
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
  const temFiltrosAtivos = filtroPosto !== null || filtroTipo !== null;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Carregando avisos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-yellow-500 p-6 text-center">
          <h3 className="text-3xl font-bold text-yellow-600">{totalFaltas}</h3>
          <p className="text-sm font-medium text-gray-600 mt-2">Faltas em aberto</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 p-6 text-center">
          <h3 className="text-3xl font-bold text-orange-600">{totalAlteracoes}</h3>
          <p className="text-sm font-medium text-gray-600 mt-2">Alterações pendentes</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-[#1E3A5F] p-6 text-center">
          <h3 className="text-3xl font-bold text-[#1E3A5F]">{totalGeral}</h3>
          <p className="text-sm font-medium text-gray-600 mt-2">Total de pendências</p>
        </div>
      </div>

      {/* Card de Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#1E3A5F]" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Posto
            </label>
            <select
              value={filtroPosto || ''}
              onChange={(e) =>
                setFiltroPosto(e.target.value ? (Number(e.target.value) as NumeroPosto) : null)
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
            >
              <option value="">Todos os postos</option>
              {POSTOS_FIXOS.map((numero) => (
                <option key={numero} value={numero}>
                  Posto {numero}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tipo
            </label>
            <select
              value={filtroTipo || ''}
              onChange={(e) => {
                if (e.target.value === '') setFiltroTipo(null);
                else setFiltroTipo(e.target.value as 'falta' | 'alteracao');
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
            >
              <option value="">Todos os tipos</option>
              <option value="falta">Faltas de Material</option>
              <option value="alteracao">Alterações de Posto</option>
            </select>
          </div>
        </div>

        {temFiltrosAtivos && (
          <button
            onClick={limparFiltros}
            className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Pendências por Posto */}
      {Object.entries(pendenciasPorPosto).length > 0 ? (
        Object.entries(pendenciasPorPosto)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([postoNumStr, pendenciasPosto]) => {
            const postoNumero = Number(postoNumStr) as NumeroPosto;
            return (
              <div key={postoNumero} className="space-y-3">
                <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-xl p-4">
                  <h2 className="text-base font-bold text-white">
                    📍 Posto {postoNumero} · {pendenciasPosto.length} pendência{pendenciasPosto.length !== 1 ? 's' : ''}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {pendenciasPosto.map((pendencia) => (
                    <PendenciaCard key={pendencia.id} pendencia={pendencia} />
                  ))}
                </ul>
              </div>
            );
          })
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma pendência!
          </h3>
          <p className="text-gray-600 text-sm">
            {temFiltrosAtivos
              ? 'Não há pendências com os filtros selecionados'
              : 'Todos os materiais estão OK e não há alterações pendentes'}
          </p>
          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1E3A5F] hover:text-[#2C5282]"
            >
              <X className="w-4 h-4" />
              Remover filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};
