import { JwtPayload, jwtDecode } from "jwt-decode";

class AuthService {
  getProfile() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error("Error decoding token:", error);
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
      console.error("Error decoding token:", error);
      return true;
    }
  }

  getToken(): string {
    return localStorage.getItem("id_token") || "";
  }

  login(idToken: string, navigate: (path: string) => void) {
    localStorage.setItem("id_token", idToken);
    navigate("/dashboard"); // ✅ Uses React Router's navigate instead of full page reload
  }

  logout(navigate: (path: string) => void) {
    localStorage.removeItem("id_token");
    navigate("/login"); // ✅ Uses React Router's navigate
  }
}

export default new AuthService();
