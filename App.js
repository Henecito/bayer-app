// App.js
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 👈 NUEVO

import { supabase } from './src/supabase/supabase';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReservasScreen from './src/screens/ReservasScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import MaquinasScreen from './src/screens/MaquinasScreen';
import HistorialReservasScreen from './src/screens/HistorialReservasScreen';
import SeleccionUbicacionScreen from './src/screens/SeleccionUbicacionScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Reservas" component={ReservasScreen} />
              <Stack.Screen name="HistorialReservas" component={HistorialReservasScreen} />
              <Stack.Screen name="Maquinas" component={MaquinasScreen} />
              <Stack.Screen name="Perfil" component={PerfilScreen} />
              <Stack.Screen name="SeleccionUbicacion" component={SeleccionUbicacionScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
