import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  styles,
  COLORS,
  CARD_GRADIENT,
  HEADER_GRADIENT,
  MAIN_CARD_GRADIENT,
} from "../styles/maquinasStyles";
import MainLayout from "../components/MainLayout";

import { supabase } from "../supabase/supabase";

const { width, height } = Dimensions.get("window");

const getMachineImage = (modelName) => {
  switch (modelName.toLowerCase()) {
    case "grazmec 120":
    case "grazmec 120 nueva":
    default:
      return require("../../assets/images/grazmec120.jpeg");
  }
};

const StatusBadge = ({ available }) => (
  <View
    style={[
      styles.badge,
      {
        backgroundColor: available
          ? `${COLORS.success}20`
          : `${COLORS.error}20`,
      },
    ]}
  >
    <View
      style={[
        styles.badgeDot,
        { backgroundColor: available ? COLORS.success : COLORS.error },
      ]}
    />
    <Text
      style={[
        styles.badgeText,
        { color: available ? COLORS.success : COLORS.error },
      ]}
    >
      {available ? "Disponible" : "En mantención"}
    </Text>
  </View>
);

export default function MaquinasScreen() {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modeloActivo, setModeloActivo] = useState(null);
  const [updatingMachine, setUpdatingMachine] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    try {
      setRefreshing(true);
      setLoading(true);

      const { data, error } = await supabase.from("machines").select("*");

      if (error) throw error;

      const grouped = data.reduce((acc, machine) => {
        const model = machine.model;
        if (!acc[model]) acc[model] = [];
        acc[model].push(machine);
        return acc;
      }, {});

      const groupedArray = Object.entries(grouped).map(([model, machines]) => ({
        nombre: model,
        description: machines[0]?.description || "",
        disponibilidad:
          machines.filter((m) => m.status).length + "/" + machines.length,
        codigos: machines
          .map(({ id, code, status }) => ({
            id,
            codigo: code,
            disponible: status,
          }))
          .sort((a, b) => {
            const parseCode = (code) => {
              const parts = code.split("-");
              if (parts.length === 1) {
                const num = parseInt(parts[0], 10);
                return { main: isNaN(num) ? parts[0] : num, sub: 0 };
              } else {
                const mainNum = parseInt(parts[0], 10);
                const main = isNaN(mainNum) ? parts[0] : mainNum;
                const subNum = parseInt(parts[1], 10);
                const sub = isNaN(subNum) ? parts[1] : subNum;
                return { main, sub };
              }
            };

            const codeA = parseCode(a.codigo);
            const codeB = parseCode(b.codigo);

            if (codeA.main < codeB.main) return -1;
            if (codeA.main > codeB.main) return 1;

            if (codeA.sub < codeB.sub) return -1;
            if (codeA.sub > codeB.sub) return 1;

            return 0;
          }),
      }));

      setMaquinas(groupedArray);
    } catch (error) {
      console.error("Error fetching machines:", error.message);
      Alert.alert("Error", "No se pudieron cargar las máquinas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Cambiar estado de máquina
  const toggleMachineStatus = async (machineId, currentStatus) => {
    if (updatingMachine === machineId) return;

    const newStatus = !currentStatus;
    setUpdatingMachine(machineId);

    try {
      // Actualizar estado local inmediatamente
      setMaquinas((prevMaquinas) =>
        prevMaquinas.map((maquina) => ({
          ...maquina,
          codigos: maquina.codigos.map((codigo) =>
            codigo.id === machineId
              ? { ...codigo, disponible: newStatus }
              : codigo
          ),
          disponibilidad: (() => {
            const updatedCodigos = maquina.codigos.map((codigo) =>
              codigo.id === machineId
                ? { ...codigo, disponible: newStatus }
                : codigo
            );
            const disponibles = updatedCodigos.filter(
              (c) => c.disponible
            ).length;
            return `${disponibles}/${updatedCodigos.length}`;
          })(),
        }))
      );

      // Actualizar modeloActivo si está abierto el modal
      setModeloActivo((prev) =>
        prev
          ? {
              ...prev,
              codigos: prev.codigos.map((codigo) =>
                codigo.id === machineId
                  ? { ...codigo, disponible: newStatus }
                  : codigo
              ),
            }
          : prev
      );

      // Actualizar en Supabase
      const { error } = await supabase
        .from("machines")
        .update({ status: newStatus })
        .eq("id", machineId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating machine status:", error.message);
      Alert.alert("Error", "No se pudo actualizar el estado de la máquina");
      fetchMachines(); // Revertir estado
    } finally {
      setTimeout(() => setUpdatingMachine(null), 300);
    }
  };

  const abrirModal = (maquina) => {
    setModeloActivo(maquina);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setModeloActivo(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <View style={styles.containerCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando máquinas...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary}
          translucent
        />
        <LinearGradient
          colors={["#88d42b03", "#07bbfdd9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Maquinaria</Text>
                <Text style={styles.headerSubtitle}>
                  {maquinas.length} modelos ·{" "}
                  {maquinas.reduce((total, m) => total + m.codigos.length, 0)}{" "}
                  unidades
                </Text>
              </View>
            </View>

            <View style={styles.container}>
              <View style={styles.mainCardContainer}>
                <LinearGradient
                  colors={MAIN_CARD_GRADIENT}
                  style={styles.mainCard}
                >
                  <View style={styles.mainCardHeader}>
                    <MaterialCommunityIcons
                      name="tractor-variant"
                      size={22}
                      color={COLORS.primary}
                    />
                    <Text style={styles.mainCardTitle}>
                      Equipo disponible - Admin
                    </Text>
                  </View>

                  <View style={styles.searchSection}>
                    <MaterialCommunityIcons
                      name="magnify"
                      size={20}
                      color={COLORS.darkGray}
                    />
                    <Text style={styles.searchPlaceholder}>
                      Buscar máquinas...
                    </Text>
                    <View style={styles.adminBadge}>
                      <MaterialCommunityIcons
                        name="shield-account"
                        size={16}
                        color={COLORS.warning}
                      />
                      <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                  </View>

                  <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                  >
                    {maquinas.map((maquina) => {
                      const disponibles = maquina.codigos.filter(
                        (c) => c.disponible
                      ).length;
                      const total = maquina.codigos.length;
                      const porcentaje = Math.round(
                        (disponibles / total) * 100
                      );

                      return (
                        <TouchableOpacity
                          key={maquina.nombre}
                          style={styles.card}
                          onPress={() => abrirModal(maquina)}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={CARD_GRADIENT}
                            style={styles.cardContent}
                          >
                            <View style={styles.cardImageContainer}>
                              <Image
                                source={getMachineImage(maquina.nombre)}
                                style={styles.cardImage}
                              />
                            </View>

                            <View style={styles.cardInfo}>
                              <Text style={styles.cardTitle}>
                                {maquina.nombre}
                              </Text>
                              {maquina.description ? (
                                <Text
                                  style={styles.cardDescription}
                                  numberOfLines={1}
                                >
                                  {maquina.description}
                                </Text>
                              ) : null}

                              <View style={styles.statsContainer}>
                                <View style={styles.progressContainer}>
                                  <View style={styles.progressBar}>
                                    <View
                                      style={[
                                        styles.progressFill,
                                        {
                                          width: `${porcentaje}%`,
                                          backgroundColor:
                                            porcentaje > 50
                                              ? COLORS.success
                                              : COLORS.error,
                                        },
                                      ]}
                                    />
                                  </View>
                                  <Text style={styles.progressText}>
                                    {disponibles}/{total} disponibles
                                  </Text>
                                </View>

                                <View style={styles.arrowContainer}>
                                  <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={22}
                                    color={COLORS.primary}
                                  />
                                </View>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </LinearGradient>
              </View>
            </View>
          </SafeAreaView>

          <Modal visible={showModal} transparent animationType="slide">
            <SafeAreaView
              style={{ flex: 1, backgroundColor: COLORS.overlay }}
              edges={["top", "bottom"]}
            >
              <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.overlay}
                translucent
              />

              {/* Fondo de desenfoque oscuro */}
              <View style={[styles.modalOverlay, { flex: 1 }]}>
                {/* Contenedor principal de la modal */}
                <View style={[styles.modalContainer, { flex: 1 }]}>
                  {/* Header */}
                  <LinearGradient
                    colors={HEADER_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalHeader}
                  >
                    <View style={styles.modalHeaderContent}>
                      <MaterialCommunityIcons
                        name="tractor"
                        size={24}
                        color={COLORS.white}
                      />
                      <Text style={styles.modalTitle}>
                        {modeloActivo?.nombre}
                      </Text>
                      <View style={styles.adminModalBadge}>
                        <MaterialCommunityIcons
                          name="shield-account"
                          size={16}
                          color={COLORS.white}
                        />
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Imagen y descripción */}
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={
                        modeloActivo && getMachineImage(modeloActivo.nombre)
                      }
                      style={styles.modalImage}
                    />
                    <Text style={styles.modalDescription}>
                      {modeloActivo?.description ||
                        "Sin descripción disponible"}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={styles.modalDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Gestionar unidades</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Lista de máquinas */}
                  <ScrollView
                    contentContainerStyle={styles.modalContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {modeloActivo?.codigos.map(({ id, codigo, disponible }) => (
                      <View
                        key={id}
                        style={[
                          styles.codigoItem,
                          {
                            backgroundColor: disponible ? "#e5f9ed" : "#ffe5e5",
                            opacity: updatingMachine === id ? 0.6 : 1,
                          },
                        ]}
                      >
                        <View style={styles.codigoIconContainer}>
                          {updatingMachine === id ? (
                            <ActivityIndicator
                              size="small"
                              color={COLORS.primary}
                            />
                          ) : (
                            <Ionicons
                              name={
                                disponible ? "checkmark-circle" : "close-circle"
                              }
                              size={22}
                              color={disponible ? COLORS.success : COLORS.error}
                            />
                          )}
                        </View>

                        <View style={styles.codigoTextContainer}>
                          <Text style={styles.codigoTexto}>{codigo}</Text>
                          <StatusBadge available={disponible} />
                        </View>

                        <View style={styles.switchContainer}>
                          <Switch
                            value={disponible}
                            onValueChange={() =>
                              toggleMachineStatus(id, disponible)
                            }
                            disabled={updatingMachine === id}
                            trackColor={{ false: "#ffcccb", true: "#90EE90" }}
                            thumbColor={disponible ? "#4caf50" : "#f44336"}
                            ios_backgroundColor="#ffcccb"
                            style={styles.switch}
                          />
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Footer */}
                  <View style={styles.modalFooter}>
                    <Text style={styles.adminInstructions}>
                      Usa los switches para cambiar el estado de las máquinas
                    </Text>
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={cerrarModal}
                    >
                      <Text style={styles.primaryButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        </LinearGradient>
      </MainLayout>
    </>
  );
}
