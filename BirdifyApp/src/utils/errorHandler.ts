import React from 'react';

type ToastSetter = React.Dispatch<React.SetStateAction<{
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}>>;

/**
 * Utility function to handle errors and show toast messages
 * @param error - The error object or message
 * @param showToast - Function to set toast state
 * @param customMessage - Optional custom error message
 */
export function handleError(
  error: any,
  showToast?: ToastSetter,
  customMessage?: string
): string {
  const errorMessage = customMessage || 
    (error?.message) || 
    (typeof error === 'string' ? error : 
    'Ocurrió un error inesperado');
  
  console.error('Error:', error);
  
  if (showToast) {
    showToast({
      visible: true,
      message: errorMessage,
      type: 'error',
    });
  }
  
  return errorMessage;
}

/**
 * Utility function to show success toast messages
 * @param message - Success message
 * @param showToast - Function to set toast state
 */
export function showSuccess(
  message: string,
  showToast: ToastSetter
): void {
  showToast({
    visible: true,
    message,
    type: 'success',
  });
}
