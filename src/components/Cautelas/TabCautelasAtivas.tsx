import { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { GVC } from '../../services/gvcService';
import { obterCautelaPorGVC } from '../../services/cautelasService';
import type { Cautela } from '../../types/cautelas';
import { ITENS_CAUTELA } from '../../types/cautelas';

interface TabCautelasAtivasProps {
  gvcs: GVC[];
  onSelectGVC: (gvc: GVC) => void;
}

interface CautelaInfo {
  gvcId: string;
  cautela: Cautela | null;
  isLoading: boolean;
}

export const TabCautelasAtivas = ({ gvcs, onSelectGVC }: TabCautelasAtivasProps) => {
  const [cautelasInfo, setCautelasInfo] = useState<Map<string, CautelaInfo>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  
  const gvcsAtivos = gvcs.filter((gvc) => gvc.status === 'ativo');

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

  const getItemStatus = (cautela: Cautela | null, nomeItem: string) => {
    if (!cautela) return 'nao-entregue';
    
    const itensDoTipo = cautela.itensAtivos.filter(
      item => item.item.toLowerCase() === nomeItem.toLowerCase()
    );
    
    if (itensDoTipo.length === 0) return 'nao-entregue';
    
    // Se tem múltiplos, retorna a pior condição
    const temRuim = itensDoTipo.some(i => i.condicao === 'Ruim');
    const temRegular = itensDoTipo.some(i => i.condicao === 'Regular');
    
    if (temRuim) return 'ruim';
    if (temRegular) return 'regular';
    return 'bom';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bom':
        return 'bg-green-500';
      case 'regular':
        return 'bg-yellow-500';
      case 'ruim':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getItemIcon = (item: string) => {
    // Primeiras letras do item em maiúsculo
    return item.substring(0, 2).toUpperCase();
  };

  // Filtrar GVCs pela pesquisa
  const gvcsFiltrados = gvcsAtivos.filter((gvc) => {
    const matchSearch = gvc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       gvc.posicao.toString().includes(searchTerm);
    return matchSearch;
  });

  if (gvcsAtivos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Nenhum guarda-vidas ativo cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Busca */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
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
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {gvcsFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhum resultado encontrado
            </p>
          </div>
        ) : (
          <>
            {/* Contador de Resultados */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{gvcsFiltrados.length}</span>
                {' '}guarda-vidas {gvcsFiltrados.length === 1 ? 'encontrado' : 'encontrados'}
              </p>
            </div>

            {/* Tabela Desktop / Cards Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white w-24">
                      Classificação
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Itens Cautelados
                    </th>
                    <th className="px-6 py-4 w-12"></th>
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
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white shadow-sm">
                            {gvc.posicao}º
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{gvc.nome}</span>
                        </td>
                        <td className="px-6 py-4">
                          {cautelaInfo?.isLoading ? (
                            <div className="flex flex-wrap gap-1.5">
                              <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                              <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                              <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {ITENS_CAUTELA.map((item) => {
                                const status = getItemStatus(cautelaInfo?.cautela || null, item);
                                const colorClass = getStatusColor(status);
                                
                                return (
                                  <div
                                    key={item}
                                    className={`w-7 h-7 rounded ${colorClass} flex items-center justify-center text-white text-[10px] font-bold shadow-sm hover:scale-110 transition-transform`}
                                    title={`${item} - ${status === 'nao-entregue' ? 'Não entregue' : status.charAt(0).toUpperCase() + status.slice(1)}`}
                                  >
                                    {getItemIcon(item)}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {gvcsFiltrados.map((gvc) => {
                const cautelaInfo = cautelasInfo.get(gvc.id || '');
                
                return (
                  <button
                    key={gvc.id}
                    type="button"
                    onClick={() => onSelectGVC(gvc)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
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
                      {cautelaInfo?.isLoading ? (
                        <div className="flex flex-wrap gap-1.5">
                          <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                          <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                          <div className="w-7 h-7 rounded bg-gray-200 animate-pulse" />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {ITENS_CAUTELA.map((item) => {
                            const status = getItemStatus(cautelaInfo?.cautela || null, item);
                            const colorClass = getStatusColor(status);
                            
                            return (
                              <div
                                key={item}
                                className={`w-7 h-7 rounded ${colorClass} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
                                title={`${item} - ${status === 'nao-entregue' ? 'Não entregue' : status.charAt(0).toUpperCase() + status.slice(1)}`}
                              >
                                {getItemIcon(item)}
                              </div>
                            );
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
    </div>
  );
};
