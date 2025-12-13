import { useState, useEffect } from "react";
import { X, AlertCircle, FileText } from "lucide-react";

interface ModalRegistrarFaltaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    materialId: string;
    observacao?: string;
  }) => Promise<void>;
  materiais: Array<{ id: string; nome: string }>;
}

export const ModalRegistrarFalta = ({
  isOpen,
  onClose,
  onSubmit,
  materiais,
}: ModalRegistrarFaltaProps) => {
  const [materialId, setMaterialId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMaterialId("");
      setObservacao("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        materialId,
        observacao: observacao.trim() || undefined,
      });

      setMaterialId("");
      setObservacao("");
      onClose();
    } catch (error) {
      console.error("Erro ao registrar falta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Registrar Falta
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {materiais.length === 0 ? (
            <p className="text-sm text-gray-600">
              Não há materiais cadastrados nesta categoria. Use "Lista de
              Materiais" para cadastrar.
            </p>
          ) : (
            <>
              {/* Dropdown de Material */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Material em Falta
                </label>
                <select
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Selecione o material...</option>
                  {materiais.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observação */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  Observação (opcional)
                </label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none transition-colors resize-none"
                  placeholder="Detalhes sobre a falta..."
                  rows={3}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !materialId}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Registrando..." : "Registrar"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
