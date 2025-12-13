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
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface ItemBolsaAph {
  id?: string;
  postoNumero: number;
  nomeItem: string;
  quantidadeEntregue: number;
  dataEntrega: Date;
  observacao?: string;
  criadoEm: Date;
  criadoPor: string;
}

export interface ItemBolsaAphAgregado {
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
export const registrarEntregaBolsaAph = async (
  data: Omit<ItemBolsaAph, "id" | "criadoEm">
): Promise<ItemBolsaAph> => {
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

    const docRef = await addDoc(collection(db, "bolsaAphEntregas"), docData);

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
export const obterEntregasBolsaAph = async (
  postoNumero: number
): Promise<ItemBolsaAph[]> => {
  try {
    const q = query(
      collection(db, "bolsaAphEntregas"),
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
export const obterItensBolsaAphAgregados = async (
  postoNumero: number
): Promise<ItemBolsaAphAgregado[]> => {
  try {
    const entregas = await obterEntregasBolsaAph(postoNumero);
    
    // Agrupar por nome do item
    const itensMap = new Map<string, ItemBolsaAphAgregado>();

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

// Obter todos os materiais cadastrados com categoria "bolsaAph"
export const obterMateriaisBolsaAph = async (): Promise<string[]> => {
  try {
    const q = query(
      collection(db, "materiaisTipoB"),
      where("categoria", "==", "bolsa_aph") // ✅ Mudou de "bolsaAph" para "bolsa_aph"
    );

    const snapshot = await getDocs(q);
    const materiais = snapshot.docs.map((doc) => doc.data().nome as string);
    return materiais.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Erro ao obter materiais bolsa APH:", error);
    throw error;
  }
};

// Excluir uma entrega específica do histórico
export const excluirEntregaBolsaAph = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "bolsaAphEntregas", id));
  } catch (error) {
    console.error("Erro ao excluir entrega:", error);
    throw error;
  }
};

// Limpar todo o histórico de um posto
export const limparHistoricoPostoBolsaAph = async (postoNumero: number): Promise<void> => {
  try {
    const q = query(
      collection(db, "bolsaAphEntregas"),
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
