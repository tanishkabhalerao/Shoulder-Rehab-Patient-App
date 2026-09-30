import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEMO_PATIENT, DEMO_SESSIONS, EXERCISES, getExercise } from './data';
import type {
  ActiveSession,
  EmergencyAlert,
  ExerciseSession,
  Patient,
  SessionFeedback,
} from './models';

const STORAGE_KEY = 'shoulder-rehab-patient.v1';

interface PersistedData {
  patient: Patient;
  isAuthenticated: boolean;
  sessions: ExerciseSession[];
  feedback: SessionFeedback[];
  alerts: EmergencyAlert[];
  demoPassword: string;
}

const INITIAL_DATA: PersistedData = {
  patient: DEMO_PATIENT,
  isAuthenticated: false,
  sessions: DEMO_SESSIONS,
  feedback: [],
  alerts: [],
  demoPassword: 'shoulder-demo',
};

interface AppContextValue extends PersistedData {
  hydrated: boolean;
  storageError: boolean;
  activeSession: ActiveSession | null;
  latestSession: ExerciseSession | null;
  signIn: (email: string, password: string) => string | null;
  continueAsDemo: () => void;
  register: (values: Pick<Patient, 'fullName' | 'email' | 'age' | 'gender' | 'phone'>, password: string) => void;
  pauseSession: () => void;
  signOut: () => void;
  updateProfile: (profile: Partial<Patient>) => void;
  updateDemoPassword: (current: string, next: string) => string | null;
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
    (email: string, password: string): string | null => {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return 'Enter a valid email address.';
      }
      if (password !== data.demoPassword) return 'That password does not match this demo profile.';
      if (email.trim().toLowerCase() !== data.patient.email.toLowerCase()) {
        return 'No demo profile uses that email. Create a local demo account first.';
      }
      setData((current) => ({
        ...current,
        isAuthenticated: true,
        patient:
          email.toLowerCase() === current.patient.email.toLowerCase()
            ? current.patient
            : { ...current.patient, email: email.trim() },
      }));
      return null;
    },
    [data.demoPassword, data.patient.email],
  );

  const continueAsDemo = useCallback(() => {
    setData((current) => ({ ...current, isAuthenticated: true }));
  }, []);

  const register = useCallback(
    (values: Pick<Patient, 'fullName' | 'email' | 'age' | 'gender' | 'phone'>, password: string) => {
      setData((current) => ({
        ...current,
        isAuthenticated: true,
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
    setData((current) => ({ ...current, isAuthenticated: false }));
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
      const exercise = getExercise(current.exerciseId);
      if (!exercise || current.currentRep >= exercise.reps) return current;
      return { ...current, currentRep: current.currentRep + 1 };
    });
  }, []);

  const completeSet = useCallback(() => {
    setActiveSession((current) => {
      if (!current) return current;
      const exercise = getExercise(current.exerciseId);
      if (!exercise || current.currentRep < exercise.reps || current.currentSet >= exercise.sets) {
        return current;
      }
      return { ...current, currentSet: current.currentSet + 1, currentRep: 0 };
    });
  }, []);

  const finishSession = useCallback(
    (status: 'Completed' | 'Ended early' = 'Completed'): ExerciseSession | null => {
      if (!activeSession) return null;
      const exercise = getExercise(activeSession.exerciseId);
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
        status,
        isDemo: true,
      };
      setData((current) => ({ ...current, sessions: [session, ...current.sessions] }));
      setActiveSession(null);
      return session;
    },
    [activeSession, data.patient.id],
  );

  const sendEmergencyAlert = useCallback(
    (message: string): EmergencyAlert | null => {
      if (!activeSession) return null;
      const exercise = getExercise(activeSession.exerciseId);
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
    [activeSession, data.patient.fullName, data.patient.id],
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
      activeSession,
      latestSession,
      signIn,
      continueAsDemo,
      register,
      pauseSession,
      signOut,
      updateProfile,
      updateDemoPassword,
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
      activeSession,
      latestSession,
      signIn,
      continueAsDemo,
      register,
      pauseSession,
      signOut,
      updateProfile,
      updateDemoPassword,
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