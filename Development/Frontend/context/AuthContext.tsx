// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import * as SecureStore from "expo-secure-store";

// interface AuthProops {
//   authState?: {
//     token: string | null;
//     authenticated: boolean | null;
//   };
//   onRegister?: (name: string, email: string, password: string, confirmPassword: string) => Promise<any>;
//   onLogin?: (email: string, password: string) => Promise<any>;
//   onLogout?: () => Promise<any>;
// }

// export const API_URL = "http://192.168.1.100:3398";
// const AuthContext = createContext<AuthProops>({});

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }: { children: any }) => {
//   const [authState, setAuthState] = useState<{
//     token: string | null;
//     authenticated: boolean | null;
//   }>({
//     token: null,
//     authenticated: null,
//   });

//   useEffect(() => {
//     const loadToken = async () => {
//       const token = await SecureStore.getItemAsync(JWT_SECRET);
//       console.log("Stored", token);
//       if (token) {
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         setAuthState({ token, authenticated: true });
//       }
//     };
//     loadToken();
//   }, []);

//   const register = async (name: string, email: string, password: string, confirmPassword: string) => {
//     try {
//       const result = await axios.post(`${API_URL}/api/signUp`, { name, email, password, confirmPassword });
//       if (result.data.token) {
//         setAuthState({
//           token: result.data.token,
//           authenticated: true,
//         });
//         axios.defaults.headers.common["Authorization"] = `Bearer ${result.data.token}`;
//         await SecureStore.setItemAsync(JWT_SECRET, result.data.token);
//       }
//       return result;
//     } catch (error) {
//       console.log(error);
//       return { error: true, msg: (error as any).response?.data?.message || 'Registration failed' };
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const result = await axios.post(`${API_URL}/api/login`, { email, password });
//       setAuthState({
//         token: result.data.token,
//         authenticated: true,
//       });
//       axios.defaults.headers.common[
//         "Authorization"
//       ] = `Bearer ${result.data.token}`;  
//       await SecureStore.setItemAsync(JWT_SECRET, result.data.token);
//       return result;
//     } catch (error) {
//       console.log(error);
//       return { error: true, msg: (error as any).response.data.message };
//     }
//   };

//   const logout = async () => {
//     await SecureStore.deleteItemAsync(JWT_SECRET);
//     axios.defaults.headers.common["Authorization"] = "";
//     setAuthState({
//       token: null,
//       authenticated: false,
//     });
//   };
//   const value = {
//     onRegister: register,
//     onLogin: login,
//     onLogout: logout,
//     authState,
//   };
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
