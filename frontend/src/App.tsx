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
  comments: { timestamp: number; user: string; message: string }[]
  exifTimestamp: number
}

function getPassword() {
  const params = new URLSearchParams(window.location.search)
  return params.get('password') || ''
}

function shuffle<T>(arr: T[]) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

function Tracklist({
  value,
  setValue,
}: {
  value: string
  setValue: (arg0: string) => void
}) {
  return (
    <textarea
      id="tracklist"
      placeholder="tracklist"
      onChange={event => setValue(event.target.value)}
      value={value}
      rows={5}
      cols={50}
    />
  )
}

function AdminPanel() {
  const [files, setFiles] = useState<FileList>()
  const [error, setError] = useState<unknown>()
  const [value, setValue] = useState('')
  const [user, setUser] = useState('')
  const [loading, setLoading] = useState('')

  const password = getPassword()
  return (
    <div className="adminpanel">
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
              <Tracklist value={value} setValue={val => setValue(val)} />
            </div>
            <button type="submit">Submit</button>
          </div>
        ) : null}
        {error ? <h1 className="error">{`${error}`}</h1> : null}
        {loading ? <h1 className="loading">{`${loading}`}</h1> : null}
      </form>
    </div>
  )
}

function Comments({ post }: { post: File }) {
  const [showForm, setShowForm] = useState(false)
  const { comments } = post

  return (
    <div className="comments">
      <div>Comments</div>
      {comments.length ? (
        comments.map(comment => (
          <div key={JSON.stringify(comment)} className="comment">
            <div className="comment">
              {comment.user} ({new Date(comment.timestamp).toLocaleDateString()}
              ):
              <br />
              {comment.message}
            </div>
          </div>
        ))
      ) : (
        <div>No comments yet! Add one!</div>
      )}
      <button
        onClick={() => setShowForm(f => !f)}
        style={{ color: 'purple', margin: '1em', background: 'yellow' }}
      >
        {showForm ? 'Hide comment form' : 'Submit a comment'}
      </button>
      {showForm ? <CommentForm post={post} /> : null}
    </div>
  )
}

function CommentForm({ post }: { post: File }) {
  const [value, setValue] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()
  return (
    <div className="commentform">
      <form
        onSubmit={async event => {
          try {
            event.preventDefault()
            if (value || comment) {
              setLoading(true)
              setError(undefined)

              const data = new FormData()
              data.append('message', comment)
              data.append('user', value)
              data.append('filename', post.filename)
              data.append('password', 'purple')
              await myfetchjson(API_ENDPOINT + '/postComment', {
                method: 'POST',
                body: data,
              })
              setValue('')
              setComment('')
            }
          } catch (e) {
            setError(e)
          } finally {
            setLoading(false)
          }
        }}
      >
        {error ? <div className="error">{`${error}`}</div> : null}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="mygrid">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={value}
              onChange={event => setValue(event.target.value)}
            />
            <label htmlFor="post">Post</label>
            <textarea
              id="post"
              value={comment}
              onChange={event => setComment(event.target.value)}
            />
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

function EditIcon({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}>
      <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"
        />
      </svg>
    </button>
  )
}

function EditPost({ post }: { post: File }) {
  const [username, setUsername] = useState(post.user)
  const [message, setMessage] = useState(post.message)
  const [error, setError] = useState<unknown>()
  const [loading, setLoading] = useState(false)
  const password = getPassword()
  return (
    <form
      onSubmit={async event => {
        try {
          event.preventDefault()
          if (username || message) {
            setLoading(true)
            setError(undefined)

            const data = new FormData()
            console.log({ post })
            data.append('message', message)
            data.append('user', username)
            data.append('filename', post.filename)
            data.append('password', password)
            await myfetchjson(API_ENDPOINT + '/editPost', {
              method: 'POST',
              body: data,
            })
          }
        } catch (e) {
          setError(e)
        } finally {
          setLoading(false)
        }
      }}
    >
      <div>
        {error ? <div className="error">{`${error}`}</div> : null}
        {loading ? <div>Submitting update...</div> : null}
        <h1>Edit some stuff</h1>
        <div className="mygrid">
          <label htmlFor="username">Edit DJ name</label>{' '}
          <input
            id="username"
            type="text"
            value={username}
            onChange={event => setUsername(event.target.value)}
          />
          <label htmlFor="tracklist">Edit tracklist</label>{' '}
          <Tracklist value={message} setValue={val => setMessage(val)} />
        </div>
      </div>
    </form>
  )
}

function DisplayPost({ post }: { post: File }) {
  const [showTracklist, setShowTracklist] = useState(true)
  const [showComments, setShowComments] = useState(true)
  const file = BUCKET + '/' + post.filename
  return (
    <div>
      <div className="date">{new Date(post.timestamp).toLocaleString()}</div>
      <div className="dj">DJ {post.user}</div>
      <button onClick={() => setShowTracklist(t => !t)}>
        {showTracklist ? 'Hide tracklist' : 'Show tracklist'}
      </button>
      {showTracklist ? <div className="tracklist">{post.message}</div> : null}
      <br />

      <button onClick={() => setShowComments(t => !t)}>
        {showComments ? 'Hide' : 'Show'} comments
      </button>
      {showComments ? <Comments post={post} /> : null}
      <br />
      <a href={file}>Download</a>
      <br />
      <audio controls className="audiofile">
        <source src={file} />
      </audio>
    </div>
  )
}

function Post({ post }: { post: File }) {
  const [editing, setEditing] = useState(false)
  const password = getPassword()
  return (
    <div className="post">
      {password ? (
        <div style={{ float: 'right' }}>
          <EditIcon onClick={() => setEditing(!editing)} />
        </div>
      ) : null}

      {editing ? <EditPost post={post} /> : <DisplayPost post={post} />}
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
            key={elt}
            src={'gifs/' + elt}
            className="spacer"
            style={{ transform: `scale(${1 + Math.random() * 2})` }}
          />
        ))}
        {shuffle(files).map(elt => (
          <img
            key={elt}
            src={'gifs/' + elt}
            className="spacer"
            style={{ transform: `scale(${1 + Math.random() * 2})` }}
          />
        ))}
        {shuffle(files).map(elt => (
          <img
            key={elt}
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
