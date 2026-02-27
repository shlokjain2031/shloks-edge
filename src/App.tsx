import { ReactNode, useEffect, useRef, useState } from 'react'

type WorkItem = {
  title: string
  period: string
  description: string
  href?: string
  tech?: string[]
}

type ProjectItem = {
  name: string
  period: string
  description: string
  href: string
  tech: string[]
  highlights?: string[]
}

type BlogItem = {
  title: ReactNode
  date: string
  description: string
  href: string
  id: string
}

const emailAddress = 'jainshlok20@gmail.com'

const work: WorkItem[] = [
  {
    title: 'Open-Source Contributor @ HPX (Parallel C++ Runtime)',
    period: 'Jul 2025 — Present',
    description:
      'Contributing to sender/receiver infrastructure in HPX and improving scheduling correctness for async runtimes.',
    tech: ['C++', 'CMake', 'Git'],
    href: 'https://tinyurl.com/bdz6urp6',
  },
  {
    title: 'Competitive Programmer, Coding Club',
    period: 'Feb 2025 — Present',
    description:
      'Codeforces peak 1554 | AtCoder peak 1104',
    href: 'https://codeforces.com/profile/dungeon_master_3120',
  },
  {
    title: 'Teaching Assistant, Computer Programming',
    period: 'Jan 2026 — Present',
    description:
      'Conducting labs, mentoring students, and supporting assessments for 600+ students.',
  },
]

const projects: ProjectItem[] = [
  {
    name: 'Pollu',
    period: 'Dec 2025 — Jan 2026',
    href: 'https://pollu-two.vercel.app',
    description:
      'Built and trained a boosting model for hourly AQI estimation at 30m resolution and deployed it behind a distributed Go backend as a public API.  <200ms p95 latency.',
    tech: ['Go', 'Python', 'JS', 'Redis', 'DuckDB'],
  },
  {
    name: 'Email Tracker Extension',
    period: 'Feb 2026',
    href: 'https://github.com/shlokjain2031/email-tracker-extension/',
    description:
      'Built a self-hosted email tracking system over the weekend to analyze open rates and engagement for cold outreach campaigns.',
    tech: ['TypeScript', 'Node.js', 'Next.js'],
  },
  {
    name: 'Kaze',
    period: 'May 2021 — Jun 2021',
    href: 'https://github.com/shlokjain2031/kaze',
    description:
      'Developed a productivity-focused android launcher in Flutter; 2k+ organic downloads',
    tech: ['Flutter', 'Firebase', 'SQL'],
  },
]

const blogs: BlogItem[] = [
  {
    title: 'How I solved inaccurate open counts in email tracking',
    date: 'Feb 2026',
    description:
      'Twitter thread on how I distinguished real opens from false positives',
    href: 'https://x.com/BlokeJain/status/2026969942181200225?s=20',
    id: 'open-counts',
  },
  {
    title: <p>Estimating PM<sub>2.5</sub> at a 30m resolution using LightGBM</p>,
    date: 'Jan 2026',
    description:
      'Technical document on how I built the LightGBM model to estimate AQI at 30m resolution',
    href: 'https://gist.github.com/shlokjain2031/f37a5af9108d0ffd40f6e3d0e25c4b27',
    id: 'aqi-lightgbm',
  },
  {
    title: 'Reasons behind trophy counts mismatched between users in Clash Royale',
    date: 'Oct 2025',
    description:
      'Dug down the rabbit hole on how Clash Royale updates trophy count data after a match',
    href: 'https://x.com/BlokeJain/status/1981744719727096265?s=20',
    id: 'clash-trophies',
  },
  {
    title: 'AirBnB’s internal key-value store, Mussel',
    date: 'Oct 2025',
    description:
      'Tried to figure out how AirBnb evolved their tech over time as their needs changed and how each phase worked',
    href: 'https://x.com/BlokeJain/status/1978187097363173835?s=20',
    id: 'airbnb-mussel',
  }
]

function App() {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopyEmail = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress)
      }
      setCopied(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1400)
    } catch (error) {
      console.error(error)
      setCopied(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1400)
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>Hi, I&apos;m Shlok.</h1>
        <p> I enjoy building interesting products and scalable systems</p>
        <p> My tech stack is whatever best solves the problem </p>
        <p>
          I&apos;m an undergraduate at BITS Pilani, majoring in Econ + CS
        </p>
        <div className="links" aria-label="Social links">
          <a href="https://github.com/shlokjain2031" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/shlok-jain-4a1650172/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://x.com/blokejain/">Twitter</a>
          <span className="email-link-wrapper">
            <a href={`mailto:${emailAddress}`} className="email-link">
              Email
            </a>
            <div className="email-tooltip" role="status" aria-live="polite">
              <span className="email-address">{emailAddress}</span>
              <button
                type="button"
                className="copy-icon"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
              >
                <svg viewBox="0 0 20 20" role="img" aria-hidden="true">
                  <rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M8 4h6a2 2 0 0 1 2 2v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <span className={`copy-status ${copied ? 'visible' : ''}`}>{copied ? 'Copied!' : ''}</span>
            </div>
          </span>
        </div>
      </section>

      <section>
        <h2>Projects</h2>
        <div className="list">
          {projects.map((project) => (
            <a
              key={project.name}
              className="card project-card"
              href={project.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open project ${project.name}`}
            >
              <h3>{project.name}</h3>
              <p className="muted">{project.period}</p>
              <p>{project.description}</p>
              <div className="tags" aria-label={`${project.name} tech stack`}>
                {project.tech.map((tech) => (
                  <span key={tech} className="tag">
                    {tech}
                  </span>
                ))}
              </div>
              {project.highlights && (
                <ul>
                  {project.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2>Work</h2>
        <div className="list">
          {work.map((item) => {
            const content = (
              <>
                <h3>{item.title}</h3>
                <p className="muted">{item.period}</p>
                <p>{item.description}</p>
                {item.tech && (
                  <div className="tags" aria-label={`${item.title} tech stack`}>
                    {item.tech.map((tech) => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )

            if (item.href) {
              return (
                <a
                  key={item.title}
                  className="card work-card"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open work item ${item.title}`}
                >
                  {content}
                </a>
              )
            }

            return (
              <article key={item.title} className="card work-card">
                {content}
              </article>
            )
          })}
        </div>
      </section>

      <section id="blog">
        <h2>Blog</h2>
        <div className="list">
          {blogs.map((blog) => (
            <a
              key={blog.id}
              className="card blog-card"
              href={blog.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Read blog ${blog.title}`}
            >
              <h3>{blog.title}</h3>
              <p className="muted">{blog.date}</p>
              <p>{blog.description}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
