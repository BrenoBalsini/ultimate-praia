import { Timestamp } from 'firebase/firestore';

export interface CondutaElogio {
  id?: string;
  tipo: 'conduta' | 'elogio';
  descricao: string;
  gvcIds: string[]; // IDs dos GVCs selecionados
  gvcNomes: string[]; // Nomes dos GVCs para exibição
  criadoEm?: Timestamp;
  criadoPor?: string; // Email do usuário que criou
}
