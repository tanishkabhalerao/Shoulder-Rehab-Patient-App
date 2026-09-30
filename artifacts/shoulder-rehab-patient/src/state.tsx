import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEMO_PATIENT, DEMO_PHYSIOTHERAPIST, DEMO_SESSIONS, EXERCISES, SAMPLE_PATIENTS } from './data';
import type {
  ActiveSession,
  EmergencyAlert,
  Exercise,
  ExerciseSession,
  Patient,
  Physiotherapist,
  SessionFeedback,
  UserRole,
} from './models';

const STORAGE_KEY = 'shoulder-rehab-platform.v2';

interface PersistedData {
  patient: Patient;
  physiotherapist: Physiotherapist;
  patients: Patient[];
  exercises: Exercise[];
  assignedExerciseIds: Record<string, string[]>;
  role: UserRole | null;
  isAuthenticated: boolean;
  sessions: ExerciseSession[];
  feedback: SessionFeedback[];
  alerts: EmergencyAlert[];
  demoPassword: string;
}

const INITIAL_DATA: PersistedData = {
  patient: DEMO_PATIENT,
  physiotherapist: DEMO_PHYSIOTHERAPIST,
  patients: SAMPLE_PATIENTS,
  exercises: EXERCISES,
  assignedExerciseIds: {
    [DEMO_PATIENT.id]: ['shoulder-flexion', 'shoulder-abduction', 'seated-arm-raise', 'external-rotation'],
    'PT-0314': ['shoulder-abduction', 'shoulder-flexion'],
    'PT-0187': ['seated-arm-raise', 'external-rotation'],
  },
  role: null,
  isAuthenticated: false,
  sessions: DEMO_SESSIONS,
  feedback: [],
  alerts: [],
  demoPassword: 'shoulder-demo',
};

