/**
 * Generic Data Loader Utility
 *
 * Provides a reusable function for loading data with consistent error handling.
 * Used across administration, mantencion, monitor, and operaciones hooks.
 */

/**
 * Generic handler for loading data asynchronously
 *
 * Encapsulates try/catch/finally pattern with state management
 * to avoid duplication across multiple data-loading hooks.
 *
 * @template T - Type of data being loaded
 * @template R - Optional type transformation (defaults to T)
 * @param fetchFn - Async function that returns { data?, error? }
 * @param setData - State setter for processed data
 * @param setError - State setter for error message
 * @param setLoading - State setter for loading state
 * @returns Promise that resolves when loading completes
 *
 * @example
 * ```typescript
 * await handleDataLoad(
 *   () => service.getData(),
 *   setData,
 *   setError,
 *   setLoading
 * );
 * ```
 */
export async function handleDataLoad<T, R = T>(
  fetchFn: () => Promise<{ data?: T | null; error?: string | null }>,
  setData: (data: R | null) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
): Promise<void> {
  try {
    setLoading(true);
    setError(null);

    const result = await fetchFn();

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      setData(result.data as R);
      return;
    }

    setError('No se pudieron cargar los datos');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}

/**
 * Validates that result has both data and no error
 *
 * @param result - Result object from fetch
 * @param result.data
 * @param result.error
 * @returns true if result is valid (has data and no error)
 */
export function isValidResult<T>(
  result: { data?: T | null; error?: string | null }
): boolean {
  return !result.error && !!result.data;
}

/**
 * Extracts error message from result or catch block
 *
 * @param error - Error from result or catch block
 * @returns Formatted error message
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}
