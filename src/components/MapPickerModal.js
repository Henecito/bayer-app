// components/MapPickerModal.js
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function MapPickerModal({ visible, onClose, onSelectLocation, mostrarMapa }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permiso de ubicación denegado");
          onClose();
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setLocation(coords);
        setRegion(coords);
        setLoading(false);
      })();
    }
  }, [visible]);

  const handleConfirm = () => {
    if (location) {
      onSelectLocation(`${location.latitude}, ${location.longitude}`);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Selecciona la ubicación</Text>

        {loading || !mostrarMapa ? (
          <ActivityIndicator size="large" color="#07bbfd" />
        ) : (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={(reg) => setRegion(reg)}
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
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
          >
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, padding: 10, textAlign: "center" },
  map: { flex: 1 },
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
