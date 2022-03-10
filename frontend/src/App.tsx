import { useEffect, useState, useRef } from 'react'
import './App.css'

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [update, setUpdate] = useState(0)
  const refR = useRef(20)
  const refG = useRef(20)
  const refB = useRef(20)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) {
      return
    }
    const width = window.innerWidth
    const height = window.innerHeight
    const dpi = window.devicePixelRatio
    canvas.width = width * dpi
    canvas.height = height * dpi
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    let counter = 0
    let currframe: ReturnType<typeof requestAnimationFrame>

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    function loop(ctx: CanvasRenderingContext2D, counter: number) {
      for (let i = 0; i < 50; i++) {
        const l = Math.floor(Math.random() * 100)
        ctx.strokeStyle = `rgb(${l + Math.random() * refR.current},${
          l + Math.random() * refG.current
        },${l + Math.random() * refB.current})`
        ctx.beginPath()
        const flipper = i % 2 === 1 ? 1 : -1
        const x = Math.random() * width - width / 2
        const y = Math.random() * height + (height / 2) * flipper
        ctx.moveTo(x, y)
        ctx.lineTo(x + width, y - height * flipper)
        ctx.stroke()
      }
      currframe = requestAnimationFrame(() => loop(ctx, counter + 1))
    }
    loop(ctx, counter)

    function measure() {
      setUpdate(update => update + 1)
    }

    window.addEventListener('resize', measure)
    return () => {
      window.cancelAnimationFrame(currframe)
      window.removeEventListener('resize', measure)
    }
  }, [update])
  return (
    <div>
      <canvas ref={ref} className="global" />
      <div className="contents">
        <input
          type="range"
          min={1}
          max={100}
          onChange={event => (refR.current = +event.target.value)}
        />
        <input
          type="range"
          min={1}
          max={100}
          onChange={event => (refG.current = +event.target.value)}
        />
        <input
          type="range"
          min={1}
          max={100}
          onChange={event => (refB.current = +event.target.value)}
        />

        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
        <h1>RADIO PRISM</h1>
      </div>
    </div>
  )
}

export default App
