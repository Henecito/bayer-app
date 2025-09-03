import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../components/MainLayout';
import { supabase } from '../supabase/supabase';

export default function PerfilScreen() {
  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: '',
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        Alert.alert('Error', 'No hay usuario logueado');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('nombre, apellido, email, rol')
        .eq('id', session.user.id)
        .single();

      if (error) {
        Alert.alert('Error', 'No se pudo cargar el perfil');
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    } else {
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Debes completar ambos campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña: ' + error.message);
    } else {
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
      setModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <View style={styles.container}>
          <Text>Cargando perfil...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <LinearGradient
        colors={['#88d42b03', '#07bbfdd9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <View style={styles.profileCard}>
            <Ionicons
              name="person-circle-outline"
              size={80}
              color="#07bbfdd9"
              style={styles.profileIcon}
            />
            <Text style={styles.name}>
              {profile.nombre} {profile.apellido}
            </Text>
            <Text style={styles.infoText}>{profile.email}</Text>
            <Text style={styles.infoText}>
              {profile.rol === 'admin' ? 'Administrador' : profile.rol || 'Usuario'}
            </Text>
          </View>

          <TouchableOpacity style={styles.fullWidthButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="key-outline" size={20} color="#07bbfdd9" />
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          {/* Modal para cambiar contraseña */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Cambiar contraseña</Text>
                <TextInput
                  placeholder="Nueva contraseña"
                  secureTextEntry
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  placeholder="Confirmar nueva contraseña"
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={[styles.modalButton, updatingPassword && { opacity: 0.6 }]}
                  onPress={handleChangePassword}
                  disabled={updatingPassword}
                >
                  <Text style={styles.modalButtonText}>
                    {updatingPassword ? 'Actualizando...' : 'Actualizar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#aaa', marginTop: 10 }]}
                  onPress={() => setModalVisible(false)}
                  disabled={updatingPassword}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </LinearGradient>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 30,
  },
  profileIcon: {
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: '#07bbfdd9',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#07bbfdd9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
