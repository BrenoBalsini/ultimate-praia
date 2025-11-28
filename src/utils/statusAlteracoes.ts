import type { NumeroPosto } from '../types/postos';
import { listarAlteracoesAbertasPorPosto } from '../services/alteracoesService';

export const temAlteracoesPendentes = async (postoNumero: NumeroPosto): Promise<boolean> => {
  const lista = await listarAlteracoesAbertasPorPosto(postoNumero);
  return lista.length > 0;
};
