import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { NumeroPosto, CategoriaMaterialB } from '../../types/postos';
import {
  listarMateriaisTipoB,
  type MaterialTipoBDoc,
} from '../../services/materiaisBService';
import {
  listarFaltasPorPostoECategoria,
  registrarFaltaMaterial,
  resolverFaltaMaterial,
  type FaltaMaterialDoc,
} from '../../services/faltasService';
import { registrarEventoFaltaMaterial } from '../../services/historicoService';
import { TipoEvento } from '../../types/postos';

const LABEL_CATEGORIA: Record<CategoriaMaterialB, string> = {
  whitemed: 'Whitemed',
  bolsa_aph: 'Bolsa APH',
  outros: 'outros',
};

interface FaltaItem extends FaltaMaterialDoc {
  id: string;
}

export const FaltasMateriaisTela = () => {
  const navigate = useNavigate();
  const params = useParams<{ postoNumero: string; categoria: string }>();

  const postoNumero = Number(params.postoNumero) as NumeroPosto;
  const categoria = params.categoria as CategoriaMaterialB;

  const [listaMateriaisCategoria, setListaMateriaisCategoria] = useState<
    (MaterialTipoBDoc & { id: string })[]
  >([]);
  const [faltas, setFaltas] = useState<FaltaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  const [materialSelecionadoId, setMaterialSelecionadoId] = useState('');
  const [observacaoRegistro, setObservacaoRegistro] = useState('');

  const titulo = `${LABEL_CATEGORIA[categoria] ?? 'Material'} do Posto ${postoNumero}`;

  const carregar = async () => {
    try {
      setLoading(true);
      const todos = await listarMateriaisTipoB();
      const daCategoria = todos.filter((m) => m.categoria === categoria);
      // ordenar por nome
      daCategoria.sort((a, b) => a.nome.localeCompare(b.nome));
      setListaMateriaisCategoria(daCategoria);

      const faltasAbertas = await listarFaltasPorPostoECategoria(postoNumero, categoria);
      // ordenar por data
      faltasAbertas.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setFaltas(faltasAbertas);
    } catch (error) {
      console.error('Erro ao carregar faltas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(postoNumero) && categoria) {
      carregar();
    }
  }, [postoNumero, categoria]);

  const handleRegistrarFalta = async () => {
    if (!materialSelecionadoId) return;

    try {
      setRegistrando(true);
      const material = listaMateriaisCategoria.find((m) => m.id === materialSelecionadoId);
      if (!material) return;

      const faltaId = await registrarFaltaMaterial({
        materialTipoBId: material.id,
        materialNome: material.nome,
        categoria,
        postoNumero,
        observacaoRegistro: observacaoRegistro || undefined,
      });

      await registrarEventoFaltaMaterial({
        tipoEvento: TipoEvento.FALTA_REGISTRADA,
        postoNumero,
        faltaMaterialId: faltaId,
        materialTipoBNome: material.nome,
        materialTipoBCategoria: categoria,
        observacao: observacaoRegistro || undefined,
      });

      setObservacaoRegistro('');
      setMaterialSelecionadoId('');
      await carregar();
    } catch (error) {
      console.error('Erro ao registrar falta:', error);
    } finally {
      setRegistrando(false);
    }
  };

  const handleResolverFalta = async (falta: FaltaItem) => {
    const obs = window.prompt('Observação da resolução (opcional):') ?? undefined;

    try {
      await resolverFaltaMaterial({ id: falta.id, observacaoResolucao: obs });

      await registrarEventoFaltaMaterial({
        tipoEvento: TipoEvento.FALTA_RESOLVIDA,
        postoNumero,
        faltaMaterialId: falta.id,
        materialTipoBNome: falta.materialNome,
        materialTipoBCategoria: categoria,
        observacao: obs,
      });

      await carregar();
    } catch (error) {
      console.error('Erro ao resolver falta:', error);
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
        {/* Seletor de material + registrar falta */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Registrar nova falta
          </h2>
          {listaMateriaisCategoria.length === 0 ? (
            <p className="text-xs text-gray-600">
              Não há materiais cadastrados na categoria {LABEL_CATEGORIA[categoria]}.{' '}
              Use &quot;Lista de Materiais&quot; na página anterior para cadastrar.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <select
                  value={materialSelecionadoId}
                  onChange={(e) => setMaterialSelecionadoId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Selecione o material...</option>
                  {listaMateriaisCategoria.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Observação (opcional)..."
                  value={observacaoRegistro}
                  onChange={(e) => setObservacaoRegistro(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y min-h-[60px]"
                />
              </div>
              <button
                onClick={handleRegistrarFalta}
                disabled={registrando || !materialSelecionadoId}
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {registrando ? 'Registrando...' : 'Registrar Falta'}
              </button>
            </>
          )}
        </div>

        {/* Lista de faltas em aberto */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Faltas em aberto
          </h2>
          {loading ? (
            <p className="text-sm text-gray-600">Carregando...</p>
          ) : faltas.length === 0 ? (
            <p className="text-sm text-gray-600">
              Nenhuma falta em aberto para {LABEL_CATEGORIA[categoria]} neste posto.
            </p>
          ) : (
            <ul className="space-y-2">
              {faltas.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Falta de {f.materialNome}
                    </p>
                    {f.observacaoRegistro && (
                      <p className="text-xs text-yellow-800 mt-1 whitespace-pre-line">
                        {f.observacaoRegistro}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleResolverFalta(f)}
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
