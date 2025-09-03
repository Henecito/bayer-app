import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Modal,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import styles from "../styles/historialStyles";
import {
  getHistorialReservas,
  updateEstadoReserva,
} from "../supabase/historialServices";
import { supabase } from "../supabase/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const PRIMARY_COLOR = "#07bbfd";
const SECONDARY_COLOR = "#045d99";
const GRADIENT_COLORS = ["#88d42b10", "#07bbfdd9"];

function formatFechaSimple(fechaISO) {
  const [year, month, day] = fechaISO.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

export default function HistorialReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("Todas");
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [showFiltroModal, setShowFiltroModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [reservaDetalle, setReservaDetalle] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const [userProfile, setUserProfile] = useState(null);

  const opcionesFiltro = [
    "Todas",
    "Pendiente",
    "Confirmada",
    "Finalizada",
    "Cancelada",
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const uuid = await AsyncStorage.getItem("userUUID");
        if (!uuid) return;
        const { data: perfil, error } = await supabase
          .from("profiles")
          .select("id, rol, nombre")
          .eq("id", uuid)
          .single();
        if (error) throw error;
        setUserProfile(perfil);
      } catch (error) {
        console.error("Error al cargar perfil usuario:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const uuid = await AsyncStorage.getItem("userUUID");
        if (!uuid) {
          console.error("No se encontró UUID en AsyncStorage");
          setLoading(false);
          return;
        }
        const data = await getHistorialReservas(uuid);
        setReservas(data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, []);

  useEffect(() => {
    if (showDetallesModal) {
      const timeout = setTimeout(() => {
        setMostrarMapa(true);
      }, 700);
      return () => clearTimeout(timeout);
    } else {
      setMostrarMapa(false);
    }
  }, [showDetallesModal]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const uuid = await AsyncStorage.getItem("userUUID");
      if (!uuid) {
        console.error("No se encontró UUID en AsyncStorage");
        setRefreshing(false);
        return;
      }
      const data = await getHistorialReservas(uuid);
      setReservas(data);
    } catch (error) {
      console.error("Error al refrescar historial:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const reservasFiltradas =
    filtroActivo === "Todas"
      ? reservas
      : reservas.filter((r) => r.estado === filtroActivo);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: es });
  };

  const calcularDuracion = (inicio, fin) => {
    const start = new Date(inicio);
    const end = new Date(fin);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "#FFC107";
      case "Confirmada":
        return "#2196f3";
      case "Finalizada":
        return "#4caf50";
      case "Cancelada":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const handleConfirmarReserva = async (id) => {
    try {
      const uuid = await AsyncStorage.getItem("userUUID"); // O de donde tengas el userId
      await updateEstadoReserva(id, "Confirmada", uuid);
      const data = await getHistorialReservas(uuid);
      setReservas(data);
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleCancelarReserva = async (id) => {
    try {
      const uuid = await AsyncStorage.getItem("userUUID");
      await updateEstadoReserva(id, "Cancelada", uuid);
      const data = await getHistorialReservas(uuid);
      setReservas(data);
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleMarcarCompletada = async (id) => {
    try {
      const uuid = await AsyncStorage.getItem("userUUID");
      await updateEstadoReserva(id, "Finalizada", uuid);
      const data = await getHistorialReservas(uuid);
      setReservas(data);
    } catch (error) {
      console.error("Error al completar reserva:", error);
      Alert.alert("Error", error.message);
    }
  };

  const confirmarConAlerta = (mensaje, onConfirmar) => {
    Alert.alert("Confirmación", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: onConfirmar },
    ]);
  };

  const confirmarCancelarReserva = (id) =>
    confirmarConAlerta("¿Deseas cancelar esta reserva?", () =>
      handleCancelarReserva(id)
    );

  const confirmarConfirmarReserva = (id) =>
    confirmarConAlerta("¿Confirmar esta reserva?", () =>
      handleConfirmarReserva(id)
    );

  const confirmarMarcarCompletada = (id) =>
    confirmarConAlerta("¿Marcar como completada?", () =>
      handleMarcarCompletada(id)
    );

  const handleVerDetalles = (reserva) => {
    setReservaDetalle(reserva);
    setShowDetallesModal(true);
  };

  const abrirUbicacionEnMapa = (ubicacion, coordenadas) => {
    let url = "";

    if (coordenadas) {
      // URL universal que funciona con Google Maps, Apple Maps y ofrece elección si hay varias
      url = `https://www.google.com/maps/search/?api=1&query=${coordenadas.lat},${coordenadas.lon}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        ubicacion
      )}`;
    }

    Linking.openURL(url).catch((err) =>
      console.error("No se pudo abrir la app de mapas:", err)
    );
  };

  // Renderizar el selector de filtros como dropdown
  const renderFiltroPicker = () => {
    return (
      <View style={styles.filtroPickerContainer}>
        <TouchableOpacity
          style={styles.filtroSelector}
          onPress={() => setShowFiltroModal(true)}
        >
          <View style={styles.filtroSelectorContent}>
            <View style={styles.filtroLabelContainer}>
              <Text style={styles.filtroLabel}>Estado:</Text>
              <View
                style={[
                  styles.filtroValueBadge,
                  {
                    backgroundColor:
                      filtroActivo !== "Todas"
                        ? getEstadoColor(filtroActivo) + "20"
                        : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filtroValue,
                    {
                      color:
                        filtroActivo !== "Todas"
                          ? getEstadoColor(filtroActivo)
                          : "#333",
                    },
                  ]}
                >
                  {filtroActivo}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Modal para selección de filtro */}
        <Modal
          visible={showFiltroModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFiltroModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFiltroModal(false)}
          >
            <View style={styles.filtroModalContainer}>
              <View style={styles.filtroModalContent}>
                <Text style={styles.filtroModalTitle}>Filtrar por estado</Text>

                {opcionesFiltro.map((opcion) => (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.filtroModalOption,
                      filtroActivo === opcion &&
                        styles.filtroModalOptionSelected,
                    ]}
                    onPress={() => {
                      setFiltroActivo(opcion);
                      setShowFiltroModal(false);
                    }}
                  >
                    {opcion !== "Todas" && (
                      <View
                        style={[
                          styles.optionColorDot,
                          { backgroundColor: getEstadoColor(opcion) },
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.filtroModalItemText,
                        filtroActivo === opcion &&
                          styles.filtroModalItemTextSelected,
                      ]}
                    >
                      {opcion}
                    </Text>
                    {filtroActivo === opcion && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={PRIMARY_COLOR}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  // Renderizar modal de detalles completos
  const renderDetallesModal = () => {
    if (!reservaDetalle) return null;

    const { maquina, fechaInicio, fechaFin, estado, agricultor, supervisor } =
      reservaDetalle;
    const duracion = calcularDuracion(fechaInicio, fechaFin);

    return (
      <Modal
        visible={showDetallesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetallesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detallesModalContainer}>
            <View style={styles.detallesModalHeader}>
              <Text style={styles.detallesModalTitle}>Detalles de Reserva</Text>
              <TouchableOpacity
                onPress={() => setShowDetallesModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detallesModalContent}>
              {/* Cabecera con estado */}
              <View style={styles.detallesModalEstadoContainer}>
                <View
                  style={[
                    styles.estadoBadgeLarge,
                    { backgroundColor: getEstadoColor(estado) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.estadoTextLarge,
                      { color: getEstadoColor(estado) },
                    ]}
                  >
                    {estado}
                  </Text>
                </View>
              </View>

              {/* Información de la máquina */}
              <View style={styles.detallesModalSection}>
                <View style={styles.detallesModalRow}>
                  <View style={styles.modeloContainerModal}>
                    <Ionicons
                      name={maquina.icono}
                      size={28}
                      color={PRIMARY_COLOR}
                    />
                    <View style={styles.modeloInfoModal}>
                      <Text style={styles.modeloNombreModal}>
                        {maquina.nombre}
                      </Text>
                      <Text style={styles.modeloCodigoModal}>
                        {maquina.codigo}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Información de fechas */}
              <View style={styles.detallesModalSection}>
                <View style={styles.detallesModalSectionHeader}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.detallesModalSectionTitle}>
                    Información de Fechas
                  </Text>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>
                      Fecha de inicio:
                    </Text>
                    <Text style={styles.detalleModalValue}>
                      {formatDate(fechaInicio)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>Fecha de fin:</Text>
                    <Text style={styles.detalleModalValue}>
                      {formatDate(fechaFin)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>Duración:</Text>
                    <Text style={styles.detalleModalValue}>
                      {duracion} {duracion === 1 ? "día" : "días"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Información del supervisor que creó la reserva */}
              <View style={styles.detallesModalSection}>
                <View style={styles.detallesModalSectionHeader}>
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.detallesModalSectionTitle}>
                    Reserva Creada por
                  </Text>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>Nombre:</Text>
                    <Text style={styles.detalleModalValue}>
                      {supervisor.nombre}
                    </Text>
                  </View>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>Correo:</Text>
                    <Text style={styles.detalleModalValue}>
                      {supervisor.correo}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Información del agricultor */}
              <View style={styles.detallesModalSection}>
                <View style={styles.detallesModalSectionHeader}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.detallesModalSectionTitle}>
                    Información del Agricultor
                  </Text>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>Razón Social:</Text>
                    <Text style={styles.detalleModalValue}>
                      {agricultor.nombre}
                    </Text>
                  </View>
                </View>

                <View style={styles.detallesModalRow}>
                  <View style={styles.detalleModalItem}>
                    <Text style={styles.detalleModalLabel}>Teléfono:</Text>
                    <Text style={styles.detalleModalValue}>
                      {agricultor.telefono}
                    </Text>
                  </View>
                </View>

                <View style={styles.detalleModalItem}>
                  <Text style={styles.detalleModalLabel}>Ubicación:</Text>
                  <TouchableOpacity
                    onPress={() =>
                      abrirUbicacionEnMapa(
                        agricultor.coordenadas
                          ? `${agricultor.coordenadas.lat},${agricultor.coordenadas.lon}`
                          : agricultor.ubicacion
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.detalleModalValue,
                        {
                          color: PRIMARY_COLOR,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      {agricultor.ubicacion}
                    </Text>
                  </TouchableOpacity>
                </View>

                {agricultor.coordenadas && mostrarMapa && (
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={{
                      width: "100%",
                      height: 200,
                      marginTop: 10,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                    initialRegion={{
                      latitude: agricultor.coordenadas.lat,
                      longitude: agricultor.coordenadas.lon,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    //pointerEvents="none"
                  >
                    <Marker
                      coordinate={{
                        latitude: agricultor.coordenadas.lat,
                        longitude: agricultor.coordenadas.lon,
                      }}
                      title={agricultor.nombre}
                      description={agricultor.ubicacion}
                    />
                  </MapView>
                )}
              </View>
            </ScrollView>

            <View style={styles.detallesModalFooter}>
              <TouchableOpacity
                style={styles.detallesModalCloseButton}
                onPress={() => setShowDetallesModal(false)}
              >
                <Text style={styles.detallesModalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Renderizar cada tarjeta de reserva
  const renderReserva = ({ item }) => {
    const { id, maquina, fechaInicio, fechaFin, estado, agricultor } = item;
    const duracion = calcularDuracion(fechaInicio, fechaFin);
    const isSelected = reservaSeleccionada === id;

    return (
      <TouchableOpacity
        style={[styles.reservaCard, isSelected && styles.reservaCardSelected]}
        onPress={() => setReservaSeleccionada(isSelected ? null : id)}
        activeOpacity={0.8}
      >
        <View style={styles.reservaHeader}>
          <View style={styles.modeloContainer}>
            <Ionicons name={maquina.icono} size={24} color={PRIMARY_COLOR} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={[styles.modeloNombre, { marginBottom: 2 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {maquina.nombre}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[styles.modeloCodigo, { fontSize: 14 }]}>
                  {maquina.codigo}
                </Text>
                <View
                  style={[
                    styles.estadoBadge,
                    {
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: getEstadoColor(estado) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.estadoText,
                      { color: getEstadoColor(estado), fontWeight: "700" },
                    ]}
                  >
                    {estado}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.fechasContainer}>
          <View style={styles.fechaItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={SECONDARY_COLOR}
            />
            <Text style={styles.fechaTexto}>
              Inicio: {formatFechaSimple(fechaInicio)}
            </Text>
          </View>
          <View style={styles.fechaItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={SECONDARY_COLOR}
            />
            <Text style={styles.fechaTexto}>Fin: {formatDate(fechaFin)}</Text>
          </View>
          <View style={styles.fechaItem}>
            <Ionicons name="time-outline" size={16} color={SECONDARY_COLOR} />
            <Text style={styles.fechaTexto}>
              Duración: {duracion} {duracion === 1 ? "día" : "días"}
            </Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.detallesContainer}>
            <View style={styles.divider} />
            <Text style={styles.detallesTitle}>Detalles del Agricultor</Text>

            <View style={styles.detallesItem}>
              <Ionicons
                name="person-outline"
                size={16}
                color={SECONDARY_COLOR}
              />
              <Text style={styles.detallesTexto}>
                Razón Social: {agricultor.nombre}
              </Text>
            </View>

            <View style={styles.detallesItem}>
              <Ionicons name="call-outline" size={16} color={SECONDARY_COLOR} />
              <Text style={styles.detallesTexto}>
                Teléfono: {agricultor.telefono}
              </Text>
            </View>

            <View style={styles.detallesItem}>
              <Ionicons
                name="location-outline"
                size={16}
                color={SECONDARY_COLOR}
              />
              <Text style={styles.detallesTexto}>
                Ubicación: {agricultor.ubicacion}
              </Text>
            </View>

            {/* Botones de acción */}
            <View style={styles.accionesContainer}>
              {estado === "Pendiente" && userProfile?.rol === "admin" && (
                <>
                  <TouchableOpacity
                    style={styles.accionButtonCancelar}
                    onPress={() => confirmarCancelarReserva(id)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.accionButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.accionButtonConfirmar}
                    onPress={() => confirmarConfirmarReserva(id)}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.accionButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </>
              )}

              {estado === "Confirmada" && (
                <TouchableOpacity
                  style={styles.accionButtonConfirmar}
                  onPress={() => confirmarMarcarCompletada(id)}
                >
                  <Ionicons
                    name="checkmark-done-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.accionButtonText}>Completada</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.accionButtonVer}
                onPress={() => handleVerDetalles(item)}
              >
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.accionButtonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar el contenido principal
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>
            Cargando historial de reservas...
          </Text>
        </View>
      );
    }

    if (reservasFiltradas.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={60}
            color={PRIMARY_COLOR}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Sin reservas</Text>
          <Text style={styles.emptyText}>
            No hay reservas{" "}
            {filtroActivo !== "Todas" ? `con estado "${filtroActivo}"` : ""} en
            tu historial.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={reservasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderReserva}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
      />
    );
  };

  return (
    <MainLayout>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Historial de Reservas</Text>
            <Text style={styles.headerSubtitle}>
              Revisa todas tus reservas de maquinaria agrícola
            </Text>
          </View>

          {renderFiltroPicker()}

          <View style={styles.contentContainer}>{renderContent()}</View>
          {/* Modal de detalles completos */}
          {renderDetallesModal()}
        </View>
      </LinearGradient>
    </MainLayout>
  );
}
