import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '../state';
import { AppText, Button, Card, ChoiceRow, Field, Pill, Screen, ScreenHeader } from '../ui';

export function EditProfileScreen() {
  const colors = useColors();
  const { patient, updateProfile } = useApp();
  const [fullName, setFullName] = useState(patient.fullName);
  const [email, setEmail] = useState(patient.email);
  const [age, setAge] = useState(String(patient.age));
  const [gender, setGender] = useState(patient.gender);
  const [phone, setPhone] = useState(patient.phone);
  const [error, setError] = useState('');
  return (
    <Screen>
      <View style={styles.backHeader}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
        <View><AppText style={styles.title}>Edit profile</AppText><AppText muted style={styles.subtitle}>Update your patient details</AppText></View>
      </View>
      <Card style={styles.formCard}>
        <Field label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View style={styles.formRow}>
          <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" containerStyle={styles.flex} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" containerStyle={styles.flex} />
        </View>
        <View style={styles.genderBlock}>
          <AppText style={styles.label}>Gender</AppText>
          <ChoiceRow options={['Woman', 'Man', 'Non-binary', 'Prefer not to say']} value={gender} onChange={setGender} />
        </View>
        <View style={[styles.lockedNote, { backgroundColor: colors.secondary }]}>
          <Feather name="lock" size={15} color={colors.primary} />
          <AppText muted style={styles.noteText}>Your exercise plan and physiotherapist assignment are managed by your care team.</AppText>
        </View>
        {error ? <AppText style={{ color: colors.destructive }}>{error}</AppText> : null}
        <Button
          label="Save changes"
          icon="check"
          onPress={() => {
            if (!fullName.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || !phone.trim() || Number(age) < 1 || Number(age) > 120) {
              setError('Check your name, email, age, and phone number.');
              return;
            }
            updateProfile({ fullName: fullName.trim(), email: email.trim(), age: Number(age), gender, phone: phone.trim() });
            router.back();
          }}
        />
      </Card>
      <Pill label="DEMO PROFILE · SAVED ON DEVICE" />
    </Screen>
  );
}

export function ChangePasswordScreen() {
  const colors = useColors();
  const { demoPassword, updateDemoPassword } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const save = () => {
    setError('');
    if (next.length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (next !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    const result = updateDemoPassword(current, next);
    if (result) {
      setError(result);
      return;
    }
    setMessage('Demo password updated on this device.');
    setCurrent('');
    setNext('');
    setConfirm('');
  };
  return (
    <Screen>
      <ScreenHeader title="Change password" subtitle="Prototype sign-in only" />
      <Card style={styles.formCard}>
        <View style={[styles.lockedNote, { backgroundColor: colors.warningSurface }]}>
          <Feather name="info" size={15} color={colors.warning} />
          <AppText muted style={styles.noteText}>There is no connected authentication provider. This changes only the demo password stored on this device.</AppText>
        </View>
        <Field label="Current demo password" value={current} onChangeText={setCurrent} secureTextEntry autoComplete="off" />
        <Field label="New password" value={next} onChangeText={setNext} secureTextEntry autoComplete="off" />
        <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="off" />
        {error ? <AppText style={{ color: colors.destructive }}>{error}</AppText> : null}
        {message ? <AppText style={{ color: colors.primary }}>{message}</AppText> : null}
        <Button label="Save demo password" icon="key" onPress={save} />
      </Card>
      <Button label="Back to profile" icon="arrow-left" variant="outline" onPress={() => router.back()} />
      <AppText muted style={styles.tinyNote}>Current local demo password length: {demoPassword.length} characters.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 23 },
  subtitle: { fontSize: 12, marginTop: 2 },
  formCard: { gap: 17 },
  formRow: { flexDirection: 'row', gap: 11 },
  genderBlock: { gap: 8 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  lockedNote: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  noteText: { flex: 1, fontSize: 11, lineHeight: 17 },
  tinyNote: { fontSize: 10, textAlign: 'center' },
});