// Enums e constantes
export const POSTOS_FIXOS = [1, 2, 3, 5, 6, 8, 10, 13, 16, 19] as const;
export type NumeroPosto = (typeof POSTOS_FIXOS)[number];

// Status Material A
export const StatusMaterialA = {
  AUSENTE: "ausente",
  OK: "ok",
  AVARIA: "avaria",
  QUEBRADO: "quebrado",
} as const;
export type StatusMaterialA =
  (typeof StatusMaterialA)[keyof typeof StatusMaterialA];

// Tipo Material A
export const TipoMaterialA = {
  BINOCULO: "binoculo",
  GUARDASSOL: "guardassol",
  RADIO: "radio",
} as const;
export type TipoMaterialA = (typeof TipoMaterialA)[keyof typeof TipoMaterialA];

// Categoria Material B
export const CategoriaMaterialB = {
  WHITEMED: "whitemed",
  BOLSA_APH: "bolsa_aph",
  OUTROS: "outros",
} as const;
export type CategoriaMaterialB =
  (typeof CategoriaMaterialB)[keyof typeof CategoriaMaterialB];

// Tipo de Evento
export const TipoEvento = {
  MATERIAL_A_ADICIONADO: "material_a_adicionado",
  MATERIAL_A_AVARIA: "material_a_avaria",
  MATERIAL_A_QUEBRADO: "material_a_quebrado",
  MATERIAL_A_RESOLVIDO: "material_a_resolvido",
  MATERIAL_A_DEVOLVIDO: "material_a_devolvido",
  MATERIAL_A_DELETADO: "material_a_deletado",
  ALTERACAO_POSTO_ANDAMENTO: "alteracao_posto_andamento",
  FALTA_REGISTRADA: "falta_registrada",
  FALTA_RESOLVIDA: "falta_resolvida",
  ALTERACAO_ADICIONADA: "alteracao_adicionada",
  ALTERACAO_RESOLVIDA: "alteracao_resolvida",
  OUTROS_ENTREGA_REGISTRADA: "outros_entrega_registrada",
} as const;
export type TipoEvento = (typeof TipoEvento)[keyof typeof TipoEvento];

// Interfaces principais
export interface Posto {
  id: string;
  numero: NumeroPosto;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialTipoB {
  id: string;
  nome: string;
  categoria: CategoriaMaterialB;
  createdAt: Date;
}

export interface MaterialA {
  id: string;
  tipo: TipoMaterialA;
  numero: number; // Numeração sequencial por posto
  postoId: string;
  postoNumero: NumeroPosto;
  status: StatusMaterialA;
  observacao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FaltaMaterial {
  id: string;
  materialTipoBId: string;
  materialNome: string;
  categoria: CategoriaMaterialB;
  postoId: string;
  postoNumero: NumeroPosto;
  resolvido: boolean;
  observacaoRegistro?: string;
  observacaoResolucao?: string;
  createdAt: Date;
  resolvidoAt?: Date;
}

export interface AlteracaoPosto {
  id: string;
  postoId: string;
  postoNumero: NumeroPosto;
  descricao: string;
  resolvido: boolean;
  observacaoResolucao?: string;
  createdAt: Date;
  resolvidoAt?: Date;
}

export interface EventoHistorico {
  id: string;
  tipo: TipoEvento;
  postoId: string;
  postoNumero: NumeroPosto;

  // Para materiais tipo A
  materialAId?: string;
  materialATipo?: TipoMaterialA;
  materialANumero?: number;

  // Para materiais tipo B (faltas)
  faltaMaterialId?: string;
  materialTipoBNome?: string;
  materialTipoBCategoria?: CategoriaMaterialB;

  // Para alterações
  alteracaoPostoId?: string;

  outrosEntregaId?: string;
  outrosItemNome?: string;
  outrosQuantidade?: number;

  observacao?: string;
  createdAt: Date;
}

// Tipos auxiliares para componentes
export interface StatusPosto {
  binoculo: StatusMaterialA;
  guardassol: StatusMaterialA;
  radio: StatusMaterialA;
  whitemed: "ok" | "falta";
  bolsaAph: "ok" | "falta";
  outros: "ok" | "falta";
  alteracoes: boolean; // true se tem alterações pendentes
}

export interface ContadorPendencias {
  binoculo: number;
  guardassol: number;
  radio: number;
  whitemed: number;
  bolsaAph: number;
  outros: number;
  alteracoes: number;
}

export type FiltroHistoricoMaterial =
  | TipoMaterialA
  | string // nome de material tipo B
  | null; // sem filtro específico

export type FiltroHistoricoPosto = NumeroPosto | null;
