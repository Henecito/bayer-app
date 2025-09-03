import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getMODELOS_MAQUINAS,
  getMAQUINAS_DISPONIBLES,
} from "../supabase/reservasData";
import { getBlockedDates } from "../supabase/blockedDatesService";
import {
  createReservation,
  getAllReservations,
  getCodigosDisponiblesPorModelo,
} from "../supabase/reservationService";
import { reservaStyles as styles } from "../styles/reservaStyles";
import {
  renderStep1,
  renderStep2,
  renderStep3,
  renderStep4,
  renderStep5,
  renderStep6,
  renderStep7,
} from "./ReservasSteps";
import { supabase } from "../supabase/supabase";

const screenWidth = Dimensions.get("window").width;
const PRIMARY_COLOR = "#07bbfd";
const SECONDARY_COLOR = "#045d99";
const ACCENT_COLOR = "#88d42b";
const GRADIENT_COLORS = ["#88d42b10", "#07bbfdd9"];

export default function ReservasScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cantidadLitros, setCantidadLitros] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [duracionReserva, setDuracionReserva] = useState(null);

  const [modeloSeleccionado, setModeloSeleccionado] = useState(null);
  const [codigoSeleccionado, setCodigoSeleccionado] = useState(null);
  const [maquinaDetalles, setMaquinaDetalles] = useState(null);

  const [agricultorNombre, setAgricultorNombre] = useState("");
  const [agricultorTelefono, setAgricultorTelefono] = useState("");
  const [agricultorUbicacion, setAgricultorUbicacion] = useState("");
  const [agricultorEmail, setAgricultorEmail] = useState("");

  const [MODELOS_MAQUINAS, setMODELOS_MAQUINAS] = useState([]);
  const [MAQUINAS_DISPONIBLES, setMAQUINAS_DISPONIBLES] = useState({});

  const [blockedStarts, setBlockedStarts] = useState([]);
  const [blockedWeeks, setBlockedWeeks] = useState([]);
  const [blockedEnds, setBlockedEnds] = useState([]);

  const [reservasActivas, setReservasActivas] = useState([]);
  const [codigosDisponibles, setCodigosDisponibles] = useState([]);

  const [userId, setUserId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error al obtener el usuario:", error);
          return;
        }

        const uid = data?.user?.id || null;
        setUserId(uid);
        console.log("User ID obtenido en pantalla:", uid);
      } catch (e) {
        console.error("Excepción obteniendo usuario:", e);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    async function cargarFechasBloqueadas() {
      try {
        const { blockedStarts, blockedWeeks, blockedEnds } =
          await getBlockedDates();
        setBlockedStarts(blockedStarts);
        setBlockedWeeks(blockedWeeks);
        setBlockedEnds(blockedEnds);
      } catch (error) {
        console.error("Error al cargar fechas bloqueadas:", error);
      }
    }
    cargarFechasBloqueadas();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const modelos = await getMODELOS_MAQUINAS();
      setMODELOS_MAQUINAS(modelos);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const cargarMaquinas = async () => {
      const disponibles = await getMAQUINAS_DISPONIBLES();
      setMAQUINAS_DISPONIBLES(disponibles);
    };
    cargarMaquinas();
  }, []);

  useEffect(() => {
    async function cargarReservas() {
      try {
        const all = await getAllReservations();
        const activas = all
          .filter((r) => r.status === "Pendiente" || r.status === "Confirmada")
          .map((r) => {
            if (typeof r.machine === "string") {
              try {
                r.machine = JSON.parse(r.machine);
              } catch (e) {
                console.warn("No se pudo parsear machine JSON:", r.machine);
              }
            }
            return r;
          });

        setReservasActivas(activas);
      } catch (error) {
        console.error("Error al cargar reservas:", error);
      }
    }
    cargarReservas();
  }, []);

  useEffect(() => {
    if (
      !modeloSeleccionado ||
      !fechaInicio ||
      !fechaFin ||
      !MAQUINAS_DISPONIBLES[modeloSeleccionado]
    ) {
      setCodigosDisponibles([]);
      return;
    }

    const maquinasDelModelo = MAQUINAS_DISPONIBLES[modeloSeleccionado];
    const disponibles = getCodigosDisponiblesPorModelo(
      maquinasDelModelo,
      fechaInicio,
      fechaFin,
      reservasActivas
    );

    setCodigosDisponibles(disponibles);
  }, [modeloSeleccionado, fechaInicio, fechaFin, reservasActivas]);

  const totalSteps = 7;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaMin = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
  const fechaMinISO = fechaMin.toISOString().split("T")[0];

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diferenciaDias =
        Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
      setDuracionReserva(diferenciaDias);
    } else {
      setDuracionReserva(null);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    if (modeloSeleccionado && codigoSeleccionado) {
      const maquinas = MAQUINAS_DISPONIBLES[modeloSeleccionado] || [];
      const maquina = maquinas.find((m) => m.codigo === codigoSeleccionado);
      setMaquinaDetalles(maquina);
    } else {
      setMaquinaDetalles(null);
    }
  }, [modeloSeleccionado, codigoSeleccionado]);

  const handleNext = () => {
    if (step === 1 && cantidadLitros === null)
      return Alert.alert("Cantidad requerida", "Selecciona los Kg comprados.");
    if (step === 2 && !fechaInicio)
      return Alert.alert("Fecha requerida", "Selecciona la fecha de inicio.");
    if (step === 3 && !fechaFin)
      return Alert.alert("Fecha requerida", "Selecciona la fecha de fin.");
    if (step === 4 && !modeloSeleccionado)
      return Alert.alert("Modelo requerido", "Selecciona un modelo.");
    if (step === 5 && !codigoSeleccionado)
      return Alert.alert(
        "Código requerido",
        "Selecciona un código de máquina."
      );
    if (step === 6) {
      if (!agricultorNombre.trim())
        return Alert.alert("Falta nombre", "Ingresa tu nombre completo.");
      if (!agricultorTelefono.trim())
        return Alert.alert("Falta teléfono", "Ingresa tu número.");
      if (!agricultorUbicacion.trim())
        return Alert.alert(
          "Falta ubicación",
          "Indica dónde usarás la máquina."
        );
      if (!agricultorEmail.trim())
        return Alert.alert("Falta correo", "Ingresa tu correo electrónico.");
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleResetForm = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setModeloSeleccionado(null);
    setCodigoSeleccionado(null);
    setAgricultorNombre("");
    setAgricultorTelefono("");
    setAgricultorUbicacion("");
    setAgricultorEmail("");
    setStep(1);
  };

  const handleConfirmReservation = async () => {
    setLoading(true);

    try {
      const newReservation = {
        liters: cantidadLitros,
        startDate: fechaInicio,
        endDate: fechaFin,
        duration: duracionReserva,
        machine: {
          model:
            MODELOS_MAQUINAS.find((m) => m.id === modeloSeleccionado)?.nombre ||
            "",
          code: codigoSeleccionado,
        },
        farmer: {
          name: agricultorNombre,
          phone: agricultorTelefono,
          location: agricultorUbicacion,
          email: agricultorEmail,
        },
      };

      await createReservation(newReservation, userId);

      setLoading(false);
      Alert.alert(
        "Reserva enviada",
        "Tu reserva está pendiente de aprobación.",
        [{ text: "OK", onPress: handleResetForm }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudo crear la reserva.");
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(step / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Paso {step} de {totalSteps}
      </Text>
    </View>
  );

  const renderNextButton = () => {
    const isLastStep = step === 7;

    if (loading) {
      return (
        <TouchableOpacity
          style={[styles.buttonNext, styles.buttonDisabled]}
          disabled
        >
          <ActivityIndicator size="small" color="#fff" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.buttonNext}
        onPress={isLastStep ? handleConfirmReservation : handleNext}
      >
        <Text style={styles.buttonText}>
          {isLastStep ? "Confirmar reserva" : "Siguiente"}
        </Text>
        {!isLastStep && (
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderBackButton = () =>
    step > 1 && (
      <TouchableOpacity
        style={styles.buttonBack}
        onPress={handleBack}
        disabled={loading}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={PRIMARY_COLOR}
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonBackText}>Volver</Text>
      </TouchableOpacity>
    );

  function formatDate(dateString) {
    if (!dateString) return "";
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

  function getDateRangeMarkers() {
    if (!fechaInicio || !fechaFin) return {};

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const markers = {};
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];

      if (dateStr !== fechaInicio && dateStr !== fechaFin) {
        markers[dateStr] = {
          color: "#e6f7ff",
          textColor: SECONDARY_COLOR,
          startingDay: dateStr === fechaInicio,
          endingDay: dateStr === fechaFin,
        };
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return markers;
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1(cantidadLitros, setCantidadLitros, styles);
      case 2:
        return renderStep2(
          fechaInicio,
          setFechaInicio,
          fechaMinISO,
          formatDate,
          styles,
          blockedStarts,
          blockedWeeks
        );
      case 3:
        return renderStep3(
          fechaInicio,
          fechaFin,
          setFechaFin,
          fechaMinISO,
          duracionReserva,
          formatDate,
          getDateRangeMarkers,
          styles,
          blockedEnds
        );
      case 4:
        return renderStep4(
          MODELOS_MAQUINAS,
          modeloSeleccionado,
          setModeloSeleccionado,
          setCodigoSeleccionado,
          fechaInicio,
          fechaFin,
          duracionReserva,
          formatDate,
          cantidadLitros,
          styles
        );
      case 5:
        return renderStep5(
          MODELOS_MAQUINAS,
          { [modeloSeleccionado]: codigosDisponibles },
          modeloSeleccionado,
          codigoSeleccionado,
          setCodigoSeleccionado,
          styles
        );
      case 6:
        return renderStep6(
          MODELOS_MAQUINAS,
          modeloSeleccionado,
          codigoSeleccionado,
          fechaInicio,
          fechaFin,
          agricultorNombre,
          setAgricultorNombre,
          agricultorTelefono,
          setAgricultorTelefono,
          agricultorEmail, 
          setAgricultorEmail,
          agricultorUbicacion, 
          setAgricultorUbicacion,
          formatDate,
          styles,
          () => {
            navigation.navigate("SeleccionUbicacion", {
              onUbicacionSeleccionada: (coords) => {
                setAgricultorUbicacion(coords);
              },
            });
          }
        );

      case 7:
        return renderStep7(
          MODELOS_MAQUINAS,
          cantidadLitros,
          fechaInicio,
          fechaFin,
          duracionReserva,
          modeloSeleccionado,
          codigoSeleccionado,
          maquinaDetalles,
          agricultorNombre,
          agricultorTelefono,
          agricultorUbicacion,
          agricultorEmail,
          formatDate,
          styles
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {renderProgressBar()}
            {renderStepContent()}
            <View style={styles.buttonsRow}>
              {renderBackButton()}
              {renderNextButton()}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </MainLayout>
  );
}
