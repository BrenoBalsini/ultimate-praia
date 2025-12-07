import type { POSTOS_FIXOS, StatusMaterialA } from '../types/postos';
import { ChevronRight } from 'lucide-react';

interface CardPostoProps {
  postoNumero: (typeof POSTOS_FIXOS)[number];
  ativo: boolean;
  statusBinoculo: StatusMaterialA;
  statusGuardassol: StatusMaterialA;
  statusRadio: StatusMaterialA;
  statusWhitemed: 'ok' | 'falta';
  statusBolsaAph: 'ok' | 'falta';
  statusOutros: 'ok' | 'falta';
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
  statusOutros,
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
   if (material === 'outros') return corMaterialBTipo(statusOutros);

    if (material === 'alteracoes') {
      return temAlteracoesPendentes
        ? 'bg-yellow-500 hover:bg-yellow-600'
        : 'bg-emerald-500 hover:bg-emerald-600';
    }

    return 'bg-emerald-500 hover:bg-emerald-600';
  };

  const corMaterialA = (status: StatusMaterialA) => {
    switch (status) {
      case 'ausente':
        return 'bg-gray-400 hover:bg-gray-500';
      case 'ok':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'avaria':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'quebrado':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const corMaterialBTipo = (status: 'ok' | 'falta') => {
    if (status === 'ok') return 'bg-emerald-500 hover:bg-emerald-600';
    return 'bg-yellow-500 hover:bg-yellow-600';
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
    return (
      <button
        onClick={() => onMaterialClick(material)}
        disabled={!ativo}
        className={`
          relative rounded-xl p-4 text-white font-semibold transition-all
          flex flex-col items-center justify-center gap-2
          min-h-[100px] group
          ${ativo ? getBgColor(material) : 'bg-gray-300 cursor-not-allowed opacity-60'}
          ${ativo ? 'active:scale-95 shadow-md hover:shadow-lg' : ''}
        `}
      >
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-center leading-tight">{label}</span>
        {ativo && (
          <ChevronRight className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 transition-all ${
      !ativo ? 'opacity-70' : 'hover:shadow-xl'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center">
            <span className="text-white font-bold text-lg">{postoNumero}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Posto {postoNumero}</h3>
        </div>

        <button
          onClick={onToggleAtivo}
          className={`
            px-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${
              ativo
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {ativo ? 'Ativo' : 'Inativo'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MaterialButton material="binoculo" icon="🔭" label="Binóculo" />
        <MaterialButton material="guardassol" icon="☂️" label="Guarda-sol" />
        <MaterialButton material="radio" icon="📻" label="Rádio" />

        <MaterialButton material="whitemed" icon="💊" label="Whitemed" />
        <MaterialButton material="bolsaAph" icon="🩹" label="Bolsa APH" />
        <MaterialButton material="outros" icon="📦" label="Outros" />

        <MaterialButton material="alteracoes" icon="⚠️" label="Alterações" />
      </div>
    </div>
  );
};
