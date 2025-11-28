import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { FormGVC } from "../../components/GVC/FormGVC";
import { ListaGVCTable } from "../../components/GVC/ListarGVCTable";
import {
  type GVC,
  criarGVC,
  obterGVCs,
  atualizarGVC,
  deletarGVC,
  toggleStatusGVC,
} from "../../services/gvcService";

export const ListarGVC = () => {
  const [gvcs, setGvcs] = useState<GVC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gvcEmEdicao, setGvcEmEdicao] = useState<GVC | undefined>();

  // Carregar GVCs ao montar a página
  useEffect(() => {
    carregarGVCs();
  }, []);

  const carregarGVCs = async () => {
    try {
      setIsLoading(true);
      const dados = await obterGVCs();
      setGvcs(dados);
    } catch (error) {
      console.error("Erro ao carregar GVCs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdicionarGVC = () => {
    setGvcEmEdicao(undefined);
    setIsFormOpen(true);
  };

  const handleEditarGVC = (gvc: GVC) => {
    setGvcEmEdicao(gvc);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (formData: Omit<GVC, "id">) => {
    try {
      if (gvcEmEdicao?.id) {
        // Atualizar GVC existente
        await atualizarGVC(gvcEmEdicao.id, formData);
        setGvcs((prev) =>
          prev.map((gvc) =>
            gvc.id === gvcEmEdicao.id ? { ...gvc, ...formData } : gvc
          )
        );
      } else {
        // Criar novo GVC
        const novoGVC = await criarGVC(formData);
        setGvcs((prev) => [novoGVC, ...prev]);
      }
    } catch (error) {
      console.error("Erro ao salvar GVC:", error);
      throw error;
    }
  };

  const handleDeletarGVC = (gvc: GVC) => {
    if (!gvc.id) return;

    if (window.confirm(`Tem certeza que deseja deletar ${gvc.nome}?`)) {
      deletarGVC(gvc.id)
        .then(() => {
          setGvcs((prev) => prev.filter((g) => g.id !== gvc.id));
        })
        .catch((error) => {
          console.error("Erro ao deletar GVC:", error);
        });
    }
  };

  const handleToggleStatusGVC = (gvc: GVC) => {
    if (!gvc.id) return;

    toggleStatusGVC(gvc.id, gvc.status)
      .then((novoStatus) => {
        setGvcs((prev) =>
          prev.map((g) =>
            g.id === gvc.id
              ? { ...g, status: novoStatus as "ativo" | "inativo" }
              : g
          )
        );
      })
      .catch((error) => {
        console.error("Erro ao alterar status:", error);
      });
  };

 return (
  <div className="min-h-screen bg-gray-50">
    <Navbar />

    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Guarda-Vidas (GVC)
            </h1>
            <p className="text-gray-600">
              Gerencie todos os guarda-vidas do sistema
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdicionarGVC}
            className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Novo GVC
          </button>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Carregando GVCs...</p>
          </div>
        ) : (
          <ListaGVCTable
            gvcs={gvcs}
            onEdit={handleEditarGVC}
            onDelete={handleDeletarGVC}
            onToggleStatus={handleToggleStatusGVC}
          />
        )}
      </div>
    </div>

    {/* Modal do Formulário */}
    <FormGVC
      isOpen={isFormOpen}
      onClose={() => {
        setIsFormOpen(false);
        setGvcEmEdicao(undefined);
      }}
      onSubmit={handleSubmitForm}
      gvcInicial={gvcEmEdicao}
      isEditing={!!gvcEmEdicao?.id}
      permitirCadastroEmLote={!gvcEmEdicao?.id}
      onNovoGVCAdicionado={() => {
        // Recarregar lista após adicionar novo GVC
        carregarGVCs();
      }}
    />
  </div>
);
};