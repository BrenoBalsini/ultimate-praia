import { useState, useEffect, useMemo } from "react";
import { Clock, Filter, X, ArrowRight } from "lucide-react";
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

// Tipo para agrupar eventos relacionados
interface EventoAgrupado {
  chave: string; // identificador único (ex: "binoculo-1-posto-1")
  titulo: string;
  icone: string;
  eventos: HistoricoDoc[];
}

interface TimelineEventoProps {
  evento: HistoricoDoc;
  isLast: boolean;
}

const TimelineEvento = ({ evento, isLast }: TimelineEventoProps) => {
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

  const corBolinha = () => {
    if (evento.tipo.includes('resolvid')) return 'bg-emerald-500';
    if (evento.tipo.includes('adicionad')) return 'bg-blue-500';
    if (evento.tipo.includes('avaria')) return 'bg-yellow-500';
    if (evento.tipo.includes('quebrado')) return 'bg-red-500';
    if (evento.tipo.includes('devolvido')) return 'bg-gray-500';
    return 'bg-gray-400';
  };

  const data = new Date(evento.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-3 group">
      {/* Linha vertical e bolinha */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${corBolinha()} ring-4 ring-white flex-shrink-0 mt-1.5`} />
        {!isLast && (
          <div className="w-0.5 h-full bg-gray-200 mt-1" />
        )}
      </div>

      {/* Conteúdo do evento */}
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

          {evento.observacao && (
            <p className="text-xs text-gray-700 mt-2 leading-relaxed">
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

  // Evento mais recente
  const eventoRecente = grupo.eventos[0];
  const dataRecente = new Date(eventoRecente.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header do Card */}
      <div 
        className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{grupo.icone}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {grupo.titulo}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-600">
                  {grupo.eventos.length} evento{grupo.eventos.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">
                  Última atualização: {dataRecente}
                </span>
              </div>
            </div>
          </div>

          {/* Indicador de expansão */}
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight 
              className={`w-5 h-5 transition-transform ${expandido ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Timeline de eventos */}
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

export const TabHistorico = () => {
  const [todosEventos, setTodosEventos] = useState<HistoricoDoc[]>([]);
  const [todosMateriais, setTodosMateriais] = useState<string[]>([]);
  const [filtroMaterial, setFiltroMaterial] = useState<string | null>(null);
  const [filtroPosto, setFiltroPosto] = useState<NumeroPosto | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const eventos = await buscarHistorico();
      setTodosEventos(eventos);
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

  // Agrupar eventos relacionados
  const eventosAgrupados = useMemo(() => {
    let filtrado = [...todosEventos];

    // Aplicar filtros
    if (filtroMaterial) {
      filtrado = filtrado.filter((evento) => {
        if (evento.materialATipo === filtroMaterial) return true;
        if (evento.materialTipoBNome === filtroMaterial) return true;
        return false;
      });
    }

    if (filtroPosto) {
      filtrado = filtrado.filter(
        (evento) => evento.postoNumero === filtroPosto
      );
    }

    // Agrupar por material/posto
    const grupos: Record<string, EventoAgrupado> = {};

    filtrado.forEach((evento) => {
      let chave: string;
      let titulo: string;
      let icone: string;

      // Material Tipo A (binóculo, guarda-sol, rádio)
      if (evento.materialATipo && evento.materialANumero) {
        chave = `material-a-${evento.materialATipo}-${evento.materialANumero}-posto-${evento.postoNumero}`;
        const icones: Record<TipoMaterialA, string> = {
          binoculo: "🔭",
          guardassol: "☂️",
          radio: "📻",
        };
        icone = icones[evento.materialATipo as TipoMaterialA];
        titulo = `${evento.materialATipo.charAt(0).toUpperCase() + evento.materialATipo.slice(1)} #${evento.materialANumero} - Posto ${evento.postoNumero}`;
      }
      // Material Tipo B (whitemed, bolsa APH, limpeza)
      else if (evento.materialTipoBNome) {
        chave = `material-b-${evento.materialTipoBNome}-posto-${evento.postoNumero}`;
        icone = "⚠️";
        titulo = `${evento.materialTipoBNome} - Posto ${evento.postoNumero}`;
      }
      // Alteração de posto
      else {
        chave = `alteracao-posto-${evento.postoNumero}-${evento.createdAt}`;
        icone = "🔧";
        titulo = `Alteração no Posto ${evento.postoNumero}`;
      }

      if (!grupos[chave]) {
        grupos[chave] = {
          chave,
          titulo,
          icone,
          eventos: [],
        };
      }

      grupos[chave].eventos.push(evento);
    });

    // Ordenar eventos dentro de cada grupo (mais recente primeiro)
    Object.values(grupos).forEach((grupo) => {
      grupo.eventos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    // Converter para array e ordenar por evento mais recente
    return Object.values(grupos).sort((a, b) => {
      const dataA = new Date(a.eventos[0].createdAt).getTime();
      const dataB = new Date(b.eventos[0].createdAt).getTime();
      return dataB - dataA;
    });
  }, [todosEventos, filtroMaterial, filtroPosto]);

  const limparFiltros = () => {
    setFiltroMaterial(null);
    setFiltroPosto(null);
  };

  const temFiltrosAtivos = filtroMaterial !== null || filtroPosto !== null;

  if (loading && todosEventos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card de Filtros */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#1E3A5F]" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por Material */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Material
            </label>
            <select
              value={filtroMaterial || ""}
              onChange={(e) =>
                setFiltroMaterial(e.target.value ? e.target.value : null)
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
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
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Posto
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

      {/* Header de Resultados */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Histórico Agrupado
        </h2>
        <span className="px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold">
          {eventosAgrupados.length} {eventosAgrupados.length !== 1 ? 'grupos' : 'grupo'}
        </span>
      </div>

      {/* Cards de Timeline */}
      {eventosAgrupados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum evento encontrado
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {temFiltrosAtivos
              ? "Tente ajustar os filtros para ver mais resultados"
              : "Registre atividades nos postos para ver o histórico"}
          </p>
          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3A5F] hover:text-[#2C5282]"
            >
              <X className="w-4 h-4" />
              Remover filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {eventosAgrupados.map((grupo) => (
            <TimelineCard key={grupo.chave} grupo={grupo} />
          ))}
        </div>
      )}
    </div>
  );
};
