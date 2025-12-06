import { useState, useEffect } from "react";
import { X, User, Hash, Power, AlertCircle } from "lucide-react";
import {
  type GVC,
  obterProximaPosicao,
  posicaoJaExiste,
} from "../../services/gvcService";

interface FormGVCProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gvc: Omit<GVC, "id">) => Promise<void>;
  gvcInicial?: GVC;
  isEditing?: boolean;
  permitirCadastroEmLote?: boolean;
  onNovoGVCAdicionado?: () => void;
}

export const FormGVC = ({
  isOpen,
  onClose,
  onSubmit,
  gvcInicial,
  isEditing = false,
  permitirCadastroEmLote = false,
  onNovoGVCAdicionado,
}: FormGVCProps) => {
  const [formData, setFormData] = useState<Omit<GVC, "id">>({
    nome: gvcInicial?.nome || "",
    posicao: gvcInicial?.posicao || 1,
    status: gvcInicial?.status || "ativo",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && isEditing && gvcInicial) {
      setFormData({
        nome: gvcInicial.nome,
        posicao: gvcInicial.posicao,
        status: gvcInicial.status,
      });
      setError("");
    } else if (isOpen && !isEditing) {
      carregarProximaPosicaoData();
      setFormData({
        nome: "",
        posicao: 1,
        status: "ativo",
      });
      setError("");
    }
  }, [isOpen, gvcInicial, isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const carregarProximaPosicaoData = async () => {
    try {
      const posicao = await obterProximaPosicao();
      setFormData((prev) => ({ ...prev, posicao }));
    } catch (error) {
      console.error("Erro ao carregar próxima posição:", error);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    const posicaoExiste = await posicaoJaExiste(formData.posicao);
    if (!isEditing && posicaoExiste) {
      setError("Esta posição já está sendo usada por outro GVC");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);

      if (!isEditing && permitirCadastroEmLote) {
        setFormData((prev) => ({
          nome: "",
          posicao: prev.posicao + 1,
          status: "ativo",
        }));
        onNovoGVCAdicionado?.();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar GVC:", error);
      setError("Erro ao salvar GVC. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? "Editar GVC" : "Novo GVC"}
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
          <div className="px-6 py-6 space-y-5">
            {/* Erro */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                Nome Completo
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Digite o nome completo do guarda-vidas"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>

            {/* Posição e Status (Grid 2 Colunas) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Posição */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  Posição
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  placeholder="1"
                  value={formData.posicao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      posicao: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors"
                />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <Power className="w-4 h-4 text-gray-500" />
                  Status
                  <span className="text-red-600">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-colors cursor-pointer"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "ativo" | "inativo",
                    })
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar GVC"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
