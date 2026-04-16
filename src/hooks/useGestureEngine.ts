import React, { useRef, useState, useMemo, useEffect } from 'react';
import { getHandLandmarker } from '../services/handDetectionService';
import { GestureProcessor, GestureState } from '../services/gestureService';
import { HAND_CONNECTIONS } from '../constants/handConnections';

interface GestureEngineProps {
  isAIReady: boolean;
  systemStage: 'test' | 'dashboard';
  viewMode: 'dashboard' | 'report';
  debugMode: boolean;
  isStable: boolean;
  setIsStable: (v: boolean) => void;
  setStabilityScore: (v: number) => void;
  setGesture: (v: GestureState) => void;
  setHoveredId: (v: string | null) => void;
  setIsClicked: (v: boolean) => void;
  setActivePatientIndex: (update: (prev: number) => number) => void;
  setViewState: (update: (prev: { scale: number; x: number; y: number }) => { scale: number; x: number; y: number }) => void;
  setViewMode: (v: 'dashboard' | 'report') => void;
  setCurrentFps: (v: number) => void;
  setIsTrackingLost: (v: boolean) => void;
  setShowRestored: (v: boolean) => void;
  targetPosRef: React.MutableRefObject<{ x: number; y: number }>;
  lastIsClicked: React.MutableRefObject<boolean>;
  lastGestureType: React.MutableRefObject<string>;
  isTrackingLost: boolean;
  patientCount: number;
}

