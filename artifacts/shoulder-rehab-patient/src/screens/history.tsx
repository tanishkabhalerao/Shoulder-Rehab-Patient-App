import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatDuration, formatSessionDate, getExercise } from '../data';
import { useApp } from '../state';
import type { ExerciseSession } from '../models';
import {
  AppText,
  Button,
  Card,
  ChoiceRow,
  EmptyState,
  Eyebrow,
  Field,
  MetricTile,
  Pill,
  Screen,
  ScreenHeader,
} from '../ui';

function SessionRow({ session }: { session: ExerciseSession }) {
  const colors = useColors();
  const exercise = getExercise(session.exerciseId);
  return (
    <Pressable
      accessibilityRole="button"
      testID={`session-${session.id}`}
      onPress={() => router.push({ pathname: '/history/[id]', params: { id: session.id } })}
      style={({ pressed }) => [
        styles.sessionRow,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={[styles.sessionIcon, { backgroundColor: colors.heroSoft }]}>
        <Feather name="activity" size={17} color={colors.primary} />
      </View>
      <View style={styles.rowMain}>
        <AppText style={styles.sessionExercise}>{exercise?.name ?? 'Shoulder exercise'}</AppText>
        <AppText muted style={styles.sessionMeta}>{formatSessionDate(session.date)} · {formatDuration(session.durationSeconds)}</AppText>
        <AppText muted style={styles.sessionMeta}>{session.setsCompleted} sets · {session.repsCompleted} reps · ROM {session.shoulderRom}°</AppText>
      </View>
      <View style={styles.sessionScore}>
        <AppText style={styles.scoreValue}>{session.qualityScore}%</AppText>
        <AppText muted style={styles.scoreCaption}>quality</AppText>
      </View>
    </Pressable>
  );
}

export function SessionHistoryScreen() {
  const { sessions } = useApp();
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Screen>
      <View style={styles.backHeader}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backPress}>
          <Feather name="arrow-left" size={19} color="#173A3A" />
        </Pressable>
        <View style={styles.flex}><AppText style={styles.pageTitle}>Session history</AppText><AppText muted style={styles.pageSub}>Your shoulder exercise sessions</AppText></View>
      </View>
      {sorted.length ? (
        <View style={styles.sessionList}>
          {sorted.map((session) => <SessionRow key={session.id} session={session} />)}
        </View>
      ) : (
        <EmptyState title="No sessions yet" description="Complete an assigned exercise to see its session summary here." icon="clock" />
      )}
      <AppText muted style={styles.disclaimer}>Session measurements are examples in this prototype and are not analyzed by AI.</AppText>
    </Screen>
  );
}

export function SessionDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions } = useApp();
  const session = sessions.find((item) => item.id === id);
  const exercise = getExercise(session?.exerciseId);
  if (!session) {
    return (
      <Screen>
        <ScreenHeader title="Session not found" />
        <Button label="Back to history" icon="arrow-left" variant="outline" onPress={() => router.replace('/history')} />
      </Screen>
    );
  }
  return (
    <Screen>
      <View style={styles.backHeader}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backPress}>
          <Feather name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
        <View style={styles.flex}><AppText style={styles.pageTitle}>Session details</AppText><AppText muted style={styles.pageSub}>{formatSessionDate(session.date)}</AppText></View>
      </View>
      <Card style={styles.detailHero}>
        <Pill label={session.status} tone={session.status === 'Completed' ? 'good' : 'warning'} />
        <AppText style={styles.detailTitle}>{exercise?.name ?? 'Shoulder exercise'}</AppText>
        <AppText muted>{formatDuration(session.durationSeconds)} · {session.setsCompleted} sets · {session.repsCompleted} reps</AppText>
      </Card>
      <View style={styles.metricGrid}>
        <MetricTile label="Shoulder ROM" value={`${session.shoulderRom}`} unit="°" icon="move" />
        <MetricTile label="Quality" value={`${session.qualityScore}`} unit="%" icon="activity" />
        <MetricTile label="Sets" value={`${session.setsCompleted}`} icon="layers" />
        <MetricTile label="Repetitions" value={`${session.repsCompleted}`} icon="repeat" />
      </View>
      <Card>
        <Eyebrow>PERFORMANCE NOTE</Eyebrow>
        <AppText muted style={styles.detailNote}>These sample values are saved locally for the prototype. No live shoulder analysis or physiotherapist sync is connected.</AppText>
      </Card>
      <Button label="Back to history" icon="arrow-left" variant="outline" onPress={() => router.replace('/history')} />
    </Screen>
  );
}

