export type UserRole = 'patient' | 'physiotherapist';

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  physiotherapist: string;
  focus: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  focus: string;
  sets: number;
  reps: number;
  difficulty: 'Gentle' | 'Moderate' | 'Challenging';
  durationMinutes: number;
  targetRom: number | null;
  instructions: string[];
  commonMistakes: string[];
  position: string;
  precautions?: string[];
  requiredLandmarks?: string[];
  movementThreshold?: string;
}

export interface MovementData {
  leftShoulderAngle: number;
  rightShoulderAngle: number;
  shoulderRom: number;
  movementQuality: number;
  repetitionCount: number;
  isDemo: boolean;
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
  postureScore?: number;
  isDemo: boolean;
}

export interface Physiotherapist {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  clinic: string;
}

export interface PoseLandmark {
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface JointAngle {
  name: string;
  value: number;
  landmarks: [string, string, string];
  status: 'good' | 'attention';
}

export interface PoseAnalysis {
  exerciseId: string;
  capturedAt: string;
  landmarks: PoseLandmark[];
  jointAngles: JointAngle[];
  repetitionCount: number;
  postureScore: number;
  performanceScore: number;
  feedback: string;
  source: 'demo' | 'mediapipe';
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