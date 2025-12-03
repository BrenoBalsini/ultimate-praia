import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Cautela, ItemCautelado, HistoricoItem } from '../types/cautelas';

const COLLECTION_NAME = 'cautelas';

// FUNÇÃO AUXILIAR: Criar Timestamp correto (sem problema de timezone)
const criarTimestampLocal = (dataString?: string): Timestamp => {
  if (dataString) {
    // Se foi passada uma data específica (formato YYYY-MM-DD)
    const [ano, mes, dia] = dataString.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia, 12, 0, 0); // Meio-dia para evitar problemas de timezone
    return Timestamp.fromDate(data);
  }
  // Se não, usar data/hora atual
  return Timestamp.now();
};

// Criar cautela para um GVC
export const criarCautela = async (
  gvcId: string,
  gvcNome: string
): Promise<Cautela> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      gvcId,
      gvcNome,
      itensAtivos: [],
      historico: [],
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    });

    return {
      id: docRef.id,
      gvcId,
      gvcNome,
      itensAtivos: [],
      historico: [],
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };
  } catch (error) {
    console.error('Erro ao criar cautela:', error);
    throw error;
  }
};

// Obter cautela de um GVC específico
export const obterCautelaPorGVC = async (gvcId: string): Promise<Cautela | null> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('gvcId', '==', gvcId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Cautela;
  } catch (error) {
    console.error('Erro ao obter cautela:', error);
    throw error;
  }
};

// Obter todas as cautelas ativas (com itens)
export const obterCautelasAtivas = async (): Promise<Cautela[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const cautelas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Cautela));

    return cautelas.filter((c) => c.itensAtivos && c.itensAtivos.length > 0);
  } catch (error) {
    console.error('Erro ao obter cautelas ativas:', error);
    throw error;
  }
};

// ATUALIZADO: Adicionar item com data correta
export const adicionarItemCautela = async (
  cautelaId: string,
  item: ItemCautelado
): Promise<void> => {
  try {
    const cautelaRef = doc(db, COLLECTION_NAME, cautelaId);
    const cautelaDoc = await getDoc(cautelaRef);

    if (!cautelaDoc.exists()) {
      throw new Error('Cautela não encontrada');
    }

    const cautelaData = cautelaDoc.data() as Cautela;
    const itensAtivos = cautelaData.itensAtivos || [];

    // Adicionar ID único ao item
    const novoItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await updateDoc(cautelaRef, {
      itensAtivos: [...itensAtivos, novoItem],
      atualizadoEm: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    throw error;
  }
};

// NOVO: Adicionar múltiplos itens de uma vez (para entregas de solicitações)
export const adicionarMultiplosItens = async (
  cautelaId: string,
  itens: ItemCautelado[]
): Promise<void> => {
  try {
    const cautelaRef = doc(db, COLLECTION_NAME, cautelaId);
    const cautelaDoc = await getDoc(cautelaRef);

    if (!cautelaDoc.exists()) {
      throw new Error('Cautela não encontrada');
    }

    const cautelaData = cautelaDoc.data() as Cautela;
    const itensAtivos = cautelaData.itensAtivos || [];

    // Adicionar IDs únicos aos itens
    const novosItens = itens.map((item) => ({
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    await updateDoc(cautelaRef, {
      itensAtivos: [...itensAtivos, ...novosItens],
      atualizadoEm: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao adicionar múltiplos itens:', error);
    throw error;
  }
};

// Devolver item (move para histórico)
export const devolverItem = async (
  cautelaId: string,
  itemId: string,
  condicaoFinal: 'Bom' | 'Regular' | 'Ruim',
  observacao?: string
): Promise<void> => {
  try {
    const cautelaRef = doc(db, COLLECTION_NAME, cautelaId);
    const cautelaDoc = await getDoc(cautelaRef);

    if (!cautelaDoc.exists()) {
      throw new Error('Cautela não encontrada');
    }

    const cautelaData = cautelaDoc.data() as Cautela;
    const item = cautelaData.itensAtivos.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Item não encontrado');
    }

    // Criar registro de histórico
    const historicoItem: HistoricoItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      item: item.item,
      tamanho: item.tamanho,
      condicaoInicial: item.condicao,
      condicaoFinal,
      dataEmprestimo: item.dataEmprestimo,
      dataDevolucao: Timestamp.now(),
      tipo: 'Devolução',
      observacao: observacao || item.observacao,
    };

    // Remover dos itens ativos e adicionar ao histórico
    const itensAtivos = cautelaData.itensAtivos.filter((i) => i.id !== itemId);
    const historico = [...(cautelaData.historico || []), historicoItem];

    await updateDoc(cautelaRef, {
      itensAtivos,
      historico,
      atualizadoEm: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao devolver item:', error);
    throw error;
  }
};

// Substituir item (devolve o antigo e adiciona novo)
export const substituirItem = async (
  cautelaId: string,
  itemAntigoId: string,
  novoItem: ItemCautelado,
  condicaoFinalAntigo: 'Bom' | 'Regular' | 'Ruim',
  observacao?: string
): Promise<void> => {
  try {
    await devolverItem(cautelaId, itemAntigoId, condicaoFinalAntigo, observacao);
    await adicionarItemCautela(cautelaId, novoItem);
  } catch (error) {
    console.error('Erro ao substituir item:', error);
    throw error;
  }
};

// EXPORTAR função auxiliar para uso em outros lugares
export { criarTimestampLocal };
