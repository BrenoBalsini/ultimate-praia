import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { GVC } from './gvcService';
import type { Alteracao, Elogio, Conceito } from '../types/alteracoes';
import type { Cautela, Solicitacao } from '../types/cautelas';

export interface EventoHistorico {
  id: string;
  tipo: 'alteracao' | 'elogio' | 'conceito' | 'cautela' | 'solicitacao';
  descricao: string;
  data: Date;
  detalhes?: any;
}

export interface DetalhesGVCCompleto {
  gvc: GVC;
  alteracoes: Alteracao[];
  elogios: Elogio[];
  conceitos: Conceito[];
  cautelas: Cautela[];
  solicitacoes: Solicitacao[];
  historico: EventoHistorico[];
}

export const obterDetalhesGVC = async (gvcId: string): Promise<DetalhesGVCCompleto> => {
  try {
    // 1. Buscar dados do GVC
    const gvcDoc = await getDoc(doc(db, 'gvcs', gvcId));
    if (!gvcDoc.exists()) {
      throw new Error('GVC não encontrado');
    }

    const gvc: GVC = {
      id: gvcDoc.id,
      ...gvcDoc.data(),
      criadoEm: gvcDoc.data().criadoEm?.toDate(),
      atualizadoEm: gvcDoc.data().atualizadoEm?.toDate(),
    } as GVC;

    // 2. Buscar alterações
    const alteracoesQuery = query(
      collection(db, 'alteracoesGvc'),
      where('gvcId', '==', gvcId),
      orderBy('criadoEm', 'desc')
    );
    const alteracoesSnap = await getDocs(alteracoesQuery);
    const alteracoes: Alteracao[] = alteracoesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      criadoEm: doc.data().criadoEm,
    } as Alteracao));

    // 3. Buscar elogios
    const elogiosQuery = query(
      collection(db, 'elogios'),
      where('gvcIds', 'array-contains', gvcId),
      orderBy('criadoEm', 'desc')
    );
    const elogiosSnap = await getDocs(elogiosQuery);
    const elogios: Elogio[] = elogiosSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      criadoEm: doc.data().criadoEm,
    } as Elogio));

    // 4. Buscar conceitos
    const conceitosQuery = query(
      collection(db, 'conceitos'),
      where('gvcId', '==', gvcId),
      orderBy('criadoEm', 'desc')
    );
    const conceitosSnap = await getDocs(conceitosQuery);
    const conceitos: Conceito[] = conceitosSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      criadoEm: doc.data().criadoEm,
    } as Conceito));

    // 5. Buscar cautelas
    const cautelasQuery = query(
      collection(db, 'cautelas'),
      where('gvcId', '==', gvcId),
      orderBy('atualizadoEm', 'desc')
    );
    const cautelasSnap = await getDocs(cautelasQuery);
    const cautelas: Cautela[] = cautelasSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      criadoEm: doc.data().criadoEm,
      atualizadoEm: doc.data().atualizadoEm,
    } as Cautela));

    // 6. Buscar solicitações
    const solicitacoesQuery = query(
      collection(db, 'solicitacoes'),
      where('gvcId', '==', gvcId),
      orderBy('criadaEm', 'desc')
    );
    const solicitacoesSnap = await getDocs(solicitacoesQuery);
    const solicitacoes: Solicitacao[] = solicitacoesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      criadaEm: doc.data().criadaEm,
      atualizadaEm: doc.data().atualizadaEm,
    } as Solicitacao));

    // 7. Criar histórico unificado
    const historico: EventoHistorico[] = [];

    alteracoes.forEach((alt) => {
      historico.push({
        id: alt.id || '',
        tipo: 'alteracao',
        descricao: `${alt.tipo}: ${alt.descricao}`,
        data: alt.criadoEm?.toDate() || new Date(),
        detalhes: alt,
      });
    });

    elogios.forEach((elog) => {
      historico.push({
        id: elog.id || '',
        tipo: 'elogio',
        descricao: elog.titulo || 'Elogio registrado',
        data: elog.criadoEm?.toDate() || new Date(),
        detalhes: elog,
      });
    });

    conceitos.forEach((conc) => {
      historico.push({
        id: conc.id || '',
        tipo: 'conceito',
        descricao: `${conc.conceito} (${conc.polaridade})`,
        data: conc.criadoEm?.toDate() || new Date(),
        detalhes: conc,
      });
    });

    cautelas.forEach((caut) => {
      if (caut.itensAtivos.length > 0) {
        historico.push({
          id: caut.id || '',
          tipo: 'cautela',
          descricao: `Cautela de ${caut.itensAtivos.length} item(ns)`,
          data: caut.atualizadoEm?.toDate() || new Date(),
          detalhes: caut,
        });
      }
    });

    solicitacoes.forEach((sol) => {
      historico.push({
        id: sol.id || '',
        tipo: 'solicitacao',
        descricao: `Solicitação de ${sol.itens.length} item(ns) - ${sol.status}`,
        data: sol.criadaEm?.toDate() || new Date(),
        detalhes: sol,
      });
    });

    // Ordenar histórico por data decrescente
    historico.sort((a, b) => b.data.getTime() - a.data.getTime());

    return {
      gvc,
      alteracoes,
      elogios,
      conceitos,
      cautelas,
      solicitacoes,
      historico,
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do GVC:', error);
    throw error;
  }
};
