import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CategoriaMaterialB } from '../types/postos';

const COLLECTION_NAME = 'materiaisTipoB';

export interface MaterialTipoBDoc {
  nome: string;
  categoria: CategoriaMaterialB; // 'whitemed' | 'bolsa_aph' | 'outros'
  createdAt: string;
}

// Lista todos os materiais tipo B cadastrados globalmente
export const listarMateriaisTipoB = async (): Promise<
  (MaterialTipoBDoc & { id: string })[]
> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as MaterialTipoBDoc),
  }));
};

// Adiciona um novo material tipo B
export const adicionarMaterialTipoB = async (params: {
  nome: string;
  categoria: CategoriaMaterialB;
}) => {
  const { nome, categoria } = params;
  const now = new Date().toISOString();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    nome,
    categoria,
    createdAt: now,
  } satisfies MaterialTipoBDoc);

  return docRef.id;
};

// Remove um material tipo B da lista global
export const removerMaterialTipoB = async (id: string) => {
  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
};
