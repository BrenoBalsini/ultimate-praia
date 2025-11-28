import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { NumeroPosto, TipoMaterialA, StatusMaterialA } from '../../types/postos';
import {
  getMateriaisAByPostoAndTipo,
  addMaterialA,
  updateMaterialAStatus,
  devolverMaterialA,
  type MaterialADoc,
} from '../../services/materiaisAService';
import { registrarEventoMaterialA } from '../../services/historicoService.ts';
import { TipoEvento } from '../../types/postos';

const LABEL_POR_TIPO: Record<TipoMaterialA, string> = {
  binoculo: 'Binóculo',
  guardassol: 'Guarda-sol',
  radio: 'Rádio',
};

const ICONE_POR_TIPO: Record<TipoMaterialA, string> = {
  binoculo: '🔭',
  guardassol: '☂️',
  radio: '📻',
};

const COR_STATUS: Record<StatusMaterialA, string> = {
  ausente: 'bg-gray-100 text-gray-700 border border-gray-300',
  ok: 'bg-green-100 text-green-800 border border-green-300',
  avaria: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  quebrado: 'bg-red-100 text-red-800 border border-red-300',
};

export const MateriaisATela = () => {
  const navigate = useNavigate();
  const params = useParams<{ postoNumero: string; tipo: string }>();

  const postoNumero = Number(params.postoNumero) as NumeroPosto;
  const tipo = params.tipo as TipoMaterialA;

  const [materiais, setMateriais] = useState<(MaterialADoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const titulo = `${LABEL_POR_TIPO[tipo] ?? 'Material'} do Posto ${postoNumero}`;
  const icone = ICONE_POR_TIPO[tipo] ?? '📦';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const dados = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
        // ordenar por numero
        dados.sort((a, b) => a.numero - b.numero);
        setMateriais(dados);
      } catch (error) {
        console.error('Erro ao carregar materiais A:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(postoNumero) && tipo) {
      load();
    }
  }, [postoNumero, tipo]);

  const recarregar = async () => {
    const dados = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
    dados.sort((a, b) => a.numero - b.numero);
    setMateriais(dados);
  };

  const handleAdicionar = async () => {
    try {
      setAdding(true);
      const obs =
        window.prompt(`Observação inicial (opcional) do novo ${LABEL_POR_TIPO[tipo]}:`) ??
        undefined;

      const id = await addMaterialA({
        postoNumero,
        tipo,
        observacao: obs,
      });

      // descobrir o número desse material recém criado
      const lista = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
      const material = lista.find((m) => m.id === id);
      const numero = material?.numero ?? lista.length;

      await registrarEventoMaterialA({
        tipoEvento: TipoEvento.MATERIAL_A_ADICIONADO,
        postoNumero,
        materialAId: id,
        materialATipo: tipo,
        materialANumero: numero,
        observacao: obs,
      });

      await recarregar();
    } catch (error) {
      console.error('Erro ao adicionar material A:', error);
    } finally {
      setAdding(false);
    }
  };


   const handleMudarStatus = async (id: string, status: StatusMaterialA) => {
    try {
      const obs = window.prompt('Observação (opcional):') ?? undefined;

      await updateMaterialAStatus({ id, status, observacao: obs });

      const lista = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
      const material = lista.find((m) => m.id === id);
      if (material) {
        let tipoEvento: TipoEvento | null = null;

        if (status === 'avaria') tipoEvento = TipoEvento.MATERIAL_A_AVARIA;
        else if (status === 'quebrado') tipoEvento = TipoEvento.MATERIAL_A_QUEBRADO;
        else if (status === 'ok') tipoEvento = TipoEvento.MATERIAL_A_RESOLVIDO;

        if (tipoEvento) {
          await registrarEventoMaterialA({
            tipoEvento,
            postoNumero,
            materialAId: id,
            materialATipo: tipo,
            materialANumero: material.numero,
            observacao: obs,
          });
        }
      }

      await recarregar();
    } catch (error) {
      console.error('Erro ao atualizar material A:', error);
    }
  };


  const handleDevolver = async (id: string) => {
    try {
      const obs = window.prompt('Observação da devolução (opcional):') ?? undefined;

      await devolverMaterialA({ id, observacao: obs });

      const lista = await getMateriaisAByPostoAndTipo(postoNumero, tipo);
      const material = lista.find((m) => m.id === id);
      if (material) {
        await registrarEventoMaterialA({
          tipoEvento: TipoEvento.MATERIAL_A_DEVOLVIDO,
          postoNumero,
          materialAId: id,
          materialATipo: tipo,
          materialANumero: material.numero,
          observacao: obs,
        });
      }

      await recarregar();
    } catch (error) {
      console.error('Erro ao devolver material A:', error);
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

            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">{icone}</span>
              <span>{titulo}</span>
            </h1>

            <button
              onClick={handleAdicionar}
              disabled={adding}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
            >
              {adding ? 'Adicionando...' : `Adicionar ${LABEL_POR_TIPO[tipo]}`}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <p className="text-gray-600">Carregando materiais...</p>
        ) : materiais.length === 0 ? (
          <p className="text-gray-600">
            Nenhum {LABEL_POR_TIPO[tipo]} cadastrado para o Posto {postoNumero}. Clique em &quot;Adicionar&quot; para começar.
          </p>
        ) : (
          <ul className="space-y-3">
            {materiais.map((m) => (
              <li
                key={m.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-1">{icone}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {LABEL_POR_TIPO[tipo]} {m.numero}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COR_STATUS[m.status]}`}
                      >
                        {m.status === 'ok'
                          ? 'OK'
                          : m.status === 'avaria'
                          ? 'Avaria'
                          : m.status === 'quebrado'
                          ? 'Quebrado'
                          : 'Ausente'}
                      </span>
                    </div>
                    {m.observacao && (
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                        {m.observacao}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMudarStatus(m.id, 'avaria')}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                  >
                    Marcar Avaria
                  </button>
                  <button
                    onClick={() => handleMudarStatus(m.id, 'quebrado')}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Marcar Quebrado
                  </button>
                  <button
                    onClick={() => handleMudarStatus(m.id, 'ok')}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    Resolver (OK)
                  </button>
                  <button
                    onClick={() => handleDevolver(m.id)}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    Devolver
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
