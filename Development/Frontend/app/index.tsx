import { Redirect } from "expo-router";
import { registerIndieID } from 'native-notify';

const index = () => {
registerIndieID(2, 12345, 'O50kS3CBDq8CYkr3yCKdB7'); 

  return <Redirect href="/(auth)/welcome" />;
};

export default index;
