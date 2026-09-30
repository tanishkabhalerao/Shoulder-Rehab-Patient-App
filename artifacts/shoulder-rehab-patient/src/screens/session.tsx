import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { DEMO_MOVEMENT, formatDuration, getExercise } from '../data';
import { useApp } from '../state';
import {
  AppText,
  Button,
  Card,
  Eyebrow,
  IconButton,
  MetricTile,
  Pill,
  ProgressBar,
  Screen,
  ScreenHeader,
  TwinIllustration,
} from '../ui';

export function ExerciseDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExercise(id);
  const { startSession } = useApp();

  if (!exercise) {
    return (
      <Screen>
        <ScreenHeader title="Exercise not found" />
        <AppText muted>This exercise is not available in the current demo plan.</AppText>
        <Button label="Back to exercises" onPress={() => router.replace('/(tabs)/exercises')} icon="arrow-left" variant="outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.backHeader}>
        <IconButton icon="arrow-left" label="Go back" onPress={() => router.back()} />
        <Pill label="SHOULDER PLAN" tone="good" />
        <View style={{ width: 42 }} />
      </View>
      <View style={[styles.exerciseHero, { backgroundColor: colors.heroSoft }]}>
        <Feather name="activity" size={34} color={colors.primary} />
        <AppText style={styles.exerciseHeroTitle}>{exercise.name}</AppText>
        <AppText muted style={styles.exerciseHeroCopy}>{exercise.description}</AppText>
      </View>
      <View style={styles.metricsRow}>
        <MetricTile label="Sets" value={`${exercise.sets}`} icon="layers" />
        <MetricTile label="Repetitions" value={`${exercise.reps}`} icon="repeat" />
      </View>
      <View style={styles.infoRow}>
        <Pill label={exercise.difficulty} tone={exercise.difficulty === 'Gentle' ? 'good' : 'warning'} />
        <Pill label={`${exercise.durationMinutes} MIN`} />
        <Pill label={exercise.targetRom ? `GOAL ${exercise.targetRom}°` : 'GOAL ROM NOT SET'} />
      </View>
      <Card>
        <View style={styles.titleRow}>
          <View style={[styles.smallIcon, { backgroundColor: colors.secondary }]}><Feather name="align-center" size={17} color={colors.primary} /></View>
          <AppText style={styles.sectionTitle}>Position & instructions</AppText>
        </View>
        <AppText muted style={styles.position}>{exercise.position}</AppText>
        {exercise.instructions.map((instruction, index) => (
          <View key={instruction} style={styles.instructionRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}><AppText style={[styles.stepText, { color: colors.primary }]}>{index + 1}</AppText></View>
            <AppText style={styles.instructionText}>{instruction}</AppText>
          </View>
        ))}
      </Card>
      <Card>
        <View style={styles.titleRow}>
          <Feather name="eye" size={17} color={colors.warning} />
          <AppText style={styles.sectionTitle}>Movement reminders</AppText>
        </View>
        {exercise.commonMistakes.map((mistake) => (
          <View key={mistake} style={styles.reminderRow}>
            <Feather name="minus-circle" size={15} color={colors.warning} />
            <AppText muted style={styles.instructionText}>{mistake}</AppText>
          </View>
        ))}
        <AppText muted style={styles.smallDisclaimer}>These are general exercise reminders in sample data. Follow the instructions from your physiotherapist.</AppText>
      </Card>
      <Button
        label="Start exercise"
        icon="play"
        testID="start-exercise"
        onPress={() => {
          startSession(exercise.id);
          router.push({ pathname: '/session/[id]', params: { id: exercise.id } });
        }}
      />
      <AppText muted style={styles.disclaimer}>Performance demo only. This prototype does not diagnose or prescribe treatment.</AppText>
    </Screen>
  );
}

