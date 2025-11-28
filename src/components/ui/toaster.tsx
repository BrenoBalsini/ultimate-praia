"use client";
import { Toaster as HotToaster, toast, ToastBar } from "react-hot-toast";
import { X } from "lucide-react";

export const toaster = () => {
  return (
    <HotToaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        className:
          "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3",
      }}
    >
      {(t) => {
        const typed = t as any; // para acessar title/description/action se você mandar no toast
        const isLoading = t.type === "loading";

        return (
          <ToastBar toast={t}>
            {({ icon }) => (
              <div className="flex items-start gap-3 w-full max-w-sm">
                {/* Ícone / spinner */}
                <div className="mt-1">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    icon
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  {typed.title && (
                    <div className="font-semibold text-sm truncate">
                      {typed.title}
                    </div>
                  )}
                  {typed.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 break-words">
                      {typed.description}
                    </div>
                  )}
                  {typed.action && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={typed.action.onClick}
                    >
                      {typed.action.label}
                    </button>
                  )}
                </div>

                {/* Close */}
                {typed.closable !== false && (
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        );
      }}
    </HotToaster>
  );
};
