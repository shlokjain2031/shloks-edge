import { useEffect, useRef } from 'react'

interface Blob {
  x: number
  y: number
  radius: number
  alpha: number
  life: number
  maxLife: number
}

type InkBlob = Blob & {
  baseRadius: number
  phase: number
  frequency: number
  jitterX: number
  jitterY: number
}

const MAX_BLOBS = 200
const BASE_SMOOTHING = 0.15
const MIN_RADIUS = 3.5
const MAX_RADIUS = 8.5
const MIN_LIFE = 280
const MAX_LIFE = 620
const MIN_SPACING = 1.5
const MAX_SPACING = 9
const EXPONENTIAL_TAPER = 3.2

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export default function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.max(1, window.devicePixelRatio || 1)

    const target = { x: width * 0.5, y: height * 0.5 }
    const smooth = { x: target.x, y: target.y }
    const previousSmooth = { x: smooth.x, y: smooth.y }
    const lastSpawn = { x: smooth.x, y: smooth.y }

    const blobs: InkBlob[] = []
    let rafId = 0
    let lastTime = performance.now()
    let elapsed = 0
    let shouldSpawn = false
    let pointerInside = false
    let travelCarry = 0

    const setCanvasSize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.max(1, window.devicePixelRatio || 1)

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawnBlob = (x: number, y: number, speed: number, isHead = false) => {
      const speedFactor = clamp(speed * 12, 0, 1)
      const radiusRandom = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * speedFactor
      const baseRadius = radiusRandom * (1 + (Math.random() * 0.3 - 0.15)) * (isHead ? 1.4 : 1)
      const maxLifeBase = MIN_LIFE + Math.random() * (MAX_LIFE - MIN_LIFE)
      const maxLife = isHead ? maxLifeBase * 0.72 : maxLifeBase

      blobs.push({
        x,
        y,
        radius: baseRadius,
        alpha: 1,
        life: maxLife,
        maxLife,
        baseRadius,
        phase: Math.random() * Math.PI * 2,
        frequency: 0.008 + Math.random() * 0.008,
        jitterX: (Math.random() * 2 - 1) * 1.2,
        jitterY: (Math.random() * 2 - 1) * 1.2,
      })

      if (blobs.length > MAX_BLOBS) {
        blobs.splice(0, blobs.length - MAX_BLOBS)
      }
    }

    const update = (delta: number) => {
      elapsed += delta

      smooth.x += (target.x - smooth.x) * BASE_SMOOTHING
      smooth.y += (target.y - smooth.y) * BASE_SMOOTHING

      const dx = smooth.x - previousSmooth.x
      const dy = smooth.y - previousSmooth.y
      const distance = Math.hypot(dx, dy)
      const speed = distance / Math.max(delta, 0.001)
      const spacing = clamp(MAX_SPACING - speed * 20, MIN_SPACING, MAX_SPACING)

      if (pointerInside && shouldSpawn && distance > 0.05) {
        travelCarry += distance

        while (travelCarry >= spacing) {
          const segmentDx = smooth.x - lastSpawn.x
          const segmentDy = smooth.y - lastSpawn.y
          const segmentDistance = Math.hypot(segmentDx, segmentDy)

          if (segmentDistance < 0.001) {
            break
          }

          const ratio = spacing / segmentDistance
          lastSpawn.x += segmentDx * ratio
          lastSpawn.y += segmentDy * ratio
          spawnBlob(lastSpawn.x, lastSpawn.y, speed)
          travelCarry -= spacing
        }

        spawnBlob(smooth.x, smooth.y, speed, true)
      }

      previousSmooth.x = smooth.x
      previousSmooth.y = smooth.y

      let writeIndex = 0
      for (let i = 0; i < blobs.length; i += 1) {
        const blob = blobs[i]
        blob.life -= delta
        if (blob.life > 0) {
          const ageProgress = 1 - blob.life / blob.maxLife
          const taper = Math.exp(-EXPONENTIAL_TAPER * ageProgress)
          const pulse = 1 + 0.03 * Math.sin(elapsed * blob.frequency + blob.phase)
          blob.alpha = (blob.life / blob.maxLife) ** 2
          blob.radius = blob.baseRadius * taper * pulse

          if (blob.radius < 0.35 || blob.alpha < 0.015) {
            continue
          }

          blobs[writeIndex] = blob
          writeIndex += 1
        }
      }
      blobs.length = writeIndex
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'

      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < blobs.length; i += 1) {
        const blob = blobs[i]
        const drawX = blob.x + blob.jitterX
        const drawY = blob.y + blob.jitterY
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, blob.radius)
        gradient.addColorStop(0, `rgba(0, 0, 0, ${blob.alpha * 0.72})`)
        gradient.addColorStop(0.55, `rgba(0, 0, 0, ${blob.alpha * 0.36})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(drawX, drawY, blob.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    const animate = (time: number) => {
      const delta = time - lastTime
      lastTime = time
      update(delta)
      render()
      rafId = window.requestAnimationFrame(animate)
    }

    const onMouseMove = (event: MouseEvent) => {
      target.x = event.clientX
      target.y = event.clientY

      if (!pointerInside) {
        smooth.x = event.clientX
        smooth.y = event.clientY
        previousSmooth.x = event.clientX
        previousSmooth.y = event.clientY
        lastSpawn.x = event.clientX
        lastSpawn.y = event.clientY
      }

      pointerInside = true
      shouldSpawn = true
    }

    const onMouseLeaveWindow = () => {
      pointerInside = false
      shouldSpawn = false
      travelCarry = 0
    }

    const onWindowMouseOut = (event: MouseEvent) => {
      const related = event.relatedTarget as Node | null
      if (!related) {
        onMouseLeaveWindow()
      }
    }

    const onResize = () => {
      setCanvasSize()
      render()
    }

    setCanvasSize()
    rafId = window.requestAnimationFrame(animate)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseout', onWindowMouseOut)
    window.addEventListener('blur', onMouseLeaveWindow)
    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseout', onWindowMouseOut)
      window.removeEventListener('blur', onMouseLeaveWindow)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  )
}
