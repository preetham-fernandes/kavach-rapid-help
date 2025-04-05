import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../login";
import SignupScreen from "../signup";
import DashboardScreen from "../dashboard";
import ChatScreen from "../chatscreen";

// Define your root stack param list
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  ChatScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}