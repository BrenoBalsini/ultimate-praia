import type { StatusMaterialA, TipoMaterialA, NumeroPosto } from '../types/postos';
import { getMateriaisAByPostoAndTipo } from '../services/materiaisAService';

export type StatusMaterialPorTipo = Record<TipoMaterialA, StatusMaterialA>;

/**
 * Calcula o status de binóculo / guarda-sol / rádio de um posto
 * baseado na lista de materiais no Firestore.
 */
export const calcularStatusMateriaisAParaPosto = async (
  postoNumero: NumeroPosto,
): Promise<StatusMaterialPorTipo> => {
  const tipos: TipoMaterialA[] = ['binoculo', 'guardassol', 'radio'];

  const resultado: Partial<StatusMaterialPorTipo> = {};

  for (const tipo of tipos) {
    const materiais = await getMateriaisAByPostoAndTipo(postoNumero, tipo);

    if (materiais.length === 0) {
      resultado[tipo] = 'ausente';
      continue;
    }

    // Se existe pelo menos 1 quebrado -> vermelho
    if (materiais.some((m) => m.status === 'quebrado')) {
      resultado[tipo] = 'quebrado';
      continue;
    }

    // Se existe pelo menos 1 com avaria -> amarelo
    if (materiais.some((m) => m.status === 'avaria')) {
      resultado[tipo] = 'avaria';
      continue;
    }

    // Caso contrário, todos estão OK
    resultado[tipo] = 'ok';
  }

  return resultado as StatusMaterialPorTipo;
};
