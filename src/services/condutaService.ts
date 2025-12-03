import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CondutaElogio } from '../types/conduta';

const COLLECTION_NAME = 'condutasElogios';

// Criar nova conduta ou elogio
export const criarCondutaElogio = async (
  data: Omit<CondutaElogio, 'id' | 'criadoEm'>,
  usuarioEmail?: string
): Promise<CondutaElogio> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail || 'Sistema',
    });
    
    return {
      id: docRef.id,
      ...data,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail || 'Sistema',
    };
  } catch (error) {
    console.error('Erro ao criar conduta/elogio:', error);
    throw error;
  }
};

// Obter todas as condutas e elogios
export const obterCondutasElogios = async (): Promise<CondutaElogio[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CondutaElogio));
  } catch (error) {
    console.error('Erro ao obter condutas/elogios:', error);
    throw error;
  }
};

// Obter condutas/elogios por tipo
export const obterPorTipo = async (
  tipo: 'conduta' | 'elogio'
): Promise<CondutaElogio[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('tipo', '==', tipo),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CondutaElogio));
  } catch (error) {
    console.error(`Erro ao obter ${tipo}s:`, error);
    throw error;
  }
};

// Obter condutas/elogios de um GVC específico
export const obterPorGVC = async (gvcId: string): Promise<CondutaElogio[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('gvcIds', 'array-contains', gvcId),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CondutaElogio));
  } catch (error) {
    console.error('Erro ao obter condutas/elogios do GVC:', error);
    throw error;
  }
};

// Deletar conduta ou elogio
export const deletarCondutaElogio = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Erro ao deletar conduta/elogio:', error);
    throw error;
  }
};
