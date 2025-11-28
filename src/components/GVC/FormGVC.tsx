import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isOpen && isEditing && gvcInicial) {
      setFormData({
        nome: gvcInicial.nome,
        posicao: gvcInicial.posicao,
        status: gvcInicial.status,
      });
    } else if (isOpen && !isEditing) {
      carregarProximaPosicaoData(); // Chama para preencher a nova posição
      setFormData({
        nome: "",
        posicao: 1,
        status: "ativo",
      });
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
    if (!formData.nome.trim()) {
      return;
    }

    const posicaoExiste = await posicaoJaExiste(formData.posicao);
    if (!isEditing && posicaoExiste) {

      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);

      if (!isEditing && permitirCadastroEmLote) {
        setFormData((prev) => ({
          ...prev,
          nome: "",
          posicao: prev.posicao + 1,
        }));
        onNovoGVCAdicionado?.();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar GVC:", error);

    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
<>
  {/* Backdrop escuro */}
  <div
    className="fixed inset-0 bg-black/50 z-40"
    onClick={onClose}
  />

  {/* Modal centralizado */}
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
  >
    <div
      className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {isEditing ? "Editar GVC" : "Novo GVC"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 text-2xl font-bold hover:text-gray-600 transition-colors"
          title="Fechar (ESC)"
          type="button"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-6 flex flex-col gap-5">
        {/* Campo Nome */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Nome Completo{" "}
            <span className="text-red-600 font-bold">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: João Silva"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value })
            }
            autoFocus
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Campo Posição */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Posição{" "}
            <span className="text-red-600 font-bold">*</span>
          </label>
          <input
            type="number"
            placeholder="1, 2, 3..."
            value={formData.posicao}
            onChange={(e) =>
              setFormData({
                ...formData,
                posicao: parseInt(e.target.value) || 1,
              })
            }
            min={1}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm box-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            📍 Posição do GVC (1º melhor colocado, 2º segundo, etc)
          </p>
        </div>

        {/* Campo Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Status{" "}
            <span className="text-red-600 font-bold">*</span>
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 box-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "ativo" | "inativo",
              })
            }
          >
            <option value="ativo">✓ Ativo</option>
            <option value="inativo">✗ Inativo</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 flex flex-col gap-3 bg-gray-50 rounded-b-lg">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {permitirCadastroEmLote && !isEditing ? "Pronto" : "Cancelar"}
        </button>
      </div>
    </div>
  </div>
</>
  );
};
