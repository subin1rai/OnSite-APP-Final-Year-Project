// AuthService.ts
import * as SecureStore from 'expo-secure-store';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
  exp: number; // Expiration timestamp in seconds
  [key: string]: any; 
}

const AuthService = {
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('AccessToken');
  },

  removeToken: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('AccessToken');
  },

  isTokenExpired: async (): Promise<boolean> => {
    const token = await AuthService.getToken();
    if (!token) return true;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  checkAndRedirect: async (router: any): Promise<void> => {
    const isExpired = await AuthService.isTokenExpired();
    if (isExpired) {
      console.log("Token expired");
      await AuthService.removeToken();
      // Use an absolute path for redirection.
      router.replace("/(auth)/sign_in");
    }
  },
};

export default AuthService;
