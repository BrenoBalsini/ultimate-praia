import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface GVC {
  re: ReactNode;
  postoFixo: string;
  id?: string;
  nome: string;
  posicao: number; // MUDADO: agora é posição (1, 2, 3, ...)
  status: 'ativo' | 'inativo';
  criadoEm?: Timestamp;
  atualizadoEm?: Timestamp;
}

// Obter o próximo rank disponível
export const obterProximaPosicao = async (): Promise<number> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'gvcs'));
    if (querySnapshot.empty) return 1;
    
    const posicoes = querySnapshot.docs.map((doc) => doc.data().posicao as number);
    return Math.max(...posicoes) + 1;
  } catch (error) {
    console.error('Erro ao obter próxima posição:', error);
    return 1;
  }
};

// Verificar se posição já existe
export const posicaoJaExiste = async (posicao: number): Promise<boolean> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'gvcs'));
    return querySnapshot.docs.some((doc) => doc.data().posicao === posicao);
  } catch (error) {
    console.error('Erro ao verificar posição:', error);
    return false;
  }
};

// Adicionar novo GVC
export const criarGVC = async (gvc: Omit<GVC, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'gvcs'), {
      ...gvc,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    });
    return { id: docRef.id, ...gvc };
  } catch (error) {
    console.error('Erro ao criar GVC:', error);
    throw error;
  }
};

// Obter todos os GVCs
export const obterGVCs = async (): Promise<GVC[]> => {
  try {
    const q = query(collection(db, 'gvcs'), orderBy('posicao', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as GVC));
  } catch (error) {
    console.error('Erro ao obter GVCs:', error);
    throw error;
  }
};

// Atualizar GVC
export const atualizarGVC = async (id: string, updates: Partial<GVC>) => {
  try {
    const docRef = doc(db, 'gvcs', id);
    await updateDoc(docRef, {
      ...updates,
      atualizadoEm: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao atualizar GVC:', error);
    throw error;
  }
};

// Deletar GVC
export const deletarGVC = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'gvcs', id));
  } catch (error) {
    console.error('Erro ao deletar GVC:', error);
    throw error;
  }
};

// Toggle ativo/inativo
export const toggleStatusGVC = async (id: string, statusAtual: string) => {
  const novoStatus = statusAtual === 'ativo' ? 'inativo' : 'ativo';
  await atualizarGVC(id, { status: novoStatus });
  return novoStatus;
};
