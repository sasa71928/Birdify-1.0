export class AppError extends Error {
  constructor(public message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: any): AppError => {
  console.error('[AppError]:', error);
  if (error instanceof AppError) return error;
  return new AppError(error?.message || 'Ha ocurrido un error inesperado', error?.code);
};
