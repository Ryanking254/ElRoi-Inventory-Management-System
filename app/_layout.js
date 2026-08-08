import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="add-item" options={{ title: 'Add Item', presentation: 'modal' }} />
        <Stack.Screen name="record-sale" options={{ title: 'Record Sale', presentation: 'modal' }} />
        <Stack.Screen name="adjust-stock" options={{ title: 'Adjust Stock', presentation: 'modal' }} />
        <Stack.Screen name="invite" options={{ title: 'Invite Team Member', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
