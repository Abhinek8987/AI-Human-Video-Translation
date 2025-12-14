import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobStatus } from '../api/endpoints'
import { motion } from 'framer-motion'
import HelpButton from '../components/HelpButton'

type JobResp = { job_id: string; status: string; progress: number; message?: string }

export default function Status() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<JobResp | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'queued':
        return { 
          icon: '⏳', 
          color: 'text-yellow-400', 
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-400/40'
        }
      case 'processing':
        return { 
          icon: '⚡', 
          color: 'text-cyan-400', 
          bgColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-400/40'
        }
      case 'completed':
        return { 
          icon: '✅', 
          color: 'text-green-400', 
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-400/40'
        }
      case 'failed':
        return { 
          icon: '❌', 
          color: 'text-red-400', 
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-400/40'
        }
      default:
        return { 
          icon: '🔍', 
          color: 'text-gray-400', 
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-400/40'
        }
    }
  }

  // Simulate AI log messages
  const addLogMessage = (message: string) => {
    setLogs(prev => [...prev, `> ${message}`])
    if (logs.length > 6) {
      setLogs(prev => prev.slice(1))
    }
  }

  // Get current step based on progress
  const getCurrentStep = (progress: number) => {
    if (progress < 20) return 1
    if (progress < 40) return 2
    if (progress < 60) return 3
    if (progress < 80) return 4
    return 5
  }

  const steps = [
    { 
      name: 'Audio Extraction', 
      description: 'Extracting audio tracks from video',
      icon: '🎵',
      logMessage: 'Extracting audio from video source...'
    },
    { 
      name: 'Translation', 
      description: 'Translating speech to target language',
      icon: '🌐',
      logMessage: 'Translating speech content...'
    },
    { 
      name: 'Voice Synthesis', 
      description: 'Generating translated voice',
      icon: '🔊',
      logMessage: 'Synthesizing new voice audio...'
    },
    { 
      name: 'Lip Sync', 
      description: 'Synchronizing lips with audio',
      icon: '👄',
      logMessage: 'Applying lip synchronization...'
    },
    { 
      name: 'Rendering', 
      description: 'Final video composition',
      icon: '🎬',
      logMessage: 'Rendering final video output...'
    }
  ]

  useEffect(() => {
    const startTime = Date.now()
    let logInterval: number | undefined

    // Initialize logs
    addLogMessage('Starting AI video translation process...')
    addLogMessage('Initializing neural processing modules...')
    
    const timer = setInterval(async () => {
      if (!jobId) return
      const resp = await jobStatus(jobId)
      setData(resp)
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))

      // Add log messages based on progress
      const currentStep = getCurrentStep(resp.progress || 0)
      if (currentStep > getCurrentStep(data?.progress || 0)) {
        const step = steps[currentStep - 1]
        if (step) {
          addLogMessage(step.logMessage)
        }
      }

      if (resp.status === 'completed') {
        clearInterval(timer)
        if (logInterval) clearInterval(logInterval)
        addLogMessage('Translation completed successfully!')
        setTimeout(() => setShowCompletion(true), 1000)
      }
      if (resp.status === 'failed') {
        clearInterval(timer)
        if (logInterval) clearInterval(logInterval)
        addLogMessage('Process failed - please check configuration')
      }
    }, 1200)

    // Simulate occasional log updates
    logInterval = window.setInterval(() => {
      if (data?.status === 'processing') {
        const messages = [
          'Processing audio waveforms...',
          'Analyzing facial features...',
          'Optimizing voice parameters...',
          'Neural network processing...',
          'Encoding video streams...',
          'Applying temporal alignment...'
        ]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        addLogMessage(randomMessage)
      }
    }, 4000)

    return () => {
      clearInterval(timer)
      if (logInterval) clearInterval(logInterval)
    }
  }, [jobId, navigate, data?.progress, data?.status])

  const statusInfo = getStatusInfo(data?.status || 'queued')
  const currentStep = getCurrentStep(data?.progress || 0)

  // Button click handlers
  const handlePreviewVideo = () => {
    navigate(`/preview/${jobId}`)
  }

  const handleViewSubtitles = () => {
    navigate(`/subtitles/${jobId}`)
  }

  const handleDownloadVideo = () => {
    // Navigate to download page or trigger download directly
    navigate(`/preview/${jobId}`) // Using same page for download options
  }

  const handleNewVideo = () => {
    navigate('/upload')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Neural Network Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.6); }
        }
        @keyframes stepGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-stepGlow {
          animation: stepGlow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-glow">
            <div className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-indigo-300 to-cyan-300 bg-clip-text text-transparent mb-4">
            AI Video Translation
          </h1>
          <p className="text-xl text-gray-300 font-light">
            Neural Network Processing in Progress
          </p>
        </div>

        {/* Main Dashboard Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 mb-8 animate-fadeIn">
          {/* Status Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-5">
              <div className={`w-20 h-20 ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
                <span className="text-4xl">{statusInfo.icon}</span>
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>
                  {data?.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Queued'}
                </h2>
                <p className="text-gray-400 font-mono text-lg">ID: {jobId}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg text-gray-400 font-medium">Processing Time</div>
              <div className="text-4xl font-bold text-cyan-300 font-mono">
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          {/* Circular Progress Loader */}
          <div className="flex justify-center mb-12">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-slate-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * (data?.progress || 0)) / 100}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{data?.progress || 0}%</span>
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm ${
                  index + 1 <= currentStep
                    ? `bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20`
                    : 'bg-slate-700/30 border-slate-600/50'
                } ${index + 1 === currentStep ? 'animate-stepGlow scale-105' : ''}`}
              >
                <div className="text-center">
                  <div className={`text-3xl mb-3 ${index + 1 <= currentStep ? 'text-cyan-300' : 'text-gray-500'}`}>
                    {step.icon}
                  </div>
                  <div className={`font-bold text-lg mb-2 ${
                    index + 1 <= currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </div>
                  <div className={`text-sm ${
                    index + 1 <= currentStep ? 'text-cyan-200' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </div>
                </div>
                {index + 1 === currentStep && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-6 h-6 bg-cyan-400 rounded-full animate-ping"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Log Console */}
          <div className="bg-slate-900/80 rounded-2xl border border-cyan-500/30 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
              <span className="text-cyan-300 font-mono text-lg font-bold ml-2">AI PROCESS LOG</span>
            </div>
            <div className="font-mono text-base text-gray-200 h-40 overflow-y-auto bg-black/40 rounded-xl p-5 border border-slate-700/50">
              {logs.map((log, index) => (
                <div key={index} className="mb-2 animate-fadeIn">
                  <span className="text-green-400 font-bold">$ </span>
                  <span className="text-cyan-200">{log}</span>
                </div>
              ))}
              {data?.status === 'processing' && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 font-bold">$ </span>
                  <div className="w-3 h-5 bg-cyan-400 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Processing Status */}
          <div className="text-center py-6">
            <div className="inline-flex space-x-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-lg text-cyan-200 font-medium">
              AI is working its magic... This usually takes 1-3 minutes
            </p>
          </div>

          {/* Status Message */}
          {data?.message && (
            <div className="bg-cyan-500/20 border-2 border-cyan-400/40 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center space-x-4">
                <svg className="w-6 h-6 text-cyan-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-cyan-100 text-lg font-medium">{data.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Success Completion View */}
        {showCompletion && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-10 text-center shadow-2xl border border-cyan-500/30 transform scale-100 animate-scaleIn max-w-2xl mx-4 w-full">
              {/* Animated Success Checkmark */}
              <div className="relative mb-8">
                <div className="w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-glow">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="absolute inset-0 animate-ping">
                  <div className="w-40 h-40 border-4 border-green-400 rounded-full mx-auto opacity-60"></div>
                </div>
              </div>
              
              <h3 className="text-5xl font-bold bg-gradient-to-r from-green-300 to-cyan-300 bg-clip-text text-transparent mb-6">
                Translation Complete!
              </h3>
              <p className="text-2xl text-gray-200 mb-2 font-light">
                ✅ Your video and subtitles are ready.
              </p>
              <p className="text-lg text-gray-400 mb-10">
                AI-powered lip sync and voice synthesis applied successfully
              </p>

              {/* Action Buttons with working functionality */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <button 
                  onClick={handlePreviewVideo}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/30 shadow-lg"
                >
                  🎬 Preview Video
                </button>
                <button 
                  onClick={handleViewSubtitles}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-indigo-400/30 shadow-lg"
                >
                  📝 View Subtitles
                </button>
                <button 
                  onClick={handleDownloadVideo}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-400/30 shadow-lg"
                >
                  ⬇️ Download Video
                </button>
              </div>

              <button 
                onClick={handleNewVideo}
                className="w-full max-w-md mt-8 bg-slate-700/50 text-gray-300 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-600/50 transition-all duration-300 border border-slate-600/30 mx-auto block"
              >
                Upload New Video
              </button>
            </div>
          </div>
        )}
      </div>
      <HelpButton />
    </div>
  )
}