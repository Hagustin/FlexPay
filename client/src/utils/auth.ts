import { JwtPayload, jwtDecode } from 'jwt-decode';

interface DecodedToken extends JwtPayload {
  id: string;
}

class AuthService {
  getProfile(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }

  loggedIn(): boolean { // ✅ Restore `loggedIn()` to prevent Navbar error
    return this.isAuthenticated();
  }

  isAuthenticated(): boolean { // ✅ The preferred function
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: JwtPayload = jwtDecode(token);
      return decoded.exp ? Date.now() >= decoded.exp * 1000 : false;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('id_token') || null;
  }

  login(idToken: string, navigate: (path: string) => void) {
    const currentToken = this.getToken();
    if (currentToken !== idToken) {
      localStorage.setItem('id_token', idToken);
      window.dispatchEvent(new Event('authChange')); // ✅ Event triggers navbar update
    }
    navigate('/');
  }

  logout(navigate: (path: string) => void) {
    if (this.getToken()) {
      localStorage.removeItem('id_token');
      window.dispatchEvent(new Event('authChange')); // ✅ Event triggers navbar update
    }
    navigate('/login');
  }
}

export default new AuthService();
