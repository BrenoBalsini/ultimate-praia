import type { NumeroPosto, CategoriaMaterialB } from '../types/postos';
import { listarFaltasPorPostoECategoria } from '../services/faltasService';

export type StatusTipoB = 'ok' | 'falta';

export interface StatusMateriaisBTipo {
  whitemed: StatusTipoB;
  bolsaAph: StatusTipoB;
  outros: StatusTipoB;
}

/**
 * Retorna se cada categoria (whitemed / bolsa_aph / Outros) tem faltas abertas para determinado posto.
 */
export const calcularStatusMateriaisBParaPosto = async (
  postoNumero: NumeroPosto,
): Promise<StatusMateriaisBTipo> => {
  const categorias: CategoriaMaterialB[] = ['whitemed', 'bolsa_aph', 'outros'];

  const resultado: StatusMateriaisBTipo = {
    whitemed: 'ok',
    bolsaAph: 'ok',
    outros: 'ok',
  };

  for (const categoria of categorias) {
    const faltas = await listarFaltasPorPostoECategoria(postoNumero, categoria);
    const temFalta = faltas.length > 0;

    if (categoria === 'whitemed') resultado.whitemed = temFalta ? 'falta' : 'ok';
    if (categoria === 'bolsa_aph') resultado.bolsaAph = temFalta ? 'falta' : 'ok';
    if (categoria === 'outros') resultado.outros = temFalta ? 'falta' : 'ok';
  }

  return resultado;
};
