import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { Button, Card } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import logo from "../../assets/images/bayer-logo.png";
import { supabase } from "../supabase/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  if (!email || !password) {
    alert("Por favor, completa ambos campos.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Error: " + error.message);
    console.error(error);
  } else {
    // Guardar UUID en AsyncStorage
    const uuid = data.user.id;
    await AsyncStorage.setItem("userUUID", uuid);
    console.log("UUID guardado en AsyncStorage:", uuid);

    navigation.replace("Home");
  }
};


  return (
    <LinearGradient
      colors={["#88d42b03", "#07bbfdd9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Image source={logo} style={styles.logo} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => {
                  /* Aquí puedes agregar función de recuperación */
                }}
              >
                <Text style={styles.forgotPassword}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, color: "#fff" }}
              >
                Iniciar sesión
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    paddingVertical: 32,
    paddingHorizontal: 10,
    elevation: 10,
  },
  cardContent: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  forgotPassword: {
    color: "#0077b6",
    textDecorationLine: "underline",
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#05bcf9",
    borderRadius: 10,
    marginTop: 10,
  },
});
