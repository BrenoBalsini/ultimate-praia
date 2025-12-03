import type { JSX } from 'react';
import toast, { type Toast } from 'react-hot-toast';

/**
 * Interface que define a estrutura do hook de toast retornado.
 */
interface ToastHook {
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  custom: (message: string, icon: string, bgColor: string) => string;
  toast: (message: string | JSX.Element, options?: Partial<Toast>) => string;
}

/**
 * Hook customizado para encapsular a lógica de exibição de toasts com tipagem.
 * Ele padroniza a duração e a posição e permite o uso de títulos.
 * @returns {ToastHook} Funções para exibir diferentes tipos de toasts.
 */
export const useToast = (): ToastHook => {
  
  // Função de sucesso com suporte a título
  const success = (message: string, title?: string) => 
    toast.success(title ? `${title}\n${message}` : message, {
      duration: 4000,
      position: 'top-right',
    });

  // Função de erro com suporte a título
  const error = (message: string, title?: string) => 
    toast.error(title ? `${title}\n${message}` : message, {
      duration: 5000,
      position: 'top-right',
    });

  // Função de alerta (warning), agora com tipagem e cor definida
  const warning = (message: string, title?: string) => 
    toast(title ? `${title}\n${message}` : message, {
      icon: '⚠️',
      style: {
        // Estilo customizado para o alerta (Amarelo/Âmbar)
        background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: 'white',
      },
      duration: 4000,
    });

  // Função customizada para máxima flexibilidade com ícone e cor de fundo
  const custom = (message: string, icon: string, bgColor: string) => 
    toast(message, {
      icon,
      style: {
        background: bgColor,
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
      },
    });

  // Toast genérico (padrão)
  const toastWithOptions = (message: string | JSX.Element, options?: Partial<Toast>) => 
    toast(message, options);

  return { success, error, warning, custom, toast: toastWithOptions };
};
