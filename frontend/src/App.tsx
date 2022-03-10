import { useEffect, useState, useRef } from 'react'
import { myfetchjson, myfetch } from './util'
import './App.css'
import files from './files.json'

const API_ENDPOINT = 'https://azn63btds4.execute-api.us-east-2.amazonaws.com'
const BUCKET =
  'https://radioshow-s3uploadbucket-hkjnp01vb17m.s3.us-east-2.amazonaws.com'

interface File {
  timestamp: number
  filename: string
  user: string
  message: string
  date: string
  contentType: string
  comments: unknown[]
  exifTimestamp: number
}

function shuffle<T>(arr: T[]) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

function AdminPanel() {
  const [files, setFiles] = useState<FileList>()
  const [error, setError] = useState<unknown>()
  const [value, setValue] = useState('')
  const [user, setUser] = useState('')
  const [loading, setLoading] = useState('')
  const params = new URLSearchParams(window.location.search)

  const password = params.get('password')
  return (
    <form
      onSubmit={async event => {
        event.preventDefault()
        try {
          setError(undefined)
          const data = new FormData()
          const file = files?.[0]
          if (!file) {
            throw new Error('No files submitted')
          }
          data.append('message', value)
          data.append('user', user)
          data.append('filename', file.name)
          data.append('contentType', file.type)
          data.append('password', password || '')

          setLoading('Uploading metadata....')
          const res = await myfetchjson(API_ENDPOINT + '/postFile', {
            method: 'POST',
            body: data,
          })
          setLoading('Uploading mp3...')

          await myfetch(res.uploadURL, {
            method: 'PUT',
            body: file,
          })
        } catch (e) {
          console.error(e)
          setError(e)
        } finally {
          setLoading('')
        }
      }}
    >
      {password ? (
        <div className="form">
          <div className="mygrid">
            <label htmlFor="upload">Upload ur showz </label>
            <input
              type="file"
              id="upload"
              onChange={e => {
                const files = e.target.files
                if (files && files.length) {
                  setFiles(files)
                }
              }}
            />
            <label htmlFor={'username'}>DJ</label>
            <input
              id="username"
              type="text"
              value={user}
              onChange={event => setUser(event.target.value)}
            />
            <label htmlFor="tracklist">Tracklist</label>
            <textarea
              id="tracklist"
              placeholder="tracklist"
              onChange={event => setValue(event.target.value)}
              value={value}
              rows={5}
              cols={50}
            />
          </div>
          <button type="submit">Submit</button>
        </div>
      ) : null}
      {error ? <h1 className="error">{`${error}`}</h1> : null}
      {loading ? <h1 className="loading">{`${loading}`}</h1> : null}
    </form>
  )
}

function Post({ post }: { post: File }) {
  const [tracklist, setTracklist] = useState(false)
  const file = BUCKET + '/' + post.filename
  return (
    <div className="post">
      <div className="date">{new Date(post.timestamp).toLocaleString()}</div>
      <div className="dj">DJ {post.user}</div>
      <a href="#" onClick={() => setTracklist(t => !t)}>
        {tracklist ? 'Hide' : 'Show'} tracklist
      </a>
      {tracklist ? <div className="tracklist">{post.message}</div> : null}
      <br />
      <a href={file}>Download</a>
      <br />
      <audio controls className="audiofile">
        <source src={file} />
      </audio>
    </div>
  )
}

function Posts({ posts }: { posts: File[] }) {
  return (
    <div className="container">
      <h1>{posts.length ? 'Posts:' : 'No files found'}</h1>
      {posts.map(post => (
        <Post key={post.filename} post={post} />
      ))}
    </div>
  )
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [update, setUpdate] = useState(0)
  const refR = useRef(20)
  const refG = useRef(20)
  const refB = useRef(20)
  const [posts, setPosts] = useState<File[]>()
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    ;(async () => {
      try {
        const result = await myfetchjson(API_ENDPOINT + '/getFiles')
        setPosts(result.Items)
      } catch (e) {
        setError(e)
      }
    })()
  }, [])

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
        const r = l + Math.random() * refR.current
        const g = l + Math.random() * refG.current
        const b = l + Math.random() * refB.current
        ctx.strokeStyle = `rgb(${r},${g},${b})`
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
    <div className="App">
      <canvas ref={ref} className="global" />
      <div className="contents">
        <h1>rdio rkiv</h1>
        <div style={{ position: 'sticky', top: 20 }}>
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
        </div>
        <AdminPanel />
        {error ? (
          <h1>{`${error}`}</h1>
        ) : posts ? (
          <Posts posts={posts} />
        ) : (
          <h1>Loading...</h1>
        )}
        {shuffle(files).map(elt => (
          <img
            src={'gifs/' + elt}
            className="spacer"
            style={{ transform: `scale(${1 + Math.random() * 2})` }}
          />
        ))}
        {shuffle(files).map(elt => (
          <img
            src={'gifs/' + elt}
            className="spacer"
            style={{ transform: `scale(${1 + Math.random() * 2})` }}
          />
        ))}
        {shuffle(files).map(elt => (
          <img
            src={'gifs/' + elt}
            className="spacer"
            style={{ transform: `scale(${1 + Math.random() * 2})` }}
          />
        ))}
      </div>
    </div>
  )
}

export default App
