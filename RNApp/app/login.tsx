import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://172.20.10.2:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      const result = await response.json();
      console.log("Parsed response:", result);
  
      if (!response.ok) {
        Alert.alert("Login Failed", result.error || "Something went wrong");
        return;
      }
  
      // ✅ Save user to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(result.user));
      console.log("✅ User stored in AsyncStorage");
  
      // Success
      Alert.alert("Success", "Logged in successfully!");
      router.push("/dashboard");
  
    } catch (err) {
      console.error("Login Error:", err);
      Alert.alert("Error", "Unable to login. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  input: {
    width: 320,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#333",
    color: "white",
    borderRadius: 5,
  },
  button: {
    width: 320,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
  },
  signupText: {
    marginTop: 10,
    color: "#66b2ff",
  },
});
