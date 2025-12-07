import { Calendar, User } from "lucide-react";
import type { ItemOutro } from "../../services/outrosService";

interface HistoricoEntregasProps {
  entregas: ItemOutro[];
  isLoading: boolean;
}

export const HistoricoEntregas = ({
  entregas,
  isLoading,
}: HistoricoEntregasProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (entregas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">
          Nenhum registro encontrado
        </p>
      </div>
    );
  }

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-2">
      {entregas.map((entrega) => (
        <div
          key={entrega.id}
          className="border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors"
        >
          <div className="px-4 py-3">
            {/* Linha Principal */}
            <div className="flex items-center justify-between">
              {/* Nome do Material */}
              <div className="flex-1">
                <span className="font-semibold text-gray-900">
                  {entrega.nomeItem}
                </span>
              </div>

              {/* Dados da Entrega */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Qtd:</span>
                  <span className="font-semibold text-gray-900">
                    {entrega.quantidadeEntregue}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatarData(entrega.dataEntrega)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>{entrega.criadoPor}</span>
                </div>
              </div>
            </div>

            {/* Observação (se tiver) */}
            {entrega.observacao && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {entrega.observacao}
                </p>
              </div>
            )}

            {/* Rodapé com hora do registro */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-400">
                Registrado em {formatarData(entrega.criadoEm)} às {formatarHora(entrega.criadoEm)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
