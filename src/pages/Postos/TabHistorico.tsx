import { useState, useEffect } from "react";
import {
  buscarHistorico,
  type HistoricoDoc,
} from "../../services/historicoService";
import {
  POSTOS_FIXOS,
  type NumeroPosto,
  type TipoMaterialA,
} from "../../types/postos";
import { listarMateriaisTipoB } from "../../services/materiaisBService";

interface HistoricoCardProps {
  evento: HistoricoDoc;
}

const HistoricoCard = ({ evento }: HistoricoCardProps) => {
  const icone = () => {
    if (evento.materialATipo) {
      const icones: Record<TipoMaterialA, string> = {
        binoculo: "🔭",
        guardassol: "☂️",
        radio: "📻",
      };
      return icones[evento.materialATipo as TipoMaterialA];
    }
    if (evento.materialTipoBNome) {
      return "⚠️"; // falta de material B
    }
    return "🔧"; // alteração de posto
  };

  const tipoTexto = () => {
    const mapa: Record<string, string> = {
      material_a_adicionado: "Material adicionado",
      material_a_avaria: "Marcado como avaria",
      material_a_quebrado: "Marcado como quebrado",
      material_a_resolvido: "Resolvido (OK)",
      material_a_devolvido: "Material devolvido",
      falta_registrada: "Falta registrada",
      falta_resolvida: "Falta resolvida",
      alteracao_adicionada: "Alteração registrada",
      alteracao_resolvida: "Alteração resolvida",
    };
    return mapa[evento.tipo] || evento.tipo;
  };

  const titulo = () => {
    if (evento.materialATipo && evento.materialANumero) {
      return `${evento.materialATipo} #${evento.materialANumero} - Posto ${evento.postoNumero}`;
    }
    if (evento.materialTipoBNome) {
      return `Falta de ${evento.materialTipoBNome} - Posto ${evento.postoNumero}`;
    }
    return `Alteração no Posto ${evento.postoNumero}`;
  };

  const data = new Date(evento.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="bg-white rounded-xl shadow-sm p-4 space-y-3 border-l-4 border-teal-500">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{icone()}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {titulo()}
            </h3>
            <p className="text-xs text-gray-600">{data}</p>
            <p className="text-sm text-gray-800 mt-1">{tipoTexto()}</p>
          </div>
        </div>
      </div>

      {evento.observacao && (
        <div className="mt-2">
          <p className="text-xs text-gray-700 whitespace-pre-line bg-gray-50 p-2 rounded">
            {evento.observacao}
          </p>
        </div>
      )}
    </li>
  );
};

export const TabHistorico = () => {
  const [todosEventos, setTodosEventos] = useState<HistoricoDoc[]>([]);
  const [historicoFiltrado, setHistoricoFiltrado] = useState<HistoricoDoc[]>(
    []
  );
  const [todosMateriais, setTodosMateriais] = useState<string[]>([]);
  const [filtroMaterial, setFiltroMaterial] = useState<string | null>(null);
  const [filtroPosto, setFiltroPosto] = useState<NumeroPosto | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const eventos = await buscarHistorico();
      setTodosEventos(eventos);
      setHistoricoFiltrado(eventos);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarMateriaisFiltro = async () => {
    try {
      const listaB = await listarMateriaisTipoB();
      const nomesB = listaB.map((m) => m.nome);
      const tiposA = ["binoculo", "guardassol", "radio"] as const;
      const todos = [...tiposA, ...nomesB];
      setTodosMateriais(todos);
    } catch (error) {
      console.error("Erro ao carregar materiais para filtro:", error);
    }
  };

  useEffect(() => {
    carregarMateriaisFiltro();
    carregarHistorico();
  }, []);

  useEffect(() => {
    let filtrado = [...todosEventos];

    // Filtro por material
    if (filtroMaterial) {
      filtrado = filtrado.filter((evento) => {
        if (evento.materialATipo === filtroMaterial) return true;
        if (evento.materialTipoBNome === filtroMaterial) return true;
        return false;
      });
    }

    // Filtro por posto
    if (filtroPosto) {
      filtrado = filtrado.filter(
        (evento) => evento.postoNumero === filtroPosto
      );
    }

    setHistoricoFiltrado(filtrado);
  }, [todosEventos, filtroMaterial, filtroPosto]);

  const limparFiltros = () => {
    setFiltroMaterial(null);
    setFiltroPosto(null);
  };

  if (loading && todosEventos.length === 0) {
    return <p className="text-gray-600">Carregando histórico...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Filtro por Material */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filtrar por Material
            </label>
            <select
              value={filtroMaterial || ""}
              onChange={(e) =>
                setFiltroMaterial(e.target.value ? e.target.value : null)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todos os materiais</option>
              {todosMateriais.map((material) => (
                <option key={material} value={material}>
                  {material.charAt(0).toUpperCase() + material.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Posto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filtrar por Posto
            </label>
            <select
              value={filtroPosto || ""}
              onChange={(e) =>
                setFiltroPosto(
                  e.target.value
                    ? (Number(e.target.value) as NumeroPosto)
                    : null
                )
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
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={limparFiltros}
            className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Histórico{" "}
            {historicoFiltrado.length > 0
              ? `(${historicoFiltrado.length})`
              : ""}
          </h2>
          <span className="text-sm text-gray-600">
            {loading
              ? "Carregando..."
              : `${historicoFiltrado.length} evento${
                  historicoFiltrado.length !== 1 ? "s" : ""
                }`}
          </span>
        </div>

        {historicoFiltrado.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Nenhum evento encontrado</p>
            {filtroMaterial || filtroPosto ? (
              <button
                onClick={limparFiltros}
                className="mt-2 text-xs text-teal-600 hover:text-teal-800"
              >
                Remover filtros para ver todos os eventos
              </button>
            ) : (
              <p className="text-gray-400 text-xs mt-2">
                Adicione materiais ou registre faltas/alterações para ver o
                histórico
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {historicoFiltrado.map((evento, index) => (
              <HistoricoCard
                key={evento.id || `evento-${index}-${evento.createdAt}`}
                evento={evento}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
