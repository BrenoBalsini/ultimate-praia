import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Plus, FileText, CheckCircle } from 'lucide-react';
import type { Cautela, CondicaoItem, ItemCautelado } from '../../types/cautelas';

interface ModalDetalhesCautelaProps {
  isOpen: boolean;
  onClose: () => void;
  cautela: Cautela | null;
  onAdicionarItem: () => void;
  onDevolverItem: (itemId: string, condicaoFinal: CondicaoItem, observacao?: string) => Promise<void>;
  onSubstituirItem: (itemId: string) => void;
}

interface ItemAgrupado {
  nomeItem: string;
  quantidade: number;
  itens: ItemCautelado[];
  expandido: boolean;
}

export const ModalDetalhesCautela = ({
  isOpen,
  onClose,
  cautela,
  onAdicionarItem,
  onDevolverItem,
  onSubstituirItem,
}: ModalDetalhesCautelaProps) => {
  const [itemDevolucao, setItemDevolucao] = useState<string | null>(null);
  const [condicaoDevolucao, setCondicaoDevolucao] = useState<CondicaoItem>('Bom');
  const [observacaoDevolucao, setObservacaoDevolucao] = useState('');
  const [itensExpandidos, setItensExpandidos] = useState<Set<string>>(new Set());

  if (!isOpen || !cautela) return null;

  const formatarData = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getCondicaoBadge = (condicao: CondicaoItem) => {
    const cores = {
      Bom: 'bg-green-100 text-green-700',
      Regular: 'bg-yellow-100 text-yellow-700',
      Ruim: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cores[condicao]}`}>
        <span className="w-2 h-2 rounded-full bg-current" />
        {condicao}
      </span>
    );
  };

  const agruparItens = (): ItemAgrupado[] => {
    const grupos = new Map<string, ItemCautelado[]>();
    
    cautela.itensAtivos.forEach((item) => {
      const nomeItem = item.item.toLowerCase();
      if (!grupos.has(nomeItem)) {
        grupos.set(nomeItem, []);
      }
      grupos.get(nomeItem)!.push(item);
    });
    
    return Array.from(grupos.entries()).map(([nomeItem, itens]) => ({
      nomeItem,
      quantidade: itens.length,
      itens,
      expandido: itensExpandidos.has(nomeItem),
    }));
  };

  const toggleExpandir = (nomeItem: string) => {
    const novosExpandidos = new Set(itensExpandidos);
    if (novosExpandidos.has(nomeItem)) {
      novosExpandidos.delete(nomeItem);
    } else {
      novosExpandidos.add(nomeItem);
    }
    setItensExpandidos(novosExpandidos);
  };

  const itensAgrupados = agruparItens();

  const handleDevolverClick = (itemId: string) => {
    setItemDevolucao(itemId);
  };

  const handleConfirmarDevolucao = async () => {
    if (!itemDevolucao) return;
    
    try {
      await onDevolverItem(itemDevolucao, condicaoDevolucao, observacaoDevolucao);
      setItemDevolucao(null);
      setCondicaoDevolucao('Bom');
      setObservacaoDevolucao('');
    } catch (error) {
      console.error('Erro ao devolver:', error);
    }
  };

  const handleGerarPDF = () => {
    alert('Funcionalidade de PDF em desenvolvimento');
  };

  return (
    <>
      {/* Overlay Principal */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal Principal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full sm:max-w-6xl bg-white sm:rounded-lg shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] border-b-4 border-[#C53030]">
              <div className="px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {cautela.gvcNome}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onAdicionarItem}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Adicionar Empréstimo</span>
                    <span className="sm:hidden">Adicionar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGerarPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Gerar PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* ITENS CAUTELADOS */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 sm:mb-4 uppercase tracking-wide">
                  Itens Cautelados
                </h3>
                
                {itensAgrupados.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">Nenhum item cautelado</p>
                    <p className="text-sm text-gray-400">Clique em "Adicionar Empréstimo" para começar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itensAgrupados.map((grupo) => (
                      <div key={grupo.nomeItem} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleExpandir(grupo.nomeItem)}
                          className="w-full bg-gray-50 hover:bg-gray-100 px-3 sm:px-4 py-3 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="font-semibold text-gray-900 capitalize text-sm sm:text-base">
                              {grupo.nomeItem}
                            </span>
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                              {grupo.quantidade}
                            </span>
                          </div>
                          {grupo.expandido ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>

                        {grupo.expandido && (
                          <div className="bg-white">
                            <div className="hidden sm:block overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tamanho</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Condição</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Data</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Observação</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {grupo.itens.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">{item.tamanho}</td>
                                      <td className="px-4 py-3">{getCondicaoBadge(item.condicao)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{formatarData(item.dataEmprestimo)}</td>
                                      <td className="px-4 py-3 text-sm text-gray-500">{item.observacao || '-'}</td>
                                      <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleDevolverClick(item.id!)}
                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                          >
                                            Devolver
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => onSubstituirItem(item.id!)}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                          >
                                            Substituir
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="sm:hidden divide-y divide-gray-200">
                              {grupo.itens.map((item) => (
                                <div key={item.id} className="p-3 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Tamanho:</span>
                                        <span className="text-sm font-semibold text-gray-900">{item.tamanho}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Condição:</span>
                                        {getCondicaoBadge(item.condicao)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span className="font-medium">Data:</span> {formatarData(item.dataEmprestimo)}
                                  </div>
                                  {item.observacao && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Obs:</span> {item.observacao}
                                    </div>
                                  )}
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDevolverClick(item.id!)}
                                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      Devolver
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onSubstituirItem(item.id!)}
                                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      Substituir
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HISTÓRICO */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 sm:mb-4 uppercase tracking-wide">
                  Histórico
                </h3>
                
                {!cautela.historico || cautela.historico.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic text-sm">Nenhum registro no histórico</p>
                  </div>
                ) : (
                  <>
                    <div className="hidden sm:block overflow-x-auto border-2 border-gray-200 rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tamanho</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cond. Inicial</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cond. Final</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Datas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tipo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Observação</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cautela.historico.map((hist) => (
                            <tr key={hist.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 capitalize">{hist.item}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{hist.tamanho}</td>
                              <td className="px-4 py-3">{getCondicaoBadge(hist.condicaoInicial)}</td>
                              <td className="px-4 py-3">{getCondicaoBadge(hist.condicaoFinal)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex flex-col gap-1">
                                  <span>← {formatarData(hist.dataEmprestimo)}</span>
                                  <span>→ {formatarData(hist.dataDevolucao)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{hist.tipo}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{hist.observacao || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="sm:hidden space-y-3">
                      {cautela.historico.map((hist) => (
                        <div key={hist.id} className="border-2 border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 capitalize">{hist.item}</span>
                            <span className="text-sm text-gray-600">{hist.tamanho}</span>
                          </div>
                          <div className="flex gap-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Inicial</p>
                              {getCondicaoBadge(hist.condicaoInicial)}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Final</p>
                              {getCondicaoBadge(hist.condicaoFinal)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>← {formatarData(hist.dataEmprestimo)}</div>
                            <div>→ {formatarData(hist.dataDevolucao)}</div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Tipo:</span> {hist.tipo}
                          </div>
                          {hist.observacao && (
                            <div className="text-sm text-gray-600 pt-2 border-t border-gray-100">
                              <span className="font-medium">Obs:</span> {hist.observacao}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Mobile */}
            <div className="sm:hidden sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#2C5282] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Devolução */}
      {itemDevolucao && (
        <>
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-50" onClick={() => setItemDevolucao(null)} />
          
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              <div 
                className="w-full sm:max-w-md bg-white sm:rounded-xl shadow-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-4 sm:px-6 py-4 sm:rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Devolver Item</h3>
                      <p className="text-sm text-blue-100">Registre a devolução do item</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condição Final *
                    </label>
                    <select
                      value={condicaoDevolucao}
                      onChange={(e) => setCondicaoDevolucao(e.target.value as CondicaoItem)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors text-gray-900 font-medium"
                    >
                      <option value="Bom">✓ Bom</option>
                      <option value="Regular">⚠ Regular</option>
                      <option value="Ruim">✗ Ruim</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Avalie o estado do item após o uso
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observação
                    </label>
                    <textarea
                      value={observacaoDevolucao}
                      onChange={(e) => setObservacaoDevolucao(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors resize-none"
                      placeholder="Descreva algum detalhe ou problema (opcional)"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Ex: Desgaste natural, rasgado, manchado, etc.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 sm:px-6 py-4 sm:rounded-b-xl border-t-2 border-gray-100">
                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setItemDevolucao(null);
                        setCondicaoDevolucao('Bom');
                        setObservacaoDevolucao('');
                      }}
                      className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarDevolucao}
                      className="flex-1 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Confirmar Devolução
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
