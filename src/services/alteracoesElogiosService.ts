import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Alteracao, Elogio, Conceito } from '../types/alteracoes';


// ===== ALTERAÇÕES =====
const ALTERACOES_COLLECTION = 'alteracoes';


export const criarAlteracao = async (
  data: Omit<Alteracao, 'id' | 'criadoEm' | 'criadoPor' | 'diasRestantes' | 'inseridoNaTabela'>,
  usuarioEmail?: string
): Promise<Alteracao> => {
  try {
    // Cria o objeto base sem campos undefined
    const alteracaoData: any = {
      tipo: data.tipo,
      gvcId: data.gvcId,
      gvcNome: data.gvcNome,
      descricao: data.descricao,
      diasRestantes: 365,
      inseridoNaTabela: false,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail || 'Sistema',
    };

    // Adiciona diasSuspensao apenas se existir
    if (data.tipo === 'Suspensão' && data.diasSuspensao !== undefined) {
      alteracaoData.diasSuspensao = data.diasSuspensao;
    }

    const docRef = await addDoc(collection(db, ALTERACOES_COLLECTION), alteracaoData);

    return {
      id: docRef.id,
      ...data,
      diasRestantes: 365,
      inseridoNaTabela: false,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail,
    };
  } catch (error) {
    console.error('Erro ao criar alteração:', error);
    throw error;
  }
};


export const obterAlteracoesAtivas = async (): Promise<Alteracao[]> => {
  try {
    const q = query(
      collection(db, ALTERACOES_COLLECTION),
      where('inseridoNaTabela', '==', false),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Alteracao));
  } catch (error) {
    console.error('Erro ao obter alterações ativas:', error);
    throw error;
  }
};


export const obterHistoricoAlteracoes = async (): Promise<Alteracao[]> => {
  try {
    const q = query(
      collection(db, ALTERACOES_COLLECTION),
      where('inseridoNaTabela', '==', true),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Alteracao));
  } catch (error) {
    console.error('Erro ao obter histórico de alterações:', error);
    throw error;
  }
};


export const marcarAlteracaoComoInserida = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, ALTERACOES_COLLECTION, id), {
      inseridoNaTabela: true,
    });
  } catch (error) {
    console.error('Erro ao marcar alteração como inserida:', error);
    throw error;
  }
};


export const deletarAlteracao = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ALTERACOES_COLLECTION, id));
  } catch (error) {
    console.error('Erro ao deletar alteração:', error);
    throw error;
  }
};


// ===== ELOGIOS =====
const ELOGIOS_COLLECTION = 'elogios';


export const criarElogio = async (
  data: Omit<Elogio, 'id' | 'criadoEm' | 'criadoPor' | 'inseridoNaTabela'>,
  usuarioEmail?: string
): Promise<Elogio> => {
  try {
    const docRef = await addDoc(collection(db, ELOGIOS_COLLECTION), {
      ...data,
      inseridoNaTabela: false,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail || 'Sistema',
    });

    return {
      id: docRef.id,
      ...data,
      inseridoNaTabela: false,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail,
    };
  } catch (error) {
    console.error('Erro ao criar elogio:', error);
    throw error;
  }
};


export const obterElogiosAtivos = async (): Promise<Elogio[]> => {
  try {
    const q = query(
      collection(db, ELOGIOS_COLLECTION),
      where('inseridoNaTabela', '==', false),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Elogio));
  } catch (error) {
    console.error('Erro ao obter elogios ativos:', error);
    throw error;
  }
};


export const obterHistoricoElogios = async (): Promise<Elogio[]> => {
  try {
    const q = query(
      collection(db, ELOGIOS_COLLECTION),
      where('inseridoNaTabela', '==', true),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Elogio));
  } catch (error) {
    console.error('Erro ao obter histórico de elogios:', error);
    throw error;
  }
};


export const marcarElogioComoInserido = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, ELOGIOS_COLLECTION, id), {
      inseridoNaTabela: true,
    });
  } catch (error) {
    console.error('Erro ao marcar elogio como inserido:', error);
    throw error;
  }
};


export const deletarElogio = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ELOGIOS_COLLECTION, id));
  } catch (error) {
    console.error('Erro ao deletar elogio:', error);
    throw error;
  }
};


// ===== CONCEITOS =====
const CONCEITOS_COLLECTION = 'conceitos';


export const criarConceito = async (
  data: Omit<Conceito, 'id' | 'criadoEm' | 'criadoPor' | 'inseridoNaTabela'>,
  usuarioEmail?: string
): Promise<Conceito> => {
  try {
    const docRef = await addDoc(collection(db, CONCEITOS_COLLECTION), {
      ...data,
      inseridoNaTabela: false,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail || 'Sistema',
    });

    return {
      id: docRef.id,
      ...data,
      inseridoNaTabela: false,
      criadoEm: Timestamp.now(),
      criadoPor: usuarioEmail,
    };
  } catch (error) {
    console.error('Erro ao criar conceito:', error);
    throw error;
  }
};


export const obterConceitosAtivos = async (): Promise<Conceito[]> => {
  try {
    const q = query(
      collection(db, CONCEITOS_COLLECTION),
      where('inseridoNaTabela', '==', false),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Conceito));
  } catch (error) {
    console.error('Erro ao obter conceitos ativos:', error);
    throw error;
  }
};


export const obterHistoricoConceitos = async (): Promise<Conceito[]> => {
  try {
    const q = query(
      collection(db, CONCEITOS_COLLECTION),
      where('inseridoNaTabela', '==', true),
      orderBy('criadoEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Conceito));
  } catch (error) {
    console.error('Erro ao obter histórico de conceitos:', error);
    throw error;
  }
};


export const marcarConceitoComoInserido = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, CONCEITOS_COLLECTION, id), {
      inseridoNaTabela: true,
    });
  } catch (error) {
    console.error('Erro ao marcar conceito como inserido:', error);
    throw error;
  }
};


export const deletarConceito = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CONCEITOS_COLLECTION, id));
  } catch (error) {
    console.error('Erro ao deletar conceito:', error);
    throw error;
  }
};
