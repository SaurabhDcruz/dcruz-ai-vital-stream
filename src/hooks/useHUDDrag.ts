import { useRef, useEffect } from 'react';

export function useHUDDrag() {
    const hudRef = useRef<HTMLDivElement>(null);
    const isDraggingHUD = useRef(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const hudPositionRef = useRef<{ x: number, y: number } | null>(null);

    const handleHUDMouseDown = (e: React.MouseEvent) => {
        if (!hudRef.current) return;
        isDraggingHUD.current = true;
        dragStartOffset.current = {
            x: e.clientX - (hudPositionRef.current?.x || 0),
            y: e.clientY - (hudPositionRef.current?.y || 0)
        };
        e.preventDefault();
    };

    useEffect(() => {
        let dragFrame: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingHUD.current && hudRef.current) {
                cancelAnimationFrame(dragFrame);
                dragFrame = requestAnimationFrame(() => {
                    const dx = e.clientX - dragStartOffset.current.x;
                    const dy = e.clientY - dragStartOffset.current.y;

                    if (hudRef.current) {
                        hudRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
                    }
                    hudPositionRef.current = { x: dx, y: dy };
                });
            }
        };

        const handleMouseUp = () => {
            isDraggingHUD.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(dragFrame);
        };
    }, []);

    return { hudRef, handleHUDMouseDown, hudPositionRef };
}
