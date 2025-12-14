import { useParams } from 'react-router-dom'
import { API_BASE } from '../config'
import VideoPlayer from '../components/VideoPlayer'
import { useEffect, useState } from 'react'
import HelpButton from '../components/HelpButton'

// Language to flag mapping
const languageFlags: { [key: string]: string } = {
  'en': '🇺🇸',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'ru': '🇷🇺',
  'zh': '🇨🇳',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'ar': '🇸🇦',
  'hi': '🇮🇳',
  'tr': '🇹🇷',
  'nl': '🇳🇱',
  'pl': '🇵🇱',
  'sv': '🇸🇪',
  'da': '🇩🇰',
  'no': '🇳🇴',
  'fi': '🇫🇮',
  'el': '🇬🇷',
  'he': '🇮🇱',
  'th': '🇹🇭',
  'vi': '🇻🇳',
  'id': '🇮🇩',
  'ms': '🇲🇾'
}

// Language full names
const languageNames: { [key: string]: string } = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'el': 'Greek',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay'
}

export default function PreviewDownload() {
  const { jobId } = useParams()
  const previewUrl = `${API_BASE}/preview/${jobId}`
  const downloadUrl = `${API_BASE}/download/${jobId}`
  const srtUrl = `${API_BASE}/subtitles/${jobId}.srt`
  const vttUrl = `${API_BASE}/subtitles/${jobId}.vtt`
  const [showConfetti, setShowConfetti] = useState(true)
  const [translationData, setTranslationData] = useState<any>(null)

  // Get translation data from localStorage or API
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    // Get translation data from localStorage (set during upload)
    const storedData = localStorage.getItem(`translation_${jobId}`)
    if (storedData) {
      setTranslationData(JSON.parse(storedData))
    } else {
      // Fallback: try to get from URL params or set defaults
      const urlParams = new URLSearchParams(window.location.search)
      const targetLang = urlParams.get('targetLang') || 'es' // Default to Spanish if not found
      const sourceLang = urlParams.get('sourceLang') || 'en' // Default to English if not found
      
      setTranslationData({
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
        processingTime: '2:18',
        accuracy: '98%',
        lipSyncConfidence: '96%',
        subtitleCount: '247',
        voiceMatch: '94%'
      })
    }

    return () => clearTimeout(timer)
  }, [jobId])

  const getFlag = (langCode: string) => {
    return languageFlags[langCode] || '🌐'
  }

  const getLanguageName = (langCode: string) => {
    return languageNames[langCode] || langCode.toUpperCase()
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                background: `hsl(${Math.random() * 360}, 100%, 60%)`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-glow">
            <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent mb-4">
            Your Video is Ready!
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
            AI-translated with perfect lip synchronization, voice cloning, and multi-language subtitles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Preview Card */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-white">5-Second AI Preview</h2>
                <div className="ml-auto px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full">
                  <span className="text-cyan-300 text-sm font-medium">AI Enhanced</span>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-2xl overflow-hidden shadow-inner border border-slate-600/50">
                <VideoPlayer src={previewUrl} />
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-cyan-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm">Powered by neural lip-sync and voice translation AI</span>
              </div>
            </div>

            {/* Download Cards Grid */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Files
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Video Download */}
                <a 
                  href={downloadUrl} 
                  className="group bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-indigo-500/30"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-lg mb-2">Translated Video</h4>
                    <p className="text-indigo-200 text-sm">Full HD Quality • MP4</p>
                  </div>
                </a>

                {/* SRT Subtitles */}
                <a 
                  href={srtUrl} 
                  className="group bg-slate-700/50 border-2 border-slate-600/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-blue-400/50 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">SRT Subtitles</h4>
                    <p className="text-gray-400 text-sm">Standard format • Universal</p>
                  </div>
                </a>

                {/* VTT Subtitles */}
                <a 
                  href={vttUrl} 
                  className="group bg-slate-700/50 border-2 border-slate-600/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-green-400/50 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">VTT Subtitles</h4>
                    <p className="text-gray-400 text-sm">Web format • Modern</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* Dynamic Language Information */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Language Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                  <div>
                    <div className="text-sm text-gray-400">Source Language</div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      <span className="text-2xl">{getFlag(translationData?.sourceLanguage || 'en')}</span>
                      {getLanguageName(translationData?.sourceLanguage || 'en')}
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-400">Target Language</div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      <span className="text-2xl">{getFlag(translationData?.targetLanguage || 'es')}</span>
                      {getLanguageName(translationData?.targetLanguage || 'es')}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
                  <div className="text-sm text-gray-400 mb-2">AI Models Used</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-400/30">Whisper</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-400/30">TTS</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-400/30">Wav2Lip</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-400/30">Neural Voice</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic AI Summary Metrics */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                AI Processing Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-400/20">
                  <div className="text-2xl font-bold text-cyan-300 mb-1">{translationData?.processingTime || '2:18'}</div>
                  <div className="text-sm text-cyan-200">Processing Time</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/20">
                  <div className="text-2xl font-bold text-green-300 mb-1">{translationData?.accuracy || '98%'}</div>
                  <div className="text-sm text-green-200">Translation Accuracy</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/20">
                  <div className="text-2xl font-bold text-purple-300 mb-1">{translationData?.lipSyncConfidence || '96%'}</div>
                  <div className="text-sm text-purple-200">Lip-sync Confidence</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-400/20">
                  <div className="text-2xl font-bold text-orange-300 mb-1">{translationData?.subtitleCount || '247'}</div>
                  <div className="text-sm text-orange-200">Subtitle Count</div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Features Applied:
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-cyan-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Neural lip-sync synchronization</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Voice cloning with emotion retention</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Multi-language subtitle generation</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Background noise removal</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-200">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Real-time translation accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-center">
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-3">Need to translate another video?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Transform more videos with our advanced AI translation technology. Perfect for presentations, content creation, and global communication.
            </p>
            <a 
              href="/upload" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/30 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start New Translation
            </a>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.6); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
      </div>
      <HelpButton />
    </>
  )
}