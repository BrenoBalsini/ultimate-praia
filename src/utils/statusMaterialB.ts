import type { NumeroPosto, CategoriaMaterialB } from '../types/postos';
import { listarFaltasPorPostoECategoria } from '../services/faltasService';

export type StatusTipoB = 'ok' | 'falta';

export interface StatusMateriaisBTipo {
  whitemed: StatusTipoB;
  bolsaAph: StatusTipoB;
  limpeza: StatusTipoB;
}

/**
 * Retorna se cada categoria (whitemed / bolsa_aph / limpeza) tem faltas abertas para determinado posto.
 */
export const calcularStatusMateriaisBParaPosto = async (
  postoNumero: NumeroPosto,
): Promise<StatusMateriaisBTipo> => {
  const categorias: CategoriaMaterialB[] = ['whitemed', 'bolsa_aph', 'limpeza'];

  const resultado: StatusMateriaisBTipo = {
    whitemed: 'ok',
    bolsaAph: 'ok',
    limpeza: 'ok',
  };

  for (const categoria of categorias) {
    const faltas = await listarFaltasPorPostoECategoria(postoNumero, categoria);
    const temFalta = faltas.length > 0;

    if (categoria === 'whitemed') resultado.whitemed = temFalta ? 'falta' : 'ok';
    if (categoria === 'bolsa_aph') resultado.bolsaAph = temFalta ? 'falta' : 'ok';
    if (categoria === 'limpeza') resultado.limpeza = temFalta ? 'falta' : 'ok';
  }

  return resultado;
};
