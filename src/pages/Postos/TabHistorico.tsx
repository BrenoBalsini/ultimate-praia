import { useState, useEffect, useMemo } from "react";
import { Clock, Filter, X, ArrowRight, ChevronDown } from "lucide-react";
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

// Tipo de filtro de categoria
type FiltroCategoria = 
  | "guardassol" 
  | "radio" 
  | "binoculo" 
  | "whitemed" 
  | "bolsa_aph" 
  | "outros" 
  | "alteracoes"
  | null;

// Tipo para agrupar eventos relacionados
interface EventoAgrupado {
  chave: string;
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
      material_a_deletado: "Material deletado",
      falta_registrada: "Falta registrada",
      falta_resolvida: "Falta resolvida",
      alteracao_adicionada: "Alteração registrada",
      alteracao_resolvida: "Alteração resolvida",
      outros_entrega_registrada: "Entrega registrada",
    };
    return mapa[evento.tipo] || evento.tipo;
  };

  const corBolinha = () => {
    if (evento.tipo.includes("resolvid")) return "bg-emerald-500";
    if (evento.tipo.includes("adicionad")) return "bg-blue-500";
    if (evento.tipo.includes("avaria")) return "bg-yellow-500";
    if (evento.tipo.includes("quebrado")) return "bg-red-500";
    if (evento.tipo.includes("devolvido")) return "bg-gray-500";
    if (evento.tipo.includes("deletado")) return "bg-red-700";
    return "bg-gray-400";
  };

  const data = (() => {
    try {
      const date = new Date(evento.createdAt);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  })();

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${corBolinha()} ring-4 ring-white flex-shrink-0 mt-1.5`}
        />
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

  const eventoRecente = grupo.eventos[0];
  const dataRecente = (() => {
    try {
      const date = new Date(eventoRecente.createdAt);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Data inválida";
    }
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                  {grupo.eventos.length} evento
                  {grupo.eventos.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">
                  Última atualização: {dataRecente}
                </span>
              </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowRight
              className={`w-5 h-5 transition-transform ${
                expandido ? "rotate-90" : ""
              }`}
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

export const TabHistorico = () => {
  const [todosEventos, setTodosEventos] = useState<HistoricoDoc[]>([]);
  const [materiaisPorCategoria, setMateriaisPorCategoria] = useState<
    Record<string, string[]>
  >({});
  
  // ✅ NOVOS FILTROS - Nível 1 e 2
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoria>(null);
  const [filtroMaterialEspecifico, setFiltroMaterialEspecifico] = useState<string | null>(null);
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
      
      // Agrupar materiais por categoria
      const porCategoria: Record<string, string[]> = {
        whitemed: [],
        bolsa_aph: [],
        outros: [],
      };

      listaB.forEach((material) => {
        if (porCategoria[material.categoria]) {
          porCategoria[material.categoria].push(material.nome);
        }
      });

      // Ordenar alfabeticamente
      Object.keys(porCategoria).forEach((cat) => {
        porCategoria[cat].sort((a, b) => a.localeCompare(b));
      });

      setMateriaisPorCategoria(porCategoria);
    } catch (error) {
      console.error("Erro ao carregar materiais para filtro:", error);
    }
  };

  useEffect(() => {
    carregarMateriaisFiltro();
    carregarHistorico();
  }, []);

  // ✅ Limpar filtro de material específico quando categoria muda
  useEffect(() => {
    setFiltroMaterialEspecifico(null);
  }, [filtroCategoria]);

  // ✅ Obter lista de materiais específicos baseado na categoria selecionada
  const materiaisEspecificosDisponiveis = useMemo(() => {
    if (!filtroCategoria) return [];
    
    if (filtroCategoria === "whitemed") return materiaisPorCategoria.whitemed || [];
    if (filtroCategoria === "bolsa_aph") return materiaisPorCategoria.bolsa_aph || [];
    if (filtroCategoria === "outros") return materiaisPorCategoria.outros || [];
    
    return [];
  }, [filtroCategoria, materiaisPorCategoria]);

  // ✅ Agrupar eventos com filtros avançados
  const eventosAgrupados = useMemo(() => {
    let filtrado = [...todosEventos];

    // Filtro por CATEGORIA (Nível 1)
    if (filtroCategoria) {
      filtrado = filtrado.filter((evento) => {
        // Material Tipo A
        if (evento.materialATipo === filtroCategoria) return true;
        
        // Material Tipo B (por categoria)
        if (evento.materialTipoBCategoria === filtroCategoria) return true;
        
        // Alterações
        if (filtroCategoria === "alteracoes" && evento.tipo.includes("alteracao")) return true;
        
        return false;
      });
    }

    // Filtro por MATERIAL ESPECÍFICO (Nível 2)
    if (filtroMaterialEspecifico) {
      filtrado = filtrado.filter((evento) => {
        return evento.materialTipoBNome === filtroMaterialEspecifico;
      });
    }

    // Filtro por POSTO
    if (filtroPosto) {
      filtrado = filtrado.filter((evento) => evento.postoNumero === filtroPosto);
    }

    // Agrupar por material/posto
    const grupos: Record<string, EventoAgrupado> = {};

    filtrado.forEach((evento) => {
      let chave: string;
      let titulo: string;
      let icone: string;

      // Material Tipo A
      if (evento.materialATipo && evento.materialANumero) {
        chave = `material-a-${evento.materialATipo}-${evento.materialANumero}-posto-${evento.postoNumero}`;
        const icones: Record<TipoMaterialA, string> = {
          binoculo: "🔭",
          guardassol: "☂️",
          radio: "📻",
        };
        icone = icones[evento.materialATipo as TipoMaterialA];

        const dataFormatada = new Date(evento.materialANumero).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });

        const tipoCapitalizado =
          evento.materialATipo.charAt(0).toUpperCase() + evento.materialATipo.slice(1);
        titulo = `${tipoCapitalizado} #${dataFormatada} - Posto ${evento.postoNumero}`;
      }
      // Material Tipo B
      else if (evento.materialTipoBNome) {
        chave = `material-b-${evento.materialTipoBNome}-posto-${evento.postoNumero}`;
        icone = "📦";
        titulo = `${evento.materialTipoBNome} - Posto ${evento.postoNumero}`;
      }
      // Alteração de posto
      else {
        chave = `alteracao-posto-${evento.postoNumero}-${evento.createdAt}`;
        icone = "🔧";
        titulo = `Alteração no Posto ${evento.postoNumero}`;
      }

      if (!grupos[chave]) {
        grupos[chave] = { chave, titulo, icone, eventos: [] };
      }

      grupos[chave].eventos.push(evento);
    });

    // Ordenar eventos dentro de cada grupo
    Object.values(grupos).forEach((grupo) => {
      grupo.eventos.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return Object.values(grupos).sort((a, b) => {
      const dataA = new Date(a.eventos[0].createdAt).getTime();
      const dataB = new Date(b.eventos[0].createdAt).getTime();
      return dataB - dataA;
    });
  }, [todosEventos, filtroCategoria, filtroMaterialEspecifico, filtroPosto]);

  const limparFiltros = () => {
    setFiltroCategoria(null);
    setFiltroMaterialEspecifico(null);
    setFiltroPosto(null);
  };

  const temFiltrosAtivos = 
    filtroCategoria !== null || 
    filtroMaterialEspecifico !== null || 
    filtroPosto !== null;

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
      {/* ✅ Card de Filtros Avançados */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#1E3A5F]" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros Avançados</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por CATEGORIA (Nível 1) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tipo de Material
            </label>
            <div className="relative">
              <select
                value={filtroCategoria || ""}
                onChange={(e) =>
                  setFiltroCategoria(e.target.value ? (e.target.value as FiltroCategoria) : null)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors appearance-none"
              >
                <option value="">Todos os tipos</option>
                <optgroup label="Materiais Tipo A">
                  <option value="guardassol">Guarda-Sol</option>
                  <option value="radio">Rádio</option>
                  <option value="binoculo">Binóculo</option>
                </optgroup>
                <optgroup label="Materiais Tipo B">
                  <option value="whitemed">Whitemed</option>
                  <option value="bolsa_aph">Bolsa APH</option>
                  <option value="outros">Outros Materiais</option>
                </optgroup>
                <optgroup label="Outros">
                  <option value="alteracoes">Alterações</option>
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filtro por MATERIAL ESPECÍFICO (Nível 2) - Só aparece se categoria permitir */}
          {filtroCategoria && materiaisEspecificosDisponiveis.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Material Específico
              </label>
              <div className="relative">
                <select
                  value={filtroMaterialEspecifico || ""}
                  onChange={(e) =>
                    setFiltroMaterialEspecifico(e.target.value || null)
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors appearance-none"
                >
                  <option value="">Todos os materiais</option>
                  {materiaisEspecificosDisponiveis.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Filtro por POSTO */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Posto
            </label>
            <div className="relative">
              <select
                value={filtroPosto || ""}
                onChange={(e) =>
                  setFiltroPosto(e.target.value ? (Number(e.target.value) as NumeroPosto) : null)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors appearance-none"
              >
                <option value="">Todos os postos</option>
                {POSTOS_FIXOS.map((numero) => (
                  <option key={numero} value={numero}>
                    Posto {numero}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
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
        <h2 className="text-xl font-bold text-gray-900">Histórico Agrupado</h2>
        <span className="px-4 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold">
          {eventosAgrupados.length} {eventosAgrupados.length !== 1 ? "grupos" : "grupo"}
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
