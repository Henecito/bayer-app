import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from './Sidebar';

const { width, height } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';
const isSmallAndroid = isAndroid && height < 750;

export default function MainLayout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const closeSidebar = () => setSidebarVisible(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Overlay */}
        {sidebarVisible && (
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Sidebar */}
        <Sidebar visible={sidebarVisible} onClose={closeSidebar} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu-outline" size={28} color="#000" />
          </TouchableOpacity>
          <View style={{ width: 28 }} />
        </View>

        {/* Body */}
        <View style={styles.body}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 16 : 0,
    paddingBottom: isSmallAndroid ? 32 : 0, 
  },
  header: {
    height: 45,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    width,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 9,
  },
});
