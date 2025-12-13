import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CategoriaMaterialB } from '../types/postos';

const COLLECTION_NAME = 'materiaisTipoB';

export interface MaterialTipoBDoc {
  nome: string;
  categoria: CategoriaMaterialB;
  ativo: boolean; // ✅ Nova propriedade
  createdAt: string;
}

// Lista todos os materiais tipo B cadastrados globalmente
export const listarMateriaisTipoB = async (
  apenasAtivos: boolean = true // ✅ Novo parâmetro
): Promise<(MaterialTipoBDoc & { id: string })[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  const materiais = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as MaterialTipoBDoc),
  }));

  // ✅ Garantir que materiais antigos tenham ativo = true
  const materiaisComAtivo = materiais.map(m => ({
    ...m,
    ativo: m.ativo !== undefined ? m.ativo : true
  }));

  return apenasAtivos
    ? materiaisComAtivo.filter(m => m.ativo)
    : materiaisComAtivo;
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
    ativo: true, // ✅ Sempre ativo ao criar
    createdAt: now,
  } satisfies MaterialTipoBDoc);

  return docRef.id;
};

// ✅ Nova função: Atualizar material
export const atualizarMaterialTipoB = async (
  id: string,
  dados: Partial<Pick<MaterialTipoBDoc, 'nome' | 'categoria' | 'ativo'>>
) => {
  const ref = doc(db, COLLECTION_NAME, id);
  await updateDoc(ref, dados);
};

// Remove um material tipo B da lista global
export const removerMaterialTipoB = async (id: string) => {
  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
};
