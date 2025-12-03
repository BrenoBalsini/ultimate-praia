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
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Solicitacao, ItemSolicitado } from '../types/cautelas';

const COLLECTION_NAME = 'solicitacoes';

// Criar nova solicitação (com tamanho e condição)
export const criarSolicitacao = async (
  gvcId: string,
  gvcNome: string,
  itens: Omit<ItemSolicitado, 'id' | 'entregue'>[]
): Promise<Solicitacao> => {
  try {
    const itensSolicitados: ItemSolicitado[] = itens.map((item) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      item: item.item,
      tamanho: item.tamanho,
      condicao: item.condicao,
      entregue: false,
    }));

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      gvcId,
      gvcNome,
      itens: itensSolicitados,
      status: 'pendente',
      criadaEm: Timestamp.now(),
      atualizadaEm: Timestamp.now(),
    });

    return {
      id: docRef.id,
      gvcId,
      gvcNome,
      itens: itensSolicitados,
      status: 'pendente',
      criadaEm: Timestamp.now(),
      atualizadaEm: Timestamp.now(),
    };
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    throw error;
  }
};

// Obter todas as solicitações pendentes
export const obterSolicitacoesPendentes = async (): Promise<Solicitacao[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', ['pendente', 'parcial']),
      orderBy('criadaEm', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Solicitacao));
  } catch (error) {
    console.error('Erro ao obter solicitações:', error);
    throw error;
  }
};

// Obter itens de uma solicitação que foram marcados como entregues
export const obterItensParaEntrega = async (
  solicitacaoId: string,
  itensEntreguesIds: string[]
): Promise<ItemSolicitado[]> => {
  try {
    const solicitacaoRef = doc(db, COLLECTION_NAME, solicitacaoId);
    const solicitacaoDoc = await getDoc(solicitacaoRef);

    if (!solicitacaoDoc.exists()) {
      throw new Error('Solicitação não encontrada');
    }

    const solicitacaoData = solicitacaoDoc.data() as Solicitacao;
    
    // Retornar apenas os itens que foram marcados para entrega
    return solicitacaoData.itens.filter((item) => 
      itensEntreguesIds.includes(item.id!)
    );
  } catch (error) {
    console.error('Erro ao obter itens:', error);
    throw error;
  }
};

// Marcar itens como entregues e atualizar status
export const marcarItensEntregues = async (
  solicitacaoId: string,
  itensEntreguesIds: string[]
): Promise<void> => {
  try {
    const solicitacaoRef = doc(db, COLLECTION_NAME, solicitacaoId);
    const solicitacaoDoc = await getDoc(solicitacaoRef);

    if (!solicitacaoDoc.exists()) {
      throw new Error('Solicitação não encontrada');
    }

    const solicitacaoData = solicitacaoDoc.data() as Solicitacao;
    const itensAtualizados = solicitacaoData.itens.map((item) => ({
      ...item,
      entregue: itensEntreguesIds.includes(item.id!) ? true : item.entregue,
    }));

    // Verificar se todos foram entregues
    const todosEntregues = itensAtualizados.every((item) => item.entregue);
    const algumEntregue = itensAtualizados.some((item) => item.entregue);

    const novoStatus = todosEntregues ? 'concluida' : algumEntregue ? 'parcial' : 'pendente';

    await updateDoc(solicitacaoRef, {
      itens: itensAtualizados,
      status: novoStatus,
      atualizadaEm: Timestamp.now(),
    });

    // Se todos foram entregues, deletar a solicitação
    if (todosEntregues) {
      await deleteDoc(solicitacaoRef);
    }
  } catch (error) {
    console.error('Erro ao marcar itens como entregues:', error);
    throw error;
  }
};

// Deletar solicitação
export const deletarSolicitacao = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Erro ao deletar solicitação:', error);
    throw error;
  }
};
