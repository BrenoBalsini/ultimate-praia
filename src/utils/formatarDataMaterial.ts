// Formata timestamp para data curta (ex: 07/12/25)
export const formatarDataMaterial = (numero: number): string => {
  const data = new Date(numero);
  
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2); // Últimos 2 dígitos
  
  return `${dia}/${mes}/${ano}`;
};

// Formata label completo (ex: "Binóculo #07/12/25")
export const formatarLabelMaterial = (tipo: string, numero: number): string => {
  const labels: Record<string, string> = {
    binoculo: 'Binóculo',
    guardassol: 'Guarda-sol',
    radio: 'Rádio',
  };
  
  return `${labels[tipo] || tipo} #${formatarDataMaterial(numero)}`;
};
