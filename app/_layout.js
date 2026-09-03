import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { CategoryProvider } from '../context/CategoryContext';

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();
  const { theme, themeKey } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={themeKey === 'dark' || themeKey === 'midnight' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/accept-invite" options={{ headerShown: false }} />
        <Stack.Screen name="add-item" options={{ title: 'Add Item', presentation: 'modal' }} />
        <Stack.Screen name="record-sale" options={{ title: 'Record Sale', presentation: 'modal' }} />
        <Stack.Screen name="adjust-stock" options={{ title: 'Adjust Stock', presentation: 'modal' }} />
        <Stack.Screen name="invite" options={{ title: 'Invite Team Member', presentation: 'modal' }} />
        <Stack.Screen name="add-category" options={{ title: 'Add Category', presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CategoryProvider>
          <RootNavigator />
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}