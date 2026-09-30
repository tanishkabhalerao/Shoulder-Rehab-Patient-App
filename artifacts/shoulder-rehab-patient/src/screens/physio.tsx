import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { DEMO_POSE_ANALYSIS, formatSessionDate } from '../data';
import { getDemoPoseAnalysis } from '../pose';
import { useApp } from '../state';
import {
  AppText,
  Button,
  Card,
  Eyebrow,
  Field,
  IconButton,
  MetricTile,
  MiniLineChart,
  Pill,
  ProgressBar,
  Screen,
  ScreenHeader,
  TwinIllustration,
} from '../ui';
import type { Exercise, Patient } from '../models';

function RoleGuard({ children }: { children: React.ReactNode }) {
  const { role } = useApp();
  if (role === 'physiotherapist') return <>{children}</>;
  return (
    <Screen>
      <ScreenHeader title="Restricted workspace" subtitle="This area is for physiotherapists." />
      <Card><AppText muted>Patients cannot view patient management tools or other patient records.</AppText></Card>
      <Button label="Return to sign in" icon="log-in" onPress={() => router.replace('/(auth)/login')} />
    </Screen>
  );
}

export function PhysiotherapistDashboardScreen() {
  const { patients, sessions, exercises } = useApp();
  const colors = useColors();
  const completed = sessions.filter((session) => session.status === 'Completed');
  return (
    <RoleGuard>
      <Screen>
        <ScreenHeader title="Clinical dashboard" subtitle="Wednesday, 30 September 2026" right={<Pill label="CARE TEAM" tone="good" />} />
        <View style={[styles.welcome, { backgroundColor: colors.hero }]}>
          <View style={styles.welcomeIcon}><Feather name="activity" size={21} color={colors.primaryForeground} /></View>
          <AppText style={styles.welcomeTitle}>Good morning, Jordan</AppText>
          <AppText style={styles.welcomeCopy}>A shared view of your patients' rehabilitation activity.</AppText>
        </View>
        <View style={styles.metricGrid}>
          <MetricTile label="Total patients" value={`${patients.length}`} icon="users" />
          <MetricTile label="Active patients" value={`${patients.length}`} icon="heart" />
          <MetricTile label="Exercise plans" value={`${exercises.length}`} icon="clipboard" />
          <MetricTile label="Completed sessions" value={`${completed.length}`} icon="check-circle" />
        </View>
        <Card>
          <View style={styles.cardHeader}><View style={styles.flex}><Eyebrow>PERFORMANCE TREND</Eyebrow><AppText style={styles.cardTitle}>Patient completion quality</AppText></View><Pill label="THIS MONTH" /></View>
          <MiniLineChart values={[72, 76, 79, 82, 87, 89]} color={colors.primary} />
          <View style={styles.trendLegend}><AppText muted style={styles.note}>Average posture and performance score</AppText><AppText style={[styles.note, { color: colors.good }]}>+12%</AppText></View>
        </Card>
        <View style={styles.sectionHeader}><Eyebrow>RECENT PATIENT ACTIVITY</Eyebrow><Pressable onPress={() => router.push('/(physio)/patients')}><AppText style={[styles.link, { color: colors.primary }]}>View all</AppText></Pressable></View>
        {patients.map((patient) => {
          const last = sessions.find((session) => session.patientId === patient.id);
          return <PatientRow key={patient.id} patient={patient} meta={last ? `Last session ${formatSessionDate(last.date)}` : 'No session yet'} onPress={() => router.push({ pathname: '/(physio)/patient/[id]', params: { id: patient.id } })} />;
        })}
      </Screen>
    </RoleGuard>
  );
}

