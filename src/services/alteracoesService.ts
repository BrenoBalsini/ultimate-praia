import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { NumeroPosto } from "../types/postos";

const COLLECTION_NAME = "alteracoesPosto";

export interface AlteracaoPostoDoc {
  postoNumero: NumeroPosto;
  descricao: string;
  resolvido: boolean;
  observacaoResolucao?: string;
  createdAt: string;
  resolvidoAt?: string;
  emAndamento?: boolean;
  ultimoAndamento?: string;
  ultimoAndamentoData?: string;
}

// Lista alterações em aberto de um posto
export const listarAlteracoesAbertasPorPosto = async (
  postoNumero: NumeroPosto
): Promise<(AlteracaoPostoDoc & { id: string })[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("postoNumero", "==", postoNumero),
    where("resolvido", "==", false)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as AlteracaoPostoDoc),
  }));
};

// Registra nova alteração
export const registrarAlteracaoPosto = async (params: {
  postoNumero: NumeroPosto;
  descricao: string;
}) => {
  const { postoNumero, descricao } = params;
  const now = new Date().toISOString();

  const ref = await addDoc(collection(db, COLLECTION_NAME), {
    postoNumero,
    descricao,
    resolvido: false,
    createdAt: now,
  } satisfies AlteracaoPostoDoc);

  return ref.id;
};

// Adicionar andamento (dar destino)
export const adicionarAndamento = async (params: {
  alteracaoId: string;
  observacao: string;
}) => {
  const { alteracaoId, observacao } = params;
  
  const alteracaoRef = doc(db, COLLECTION_NAME, alteracaoId);
  const alteracaoSnap = await getDoc(alteracaoRef);
  
  if (!alteracaoSnap.exists()) {
    throw new Error('Alteração não encontrada');
  }

  const now = new Date().toISOString();

  await updateDoc(alteracaoRef, {
    emAndamento: true,
    ultimoAndamento: observacao,
    ultimoAndamentoData: now,
    updatedAt: now,
  });
};

// Marca alteração como resolvida
export const resolverAlteracaoPosto = async (params: {
  id: string;
  observacao?: string;
}) => {
  const { id, observacao } = params;
  const now = new Date().toISOString();

  const alteracaoRef = doc(db, COLLECTION_NAME, id);

  const updateData: any = {
    resolvido: true,
    resolvidoEm: now,
    updatedAt: now,
  };

  if (observacao && observacao.trim().length > 0) {
    updateData.observacaoResolucao = observacao;
  }

  await updateDoc(alteracaoRef, updateData);
};

// Buscar alterações de um posto específico
export const getAlteracoesPostoByNumero = async (
  postoNumero: NumeroPosto
): Promise<(AlteracaoPostoDoc & { id: string })[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('postoNumero', '==', postoNumero),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (AlteracaoPostoDoc & { id: string })[];
};

// Adicionar nova alteração
export const addAlteracaoPosto = async (params: {
  postoNumero: NumeroPosto;
  descricao: string;
}): Promise<string> => {
  const { postoNumero, descricao } = params;
  const now = new Date().toISOString();

  const docData = {
    postoNumero,
    descricao,
    resolvido: false,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
  return docRef.id;
};

