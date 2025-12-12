import { Timestamp } from 'firebase/firestore';

export type CondicaoItem = 'Bom' | 'Regular' | 'Ruim';
export type TamanhoItem = 'P' | 'M' | 'G' | 'GG' | 'XG' | 'XXG' | '-';
export type TipoMovimento = 'Empréstimo' | 'Devolução' | 'Substituição';

export interface ItemCautelado {
  id?: string;
  item: string;
  tamanho: TamanhoItem;
  condicao: CondicaoItem;
  dataEmprestimo: Timestamp;
  observacao?: string;
}

export interface HistoricoItem {
  id?: string;
  item: string;
  tamanho: TamanhoItem;
  condicaoInicial: CondicaoItem;
  condicaoFinal: CondicaoItem;
  dataEmprestimo: Timestamp;
  dataDevolucao: Timestamp;
  tipo: TipoMovimento;
  observacao?: string;
}

export interface Cautela {
  id?: string;
  gvcId: string;
  gvcNome: string;
  itensAtivos: ItemCautelado[];
  historico: HistoricoItem[];
  criadoEm?: Timestamp;
  atualizadoEm?: Timestamp;
}

export interface ItemSolicitado {
  id?: string;
  item: string;
  tamanho: TamanhoItem;
  condicao: CondicaoItem;
  entregue: boolean;
}

export interface Solicitacao {
  id?: string;
  gvcId: string;
  gvcNome: string;
  itens: ItemSolicitado[];
  status: 'pendente' | 'parcial' | 'concluida';
  criadaEm?: Timestamp;
  atualizadaEm?: Timestamp;
}

// NOVO: Interface para item cautelável configurável
export interface ItemCautelavel {
  id?: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  criadoEm?: Timestamp;
  atualizadoEm?: Timestamp;
}

// Lista padrão de itens (para inicialização)
export const ITENS_CAUTELA_PADRAO = [
  'lifebelt',
  'apito',
  'nadadeira',
  'corta-vento',
  'agasalho',
  'calça',
  'manga longa',
  'bermuda',
  'regata',
  'chinelo',
  'cobertura',
  'óculos',
  'chapéu',
  'luva',
  'meia',
] as const;

export type ItemCautelaType = typeof ITENS_CAUTELA_PADRAO[number];
