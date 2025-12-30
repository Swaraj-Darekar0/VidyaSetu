import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="class-selection" />
      <Stack.Screen name="subject-selection" />
    </Stack>
  );
}
