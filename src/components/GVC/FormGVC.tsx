import { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import {
  type GVC,
  obterProximaPosicao,
  posicaoJaExiste,
} from "../../services/gvcService";
import { toaster } from "../ui/toasterExport";

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
      toaster.create({
        title: "Preencha o nome",
        type: "error",
        duration: 3000,
      });
      return;
    }

    const posicaoExiste = await posicaoJaExiste(formData.posicao);
    if (!isEditing && posicaoExiste) {
      toaster.create({
        title: `Posição ${formData.posicao} já existe!`,
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);

      toaster.create({
        title: isEditing
          ? "GVC atualizado com sucesso"
          : "GVC criado com sucesso",
        type: "success",
        duration: 2000,
      });

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
      toaster.create({
        title: "Erro ao salvar GVC",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop escuro */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 40,
        }}
        onClick={onClose}
      ></div>

      {/* Modal centralizado */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            width: "100%",
            maxWidth: "28rem",
            maxHeight: "90vh",
            overflowY: "auto",
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              borderBottom: "1px solid #e5e7eb",
              padding: "1.5rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              {isEditing ? "Editar GVC" : "Novo GVC"}
            </h2>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#9ca3af",
                fontSize: "1.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4b5563")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              title="Fechar (ESC)"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            {/* Campo Nome */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Nome Completo{" "}
                <span style={{ color: "#dc2626", fontWeight: "bold" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>

            {/* Campo Posição */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Posição{" "}
                <span style={{ color: "#dc2626", fontWeight: "bold" }}>*</span>
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
                min="1"
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                  lineHeight: "1.5",
                }}
              >
                📍 Posição do GVC (1º melhor colocado, 2º segundo, etc)
              </p>
            </div>

            {/* Campo Status */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Status{" "}
                <span style={{ color: "#dc2626", fontWeight: "bold" }}>*</span>
              </label>
              <select
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  color: "#111827",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
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
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: "1rem 1.5rem",
              display: "flex",
              gap: "0.75rem",
              flexDirection: "column",
              backgroundColor: "#f9fafb",
              borderBottomLeftRadius: "0.5rem",
              borderBottomRightRadius: "0.5rem",
            }}
          >
            <Button
              w="full"
              colorScheme="blue"
              onClick={handleSubmit}
              loading={isLoading}
            >
              {isEditing ? "Atualizar" : "Criar"}
            </Button>
            <Button w="full" variant="outline" onClick={onClose}>
              {permitirCadastroEmLote && !isEditing ? "Pronto" : "Cancelar"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