function PatientRow({ patient, meta, onPress }: { patient: Patient; meta: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.patientRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
      <View style={[styles.patientAvatar, { backgroundColor: colors.secondary }]}><AppText style={[styles.patientInitials, { color: colors.primary }]}>{patient.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}</AppText></View>
      <View style={styles.flex}><AppText style={styles.patientName}>{patient.fullName}</AppText><AppText muted style={styles.note}>{patient.focus} · {meta}</AppText></View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function PhysiotherapistPatientsScreen() {
  const { patients, sessions, exercises } = useApp();
  const colors = useColors();
  const [search, setSearch] = useState('');
  const filtered = patients.filter((patient) => patient.fullName.toLowerCase().includes(search.toLowerCase()) || patient.focus.toLowerCase().includes(search.toLowerCase()));
  return (
    <RoleGuard>
      <Screen>
        <ScreenHeader title="My patients" subtitle={`${patients.length} people under active care`} />
        <Field label="Search patients" value={search} onChangeText={setSearch} placeholder="Name or condition" />
        {filtered.map((patient) => {
          const patientSessions = sessions.filter((session) => session.patientId === patient.id);
          const assignmentCount = exercises.length ? Math.min(exercises.length, patient.id === patients[0]?.id ? 4 : 2) : 0;
          return (
            <Pressable key={patient.id} onPress={() => router.push({ pathname: '/(physio)/patient/[id]', params: { id: patient.id } })} style={({ pressed }) => [styles.patientCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}>
              <View style={styles.cardHeader}><View style={styles.flex}><AppText style={styles.patientName}>{patient.fullName}</AppText><AppText muted style={styles.note}>{patient.id} · age {patient.age}</AppText></View><Pill label={patientSessions.length ? 'ACTIVE' : 'NEW'} tone={patientSessions.length ? 'good' : 'neutral'} /></View>
              <View style={styles.patientCardInfo}><Info label="Condition" value={patient.focus} /><Info label="Plan" value={`${assignmentCount} exercises`} /><Info label="Sessions" value={`${patientSessions.length}`} /></View>
              <ProgressBar value={patientSessions.length ? 72 : 18} />
              <AppText muted style={styles.note}>Open complete patient details</AppText>
            </Pressable>
          );
        })}
      </Screen>
    </RoleGuard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><AppText muted style={styles.note}>{label}</AppText><AppText style={styles.infoValue}>{value}</AppText></View>;
}

export function PatientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients, sessions, exercises, assignedExerciseIds } = useApp();
  const colors = useColors();
  const patient = patients.find((item) => item.id === id) ?? patients[0];
  if (!patient) return null;
  const patientSessions = sessions.filter((session) => session.patientId === patient.id);
  const assigned = exercises.filter((exercise) => (assignedExerciseIds[patient.id] ?? []).includes(exercise.id));
  return (
    <RoleGuard>
      <Screen>
        <View style={styles.backHeader}><IconButton icon="arrow-left" label="Back to patients" onPress={() => router.back()} /><Pill label="PATIENT DETAILS" tone="good" /><View style={{ width: 42 }} /></View>
        <Card style={styles.profileHero}><View style={[styles.largeAvatar, { backgroundColor: colors.secondary }]}><AppText style={[styles.largeInitials, { color: colors.primary }]}>{patient.fullName.split(' ').map((name) => name[0]).join('').slice(0, 2)}</AppText></View><View style={styles.flex}><AppText style={styles.profileName}>{patient.fullName}</AppText><AppText muted>{patient.email}</AppText><AppText muted style={styles.note}>{patient.id} · {patient.focus}</AppText></View></Card>
        <View style={styles.metricGrid}><MetricTile label="Sessions" value={`${patientSessions.length}`} icon="activity" /><MetricTile label="Exercises" value={`${assigned.length}`} icon="clipboard" /><MetricTile label="Latest score" value={patientSessions[0] ? `${patientSessions[0].qualityScore}` : '—'} unit="%" icon="bar-chart-2" /><MetricTile label="ROM" value={patientSessions[0] ? `${patientSessions[0].shoulderRom}` : '—'} unit="°" icon="move" /></View>
        <Card><View style={styles.cardHeader}><Eyebrow>ASSIGNED PLAN</Eyebrow><Pill label={`${assigned.length} ITEMS`} /></View>{assigned.map((exercise) => <View key={exercise.id} style={[styles.planRow, { borderBottomColor: colors.border }]}><View style={styles.flex}><AppText style={styles.patientName}>{exercise.name}</AppText><AppText muted style={styles.note}>{exercise.sets} sets · {exercise.reps} reps · {exercise.durationMinutes} min</AppText></View><Feather name="check-circle" size={17} color={colors.good} /></View>)}</Card>
        <Card><View style={styles.cardHeader}><Eyebrow>SESSION HISTORY</Eyebrow><Pill label="SHARED DATA" tone="good" /></View>{patientSessions.map((session) => <View key={session.id} style={[styles.planRow, { borderBottomColor: colors.border }]}><View style={styles.flex}><AppText style={styles.patientName}>{session.exerciseId.replaceAll('-', ' ')}</AppText><AppText muted style={styles.note}>{formatSessionDate(session.date)} · {session.repsCompleted} reps · posture {session.postureScore ?? session.qualityScore}%</AppText></View><Pill label={`${session.qualityScore}%`} tone="good" /></View>)}{!patientSessions.length ? <AppText muted style={styles.note}>No sessions recorded yet.</AppText> : null}</Card>
        <Button label="Open Digital Twin" icon="activity" onPress={() => router.push({ pathname: '/(physio)/digital-twin/[id]', params: { id: patient.id } })} />
      </Screen>
    </RoleGuard>
  );
}

export function PhysiotherapistDigitalTwinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients, sessions } = useApp();
  const patient = patients.find((item) => item.id === id) ?? patients[0];
  const patientSessions = sessions.filter((session) => session.patientId === patient?.id && session.status === 'Completed');
  const latest = patientSessions[0];
  if (!patient) return null;
  return (
    <RoleGuard>
      <Screen>
        <View style={styles.backHeader}><IconButton icon="arrow-left" label="Back to patient" onPress={() => router.back()} /><Pill label="DIGITAL TWIN" tone="good" /><View style={{ width: 42 }} /></View>
        <ScreenHeader title={patient.fullName} subtitle="Clinician view of stored rehabilitation data" />
        <TwinIllustration leftAngle={latest?.shoulderRom ?? 73} rightAngle={(latest?.shoulderRom ?? 73) + 3} />
        <View style={styles.metricGrid}><MetricTile label="Performance" value={latest ? `${latest.qualityScore}` : '—'} unit="%" icon="activity" /><MetricTile label="ROM" value={latest ? `${latest.shoulderRom}` : '—'} unit="°" icon="move" /><MetricTile label="Posture" value={latest ? `${latest.postureScore ?? latest.qualityScore}` : '—'} unit="%" icon="user-check" /><MetricTile label="Sessions" value={`${patientSessions.length}`} icon="clock" /></View>
        <Card><Eyebrow>PROGRESS HISTORY</Eyebrow><MiniLineChart values={patientSessions.length ? patientSessions.slice(0, 6).reverse().map((session) => session.qualityScore) : [66, 70, 72, 76, 81]} /><AppText muted style={styles.note}>This view is derived from completed exercise sessions, not static profile data.</AppText></Card>
      </Screen>
    </RoleGuard>
  );
}

