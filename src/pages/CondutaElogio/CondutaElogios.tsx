import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { FormCondutaElogio } from '../../components/CondutaElogio/FormCondutaElogio';
import { ListaCondutaElogios } from '../../components/CondutaElogio/ListaCondutaElogios';
import { AlertCircle, Award } from 'lucide-react';
import type { CondutaElogio } from '../../types/conduta';
import type { GVC } from '../../services/gvcService';
import {
  criarCondutaElogio,
  obterCondutasElogios,
  deletarCondutaElogio,
} from '../../services/condutaService';
import { obterGVCs } from '../../services/gvcService';
import { useAuth } from '../../hooks/useAuth';

type Filtro = 'todos' | 'conduta' | 'elogio';

export const CondutaElogios = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CondutaElogio[]>([]);
  const [gvcs, setGvcs] = useState<GVC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState<'conduta' | 'elogio'>('conduta');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // Carregar dados ao montar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [condutasElogios, gvcsData] = await Promise.all([
        obterCondutasElogios(),
        obterGVCs(),
      ]);
      setItems(condutasElogios);
      setGvcs(gvcsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbrirForm = (tipo: 'conduta' | 'elogio') => {
    setTipoForm(tipo);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (data: Omit<CondutaElogio, 'id' | 'criadoEm' | 'criadoPor'>) => {
    try {
      const novoItem = await criarCondutaElogio(data, user?.email || undefined);
      setItems((prev) => [novoItem, ...prev]);
    } catch (error) {
      console.error('Erro ao criar conduta/elogio:', error);
      throw error;
    }
  };

  const handleDeletar = (item: CondutaElogio) => {
    if (!item.id) return;

    const tipoTexto = item.tipo === 'conduta' ? 'a conduta' : 'o elogio';
    if (window.confirm(`Tem certeza que deseja deletar ${tipoTexto}?`)) {
      deletarCondutaElogio(item.id)
        .then(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        })
        .catch((error) => {
          console.error('Erro ao deletar:', error);
          alert('Erro ao deletar. Tente novamente.');
        });
    }
  };

  // Filtrar items
  const itemsFiltrados = items.filter((item) => {
    if (filtro === 'todos') return true;
    return item.tipo === filtro;
  });

  // Estatísticas
  const totalCondutas = items.filter((i) => i.tipo === 'conduta').length;
  const totalElogios = items.filter((i) => i.tipo === 'elogio').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-2xl font-bold text-gray-900">Conduta e Elogios</h1>
              <p className="text-gray-600">
                Registre condutas e elogios dos guarda-vidas
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleAbrirForm('conduta')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <AlertCircle size={18} />
                Nova Conduta
              </button>
              <button
                type="button"
                onClick={() => handleAbrirForm('elogio')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <Award size={18} />
                Novo Elogio
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 mb-1">Condutas</p>
              <p className="text-2xl font-bold text-red-600">{totalCondutas}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 mb-1">Elogios</p>
              <p className="text-2xl font-bold text-green-600">{totalElogios}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filtro === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltro('conduta')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filtro === 'conduta'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Condutas ({totalCondutas})
            </button>
            <button
              type="button"
              onClick={() => setFiltro('elogio')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filtro === 'elogio'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Elogios ({totalElogios})
            </button>
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Carregando registros...</p>
            </div>
          ) : (
            <ListaCondutaElogios items={itemsFiltrados} onDelete={handleDeletar} />
          )}
        </div>
      </div>

      {/* Modal do Formulário */}
      <FormCondutaElogio
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        tipo={tipoForm}
        gvcsDisponiveis={gvcs}
      />
    </div>
  );
};
