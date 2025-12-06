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

type MaterialKey =
  | "binoculo"
  | "guardassol"
  | "radio"
  | "whitemed"
  | "bolsaAph"
  | "limpeza"
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
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }
      try {
        await initPostosIfNeeded();

        const estados: Record<number, boolean> = {};
        const statusA: StatusMateriaisAByPosto = {};
        const statusB: StatusMateriaisBByPosto = {};
        const altPend: AlteracoesByPosto = {};

        for (const numero of POSTOS_FIXOS) {
          const posto = await getPostoByNumero(numero as NumeroPosto);
          estados[numero] = posto?.ativo ?? true;

          const statusAposto = await calcularStatusMateriaisAParaPosto(
            numero as NumeroPosto
          );
          statusA[numero] = {
            binoculo: statusAposto.binoculo,
            guardassol: statusAposto.guardassol,
            radio: statusAposto.radio,
          };

          const statusBposto = await calcularStatusMateriaisBParaPosto(
            numero as NumeroPosto
          );
          statusB[numero] = statusBposto;

          const temAlt = await temAlteracoesPendentes(numero as NumeroPosto);
          altPend[numero] = temAlt;
        }

        setPostosAtivos(estados);
        setStatusMateriaisA(statusA);
        setStatusMateriaisB(statusB);
        setAlteracoesPendentes(altPend);
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
      navigate(`/postos/${postoNumero}/faltas/whitemed`);
      return;
    }
    if (material === "bolsaAph") {
      navigate(`/postos/${postoNumero}/faltas/bolsa_aph`);
      return;
    }
    if (material === "limpeza") {
      navigate(`/postos/${postoNumero}/faltas/limpeza`);
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
            statusLimpeza={statusMateriaisB[numero]?.limpeza ?? "ok"}
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
