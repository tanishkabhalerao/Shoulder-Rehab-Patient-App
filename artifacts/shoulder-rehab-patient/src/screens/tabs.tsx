import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TODAY_EXERCISE_IDS } from '../data';
import { useApp } from '../state';
import type { Exercise } from '../models';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Eyebrow,
  MetricTile,
  MiniLineChart,
  Pill,
  ProgressBar,
  Screen,
  ScreenHeader,
} from '../ui';
import { useColors } from '@/hooks/useColors';

function ExerciseListRow({ exercise, index = 0 }: { exercise: Exercise; index?: number }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      testID={`exercise-${exercise.id}`}
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
      style={({ pressed }) => [
        styles.exerciseRow,
        { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.83 : 1 },
      ]}
    >
      <View style={[styles.exerciseIcon, { backgroundColor: index % 2 === 0 ? colors.heroSoft : colors.warningSurface }]}>
        <Feather name={index % 2 === 0 ? 'activity' : 'move'} size={19} color={index % 2 === 0 ? colors.primary : colors.warning} />
      </View>
      <View style={styles.rowMain}>
        <AppText style={styles.exerciseName}>{exercise.name}</AppText>
        <AppText muted style={styles.rowMeta}>{exercise.sets} sets · {exercise.reps} reps · {exercise.durationMinutes} min</AppText>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function HomeScreen() {
  const colors = useColors();
  const { patient, sessions, assignedExercises } = useApp();
  const nextExercise = assignedExercises[0];
  const todayExercises = assignedExercises.filter((exercise) => TODAY_EXERCISE_IDS.includes(exercise.id));
  const firstName = patient.fullName.split(' ')[0] || 'there';
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const recentSession = sessions[0];

  if (!nextExercise) return null;
  return (
    <Screen>
      <View style={styles.homeHeader}>
        <View style={styles.flex}>
          <AppText muted style={styles.dateLabel}>{dateLabel}</AppText>
          <AppText style={styles.greeting}>Good morning, {firstName}</AppText>
          <AppText muted style={styles.patientId}>Patient ID · {patient.id}</AppText>
        </View>
        <Avatar name={patient.fullName} onPress={() => router.push('/(tabs)/profile')} />
      </View>

      <View style={[styles.focusBanner, { backgroundColor: colors.hero }]}>
        <View style={styles.focusTop}>
          <View style={styles.focusIcon}>
            <Feather name="activity" size={19} color={colors.primary} />
          </View>
          <Pill label="SHOULDER FOCUS" tone="good" />
        </View>
        <AppText style={styles.focusTitle}>Your movement plan is ready.</AppText>
        <AppText style={styles.focusCopy}>A clear view of today's assigned shoulder exercises.</AppText>
        <View style={styles.focusDivider} />
        <View style={styles.planSummary}>
          <View>
            <AppText style={styles.focusNumber}>{todayExercises.length}</AppText>
            <AppText style={styles.focusSmall}>exercises today</AppText>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <AppText style={styles.focusNumber}>20</AppText>
            <AppText style={styles.focusSmall}>estimated minutes</AppText>
          </View>
          <View style={styles.flex} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open today's exercises"
            onPress={() => router.push('/(tabs)/exercises')}
            style={({ pressed }) => [styles.roundArrow, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}
          >
            <Feather name="arrow-up-right" size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <MetricTile label="This week" value="4 / 5" icon="calendar" />
        <MetricTile label="Avg. quality" value="87" unit="%" icon="bar-chart-2" />
        <MetricTile label="Current streak" value="4" unit="days" icon="zap" />
        <MetricTile label="Latest ROM" value={recentSession ? String(recentSession.shoulderRom) : '—'} unit="°" icon="move" />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Eyebrow>UP NEXT</Eyebrow>
          <AppText style={styles.sectionTitle}>Shoulder flexion</AppText>
        </View>
        <Pill label="8 MIN" />
      </View>
      <Card style={styles.nextCard}>
        <View style={styles.nextIcon}>
          <Feather name="arrow-up" size={23} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText style={styles.exerciseName}>{nextExercise.name}</AppText>
          <AppText muted style={styles.rowMeta}>{nextExercise.sets} sets × {nextExercise.reps} reps · {nextExercise.difficulty}</AppText>
        </View>
        <Button
          label="Start"
          icon="play"
          onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: nextExercise.id } })}
          style={styles.startButton}
          testID="start-next-exercise"
        />
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <Eyebrow>TODAY'S PLAN</Eyebrow>
          <AppText style={styles.sectionTitle}>Assigned exercises</AppText>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/exercises')} accessibilityRole="button">
          <AppText style={[styles.link, { color: colors.primary }]}>See all</AppText>
        </Pressable>
      </View>
      <View style={styles.rowList}>
        {todayExercises.map((exercise, index) => (
          <ExerciseListRow key={exercise.id} exercise={exercise} index={index} />
        ))}
      </View>
      <View style={[styles.demoNotice, { backgroundColor: colors.secondary }]}>
        <Feather name="info" size={15} color={colors.primary} />
        <AppText muted style={styles.demoNoticeText}>Sample plan and performance values for a prototype.</AppText>
      </View>
    </Screen>
  );
}

