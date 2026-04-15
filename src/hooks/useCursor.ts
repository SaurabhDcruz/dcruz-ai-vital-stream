import { useRef, useEffect } from 'react';

export function useCursor(lerpFactor: number, debugMode: boolean) {
    const cursorRef = useRef<HTMLDivElement>(null);
    const rawCursorRef = useRef<HTMLDivElement>(null);
    const targetPosRef = useRef({ x: 0, y: 0 });
    const currentPosRef = useRef({ x: 0, y: 0 });
    const lastIsClicked = useRef(false);
    const lastGestureType = useRef('none');

    useEffect(() => {
        let animationFrameId: number;
        const updateLoop = () => {
            currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * lerpFactor;
            currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * lerpFactor;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${currentPosRef.current.x - 16}px, ${currentPosRef.current.y - 16}px, 0)`;
                const isClickedNow = lastIsClicked.current;
                const gestureTypeNow = lastGestureType.current;
                cursorRef.current.style.backgroundColor = isClickedNow ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.1)';
                cursorRef.current.style.scale = isClickedNow ? '0.7' : (gestureTypeNow !== 'none' ? '1.5' : '1');
                cursorRef.current.style.borderColor = gestureTypeNow === 'none' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 1)';
            }

            if (rawCursorRef.current && debugMode) {
                rawCursorRef.current.style.transform = `translate3d(${targetPosRef.current.x - 4}px, ${targetPosRef.current.y - 4}px, 0)`;
            }

            animationFrameId = requestAnimationFrame(updateLoop);
        };

        animationFrameId = requestAnimationFrame(updateLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [lerpFactor, debugMode]);

    return { cursorRef, rawCursorRef, targetPosRef, lastIsClicked, lastGestureType };
}
