import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { NumeroPosto, CategoriaMaterialB } from "../types/postos";
import { limparUndefined } from "./historicoService";

const COLLECTION_NAME = "faltasMateriais";

export interface FaltaMaterialDoc {
  materialTipoBId: string;
  materialNome: string;
  categoria: CategoriaMaterialB;
  postoNumero: NumeroPosto;
  resolvido: boolean;
  observacaoRegistro?: string;
  observacaoResolucao?: string;
  createdAt: string;
  resolvidoAt?: string;
}

// Lista faltas de um posto e categoria (ex: todas faltas Whitemed no Posto 3)
export const listarFaltasPorPostoECategoria = async (
  postoNumero: NumeroPosto,
  categoria: CategoriaMaterialB
): Promise<(FaltaMaterialDoc & { id: string })[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("postoNumero", "==", postoNumero),
    where("categoria", "==", categoria),
    where("resolvido", "==", false)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as FaltaMaterialDoc),
  }));
};

// Registra uma nova falta
export const registrarFaltaMaterial = async (params: {
  materialTipoBId: string;
  materialNome: string;
  categoria: CategoriaMaterialB;
  postoNumero: NumeroPosto;
  observacaoRegistro?: string;
}) => {
  const {
    materialTipoBId,
    materialNome,
    categoria,
    postoNumero,
    observacaoRegistro,
  } = params;
  const now = new Date().toISOString();

  const docData: FaltaMaterialDoc = {
    materialTipoBId,
    materialNome,
    categoria,
    postoNumero,
    resolvido: false,
    observacaoRegistro: observacaoRegistro || undefined, // pode ser undefined
    createdAt: now,
  };

  const docRef = await addDoc(
    collection(db, COLLECTION_NAME),
    limparUndefined(docData)
  );
  return docRef.id;
};
// Marca uma falta como resolvida
export const resolverFaltaMaterial = async (params: {
  id: string;
  observacaoResolucao?: string;
}) => {
  const { id, observacaoResolucao } = params;
  const ref = doc(db, COLLECTION_NAME, id);
  const now = new Date().toISOString();

  await updateDoc(ref, {
    resolvido: true,
    observacaoResolucao: observacaoResolucao ?? "",
    resolvidoAt: now,
  });
};
