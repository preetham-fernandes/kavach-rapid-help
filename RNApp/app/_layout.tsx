import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="chatscreen" />
      <Stack.Screen name="reportcrime" />
    </Stack>
  );
}