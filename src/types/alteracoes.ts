import { Timestamp } from 'firebase/firestore';

// ===== ALTERAÇÕES =====
export type TipoAlteracao = 'Advertência' | 'Suspensão';

export interface Alteracao {
  id?: string;
  tipo: TipoAlteracao;
  diasSuspensao?: number; // Apenas se tipo === 'Suspensão'
  gvcId: string;
  gvcNome: string;
  descricao: string;
  criadoEm?: Timestamp;
  criadoPor?: string;
  diasRestantes: number; // Contador de 365 dias
  inseridoNaTabela: boolean; // Para controle de histórico
}

// ===== ELOGIOS =====
export interface Elogio {
  id?: string;
  titulo: string; // NOVO
  descricao?: string; // Agora opcional
  gvcIds: string[];
  gvcNomes: string[];
  criadoEm?: Timestamp;
  criadoPor?: string;
  inseridoNaTabela: boolean;
}

// ===== CONCEITOS =====
export type TipoConceito = 
  | 'Assiduidade'
  | 'Flexibilidade'
  | 'Asseio Pessoal'
  | 'Relacionamento com o Cidadão'
  | 'Trabalho Preventivo'
  | 'Zelo com Recursos'
  | 'Proatividade'
  | 'Trabalho em Equipe'
  | 'Relacionamento Interpessoal';

export type PolaridadeConceito = 'Positivo' | 'Negativo';

export interface Conceito {
  id?: string;
  gvcId: string;
  gvcNome: string;
  conceito: TipoConceito;
  polaridade: PolaridadeConceito;
  descricao: string;
  criadoEm?: Timestamp;
  criadoPor?: string;
  inseridoNaTabela: boolean;
}

// Lista de conceitos disponíveis
export const CONCEITOS_DISPONIVEIS: TipoConceito[] = [
  'Assiduidade',
  'Flexibilidade',
  'Asseio Pessoal',
  'Relacionamento com o Cidadão',
  'Trabalho Preventivo',
  'Zelo com Recursos',
  'Proatividade',
  'Trabalho em Equipe',
  'Relacionamento Interpessoal',
];
