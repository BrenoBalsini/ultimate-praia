import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

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
import { toaster } from "../../components/ui/toasterExport";

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
      toaster.create({
        title: "Erro ao carregar GVCs",
        type: "error",
        duration: 3000,
      });
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
          toaster.create({
            title: "GVC deletado com sucesso",
            type: "success",
            duration: 2000,
          });
        })
        .catch((error) => {
          console.error("Erro ao deletar GVC:", error);
          toaster.create({
            title: "Erro ao deletar GVC",
            type: "error",
            duration: 3000,
          });
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
        toaster.create({
          title: `GVC ${novoStatus === "ativo" ? "ativado" : "desativado"}`,
          type: "success",
          duration: 2000,
        });
      })
      .catch((error) => {
        console.error("Erro ao alterar status:", error);
        toaster.create({
          title: "Erro ao alterar status",
          type: "error",
          duration: 3000,
        });
      });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />

      <Box px={6} py={8} maxW="1200px" mx="auto">
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="start"
          >
            <VStack align="start" gap={1}>
              <Heading size="lg">Guarda-Vidas (GVC)</Heading>
              <Text color="gray.600">
                Gerencie todos os guarda-vidas do sistema
              </Text>
            </VStack>

            <Button colorScheme="blue" onClick={handleAdicionarGVC} size="lg">
              + Novo GVC
            </Button>
          </Stack>

          {/* Conteúdo */}
          {isLoading ? (
            <Box textAlign="center" py={12}>
              <Spinner size="lg" mb={4} />
              <Text color="gray.600">Carregando GVCs...</Text>
            </Box>
          ) : (
            <ListaGVCTable
              gvcs={gvcs}
              onEdit={handleEditarGVC}
              onDelete={handleDeletarGVC}
              onToggleStatus={handleToggleStatusGVC}
            />
          )}
        </VStack>
      </Box>

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
    </Box>
  );
};
