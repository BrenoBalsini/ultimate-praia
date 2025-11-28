import React, { useMemo } from 'react';
import { type GVC } from '../../services/gvcService';

interface ListaGVCTableProps {
  gvcs: GVC[];
  onEdit: (gvc: GVC) => void;
  onDelete: (gvc: GVC) => void;
  onToggleStatus: (gvc: GVC) => void;
}

type SortBy = 'posicao' | 'alfabetica';

export const ListaGVCTable = ({
  gvcs,
  onEdit,
  onDelete,
  onToggleStatus,
}: ListaGVCTableProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortBy>('posicao');

  // Filtrar por nome/sobrenome
  const gvcsFiltrados = useMemo(() => {
    return gvcs.filter((gvc) =>
      gvc.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gvcs, searchTerm]);

  // Ordenar por posição ou alfabética
  const gvcsOrdenados = useMemo(() => {
    const copia = [...gvcsFiltrados];

    if (sortBy === 'posicao') {
      return copia.sort((a, b) => a.posicao - b.posicao);
    } else {
      return copia.sort((a, b) => a.nome.localeCompare(b.nome));
    }
  }, [gvcsFiltrados, sortBy]);

 return (
  <div className="flex flex-col gap-4">
    {/* Controles de Filtro e Ordenação */}
    <div className="flex flex-col md:flex-row gap-4">
      <input
        placeholder="Buscar por nome..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">Ordenar:</span>
        <select
          className="px-2 py-2 rounded-md border border-gray-200 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
        >
          <option value="posicao">Por Posição</option>
          <option value="alfabetica">Alfabética</option>
        </select>
      </div>
    </div>

    {/* Tabela */}
    {gvcsOrdenados.length > 0 ? (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-3 py-3 text-center font-bold w-20">
                Posição
              </th>
              <th className="px-3 py-3 text-left font-bold">
                Nome
              </th>
              <th className="px-3 py-3 text-left font-bold">
                Status
              </th>
              <th className="px-3 py-3 text-center font-bold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {gvcsOrdenados.map((gvc) => (
              <tr
                key={gvc.id}
                className="border-b border-gray-200 bg-white hover:bg-gray-50"
              >
                <td className="px-3 py-3 text-center font-bold text-base">
                  {gvc.posicao}º
                </td>
                <td className="px-3 py-3 font-medium">
                  {gvc.nome}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      gvc.status === "ativo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {gvc.status === "ativo" ? "✓ Ativo" : "✗ Inativo"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(gvc)}
                      className="px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(gvc)}
                      className={`px-2 py-1 text-sm rounded-md transition-colors ${
                        gvc.status === "ativo"
                          ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {gvc.status === "ativo" ? "Desativar" : "Ativar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(gvc)}
                      className="px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm
            ? "Nenhum GVC encontrado com esse nome"
            : "Nenhum GVC cadastrado ainda"}
        </p>
      </div>
    )}

    {/* Resumo */}
    <p className="text-sm text-gray-600">
      Total: <strong>{gvcsOrdenados.length}</strong> GVCs
      {searchTerm && ` (filtrados de ${gvcs.length})`}
    </p>
  </div>
);
};