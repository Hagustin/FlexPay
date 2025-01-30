import { JwtPayload, jwtDecode } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
  id: string; // ✅ Explicitly define the expected structure
}

class AuthService {
  getProfile(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token); // ✅ Use the custom interface
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string) {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return decoded.exp ? Date.now() >= decoded.exp * 1000 : false;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  getToken(): string {
    return localStorage.getItem('id_token') || '';
  }

  login(idToken: string, navigate: (path: string) => void) {
    localStorage.setItem('id_token', idToken);
    navigate('/'); // ✅ Uses React Router's navigate instead of full page reload
  }

  logout(navigate: (path: string) => void) {
    localStorage.removeItem('id_token');
    navigate('/login'); // ✅ Uses React Router's navigate
  }
}

export default new AuthService();
