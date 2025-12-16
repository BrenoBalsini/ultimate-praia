import { useState, useEffect } from "react";
import { X, Target, Search, AlertCircle } from "lucide-react";
import type { GVC } from "../../services/gvcService";
import type { TipoConceito, PolaridadeConceito } from "../../types/alteracoes";
import { CONCEITOS_DISPONIVEIS } from "../../types/alteracoes";

interface FormConceitoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    gvcIds: string[];
    gvcNomes: string[];
    conceito: TipoConceito;
    polaridade: PolaridadeConceito;
    descricao: string;
  }) => Promise<void>;
  gvcsDisponiveis: GVC[];
}

export const FormConceito = ({
  isOpen,
  onClose,
  onSubmit,
  gvcsDisponiveis,
}: FormConceitoProps) => {
  const [gvcsSelecionados, setGvcsSelecionados] = useState<string[]>([]);
  const [conceito, setConceito] = useState<TipoConceito>("Assiduidade");
  const [polaridade, setPolaridade] = useState<PolaridadeConceito>("Positivo");
  const [descricao, setDescricao] = useState("");
  const [busca, setBusca] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setGvcsSelecionados([]);
      setConceito("Assiduidade");
      setPolaridade("Positivo");
      setDescricao("");
      setBusca("");
      setErro("");
    }
  }, [isOpen]);

  const handleToggleGVC = (gvcId: string) => {
    setGvcsSelecionados((prev) =>
      prev.includes(gvcId)
        ? prev.filter((id) => id !== gvcId)
        : [...prev, gvcId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (gvcsSelecionados.length === 0) {
      setErro("Selecione pelo menos um guarda-vidas");
      return;
    }

    if (!descricao.trim()) {
      setErro("A descrição é obrigatória");
      return;
    }

    try {
      setIsSubmitting(true);

      const gvcsNomes = gvcsDisponiveis
        .filter((gvc) => gvcsSelecionados.includes(gvc.id || ""))
        .map((gvc) => gvc.nome);

      await onSubmit({
        gvcIds: gvcsSelecionados,
        gvcNomes: gvcsNomes,
        conceito,
        polaridade,
        descricao: descricao.trim(),
      });

      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar GVCs pela busca
  const gvcsFiltrados = gvcsDisponiveis
    .filter((gvc) => gvc.status === "ativo")
    .filter((gvc) => gvc.nome.toLowerCase().includes(busca.toLowerCase()));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Adicionar Conceito
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
                title="Fechar (ESC)"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            {/* Erro */}
            {erro && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            {/* Conceito */}
            <div>
              <label
                htmlFor="conceito"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Conceito <span className="text-red-600">*</span>
              </label>
              <select
                id="conceito"
                value={conceito}
                onChange={(e) => setConceito(e.target.value as TipoConceito)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer"
              >
                {CONCEITOS_DISPONIVEIS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tipo <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Positivo"
                    checked={polaridade === "Positivo"}
                    onChange={(e) =>
                      setPolaridade(e.target.value as PolaridadeConceito)
                    }
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900">Positivo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Negativo"
                    checked={polaridade === "Negativo"}
                    onChange={(e) =>
                      setPolaridade(e.target.value as PolaridadeConceito)
                    }
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900">Negativo</span>
                </label>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Descrição <span className="text-red-600">*</span>
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                placeholder="Descreva o conceito..."
                disabled={isSubmitting}
              />
            </div>
            {/* Seleção de GVCs com Busca */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Guarda-Vidas <span className="text-red-600">*</span>
                <span className="ml-2 text-gray-500 font-normal">
                  ({gvcsSelecionados.length} selecionado
                  {gvcsSelecionados.length !== 1 ? "s" : ""})
                </span>
              </label>

              {/* Campo de Busca */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar guarda-vidas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              {/* Lista de GVCs */}
              <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                {gvcsFiltrados.length > 0 ? (
                  gvcsFiltrados.map((gvc) => (
                    <label
                      key={gvc.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={gvcsSelecionados.includes(gvc.id || "")}
                        onChange={() => handleToggleGVC(gvc.id || "")}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900">{gvc.nome}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-6">
                    {busca
                      ? "Nenhum guarda-vidas encontrado"
                      : "Nenhum guarda-vidas ativo disponível"}
                  </p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
