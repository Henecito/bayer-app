import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { supabase } from "../supabase/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  styles,
  COLORS,
  GRADIENT_COLORS,
  CARD_GRADIENT,
} from "../styles/homeStyles";

import {
  requestLocationPermission,
  getCurrentLocation,
  fetchDollarRate,
  fetchWeather,
  getWeatherIcon,
  getDollarIcon,
  getDollarColor,
  formatDollarValue,
} from "../utils/homeUtils";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [dollarRate, setDollarRate] = useState(null);
  const [weather, setWeather] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Santiago");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCity, setTempCity] = useState("Santiago");
  const [dollarTrend, setDollarTrend] = useState(null);

  const [locationPermission, setLocationPermission] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isUsingAutoLocation, setIsUsingAutoLocation] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState(null);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState("");

  const obtenerPerfil = async () => {
    try {
      const nombreCacheado = await AsyncStorage.getItem("nombreUsuario");
      if (nombreCacheado) {
        setNombreUsuario(nombreCacheado);
        return nombreCacheado;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", session.user.id)
        .single();

      if (error) return null;

      await AsyncStorage.setItem("nombreUsuario", data.nombre);

      setNombreUsuario(data.nombre);
      return data.nombre;
    } catch (error) {
      console.error("Error en obtenerPerfil:", error);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Error al cerrar sesión", error.message);
      } else {
        // Limpia AsyncStorage para borrar sesión guardada u otros datos
        await AsyncStorage.removeItem("userSession");
        // También limpia el estado local para que no quede nombre visible
        setNombreUsuario("");
        console.log("Sesión cerrada y datos locales limpiados");
      }
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
    }
  };

  const initializeAutoLocation = async () => {
    const cityName = await getCurrentLocation(
      false,
      setIsLocationLoading,
      setUserLocation,
      setLocationPermission
    );
    if (cityName) {
      setSelectedCity(cityName);
      setTempCity(cityName);
      setIsUsingAutoLocation(true);
      return cityName;
    }
    return "Santiago";
  };

  const startLocationWatching = async () => {
    try {
      const hasPermission =
        locationPermission ||
        (await requestLocationPermission(setLocationPermission));
      if (!hasPermission) return;

      if (locationWatcher) {
        locationWatcher.remove();
      }

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 300000,
          distanceInterval: 1000,
        },
        async (location) => {
          if (isUsingAutoLocation) {
            const { latitude, longitude } = location.coords;
            try {
              const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
              });

              if (reverseGeocode && reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                const newCityName =
                  address.city ||
                  address.subAdministrativeArea ||
                  address.region ||
                  address.administrativeArea ||
                  "Ciudad detectada";

                if (newCityName !== selectedCity) {
                  setSelectedCity(newCityName);
                  setTempCity(newCityName);
                  fetchWeather(newCityName, setWeather);
                  console.log(`Ubicación actualizada: ${newCityName}`);
                }
              }
            } catch (error) {
              console.error("Error updating location:", error);
            }
          }
        }
      );

      setLocationWatcher(watcher);
    } catch (error) {
      console.error("Error starting location watcher:", error);
    }
  };

  const enableAutoLocation = async () => {
    const cityName = await getCurrentLocation(
      true,
      setIsLocationLoading,
      setUserLocation,
      setLocationPermission
    );
    if (cityName) {
      setSelectedCity(cityName);
      setTempCity(cityName);
      setIsUsingAutoLocation(true);
      setModalVisible(false);
      fetchWeather(cityName, setWeather);
      startLocationWatching();
    }
  };

  const refreshData = async () => {
    setRefreshing(true);

    const promises = [fetchDollarRate(setDollarRate, setDollarTrend)];

    if (isUsingAutoLocation) {
      const cityName = await getCurrentLocation(
        false,
        setIsLocationLoading,
        setUserLocation,
        setLocationPermission
      );
      if (cityName && cityName !== selectedCity) {
        setSelectedCity(cityName);
        promises.push(fetchWeather(cityName, setWeather));
      } else {
        promises.push(fetchWeather(selectedCity, setWeather));
      }
    } else {
      promises.push(fetchWeather(selectedCity, setWeather));
    }

    await Promise.all(promises);
    setRefreshing(false);
  };

  const handleCityChange = () => {
    setSelectedCity(tempCity);
    setModalVisible(false);
    setIsUsingAutoLocation(false);

    if (locationWatcher) {
      locationWatcher.remove();
      setLocationWatcher(null);
    }

    fetchWeather(tempCity, setWeather);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const initialCity = await initializeAutoLocation();

        await Promise.all([
          fetchDollarRate(setDollarRate, setDollarTrend),
          fetchWeather(initialCity, setWeather),
        ]);

        if (isUsingAutoLocation) {
          startLocationWatching();
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        await Promise.all([
          fetchDollarRate(setDollarRate, setDollarTrend),
          fetchWeather("Santiago", setWeather),
        ]);
      }

      await obtenerPerfil();
      setLoading(false);
    };

    loadData();

    const dollarInterval = setInterval(
      () => fetchDollarRate(setDollarRate, setDollarTrend),
      15 * 60 * 1000
    );
    const weatherInterval = setInterval(() => {
      fetchWeather(selectedCity, setWeather);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(dollarInterval);
      clearInterval(weatherInterval);
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCity && !loading) {
      fetchWeather(selectedCity, setWeather);
    }
  }, [selectedCity]);

  const popularCities = [
    "Santiago",
    "Valparaíso",
    "Concepción",
    "La Serena",
    "Temuco",
    "Antofagasta",
    "Iquique",
    "Puerto Montt",
    "Valdivia",
    "Rancagua",
    "Talca",
    "Arica",
  ];

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
          <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
            }
          >
            {/* Header Card - Mejorado */}
            <LinearGradient colors={CARD_GRADIENT} style={styles.heroCard}>
              <View style={styles.headerSection}>
                <Text style={styles.hiText}>
                  {nombreUsuario ? `Hola, ${nombreUsuario} 👋` : "Hola 👋"}
                </Text>

                <Text style={styles.subText}>
                  Nos alegra verte de nuevo en nuestra App
                </Text>
              </View>

              {/* Información del Dólar - Profesional */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name="dollar-sign"
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>Dólar USD/CLP</Text>
                    <Text style={styles.infoCardSubtitle}>Valor actual</Text>
                  </View>
                  <View style={styles.trendContainer}>
                    <Ionicons
                      name={getDollarIcon(dollarTrend)}
                      size={18}
                      color={getDollarColor(dollarTrend)}
                    />
                  </View>
                </View>
                <View style={styles.valueContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <Text style={styles.valueText}>
                    {formatDollarValue(dollarRate)}
                  </Text>
                  <Text style={styles.currencyCode}>CLP</Text>
                </View>
              </View>

              {/* Información del Clima - Profesional */}
              <TouchableOpacity
                style={styles.infoCard}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.infoCardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={getWeatherIcon(weather?.condition, weather?.temp)}
                      size={18}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>
                      Clima en {selectedCity}
                      {isUsingAutoLocation && (
                        <Text style={styles.autoLocationIndicator}>
                          {" "}
                          📍 Auto
                        </Text>
                      )}
                    </Text>
                    <Text style={styles.infoCardSubtitle}>
                      {weather?.description || "Cargando..."}
                    </Text>
                  </View>
                  <View style={styles.editContainer}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={16}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
                <View style={styles.weatherDetailsContainer}>
                  <View style={styles.temperatureContainer}>
                    <Text style={styles.temperatureText}>
                      {weather?.temp || "--"}°
                    </Text>
                    <Text style={styles.feelsLikeText}>
                      Sensación {weather?.feelsLike || "--"}°
                    </Text>
                  </View>
                  <View style={styles.weatherStatsContainer}>
                    <View style={styles.weatherStat}>
                      <Ionicons
                        name="water-outline"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.weatherStatText}>
                        {weather?.humidity || "--"}%
                      </Text>
                    </View>
                    <View style={styles.weatherStat}>
                      <Ionicons
                        name="speedometer-outline"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text style={styles.weatherStatText}>
                        {weather?.windSpeed || "--"} km/h
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>

            {/* Quick Access - Diseño original */}
            <View style={styles.quickAccessContainer}>
              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate("Reservas")}
              >
                <Ionicons name="calendar-outline" size={24} color="#0077b6" />
                <Text style={styles.quickAccessText}>Reservar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => navigation.navigate("HistorialReservas")}
              >
                <Ionicons name="time-outline" size={24} color="#0077b6" />
                <Text style={styles.quickAccessText}>Historial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => setLogoutModalVisible(true)}
              >
                <Ionicons name="log-out-outline" size={24} color="#d00000" />
                <Text style={styles.quickAccessText}>Salir</Text>
              </TouchableOpacity>

              <Modal
                transparent
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
              >
                <View style={styles.logoutModalOverlay}>
                  <View style={styles.logoutModalContainer}>
                    <Text style={styles.logoutModalTitle}>
                      ¿Estás seguro de que quieres salir?
                    </Text>
                    <View style={styles.logoutModalButtons}>
                      <TouchableOpacity
                        onPress={async () => {
                          setLogoutModalVisible(false);
                          await handleLogout();
                        }}
                        style={styles.logoutModalButton}
                      >
                        <Text style={styles.logoutModalButtonText}>
                          Sí, salir
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setLogoutModalVisible(false)}
                        style={styles.logoutModalButton}
                      >
                        <Text style={styles.logoutModalButtonText}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>

          {/* Modal mejorado para seleccionar ciudad */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.overlay}
            />
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalContent}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <LinearGradient
                  colors={[COLORS.primary, "#0599d4"]}
                  style={styles.modalHeader}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color={COLORS.white}
                  />
                  <Text style={styles.modalTitle}>Seleccionar Ciudad</Text>
                </LinearGradient>

                <View style={styles.modalBody}>
                  <TouchableOpacity
                    style={[
                      styles.autoLocationButton,
                      isLocationLoading && styles.autoLocationButtonLoading,
                    ]}
                    onPress={enableAutoLocation}
                    disabled={isLocationLoading}
                    activeOpacity={0.8}
                  >
                    {isLocationLoading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Ionicons
                        name="location"
                        size={20}
                        color={COLORS.white}
                      />
                    )}
                    <Text style={styles.autoLocationButtonText}>
                      {isLocationLoading
                        ? "Detectando ubicación..."
                        : "Usar mi ubicación actual"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      o selecciona manualmente
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TextInput
                    style={styles.textInput}
                    value={tempCity}
                    onChangeText={setTempCity}
                    placeholder="Escribe el nombre de tu ciudad"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleCityChange}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </MainLayout>
  );
};

export default HomeScreen;