export function ActiveSessionScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    activeSession,
    tickSession,
    togglePause,
    pauseSession,
    countRep,
    completeSet,
    finishSession,
    sendEmergencyAlert,
  } = useApp();
  const exercise = getExercise(id) ?? getExercise(activeSession?.exerciseId);
  const [cameraUri, setCameraUri] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [alertSaved, setAlertSaved] = useState(false);

  useEffect(() => {
    if (!activeSession) return;
    if (!activeSession.paused) {
      const timer = setInterval(tickSession, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSession?.id, activeSession?.paused, tickSession]);

  useEffect(() => {
    if (!activeSession) router.replace('/(tabs)');
  }, [activeSession]);

  const captureSnapshot = async () => {
    if (Platform.OS === 'web') {
      setCameraStatus('Open this app in Expo Go on a phone to capture a camera snapshot.');
      return;
    }
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setCameraStatus(
          permission.canAskAgain
            ? 'Allow camera access to capture a movement snapshot.'
            : 'Camera permission is off. Open Settings to allow camera access.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.75 });
      if (!result.canceled && result.assets[0]?.uri) {
        setCameraUri(result.assets[0].uri);
        setCameraStatus('Snapshot captured. It is not analyzed by AI in this prototype.');
      }
    } catch {
      setCameraStatus('The camera is not available on this device right now.');
    }
  };

  if (!activeSession || !exercise) return null;
  const progress = Math.round(
    (((activeSession.currentSet - 1) * exercise.reps + activeSession.currentRep) /
      (exercise.sets * exercise.reps)) *
      100,
  );
  const setIsComplete = activeSession.currentRep >= exercise.reps;
  const isLastSet = activeSession.currentSet >= exercise.sets;

  const completeCurrentSet = () => {
    if (isLastSet) {
      const session = finishSession('Completed');
      if (session) router.replace({ pathname: '/completed', params: { sessionId: session.id } });
    } else {
      completeSet();
    }
  };

  const confirmEmergency = () => {
    const alert = sendEmergencyAlert(emergencyMessage);
    if (!alert) return;
    finishSession('Ended early');
    setShowEmergency(false);
    setAlertSaved(true);
  };

  return (
    <Screen>
      <View style={styles.sessionTopBar}>
        <IconButton icon="x" label="Leave exercise session" onPress={() => setShowEnd(true)} />
        <View style={styles.sessionHeaderText}>
          <Eyebrow>ACTIVE SESSION</Eyebrow>
          <AppText style={styles.sessionTitle}>{exercise.name}</AppText>
        </View>
        <Pill label={activeSession.paused ? 'PAUSED' : formatDuration(activeSession.elapsedSeconds)} tone={activeSession.paused ? 'warning' : 'good'} />
      </View>

      <Card style={styles.sessionProgressCard}>
        <View style={styles.progressTop}>
          <View><Eyebrow>SET</Eyebrow><AppText style={styles.progressBig}>{activeSession.currentSet} <AppText muted style={styles.progressOf}>/ {exercise.sets}</AppText></AppText></View>
          <View><Eyebrow>REPS</Eyebrow><AppText style={styles.progressBig}>{activeSession.currentRep} <AppText muted style={styles.progressOf}>/ {exercise.reps}</AppText></AppText></View>
          <View><Eyebrow>PROGRESS</Eyebrow><AppText style={styles.progressBig}>{progress}<AppText muted style={styles.progressOf}>%</AppText></AppText></View>
        </View>
        <ProgressBar value={progress} />
      </Card>

      <View style={styles.sectionLabelRow}>
        <Eyebrow>CAMERA SNAPSHOT</Eyebrow>
        <Pill label="AI ANALYSIS OFF" />
      </View>
      <View style={[styles.cameraBox, { backgroundColor: colors.hero }]}>
        {cameraUri ? (
          <Image source={{ uri: cameraUri }} style={styles.cameraImage} resizeMode="cover" accessibilityLabel="Captured camera snapshot" />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <View style={styles.cameraPlaceholderIcon}><Feather name="camera" size={23} color="#E9F4EF" /></View>
            <AppText style={styles.cameraPlaceholderTitle}>Camera ready</AppText>
            <AppText style={styles.cameraPlaceholderCopy}>Capture a snapshot for this demo session. No live pose tracking is running.</AppText>
          </View>
        )}
        <Pressable accessibilityRole="button" testID="capture-camera" onPress={captureSnapshot} style={({ pressed }) => [styles.captureButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
          <Feather name="camera" size={16} color="#FFFFFF" />
          <AppText style={styles.captureText}>{cameraUri ? 'Take another snapshot' : 'Open camera'}</AppText>
        </Pressable>
      </View>
      {cameraStatus ? (
        <View style={styles.cameraStatusRow}>
          <AppText muted style={styles.cameraStatus}>{cameraStatus}</AppText>
          {cameraStatus.includes('Settings') && Platform.OS !== 'web' ? (
            <Pressable accessibilityRole="button" onPress={() => { void Linking.openSettings().catch(() => undefined); }}>
              <AppText style={[styles.linkText, { color: colors.primary }]}>Settings</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.sectionLabelRow}>
        <View><Eyebrow>SHOULDER DIGITAL TWIN</Eyebrow><AppText muted style={styles.smallText}>Example visualization · not camera-derived</AppText></View>
        <Pill label="DEMO VALUES" />
      </View>
      <TwinIllustration leftAngle={DEMO_MOVEMENT.leftShoulderAngle} rightAngle={DEMO_MOVEMENT.rightShoulderAngle} />
      <View style={styles.metricsRow}>
        <MetricTile label="Shoulder ROM" value={`${DEMO_MOVEMENT.shoulderRom}`} unit="°" icon="move" />
        <MetricTile label="Movement quality" value={`${DEMO_MOVEMENT.movementQuality}`} unit="%" icon="activity" />
      </View>
      <View style={styles.feedbackPanel}>
        <View style={[styles.feedbackDot, { backgroundColor: colors.good }]} />
        <View style={styles.flex}>
          <AppText style={styles.feedbackTitle}>Sample movement cue</AppText>
          <AppText muted style={styles.smallText}>Keep the movement controlled. Demo feedback only.</AppText>
        </View>
        <Pill label="EXAMPLE" tone="good" />
      </View>

      {activeSession.paused ? (
        <View style={[styles.pausedNotice, { backgroundColor: colors.warningSurface }]}>
          <Feather name="pause-circle" size={17} color={colors.warning} />
          <AppText style={[styles.smallText, { color: colors.warning }]}>Session paused. Resume when ready.</AppText>
        </View>
      ) : null}
      <View style={styles.actionStack}>
        <Button
          label={setIsComplete ? (isLastSet ? 'Finish exercise' : 'Complete set') : 'Count one repetition'}
          icon={setIsComplete ? 'check' : 'plus'}
          onPress={setIsComplete ? completeCurrentSet : countRep}
          testID="session-repetition"
          disabled={activeSession.paused}
        />
        <View style={styles.secondaryActions}>
          <Button label={activeSession.paused ? 'Resume' : 'Pause'} icon={activeSession.paused ? 'play' : 'pause'} variant="outline" onPress={togglePause} style={styles.actionHalf} />
          <Button label="End session" icon="square" variant="outline" onPress={() => setShowEnd(true)} style={styles.actionHalf} />
        </View>
          <Button label="Emergency alert" icon="alert-triangle" variant="danger" onPress={() => { pauseSession(); setShowEmergency(true); }} testID="emergency-alert" />
      </View>

      <Modal visible={showEmergency} transparent animationType="fade" onRequestClose={() => setShowEmergency(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.destructive }]}>
              <Feather name="alert-triangle" size={20} color={colors.destructiveForeground} />
            </View>
            <AppText style={styles.modalTitle}>Emergency alert</AppText>
            <AppText style={styles.modalQuestion}>Are you experiencing severe discomfort or an unexpected problem?</AppText>
            <AppText muted style={styles.modalBody}>Your session is paused. This prototype can save an alert on this device but cannot notify your physiotherapist.</AppText>
            <TextInput
              value={emergencyMessage}
              onChangeText={setEmergencyMessage}
              placeholder="Add a short message (optional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.messageInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              accessibilityLabel="Emergency alert message"
              testID="emergency-message"
            />
            <Button label="Save alert on this device" icon="send" variant="danger" onPress={confirmEmergency} />
            <Button label="Cancel" onPress={() => setShowEmergency(false)} variant="quiet" />
          </View>
        </View>
      </Modal>

      <Modal visible={alertSaved} transparent animationType="fade" onRequestClose={() => setAlertSaved(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.goodSurface }]}><Feather name="check" size={20} color={colors.good} /></View>
            <AppText style={styles.modalTitle}>Alert saved</AppText>
            <AppText style={styles.modalBody}>The session has stopped and the alert is stored locally for this demo. It was not delivered to your physiotherapist or emergency services.</AppText>
            <Button label="Return home" onPress={() => { setAlertSaved(false); router.replace('/(tabs)'); }} />
          </View>
        </View>
      </Modal>

      <Modal visible={showEnd} transparent animationType="fade" onRequestClose={() => setShowEnd(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <AppText style={styles.modalTitle}>End this session?</AppText>
            <AppText muted style={styles.modalBody}>Your current repetitions will be saved as a demo session.</AppText>
            <Button
              label="Save and end"
              onPress={() => {
                const session = finishSession('Ended early');
                setShowEnd(false);
                if (session) router.replace({ pathname: '/completed', params: { sessionId: session.id } });
              }}
              icon="square"
            />
            <Button label="Continue session" onPress={() => setShowEnd(false)} variant="outline" />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exerciseHero: { minHeight: 185, borderRadius: 24, padding: 22, justifyContent: 'center', gap: 12 },
  exerciseHeroTitle: { fontFamily: 'Inter_700Bold', fontSize: 27, lineHeight: 34, letterSpacing: -0.6 },
  exerciseHeroCopy: { maxWidth: 340, fontSize: 14, lineHeight: 21 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  position: { fontSize: 12, lineHeight: 18 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  stepNumber: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  stepText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  instructionText: { flex: 1, fontSize: 13, lineHeight: 19 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  smallDisclaimer: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  disclaimer: { fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: 12 },
  sessionTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  sessionHeaderText: { alignItems: 'center', flex: 1 },
  sessionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  sessionProgressCard: { padding: 15, gap: 14 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressBig: { fontFamily: 'Inter_700Bold', fontSize: 23, lineHeight: 28 },
  progressOf: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  sectionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 9 },
  cameraBox: { minHeight: 220, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  cameraPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 25, gap: 9 },
  cameraPlaceholderIcon: { height: 52, width: 52, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  cameraPlaceholderTitle: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  cameraPlaceholderCopy: { color: '#D1E1DB', fontSize: 11, lineHeight: 17, textAlign: 'center', maxWidth: 260 },
  cameraImage: { width: '100%', height: 220, position: 'absolute' },
  captureButton: { position: 'absolute', bottom: 12, alignSelf: 'center', borderRadius: 13, minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  captureText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  cameraStatusRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cameraStatus: { fontSize: 11, flex: 1, lineHeight: 17 },
  linkText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  smallText: { fontSize: 11, lineHeight: 17 },
  feedbackPanel: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 16, backgroundColor: '#E7F3EB' },
  feedbackDot: { height: 8, width: 8, borderRadius: 4 },
  feedbackTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pausedNotice: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 13, padding: 12 },
  actionStack: { gap: 10 },
  secondaryActions: { flexDirection: 'row', gap: 10 },
  actionHalf: { flex: 1 },
  modalScrim: { flex: 1, backgroundColor: 'rgba(11,32,31,0.58)', justifyContent: 'center', padding: 20 },
  modalCard: { maxWidth: 460, width: '100%', alignSelf: 'center', borderRadius: 24, padding: 22, gap: 14 },
  modalIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 21, lineHeight: 27 },
  modalQuestion: { fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 22 },
  modalBody: { fontSize: 12, lineHeight: 18 },
  messageInput: { minHeight: 76, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, textAlignVertical: 'top', fontFamily: 'Inter_400Regular', fontSize: 13 },
});