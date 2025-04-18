import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const useUser = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  const getUserFromToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("AccessToken");
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUser(decodedToken);
      }
    } catch (error) {
     
      setUser(null);
    }
  };

  useEffect(() => {
    getUserFromToken();
  }, []);

  return { user, refreshUser: getUserFromToken };
};

export default useUser;
