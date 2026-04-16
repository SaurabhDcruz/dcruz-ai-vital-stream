import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw, CheckCircle2, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface WebcamFeedProps {
  onStreamReady?: (stream: MediaStream) => void;
  onFrame?: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  className?: string;
  minimal?: boolean;
}

/**
 * WebcamFeed Component (Extended for Real-Time Processing)
 *
 * Performance Considerations for Frame Processing:
 * - Direct Canvas Access: We use a canvas overlay that is perfectly synced to the video element's
 *   displayed dimensions using ResizeObserver.
 * - Efficient Frame Access: The 'onFrame' callback provides direct access to the video and canvas.
 *   Computer vision tasks typically use ctx.drawImage(video, 0, 0) to grab the current frame.
 * - RequestAnimationFrame: The processing loop is tied to the browser's refresh rate, ensuring
 *   smooth 60FPS updates without blocking the UI thread.
 *
 * Why Canvas Overlay?
 * - CV systems need a "drawing layer" to visualize results (bounding boxes, landmarks) without
 *   modifying the source video stream. A canvas allows for high-performance vector and raster
 *   graphics rendering on top of the video.
 */
export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  onStreamReady,
  onFrame,
  className,
  minimal
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle');
  const statusRef = useRef<'idle' | 'loading' | 'active' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [isIframe, setIsIframe] = useState(false);

  // Keep statusRef in sync with status state for use in the processing loop
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // Detect if running inside an iframe
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  const syncDimensions = () => {
    if (videoRef.current && canvasRef.current) {
      const { clientWidth, clientHeight } = videoRef.current;
      canvasRef.current.width = clientWidth;
      canvasRef.current.height = clientHeight;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  const startWebcam = async () => {
    // Stop any existing stream first
    stopStream();

    setStatus('loading');
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported in this browser or context.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStatus('active');
        onStreamReady?.(stream);
      }
    } catch (err: any) {
      console.error('Webcam initialization failed:', err);
      setStatus('error');

      const errorName = err.name || err.constructor.name;

      if (
        errorName === 'NotAllowedError' ||
        errorName === 'PermissionDeniedError' ||
        err.message?.includes('denied')
      ) {
        let msg = 'Camera access was denied.';
        if (isIframe) {
          msg =
            'Camera access is blocked by the preview environment. This is a common security restriction for embedded apps.';
        }
        setError(msg);
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setError('No camera hardware was detected. Please ensure your webcam is connected.');
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setError('The camera is already in use by another application or tab.');
      } else if (errorName === 'SecurityError') {
        setError(
          'Security restriction: The browser blocked camera access for this embedded frame.'
        );
      } else {
        setError(err.message || 'A hardware error occurred while accessing the camera.');
      }
    }
  };

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number | null = null;

    const loop = () => {
      if (videoRef.current && canvasRef.current && statusRef.current === 'active') {
        if (canvasRef.current.width !== videoRef.current.clientWidth) {
          syncDimensions();
        }

        // Execute frame processing callback
        onFrame?.(videoRef.current, canvasRef.current);

        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFps(Math.round((frameCount * 1000) / (now - lastTime)));
          frameCount = 0;
          lastTime = now;
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    if (status === 'active') {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [status, onFrame]);

  useEffect(() => {
    // Only auto-start if NOT in an iframe, otherwise wait for user interaction
    // to increase success rate of permission prompt
    if (!isIframe) {
      startWebcam();
    }

    const observer = new ResizeObserver(() => syncDimensions());
    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      stopStream();
      observer.disconnect();
    };
  }, [isIframe]);

  const content = (
    <div
      ref={containerRef}
      className={`relative bg-zinc-950 aspect-video flex items-center justify-center overflow-hidden ${minimal ? 'w-full h-full' : ''}`}
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20 bg-zinc-950/90 backdrop-blur-md p-4 text-center"
          >
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30 mb-1">
              <Camera className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Camera Required</h4>
              <p className="text-[10px] text-zinc-400 max-w-[180px] mx-auto">
                Gesture control requires webcam access to track hand movements.
              </p>
            </div>
            <Button
              onClick={startWebcam}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-6 shadow-lg shadow-blue-500/20"
            >
              Enable Camera
            </Button>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-zinc-950/50 backdrop-blur-sm"
          >
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              Requesting Access...
            </p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 bg-zinc-950/90 backdrop-blur-md"
          >
            <div
              className={`${minimal ? 'p-4' : 'p-8'} bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full`}
            >
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CameraOff className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Access Blocked</h3>
              <p className="text-[11px] text-zinc-500 mb-4 leading-tight">{error}</p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={startWebcam}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Try Again
                </Button>

                {isIframe && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full border-zinc-200 text-zinc-600 font-bold rounded-xl"
                  >
                    <Maximize2 className="w-3.5 h-3.5 mr-2" />
                    Open in New Tab
                  </Button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider mb-2">
                  Troubleshooting
                </p>
                <ul className="text-[9px] text-zinc-500 text-left space-y-1 list-disc pl-3">
                  <li>Check if another app is using the camera</li>
                  <li>Click the camera icon in the address bar</li>
                  <li>Ensure site permissions aren't blocked</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-700 scale-x-[-1] ${status === 'active' ? 'opacity-100' : 'opacity-0'}`}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Overlay Grid for Hospital UI feel */}
      {status === 'active' && (
        <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent z-15">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500/50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500/50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500/50" />
        </div>
      )}
    </div>
  );

  if (minimal) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card
      className={`overflow-hidden border-zinc-200 shadow-xl bg-white/50 backdrop-blur-sm ${className}`}
    >
      <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-zinc-800">
              <Camera className="w-5 h-5 text-blue-600" />
              VitalStream Feed
            </CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-500">
              Real-time optical monitoring & processing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {status === 'active' && (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Live: {fps} FPS
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">{content}</CardContent>
    </Card>
  );
};
