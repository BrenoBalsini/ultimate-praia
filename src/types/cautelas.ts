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

// Lista de itens disponíveis para cautela
export const ITENS_CAUTELA = [
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

export type ItemCautelaType = typeof ITENS_CAUTELA[number];
