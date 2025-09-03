import { Alert } from "react-native";
import * as Location from "expo-location";

// Constantes y colores
export const COLORS = {
  primary: "#0077b6",
  error: "#d00000",
  success: "#52b788",
  warning: "#f77f00",
  white: "#ffffff",
  overlay: "rgba(0,0,0,0.5)",
};

// FUNCIÓN MEJORADA: Solicitar permisos de ubicación de forma más insistente
export const requestLocationPermission = async (setLocationPermission) => {
  try {
    // Primero verificar el estado actual
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync();

    if (currentStatus === "granted") {
      setLocationPermission(true);
      return true;
    }

    // Si no está concedido, solicitarlo
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationPermission(true);
      return true;
    } else {
      setLocationPermission(false);
      // Mostrar mensaje explicativo si el usuario rechaza
      Alert.alert(
        "Ubicación deshabilitada",
        "Para una mejor experiencia, puedes habilitar la ubicación en la configuración de la app. Por ahora usaremos Santiago como ciudad predeterminada.",
        [
          {
            text: "Configuración",
            onPress: () => Location.openAppSettingsAsync(),
          },
          { text: "Usar Santiago", style: "cancel" },
        ]
      );
      return false;
    }
  } catch (error) {
    console.error("Error requesting location permission:", error);
    setLocationPermission(false);
    return false;
  }
};

// FUNCIÓN MEJORADA: Obtener ubicación con mejor manejo de errores
export const getCurrentLocation = async (
  showAlert = true,
  setIsLocationLoading,
  setUserLocation,
  setLocationPermission
) => {
  try {
    setIsLocationLoading(true);

    const hasPermission = await requestLocationPermission(
      setLocationPermission
    );
    if (!hasPermission) {
      return null;
    }

    // Configuración más robusta para obtener ubicación
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 15000,
      maximumAge: 300000, // 5 minutos de cache
    });

    const { latitude, longitude } = location.coords;

    // Obtener el nombre de la ciudad usando geocodificación inversa
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      const cityName =
        address.city ||
        address.subAdministrativeArea ||
        address.region ||
        address.administrativeArea ||
        "Ciudad detectada";

      const locationData = {
        latitude,
        longitude,
        city: cityName,
        fullAddress: address,
      };

      setUserLocation(locationData);

      if (showAlert) {
        Alert.alert(
          "Ubicación detectada",
          `Se detectó tu ubicación en: ${cityName}`,
          [{ text: "OK" }]
        );
      }

      return cityName;
    }

    return null;
  } catch (error) {
    console.error("Error getting location:", error);

    if (showAlert) {
      Alert.alert(
        "Error de ubicación",
        "No pudimos obtener tu ubicación automáticamente. Verifica que el GPS esté activado y intenta nuevamente.",
        [
          {
            text: "Reintentar",
            onPress: () =>
              getCurrentLocation(
                true,
                setIsLocationLoading,
                setUserLocation,
                setLocationPermission
              ),
          },
          { text: "Usar Santiago", style: "cancel" },
        ]
      );
    }
    return null;
  } finally {
    setIsLocationLoading(false);
  }
};

// Función mejorada para obtener el valor del dólar USD/CLP
// Función mejorada para obtener el valor del dólar USD/CLP con decimales
export const fetchDollarRate = async (setDollarRate, setDollarTrend) => {
  try {
    // API principal más confiable
    const response = await fetch("https://mindicador.cl/api/dolar");
    const data = await response.json();

    if (data && data.serie && data.serie.length > 0) {
      const current = data.serie[0].valor;
      const previous = data.serie[1]?.valor || current;

      // NO redondear - mantener el valor original con decimales
      setDollarRate(current);
      setDollarTrend(
        current > previous ? "up" : current < previous ? "down" : "stable"
      );
    } else {
      throw new Error("Invalid data structure");
    }
  } catch (error) {
    console.error("Error fetching dollar rate:", error);
    try {
      // API de respaldo
      const response2 = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data2 = await response2.json();
      // También mantener decimales en la API de respaldo
      setDollarRate(data2.rates.CLP);
      setDollarTrend("stable");
    } catch (error2) {
      console.error("Error with backup API:", error2);
      // Valor aproximado con decimales como fallback
      setDollarRate(950.25);
      setDollarTrend("stable");
    }
  }
};

