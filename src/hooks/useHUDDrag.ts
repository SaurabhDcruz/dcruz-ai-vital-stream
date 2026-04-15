import { useRef, useEffect } from 'react';

export function useHUDDrag() {
    const hudRef = useRef<HTMLDivElement>(null);
    const isDraggingHUD = useRef(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const hudPositionRef = useRef<{ x: number, y: number } | null>(null);

    const handleHUDMouseDown = (e: React.MouseEvent) => {
        if (!hudRef.current) return;
        isDraggingHUD.current = true;
        const rect = hudRef.current.getBoundingClientRect();
        dragStartOffset.current = {
            x: e.clientX - (hudPositionRef.current?.x || rect.left),
            y: e.clientY - (hudPositionRef.current?.y || rect.top)
        };
        e.preventDefault();
    };

    useEffect(() => {
        let dragFrame: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingHUD.current && hudRef.current) {
                cancelAnimationFrame(dragFrame);
                dragFrame = requestAnimationFrame(() => {
                    const x = e.clientX - dragStartOffset.current.x;
                    const y = e.clientY - dragStartOffset.current.y;
                    if (hudRef.current) {
                        hudRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                        hudRef.current.style.left = '0';
                        hudRef.current.style.top = '0';
                        hudRef.current.style.right = 'auto';
                    }
                    hudPositionRef.current = { x, y };
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