interface AppContextValue extends PersistedData {
  hydrated: boolean;
  storageError: boolean;
  role: UserRole | null;
  activeSession: ActiveSession | null;
  latestSession: ExerciseSession | null;
  assignedExercises: Exercise[];
  signIn: (email: string, password: string, selectedRole: UserRole) => string | null;
  continueAsDemo: (selectedRole: UserRole) => void;
  register: (values: Pick<Patient, 'fullName' | 'email' | 'age' | 'gender' | 'phone'>, password: string) => void;
  pauseSession: () => void;
  signOut: () => void;
  updateProfile: (profile: Partial<Patient>) => void;
  updateDemoPassword: (current: string, next: string) => string | null;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Exercise;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  assignExercise: (patientId: string, exerciseId: string) => void;
  findExercise: (id: string | undefined) => Exercise | undefined;
  startSession: (exerciseId: string) => ActiveSession;
  tickSession: () => void;
  togglePause: () => void;
  countRep: () => void;
  completeSet: () => void;
  finishSession: (status?: 'Completed' | 'Ended early') => ExerciseSession | null;
  sendEmergencyAlert: (message: string) => EmergencyAlert | null;
  saveFeedback: (values: Omit<SessionFeedback, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PersistedData>(INITIAL_DATA);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!mounted) return;
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<PersistedData>;
          setData({ ...INITIAL_DATA, ...parsed });
        }
      })
      .catch(() => {
        if (mounted) setStorageError(true);
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [data, hydrated]);

  const signIn = useCallback(
    (email: string, password: string, selectedRole: UserRole): string | null => {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return 'Enter a valid email address.';
      }
      const expectedEmail = selectedRole === 'patient' ? data.patient.email : data.physiotherapist.email;
      const expectedPassword = selectedRole === 'patient' ? data.demoPassword : 'Physio123';
      if (password !== expectedPassword) return 'That password does not match this demo profile.';
      if (email.trim().toLowerCase() !== expectedEmail.toLowerCase()) {
        return `No ${selectedRole} demo profile uses that email.`;
      }
      setData((current) => ({
        ...current,
        isAuthenticated: true,
        role: selectedRole,
      }));
      return null;
    },
    [data.demoPassword, data.patient.email, data.physiotherapist.email],
  );

  const continueAsDemo = useCallback((selectedRole: UserRole) => {
    setData((current) => ({ ...current, isAuthenticated: true, role: selectedRole }));
  }, []);

  const register = useCallback(
    (values: Pick<Patient, 'fullName' | 'email' | 'age' | 'gender' | 'phone'>, password: string) => {
      setData((current) => ({
        ...current,
        isAuthenticated: true,
        role: 'patient',
        demoPassword: password,
        patient: {
          ...current.patient,
          ...values,
          id: `PT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          physiotherapist: 'Jordan Lee',
          focus: 'Shoulder',
        },
      }));
    },
    [],
  );

  const signOut = useCallback(() => {
    setData((current) => ({ ...current, isAuthenticated: false, role: null }));
    setActiveSession(null);
  }, []);

  const updateProfile = useCallback((profile: Partial<Patient>) => {
    setData((current) => ({ ...current, patient: { ...current.patient, ...profile } }));
  }, []);

  const updateDemoPassword = useCallback((current: string, next: string): string | null => {
    if (data.demoPassword !== current) return 'The current demo password does not match.';
    setData((previous) => ({ ...previous, demoPassword: next }));
    return null;
  }, [data.demoPassword]);

  const findExercise = useCallback(
    (id: string | undefined): Exercise | undefined => data.exercises.find((exercise) => exercise.id === id),
    [data.exercises],
  );

  const assignedExercises = useMemo(
    () => data.exercises.filter((exercise) => (data.assignedExerciseIds[data.patient.id] ?? []).includes(exercise.id)),
    [data.assignedExerciseIds, data.exercises, data.patient.id],
  );

  const addExercise = useCallback((exercise: Omit<Exercise, 'id'>): Exercise => {
    const created: Exercise = { ...exercise, id: `exercise-${Date.now().toString(36)}` };
    setData((current) => ({ ...current, exercises: [...current.exercises, created] }));
    return created;
  }, []);

  const updateExercise = useCallback((id: string, exercise: Partial<Exercise>) => {
    setData((current) => ({
      ...current,
      exercises: current.exercises.map((item) => (item.id === id ? { ...item, ...exercise } : item)),
    }));
  }, []);

  const deleteExercise = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      exercises: current.exercises.filter((exercise) => exercise.id !== id),
      assignedExerciseIds: Object.fromEntries(
        Object.entries(current.assignedExerciseIds).map(([patientId, exerciseIds]) => [
          patientId,
          exerciseIds.filter((exerciseId) => exerciseId !== id),
        ]),
      ),
    }));
  }, []);

  const assignExercise = useCallback((patientId: string, exerciseId: string) => {
    setData((current) => {
      const currentAssignments = current.assignedExerciseIds[patientId] ?? [];
      if (currentAssignments.includes(exerciseId)) return current;
      return {
        ...current,
        assignedExerciseIds: {
          ...current.assignedExerciseIds,
          [patientId]: [...currentAssignments, exerciseId],
        },
      };
    });
  }, []);

  const startSession = useCallback((exerciseId: string): ActiveSession => {
    const session: ActiveSession = {
      id: createId('SES'),
      exerciseId,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      currentSet: 1,
      currentRep: 0,
      paused: false,
    };
    setActiveSession(session);
    return session;
  }, []);

  const tickSession = useCallback(() => {
    setActiveSession((current) =>
      !current || current.paused ? current : { ...current, elapsedSeconds: current.elapsedSeconds + 1 },
    );
  }, []);

  const togglePause = useCallback(() => {
    setActiveSession((current) => (current ? { ...current, paused: !current.paused } : current));
  }, []);

  const pauseSession = useCallback(() => {
    setActiveSession((current) => (current ? { ...current, paused: true } : current));
  }, []);

  const countRep = useCallback(() => {
    setActiveSession((current) => {
      if (!current) return current;
      const exercise = findExercise(current.exerciseId);
      if (!exercise || current.currentRep >= exercise.reps) return current;
      return { ...current, currentRep: current.currentRep + 1 };
    });
  }, [findExercise]);

  const completeSet = useCallback(() => {
    setActiveSession((current) => {
      if (!current) return current;
      const exercise = findExercise(current.exerciseId);
      if (!exercise || current.currentRep < exercise.reps || current.currentSet >= exercise.sets) {
        return current;
      }
      return { ...current, currentSet: current.currentSet + 1, currentRep: 0 };
    });
  }, [findExercise]);

  const finishSession = useCallback(
    (status: 'Completed' | 'Ended early' = 'Completed'): ExerciseSession | null => {
      if (!activeSession) return null;
      const exercise = findExercise(activeSession.exerciseId);
      if (!exercise) return null;
      const setsCompleted =
        status === 'Completed'
          ? exercise.sets
          : Math.max(0, activeSession.currentSet - 1) +
            (activeSession.currentRep >= exercise.reps ? 1 : 0);
      const repsCompleted =
        status === 'Completed'
          ? exercise.sets * exercise.reps
          : Math.max(0, activeSession.currentSet - 1) * exercise.reps + activeSession.currentRep;
      const session: ExerciseSession = {
        id: activeSession.id,
        patientId: data.patient.id,
        exerciseId: exercise.id,
        date: new Date().toISOString(),
        durationSeconds: activeSession.elapsedSeconds,
        setsCompleted,
        repsCompleted,
        qualityScore: 89,
        shoulderRom: 76,
        postureScore: 88,
        status,
        isDemo: true,
      };
      setData((current) => ({ ...current, sessions: [session, ...current.sessions] }));
      setActiveSession(null);
      return session;
    },
    [activeSession, data.patient.id, findExercise],
  );

  const sendEmergencyAlert = useCallback(
    (message: string): EmergencyAlert | null => {
      if (!activeSession) return null;
      const exercise = findExercise(activeSession.exerciseId);
      if (!exercise) return null;
      const alert: EmergencyAlert = {
        id: createId('ALT'),
        patientId: data.patient.id,
        patientName: data.patient.fullName,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sessionId: activeSession.id,
        timestamp: new Date().toISOString(),
        currentSet: activeSession.currentSet,
        currentRepetition: activeSession.currentRep,
        message: message.trim() || 'Patient requested an emergency alert.',
        status: 'Saved locally — not sent',
      };
      setData((current) => ({ ...current, alerts: [alert, ...current.alerts] }));
      return alert;
    },
    [activeSession, data.patient.fullName, data.patient.id, findExercise],
  );

  const saveFeedback = useCallback((values: Omit<SessionFeedback, 'id' | 'date'>) => {
    const feedback: SessionFeedback = {
      ...values,
      id: createId('FDB'),
      date: new Date().toISOString(),
    };
    setData((current) => ({ ...current, feedback: [feedback, ...current.feedback] }));
  }, []);

  const latestSession = data.sessions[0] ?? null;
  const value = useMemo<AppContextValue>(
    () => ({
      ...data,
      hydrated,
      storageError,
      role: data.role,
      activeSession,
      latestSession,
      assignedExercises,
      signIn,
      continueAsDemo,
      register,
      pauseSession,
      signOut,
      updateProfile,
      updateDemoPassword,
      addExercise,
      updateExercise,
      deleteExercise,
      assignExercise,
      findExercise,
      startSession,
      tickSession,
      togglePause,
      countRep,
      completeSet,
      finishSession,
      sendEmergencyAlert,
      saveFeedback,
    }),
    [
      data,
      hydrated,
      storageError,
      assignedExercises,
      activeSession,
      latestSession,
      signIn,
      continueAsDemo,
      register,
      pauseSession,
      signOut,
      updateProfile,
      updateDemoPassword,
      addExercise,
      updateExercise,
      deleteExercise,
      assignExercise,
      findExercise,
      startSession,
      tickSession,
      togglePause,
      countRep,
      completeSet,
      finishSession,
      sendEmergencyAlert,
      saveFeedback,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}