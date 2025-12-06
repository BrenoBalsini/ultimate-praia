import React, { useMemo } from "react";
import { type GVC } from "../../services/gvcService";
import { Search, ChevronRight, Users } from "lucide-react";

interface ListaGVCTableProps {
  gvcs: GVC[];
  totalGvcs: number;
  onNavigateToDetails: (gvcId: string) => void;
}

type SortBy = "posicao" | "alfabetica";

export const ListaGVCTable = ({ gvcs, totalGvcs, onNavigateToDetails }: ListaGVCTableProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortBy>("posicao");

  const gvcsFiltrados = useMemo(() => {
    return gvcs.filter((gvc) =>
      gvc.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gvcs, searchTerm]);

  const gvcsOrdenados = useMemo(() => {
    const copia = [...gvcsFiltrados];
    if (sortBy === "posicao") {
      return copia.sort((a, b) => a.posicao - b.posicao);
    } else {
      return copia.sort((a, b) => a.nome.localeCompare(b.nome));
    }
  }, [gvcsFiltrados, sortBy]);

  // Card para Mobile
  const GVCCard = ({ gvc }: { gvc: GVC }) => (
    <button
      onClick={() => onNavigateToDetails(gvc.id!)}
      className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1E3A5F] hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A5F] text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
            {gvc.posicao}º
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#1E3A5F] transition-colors">
              {gvc.nome}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                gvc.status === "ativo"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-200 text-gray-700"
              }`}>
                {gvc.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1E3A5F] transition-colors flex-shrink-0" />
      </div>
    </button>
  );

  return (
    <div className="flex flex-col">
      {/* Controles */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="text-sm text-gray-600">
            Total: <strong className="text-gray-900 font-semibold">{totalGvcs}</strong> GVCs cadastrados
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] bg-white"
            />
          </div>

          {/* Ordenação */}
          <select
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] bg-white min-w-[160px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="posicao">Por Posição</option>
            <option value="alfabetica">Alfabética</option>
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      {gvcsOrdenados.length > 0 ? (
        <>
          {/* Mobile: Cards */}
          <div className="lg:hidden p-4 space-y-3">
            {gvcsOrdenados.map((gvc) => (
              <GVCCard key={gvc.id} gvc={gvc} />
            ))}
          </div>

          {/* Desktop: Tabela */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1E3A5F] text-white">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Nome Completo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gvcsOrdenados.map((gvc, index) => (
                  <tr
                    key={gvc.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E3A5F] text-white font-bold text-sm">
                        {gvc.posicao}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{gvc.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          gvc.status === "ativo"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {gvc.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onNavigateToDetails(gvc.id!)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#1E3A5F] hover:text-[#2C5282] transition-colors"
                      >
                        Ver Detalhes
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="text-gray-400 mb-3">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium mb-1">
            {searchTerm ? "Nenhum GVC encontrado" : "Nenhum GVC cadastrado"}
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? "Tente outro termo de busca"
              : "Clique em 'Novo GVC' para começar"}
          </p>
        </div>
      )}

      {/* Rodapé - apenas se houver filtro */}
      {searchTerm && gvcsOrdenados.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Exibindo <strong className="text-gray-900">{gvcsOrdenados.length}</strong> de{" "}
            <strong className="text-gray-900">{totalGvcs}</strong> GVCs
          </p>
        </div>
      )}
    </div>
  );
};
