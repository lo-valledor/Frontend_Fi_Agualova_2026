// Utilidades para validar autenticación en clientLoaders
export const checkAuthBeforeLoader = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found in clientLoader, skipping API calls');
    throw new Error('No authentication token found');
  }
  return token;
};

export const createUnauthenticatedLoaderResponse = (error: Error) => {
  return {
    error: error,
    data: null,
  };
};

// Wrapper para clientLoaders que necesitan autenticación
export const withAuthCheck = async <T>(
  loaderFunction: () => Promise<T>,
): Promise<T | { error: Error; data: null }> => {
  try {
    checkAuthBeforeLoader();
    return await loaderFunction();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'No authentication token found'
    ) {
      return createUnauthenticatedLoaderResponse(error);
    }
    throw error;
  }
};
