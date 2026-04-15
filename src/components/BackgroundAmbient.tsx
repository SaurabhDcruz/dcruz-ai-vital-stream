import { useEffect, useRef } from 'react'

interface Orb {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number
    targetOpacity: number
    opacitySpeed: number
    color: string
    blur: number
}

const COLORS = [
    'rgba(59,130,246,',   // blue
    'rgba(139,92,246,',   // violet
    'rgba(6,182,212,',    // cyan
]

function createOrb(w: number, h: number): Orb {
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,   // 🔥 slow = premium
        vy: (Math.random() - 0.5) * 0.08,
        radius: 120 + Math.random() * 200,
        opacity: 0,
        targetOpacity: 0.15 + Math.random() * 0.2,
        opacitySpeed: 0.0015 + Math.random() * 0.002,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        blur: 40 + Math.random() * 60, // 🔥 depth
    }
}

const BackgroundAmbient = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        let orbs: Orb[] = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            orbs = Array.from({ length: 18 }, () =>
                createOrb(canvas.width, canvas.height)
            )
        }

        resize()
        window.addEventListener('resize', resize)

        const draw = () => {
            const { width, height } = canvas

            ctx.clearRect(0, 0, width, height)

            // 🔥 center glow (premium focus)
            const centerGrad = ctx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                width / 1.2
            )

            centerGrad.addColorStop(0, 'rgba(59,130,246,0.08)')
            centerGrad.addColorStop(1, 'transparent')

            ctx.fillStyle = centerGrad
            ctx.fillRect(0, 0, width, height)

            for (const orb of orbs) {
                // opacity animation
                if (orb.opacity < orb.targetOpacity) {
                    orb.opacity += orb.opacitySpeed
                } else {
                    orb.targetOpacity = 0.1 + Math.random() * 0.2
                }

                // movement
                orb.x += orb.vx
                orb.y += orb.vy

                // wrap
                if (orb.x < -orb.radius) orb.x = width + orb.radius
                if (orb.x > width + orb.radius) orb.x = -orb.radius
                if (orb.y < -orb.radius) orb.y = height + orb.radius
                if (orb.y > height + orb.radius) orb.y = -orb.radius

                // 🔥 blur depth
                ctx.filter = `blur(${orb.blur}px)`

                const grad = ctx.createRadialGradient(
                    orb.x,
                    orb.y,
                    0,
                    orb.x,
                    orb.y,
                    orb.radius
                )

                grad.addColorStop(0, `${orb.color}${orb.opacity})`)
                grad.addColorStop(0.6, `${orb.color}${orb.opacity * 0.4})`)
                grad.addColorStop(1, `${orb.color}0)`)

                ctx.beginPath()
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
                ctx.fillStyle = grad
                ctx.fill()
            }

            ctx.filter = 'none' // reset

            animationId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none -z-10"
            />

            {/* 🔥 subtle noise layer (premium touch) */}
            <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.035] bg-[url('data:image/svg+xml,%3Csvg viewBox=0 0 200 200 xmlns=http://www.w3.org/2000/svg%3E%3Cfilter id=noiseFilter%3E%3CfeTurbulence type=fractalNoise baseFrequency=0.65 numOctaves=3 stitchTiles=stitch/%3E%3C/filter%3E%3Crect width=100%25 height=100%25 filter=url(%23noiseFilter)/%3E%3C/svg%3E')]" />
        </>
    )
}

export default BackgroundAmbient