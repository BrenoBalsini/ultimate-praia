import type { POSTOS_FIXOS, StatusMaterialA } from '../types/postos';

interface CardPostoProps {
  postoNumero: (typeof POSTOS_FIXOS)[number];
  ativo: boolean;
  statusBinoculo: StatusMaterialA;
  statusGuardassol: StatusMaterialA;
  statusRadio: StatusMaterialA;
  statusWhitemed: 'ok' | 'falta';
  statusBolsaAph: 'ok' | 'falta';
  statusLimpeza: 'ok' | 'falta';
  temAlteracoesPendentes: boolean;
  onToggleAtivo: () => void;
  onMaterialClick: (tipo: string) => void;
}

export const CardPosto = ({
  postoNumero,
  ativo,
  statusBinoculo,
  statusGuardassol,
  statusRadio,
  statusWhitemed,
  statusBolsaAph,
  statusLimpeza,
  temAlteracoesPendentes,
  onToggleAtivo,
  onMaterialClick,
}: CardPostoProps) => {
  const getBgColor = (material: string) => {
    if (material === 'binoculo') return corMaterialA(statusBinoculo);
    if (material === 'guardassol') return corMaterialA(statusGuardassol);
    if (material === 'radio') return corMaterialA(statusRadio);

    if (material === 'whitemed') return corMaterialBTipo(statusWhitemed);
    if (material === 'bolsaAph') return corMaterialBTipo(statusBolsaAph);
    if (material === 'limpeza') return corMaterialBTipo(statusLimpeza);

    if (material === 'alteracoes') {
      return temAlteracoesPendentes
        ? 'bg-yellow-500 hover:bg-yellow-600'
        : 'bg-green-500 hover:bg-green-600';
    }

    return 'bg-green-500 hover:bg-green-600';
  };

  const corMaterialA = (status: StatusMaterialA) => {
    switch (status) {
      case 'ausente':
        return 'bg-gray-400';
      case 'ok':
        return 'bg-green-500 hover:bg-green-600';
      case 'avaria':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'quebrado':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-400';
    }
  };

  const corMaterialBTipo = (status: 'ok' | 'falta') => {
    if (status === 'ok') return 'bg-green-500 hover:bg-green-600';
    return 'bg-yellow-500 hover:bg-yellow-600';
  };

  const getBadgeCount = (_material: string) => {
    // por enquanto 0; depois podemos colocar contagem de faltas/pendências
    return 0;
  };

  const MaterialButton = ({
    material,
    icon,
    label,
  }: {
    material: string;
    icon: string;
    label: string;
  }) => {
    const badgeCount = getBadgeCount(material);

    return (
      <button
        onClick={() => onMaterialClick(material)}
        disabled={!ativo}
        className={`
          relative rounded-lg p-4 sm:p-6 text-white font-medium transition-all
          flex flex-col items-center justify-center gap-2
          min-h-[100px] sm:min-h-[120px]
          ${ativo ? getBgColor(material) : 'bg-gray-400 cursor-not-allowed opacity-60'}
          ${ativo ? 'active:scale-95' : ''}
        `}
      >
        <span className="text-2xl sm:text-3xl">{icon}</span>
        <span className="text-xs sm:text-sm text-center">{label}</span>

        {badgeCount > 0 && ativo && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            {badgeCount}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${!ativo ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Posto {postoNumero}</h3>

        <button
          onClick={onToggleAtivo}
          className={`
            px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
            ${
              ativo
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }
          `}
        >
          {ativo ? 'Ativo' : 'Inativo'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <MaterialButton material="binoculo" icon="🔭" label="Binóculo" />
        <MaterialButton material="guardassol" icon="☂️" label="Guarda-sol" />
        <MaterialButton material="radio" icon="📻" label="Rádio" />

        <MaterialButton material="whitemed" icon="💊" label="Whitemed" />
        <MaterialButton material="bolsaAph" icon="🩹" label="Bolsa APH" />
        <MaterialButton material="limpeza" icon="🧹" label="Limpeza" />

        <MaterialButton material="alteracoes" icon="⚠️" label="Alterações" />
      </div>
    </div>
  );
};
