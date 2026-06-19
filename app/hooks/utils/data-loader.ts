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


export function isValidResult<T>(
  result: { data?: T | null; error?: string | null }
): boolean {
  return !result.error && !!result.data;
}


export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}
