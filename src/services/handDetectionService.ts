import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker | null = null;
let isLoading = false;

/**
 * Hand Detection Service
 *
 * Manages the lifecycle of the MediaPipe HandLandmarker.
 * Uses WebAssembly (WASM) for high-performance, on-device processing.
 */
export const initHandDetection = async () => {
  if (handLandmarker) return handLandmarker;
  if (isLoading) return null;

  isLoading = true;
  try {
    console.log('[System] Initializing MediaPipe HandLandmarker...');

    // Clear existing if any (for clean retry)
    if (handLandmarker) {
      handLandmarker.close();
      handLandmarker = null;
    }

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    console.log('[System] MediaPipe HandLandmarker initialized successfully');
    return handLandmarker;
  } catch (error) {
    console.error('[System] HandLandmarker initialization failed:', error);
    handLandmarker = null; // Ensure null on failure
    throw error;
  } finally {
    isLoading = false;
  }
};

export const getHandLandmarker = () => handLandmarker;
