import type { NumeroPosto} from '../types/postos';
import { listarFaltasPorPostoECategoria } from '../services/faltasService';
import { listarAlteracoesAbertasPorPosto } from '../services/alteracoesService';

export interface ContadoresPendencias {
  whitemed: number;
  bolsaAph: number;
  outros: number;
  alteracoes: number;
}

export const buscarContadoresPendencias = async (
  postoNumero: NumeroPosto,
): Promise<ContadoresPendencias> => {
  const [
    whitemedFaltas,
    bolsaAphFaltas,
    outrosFaltas,
    alteracoesPendentes,
  ] = await Promise.all([
    listarFaltasPorPostoECategoria(postoNumero, 'whitemed'),
    listarFaltasPorPostoECategoria(postoNumero, 'bolsa_aph'),
    listarFaltasPorPostoECategoria(postoNumero, 'outros'),
    listarAlteracoesAbertasPorPosto(postoNumero),
  ]);

  return {
    whitemed: whitemedFaltas.length,
    bolsaAph: bolsaAphFaltas.length,
    outros: outrosFaltas.length,
    alteracoes: alteracoesPendentes.length,
  };
};
