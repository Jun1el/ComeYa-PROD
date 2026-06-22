'use client';
import { ColdStartError } from '@/lib/api/client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
    </div>
  );
}

export function ApiLoading({ children, isLoading, error, isError, onRetry }) {
  if (isError) {
    if (error instanceof ColdStartError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="font-semibold text-red-600">El backend no respondió a tiempo</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 rounded-lg bg-brand-accent text-white font-semibold"
            >
              Reintentar
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600">Error al cargar datos</p>
        <p className="text-sm text-gray-500 mt-2">{error?.message || 'Intenta nuevamente'}</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return children;
}

export function ColdStartBanner() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
        <p className="text-yellow-800 text-sm">
          Conectando con el servidor... La primera carga puede tardar hasta 60 segundos.
        </p>
      </div>
    </div>
  );
}
