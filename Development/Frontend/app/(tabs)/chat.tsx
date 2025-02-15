// import AuthService from "@/context/AuthContext";
// import { useEffect } from "react";
// import { SafeAreaView, Text, View } from "react-native"

// const Chat = ()=>{
//     useEffect(() => {
//         const checkToken = async () => {
//           await AuthService.checkAndRedirect();
//         };
    
//         checkToken();
//       }, []);
//     return (
//         <SafeAreaView>
//             <Text>CHat</Text>
//         </SafeAreaView>
//     )
// }

// export default Chat;

import AuthService from "@/context/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView, Text } from "react-native";

const Chat = () => {
  useEffect(() => {
    // Call AuthService to check the token status and redirect if necessary
    const checkToken = async () => {
      await AuthService.checkAndRedirect(router);
    };

    checkToken();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <SafeAreaView>
      <Text>Chat</Text>
    </SafeAreaView>
  );
};

export default Chat;
