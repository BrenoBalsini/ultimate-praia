import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { NumeroPosto, TipoMaterialA, StatusMaterialA } from '../types/postos';
import { limparUndefined } from './historicoService';

const COLLECTION_NAME = 'materiaisA';

export interface MaterialADoc {
  tipo: TipoMaterialA;
  numero: number; // sequencial por posto
  postoNumero: NumeroPosto;
  status: StatusMaterialA;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

// Busca todos materiais tipo A de um posto e de um tipo específico (binoculo / guardassol / radio)
export const getMateriaisAByPostoAndTipo = async (
  postoNumero: NumeroPosto,
  tipo: TipoMaterialA,
): Promise<(MaterialADoc & { id: string })[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('postoNumero', '==', postoNumero),
    where('tipo', '==', tipo),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as MaterialADoc),
  }));
};

// Adiciona um novo material tipo A (ex: Binóculo 1 do Posto 2)
// Adiciona um novo material tipo A (identificado pela data de criação)
export const addMaterialA = async (params: {
  postoNumero: NumeroPosto;
  tipo: TipoMaterialA;
  observacao?: string;
}): Promise<string> => {
  const { postoNumero, tipo, observacao } = params;
  const now = new Date().toISOString();
  
  // ✅ MUDANÇA: Usa timestamp como "numero" para identificação única
  // Isso garante que nunca haverá duplicatas
  const numeroUnico = Date.now(); // timestamp em milissegundos

  const docData: MaterialADoc = {
    tipo,
    numero: numeroUnico, // ← MUDOU: agora é timestamp
    postoNumero,
    status: 'ok' as StatusMaterialA,
    observacao: observacao || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), limparUndefined(docData));
  return docRef.id;
};

// Atualiza status e observação de um material A (avaria, quebrado, resolvido, etc)
export const updateMaterialAStatus = async (params: {
  id: string;
  status: StatusMaterialA;
  observacao?: string;
}) => {
  const { id, status, observacao } = params;
  const ref = doc(db, COLLECTION_NAME, id);
  const now = new Date().toISOString();

  const updateData = {
    status,
    observacao: observacao || undefined, // pode ser undefined
    updatedAt: now,
  };

  await updateDoc(ref, limparUndefined(updateData));
};

// Marca material como "devolvido" (removido do posto) - vamos apenas mudar status para "ausente" ou se preferir deletar no futuro
export const devolverMaterialA = async (params: {
  id: string;
  observacao?: string;
}) => {
  const { id, observacao } = params;
  const ref = doc(db, COLLECTION_NAME, id);
  const now = new Date().toISOString();

  const updateData = {
    status: 'ausente' as StatusMaterialA,
    observacao: observacao || undefined, // pode ser undefined
    updatedAt: now,
  };

  await updateDoc(ref, limparUndefined(updateData));
};

export const deletarMaterialA = async (id: string) => {
  const materialRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(materialRef);
};