import React, { useMemo } from 'react';
import { type GVC } from '../../services/gvcService';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

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

  // Card component para mobile
  const GVCCard = ({ gvc }: { gvc: GVC }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {gvc.posicao}º
            </span>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{gvc.nome}</h3>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {gvc.status === 'ativo' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <CheckCircle size={14} />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                <XCircle size={14} />
                Inativo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onEdit(gvc)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Edit size={16} />
          <span className="hidden sm:inline">Editar</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(gvc)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            gvc.status === 'ativo'
              ? 'text-orange-600 hover:bg-orange-50'
              : 'text-green-600 hover:bg-green-50'
          }`}
        >
          {gvc.status === 'ativo' ? (
            <>
              <XCircle size={16} />
              <span className="hidden sm:inline">Desativar</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              <span className="hidden sm:inline">Ativar</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onDelete(gvc)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Deletar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Controles de Filtro e Ordenação */}
      <div className="flex flex-col gap-3">
        <input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Ordenar:</span>
          <select
            className="flex-1 px-2 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
          >
            <option value="posicao">Por Posição</option>
            <option value="alfabetica">Alfabética</option>
          </select>
        </div>
      </div>

      {/* Cards (Mobile) ou Tabela (Desktop) */}
      {gvcsOrdenados.length > 0 ? (
        <>
          {/* Mobile: Grid de Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3">
            {gvcsOrdenados.map((gvc) => (
              <GVCCard key={gvc.id} gvc={gvc} />
            ))}
          </div>

          {/* Desktop: Tabela */}
          <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-lg">
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
                          gvc.status === 'ativo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {gvc.status === 'ativo' ? '✓ Ativo' : '✗ Inativo'}
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
                            gvc.status === 'ativo'
                              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {gvc.status === 'ativo' ? 'Desativar' : 'Ativar'}
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
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm
              ? 'Nenhum GVC encontrado com esse nome'
              : 'Nenhum GVC cadastrado ainda'}
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
