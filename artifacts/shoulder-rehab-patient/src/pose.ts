import { DEMO_LANDMARKS, DEMO_POSE_ANALYSIS } from './data';
import type { Exercise, PoseAnalysis, PoseLandmark } from './models';

export const POSE_LANDMARK_NAMES = [
  'SHOULDER',
  'ELBOW',
  'WRIST',
  'HIP',
  'KNEE',
  'ANKLE',
] as const;

/**
 * Adapter boundary for a future Python/OpenCV + MediaPipe service.
 * The app consumes normalized landmarks and never assumes a camera frame is AI-analyzed.
 */
export interface PoseAnalysisRequest {
  exercise: Pick<Exercise, 'id' | 'requiredLandmarks' | 'movementThreshold'>;
  landmarks: PoseLandmark[];
  timestamp?: string;
}

export function analyzePoseFrame(request: PoseAnalysisRequest): PoseAnalysis {
  return {
    ...DEMO_POSE_ANALYSIS,
    exerciseId: request.exercise.id,
    capturedAt: request.timestamp ?? new Date().toISOString(),
    landmarks: request.landmarks,
    source: 'demo',
  };
}

export function getDemoPoseAnalysis(exerciseId: string): PoseAnalysis {
  return analyzePoseFrame({
    exercise: { id: exerciseId, requiredLandmarks: DEMO_LANDMARKS.map((item) => item.name), movementThreshold: undefined },
    landmarks: DEMO_LANDMARKS,
  });
}