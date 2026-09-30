import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function PhysiotherapistLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: { height: Platform.OS === 'web' ? 84 : undefined, paddingTop: 6, backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Feather name="grid" size={20} color={color} /> }} />
      <Tabs.Screen name="patients" options={{ title: 'Patients', tabBarIcon: ({ color }) => <Feather name="users" size={20} color={color} /> }} />
      <Tabs.Screen name="plans" options={{ title: 'Plans', tabBarIcon: ({ color }) => <Feather name="clipboard" size={20} color={color} /> }} />
      <Tabs.Screen name="analysis" options={{ title: 'Pose AI', tabBarIcon: ({ color }) => <Feather name="activity" size={20} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color} /> }} />
    </Tabs>
  );
}