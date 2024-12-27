import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number; // Expiration timestamp in seconds
  [key: string]: any; // Other token payload fields
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
      const currentTime = Date.now() / 1000; // Current time in seconds
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  checkAndRedirect: async (): Promise<void> => {
    const router = useRouter();
    const isExpired = await AuthService.isTokenExpired();
    if (isExpired) {
      await AuthService.removeToken(); // Remove the expired token
      router.replace('../(auth)/sign_in'); // Redirect to login page immediately
    }
  },
};

export default AuthService;
