import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { FormGVC } from "../../components/GVC/FormGVC";
import { ListaGVCTable } from "../../components/GVC/ListarGVCTable";
import {
  type GVC,
  criarGVC,
  obterGVCs,
  atualizarGVC,
} from "../../services/gvcService";
import { Users, Plus } from "lucide-react";

export const ListarGVC = () => {
  const [gvcs, setGvcs] = useState<GVC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gvcEmEdicao, setGvcEmEdicao] = useState<GVC | undefined>();
  const navigate = useNavigate();

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

  const handleSubmitForm = async (formData: Omit<GVC, "id">) => {
    try {
      if (gvcEmEdicao?.id) {
        await atualizarGVC(gvcEmEdicao.id, formData);
        setGvcs((prev) =>
          prev.map((gvc) =>
            gvc.id === gvcEmEdicao.id ? { ...gvc, ...formData } : gvc
          )
        );
      } else {
        const novoGVC = await criarGVC(formData);
        setGvcs((prev) => [novoGVC, ...prev]);
      }
    } catch (error) {
      console.error("Erro ao salvar GVC:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header Simplificado */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                    Guarda-Vidas (GVC)
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Gerenciamento de efetivo operacional
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdicionarGVC}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A5F] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Novo GVC
              </button>
            </div>


          </div>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Carregando GVCs...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <ListaGVCTable
              gvcs={gvcs}
              totalGvcs={gvcs.length}
              onNavigateToDetails={(gvcId) => navigate(`/gvcs/${gvcId}`)}
            />
          </div>
        )}
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
          carregarGVCs();
        }}
      />
    </div>
  );
};
