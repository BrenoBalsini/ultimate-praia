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

export interface ItemOutro {
  id?: string;
  postoNumero: number;
  nomeItem: string;
  quantidadeEntregue: number;
  dataEntrega: Date;
  observacao?: string;
  criadoEm: Date;
  criadoPor: string;
}

export interface ItemOutroAgregado {
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
export const registrarEntregaOutro = async (
  data: Omit<ItemOutro, "id" | "criadoEm">
): Promise<ItemOutro> => {
  try {
    const docData = limparUndefined({
      postoNumero: data.postoNumero,
      nomeItem: data.nomeItem,
      quantidadeEntregue: data.quantidadeEntregue,
      dataEntrega: Timestamp.fromDate(data.dataEntrega),
      observacao: data.observacao, // pode ser undefined, mas será removido
      criadoPor: data.criadoPor,
      criadoEm: Timestamp.now(),
    });

    const docRef = await addDoc(collection(db, "outrosEntregas"), docData);

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
export const obterEntregasPosto = async (
  postoNumero: number
): Promise<ItemOutro[]> => {
  try {
    const q = query(
      collection(db, "outrosEntregas"),
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
export const obterItensAgregados = async (
  postoNumero: number
): Promise<ItemOutroAgregado[]> => {
  try {
    const entregas = await obterEntregasPosto(postoNumero);
    
    // Agrupar por nome do item
    const itensMap = new Map<string, ItemOutroAgregado>();

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

// Obter lista de nomes de itens já cadastrados (para autocomplete)
export const obterNomesItens = async (postoNumero: number): Promise<string[]> => {
  try {
    const entregas = await obterEntregasPosto(postoNumero);
    const nomesUnicos = [...new Set(entregas.map((e) => e.nomeItem))];
    return nomesUnicos.sort();
  } catch (error) {
    console.error("Erro ao obter nomes de itens:", error);
    throw error;
  }
};

// Obter todos os materiais cadastrados com categoria "outros"
export const obterMateriaisOutros = async (): Promise<string[]> => {
  try {
    const q = query(
      collection(db, "materiaisTipoB"),
      where("categoria", "==", "outros")
    );

    const snapshot = await getDocs(q);
    const materiais = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        // ✅ Filtrar apenas ativos (ou sem campo ativo = antigos)
        const ativo = data.ativo !== undefined ? data.ativo : true;
        return ativo ? (data.nome as string) : null;
      })
      .filter((nome): nome is string => nome !== null);
    
    return materiais.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("Erro ao obter materiais outros:", error);
    throw error;
  }
};


// Obter última entrega de um item específico para um posto
export const obterUltimaEntregaItem = async (
  postoNumero: number,
  nomeItem: string
): Promise<ItemOutro | null> => {
  try {
    const q = query(
      collection(db, "outrosEntregas"),
      where("postoNumero", "==", postoNumero),
      where("nomeItem", "==", nomeItem),
      orderBy("dataEntrega", "desc")
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
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
  } catch (error) {
    console.error("Erro ao obter última entrega:", error);
    return null;
  }
};

// Excluir uma entrega específica do histórico
export const excluirEntrega = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "outrosEntregas", id));
  } catch (error) {
    console.error("Erro ao excluir entrega:", error);
    throw error;
  }
};

// Limpar todo o histórico de um posto
export const limparHistoricoPosto = async (postoNumero: number): Promise<void> => {
  try {
    const q = query(
      collection(db, "outrosEntregas"),
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
