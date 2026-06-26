import { jwtDecode } from 'jwt-decode';

import { clearAuthToken, getAuthToken } from '~/services/axiosConfig';

export interface DecodedToken {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  uid?: string;
  Permiso?: string[];
  iss?: string;
  aud?: string;
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
