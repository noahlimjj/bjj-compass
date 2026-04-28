import { useState, useEffect, useRef } from 'react'
import './App.css'

const TECHNIQUES = [
  '2-on-1',
  'K-guard',
  'Bolo Sweeps',
  'Lasso Omoplatas',
  'Cross Grip',
  'Knee Cut'
]

const MOTIVATIONAL_QUOTES = [
  { text: "The fight is won or lost far away from witnesses, behind the lines, in the gym, and out there on the road, long before I dance under those lights.", author: "Muhammad Ali" },
  { text: "I don't quit. I don't fold. I don't back down.", author: "Gordon Ryan" },
  { text: "Jiu-Jitsu is about submitting your ego, not your opponent.", author: "Rickson Gracie" },
  { text: "Position before submission. Control before finishing.", author: "BJJ Wisdom" },
  { text: "The more you sweat in training, the less you bleed in combat.", author: "Military Proverb" },
  { text: "Drill the movements until your body knows what your mind forgets.", author: "Coach's Corner" },
  { text: "Roll with intensity. Live with honor. Train with purpose.", author: "BJJ Way" },
  { text: "Tap early, tap often. Come back tomorrow.", author: "Every BJJ Player Ever" },
]

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function App() {
  const [view, setView] = useState('dashboard')
  const [sessions, setSessions] = useState([])
  const [showLogForm, setShowLogForm] = useState(false)
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
  const [breathPhase, setBreathPhase] = useState('inhale')
  const [breathScale, setBreathScale] = useState(1)
  const [breathActive, setBreathActive] = useState(false)
  const breathRef = useRef(null)

  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('bjj-compass-checklist')
    return saved ? JSON.parse(saved) : { hydrated: false, breathing: false, technique: false, bodyScan: false }
  })

  const [milestones, setMilestones] = useState(() => {
    const saved = localStorage.getItem('bjj-compass-streak-milestones')
    return saved ? JSON.parse(saved) : { 7: false, 30: false, 100: false }
  })

  const [formData, setFormData] = useState({
    date: getToday(),
    duration: 60,
    type: 'gi',
    intensity: 3,
    techniques: [],
    notes: ''
  })

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bjj-compass-sessions')
    if (saved) setSessions(JSON.parse(saved))
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('bjj-compass-sessions', JSON.stringify(sessions))
  }, [sessions])

  // Save checklist to localStorage and reset when leaving tab
  useEffect(() => {
    localStorage.setItem('bjj-compass-checklist', JSON.stringify(checklist))
  }, [checklist])

  useEffect(() => {
    if (view !== 'checklist') {
      const defaultState = { hydrated: false, breathing: false, technique: false, bodyScan: false }
      setChecklist(defaultState)
      localStorage.setItem('bjj-compass-checklist', JSON.stringify(defaultState))
    }
  }, [view])

  // Breathing animation
  useEffect(() => {
    if (view !== 'breathe') return

    const inhaleTime = 4000
    const holdTime = 4000
    const exhaleTime = 4000
    const holdOutTime = 2000

    const phases = [
      { phase: 'inhale', duration: inhaleTime, scale: 1.3 },
      { phase: 'hold', duration: holdTime, scale: 1.3 },
      { phase: 'exhale', duration: exhaleTime, scale: 1.0 },
      { phase: 'holdout', duration: holdOutTime, scale: 1.0 },
    ]

    let currentIndex = 0
    let startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const current = phases[currentIndex]

      if (elapsed >= current.duration) {
        currentIndex = (currentIndex + 1) % phases.length
        startTime = Date.now()
      }

      const currentPhase = phases[currentIndex]
      const progress = (Date.now() - startTime) / currentPhase.duration

      setBreathPhase(currentPhase.phase)

      if (currentPhase.phase === 'inhale') {
        setBreathScale(1 + 0.3 * progress)
      } else if (currentPhase.phase === 'hold') {
        setBreathScale(1.3)
      } else if (currentPhase.phase === 'exhale') {
        setBreathScale(1.3 - 0.3 * progress)
      } else {
        setBreathScale(1)
      }

      breathRef.current = requestAnimationFrame(animate)
    }

    if (breathActive) {
      breathRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (breathRef.current) cancelAnimationFrame(breathRef.current)
    }
  }, [view, breathActive])

  // Calculate stats
  const currentMonth = new Date().toISOString().slice(0, 7)
  const thisMonthSessions = sessions.filter(s => s.date.startsWith(currentMonth))
  const totalMinutesThisMonth = thisMonthSessions.reduce((sum, s) => sum + s.duration, 0)
  const avgIntensity = thisMonthSessions.length > 0
    ? (thisMonthSessions.reduce((sum, s) => sum + s.intensity, 0) / thisMonthSessions.length).toFixed(1)
    : 0

  const calculateStreak = () => {
    if (sessions.length === 0) return 0
    const sortedDates = [...new Set(sessions.map(s => s.date))].sort().reverse()
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const dateStr of sortedDates) {
      const sessionDate = new Date(dateStr)
      sessionDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24))
      if (diffDays <= 1) {
        streak++
        currentDate = sessionDate
      } else {
        break
      }
    }
    return streak
  }

  const streak = calculateStreak()

  useEffect(() => {
    let changed = false;
    const newMilestones = { ...milestones };
    if (streak >= 7 && !newMilestones[7]) { newMilestones[7] = true; changed = true; }
    if (streak >= 30 && !newMilestones[30]) { newMilestones[30] = true; changed = true; }
    if (streak >= 100 && !newMilestones[100]) { newMilestones[100] = true; changed = true; }
    if (changed) {
      setMilestones(newMilestones);
      localStorage.setItem('bjj-compass-streak-milestones', JSON.stringify(newMilestones));
    }
  }, [streak, milestones])

  const getFavorites = () => {
    const counts = {}
    sessions.forEach(s => {
      s.techniques.forEach(t => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
  }

  const favorites = getFavorites()

  const toggleTechnique = (tech) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques.includes(tech)
        ? prev.techniques.filter(t => t !== tech)
        : [...prev.techniques, tech]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newSession = { id: Date.now(), ...formData }
    setSessions(prev => [newSession, ...prev])
    setShowLogForm(false)
    setFormData({ date: getToday(), duration: 60, type: 'gi', intensity: 3, techniques: [], notes: '' })
    setView('history')
  }

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const getIntensityLabel = (val) => ['', 'Easy', 'Light', 'Moderate', 'Hard', 'Max Effort'][val] || ''

  const refreshQuote = () => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
  }

  const toggleBreath = () => {
    if (breathActive) {
      setBreathActive(false)
      setBreathPhase('inhale')
      setBreathScale(1)
    } else {
      setBreathActive(true)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>BJJ COMPASS</h1>
        <p className="tagline">Track. Attack. Evolve.</p>
      </header>

      <nav className="nav-tabs">
        <button className={`nav-tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
        <button className={`nav-tab ${view === 'breathe' ? 'active' : ''}`} onClick={() => setView('breathe')}>Breathe</button>
        <button className={`nav-tab ${view === 'checklist' ? 'active' : ''}`} onClick={() => setView('checklist')}>Checklist</button>
        <button className={`nav-tab ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>History</button>
      </nav>

      {/* ─── DASHBOARD ─── */}
      {view === 'dashboard' && (
        <div className="dashboard">
          <div className="stats-grid">
            <div className="stat-card streak-card">
              <div className="stat-value">{streak}</div>
              <div className="stat-label"><span className="stat-icon">🔥</span>Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{thisMonthSessions.length}</div>
              <div className="stat-label"><span className="stat-icon">📅</span>Sessions This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(totalMinutesThisMonth / 60)}h</div>
              <div className="stat-label"><span className="stat-icon">⏱️</span>Time Invested</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgIntensity}</div>
              <div className="stat-label"><span className="stat-icon">💪</span>Avg Intensity</div>
            </div>
          </div>

          <div className="section milestones-section">
            <h3 className="section-title"><span className="section-icon">🏆</span>Milestones</h3>
            <div className="milestones-row">
              <div className={`milestone-badge ${milestones[7] ? 'achieved' : 'locked'}`}>
                <div className="milestone-icon">🔥</div>
                <div className="milestone-info">
                  <div className="milestone-name">Week Warrior</div>
                  <div className="milestone-req">7 Days</div>
                </div>
              </div>
              <div className={`milestone-badge ${milestones[30] ? 'achieved' : 'locked'}`}>
                <div className="milestone-icon">💪</div>
                <div className="milestone-info">
                  <div className="milestone-name">Month Master</div>
                  <div className="milestone-req">30 Days</div>
                </div>
              </div>
              <div className={`milestone-badge ${milestones[100] ? 'achieved' : 'locked'}`}>
                <div className="milestone-icon">👑</div>
                <div className="milestone-info">
                  <div className="milestone-name">Century Champion</div>
                  <div className="milestone-req">100 Days</div>
                </div>
              </div>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="section favorites-section">
              <h3 className="section-title"><span className="section-icon">⭐</span>Top Techniques</h3>
              <div className="favorites-list">
                {favorites.map(([tech, count], idx) => (
                  <div key={tech} className="favorite-item">
                    <span className="favorite-rank">#{idx + 1}</span>
                    <span className="favorite-name">{tech}</span>
                    <span className="favorite-count">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="quote-card" onClick={refreshQuote}>
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
            <p className="quote-hint">tap to refresh</p>
          </div>

          <button className="log-session-btn" onClick={() => setShowLogForm(true)}>
            <span className="btn-icon">+</span>Log New Session
          </button>
        </div>
      )}

      {/* ─── BREATHE ─── */}
      {view === 'breathe' && (
        <div className="breathe-view">
          <div className="breathing-section">
            <div
              className={`breathing-circle ${breathPhase} ${breathActive ? 'active' : ''}`}
              style={{ transform: `scale(${breathScale})` }}
            >
              <div className="breath-inner">
                <span className="breath-phase">{breathPhase === 'holdout' ? 'HOLD' : breathPhase.toUpperCase()}</span>
                <span className="breath-hint">
                  {breathPhase === 'inhale' ? 'breathe in' :
                   breathPhase === 'hold' ? 'hold' :
                   breathPhase === 'exhale' ? 'breathe out' : 'rest'}
                </span>
              </div>
            </div>
            <p className="breathing-label">4-4-4-2 Box Breathing</p>
            <p className="breathing-sublabel">Pre-roll calm</p>
          </div>

          <button className={`breath-toggle-btn ${breathActive ? 'stop' : 'start'}`} onClick={toggleBreath}>
            {breathActive ? 'STOP' : 'START'}
          </button>

          <div className="breath-info">
            <div className="breath-info-item">
              <span className="breath-info-label">Inhale</span>
              <span className="breath-info-value">4s</span>
            </div>
            <div className="breath-info-item">
              <span className="breath-info-label">Hold</span>
              <span className="breath-info-value">4s</span>
            </div>
            <div className="breath-info-item">
              <span className="breath-info-label">Exhale</span>
              <span className="breath-info-value">4s</span>
            </div>
            <div className="breath-info-item">
              <span className="breath-info-label">Rest</span>
              <span className="breath-info-value">2s</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── CHECKLIST ─── */}
      {view === 'checklist' && (
        <div className="checklist-view">
          <h2 className="section-header">Pre-Roll Checklist</h2>
          
          <div className="checklist-items">
            <label className={`checklist-item ${checklist.hydrated ? 'checked' : ''}`}>
              <input type="checkbox" checked={checklist.hydrated} onChange={e => setChecklist(prev => ({...prev, hydrated: e.target.checked}))} />
              <div className="checklist-text">
                <span className="checklist-title">Hydrated</span>
                <span className="checklist-desc">Drank water in last 30 min</span>
              </div>
            </label>
            <label className={`checklist-item ${checklist.breathing ? 'checked' : ''}`}>
              <input type="checkbox" checked={checklist.breathing} onChange={e => setChecklist(prev => ({...prev, breathing: e.target.checked}))} />
              <div className="checklist-text">
                <span className="checklist-title">Deep breaths done</span>
                <span className="checklist-desc">At least 3 deep breaths</span>
              </div>
            </label>
            <label className={`checklist-item ${checklist.technique ? 'checked' : ''}`}>
              <input type="checkbox" checked={checklist.technique} onChange={e => setChecklist(prev => ({...prev, technique: e.target.checked}))} />
              <div className="checklist-text">
                <span className="checklist-title">Reviewed today's technique</span>
                <span className="checklist-desc">Looked at notes or thought about it</span>
              </div>
            </label>
            <label className={`checklist-item ${checklist.bodyScan ? 'checked' : ''}`}>
              <input type="checkbox" checked={checklist.bodyScan} onChange={e => setChecklist(prev => ({...prev, bodyScan: e.target.checked}))} />
              <div className="checklist-text">
                <span className="checklist-title">Body scan</span>
                <span className="checklist-desc">No sharp pain, good to train</span>
              </div>
            </label>
          </div>

          {checklist.hydrated && checklist.breathing && checklist.technique && checklist.bodyScan && (
            <div className="ready-message">
              <div className="ready-icon">🔥</div>
              <p>You are ready to dominate. Trust your technique.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── HISTORY ─── */}
      {view === 'history' && (
        <div className="history-view">
          <h2 className="section-header">Training History</h2>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🥋</div>
              <p>No sessions logged yet.</p>
              <p>Start tracking your journey!</p>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <div className="session-date">
                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <button className="delete-btn" onClick={() => deleteSession(session.id)}>×</button>
                  </div>
                  <div className="session-meta">
                    <span className={`session-type ${session.type}`}>{session.type.toUpperCase()}</span>
                    <span className="session-duration">{session.duration} min</span>
                    <span className={`session-intensity intensity-${session.intensity}`}>{getIntensityLabel(session.intensity)}</span>
                  </div>
                  {session.techniques.length > 0 && (
                    <div className="session-techniques">
                      {session.techniques.map(t => <span key={t} className="technique-tag">{t}</span>)}
                    </div>
                  )}
                  {session.notes && <p className="session-notes">{session.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log Session Modal */}
      {showLogForm && (
        <div className="modal-overlay" onClick={() => setShowLogForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogForm(false)}>×</button>
            <h2>Log Training Session</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <div className="duration-buttons">
                  {[30, 45, 60, 90, 120].map(m => (
                    <button key={m} type="button" className={`duration-btn ${formData.duration === m ? 'active' : ''}`} onClick={() => setFormData(prev => ({ ...prev, duration: m }))}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Training Type</label>
                <div className="type-buttons">
                  {['gi', 'no-gi', 'mixed'].map(t => (
                    <button key={t} type="button" className={`type-btn ${formData.type === t ? 'active' : ''} ${t}`} onClick={() => setFormData(prev => ({ ...prev, type: t }))}>{t === 'no-gi' ? 'NO-GI' : t.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Intensity: {getIntensityLabel(formData.intensity)}</label>
                <input type="range" min="1" max="5" value={formData.intensity} onChange={e => setFormData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))} className="intensity-slider" />
                <div className="intensity-labels"><span>Easy</span><span>Max</span></div>
              </div>
              <div className="form-group">
                <label>Techniques Worked On</label>
                <div className="technique-grid">
                  {TECHNIQUES.map(t => (
                    <button key={t} type="button" className={`technique-btn ${formData.techniques.includes(t) ? 'active' : ''}`} onClick={() => toggleTechnique(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="What did you work on? How did it go?" rows={3} />
              </div>
              <button type="submit" className="submit-btn">Save Session</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
