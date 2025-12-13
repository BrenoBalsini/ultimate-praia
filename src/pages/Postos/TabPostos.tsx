import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardPosto } from "../../components/CardPosto";
import { POSTOS_FIXOS } from "../../types/postos";
import type { NumeroPosto, StatusMaterialA } from "../../types/postos";
import {
  initPostosIfNeeded,
  getPostoByNumero,
  setPostoAtivo,
} from "../../services/postosService";
import { calcularStatusMateriaisAParaPosto } from "../../utils/statusMaterialA";
import {
  calcularStatusMateriaisBParaPosto,
  type StatusMateriaisBTipo,
} from "../../utils/statusMaterialB";
import { temAlteracoesPendentes } from "../../utils/statusAlteracoes";
import { useAuth } from "../../hooks/useAuth";
import { obterStatusBolsaAphTodosPostos } from "../../services/bolsaAphService";
import { obterStatusWhiteMedTodosPostos } from "../../services/whiteMedService";

type MaterialKey =
  | "binoculo"
  | "guardassol"
  | "radio"
  | "whitemed"
  | "bolsaAph"
  | "outros"
  | "alteracoes";

interface StatusMateriaisAByPosto {
  [postoNumero: number]: {
    binoculo: StatusMaterialA;
    guardassol: StatusMaterialA;
    radio: StatusMaterialA;
  };
}

interface StatusMateriaisBByPosto {
  [postoNumero: number]: StatusMateriaisBTipo;
}

interface AlteracoesByPosto {
  [postoNumero: number]: boolean;
}

export const TabPostos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [postosAtivos, setPostosAtivos] = useState<Record<number, boolean>>({});
  const [statusMateriaisA, setStatusMateriaisA] =
    useState<StatusMateriaisAByPosto>({});
  const [statusMateriaisB, setStatusMateriaisB] =
    useState<StatusMateriaisBByPosto>({});
  const [alteracoesPendentes, setAlteracoesPendentes] =
    useState<AlteracoesByPosto>({});
  const [bolsaAphAusente, setBolsaAphAusente] = useState<Record<number, boolean>>({});
  const [whiteMedAusente, setWhiteMedAusente] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const loadPostos = async () => {
      try {
        await initPostosIfNeeded();

        // ✅ PARALELIZA todas as chamadas + Bolsa APH status
        const [resultados, statusAphAusente, statusWhiteMedAusente] = await Promise.all([
          Promise.all(
            POSTOS_FIXOS.map(async (numero) => {
              const [posto, statusAposto, statusBposto, temAlt] =
                await Promise.all([
                  getPostoByNumero(numero as NumeroPosto),
                  calcularStatusMateriaisAParaPosto(numero as NumeroPosto),
                  calcularStatusMateriaisBParaPosto(numero as NumeroPosto),
                  temAlteracoesPendentes(numero as NumeroPosto),
                ]);

              return {
                numero,
                ativo: posto?.ativo ?? true,
                statusA: {
                  binoculo: statusAposto.binoculo,
                  guardassol: statusAposto.guardassol,
                  radio: statusAposto.radio,
                },
                statusB: statusBposto,
                alteracoes: temAlt,
              };
            })
          ),
          obterStatusBolsaAphTodosPostos(),
          obterStatusWhiteMedTodosPostos(),
        ]);

        // Montar os objetos de estado
        const estados: Record<number, boolean> = {};
        const statusA: StatusMateriaisAByPosto = {};
        const statusB: StatusMateriaisBByPosto = {};
        const altPend: AlteracoesByPosto = {};

        resultados.forEach((res) => {
          estados[res.numero] = res.ativo;
          statusA[res.numero] = res.statusA;
          statusB[res.numero] = res.statusB;
          altPend[res.numero] = res.alteracoes;
        });

        setPostosAtivos(estados);
        setStatusMateriaisA(statusA);
        setStatusMateriaisB(statusB);
        setAlteracoesPendentes(altPend);
        setBolsaAphAusente(statusAphAusente);
        setWhiteMedAusente(statusWhiteMedAusente);
      } catch (error) {
        console.error("Erro ao carregar postos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPostos();
  }, [user, authLoading]);

  const handleToggleAtivo = async (postoNumero: number) => {
    try {
      const atual = postosAtivos[postoNumero];
      const novo = !atual;
      setPostosAtivos((prev) => ({
        ...prev,
        [postoNumero]: novo,
      }));
      await setPostoAtivo(postoNumero as NumeroPosto, novo);
    } catch (error) {
      console.error("Erro ao atualizar posto:", error);
    }
  };

  const handleMaterialClick = (postoNumero: number, material: MaterialKey) => {
    if (
      material === "binoculo" ||
      material === "guardassol" ||
      material === "radio"
    ) {
      navigate(`/postos/${postoNumero}/materiais/${material}`);
      return;
    }

    if (material === "whitemed") {
      navigate(`/postos/${postoNumero}/whitemed`);
      return;
    }
    if (material === "bolsaAph") {
      navigate(`/postos/${postoNumero}/bolsa-aph`);
      return;
    }
    if (material === "outros") {
      navigate(`/postos/${postoNumero}/outros`);
      return;
    }

    if (material === "alteracoes") {
      navigate(`/postos/${postoNumero}/alteracoes`);
      return;
    }
  };

  if (authLoading || loading) {
    return <p className="text-gray-600">Carregando postos...</p>;
  }

  if (!user) {
    return (
      <p className="text-red-600">
        Você precisa estar autenticado para ver os postos.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {POSTOS_FIXOS.map((numero) => (
          <CardPosto
            key={numero}
            postoNumero={numero}
            ativo={postosAtivos[numero]}
            statusBinoculo={statusMateriaisA[numero]?.binoculo ?? "ausente"}
            statusGuardassol={statusMateriaisA[numero]?.guardassol ?? "ausente"}
            statusRadio={statusMateriaisA[numero]?.radio ?? "ausente"}
            statusWhitemed={statusMateriaisB[numero]?.whitemed ?? "ok"}
            statusBolsaAph={statusMateriaisB[numero]?.bolsaAph ?? "ok"}
            statusOutros={statusMateriaisB[numero]?.outros ?? "ok"}
            bolsaAphAusente={bolsaAphAusente[numero] ?? false}
            whiteMedAusente={whiteMedAusente[numero] ?? false}
            temAlteracoesPendentes={alteracoesPendentes[numero] ?? false}
            onToggleAtivo={() => handleToggleAtivo(numero)}
            onMaterialClick={(material) =>
              handleMaterialClick(numero, material as MaterialKey)
            }
          />
        ))}
      </div>
    </div>
  );
};
