import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../supabase/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import textStyles from "../styles/textStyles";
import styles from "../styles/sidebarStyles";

const Sidebar = ({ visible, onClose }) => {
  const navigation = useNavigation();

  const slideX = useRef(new Animated.Value(-styles.SIDEBAR_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const [expandedSection, setExpandedSection] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState({ nombre: "", apellido: "", rol: "" });

  useEffect(() => {
    if (visible) {
      fetchUserProfile();
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: -styles.SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setExpandedSection(null);
        setUserDropdown(false);
        setModalVisible(false);
      });
    }
  }, [visible]);

  const fetchUserProfile = async () => {
    try {
      const perfilCacheado = await AsyncStorage.getItem("userProfile");
      if (perfilCacheado) {
        setUserProfile(JSON.parse(perfilCacheado));
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("nombre, apellido, rol")
        .eq("id", session.user.id)
        .single();

      if (error) return;
      setUserProfile(data);
      await AsyncStorage.setItem("userProfile", JSON.stringify(data));
    } catch (error) {
      console.error("Error en fetchUserProfile:", error);
    }
  };

  const toggleSection = (section) => setExpandedSection(prev => (prev === section ? null : section));

  const toggleUserDropdown = () => {
    if (userDropdown) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setUserDropdown(false));
    } else {
      setUserDropdown(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const navigateAndClose = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <>
      {visible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      )}

      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideX }], opacity },
        ]}
      >
        <Image
          source={require("../../assets/images/bayer-logo-cuadrado.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text
          style={[textStyles.h1, styles.menuTitle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Menú
        </Text>

        <Section label="Inicio" expanded={expandedSection === "inicio"} onPress={() => toggleSection("inicio")}>
          <SubItem label="Ir a Inicio" onPress={() => navigateAndClose("Home")} />
        </Section>

        {(userProfile.rol === "admin" || userProfile.rol === "zonal") && (
          <Section label="Reservas" expanded={expandedSection === "reservas"} onPress={() => toggleSection("reservas")}>
            <SubItem label="Reservar Máquina" onPress={() => navigateAndClose("Reservas")} />
            <SubItem label="Historial de Reservas" onPress={() => navigateAndClose("HistorialReservas")} />
          </Section>
        )}

        {userProfile.rol === "admin" && (
          <Section label="Máquinas" expanded={expandedSection === "maquinas"} onPress={() => toggleSection("maquinas")}>
            <SubItem label="Ver Máquinas" onPress={() => navigateAndClose("Maquinas")} />
          </Section>
        )}

        <View style={styles.userCard}>
          <TouchableOpacity style={styles.userContainer} onPress={toggleUserDropdown}>
            <Icon name="person-circle" size={45} color="#fff" />
            <View style={styles.userDetails}>
              <Text
                style={[textStyles.body, styles.userName]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {userProfile.nombre && userProfile.apellido ? `${userProfile.nombre} ${userProfile.apellido}` : "Usuario"}
              </Text>
              <Text
                style={[textStyles.caption, styles.userRole]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {userProfile.rol === "admin"
                  ? "Administrador"
                  : userProfile.rol === "zonal"
                  ? "Zonal"
                  : userProfile.rol || "Invitado"}
              </Text>
            </View>
          </TouchableOpacity>

          {userDropdown && (
            <Animated.View
              style={[
                styles.dropdown,
                {
                  opacity: dropdownAnim,
                  height: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 76],
                  }),
                },
              ]}
            >
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setUserDropdown(false); navigateAndClose("Perfil"); }}>
                <Text
                  style={[textStyles.body, styles.modalButtonText]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={1}
                >
                  Perfil
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setModalVisible(true); setUserDropdown(false); }}>
                <Text
                  style={[textStyles.body, styles.modalButtonText]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={1}
                >
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text
                style={[textStyles.h2, styles.modalTitle]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                ¿Estás seguro de que quieres salir?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={async () => {
                  try {
                    const { error } = await supabase.auth.signOut();
                    if (error) return alert("Error al cerrar sesión: " + error.message);
                    await AsyncStorage.clear();
                    setModalVisible(false);
                    onClose();
                  } catch (e) {
                    alert("Error inesperado al cerrar sesión");
                  }
                }}>
                  <Text
                    style={[textStyles.body, styles.modalButtonText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    Sí, salir
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text
                    style={[textStyles.body, styles.modalButtonText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </>
  );
};

const Section = ({ label, expanded, onPress, children }) => (
  <View style={styles.sectionContainer}>
    <TouchableOpacity onPress={onPress} style={styles.sectionHeader}>
      <Text
        style={textStyles.h2}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
      <Icon name={expanded ? "chevron-up" : "chevron-down"} size={22} />
    </TouchableOpacity>
    {expanded && <View style={styles.subMenu}>{children}</View>}
  </View>
);

const SubItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.subItemContainer} onPress={onPress}>
    <Text
      style={textStyles.body}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.8}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default Sidebar;
