import { useState, useEffect } from "react";
import { X, Package, Calendar, FileText, Hash, ChevronDown } from "lucide-react";
import { obterMateriaisOutros } from "../../services/outrosService";
import { obterMateriaisBolsaAph } from "../../services/bolsaAphService";
import { obterMateriaisWhiteMed } from "../../services/whiteMedService"; // ✅ ADICIONAR

interface FormRegistrarEntregaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nomeItem: string;
    quantidadeEntregue: number;
    dataEntrega: Date;
    observacao?: string;
  }) => Promise<void>;
  postoNumero: number;
  categoria?: "outros" | "bolsaAph" | "whiteMed"; // ✅ ADICIONAR "whiteMed"
  materialPreenchido?: string;
}

export const FormRegistrarEntrega = ({
  isOpen,
  onClose,
  onSubmit,
  categoria = "outros",
  materialPreenchido,
}: FormRegistrarEntregaProps) => {
  const [nomeItem, setNomeItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dataEntrega, setDataEntrega] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [observacao, setObservacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState<string[]>([]);
  const [isLoadingMateriais, setIsLoadingMateriais] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarMateriais();
      
      // Se tem material preenchido, selecionar automaticamente
      if (materialPreenchido) {
        setNomeItem(materialPreenchido);
      } else {
        setNomeItem("");
      }
      
      // Resetar outros campos
      setQuantidade("");
      setDataEntrega(new Date().toISOString().split("T")[0]);
      setObservacao("");
    }
  }, [isOpen, categoria, materialPreenchido]);

  // ✅ ATUALIZAR ESTA FUNÇÃO
  const carregarMateriais = async () => {
    setIsLoadingMateriais(true);
    try {
      let materiais: string[] = [];
      
      if (categoria === "bolsaAph") {
        materiais = await obterMateriaisBolsaAph();
      } else if (categoria === "whiteMed") {
        materiais = await obterMateriaisWhiteMed();
      } else {
        materiais = await obterMateriaisOutros();
      }
      
      setMateriaisDisponiveis(materiais);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    } finally {
      setIsLoadingMateriais(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeItem || !quantidade) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        nomeItem: nomeItem,
        quantidadeEntregue: Number(quantidade),
        dataEntrega: new Date(dataEntrega),
        observacao: observacao.trim() || undefined,
      });
      
      // Limpar formulário
      setNomeItem("");
      setQuantidade("");
      setDataEntrega(new Date().toISOString().split("T")[0]);
      setObservacao("");
      onClose();
    } catch (error) {
      console.error("Erro ao registrar entrega:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Registrar Entrega
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
          {/* Dropdown de Material */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Package className="w-4 h-4 text-[#1E3A5F]" />
              Material
            </label>
            <div className="relative">
              <select
                value={nomeItem}
                onChange={(e) => setNomeItem(e.target.value)}
                disabled={isLoadingMateriais || !!materialPreenchido}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {isLoadingMateriais ? "Carregando..." : "Selecione um material"}
                </option>
                {materiaisDisponiveis.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {materialPreenchido && (
              <p className="text-xs text-gray-500 mt-1">
                Material pré-selecionado da falta
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Hash className="w-4 h-4 text-[#1E3A5F]" />
              Quantidade Entregue
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:outline-none transition-colors"
              placeholder="Ex: 2"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-[#1E3A5F]" />
              Data da Entrega
            </label>
            <input
              type="date"
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Observação */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-[#1E3A5F]" />
              Observação (opcional)
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] focus:outline-none transition-colors resize-none"
              placeholder="Detalhes adicionais..."
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
              disabled={isSubmitting || isLoadingMateriais}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Salvando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
