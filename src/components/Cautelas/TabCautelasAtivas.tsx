import { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import { obterCautelaPorGVC } from '../../services/cautelasService';
import type { Cautela, ItemCautelado, CondicaoItem } from '../../types/cautelas';
import { obterItensCautelaveis } from '../../services/itensCautelaveisService';

interface TabCautelasAtivasProps {
  gvcs: GVC[];
  onSelectGVC: (gvc: GVC) => void;
}

interface CautelaInfo {
  gvcId: string;
  cautela: Cautela | null;
  isLoading: boolean;
}

interface ItemAgrupado {
  nomeItem: string;
  itens: ItemCautelado[];
  quantidade: number;
}

export const TabCautelasAtivas = ({ gvcs, onSelectGVC }: TabCautelasAtivasProps) => {
  const [cautelasInfo, setCautelasInfo] = useState<Map<string, CautelaInfo>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [itensCautelaveis, setItensCautelaveis] = useState<string[]>([]);
  const [isLoadingItens, setIsLoadingItens] = useState(true);
  
  const gvcsAtivos = gvcs.filter((gvc) => gvc.status === 'ativo');

  // Carregar itens cauteláveis
  useEffect(() => {
    const carregarItens = async () => {
      try {
        setIsLoadingItens(true);
        const itens = await obterItensCautelaveis(true);
        setItensCautelaveis(itens.map(i => i.nome));
      } catch (error) {
        console.error('Erro ao carregar itens cauteláveis:', error);
      } finally {
        setIsLoadingItens(false);
      }
    };

    carregarItens();
  }, []);

  useEffect(() => {
    // Carregar cautelas de todos os GVCs ativos
    const carregarCautelas = async () => {
      const novasCautelas = new Map<string, CautelaInfo>();
      
      for (const gvc of gvcsAtivos) {
        if (!gvc.id) continue;
        
        novasCautelas.set(gvc.id, {
          gvcId: gvc.id,
          cautela: null,
          isLoading: true,
        });
        
        try {
          const cautela = await obterCautelaPorGVC(gvc.id);
          novasCautelas.set(gvc.id, {
            gvcId: gvc.id,
            cautela,
            isLoading: false,
          });
        } catch (error) {
          console.error(`Erro ao carregar cautela do GVC ${gvc.id}:`, error);
          novasCautelas.set(gvc.id, {
            gvcId: gvc.id,
            cautela: null,
            isLoading: false,
          });
        }
      }
      
      setCautelasInfo(novasCautelas);
    };

    if (gvcsAtivos.length > 0) {
      carregarCautelas();
    }
  }, [gvcsAtivos]);

  // NOVO: Agrupar itens por tipo
  const agruparItens = (cautela: Cautela | null, nomeItem: string): ItemAgrupado => {
    if (!cautela) {
      return { nomeItem, itens: [], quantidade: 0 };
    }
    
    const itensDoTipo = cautela.itensAtivos.filter(
      item => item.item.toLowerCase() === nomeItem.toLowerCase()
    );
    
    // Ordenar por condição (Ruim -> Regular -> Bom)
    const ordenados = [...itensDoTipo].sort((a, b) => {
      const ordem: Record<CondicaoItem, number> = { 'Ruim': 0, 'Regular': 1, 'Bom': 2 };
      return ordem[a.condicao] - ordem[b.condicao];
    });
    
    return {
      nomeItem,
      itens: ordenados,
      quantidade: ordenados.length,
    };
  };

  const getStatusColor = (condicao: CondicaoItem) => {
    switch (condicao) {
      case 'Bom':
        return 'bg-green-500';
      case 'Regular':
        return 'bg-yellow-500';
      case 'Ruim':
        return 'bg-red-500';
    }
  };

  const getItemIcon = (item: string) => {
    // Primeiras 2 letras em maiúsculo
    return item.substring(0, 2).toUpperCase();
  };

  // Componente de Cards Empilhados
  const StackedItemCards = ({ itemAgrupado }: { itemAgrupado: ItemAgrupado }) => {
    if (itemAgrupado.quantidade === 0) {
      // Sem itens - mostrar cinza
      return (
        <div
          className="w-7 h-7 rounded bg-gray-300 flex items-center justify-center text-white text-[10px] font-bold shadow-sm border border-gray-400"
          title={`${itemAgrupado.nomeItem} - Não entregue`}
        >
          {getItemIcon(itemAgrupado.nomeItem)}
        </div>
      );
    }

    if (itemAgrupado.quantidade === 1) {
      // Um item - mostrar normal
      const item = itemAgrupado.itens[0];
      const colorClass = getStatusColor(item.condicao);
      
      return (
        <div
          className={`w-7 h-7 rounded ${colorClass} flex items-center justify-center text-white text-[10px] font-bold shadow-sm transition-transform border-1 border-gray-800`}
          title={`${itemAgrupado.nomeItem} - ${item.condicao}`}
        >
          {getItemIcon(itemAgrupado.nomeItem)}
        </div>
      );
    }

    // Múltiplos itens - mostrar empilhados
    const maxVisible = 3; // Máximo de cards visíveis empilhados
    const itensVisiveis = itemAgrupado.itens.slice(0, maxVisible);
    
    return (
      <div className="relative group">
        {/* Cards empilhados */}
        <div className="relative" style={{ width: '28px', height: '28px' }}>
          {itensVisiveis.map((item, index) => {
            const colorClass = getStatusColor(item.condicao);
            const offset = index * 3; // Deslocamento em pixels
            const zIndex = itensVisiveis.length - index;
            
            return (
              <div
                key={index}
                className={`absolute ${colorClass} rounded flex items-center justify-center text-white text-[10px] font-bold shadow-md border-1 border-gray-800`}
                style={{
                  width: '28px',
                  height: '28px',
                  top: `${offset}px`,
                  left: `${offset}px`,
                  zIndex: zIndex,
                }}
              >
                {getItemIcon(itemAgrupado.nomeItem)}
              </div>
            );
          })}
        </div>

        {/* Badge de quantidade */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm z-10 border border-gray-800">
          {itemAgrupado.quantidade}
        </div>

        {/* Tooltip detalhado no hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-2 whitespace-nowrap">
            <p className="font-bold mb-1 capitalize">{itemAgrupado.nomeItem}</p>
            {itemAgrupado.itens.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 py-0.5">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(item.condicao)}`} />
                <span>{item.condicao}</span>
                {item.tamanho !== '-' && <span className="text-gray-400">({item.tamanho})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  // Filtrar GVCs pela pesquisa
  const gvcsFiltrados = gvcsAtivos.filter((gvc) => {
    const matchSearch = gvc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       gvc.posicao.toString().includes(searchTerm);
    return matchSearch;
  });

  if (gvcsAtivos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum guarda-vidas ativo cadastrado</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou classificação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors text-base"
        />
      </div>

      {/* Resultados */}
      {gvcsFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhum resultado encontrado
          </p>
        </div>
      ) : (
        <>
          {/* Contador de Resultados */}
          <div className="pb-3 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{gvcsFiltrados.length}</span>
              {' '}guarda-vidas {gvcsFiltrados.length === 1 ? 'encontrado' : 'encontrados'}
            </p>
          </div>

          {/* Tabela Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-24">
                    Classificação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Itens Cautelados
                  </th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gvcsFiltrados.map((gvc) => {
                  const cautelaInfo = cautelasInfo.get(gvc.id || '');
                  
                  return (
                    <tr
                      key={gvc.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onSelectGVC(gvc)}
                    >
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white shadow-sm">
                          {gvc.posicao}º
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">{gvc.nome}</span>
                      </td>
                      <td className="px-4 py-6">
                        {isLoadingItens || cautelaInfo?.isLoading ? (
                          <div className="flex flex-wrap gap-3">
                            <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                            <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                            <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3 items-center">
                            {itensCautelaveis.map((item) => {
                              const itemAgrupado = agruparItens(cautelaInfo?.cautela || null, item);
                              return <StackedItemCards key={item} itemAgrupado={itemAgrupado} />;
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="md:hidden space-y-3">
            {gvcsFiltrados.map((gvc) => {
              const cautelaInfo = cautelasInfo.get(gvc.id || '');
              
              return (
                <button
                  key={gvc.id}
                  type="button"
                  onClick={() => onSelectGVC(gvc)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1E3A5F] hover:shadow-md transition-all text-left"
                >
                  {/* Header: Classificação e Nome */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white shadow-sm flex-shrink-0">
                      {gvc.posicao}º
                    </span>
                    <span className="font-medium text-gray-900 flex-1">{gvc.nome}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>

                  {/* Itens Cautelados */}
                  <div className="pl-13">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Itens Cautelados
                    </p>
                    {isLoadingItens || cautelaInfo?.isLoading ? (
                      <div className="flex flex-wrap gap-3">
                        <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                        <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                        <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 items-center">
                        {itensCautelaveis.map((item) => {
                          const itemAgrupado = agruparItens(cautelaInfo?.cautela || null, item);
                          return <StackedItemCards key={item} itemAgrupado={itemAgrupado} />;
                        })}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
