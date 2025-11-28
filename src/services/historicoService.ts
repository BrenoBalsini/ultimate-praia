import { collection, addDoc, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
  NumeroPosto,
  TipoMaterialA,
  TipoEvento,
  CategoriaMaterialB,
  FiltroHistoricoMaterial,
  FiltroHistoricoPosto,
} from '../types/postos';

const COLLECTION_NAME = 'historico';

export interface HistoricoDoc {
  id?: string;
  tipo: TipoEvento;
  postoNumero: NumeroPosto;
  createdAt: string;
  observacao?: string;

  // Material A
  materialAId?: string;
  materialATipo?: TipoMaterialA;
  materialANumero?: number;

  // Faltas Material B
  faltaMaterialId?: string;
  materialTipoBNome?: string;
  materialTipoBCategoria?: CategoriaMaterialB;

  // Alterações de Posto
  alteracaoPostoId?: string;
}

// Função auxiliar para limpar undefined dos dados
export const limparUndefined = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

export const registrarEventoMaterialA = async (params: {
  tipoEvento: TipoEvento;
  postoNumero: NumeroPosto;
  materialAId: string;
  materialATipo: TipoMaterialA;
  materialANumero: number;
  observacao?: string;
}) => {
  const { tipoEvento, postoNumero, materialAId, materialATipo, materialANumero, observacao } =
    params;

  const now = new Date().toISOString();

  const docData: HistoricoDoc = {
    tipo: tipoEvento,
    postoNumero,
    materialAId,
    materialATipo,
    materialANumero,
    observacao: observacao || undefined, // pode ser undefined aqui
    createdAt: now,
  };

  await addDoc(collection(db, COLLECTION_NAME), limparUndefined(docData));
};

export const registrarEventoFaltaMaterial = async (params: {
  tipoEvento: TipoEvento;
  postoNumero: NumeroPosto;
  faltaMaterialId: string;
  materialTipoBNome: string;
  materialTipoBCategoria: CategoriaMaterialB;
  observacao?: string;
}) => {
  const {
    tipoEvento,
    postoNumero,
    faltaMaterialId,
    materialTipoBNome,
    materialTipoBCategoria,
    observacao,
  } = params;

  const now = new Date().toISOString();

  const docData = {
    tipo: tipoEvento,
    postoNumero,
    faltaMaterialId,
    materialTipoBNome,
    materialTipoBCategoria,
    observacao: observacao || undefined,
    createdAt: now,
  };

  await addDoc(collection(db, COLLECTION_NAME), limparUndefined(docData));
};

export const registrarEventoAlteracaoPosto = async (params: {
  tipoEvento: TipoEvento;
  postoNumero: NumeroPosto;
  alteracaoPostoId: string;
  observacao?: string;
}) => {
  const { tipoEvento, postoNumero, alteracaoPostoId, observacao } = params;
  const now = new Date().toISOString();

  const docData = {
    tipo: tipoEvento,
    postoNumero,
    alteracaoPostoId,
    observacao: observacao || undefined,
    createdAt: now,
  };

  await addDoc(collection(db, COLLECTION_NAME), limparUndefined(docData));
};

export const buscarHistorico = async (
  filtroMaterial: FiltroHistoricoMaterial = null,
  filtroPosto: FiltroHistoricoPosto = null,
  limite: number = 50,
): Promise<HistoricoDoc[]> => {
  let q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(limite)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }) as HistoricoDoc);
};
