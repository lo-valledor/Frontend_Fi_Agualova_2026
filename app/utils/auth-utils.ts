import { jwtDecode } from 'jwt-decode';

import { clearAuthToken, getAuthToken } from '~/services/axiosConfig';

interface DecodedToken {
  id: string;
  username: string;
  profileId: string;
  fullName: string;
  role: string;
  iat: number;
  exp: number;
}

export function getAuthenticatedUser(): DecodedToken | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (decoded.exp * 1000 < Date.now()) {
      clearAuthToken();
      return null;
    }

    return decoded;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error decoding token:', error);
    clearAuthToken();
    return null;
  }
}