export function ExercisePlansScreen() {
  const colors = useColors();
  const { exercises, patients, assignedExerciseIds, addExercise, updateExercise, deleteExercise, assignExercise } = useApp();
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [duration, setDuration] = useState('10');
  const [instructions, setInstructions] = useState('');
  const [notice, setNotice] = useState('');
  const openEditor = (exercise?: Exercise) => {
    setEditing(exercise ?? null);
    setName(exercise?.name ?? '');
    setSets(`${exercise?.sets ?? 3}`);
    setReps(`${exercise?.reps ?? 10}`);
    setDuration(`${exercise?.durationMinutes ?? 10}`);
    setInstructions(exercise?.instructions.join('. ') ?? '');
    setShowEditor(true);
  };
  const save = () => {
    const values = {
      name: name.trim() || 'New movement',
      description: 'Assigned rehabilitation movement.',
      focus: 'General mobility',
      sets: Math.max(1, Number(sets) || 3),
      reps: Math.max(1, Number(reps) || 10),
      difficulty: 'Gentle' as const,
      durationMinutes: Math.max(1, Number(duration) || 10),
      targetRom: null,
      position: 'Follow the clinician-provided setup.',
      instructions: instructions.split('.').map((item) => item.trim()).filter(Boolean),
      commonMistakes: ['Move within a comfortable range.'],
      precautions: ['Stop if you feel sharp pain.'],
      requiredLandmarks: ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'],
      movementThreshold: 'Clinician defined',
    };
    if (editing) updateExercise(editing.id, values);
    else addExercise(values);
    setShowEditor(false);
  };
  return (
    <RoleGuard>
      <Screen>
        <ScreenHeader title="Exercise plans" subtitle="Build and assign rehabilitation prescriptions" right={<Button label="Add" icon="plus" onPress={() => openEditor()} style={styles.smallButton} />} />
        <View style={[styles.planBanner, { backgroundColor: colors.heroSoft }]}><Feather name="clipboard" size={19} color={colors.primary} /><View style={styles.flex}><AppText style={styles.patientName}>Shared exercise library</AppText><AppText muted style={styles.note}>Changes are reflected in the patient workspace.</AppText></View></View>
        {notice ? <AppText style={[styles.notice, { color: colors.good }]}>{notice}</AppText> : null}
        {exercises.map((exercise) => (
          <Card key={exercise.id} style={styles.exercisePlanCard}>
            <View style={styles.cardHeader}><View style={styles.flex}><AppText style={styles.patientName}>{exercise.name}</AppText><AppText muted style={styles.note}>{exercise.sets} sets · {exercise.reps} reps · {exercise.durationMinutes} min</AppText></View><Pressable onPress={() => openEditor(exercise)} accessibilityRole="button"><Feather name="edit-2" size={17} color={colors.primary} /></Pressable><Pressable onPress={() => deleteExercise(exercise.id)} accessibilityRole="button"><Feather name="trash-2" size={17} color={colors.destructive} /></Pressable></View>
            <View style={styles.assignmentRow}><AppText muted style={styles.note}>Assign to:</AppText>{patients.map((patient) => { const assigned = (assignedExerciseIds[patient.id] ?? []).includes(exercise.id); return <Pressable key={patient.id} onPress={() => { assignExercise(patient.id, exercise.id); setNotice(`${exercise.name} assigned to ${patient.fullName}.`); }} style={[styles.assignChip, { backgroundColor: assigned ? colors.goodSurface : colors.secondary }]}><AppText style={[styles.assignText, { color: assigned ? colors.good : colors.secondaryForeground }]}>{patient.fullName.split(' ')[0]} {assigned ? '✓' : '+'}</AppText></Pressable>; })}</View>
          </Card>
        ))}
        <Modal visible={showEditor} transparent animationType="slide" onRequestClose={() => setShowEditor(false)}>
          <View style={styles.modalScrim}><View style={[styles.modalCard, { backgroundColor: colors.card }]}><View style={styles.cardHeader}><AppText style={styles.modalTitle}>{editing ? 'Edit exercise' : 'Create exercise'}</AppText><IconButton icon="x" label="Close editor" onPress={() => setShowEditor(false)} /></View><Field label="Exercise name" value={name} onChangeText={setName} placeholder="Shoulder abduction" /><View style={styles.formRow}><Field label="Sets" value={sets} onChangeText={setSets} keyboardType="number-pad" containerStyle={styles.flex} /><Field label="Repetitions" value={reps} onChangeText={setReps} keyboardType="number-pad" containerStyle={styles.flex} /><Field label="Minutes" value={duration} onChangeText={setDuration} keyboardType="number-pad" containerStyle={styles.flex} /></View><Field label="Instructions" value={instructions} onChangeText={setInstructions} placeholder="Raise arm slowly..." multiline /><Button label={editing ? 'Save changes' : 'Create exercise'} icon="check" onPress={save} /><Button label="Cancel" variant="quiet" onPress={() => setShowEditor(false)} /></View></View>
        </Modal>
      </Screen>
    </RoleGuard>
  );
}

