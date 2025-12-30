import { Redirect } from 'expo-router';

const LOGIN_ROUTE = '/onboarding/login' as const;

export default function OnboardingIndex() {
  return <Redirect href={LOGIN_ROUTE as never} />;
}
