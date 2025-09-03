import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import MainLayout from "../components/MainLayout";
import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT_COLORS } from "../styles/homeStyles";

export default function SeleccionUbicacionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onUbicacionSeleccionada } = route.params;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permiso denegado",
              "No se otorgó permiso de ubicación."
            );
            navigation.goBack();
            return;
          }

          const loc = await Location.getCurrentPositionAsync({});
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setLocation(coords);
          setLoading(false);
          setMostrarMapa(true);
        } catch (error) {
          Alert.alert("Error al obtener ubicación", error.message);
          navigation.goBack();
        }
      })();
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  const handleConfirm = () => {
    if (location) {
      onUbicacionSeleccionada(
        `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      );
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <MainLayout>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.title}>Selecciona la ubicación</Text>

          {loading || !mostrarMapa || !location ? (
            <ActivityIndicator size="large" color="#07bbfd" style={{ flex: 1 }} />
          ) : (
            <MapView
              provider="google"
              style={styles.map}
              initialRegion={location}
              onPress={(e) => setLocation(e.nativeEvent.coordinate)}
            >
              <Marker
                coordinate={location}
                draggable
                onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
              />
            </MapView>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    padding: 10,
    textAlign: "center",
    backgroundColor: "#f2f2f2",
  },
  map: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: "#07bbfd",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
