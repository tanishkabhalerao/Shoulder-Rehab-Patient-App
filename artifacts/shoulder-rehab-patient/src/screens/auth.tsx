import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useApp } from '../state';
import type { UserRole } from '../models';
import {
  AppText,
  BrandMark,
  Button,
  Card,
  ChoiceRow,
  Field,
  Pill,
} from '../ui';

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.authContent,
        { paddingTop: insets.top + 18, paddingBottom: Math.max(insets.bottom, 20) + 28 },
      ]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={30}
    >
      <View style={styles.brandRow}>
        <BrandMark size={50} />
        <View>
          <AppText style={styles.brandName}>MOTION</AppText>
          <AppText muted style={styles.brandSub}>SHOULDER CARE</AppText>
        </View>
      </View>
      <View style={styles.authHeading}>
        <Pill label="AI DIGITAL TWIN PHYSIOTHERAPY" tone="good" />
        <AppText style={styles.authTitle}>{title}</AppText>
        <AppText muted style={styles.authSubtitle}>{subtitle}</AppText>
      </View>
      {children}
      <AppText muted style={styles.footnote}>
        Academic prototype · Sample data only · Not medical advice
      </AppText>
    </KeyboardAwareScrollViewCompat>
  );
}

export function LoginScreen() {
  const colors = useColors();
  const { signIn, continueAsDemo } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('patient@test.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!selectedRole) {
      setError('Select a profile before signing in.');
      return;
    }
    const result = signIn(email, password, selectedRole);
    if (result) {
      setError(result);
      return;
    }
    router.replace(selectedRole === 'patient' ? '/(tabs)' : '/(physio)');
  };

  return (
    <AuthLayout
      title="Your plan, in one place."
      subtitle="Choose your care profile to open the right workspace."
    >
      <View style={styles.roleGrid}>
        <ProfileChoice
          icon="user"
          title="Patient"
          description="Exercises, sessions, progress and your Digital Twin."
          selected={selectedRole === 'patient'}
          onPress={() => {
            setSelectedRole('patient');
            setEmail('patient@test.com');
            setPassword('');
            setError('');
          }}
        />
        <ProfileChoice
          icon="heart"
          title="Physiotherapist"
          description="Patients, plans, sessions and clinical analysis."
          selected={selectedRole === 'physiotherapist'}
          onPress={() => {
            setSelectedRole('physiotherapist');
            setEmail('physio@test.com');
            setPassword('');
            setError('');
          }}
        />
      </View>
      <Card style={styles.formCard}>
        <View style={styles.loginContext}>
          <Pill label={selectedRole ? selectedRole.toUpperCase() : 'SELECT A PROFILE'} tone={selectedRole ? 'good' : 'neutral'} />
          <AppText muted style={styles.demoNote}>
            {selectedRole === 'physiotherapist'
              ? 'Professional workspace for managing rehabilitation plans and patient outcomes.'
              : 'Personal workspace for completing assigned rehabilitation exercises.'}
          </AppText>
        </View>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          testID="login-email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          testID="login-password"
        />
        {error ? <AppText style={{ color: colors.destructive, fontSize: 13 }}>{error}</AppText> : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgot}
        >
          <AppText style={[styles.linkText, { color: colors.primary }]}>Forgot password?</AppText>
        </Pressable>
        <Button
          label={selectedRole === 'physiotherapist' ? 'Login as Physiotherapist' : 'Login as Patient'}
          onPress={submit}
          icon="arrow-right"
          testID="login-submit"
          disabled={!selectedRole}
        />
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <AppText muted style={styles.orText}>OR</AppText>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>
        <Button
          label={`Continue as ${selectedRole === 'physiotherapist' ? 'Physiotherapist' : 'Patient'}`}
          onPress={() => {
            const role = selectedRole ?? 'patient';
            continueAsDemo(role);
            router.replace(role === 'patient' ? '/(tabs)' : '/(physio)');
          }}
          variant="secondary"
          icon="user"
          testID="demo-sign-in"
        />
        <AppText muted style={styles.demoNote}>
          Patient: patient@test.com / Patient123 · Physiotherapist: physio@test.com / Physio123
        </AppText>
      </Card>
      <View style={styles.authFooter}>
        <AppText muted>New to the patient app?</AppText>
        <Pressable onPress={() => router.push('/(auth)/register')} accessibilityRole="button">
          <AppText style={[styles.linkText, { color: colors.primary }]}>Create an account</AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

function ProfileChoice({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: 'user' | 'heart';
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.profileChoice,
        {
          backgroundColor: selected ? colors.heroSoft : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={[styles.profileChoiceIcon, { backgroundColor: selected ? colors.primary : colors.secondary }]}>
        <Feather name={icon} size={20} color={selected ? colors.primaryForeground : colors.primary} />
      </View>
      <AppText style={styles.profileChoiceTitle}>{title}</AppText>
      <AppText muted style={styles.profileChoiceDescription}>{description}</AppText>
      {selected ? <Feather name="check-circle" size={18} color={colors.primary} /> : null}
    </Pressable>
  );
}

export function RegisterScreen() {
  const colors = useColors();
  const { register } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!fullName.trim() || !/^\S+@\S+\.\S+$/.test(email.trim()) || !phone.trim()) {
      setError('Add your name, a valid email, and phone number.');
      return;
    }
    if (!Number.isFinite(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      setError('Enter an age between 1 and 120.');
      return;
    }
    if (password.length < 6 || password !== confirmPassword) {
      setError(password !== confirmPassword ? 'Passwords do not match.' : 'Use at least 6 characters for the demo password.');
      return;
    }
    register({ fullName: fullName.trim(), email: email.trim(), age: Number(age), gender, phone: phone.trim() }, password);
    router.replace('/(tabs)');
  };

  return (
    <AuthLayout
      title="Create your profile."
      subtitle="Set up a patient profile for the shoulder rehabilitation prototype."
    >
      <Card style={styles.formCard}>
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" autoComplete="name" testID="register-name" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" testID="register-email" />
        <View style={styles.formRow}>
          <Field label="Age" value={age} onChangeText={setAge} placeholder="Age" keyboardType="number-pad" containerStyle={styles.flexField} />
          <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" containerStyle={styles.flexField} />
        </View>
        <View style={styles.genderBlock}>
          <AppText style={styles.fieldLabel}>Gender</AppText>
          <ChoiceRow
            options={['Woman', 'Man', 'Non-binary', 'Prefer not to say']}
            value={gender}
            onChange={setGender}
          />
        </View>
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry testID="register-password" />
        <Field label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" secureTextEntry testID="register-confirm-password" />
        {error ? <AppText style={{ color: colors.destructive, fontSize: 13 }}>{error}</AppText> : null}
        <Button label="Create demo profile" onPress={submit} icon="arrow-right" testID="register-submit" />
        <AppText muted style={styles.demoNote}>
          Prototype only. This form stores sample profile details on this device.
        </AppText>
      </Card>
      <View style={styles.authFooter}>
        <AppText muted>Already have an account?</AppText>
        <Pressable onPress={() => router.replace('/(auth)/login')} accessibilityRole="button">
          <AppText style={[styles.linkText, { color: colors.primary }]}>Sign in</AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

export function ForgotPasswordScreen() {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  return (
    <AuthLayout
      title="Reset your password."
      subtitle="Password reset email is not connected in this prototype."
    >
      <Card style={styles.formCard}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          testID="reset-email"
        />
        {notice ? <AppText style={{ color: colors.primary }}>{notice}</AppText> : null}
        <Button
          label="Request reset link"
          onPress={() => {
            setNotice(/^\S+@\S+\.\S+$/.test(email.trim())
              ? 'This demo does not send email. Connect an authentication provider to enable password reset.'
              : 'Enter a valid email address.');
          }}
          icon="mail"
        />
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/login')} variant="quiet" />
      </Card>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  authContent: { flexGrow: 1, paddingHorizontal: 22, gap: 22, width: '100%', maxWidth: 560, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 2.6 },
  brandSub: { fontSize: 9, letterSpacing: 1.3, marginTop: 1 },
  authHeading: { gap: 10 },
  authTitle: { fontFamily: 'Inter_700Bold', fontSize: 31, lineHeight: 38, letterSpacing: -0.9, maxWidth: 360 },
  authSubtitle: { fontSize: 15, lineHeight: 23, maxWidth: 380 },
  formCard: { padding: 18, gap: 17 },
  forgot: { alignSelf: 'flex-end', marginTop: -4 },
  linkText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: -3 },
  dividerLine: { height: 1, flex: 1 },
  orText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  demoNote: { fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 8 },
  authFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  footnote: { fontSize: 10, textAlign: 'center', marginTop: 'auto' },
  formRow: { flexDirection: 'row', gap: 10 },
  flexField: { flex: 1 },
  genderBlock: { gap: 8 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  roleGrid: { flexDirection: 'row', gap: 10 },
  profileChoice: { flex: 1, borderWidth: 1, borderRadius: 20, padding: 14, gap: 8, minHeight: 170 },
  profileChoiceIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  profileChoiceTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 4 },
  profileChoiceDescription: { fontSize: 11, lineHeight: 16, flex: 1 },
  loginContext: { gap: 8, paddingBottom: 3 },
});