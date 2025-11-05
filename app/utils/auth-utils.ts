import { jwtDecode } from 'jwt-decode';

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
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    // Check if the token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return null;
  }
}