export function CompletionScreen() {
  const colors = useColors();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { sessions } = useApp();
  const session = sessions.find((item) => item.id === sessionId) ?? sessions[0];
  const exercise = getExercise(session?.exerciseId);
  if (!session) {
    return <Screen><EmptyState title="Session summary unavailable" description="Return to your plan to begin another shoulder session." /><Button label="Back home" onPress={() => router.replace('/(tabs)')} /></Screen>;
  }
  const completed = session.status === 'Completed';
  return (
    <Screen contentStyle={styles.completionContent}>
      <View style={[styles.completionIcon, { backgroundColor: colors.goodSurface }]}>
        <Feather name={completed ? 'check' : 'pause'} size={26} color={colors.good} />
      </View>
      <Pill label={completed ? 'SESSION COMPLETE' : 'SESSION SAVED'} tone={completed ? 'good' : 'warning'} />
      <AppText style={styles.completionTitle}>{completed ? 'Exercise completed.' : 'Session saved.'}</AppText>
      <AppText muted style={styles.completionSubtitle}>
        {exercise?.name ?? 'Shoulder exercise'} · {formatDuration(session.durationSeconds)}
      </AppText>
      <Card style={styles.completionCard}>
        <View style={styles.completionStats}>
          <MetricTile label="Sets" value={`${session.setsCompleted}`} icon="layers" />
          <MetricTile label="Repetitions" value={`${session.repsCompleted}`} icon="repeat" />
        </View>
        <View style={styles.completionStats}>
          <MetricTile label="Quality" value={`${session.qualityScore}`} unit="%" icon="activity" />
          <MetricTile label="Shoulder ROM" value={`${session.shoulderRom}`} unit="°" icon="move" />
        </View>
        <AppText muted style={styles.demoCaption}>Illustrative values only · camera and AI analysis are not connected.</AppText>
      </Card>
      <Button label="Share how it felt" icon="message-circle" onPress={() => router.push({ pathname: '/feedback', params: { sessionId: session.id } })} />
      <Button label="View session" icon="file-text" variant="outline" onPress={() => router.push({ pathname: '/history/[id]', params: { id: session.id } })} />
      <Button label="Back to exercises" icon="arrow-left" variant="quiet" onPress={() => router.replace('/(tabs)/exercises')} />
    </Screen>
  );
}

export function FeedbackScreen() {
  const colors = useColors();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { saveFeedback } = useApp();
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Difficult'>('Moderate');
  const [discomfort, setDiscomfort] = useState<'None' | 'Mild' | 'Significant'>('None');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <Screen>
      <View style={styles.backHeader}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backPress}>
          <Feather name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
        <View style={styles.flex}><AppText style={styles.pageTitle}>Session feedback</AppText><AppText muted style={styles.pageSub}>Your experience, in your own words</AppText></View>
      </View>
      {submitted ? (
        <Card style={styles.submittedCard}>
          <View style={[styles.completionIcon, { backgroundColor: colors.goodSurface }]}><Feather name="check" size={23} color={colors.good} /></View>
          <AppText style={styles.sectionTitle}>Feedback saved</AppText>
          <AppText muted style={styles.detailNote}>This prototype saved your response on this device. It has not been shared with your physiotherapist.</AppText>
          <Button label="Return home" onPress={() => router.replace('/(tabs)')} />
        </Card>
      ) : (
        <>
          <Card style={styles.feedbackQuestion}>
            <Eyebrow>DIFFICULTY</Eyebrow>
            <AppText style={styles.questionTitle}>How did the exercise feel?</AppText>
            <ChoiceRow options={['Easy', 'Moderate', 'Difficult']} value={difficulty} onChange={(value) => setDifficulty(value as typeof difficulty)} />
          </Card>
          <Card style={styles.feedbackQuestion}>
            <Eyebrow>DISCOMFORT</Eyebrow>
            <AppText style={styles.questionTitle}>Did you notice discomfort?</AppText>
            <ChoiceRow options={['None', 'Mild', 'Significant']} value={discomfort} onChange={(value) => setDiscomfort(value as typeof discomfort)} />
          </Card>
          <Card>
            <Field
              label="Comments"
              value={comments}
              onChangeText={setComments}
              placeholder="Anything you want to note about this session?"
              multiline
              numberOfLines={4}
              containerStyle={styles.commentField}
              textAlignVertical="top"
              maxLength={500}
            />
          </Card>
          {discomfort === 'Significant' ? (
            <View style={[styles.discomfortNotice, { backgroundColor: colors.warningSurface }]}>
              <Feather name="info" size={16} color={colors.warning} />
              <AppText style={[styles.detailNote, { color: colors.warning }]}>If you have concerns, contact your physiotherapist directly. This prototype does not monitor submissions.</AppText>
            </View>
          ) : null}
          <Button label="Submit feedback" icon="send" onPress={() => { saveFeedback({ sessionId: sessionId ?? 'unknown', difficulty, discomfort, comments: comments.trim() }); setSubmitted(true); }} testID="submit-feedback" />
          <AppText muted style={styles.disclaimer}>Feedback is saved only on this device in the demo.</AppText>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  backPress: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
  pageTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, letterSpacing: -0.5 },
  pageSub: { fontSize: 12, marginTop: 3 },
  sessionList: { gap: 10 },
  sessionRow: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sessionIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowMain: { flex: 1, gap: 2 },
  sessionExercise: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  sessionMeta: { fontSize: 10, lineHeight: 15 },
  sessionScore: { alignItems: 'flex-end' },
  scoreValue: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  scoreCaption: { fontSize: 9 },
  disclaimer: { fontSize: 10, lineHeight: 15, textAlign: 'center' },
  detailHero: { padding: 21 },
  detailTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, lineHeight: 30 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailNote: { fontSize: 12, lineHeight: 19 },
  completionContent: { alignItems: 'stretch', paddingTop: 44 },
  completionIcon: { alignSelf: 'center', height: 62, width: 62, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  completionTitle: { textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7, marginTop: -8 },
  completionSubtitle: { textAlign: 'center', fontSize: 13, marginTop: -12 },
  completionCard: { padding: 13 },
  completionStats: { flexDirection: 'row', gap: 10 },
  demoCaption: { fontSize: 10, lineHeight: 15, textAlign: 'center' },
  feedbackQuestion: { gap: 12 },
  questionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  commentField: { minHeight: 130 },
  discomfortNotice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 13, borderRadius: 14 },
  submittedCard: { padding: 22, alignItems: 'stretch' },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },
});