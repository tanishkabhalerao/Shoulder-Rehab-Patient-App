import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { DEMO_POSE_ANALYSIS, formatSessionDate } from '../data';
import { getDemoPoseAnalysis } from '../pose';
import { useApp } from '../state';
import {
  AppText,
  Button,
  Card,
  Eyebrow,
  MetricTile,
  MiniLineChart,
  Pill,
  ProgressBar,
  Screen,
  ScreenHeader,
  TwinIllustration,
} from '../ui';

export function PatientDigitalTwinScreen() {
  const colors = useColors();
  const { patient, sessions, assignedExercises } = useApp();
  const completed = sessions.filter((session) => session.patientId === patient.id && session.status === 'Completed');
  const averageQuality = completed.length
    ? Math.round(completed.reduce((sum, session) => sum + session.qualityScore, 0) / completed.length)
    : 0;
  const latest = completed[0];

  return (
    <Screen>
      <ScreenHeader title="Digital Twin" subtitle="Your rehabilitation snapshot" />
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <View style={styles.heroTop}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
            <Feather name="activity" size={20} color={colors.primaryForeground} />
          </View>
          <Pill label="LIVE PROFILE" tone="good" />
        </View>
        <AppText style={styles.heroTitle}>{patient.fullName}</AppText>
        <AppText style={styles.heroCopy}>A stored view of your plan, movement quality, and recovery trend.</AppText>
        <View style={styles.heroRule} />
        <View style={styles.heroStats}>
          <View><AppText style={styles.heroNumber}>{assignedExercises.length}</AppText><AppText style={styles.heroLabel}>assigned exercises</AppText></View>
          <View><AppText style={styles.heroNumber}>{completed.length}</AppText><AppText style={styles.heroLabel}>completed sessions</AppText></View>
          <View><AppText style={styles.heroNumber}>{averageQuality || '—'}{averageQuality ? '%' : ''}</AppText><AppText style={styles.heroLabel}>avg performance</AppText></View>
        </View>
      </View>
      <View style={styles.metricsRow}>
        <MetricTile label="Latest ROM" value={latest ? `${latest.shoulderRom}` : '—'} unit="°" icon="move" />
        <MetricTile label="Posture" value={latest ? `${latest.postureScore ?? latest.qualityScore}` : '—'} unit="%" icon="user-check" />
      </View>
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.flex}><Eyebrow>RECOVERY TREND</Eyebrow><AppText style={styles.cardTitle}>Range of motion</AppText></View>
          <Pill label="STORED DATA" tone="good" />
        </View>
        <MiniLineChart values={completed.length ? completed.slice(0, 6).reverse().map((item) => item.shoulderRom) : [62, 66, 70, 74, 76]} />
        <AppText muted style={styles.note}>ROM and posture values are saved when a session is completed.</AppText>
      </Card>
      <Card>
        <Eyebrow>SESSION HISTORY</Eyebrow>
        {completed.slice(0, 4).map((session) => (
          <View key={session.id} style={[styles.sessionRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.sessionIcon, { backgroundColor: colors.secondary }]}><Feather name="check" size={15} color={colors.primary} /></View>
            <View style={styles.flex}>
              <AppText style={styles.sessionName}>{session.exerciseId.replaceAll('-', ' ')}</AppText>
              <AppText muted style={styles.note}>{formatSessionDate(session.date)} · {session.repsCompleted} reps</AppText>
            </View>
            <Pill label={`${session.qualityScore}%`} tone="good" />
          </View>
        ))}
        {!completed.length ? <AppText muted style={styles.note}>Complete your first assigned session to start this twin.</AppText> : null}
      </Card>
      <Button label="Open progress" icon="trending-up" variant="outline" onPress={() => router.push('/(tabs)/progress')} />
    </Screen>
  );
}

