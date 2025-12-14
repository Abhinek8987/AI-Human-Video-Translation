import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HelpButton from '../components/HelpButton'
import { getDashboard, getLanguages, type LanguageOption } from '../api/endpoints'
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar,
  RadialBarChart, RadialBar, Legend
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

type Item = { job_id: string; target_language: string; created_at: string; duration_sec: number; words: number; status: string }
type DashboardStats = { total_videos: number; total_words: number; total_time_sec: number; history: Item[] }

const STATUS_COLORS: Record<string, string> = {
  completed: '#10B981',
  processing: '#3B82F6',
  queued: '#F59E0B',
  failed: '#EF4444',
}

// SVG Icons for new features - Fixed to accept className prop
const SvgIcons = {
  Download: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Refresh: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Filter: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Search: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Star: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M23 6l-9.5 9.5-5-5L1 18"/>
      <path d="M17 6h6v6"/>
    </svg>
  ),
  Users: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Zap: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Clock: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Eye: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Bookmark: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  BarChart: ({ className }: { className?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [langMap, setLangMap] = useState<Record<string,string>>({})
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Filters / Controls
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [searchId, setSearchId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [accent, setAccent] = useState<'indigo'|'emerald'|'rose'>('indigo')

  // Notifications / Activity
  const [notifications, setNotifications] = useState<{type:'success'|'error', msg:string, ts:number}[]>([])

  // NEW FEATURE 1: Favorites system
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  // NEW FEATURE 2: View mode (grid/list)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
  // NEW FEATURE 3: Auto-refresh toggle
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  
  // NEW FEATURE 4: Quick actions panel
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false)
  
  // NEW FEATURE 5: Selected jobs for batch operations
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())
  
  // NEW FEATURE 6: Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  // NEW FEATURE 7: Chart type toggles
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  
  // NEW FEATURE 8: Data density (time range)
  const [dataDensity, setDataDensity] = useState<'week' | 'month' | 'year'>('month')
  
  // NEW FEATURE 9: Performance metrics visibility
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(true)
  
  // NEW FEATURE 10: Export options
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const userId = localStorage.getItem('user_id') || 'guest'
      const [st, langs] = await Promise.all([
        getDashboard(userId),
        getLanguages(),
      ])
      const map: Record<string,string> = {}
      langs.forEach((o: LanguageOption) => { map[o.code] = o.label })
      setLangMap(map)
      setStats(st)
      setLastSync(new Date())
    } catch (e: any) {
      setError('Failed to load dashboard. Is the backend running at http://localhost:8000?')
    } finally {
      setLoading(false)
    }
  }

  // Initial load and live updates (polling)
  useEffect(() => { 
    fetchAll() 
  }, [])
  
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => { fetchAll() }, 10000)
    return () => clearInterval(id)
  }, [autoRefresh])

  // NEW FEATURE: Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('dashboard-favorites')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }, [])

  // NEW FEATURE: Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-favorites', JSON.stringify([...favorites]))
  }, [favorites])

  // Derivations & mock aggregations
  const history: Item[] = useMemo(() => stats?.history ?? [], [stats])

  const filteredHistory = useMemo(() => {
    return history.filter(i => {
      const m1 = statusFilter === 'all' ? true : i.status === statusFilter
      const m2 = languageFilter === 'all' ? true : i.target_language === languageFilter
      const m3 = searchId ? i.job_id.toLowerCase().includes(searchId.toLowerCase()) : true
      const t = i.created_at ? new Date(i.created_at).getTime() : 0
      const sOk = startDate ? t >= new Date(startDate).getTime() : true
      const eOk = endDate ? t <= new Date(endDate).getTime() + 86399999 : true
      return m1 && m2 && m3 && sOk && eOk
    })
  }, [history, statusFilter, languageFilter, searchId, startDate, endDate])

  // NEW FEATURE: Enhanced status distribution with progress
  const statusDist = useMemo(() => {
    const m: Record<string, number> = { completed:0, processing:0, queued:0, failed:0 }
    history.forEach(h => { m[h.status] = (m[h.status] || 0) + 1 })
    const total = history.length
    return Object.keys(m).map(k => ({ 
      name: k, 
      value: m[k],
      percentage: total > 0 ? ((m[k] / total) * 100).toFixed(1) : '0',
      color: STATUS_COLORS[k]
    }))
  }, [history])

  // NEW FEATURE: Enhanced daily uploads with data density
  const dailyUploads = useMemo(() => {
    const byDay: Record<string, {date:string, jobs:number, words:number, success: number}> = {}
    const now = new Date()
    const cutoffDate = new Date()
    
    if (dataDensity === 'week') {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (dataDensity === 'month') {
      cutoffDate.setDate(now.getDate() - 30)
    } else {
      cutoffDate.setFullYear(now.getFullYear() - 1)
    }

    history.forEach(h => {
      const d = h.created_at ? new Date(h.created_at) : new Date()
      if (d < cutoffDate) return
      
      const key = d.toISOString().slice(0,10)
      if (!byDay[key]) byDay[key] = { date: key, jobs: 0, words: 0, success: 0 }
      byDay[key].jobs += 1
      byDay[key].words += Math.max(0, h.words || 0)
      if (h.status === 'completed') byDay[key].success += 1
    })
    return Object.values(byDay).sort((a,b)=>a.date.localeCompare(b.date))
  }, [history, dataDensity])

  const langDistribution = useMemo(() => {
    const m: Record<string, number> = {}
    history.forEach(h => { m[h.target_language] = (m[h.target_language]||0) + 1 })
    return Object.entries(m)
      .map(([code, count]) => ({ label: langMap[code] || code, count, code }))
      .sort((a,b)=> b.count - a.count)
  }, [history, langMap])

  const topLanguages = useMemo(() => langDistribution.slice(0,5), [langDistribution])

  const successRate = useMemo(() => {
    const total = history.length
    if (!total) return 0
    const comp = history.filter(h=>h.status==='completed').length
    return Math.round((comp / total) * 100)
  }, [history])

  const averageVideoDuration = useMemo(() => {
    const completed = history.filter(h=>h.status==='completed')
    if (!completed.length) return 0
    return Math.round(completed.reduce((s,h)=>s+(h.duration_sec||0),0) / completed.length)
  }, [history])

  // Average processing time (mock): assume processing ~= duration * 0.6 seconds
  const averageProcessingTime = useMemo(() => {
    const completed = history.filter(h=>h.status==='completed')
    if (!completed.length) return 0
    const mock = completed.reduce((s,h)=> s + Math.max(10, Math.round((h.duration_sec||0) * 0.6)), 0)
    return Math.round(mock / completed.length)
  }, [history])

  const averageWordsPerVideo = useMemo(() => {
    if (!history.length) return 0
    return Math.round(history.reduce((s,h)=>s+(h.words||0),0) / history.length)
  }, [history])

  const estimatedTotalStorageMB = useMemo(() => {
    // Rough estimate: 128 kbps audio equivalent per second of video
    const totalSeconds = history.reduce((s,h)=>s+(h.duration_sec||0),0)
    const kb = totalSeconds * 128 / 8 // KB
    return Math.round(kb / 1024) // MB
  }, [history])

  // NEW FEATURE: Enhanced monthly summary with growth
  const monthlySummary = useMemo(() => {
    const m: Record<string, {month:string, jobs:number, success:number, growth?: number}> = {}
    
    history.forEach(h=>{
      const d = h.created_at ? new Date(h.created_at) : new Date()
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (!m[key]) m[key] = { month: key, jobs: 0, success: 0 }
      m[key].jobs += 1
      if (h.status==='completed') m[key].success += 1
    })
    
    const sorted = Object.values(m).sort((a,b)=>a.month.localeCompare(b.month))
    
    // Calculate growth
    return sorted.map((x, index) => ({
      ...x,
      successRate: x.jobs ? Math.round((x.success/x.jobs)*100) : 0,
      growth: index > 0 && sorted[index-1].jobs > 0 ? Math.round(((x.jobs - sorted[index-1].jobs) / sorted[index-1].jobs) * 100) : 0
    }))
  }, [history])

  // NEW FEATURE: Productivity score
  const productivityScore = useMemo(() => {
    if (!history.length) return 0
    const completed = history.filter(h => h.status === 'completed').length
    const efficiency = completed / history.length
    const avgProcessingSpeed = averageProcessingTime > 0 ? averageWordsPerVideo / averageProcessingTime : 0
    return Math.min(100, Math.round((efficiency * 70 + Math.min(avgProcessingSpeed * 30, 30))))
  }, [history, averageProcessingTime, averageWordsPerVideo])

  // Notifications from latest fetch
  useEffect(() => {
    if (!stats) return
    const recent = stats.history.slice(-3)
    const newNotes: typeof notifications = []
    recent.forEach(r=>{
      if (r.status==='completed') newNotes.push({type:'success', msg:`Job ${r.job_id.slice(0,8)} completed`, ts: Date.now()})
      if (r.status==='failed') newNotes.push({type:'error', msg:`Job ${r.job_id.slice(0,8)} failed`, ts: Date.now()})
    })
    if (newNotes.length) setNotifications(prev=>[...newNotes, ...prev].slice(0,10))
  }, [stats])

  // NEW FEATURE: Add to search history
  const handleSearch = (value: string) => {
    setSearchId(value)
    if (value && !searchHistory.includes(value)) {
      setSearchHistory(prev => [value, ...prev.slice(0, 5)])
    }
  }

  // NEW FEATURE: Toggle favorite
  const toggleFavorite = (jobId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(jobId)) {
        newFavorites.delete(jobId)
      } else {
        newFavorites.add(jobId)
      }
      return newFavorites
    })
  }

  // NEW FEATURE: Toggle job selection
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(jobId)) {
        newSelection.delete(jobId)
      } else {
        newSelection.add(jobId)
      }
      return newSelection
    })
  }

  // NEW FEATURE: Select all jobs
  const selectAllJobs = () => {
    if (selectedJobs.size === filteredHistory.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(filteredHistory.map(job => job.job_id)))
    }
  }

  // NEW FEATURE: Enhanced export function
  const onExport = () => {
    if (exportFormat === 'csv') {
      onExportCSV()
    } else if (exportFormat === 'json') {
      onExportJSON()
    } else {
      onExportPDF()
    }
  }

  const onExportCSV = () => {
    const header = ['job_id','target_language','created_at','duration_sec','words','status']
    const rows = filteredHistory.map(i=>[i.job_id, i.target_language, i.created_at, i.duration_sec, i.words, i.status])
    const csv = [header, ...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // NEW FEATURE: JSON export
  const onExportJSON = () => {
    const data = filteredHistory.map(job => ({
      ...job,
      language_label: langMap[job.target_language] || job.target_language
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // NEW FEATURE: Mock PDF export
  const onExportPDF = () => {
    alert('PDF export would be generated here with charts and tables')
    // In a real app, this would use a PDF generation library
  }

  // NEW FEATURE: Quick actions
  const quickActions = [
    {
      label: 'Batch Retry Failed',
      action: () => {
        const failedJobs = filteredHistory.filter(job => job.status === 'failed')
        if (failedJobs.length === 0) {
          alert('No failed jobs to retry')
          return
        }
        alert(`Retrying ${failedJobs.length} failed jobs...`)
      },
      icon: <SvgIcons.Refresh />
    },
    {
      label: 'Export Selected',
      action: () => {
        if (selectedJobs.size === 0) {
          alert('No jobs selected')
          return
        }
        alert(`Exporting ${selectedJobs.size} selected jobs...`)
      },
      icon: <SvgIcons.Download />
    },
    {
      label: 'Clear Completed',
      action: () => {
        const completedCount = filteredHistory.filter(job => job.status === 'completed').length
        if (completedCount === 0) {
          alert('No completed jobs to clear')
          return
        }
        if (confirm(`Clear ${completedCount} completed jobs from view?`)) {
          // This would be an API call in real app
          alert('Completed jobs cleared from view')
        }
      },
      icon: <SvgIcons.Filter />
    }
  ]

  const fmtTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec || 0))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const ss = s % 60
    if (h > 0) return `${h}h ${m}m ${ss}s`
    if (m > 0) return `${m}m ${ss}s`
    return `${ss}s`
  }

  const fmtDate = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString()
  }

  const statusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded text-xs font-medium'
    const map: Record<string,string> = {
      completed: 'bg-green-100 text-green-700',
      processing: 'bg-blue-100 text-blue-700',
      queued: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-700',
    }
    const cls = map[status] || 'bg-gray-100 text-gray-700'
    return <span className={`${base} ${cls}`}>{status}</span>
  }

  const accentClass = useMemo(() => ({
    indigo: 'from-indigo-600 to-purple-600',
    emerald: 'from-emerald-600 to-teal-600',
    rose: 'from-rose-600 to-pink-600'
  }[accent]), [accent])

  return (
    <div className={`${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen`}> 
      <div className="max-w-7xl mx-auto p-6">
        
        {/* NEW FEATURE: Quick Actions Floating Button */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed right-6 bottom-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
            >
              <div className="flex flex-col gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header / Profile / Controls - ENHANCED */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {lastSync ? `Last sync: ${lastSync.toLocaleString()}` : 'Waiting for sync...'}
              {autoRefresh && <span className="ml-2 text-green-500">• Auto-refresh ON</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            
            {/* NEW FEATURE: View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 text-xs rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                Grid
              </button>
            </div>

            {/* NEW FEATURE: Auto-refresh Toggle */}
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 text-white rounded text-sm flex items-center gap-1 ${
                autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <SvgIcons.Refresh />
              Auto
            </button>

            <button onClick={()=>navigate('/upload')} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Upload New</button>
            <button onClick={fetchAll} className="px-3 py-2 bg-gray-900 text-white rounded hover:opacity-90 text-sm dark:bg-gray-700">Refresh</button>
            
            {/* NEW FEATURE: Enhanced Export with Options */}
            <div className="relative group">
              <button onClick={onExport} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm flex items-center gap-1">
                <SvgIcons.Download />
                Export
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                <div className="flex flex-col gap-1 text-xs">
                  {(['csv', 'json', 'pdf'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`px-2 py-1 rounded text-left ${
                        exportFormat === format ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={()=>alert('Reports coming soon')} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100">View Reports</button>
            
            {/* NEW FEATURE: Quick Actions Toggle */}
            <button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
            >
              Quick Actions
            </button>

            <div className="flex items-center gap-2 ml-2">
              <label className="text-sm">Dark</label>
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={e=>setDarkMode(e.target.checked)} 
                className="rounded"
              />
            </div>
            <select 
              value={accent} 
              onChange={e=>setAccent(e.target.value as any)} 
              className="text-sm border rounded px-2 py-1 dark:bg-gray-800"
            >
              <option value="indigo">Indigo</option>
              <option value="emerald">Emerald</option>
              <option value="rose">Rose</option>
            </select>
          </div>
        </div>

        {/* NEW FEATURE: Productivity Score Card */}
        {showPerformanceMetrics && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Productivity Score</div>
                <div className="text-3xl font-bold">{productivityScore}%</div>
                <div className="text-xs opacity-80 mt-1">
                  Based on completion rate and processing efficiency
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{successRate}%</div>
                  <div className="text-xs opacity-80">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{fmtTime(averageProcessingTime)}</div>
                  <div className="text-xs opacity-80">Avg Process Time</div>
                </div>
              </div>
              <button 
                onClick={() => setShowPerformanceMetrics(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-pulse">
            <div className="h-24 bg-gray-200 rounded dark:bg-gray-700" />
            <div className="h-24 bg-gray-200 rounded dark:bg-gray-700" />
            <div className="h-24 bg-gray-200 rounded dark:bg-gray-700" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {label:'Total Videos', value: stats.total_videos}, 
              {label:'Total Words', value: stats.total_words}, 
              {label:'Total Time', value: fmtTime(stats.total_time_sec)}
            ].map((c,idx)=> (
              <motion.div 
                key={idx} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}} 
                transition={{delay: idx*0.05}} 
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${accentClass} bg-clip-text text-transparent`}>
                  {c.value}
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Average Words/Video</div>
            <div className="text-2xl font-semibold">{averageWordsPerVideo}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Average Video Duration</div>
            <div className="text-2xl font-semibold">{fmtTime(averageVideoDuration)}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Average Processing Time</div>
            <div className="text-2xl font-semibold">{fmtTime(averageProcessingTime)}</div>
          </div>
        </div>

        {/* NEW FEATURE: Chart Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Analytics Overview</h2>
          <div className="flex items-center gap-3">
            <select 
              value={dataDensity} 
              onChange={e => setDataDensity(e.target.value as 'week' | 'month' | 'year')}
              className="text-sm border rounded px-2 py-1 dark:bg-gray-800"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 text-xs rounded ${chartType === 'line' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                Bar
              </button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

  {/* Status Donut - FINAL FIXED */}
  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <div className="font-semibold">Job Status Overview</div>
      <div className="text-sm text-gray-500">Success: {successRate}%</div>
    </div>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusDist}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={90}
            startAngle={90}
            endAngle={-270}
            labelLine={false}
            paddingAngle={1}
            label={({ name, percent }) =>
              percent > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
            }
          >
            {statusDist.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || '#9CA3AF'}
                stroke="none"
              />
            ))}
          </Pie>

          {/* Center Label */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-gray-700 dark:text-gray-200 font-bold text-base"
          >
            {successRate}% Success
          </text>

          <RTooltip
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Upload Trend - SAME AS BEFORE */}
  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
    <div className="font-semibold mb-2">Upload Trend (Jobs / Words)</div>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart data={dailyUploads}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RTooltip />
            <Line
              type="monotone"
              dataKey="jobs"
              stroke="#6366F1"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="words"
              stroke="#10B981"
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <BarChart data={dailyUploads}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RTooltip />
            <Bar dataKey="jobs" fill="#6366F1" />
            <Bar dataKey="words" fill="#10B981" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </div>

  {/* Success Rate Gauge - SAME */}
  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
    <div className="font-semibold mb-2">Success Rate</div>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={[{ name: 'Success', value: successRate, fill: '#10B981' }]}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar background dataKey="value" />
          <Legend
            content={() => (
              <div style={{ textAlign: 'center', marginTop: -10 }}>
                <span className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                  {successRate}%
                </span>
              </div>
            )}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  </div>

</div>


        {/* Language Distribution + Top Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 lg:col-span-2">
            <div className="font-semibold mb-2">Language Distribution</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={langDistribution} layout="vertical" margin={{left: 30}}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="label" width={120} />
                  <RTooltip />
                  <Bar dataKey="count" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="font-semibold mb-2">Top Languages</div>
            <ul className="space-y-2 text-sm">
              {topLanguages.map((l, idx)=> (
                <li key={idx} className="flex items-center justify-between">
                  <span>{l.label}</span>
                  <span className="text-gray-500">{l.count}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Estimated Storage Used: {estimatedTotalStorageMB} MB
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 mb-6">
          <div className="font-semibold mb-2">Monthly Summary</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="jobs" fill="#3B82F6" />
                <Bar dataKey="successRate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters - ENHANCED */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <SvgIcons.Filter />
              Filters & Search
            </h3>
            
            {/* NEW FEATURE: Search History */}
            {searchHistory.length > 0 && (
              <div className="relative group">
                <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Recent Searches
                </button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                  <div className="flex flex-col gap-1 text-xs min-w-32">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchId(term)}
                        className="px-2 py-1 rounded text-left hover:bg-gray-50 dark:hover:bg-gray-700 truncate"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select 
                value={statusFilter} 
                onChange={e=>setStatusFilter(e.target.value)} 
                className="border rounded px-2 py-1 text-sm dark:bg-gray-800"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="queued">Queued</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Language</label>
              <select 
                value={languageFilter} 
                onChange={e=>setLanguageFilter(e.target.value)} 
                className="border rounded px-2 py-1 text-sm dark:bg-gray-800"
              >
                <option value="all">All</option>
                {Object.entries(langMap).map(([code,label])=> (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Search Job ID</label>
              <div className="relative">
                {/* FIXED: Search icon now accepts className prop */}
                <SvgIcons.Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  value={searchId} 
                  onChange={e => handleSearch(e.target.value)} 
                  placeholder="e.g. a1b2c3" 
                  className="border rounded pl-8 pr-2 py-1 text-sm dark:bg-gray-800 w-32" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e=>setStartDate(e.target.value)} 
                className="border rounded px-2 py-1 text-sm dark:bg-gray-800" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e=>setEndDate(e.target.value)} 
                className="border rounded px-2 py-1 text-sm dark:bg-gray-800" 
              />
            </div>
          </div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 lg:col-span-2">
            <div className="font-semibold mb-2">Recent Activity</div>
            <ul className="space-y-2 text-sm">
              {history.slice(-10).reverse().map((h,idx)=> (
                <li key={idx} className="flex items-center justify-between">
                  <span>Job <span className="font-mono">{h.job_id.slice(0,8)}…</span> {h.status}</span>
                  <span className="text-gray-500 dark:text-gray-400">{fmtDate(h.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="font-semibold mb-2">Notifications</div>
            <ul className="space-y-2 text-sm max-h-64 overflow-auto">
              {notifications.length === 0 && <li className="text-gray-500 dark:text-gray-400">No notifications</li>}
              {notifications.map((n,idx)=> (
                <li 
                  key={idx} 
                  className={`p-2 rounded ${
                    n.type==='success' 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                  }`}
                >
                  {n.msg}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jobs Table - ENHANCED */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Recent Jobs</div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {selectedJobs.size > 0 ? `${selectedJobs.size} selected / ` : ''}
                Rows: {filteredHistory.length}
              </div>
              
              {/* NEW FEATURE: Batch Selection */}
              {selectedJobs.size > 0 && (
                <button
                  onClick={selectAllJobs}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  {selectedJobs.size === filteredHistory.length ? 'Clear All' : 'Select All'}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left border-b dark:border-gray-600">
                  {/* NEW FEATURE: Selection Checkbox */}
                  <th className="py-2 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedJobs.size === filteredHistory.length && filteredHistory.length > 0}
                      onChange={selectAllJobs}
                      className="rounded"
                    />
                  </th>
                  <th className="py-2 px-3">Job ID</th>
                  <th className="py-2 px-3">Language</th>
                  <th className="py-2 px-3">Created</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Words</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((i: Item) => (
                  <tr 
                    key={i.job_id} 
                    className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedJobs.has(i.job_id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={()=>navigate(`/status/${i.job_id}`)}
                  >
                    {/* NEW FEATURE: Selection Checkbox */}
                    <td className="py-2 px-3" onClick={(e)=>e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(i.job_id)}
                        onChange={() => toggleJobSelection(i.job_id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-2 px-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {i.job_id}
                        {/* NEW FEATURE: Favorite Star */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(i.job_id)
                          }}
                          className={`hover:scale-110 transition-transform ${
                            favorites.has(i.job_id) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                          }`}
                        >
                          <SvgIcons.Star />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3">{langMap[i.target_language] || i.target_language}</td>
                    <td className="py-2 px-3">{fmtDate(i.created_at)}</td>
                    <td className="py-2 px-3">{fmtTime(i.duration_sec)}</td>
                    <td className="py-2 px-3">{i.words}</td>
                    <td className="py-2 px-3">{statusBadge(i.status)}</td>
                    <td className="py-2 px-3" onClick={(e)=>e.stopPropagation()}>
                      {i.status==='failed' && (
                        <button className="px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors">
                          Retry
                        </button>
                      )}
                      {i.status==='completed' && (
                        <button className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1">
                          <SvgIcons.Download />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <HelpButton />
    </div>
  )
}