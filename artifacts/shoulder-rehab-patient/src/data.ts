import type { Exercise, ExerciseSession, MovementData, Patient } from './models';

export const DEMO_PATIENT: Patient = {
  id: 'PT-0248',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  age: 34,
  gender: 'Prefer not to say',
  phone: '+1 (555) 010-2048',
  physiotherapist: 'Jordan Lee',
  focus: 'Shoulder',
};

export const EXERCISES: Exercise[] = [
  {
    id: 'shoulder-flexion',
    name: 'Shoulder flexion',
    description: 'A controlled forward arm raise from a comfortable starting position.',
    focus: 'Forward arm raise',
    sets: 3,
    reps: 10,
    difficulty: 'Gentle',
    durationMinutes: 8,
    targetRom: null,
    position: 'Sit or stand comfortably with your shoulders relaxed.',
    instructions: [
      'Begin with your arm resting comfortably by your side.',
      'Raise the arm forward at a steady, comfortable pace.',
      'Pause briefly, then lower the arm with control.',
      'Keep your breathing relaxed throughout the movement.',
    ],
    commonMistakes: [
      'Rushing through the movement',
      'Lifting the shoulder toward the ear',
      'Leaning the body to create extra movement',
    ],
  },
  {
    id: 'shoulder-abduction',
    name: 'Shoulder abduction',
    description: 'A controlled arm raise out to the side, staying within a comfortable range.',
    focus: 'Side arm raise',
    sets: 3,
    reps: 10,
    difficulty: 'Moderate',
    durationMinutes: 10,
    targetRom: null,
    position: 'Stand tall or sit upright with your arm resting by your side.',
    instructions: [
      'Start with your arm relaxed beside you.',
      'Move your arm out to the side at a steady pace.',
      'Pause briefly, then return slowly to the starting position.',
      'Keep your torso still and movement comfortable.',
    ],
    commonMistakes: [
      'Shrugging the shoulder',
      'Tilting the torso to the opposite side',
      'Moving faster on the way down',
    ],
  },
  {
    id: 'seated-arm-raise',
    name: 'Seated arm raise',
    description: 'A seated shoulder movement with the back supported and motion kept controlled.',
    focus: 'Seated movement',
    sets: 2,
    reps: 8,
    difficulty: 'Gentle',
    durationMinutes: 7,
    targetRom: null,
    position: 'Sit upright with both feet supported and your back relaxed.',
    instructions: [
      'Sit in a stable chair and rest your arm by your side.',
      'Raise the arm in front of you through a comfortable range.',
      'Lower it slowly without leaning your body.',
    ],
    commonMistakes: [
      'Rounding the upper back',
      'Using momentum to lift the arm',
      'Holding your breath',
    ],
  },
  {
    id: 'external-rotation',
    name: 'Shoulder external rotation',
    description: 'A small, controlled outward rotation with the elbow kept close to the body.',
    focus: 'Outward rotation',
    sets: 2,
    reps: 10,
    difficulty: 'Gentle',
    durationMinutes: 8,
    targetRom: null,
    position: 'Keep your elbow comfortably near your side.',
    instructions: [
      'Begin with your elbow bent and close to your side.',
      'Rotate the forearm outward through a comfortable range.',
      'Return slowly to the starting position.',
    ],
    commonMistakes: [
      'Moving the elbow away from the body',
      'Turning the torso instead of the arm',
      'Forcing the end of the movement',
    ],
  },
];

export const TODAY_EXERCISE_IDS = ['shoulder-flexion', 'shoulder-abduction'];

export const DEMO_MOVEMENT: MovementData = {
  leftShoulderAngle: 73,
  rightShoulderAngle: 76,
  shoulderRom: 78,
  movementQuality: 91,
  repetitionCount: 8,
  isDemo: true,
};

export const DEMO_SESSIONS: ExerciseSession[] = [
  {
    id: 'SES-1024',
    patientId: DEMO_PATIENT.id,
    exerciseId: 'shoulder-flexion',
    date: '2026-09-29T17:42:00.000Z',
    durationSeconds: 512,
    setsCompleted: 3,
    repsCompleted: 30,
    qualityScore: 89,
    shoulderRom: 76,
    status: 'Completed',
    isDemo: true,
  },
  {
    id: 'SES-1023',
    patientId: DEMO_PATIENT.id,
    exerciseId: 'shoulder-abduction',
    date: '2026-09-28T17:18:00.000Z',
    durationSeconds: 584,
    setsCompleted: 3,
    repsCompleted: 30,
    qualityScore: 85,
    shoulderRom: 74,
    status: 'Completed',
    isDemo: true,
  },
  {
    id: 'SES-1022',
    patientId: DEMO_PATIENT.id,
    exerciseId: 'shoulder-flexion',
    date: '2026-09-26T16:50:00.000Z',
    durationSeconds: 498,
    setsCompleted: 3,
    repsCompleted: 30,
    qualityScore: 87,
    shoulderRom: 75,
    status: 'Completed',
    isDemo: true,
  },
  {
    id: 'SES-1021',
    patientId: DEMO_PATIENT.id,
    exerciseId: 'external-rotation',
    date: '2026-09-24T17:02:00.000Z',
    durationSeconds: 447,
    setsCompleted: 2,
    repsCompleted: 20,
    qualityScore: 87,
    shoulderRom: 72,
    status: 'Completed',
    isDemo: true,
  },
];

export function getExercise(id: string | undefined): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id);
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function formatSessionDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}