export function PatientAnalysisScreen() {
  const colors = useColors();
  const { assignedExercises } = useApp();
  const exercise = assignedExercises[0];
  const analysis = getDemoPoseAnalysis(exercise?.id ?? DEMO_POSE_ANALYSIS.exerciseId);

  return (
    <Screen>
      <ScreenHeader title="AI Exercise Analysis" subtitle="Pose landmarks and movement feedback" />
      <View style={[styles.analysisBanner, { backgroundColor: colors.hero }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
          <Feather name="camera" size={20} color={colors.primaryForeground} />
        </View>
        <View style={styles.flex}>
          <AppText style={styles.analysisTitle}>MediaPipe Pose adapter</AppText>
          <AppText style={styles.analysisCopy}>The camera interface is ready. Live landmark inference is not connected in this Expo build.</AppText>
        </View>
        <Pill label="DEMO" />
      </View>
      <View style={styles.metricsRow}>
        <MetricTile label="Repetitions" value={`${analysis.repetitionCount}`} icon="repeat" />
        <MetricTile label="Performance" value={`${analysis.performanceScore}`} unit="%" icon="activity" />
      </View>
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.flex}><Eyebrow>REAL-TIME FEEDBACK</Eyebrow><AppText style={styles.cardTitle}>{analysis.feedback}</AppText></View>
          <Feather name="check-circle" size={21} color={colors.good} />
        </View>
        <ProgressBar value={analysis.postureScore} color={colors.good} />
        <AppText muted style={styles.note}>Posture score {analysis.postureScore}% · source: {analysis.source}</AppText>
      </Card>
      <Card>
        <View style={styles.cardHeader}><Eyebrow>JOINT ANGLES</Eyebrow><Pill label="3-POINT CALCULATION" /></View>
        {analysis.jointAngles.map((angle) => (
          <View key={angle.name} style={[styles.angleRow, { borderBottomColor: colors.border }]}>
            <View style={styles.flex}><AppText style={styles.sessionName}>{angle.name}</AppText><AppText muted style={styles.note}>{angle.landmarks.join(' → ')}</AppText></View>
            <AppText style={[styles.angleValue, { color: angle.status === 'good' ? colors.good : colors.warning }]}>{angle.value}°</AppText>
          </View>
        ))}
      </Card>
      <Card>
        <View style={styles.cardHeader}><View style={styles.flex}><Eyebrow>LANDMARK STREAM</Eyebrow><AppText style={styles.cardTitle}>Normalized body coordinates</AppText></View><Pill label={`${analysis.landmarks.length} POINTS`} /></View>
        {analysis.landmarks.slice(0, 6).map((landmark) => (
          <View key={landmark.name} style={[styles.landmarkRow, { borderBottomColor: colors.border }]}>
            <AppText style={styles.landmarkName}>{landmark.name.replaceAll('_', ' ')}</AppText>
            <AppText muted style={styles.landmarkValue}>x {landmark.x.toFixed(2)} · y {landmark.y.toFixed(2)} · z {landmark.z.toFixed(2)} · {Math.round(landmark.visibility * 100)}%</AppText>
          </View>
        ))}
      </Card>
      <AppText muted style={styles.disclaimer}>No clinical decision should be made from the demo pose values. Connect the Python/OpenCV service before enabling live analysis.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: 25, padding: 20, gap: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 25, lineHeight: 31 },
  heroCopy: { color: '#D1E1DB', fontSize: 13, lineHeight: 19, maxWidth: 320 },
  heroRule: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between' },
  heroNumber: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 22 },
  heroLabel: { color: '#C3D4CF', fontSize: 10, marginTop: 3 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 4 },
  note: { fontSize: 11, lineHeight: 17 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  sessionIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sessionName: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'capitalize' },
  analysisBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 17, borderRadius: 21 },
  analysisTitle: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  analysisCopy: { color: '#D1E1DB', fontSize: 11, lineHeight: 17, marginTop: 4 },
  angleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  angleValue: { fontFamily: 'Inter_700Bold', fontSize: 19 },
  landmarkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 9 },
  landmarkName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, flex: 1 },
  landmarkValue: { fontSize: 10, textAlign: 'right', flex: 2 },
  disclaimer: { fontSize: 10, lineHeight: 16, textAlign: 'center', paddingHorizontal: 12 },
});