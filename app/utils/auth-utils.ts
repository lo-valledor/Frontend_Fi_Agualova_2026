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
  console.log('🔑 Token obtenido del localStorage:', token ? 'Sí' : 'No');

  if (!token) {
    console.log('❌ No hay token en localStorage');
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    console.log('🔓 Token decodificado:', decoded);

    // Check if the token is expired
    if (decoded.exp * 1000 < Date.now()) {
      console.log('⏰ Token expirado, removiendo del localStorage');
      localStorage.removeItem('token');
      return null;
    }

    console.log('✅ Token válido, usuario autenticado:', {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    });

    return decoded;
  } catch (error) {
    console.error('❌ Failed to decode token:', error);
    localStorage.removeItem('token');
    return null;
  }
}
