export interface Patient {
  id: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  physiotherapist: string;
  focus: 'Shoulder';
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  focus: string;
  sets: number;
  reps: number;
  difficulty: 'Gentle' | 'Moderate';
  durationMinutes: number;
  targetRom: number | null;
  instructions: string[];
  commonMistakes: string[];
  position: string;
}

export interface MovementData {
  leftShoulderAngle: number;
  rightShoulderAngle: number;
  shoulderRom: number;
  movementQuality: number;
  repetitionCount: number;
  isDemo: true;
}

export interface ExerciseSession {
  id: string;
  patientId: string;
  exerciseId: string;
  date: string;
  durationSeconds: number;
  setsCompleted: number;
  repsCompleted: number;
  qualityScore: number;
  shoulderRom: number;
  status: 'Completed' | 'Ended early';
  isDemo: true;
}

export interface SessionFeedback {
  id: string;
  sessionId: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult';
  discomfort: 'None' | 'Mild' | 'Significant';
  comments: string;
  date: string;
}

export interface EmergencyAlert {
  id: string;
  patientId: string;
  patientName: string;
  exerciseId: string;
  exerciseName: string;
  sessionId: string;
  timestamp: string;
  currentSet: number;
  currentRepetition: number;
  message: string;
  status: 'Saved locally — not sent';
}

export interface ActiveSession {
  id: string;
  exerciseId: string;
  startedAt: string;
  elapsedSeconds: number;
  currentSet: number;
  currentRep: number;
  paused: boolean;
}