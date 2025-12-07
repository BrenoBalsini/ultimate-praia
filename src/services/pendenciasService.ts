import type { NumeroPosto, CategoriaMaterialB } from '../types/postos';
import {
  listarFaltasPorPostoECategoria,
} from './faltasService';
import { listarAlteracoesAbertasPorPosto } from './alteracoesService';

export interface PendenciaFalta {
  tipo: 'falta';
  id: string;
  postoNumero: NumeroPosto;
  categoria: CategoriaMaterialB;
  materialNome: string;
  observacaoRegistro?: string;
  createdAt: string;
}

export interface PendenciaAlteracao {
  tipo: 'alteracao';
  id: string;
  postoNumero: NumeroPosto;
  descricao: string;
  createdAt: string;
}

export type Pendencia = PendenciaFalta | PendenciaAlteracao;

// Busca todas as faltas em aberto (todas as categorias de todos os postos)
export const buscarTodasFaltasAbertas = async (): Promise<PendenciaFalta[]> => {
  const todas: PendenciaFalta[] = [];
  const categorias: CategoriaMaterialB[] = ['whitemed', 'bolsa_aph', 'outros'];

  for (const postoNumero of [1, 2, 3, 5, 6, 8, 10, 13, 16, 19]) {
    for (const categoria of categorias) {
      const faltas = await listarFaltasPorPostoECategoria(
        postoNumero as NumeroPosto,
        categoria,
      );
      const pendencias = faltas.map((f) => ({
        tipo: 'falta' as const,
        id: f.id,
        postoNumero: f.postoNumero,
        categoria: f.categoria,
        materialNome: f.materialNome,
        observacaoRegistro: f.observacaoRegistro,
        createdAt: f.createdAt,
      }));
      todas.push(...pendencias);
    }
  }

  // Ordenar por data mais recente primeiro
  todas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return todas;
};

// Busca todas as alterações em aberto
export const buscarTodasAlteracoesAbertas = async (): Promise<PendenciaAlteracao[]> => {
  const todas: PendenciaAlteracao[] = [];

  for (const postoNumero of [1, 2, 3, 5, 6, 8, 10, 13, 16, 19]) {
    const alteracoes = await listarAlteracoesAbertasPorPosto(postoNumero as NumeroPosto);
    const pendencias = alteracoes.map((a) => ({
      tipo: 'alteracao' as const,
      id: a.id,
      postoNumero: a.postoNumero,
      descricao: a.descricao,
      createdAt: a.createdAt,
    }));
    todas.push(...pendencias);
  }

  // Ordenar por data mais recente primeiro
  todas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return todas;
};

// Busca todas as pendências (faltas + alterações)
export const buscarTodasPendencias = async (): Promise<Pendencia[]> => {
  const [faltas, alteracoes] = await Promise.all([
    buscarTodasFaltasAbertas(),
    buscarTodasAlteracoesAbertas(),
  ]);

  return [...faltas, ...alteracoes];
};