export function useGestureEngine({
  isAIReady,
  systemStage,
  viewMode,
  debugMode,
  isStable,
  setIsStable,
  setStabilityScore,
  setGesture,
  setHoveredId,
  setIsClicked,
  setActivePatientIndex,
  setViewState,
  setViewMode,
  setCurrentFps,
  setIsTrackingLost,
  setShowRestored,
  targetPosRef,
  lastIsClicked,
  lastGestureType,
  isTrackingLost,
  patientCount
}: GestureEngineProps) {
  const gestureProcessor = useRef(new GestureProcessor());
  const dwellTimer = useRef<number | null>(null);
  const lastPanPos = useRef<{ x: number; y: number } | null>(null);
  const stabilityBuffer = useRef<boolean[]>([]);
  const STABILITY_WINDOW = 60;

  const isProcessing = useRef(false);
  const lastDetectionTime = useRef(0);
  const detectionInterval = 25; // Boosted from 40ms to 25ms (40 FPS)
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(0);

  const lastLandmarksRef = useRef<any>(null);
  const lastSeenTime = useRef(0);
  const trackingGracePeriod = 300;
  const lastStabilityScore = useRef<number>(0);
  const lastHoveredId = useRef<string | null>(null);

  const smoothedTargetPosRef = useRef({ x: 0, y: 0 });
  const smoothingAlpha = 0.2;
  const prevPinchDistance = useRef<number | null>(null);

  const handleFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    const handLandmarker = getHandLandmarker();

    if (!ctx || !handLandmarker || !isAIReady) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    const now = performance.now();
    if (now - lastDetectionTime.current < detectionInterval || isProcessing.current) return;

    isProcessing.current = true;
    lastDetectionTime.current = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const results = handLandmarker.detectForVideo(video, now);

      frameCount.current++;
      if (now - lastFpsUpdate.current > 1000) {
        setCurrentFps(frameCount.current);
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }

      const hasHand = results.landmarks && results.landmarks.length > 0;
      let effectiveLandmarks = null;
      if (hasHand) {
        effectiveLandmarks = results.landmarks[0];
        lastLandmarksRef.current = effectiveLandmarks;
        lastSeenTime.current = now;
        if (isTrackingLost) {
          setIsTrackingLost(false);
          setShowRestored(true);
          setTimeout(() => setShowRestored(false), 2000);
        }
      } else {
        const timeSinceLastSeen = now - lastSeenTime.current;
        if (timeSinceLastSeen <= trackingGracePeriod && lastLandmarksRef.current) {
          effectiveLandmarks = lastLandmarksRef.current;
        } else if (!isTrackingLost) {
          setIsTrackingLost(true);
        }
      }

      stabilityBuffer.current.push(hasHand);
      if (stabilityBuffer.current.length > STABILITY_WINDOW) stabilityBuffer.current.shift();
      const score = Math.round(
        (stabilityBuffer.current.filter(Boolean).length / STABILITY_WINDOW) * 100
      );
      if (score !== lastStabilityScore.current) {
        setStabilityScore(score);
        lastStabilityScore.current = score;
      }
      const stable = score > 90 && stabilityBuffer.current.length === STABILITY_WINDOW;
      if (stable !== isStable) setIsStable(stable);

      if (effectiveLandmarks) {
        const gestureState = gestureProcessor.current.process(effectiveLandmarks);
        if (
          gestureState.type !== lastGestureType.current ||
          gestureState.isNew ||
          gestureState.isEnding
        ) {
          setGesture(gestureState);
          lastGestureType.current = gestureState.type;
        }

        const screenX = (1 - gestureState.position.x) * window.innerWidth;
        const screenY = gestureState.position.y * window.innerHeight;

        // Update smoothing, then check dead zone for the shared targetPosRef
        const nextX =
          smoothedTargetPosRef.current.x +
          (screenX - smoothedTargetPosRef.current.x) * smoothingAlpha;
        const nextY =
          smoothedTargetPosRef.current.y +
          (screenY - smoothedTargetPosRef.current.y) * smoothingAlpha;

        // DEAD ZONE (2px)
        const dx_move = Math.abs(nextX - targetPosRef.current.x);
        const dy_move = Math.abs(nextY - targetPosRef.current.y);
        if (dx_move >= 2 || dy_move >= 2) {
          smoothedTargetPosRef.current = { x: nextX, y: nextY };
          targetPosRef.current = { x: nextX, y: nextY };
        }

        const smoothX = targetPosRef.current.x;
        const smoothY = targetPosRef.current.y;

        const element = document.elementFromPoint(smoothX, smoothY);
        const interactiveEl = element?.closest('[data-interactive-id]');
        const currentId = interactiveEl?.getAttribute('data-interactive-id') || null;

        if (currentId !== lastHoveredId.current) {
          setHoveredId(currentId);
          lastHoveredId.current = currentId;
        }

        if (gestureState.type === 'pinch') {
          if (!lastIsClicked.current) {
            setIsClicked(true);
            lastIsClicked.current = true;
            if (interactiveEl instanceof HTMLElement) interactiveEl.click();
          }
          if (systemStage === 'dashboard' && viewMode === 'dashboard') {
            if (lastHoveredId.current === 'diagnostic-viewer') {
              const currentPinchDist = gestureState.rawPinchDistance || 0;
              if (prevPinchDistance.current !== null) {
                const distDelta = currentPinchDist - prevPinchDistance.current;

                setViewState(prev => {
                  const nextScaleRaw = Math.max(1, Math.min(5, prev.scale + distDelta * 0.04));
                  const nextScale = prev.scale + (nextScaleRaw - prev.scale) * 0.4;

                  if (Math.abs(nextScale - prev.scale) < 0.001) return prev;

                  const scaleRatio = nextScale / prev.scale;
                  const viewerCenterX = window.innerWidth * 0.62;
                  const viewerCenterY = window.innerHeight * 0.5;

                  const relX = smoothX - viewerCenterX;
                  const relY = smoothY - viewerCenterY;

                  return {
                    scale: nextScale,
                    x: relX - (relX - prev.x) * scaleRatio,
                    y: relY - (relY - prev.y) * scaleRatio
                  };
                });
              }
              prevPinchDistance.current = currentPinchDist;
            } else {
              prevPinchDistance.current = null;
            }
          }
        } else {
          if (lastIsClicked.current) {
            setIsClicked(false);
            lastIsClicked.current = false;
          }
          prevPinchDistance.current = null;
        }

        if (systemStage === 'dashboard') {
          if (gestureState.type === 'point') {
            if (lastPanPos.current) {
              const dx = smoothX - lastPanPos.current.x;
              const dy = smoothY - lastPanPos.current.y;
              setViewState(prev => ({
                ...prev,
                x: prev.x + dx * 0.6, // Increased pan sensitivity slightly
                y: prev.y + dy * 0.6
              }));
            }
            lastPanPos.current = { x: smoothX, y: smoothY };
          } else {
            lastPanPos.current = null;
          }
          if (gestureState.type === 'swipe_left' && gestureState.isNew)
            setActivePatientIndex(prev => (prev + 1) % patientCount);
          if (gestureState.type === 'swipe_right' && gestureState.isNew)
            setActivePatientIndex(prev => (prev - 1 + patientCount) % patientCount);
          if (gestureState.type === 'open_palm' && gestureState.isNew) {
            setViewMode('dashboard');
            setViewState({ scale: 1, x: 0, y: 0 });
          }
        }

        if (systemStage === 'test' || debugMode) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          HAND_CONNECTIONS.forEach(([start, end]) => {
            const sp = effectiveLandmarks[start];
            const ep = effectiveLandmarks[end];
            ctx.beginPath();
            ctx.moveTo((1 - sp.x) * canvas.width, sp.y * canvas.height);
            ctx.lineTo((1 - ep.x) * canvas.width, ep.y * canvas.height);
            ctx.stroke();
          });
          effectiveLandmarks.forEach((lm, i) => {
            const x = (1 - lm.x) * canvas.width;
            const y = lm.y * canvas.height;
            ctx.fillStyle =
              i === 8 ? '#EF4444' : [4, 12, 16, 20].includes(i) ? '#3B82F6' : '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, i === 8 ? 8 : i === 0 ? 6 : 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      } else {
        const timeSinceLastSeen = now - lastSeenTime.current;
        if (timeSinceLastSeen > trackingGracePeriod) {
          setGesture({
            type: 'none',
            confidence: 0,
            position: { x: 0, y: 0 },
            isNew: false,
            isEnding: false
          });
          setHoveredId(null);
          lastPanPos.current = null;
          setIsClicked(false);
          lastIsClicked.current = false;
        }
      }
    } catch (err) {
      console.error('[HandDetection] Error:', err);
    } finally {
      isProcessing.current = false;
    }
  };

  return { handleFrame };
}