export function ExercisesScreen() {
  const colors = useColors();
  const { sessions, assignedExercises } = useApp();
  return (
    <Screen>
      <ScreenHeader title="Exercises" subtitle="Your assigned shoulder plan" />
      <View style={[styles.planHeader, { backgroundColor: colors.heroSoft }]}>
        <View style={styles.planIcon}>
          <Feather name="activity" size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText style={styles.planTitle}>Shoulder movement plan</AppText>
          <AppText muted style={styles.rowMeta}>Assigned by your physiotherapist</AppText>
        </View>
        <Pill label={`${assignedExercises.length} EXERCISES`} tone="good" />
      </View>
      <View style={styles.rowList}>
        {assignedExercises.map((exercise, index) => {
          const completed = sessions.some(
            (session) => session.exerciseId === exercise.id && session.status === 'Completed',
          );
          return (
            <Pressable
              key={exercise.id}
              accessibilityRole="button"
              testID={`exercise-${exercise.id}`}
              onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
              style={({ pressed }) => [
                styles.exerciseCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
              ]}
            >
              <View style={[styles.exerciseArtwork, { backgroundColor: index % 2 ? colors.warningSurface : colors.heroSoft }]}>
                <Feather name={index % 2 ? 'rotate-cw' : 'activity'} size={25} color={index % 2 ? colors.warning : colors.primary} />
                <View style={styles.artworkLabel}><AppText style={styles.artworkLabelText}>SHOULDER</AppText></View>
              </View>
              <View style={styles.exerciseCardBody}>
                <View style={styles.exerciseCardHeading}>
                  <AppText style={styles.exerciseName}>{exercise.name}</AppText>
                  <Feather name="arrow-up-right" size={17} color={colors.mutedForeground} />
                </View>
                <AppText muted style={styles.description} numberOfLines={2}>{exercise.description}</AppText>
                <View style={styles.exerciseMetaRow}>
                  <AppText muted style={styles.rowMeta}>{exercise.sets} sets · {exercise.reps} reps</AppText>
                  <AppText muted style={styles.rowMeta}>{exercise.durationMinutes} min</AppText>
                </View>
                <View style={styles.exerciseCardFooter}>
                  <Pill label={exercise.difficulty} tone={exercise.difficulty === 'Gentle' ? 'good' : 'warning'} />
                  <Pill label={completed ? 'Previously completed' : 'Assigned'} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Card style={styles.planNote}>
        <Feather name="lock" size={16} color={colors.mutedForeground} />
        <AppText muted style={styles.rowMeta}>Exercise prescriptions are view-only in this patient app.</AppText>
      </Card>
    </Screen>
  );
}

export function ProgressScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');
  const { sessions } = useApp();
  const latest = sessions[0];
  const romValues = period === 'Weekly' ? [63, 66, 69, 73, 76] : [54, 58, 62, 68, 76];
  const qualityValues = period === 'Weekly' ? [78, 82, 84, 88, 87] : [73, 76, 81, 85, 87];
  return (
    <Screen>
      <ScreenHeader title="Progress" subtitle="Shoulder performance over time" />
      <View style={styles.periodToggle}>
        {(['Weekly', 'Monthly'] as const).map((item) => {
          const selected = period === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setPeriod(item)}
              style={[styles.periodButton, { backgroundColor: selected ? colors.primary : 'transparent' }]}
            >
              <AppText style={[styles.periodLabel, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{item}</AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.statsGrid}>
        <MetricTile label="Sessions" value="4 / 5" icon="calendar" />
        <MetricTile label="Exercises done" value="18" icon="check-circle" />
        <MetricTile label="Avg. quality" value="87" unit="%" icon="bar-chart-2" />
        <MetricTile label="Current streak" value="4" unit="days" icon="zap" />
      </View>
      <Card>
        <View style={styles.chartHeader}>
          <View style={styles.flex}>
            <Eyebrow>SHOULDER ROM TREND</Eyebrow>
            <AppText style={styles.chartValue}>{latest?.shoulderRom ?? 76}°</AppText>
          </View>
          <Pill label="DEMO DATA" />
        </View>
        <MiniLineChart values={romValues} />
        <View style={styles.chartFooter}><AppText muted style={styles.chartCaption}>{period === 'Weekly' ? 'MON' : 'WEEK 1'}</AppText><AppText muted style={styles.chartCaption}>{period === 'Weekly' ? 'TODAY' : 'THIS MONTH'}</AppText></View>
        <AppText muted style={styles.chartNote}>Illustrative shoulder range values. Not measured by a camera or pose model.</AppText>
      </Card>
      <Card>
        <View style={styles.chartHeader}>
          <View style={styles.flex}>
            <Eyebrow>EXERCISE QUALITY</Eyebrow>
            <AppText style={styles.chartValue}>87%</AppText>
          </View>
          <Feather name="activity" size={18} color={colors.primary} />
        </View>
        <MiniLineChart values={qualityValues} color={colors.warning} />
        <View style={styles.chartFooter}><AppText muted style={styles.chartCaption}>{period === 'Weekly' ? 'MON' : 'WEEK 1'}</AppText><AppText muted style={styles.chartCaption}>{period === 'Weekly' ? 'TODAY' : 'THIS MONTH'}</AppText></View>
        <AppText muted style={styles.chartNote}>Sample performance score; actual movement analysis is not connected.</AppText>
      </Card>
      <Card style={styles.progressCard}>
        <Eyebrow>REPETITION PROGRESS</Eyebrow>
        <View style={styles.progressLine}>
          <AppText style={styles.progressLabel}>Shoulder flexion</AppText>
          <AppText style={styles.progressCount}>30 / 30 reps</AppText>
        </View>
        <ProgressBar value={100} />
        <View style={styles.progressLine}>
          <AppText style={styles.progressLabel}>Shoulder abduction</AppText>
          <AppText style={styles.progressCount}>20 / 30 reps</AppText>
        </View>
        <ProgressBar value={67} color={colors.accent} />
      </Card>
      <View style={styles.progressSummaryGrid}>
        <Card style={styles.summaryCard}>
          <Eyebrow>SESSION CONSISTENCY</Eyebrow>
          <AppText style={styles.summaryNumber}>4 of 5</AppText>
          <AppText muted style={styles.rowMeta}>weekly sessions</AppText>
        </Card>
        <Card style={styles.summaryCard}>
          <Eyebrow>MOVEMENT PERFORMANCE</Eyebrow>
          <AppText style={styles.summaryNumber}>Steady</AppText>
          <AppText muted style={styles.rowMeta}>sample trend label</AppText>
        </Card>
      </View>
      <Button label="View session history" icon="clock" variant="outline" onPress={() => router.push('/history')} />
    </Screen>
  );
}

export function ProfileScreen() {
  const colors = useColors();
  const { patient, sessions, feedback, alerts, storageError, signOut } = useApp();
  return (
    <Screen>
      <ScreenHeader title="Profile" subtitle="Your patient details" />
      <Card style={styles.profileHero}>
        <Avatar name={patient.fullName} size={64} />
        <View style={styles.profileHeroText}>
          <AppText style={styles.profileName}>{patient.fullName}</AppText>
          <AppText muted>{patient.email}</AppText>
          <Pill label={patient.id} tone="good" />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => router.push('/profile/edit')} style={styles.editIcon}>
          <Feather name="edit-2" size={17} color={colors.primary} />
        </Pressable>
      </Card>
      <Card style={styles.profileCard}>
        <Eyebrow>PATIENT INFORMATION</Eyebrow>
        <InfoLine label="Age" value={`${patient.age}`} />
        <InfoLine label="Gender" value={patient.gender} />
        <InfoLine label="Phone" value={patient.phone} />
        <InfoLine label="Focus" value="Shoulder rehabilitation" />
      </Card>
      <Card style={styles.profileCard}>
        <Eyebrow>CARE TEAM</Eyebrow>
        <InfoLine label="Physiotherapist" value={patient.physiotherapist} />
        <InfoLine label="Current plan" value="Shoulder movement · 4 exercises" />
        <AppText muted style={styles.profileNote}>Your exercise plan is assigned by your physiotherapist and cannot be changed here.</AppText>
      </Card>
      <Card style={styles.profileCard}>
        <Eyebrow>LOCAL PROTOTYPE DATA</Eyebrow>
        <InfoLine label="Session records" value={`${sessions.length}`} />
        <InfoLine label="Feedback entries" value={`${feedback.length}`} />
        <InfoLine label="Emergency alerts" value={`${alerts.length}`} />
        <AppText muted style={styles.profileNote}>
          {storageError ? 'Local saving is unavailable right now.' : 'Stored on this device only. No physiotherapist has received this data.'}
        </AppText>
      </Card>
      <Button label="Edit profile" icon="edit-2" variant="outline" onPress={() => router.push('/profile/edit')} />
      <Button label="Change demo password" icon="key" variant="outline" onPress={() => router.push('/profile/password')} />
      <Button label="Log out" icon="log-out" variant="quiet" onPress={() => { signOut(); router.replace('/(auth)/login'); }} />
    </Screen>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoLine, { borderBottomColor: colors.border }]}>
      <AppText muted style={styles.infoLabel}>{label}</AppText>
      <AppText style={styles.infoValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  homeHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dateLabel: { fontSize: 12, marginBottom: 4 },
  greeting: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 29, letterSpacing: -0.5 },
  patientId: { fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
  focusBanner: { padding: 20, borderRadius: 26, gap: 12 },
  focusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#E4F2EB' },
  focusTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 29, maxWidth: 300, letterSpacing: -0.35 },
  focusCopy: { color: '#D1E1DB', fontSize: 13, lineHeight: 19, maxWidth: 310 },
  focusDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.16)', marginTop: 4 },
  planSummary: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  focusNumber: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 23, lineHeight: 28 },
  focusSmall: { color: '#C3D4CF', fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  roundArrow: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: -10 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 3 },
  nextCard: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 11 },
  nextIcon: { height: 42, width: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4F2EB' },
  exerciseName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20 },
  rowMeta: { fontSize: 11, lineHeight: 17 },
  startButton: { minHeight: 42, paddingHorizontal: 13, borderRadius: 13 },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  rowList: { gap: 9 },
  exerciseRow: { minHeight: 73, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
  exerciseIcon: { width: 41, height: 41, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rowMain: { flex: 1, gap: 2 },
  demoNotice: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 14 },
  demoNoticeText: { fontSize: 11, flex: 1 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 20, padding: 14 },
  planIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  planTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  exerciseCard: { borderWidth: 1, borderRadius: 21, overflow: 'hidden' },
  exerciseArtwork: { height: 112, alignItems: 'center', justifyContent: 'center' },
  artworkLabel: { position: 'absolute', bottom: 10, left: 12, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 99 },
  artworkLabelText: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1, color: '#355A54' },
  exerciseCardBody: { padding: 15, gap: 9 },
  exerciseCardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  description: { fontSize: 12, lineHeight: 18 },
  exerciseMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  exerciseCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planNote: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 14 },
  periodToggle: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#E7F0EC', borderRadius: 14, padding: 4 },
  periodButton: { paddingHorizontal: 17, paddingVertical: 9, borderRadius: 11 },
  periodLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartValue: { fontFamily: 'Inter_700Bold', fontSize: 25, marginTop: 6 },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -7 },
  chartCaption: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.6 },
  chartNote: { fontSize: 10, lineHeight: 15 },
  progressCard: { gap: 12 },
  progressLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  progressCount: { fontSize: 11, color: '#738681' },
  progressSummaryGrid: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, padding: 14 },
  summaryNumber: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 7 },
  profileHero: { flexDirection: 'row', alignItems: 'center', padding: 17 },
  profileHeroText: { flex: 1, gap: 5 },
  profileName: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  editIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7F0EC' },
  profileCard: { gap: 11 },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textAlign: 'right', flexShrink: 1 },
  profileNote: { fontSize: 11, lineHeight: 17 },
});