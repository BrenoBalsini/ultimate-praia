import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ItemCautelavel } from '../types/cautelas';
import { ITENS_CAUTELA_PADRAO } from '../types/cautelas';

const COLLECTION_NAME = 'itensCautelaveis';

// Obter todos os itens cauteláveis (apenas ativos ou todos)
export const obterItensCautelaveis = async (apenasAtivos = true): Promise<ItemCautelavel[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('ordem', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const itens = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ItemCautelavel));

    if (apenasAtivos) {
      return itens.filter(item => item.ativo);
    }
    
    return itens;
  } catch (error) {
    console.error('Erro ao obter itens cauteláveis:', error);
    throw error;
  }
};

// Criar novo item cautelável
export const criarItemCautelavel = async (nome: string): Promise<ItemCautelavel> => {
  try {
    // Obter a ordem máxima atual
    const itensExistentes = await obterItensCautelaveis(false);
    const ordemMaxima = itensExistentes.length > 0 
      ? Math.max(...itensExistentes.map(i => i.ordem)) 
      : 0;

    const novoItem = {
      nome: nome.trim().toLowerCase(),
      ativo: true,
      ordem: ordemMaxima + 1,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), novoItem);

    return {
      id: docRef.id,
      ...novoItem,
    };
  } catch (error) {
    console.error('Erro ao criar item cautelável:', error);
    throw error;
  }
};

// Atualizar item cautelável
export const atualizarItemCautelavel = async (
  id: string,
  dados: Partial<Pick<ItemCautelavel, 'nome' | 'ativo'>>
): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, id);
    
    const dadosAtualizacao: any = {
      atualizadoEm: Timestamp.now(),
    };

    if (dados.nome !== undefined) {
      dadosAtualizacao.nome = dados.nome.trim().toLowerCase();
    }

    if (dados.ativo !== undefined) {
      dadosAtualizacao.ativo = dados.ativo;
    }

    await updateDoc(itemRef, dadosAtualizacao);
  } catch (error) {
    console.error('Erro ao atualizar item cautelável:', error);
    throw error;
  }
};

// Excluir item cautelável
export const excluirItemCautelavel = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Erro ao excluir item cautelável:', error);
    throw error;
  }
};

// Reordenar itens
export const reordenarItens = async (itens: ItemCautelavel[]): Promise<void> => {
  try {
    const promises = itens.map((item, index) => {
      if (!item.id) return Promise.resolve();
      
      const itemRef = doc(db, COLLECTION_NAME, item.id);
      return updateDoc(itemRef, {
        ordem: index + 1,
        atualizadoEm: Timestamp.now(),
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao reordenar itens:', error);
    throw error;
  }
};

// Inicializar com itens padrão (caso não existam itens)
export const inicializarItensPadrao = async (): Promise<void> => {
  try {
    const itensExistentes = await obterItensCautelaveis(false);
    
    if (itensExistentes.length > 0) {
      return; // Já existem itens, não precisa inicializar
    }

    const promises = ITENS_CAUTELA_PADRAO.map((nome, index) => 
      addDoc(collection(db, COLLECTION_NAME), {
        nome,
        ativo: true,
        ordem: index + 1,
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      })
    );

    await Promise.all(promises);
    console.log('Itens padrão inicializados com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar itens padrão:', error);
    throw error;
  }
};
