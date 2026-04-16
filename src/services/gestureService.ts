import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type GestureType = 'none' | 'pinch' | 'open_palm' | 'point' | 'swipe_left' | 'swipe_right';

export interface GestureState {
  type: GestureType;
  confidence: number;
  position: { x: number; y: number };
  isNew: boolean; // True only on the first frame a gesture is detected
  isEnding: boolean; // True only on the frame a gesture is lost
  rawPinchDistance?: number;
}

/**
 * GestureProcessor
 * 
 * Handles temporal smoothing, scale normalization, and gesture detection
 * logic on top of raw MediaPipe landmarks.
 */
export class GestureProcessor {
  private history: NormalizedLandmark[][] = [];
  private readonly maxHistory = 8;
  private readonly smoothingFactor = 0.6;
  private smoothedLandmarks: NormalizedLandmark[] = [];

  // Gesture stability state
  private gestureHistory: GestureType[] = [];
  private currentGesture: GestureType = 'none';
  private previousGesture: GestureType = 'none';
  private gestureConfidence = 0;
  private readonly confidenceThreshold = 4; // Must be detected in 4/8 frames

  // Swipe detection state
  private lastSwipeTime = 0;
  private readonly swipeCooldown = 800; // ms

  /**
   * Processes a new frame of landmarks
   */
  process(landmarks: NormalizedLandmark[]): GestureState {
    // 1. Apply Temporal Smoothing (Lerp)
    if (this.smoothedLandmarks.length === 0) {
      this.smoothedLandmarks = [...landmarks];
    } else {
      this.smoothedLandmarks = landmarks.map((lm, i) => ({
        ...lm,
        x: this.smoothedLandmarks[i].x + (lm.x - this.smoothedLandmarks[i].x) * this.smoothingFactor,
        y: this.smoothedLandmarks[i].y + (lm.y - this.smoothedLandmarks[i].y) * this.smoothingFactor,
        z: this.smoothedLandmarks[i].z + (lm.z - this.smoothedLandmarks[i].z) * this.smoothingFactor,
      }));
    }

    // 2. Update History
    this.history.push([...this.smoothedLandmarks]);
    if (this.history.length > this.maxHistory) this.history.shift();

    // 3. Detect Raw Gesture
    const rawGesture = this.detectRawGesture(this.smoothedLandmarks);

    // 4. Temporal Stability (Debouncing)
    this.gestureHistory.push(rawGesture);
    if (this.gestureHistory.length > this.maxHistory) this.gestureHistory.shift();

    const counts = this.gestureHistory.reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let bestGesture: GestureType = 'none';
    let maxCount = 0;
    for (const [g, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestGesture = g as GestureType;
      }
    }

    const newGesture = maxCount >= this.confidenceThreshold ? bestGesture : 'none';

    const isNew = newGesture !== 'none' && newGesture !== this.currentGesture;
    const isEnding = this.currentGesture !== 'none' && newGesture === 'none';

    this.previousGesture = this.currentGesture;
    this.currentGesture = newGesture;

    return {
      type: this.currentGesture,
      confidence: maxCount / this.maxHistory,
      position: { x: this.smoothedLandmarks[8].x, y: this.smoothedLandmarks[8].y }, // Use index tip as cursor
      isNew,
      isEnding,
      rawPinchDistance: this.getDistance(
        { x: this.smoothedLandmarks[4].x * window.innerWidth, y: this.smoothedLandmarks[4].y * window.innerHeight, z: 0 },
        { x: this.smoothedLandmarks[8].x * window.innerWidth, y: this.smoothedLandmarks[8].y * window.innerHeight, z: 0 }
      )
    };
  }

  private detectRawGesture(lm: NormalizedLandmark[]): GestureType {
    // Scale Normalization: Use distance between wrist (0) and middle finger MCP (9) as reference
    const scale = this.getDistance(lm[0], lm[9]);

    // 1. Swipe Detection (Temporal)
    const now = performance.now();
    if (this.history.length >= 10 && now - this.lastSwipeTime > this.swipeCooldown) {
      const startWrist = this.history[0][0];
      const endWrist = lm[0];
      const dx = endWrist.x - startWrist.x;
      const dy = endWrist.y - startWrist.y;

      // Horizontal swipe threshold
      if (Math.abs(dx) > 0.15 && Math.abs(dy) < 0.1) {
        this.lastSwipeTime = now;
        return dx > 0 ? 'swipe_right' : 'swipe_left';
      }
    }

    // 2. Pinch Detection (Thumb tip 4 + Index tip 8)
    const pinchDist = this.getDistance(lm[4], lm[8]) / scale;
    if (pinchDist < 0.4) return 'pinch';

    // 3. Finger Extension Checks
    const isIndexExtended = lm[8].y < lm[6].y;
    const isMiddleExtended = lm[12].y < lm[10].y;
    const isRingExtended = lm[16].y < lm[14].y;
    const isPinkyExtended = lm[20].y < lm[18].y;

    // 4. Point Detection (Only Index)
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'point';
    }

    // 5. Open Palm Detection (All extended)
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return 'open_palm';
    }

    return 'none';
  }

  private getDistance(p1: NormalizedLandmark, p2: NormalizedLandmark): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
}
