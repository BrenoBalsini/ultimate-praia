import type { POSTOS_FIXOS, StatusMaterialA } from '../types/postos';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { listarMateriaisA, type MaterialADoc } from '../services/materiaisAService';
import type { NumeroPosto } from '../types/postos';

interface CardPostoProps {
  postoNumero: (typeof POSTOS_FIXOS)[number];
  ativo: boolean;
  statusBinoculo: StatusMaterialA;
  statusGuardassol: StatusMaterialA;
  statusRadio: StatusMaterialA;
  statusWhitemed: 'ok' | 'falta';
  statusBolsaAph: 'ok' | 'falta';
  statusOutros: 'ok' | 'falta';
  bolsaAphAusente: boolean;
  temAlteracoesPendentes: boolean;
  onToggleAtivo: () => void;
  onMaterialClick: (tipo: string) => void;
}

type MaterialAComId = MaterialADoc & { id: string };

export const CardPosto = ({
  postoNumero,
  ativo,
  statusBinoculo,
  statusGuardassol,
  statusRadio,
  statusWhitemed,
  statusBolsaAph,
  statusOutros,
  bolsaAphAusente,
  temAlteracoesPendentes,
  onToggleAtivo,
  onMaterialClick,
}: CardPostoProps) => {
  const [materiaisBinoculos, setMateriaisBinoculos] = useState<MaterialAComId[]>([]);
  const [materiaisGuardasois, setMateriaisGuardasois] = useState<MaterialAComId[]>([]);
  const [materiaisRadios, setMateriaisRadios] = useState<MaterialAComId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarQuantidades = async () => {
      try {
        const materiais = await listarMateriaisA(postoNumero as NumeroPosto);

        const binoculos = materiais.filter((m) => m.tipo === 'binoculo');
        const guardasois = materiais.filter((m) => m.tipo === 'guardassol');
        const radios = materiais.filter((m) => m.tipo === 'radio');

        setMateriaisBinoculos(binoculos);
        setMateriaisGuardasois(guardasois);
        setMateriaisRadios(radios);
      } catch (error) {
        console.error('Erro ao carregar quantidades:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarQuantidades();
  }, [postoNumero]);

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

  const getBgColor = (material: string) => {
    if (material === 'binoculo') return corMaterialA(statusBinoculo);
    if (material === 'guardassol') return corMaterialA(statusGuardassol);
    if (material === 'radio') return corMaterialA(statusRadio);

    if (material === 'whitemed') return corMaterialBTipo(statusWhitemed);

    if (material === 'bolsaAph') {
      if (bolsaAphAusente) {
        return 'bg-gray-400 hover:bg-gray-500';
      }
      return corMaterialBTipo(statusBolsaAph);
    }

    if (material === 'outros') return corMaterialBTipo(statusOutros);

    if (material === 'alteracoes') {
      return temAlteracoesPendentes
        ? 'bg-yellow-500 hover:bg-yellow-600'
        : 'bg-emerald-500 hover:bg-emerald-600';
    }

    return 'bg-emerald-500 hover:bg-emerald-600';
  };

  const getCorPorStatus = (status: StatusMaterialA) => {
    switch (status) {
      case 'ausente':
        return 'bg-gray-400';
      case 'ok':
        return 'bg-emerald-500';
      case 'avaria':
        return 'bg-yellow-500';
      case 'quebrado':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

const MaterialTipoAButton = ({
  material,
  icon,
  label,
  materiais,
}: {
  material: string;
  icon: string;
  label: string;
  materiais: MaterialAComId[];
}) => {
  const quantidade = materiais.length;
  const offset = 4;          // deslocamento visual
  const maxPlaquinhas = 4;   // até 2 atrás (sempre 1 principal na frente)

  const getPiorStatus = (): StatusMaterialA => {
    if (materiais.some((m) => m.status === 'quebrado')) return 'quebrado';
    if (materiais.some((m) => m.status === 'avaria'))   return 'avaria';
    if (materiais.some((m) => m.status === 'ok'))       return 'ok';
    return 'ausente';
  };

  const statusPrincipal = quantidade > 0 ? getPiorStatus() : 'ausente';

  // Número de faixas atrás, mas sem alterar a quantidade real
  const plaquinhas = Math.min(Math.max(quantidade - 1, 0), maxPlaquinhas);

  return (
    <div className="relative group">
      {/* faixas atrás */}
      {plaquinhas > 0 && ativo && (
        <>
          {Array.from({ length: plaquinhas }).map((_, index) => {
            const step = index + 1;              // 1,2
            const translate = step * offset;     // 3px, 6px
            const mat = materiais[index] ?? materiais[0];
            const cor = getCorPorStatus(mat.status);

            return (
              <div
                key={`${material}-stack-${step}`}
                className={`
                  absolute inset-0 rounded-xl pointer-events-none
                  ${cor}
                  ring-1 ring-black
                `}
                style={{
                  transform: `translate(${translate}px, ${translate}px)`,
                  
                  zIndex: plaquinhas - step,
                }}
              />
            );
          })}
        </>
      )}

      {/* card principal grande (sempre 1) */}
      <button
        onClick={() => onMaterialClick(material)}
        disabled={!ativo}
        className={`
          relative w-full rounded-xl p-4 text-white font-semibold transition-all
          flex flex-col items-center justify-center gap-2
          min-h-[100px]
          ${ativo ? getCorPorStatus(statusPrincipal) : 'bg-gray-300 cursor-not-allowed opacity-60'}
          ${ativo ? 'hover:brightness-110 active:scale-95 shadow-lg ring-1 ring-black' : ''}
        `}
        style={{ zIndex: plaquinhas + 10 }}
      >
        <span className="text-3xl relative z-10">{icon}</span>
        <span className="text-xs text-center leading-tight relative z-10">
          {label}
        </span>

        {/* quantidade REAL na bolinha */}
        {quantidade > 1 && ativo && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-gray-900 flex items-center justify-center text-xs font-bold shadow-lg z-20 ring-1 ring-black">
            {quantidade > 9 ? '9+' : quantidade}
          </div>
        )}

        {ativo && (
          <ChevronRight className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        )}
      </button>
    </div>
  );
};

  const MaterialTipoBButton = ({
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
    <div
      className={`bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 transition-all ${
        !ativo ? 'opacity-70' : 'hover:shadow-xl'
      }`}
    >
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

      {loading ? (
        <div className="grid grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[100px] bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <MaterialTipoAButton
            material="binoculo"
            icon="🔭"
            label="Binóculo"
            materiais={materiaisBinoculos}
          />
          <MaterialTipoAButton
            material="guardassol"
            icon="☂️"
            label="Guarda-sol"
            materiais={materiaisGuardasois}
          />
          <MaterialTipoAButton
            material="radio"
            icon="📻"
            label="Rádio"
            materiais={materiaisRadios}
          />

          <MaterialTipoBButton material="whitemed" icon="💊" label="Whitemed" />
          <MaterialTipoBButton material="bolsaAph" icon="🩹" label="Bolsa APH" />
          <MaterialTipoBButton material="outros" icon="📦" label="Outros" />

          <MaterialTipoBButton material="alteracoes" icon="⚠️" label="Alterações" />
        </div>
      )}
    </div>
  );
};
