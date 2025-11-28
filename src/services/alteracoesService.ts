import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { NumeroPosto } from '../types/postos';

const COLLECTION_NAME = 'alteracoesPosto';

export interface AlteracaoPostoDoc {
  postoNumero: NumeroPosto;
  descricao: string;
  resolvido: boolean;
  observacaoResolucao?: string;
  createdAt: string;
  resolvidoAt?: string;
}

// Lista alterações em aberto de um posto
export const listarAlteracoesAbertasPorPosto = async (
  postoNumero: NumeroPosto,
): Promise<(AlteracaoPostoDoc & { id: string })[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('postoNumero', '==', postoNumero),
    where('resolvido', '==', false),
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

// Marca alteração como resolvida
export const resolverAlteracaoPosto = async (params: {
  id: string;
  observacaoResolucao?: string;
}) => {
  const { id, observacaoResolucao } = params;
  const ref = doc(db, COLLECTION_NAME, id);
  const now = new Date().toISOString();

  await updateDoc(ref, {
    resolvido: true,
    observacaoResolucao: observacaoResolucao ?? '',
    resolvidoAt: now,
  });
};