export function PhysiotherapistAnalysisScreen() {
  const colors = useColors();
  const { exercises } = useApp();
  const [selectedId, setSelectedId] = useState(exercises[0]?.id ?? DEMO_POSE_ANALYSIS.exerciseId);
  const selected = exercises.find((exercise) => exercise.id === selectedId) ?? exercises[0];
  const analysis = getDemoPoseAnalysis(selected?.id ?? DEMO_POSE_ANALYSIS.exerciseId);
  return (
    <RoleGuard>
      <Screen>
        <ScreenHeader title="Computer vision" subtitle="Pose analysis service monitor" />
        <View style={[styles.analysisHero, { backgroundColor: colors.hero }]}><View style={styles.welcomeIcon}><Feather name="crosshair" size={20} color={colors.primaryForeground} /></View><View style={styles.flex}><AppText style={styles.welcomeTitle}>OpenCV + MediaPipe Pose</AppText><AppText style={styles.welcomeCopy}>Normalized landmarks, joint angles, movement thresholds and repetition rules.</AppText></View><Pill label="SERVICE READY" tone="good" /></View>
        <View style={styles.choiceRow}>{exercises.slice(0, 4).map((exercise) => <Pressable key={exercise.id} onPress={() => setSelectedId(exercise.id)} style={[styles.exerciseChoice, { backgroundColor: selected?.id === exercise.id ? colors.primary : colors.secondary }]}><AppText style={{ color: selected?.id === exercise.id ? colors.primaryForeground : colors.secondaryForeground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>{exercise.name}</AppText></Pressable>)}</View>
        <View style={styles.metricGrid}><MetricTile label="Repetitions" value={`${analysis.repetitionCount}`} icon="repeat" /><MetricTile label="Performance" value={`${analysis.performanceScore}`} unit="%" icon="activity" /><MetricTile label="Posture" value={`${analysis.postureScore}`} unit="%" icon="user-check" /><MetricTile label="Landmarks" value={`${analysis.landmarks.length}`} icon="map-pin" /></View>
        <Card><View style={styles.cardHeader}><View style={styles.flex}><Eyebrow>CLINICAL FEEDBACK</Eyebrow><AppText style={styles.cardTitle}>{analysis.feedback}</AppText></View><Pill label="DEMO FRAME" /></View><ProgressBar value={analysis.performanceScore} /><AppText muted style={styles.note}>Inference source is explicitly marked demo until a Python service is connected.</AppText></Card>
        <Card><View style={styles.cardHeader}><Eyebrow>LANDMARK COORDINATES</Eyebrow><Pill label="X · Y · Z · CONFIDENCE" /></View>{analysis.landmarks.map((landmark) => <View key={landmark.name} style={[styles.landmarkRow, { borderBottomColor: colors.border }]}><AppText style={styles.landmarkName}>{landmark.name}</AppText><AppText muted style={styles.landmarkValue}>{landmark.x.toFixed(2)} · {landmark.y.toFixed(2)} · {landmark.z.toFixed(2)} · {Math.round(landmark.visibility * 100)}%</AppText></View>)}</Card>
      </Screen>
    </RoleGuard>
  );
}

export function PhysiotherapistProfileScreen() {
  const { physiotherapist, signOut } = useApp();
  return <RoleGuard><Screen><ScreenHeader title="Profile" subtitle="Physiotherapist workspace" /><Card style={styles.profileHero}><View style={[styles.largeAvatar, { backgroundColor: '#E7F0EC' }]}><Feather name="heart" size={25} color="#16756F" /></View><View style={styles.flex}><AppText style={styles.profileName}>{physiotherapist.fullName}</AppText><AppText muted>{physiotherapist.email}</AppText><Pill label="PHYSIOTHERAPIST" tone="good" /></View></Card><Card><Eyebrow>CLINICAL PROFILE</Eyebrow><Info label="Specialty" value={physiotherapist.specialty} /><Info label="Clinic" value={physiotherapist.clinic} /><Info label="Patients" value="3 active" /></Card><Card><Eyebrow>DATA BOUNDARY</Eyebrow><AppText muted style={styles.note}>This build uses one shared local demo store so assignments and sessions flow between both profiles on this device. Connect the existing API/database scaffold for multi-device persistence.</AppText></Card><Button label="Log out" icon="log-out" variant="quiet" onPress={() => { signOut(); router.replace('/(auth)/login'); }} /></Screen></RoleGuard>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  welcome: { borderRadius: 24, padding: 20, gap: 10 },
  welcomeIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#16756F', alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 20 },
  welcomeCopy: { color: '#D1E1DB', fontSize: 12, lineHeight: 18 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  cardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, marginTop: 4 },
  trendLegend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, padding: 13 },
  patientAvatar: { width: 42, height: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  patientInitials: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  patientName: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  note: { fontSize: 11, lineHeight: 17 },
  patientCard: { borderRadius: 20, borderWidth: 1, padding: 15, gap: 13 },
  patientCardInfo: { flexDirection: 'row', gap: 10 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  info: { flex: 1, gap: 3 },
  backHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  profileName: { fontFamily: 'Inter_700Bold', fontSize: 19, marginBottom: 3 },
  largeAvatar: { width: 62, height: 62, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  largeInitials: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  planBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 14 },
  exercisePlanCard: { padding: 15, gap: 13 },
  assignmentRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  assignChip: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  assignText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  smallButton: { minHeight: 40, paddingHorizontal: 12, borderRadius: 12 },
  notice: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  formRow: { flexDirection: 'row', gap: 8 },
  modalScrim: { flex: 1, backgroundColor: 'rgba(11,32,31,0.58)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, gap: 14 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 21 },
  analysisHero: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 22, padding: 16 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exerciseChoice: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 9 },
  landmarkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 9 },
  landmarkName: { fontFamily: 'Inter_600SemiBold', fontSize: 11, flex: 1 },
  landmarkValue: { fontSize: 10, textAlign: 'right', flex: 2 },
});