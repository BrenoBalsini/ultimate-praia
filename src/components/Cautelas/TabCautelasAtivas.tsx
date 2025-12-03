import type { GVC } from '../../services/gvcService';

interface TabCautelasAtivasProps {
  gvcs: GVC[];
  onSelectGVC: (gvc: GVC) => void;
}

export const TabCautelasAtivas = ({ gvcs, onSelectGVC }: TabCautelasAtivasProps) => {
  const gvcsAtivos = gvcs.filter((gvc) => gvc.status === 'ativo');

  if (gvcsAtivos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Nenhum guarda-vidas ativo cadastrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {gvcsAtivos.map((gvc) => (
        <button
          key={gvc.id}
          type="button"
          onClick={() => onSelectGVC(gvc)}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-center"
        >
          <p className="font-medium text-gray-900">{gvc.nome}</p>
        </button>
      ))}
    </div>
  );
};
