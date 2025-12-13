import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface ItemWhiteMed {
  id?: string;
  postoNumero: number;
  nomeItem: string;
  quantidadeEntregue: number;
  dataEntrega: Date;
  observacao?: string;
  criadoEm: Date;
  criadoPor: string;
}

export interface ItemWhiteMedAgregado {
  nomeItem: string;
  totalEntregue: number;
  ultimaQuantidade: number;
  ultimaData?: Date;
  ultimaObservacao?: string;
}

const limparUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// Registrar nova entrega
export const registrarEntregaWhiteMed = async (
  data: Omit<ItemWhiteMed, "id" | "criadoEm">
): Promise<ItemWhiteMed> => {
  try {
    const docData = limparUndefined({
      postoNumero: data.postoNumero,
      nomeItem: data.nomeItem,
      quantidadeEntregue: data.quantidadeEntregue,
      dataEntrega: Timestamp.fromDate(data.dataEntrega),
      observacao: data.observacao,
      criadoPor: data.criadoPor,
      criadoEm: Timestamp.now(),
    });

    const docRef = await addDoc(collection(db, "whiteMedEntregas"), docData);

    return {
      id: docRef.id,
      ...data,
      criadoEm: new Date(),
    };
  } catch (error) {
    console.error("Erro ao registrar entrega:", error);
    throw error;
  }
};

// Obter todas as entregas de um posto
export const obterEntregasWhiteMed = async (
  postoNumero: number
): Promise<ItemWhiteMed[]> => {
  try {
    const q = query(
      collection(db, "whiteMedEntregas"),
      where("postoNumero", "==", postoNumero),
      orderBy("dataEntrega", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        postoNumero: data.postoNumero,
        nomeItem: data.nomeItem,
        quantidadeEntregue: data.quantidadeEntregue,
        dataEntrega: data.dataEntrega?.toDate() || new Date(),
        observacao: data.observacao,
        criadoEm: data.criadoEm?.toDate() || new Date(),
        criadoPor: data.criadoPor,
      };
    });
  } catch (error) {
    console.error("Erro ao obter entregas:", error);
    throw error;
  }
};

// Obter dados agregados por item
export const obterItensWhiteMedAgregados = async (
  postoNumero: number
): Promise<ItemWhiteMedAgregado[]> => {
  try {
    const entregas = await obterEntregasWhiteMed(postoNumero);
    
    // Agrupar por nome do item
    const itensMap = new Map<string, ItemWhiteMedAgregado>();

    entregas.forEach((entrega) => {
      const itemExistente = itensMap.get(entrega.nomeItem);

      if (itemExistente) {
        itemExistente.totalEntregue += entrega.quantidadeEntregue;
        
        // Atualizar última entrega se for mais recente
        if (!itemExistente.ultimaData || entrega.dataEntrega > itemExistente.ultimaData) {
          itemExistente.ultimaQuantidade = entrega.quantidadeEntregue;
          itemExistente.ultimaData = entrega.dataEntrega;
          itemExistente.ultimaObservacao = entrega.observacao;
        }
      } else {
        itensMap.set(entrega.nomeItem, {
          nomeItem: entrega.nomeItem,
          totalEntregue: entrega.quantidadeEntregue,
          ultimaQuantidade: entrega.quantidadeEntregue,
          ultimaData: entrega.dataEntrega,
          ultimaObservacao: entrega.observacao,
        });
      }
    });

    return Array.from(itensMap.values()).sort((a, b) => 
      a.nomeItem.localeCompare(b.nomeItem)
    );
  } catch (error) {
    console.error("Erro ao obter itens agregados:", error);
    throw error;
  }
};

// ✅ VERSÃO CORRETA: Obter todos os materiais cadastrados com categoria "whitemed"
export const obterMateriaisWhiteMed = async (): Promise<string[]> => {
  try {
    const q = query(
      collection(db, "materiaisTipoB"),
      where("categoria", "==", "whitemed")
    );

    const snapshot = await getDocs(q);
    const materiais = snapshot.docs.map((doc) => doc.data().nome as string);
    return materiais.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Erro ao obter materiais WhiteMed:", error);
    throw error;
  }
};

// Excluir uma entrega específica do histórico
export const excluirEntregaWhiteMed = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "whiteMedEntregas", id));
  } catch (error) {
    console.error("Erro ao excluir entrega:", error);
    throw error;
  }
};


// Limpar todo o histórico de um posto
export const limparHistoricoPostoWhiteMed = async (postoNumero: number): Promise<void> => {
  try {
    const q = query(
      collection(db, "whiteMedEntregas"),
      where("postoNumero", "==", postoNumero)
    );

    const snapshot = await getDocs(q);
    
    // Excluir todos os documentos em batch
    const deletePromises = snapshot.docs.map((doc) => 
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    throw error;
  }
};

// Marcar/Desmarcar WhiteMed como ausente em um posto
export const marcarWhiteMedAusente = async (
  postoNumero: number,
  ausente: boolean
): Promise<void> => {
  try {
    const q = query(
      collection(db, "whiteMedStatus"),
      where("postoNumero", "==", postoNumero)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Criar novo documento
      await addDoc(collection(db, "whiteMedStatus"), {
        postoNumero,
        ausente,
        atualizadoEm: Timestamp.now(),
      });
    } else {
      // Atualizar existente
      const docRef = doc(db, "whiteMedStatus", snapshot.docs[0].id);
      await updateDoc(docRef, {
        ausente,
        atualizadoEm: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Erro ao marcar WhiteMed como ausente:", error);
    throw error;
  }
};

// Verificar se WhiteMed está ausente em um posto
export const verificarWhiteMedAusente = async (
  postoNumero: number
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "whiteMedStatus"),
      where("postoNumero", "==", postoNumero)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false; // Não há registro = não está ausente
    }

    const data = snapshot.docs[0].data();
    return data.ausente || false;
  } catch (error) {
    console.error("Erro ao verificar WhiteMed ausente:", error);
    return false;
  }
};

// Obter status de todos os postos (para CardPostos)
export const obterStatusWhiteMedTodosPostos = async (): Promise<
  Record<number, boolean>
> => {
  try {
    const snapshot = await getDocs(collection(db, "whiteMedStatus"));
    const status: Record<number, boolean> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      status[data.postoNumero] = data.ausente || false;
    });

    return status;
  } catch (error) {
    console.error("Erro ao obter status WhiteMed:", error);
    return {};
  }
};
