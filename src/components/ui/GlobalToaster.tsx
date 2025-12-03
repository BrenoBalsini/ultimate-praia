import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Componente que configura globalmente o react-hot-toast.
 * Deve ser renderizado uma única vez na raiz da aplicação (ex: em App.tsx).
 * @returns {JSX.Element} O componente Toaster configurado.
 */
export const GlobalToaster: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      // Estilo do container global do toast
      containerStyle={{
        top: 80, 
        padding: '16px',
      }}
      toastOptions={{
        // ------------------ ESTILO BASE (APLICADO A TODOS) ------------------
        style: {
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '16px 20px',
          fontWeight: '500',
          maxWidth: '300px',
        },
        duration: 4000,

        // ------------------ ESTILO ESPECÍFICO DE SUCESSO ------------------
        success: {
          icon: '✅',
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)', // Cores para Sucesso (Verde)
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'white',
          },
        },
        // ------------------ ESTILO ESPECÍFICO DE ERRO ------------------
        error: {
          icon: '❌',
          style: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)', // Cores para Erro (Vermelho)
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'white',
          },
        },
      }}
    />
  );
};
