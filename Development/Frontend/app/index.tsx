import { Redirect } from "expo-router";
import registerNNPushToken from "native-notify";

const index = () => {
  registerNNPushToken(28966, "O50kS3CBDq8CYkr3yCKdB7");
  return <Redirect href="/(auth)/welcome" />;
};

export default index;
