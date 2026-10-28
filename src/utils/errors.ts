export class AppError extends Error {
  constructor(public message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Normaliza cualquier error capturado a una instancia de AppError.
 */
export const toAppError = (error: any): AppError => {
  if (error instanceof AppError) return error;
  return new AppError(error?.message || 'Ha ocurrido un error inesperado', error?.code);
};

// Alias de retrocompatibilidad
export const handleError = toAppError;