// Función para formatear el valor del dólar con formato chileno
export const formatDollarValue = (value) => {
  if (!value) return "---";

  // Usar localización chilena para mostrar con coma como separador decimal
  return value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Función principal usando WeatherAPI (gratuita y confiable)
export const fetchWeather = async (city, setWeather) => {
  try {
    // WeatherAPI - API key configurada
    const API_KEY = "0192405b6e51463988135011252305";

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city},Chile&lang=es&aqi=no`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Datos recibidos:", data);

    setWeather({
      temp: Math.round(data.current.temp_c),
      feelsLike: Math.round(data.current.feelslike_c),
      description: data.current.condition.text,
      city: data.location.name,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      condition: data.current.condition.code.toString(),
      visibility: data.current.vis_km,
    });
  } catch (error) {
    console.error("Error con WeatherAPI:", error);

    // Fallback: Intentar con OpenWeatherMap
    try {
      await fetchWeatherOpenWeatherMap(city, setWeather);
    } catch (owmError) {
      console.error("Error con OpenWeatherMap:", owmError);

      // Fallback final: datos simulados realistas para Chile
      setWeatherFallback(city, setWeather);
    }
  }
};

// Alternativa: OpenWeatherMap (también gratuita)
const fetchWeatherOpenWeatherMap = async (city, setWeather) => {
  const API_KEY = "TU_OPENWEATHER_API_KEY";

  if (API_KEY === "TU_OPENWEATHER_API_KEY") {
    throw new Error("OpenWeatherMap API key no configurada");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city},CL&appid=${API_KEY}&units=metric&lang=es`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  setWeather({
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    city: data.name,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
    condition: data.weather[0].id.toString(),
    visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
  });
};

// Datos de fallback más realistas por región de Chile
const setWeatherFallback = (city, setWeather) => {
  const chileanCitiesWeather = {
    // Norte
    Arica: { temp: 22, humidity: 70, windSpeed: 15, desc: "Soleado" },
    Iquique: {
      temp: 20,
      humidity: 75,
      windSpeed: 12,
      desc: "Parcialmente nublado",
    },
    Antofagasta: { temp: 18, humidity: 80, windSpeed: 18, desc: "Nublado" },
    Calama: { temp: 15, humidity: 45, windSpeed: 8, desc: "Despejado" },

    // Centro
    "La Serena": {
      temp: 16,
      humidity: 65,
      windSpeed: 14,
      desc: "Parcialmente nublado",
    },
    Valparaíso: { temp: 17, humidity: 75, windSpeed: 20, desc: "Nublado" },
    Santiago: {
      temp: 18,
      humidity: 60,
      windSpeed: 10,
      desc: "Parcialmente nublado",
    },
    Rancagua: { temp: 19, humidity: 55, windSpeed: 8, desc: "Soleado" },

    // Sur
    Talca: { temp: 16, humidity: 70, windSpeed: 12, desc: "Nublado" },
    Chillán: { temp: 15, humidity: 75, windSpeed: 10, desc: "Lluvia ligera" },
    Concepción: { temp: 14, humidity: 80, windSpeed: 16, desc: "Nublado" },
    Temuco: { temp: 12, humidity: 85, windSpeed: 14, desc: "Lluvia ligera" },
    Angol: { temp: 13, humidity: 80, windSpeed: 12, desc: "Nublado" },
    Valdivia: { temp: 11, humidity: 90, windSpeed: 15, desc: "Lluvia" },
    Osorno: { temp: 10, humidity: 85, windSpeed: 18, desc: "Lluvia ligera" },
    "Puerto Montt": { temp: 9, humidity: 90, windSpeed: 20, desc: "Lluvia" },

    // Extremo Sur
    Coyhaique: { temp: 8, humidity: 75, windSpeed: 25, desc: "Viento fuerte" },
    "Punta Arenas": {
      temp: 5,
      humidity: 80,
      windSpeed: 30,
      desc: "Viento fuerte",
    },
  };

  const cityData =
    chileanCitiesWeather[city] || chileanCitiesWeather["Santiago"];
  const variation = Math.random() * 4 - 2; // Variación de ±2°C

  setWeather({
    temp: Math.round(cityData.temp + variation),
    feelsLike: Math.round(cityData.temp + variation + (Math.random() * 4 - 2)),
    description: `${cityData.desc} (datos simulados)`,
    city: city,
    humidity: cityData.humidity + Math.round(Math.random() * 10 - 5),
    windSpeed: cityData.windSpeed + Math.round(Math.random() * 6 - 3),
    condition: "116", // Código genérico
    visibility: 10 + Math.round(Math.random() * 10),
  });

  console.log(`Usando datos simulados para ${city}`);
};

// Traducir descripciones del clima al español
export const translateWeatherDesc = (desc) => {
  const translations = {
    Clear: "Despejado",
    Sunny: "Soleado",
    "Partly cloudy": "Parcialmente nublado",
    "Partly Cloudy": "Parcialmente nublado",
    Cloudy: "Nublado",
    Overcast: "Cubierto",
    "Light rain": "Lluvia ligera",
    Rain: "Lluvia",
    "Heavy rain": "Lluvia intensa",
    Snow: "Nieve",
    Thunderstorm: "Tormenta",
    Fog: "Niebla",
    Mist: "Neblina",
    "Light snow": "Nevada ligera",
    "Heavy snow": "Nevada intensa",
  };
  return translations[desc] || desc;
};

// Función para obtener iconos del clima
export const getWeatherIcon = (condition, temp) => {
  if (!condition) return "partly-sunny-outline";

  // Iconos basados en códigos de condición meteorológica
  const conditionCode = parseInt(condition) || 0;

  if (conditionCode === 113) return "sunny";
  if ([116, 119, 122].includes(conditionCode)) return "partly-sunny";
  if ([119, 122, 143, 248, 260].includes(conditionCode)) return "cloudy";
  if ([176, 179, 182, 185, 263, 266, 281, 284].includes(conditionCode))
    return "rainy";
  if ([200, 386, 389, 392, 395].includes(conditionCode)) return "thunderstorm";
  if (
    [
      227, 230, 323, 326, 329, 332, 335, 338, 350, 353, 356, 359, 362, 365, 368,
      371, 374, 377, 380, 383,
    ].includes(conditionCode)
  )
    return "snow";

  // Fallback basado en temperatura
  if (temp > 25) return "sunny";
  if (temp > 15) return "partly-sunny";
  if (temp > 5) return "cloudy";
  return "snow";
};

// Función para obtener iconos del dólar
export const getDollarIcon = (trend) => {
  switch (trend) {
    case "up":
      return "trending-up";
    case "down":
      return "trending-down";
    default:
      return "remove";
  }
};

// Función para obtener colores del dólar
export const getDollarColor = (trend) => {
  switch (trend) {
    case "up":
      return COLORS.error;
    case "down":
      return COLORS.success;
    default:
      return COLORS.warning;
  }
};
