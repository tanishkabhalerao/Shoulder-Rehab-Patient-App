import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/src/state';

export default function IndexRoute() {
  const colors = useColors();
  const { hydrated, isAuthenticated } = useApp();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/login'} />;
}