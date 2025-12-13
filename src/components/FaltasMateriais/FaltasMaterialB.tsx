import { useEffect, useState } from 'react';
import type { NumeroPosto, CategoriaMaterialB } from '../../types/postos';
import {
  listarMateriaisTipoB,
  type MaterialTipoBDoc,
} from '../../services/materiaisBService';
import {
  listarFaltasPorPostoECategoria,
  registrarFaltaMaterial,
  type FaltaMaterialDoc,
} from '../../services/faltasService';
import { registrarEventoFaltaMaterial } from '../../services/historicoService';
import { TipoEvento } from '../../types/postos';
import toast from 'react-hot-toast';
import { Plus, Package } from 'lucide-react';
import { ModalRegistrarFalta } from './ModalRegistrarFalta';

const LABEL_CATEGORIA: Record<CategoriaMaterialB, string> = {
  whitemed: 'Whitemed',
  bolsa_aph: 'Bolsa APH',
  outros: 'Outros',
};

interface FaltaItem extends FaltaMaterialDoc {
  id: string;
}

interface FaltasMaterialBProps {
  postoNumero: NumeroPosto;
  categoria: CategoriaMaterialB;
  onRealizarEntrega?: (falta: FaltaItem) => void;
  onFaltaRegistrada?: () => void;
}

export const FaltasMaterialB = ({ 
  postoNumero, 
  categoria,
  onRealizarEntrega,
  onFaltaRegistrada
}: FaltasMaterialBProps) => {
  const [listaMateriaisCategoria, setListaMateriaisCategoria] = useState<
    (MaterialTipoBDoc & { id: string })[]
  >([]);
  const [faltas, setFaltas] = useState<FaltaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalFaltaOpen, setIsModalFaltaOpen] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      const todos = await listarMateriaisTipoB();
      const daCategoria = todos.filter((m) => m.categoria === categoria);
      daCategoria.sort((a, b) => a.nome.localeCompare(b.nome));
      setListaMateriaisCategoria(daCategoria);

      const faltasAbertas = await listarFaltasPorPostoECategoria(postoNumero, categoria);
      faltasAbertas.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      setFaltas(faltasAbertas);
    } catch (error) {
      console.error('Erro ao carregar faltas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(postoNumero) && categoria) {
      carregar();
    }
  }, [postoNumero, categoria]);

  const handleSubmitFalta = async (data: {
    materialId: string;
    observacao?: string;
  }) => {
    try {
      const material = listaMateriaisCategoria.find((m) => m.id === data.materialId);
      if (!material) return;

      const faltaId = await registrarFaltaMaterial({
        materialTipoBId: material.id,
        materialNome: material.nome,
        categoria,
        postoNumero,
        observacaoRegistro: data.observacao,
      });

      await registrarEventoFaltaMaterial({
        tipoEvento: TipoEvento.FALTA_REGISTRADA,
        postoNumero,
        faltaMaterialId: faltaId,
        materialTipoBNome: material.nome,
        materialTipoBCategoria: categoria,
        observacao: data.observacao,
      });

      toast.success('Falta registrada com sucesso!');
      await carregar();
      
      // Notificar componente pai
      if (onFaltaRegistrada) {
        onFaltaRegistrada();
      }
    } catch (error) {
      console.error('Erro ao registrar falta:', error);
      toast.error('Erro ao registrar falta');
      throw error;
    }
  };

  const handleRealizarEntrega = (falta: FaltaItem) => {
    if (onRealizarEntrega) {
      onRealizarEntrega(falta);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Faltas de {LABEL_CATEGORIA[categoria]}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Registre e gerencie faltas de materiais
          </p>
        </div>
        <button
          onClick={() => setIsModalFaltaOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Registrar Falta
        </button>
      </div>

      {/* Lista de faltas em aberto */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 text-sm">Carregando faltas...</p>
          </div>
        ) : faltas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Nenhuma falta em aberto
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Todas as faltas foram resolvidas ou não há registros
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {faltas.map((f) => (
              <div
                key={f.id}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 hover:border-yellow-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900 mb-1">
                      {f.materialNome}
                    </p>
                    {f.observacaoRegistro && (
                      <p className="text-sm text-yellow-800 whitespace-pre-line">
                        {f.observacaoRegistro}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRealizarEntrega(f)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Realizar Entrega
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Registrar Falta */}
      <ModalRegistrarFalta
        isOpen={isModalFaltaOpen}
        onClose={() => setIsModalFaltaOpen(false)}
        onSubmit={handleSubmitFalta}
        materiais={listaMateriaisCategoria}
      />
    </div>
  );
};
