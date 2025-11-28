import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { type NumeroPosto, POSTOS_FIXOS } from '../types/postos';

const COLLECTION_NAME = 'postos';

export interface PostoFirestore {
  numero: NumeroPosto;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const initPostosIfNeeded = async () => {
  // Garante que todos os postos fixos existem no Firestore
  const now = new Date().toISOString();

  const promises = POSTOS_FIXOS.map(async (numero) => {
    const ref = doc(db, COLLECTION_NAME, String(numero));
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const data: PostoFirestore = {
        numero,
        ativo: true,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(ref, data);
    }
  });

  await Promise.all(promises);
};

export const getPostoByNumero = async (numero: NumeroPosto): Promise<PostoFirestore | null> => {
  const ref = doc(db, COLLECTION_NAME, String(numero));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as PostoFirestore;
};

export const setPostoAtivo = async (numero: NumeroPosto, ativo: boolean) => {
  const ref = doc(db, COLLECTION_NAME, String(numero));
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    const data: PostoFirestore = {
      numero,
      ativo,
      createdAt: now,
      updatedAt: now,
    };
      await setDoc(ref, data);
  } else {
    const data = snap.data() as PostoFirestore;
    await setDoc(ref, {
      ...data,
      ativo,
      updatedAt: now,
    });
  }
};
