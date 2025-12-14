import { Link, useLocation } from 'react-router-dom'
import AppRoutes from './routes'
import { useState, useEffect, useRef } from 'react'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const location = useLocation()

  // Enhanced Typewriter Animation State
  const [typewriterText, setTypewriterText] = useState('')
  const [typewriterIndex, setTypewriterIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Language data with flags for typewriter animation - using the same list as supportedLanguages
  const languagesWithFlags = [
    { name: 'French', flag: '' },
    { name: 'Japanese', flag: '' },
    { name: 'Hindi', flag: '' },
    { name: 'Portuguese', flag: '' },
    { name: 'German', flag: '' },
    { name: 'Chinese', flag: '' },
    { name: 'Korean', flag: '' },
    { name: 'Arabic', flag: '' },
    { name: 'Italian', flag: '' },
    { name: 'Russian', flag: '' },
    { name: 'Dutch', flag: '' },
    { name: 'Spanish', flag: '' }
  ]

  // Country flags for carousel
  const countryFlags = ['🇺🇸', '🇮🇳', '🇫🇷', '🇪🇸', '🇯🇵', '🇩🇪', '🇨🇳', '🇧🇷', '🇷🇺', '🇮🇹', '🇰🇷', '🇳🇱', '🇵🇹', '🇦🇪', '🇸🇦', '🇲🇽', '🇨🇦', '🇦🇺']

  // Enhanced Typewriter Effect with proper TypeScript typing
  useEffect(() => {
    const currentLanguage = languagesWithFlags[typewriterIndex]
    const baseText = ''
    const languageText = `${currentLanguage.flag} ${currentLanguage.name}`
    const fullText = baseText + languageText
    
    let timer: ReturnType<typeof setTimeout> | undefined

    if (isPaused) {
      // After pause, start deleting
      timer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, 1500) // 1.5s pause at full text
    } else if (isDeleting) {
      // If we've deleted back to just the base text
      if (typewriterText === baseText) {
        setIsDeleting(false)
        // Move to next language
        setTypewriterIndex((prev) => (prev + 1) % languagesWithFlags.length)
      } else {
        // Continue deleting
        timer = setTimeout(() => {
          setTypewriterText(prev => prev.substring(0, prev.length - 1))
        }, 60) // 60ms per character for deleting
      }
    } else {
      // Typing mode
      if (typewriterText === fullText) {
        // Done typing this language, pause before deleting
        setIsPaused(true)
      } else {
        // Continue typing
        timer = setTimeout(() => {
          // Only add the next character if we're not at the base text length yet
          if (typewriterText.length < baseText.length) {
            // Type the base text first
            setTypewriterText(prev => baseText.substring(0, prev.length + 1))
          } else {
            // Then type the language part
            const languagePart = languageText.substring(0, typewriterText.length - baseText.length + 1)
            setTypewriterText(baseText + languagePart)
          }
        }, 100) // 100ms per character for typing
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [typewriterText, typewriterIndex, isDeleting, isPaused, languagesWithFlags])

  // Initialize with base text
  useEffect(() => {
    // Start with empty string to trigger the typing effect
    setTypewriterText('')
    setTypewriterIndex(0)
    setIsDeleting(false)
    setIsPaused(false)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Stats data
  const stats = [
    { number: '200+', label: 'Languages Supported' },
    { number: '10K+', label: 'Videos Translated' },
    { number: '99.9%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'AI Processing' }
  ]

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      content: 'This platform revolutionized my international content strategy. The lip-sync is so natural!',
      avatar: '👩‍💻',
      flag: '🇺🇸',
      rating: 5
    },
    {
      name: 'Dr. Raj Patel',
      role: 'University Professor',
      content: 'Perfect for translating educational content. Students across the globe can now access my lectures.',
      avatar: '👨‍🏫',
      flag: '🇮🇳',
      rating: 5
    },
    {
      name: 'Maria Rodriguez',
      role: 'Business Owner',
      content: 'Expanded my customer base to 5 new countries. The voice cloning maintains our brand voice perfectly.',
      avatar: '👩‍💼',
      flag: '🇪🇸',
      rating: 5
    }
  ]

  // Process steps
  const processSteps = [
    {
      step: 1,
      title: 'Upload Video',
      description: 'Simply upload your video file in any supported format',
      icon: '📤'
    },
    {
      step: 2,
      title: 'Select Language',
      description: 'Choose from 200+ target languages for translation',
      icon: '🌍'
    },
    {
      step: 3,
      title: 'AI Processing',
      description: 'Our AI handles transcription, translation, and voice synthesis',
      icon: '⚡'
    },
    {
      step: 4,
      title: 'Download',
      description: 'Download your translated video with perfect lip-sync',
      icon: '🎬'
    }
  ]

  // FAQ data
  const faqs = [
    {
      question: 'How accurate is the lip-sync technology?',
      answer: 'Our AI achieves 95%+ accuracy in lip synchronization using advanced neural networks trained on thousands of hours of multilingual video data.'
    },
    {
      question: 'What video formats are supported?',
      answer: 'We support MP4, MOV, AVI, WebM, and most common video formats up to 500MB in size. Higher resolutions up to 4K are supported.'
    },
    {
      question: 'How long does translation take?',
      answer: 'Processing time depends on video length. Typically, 1 minute of video takes 2-3 minutes to process with all AI enhancements.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! All videos are processed securely with end-to-end encryption and automatically deleted after 24 hours for your privacy.'
    },
    {
      question: 'Can I use my own voice for cloning?',
      answer: 'Absolutely! Upload a voice sample and our AI will clone your voice characteristics for the translated audio.'
    }
  ]

  // Supported languages grid
  const supportedLanguages = [
    { code: '🇫🇷', name: 'French' },
    { code: '🇯🇵', name: 'Japanese' },
    { code: '🇮🇳', name: 'Hindi' },
    { code: '🇧🇷', name: 'Portuguese' },
    { code: '🇩🇪', name: 'German' },
    { code: '🇨🇳', name: 'Chinese' },
    { code: '🇰🇷', name: 'Korean' },
    { code: '🇦🇪', name: 'Arabic' },
    { code: '🇮🇹', name: 'Italian' },
    { code: '🇷🇺', name: 'Russian' },
    { code: '🇳🇱', name: 'Dutch' },
    { code: '🇪🇸', name: 'Spanish' }
  ]

  // Integration logos
  const integrations = [
    { name: 'Whisper', logo: '🔊' },
    { name: 'Wav2Lip', logo: '👄' },
    { name: 'PyTorch', logo: '🔥' },
    { name: 'OpenAI', logo: '🤖' },
    { name: 'FastAPI', logo: '⚡' },
    { name: 'React', logo: '⚛️' }
  ]

  // Enhanced Feature Cards Data (6 total)
  const features = [
    {
      icon: '💋',
      title: 'Lip-sync Synchronization',
      description: 'Advanced AI perfectly synchronizes translated speech with natural lip movements for seamless viewing experience.',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      icon: '🗣️',
      title: 'Voice Cloning & Emotion Retention',
      description: 'Preserve the original speaker\'s voice characteristics and emotional expression in translated audio.',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: '🌐',
      title: 'Multi-language Subtitle Generation',
      description: 'Automatically generate synchronized subtitles in multiple languages with perfect timing and readability.',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '🔊',
      title: 'Background Noise Removal',
      description: 'AI-powered background noise removal for crystal clear audio in every translation.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🎨',
      title: 'AI-Powered Color Tone Adaptation',
      description: 'Intelligent color and tone adjustment for optimal video quality across different lighting conditions.',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      icon: '💬',
      title: 'Emotion-Aware Subtitle Styling',
      description: 'Dynamic subtitle styling that adapts to emotional context and speaking intensity for better engagement.',
      gradient: 'from-violet-500 to-purple-600'
    }
  ]

  // Home page content with all required sections
  const HomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section with AI Gradient Animation */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700">
        {/* Animated Background Waves */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        
        {/* AI Glow Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-glow-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-glow-medium"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              AI-Powered Video Translation Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Translate Human Videos<br />
              <span className="bg-gradient-to-r from-cyan-300 to-green-300 bg-clip-text text-transparent">
                Across Languages — Instantly.
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload. Translate. Sync. Download.
            </p>

            {/* Enhanced Typewriter Text Animation - Fixed height and optimized */}
            <div className="text-2xl lg:text-3xl text-white font-semibold mb-8 h-12 flex items-center justify-center will-change-transform">
              <span className="bg-gradient-to-r from-cyan-300 to-green-300 bg-clip-text text-transparent">
                Translate videos into {typewriterText}
                <span className="ml-1 inline-block w-0.5 h-8 bg-cyan-300 animate-pulse align-middle"></span>
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                to="/upload" 
                className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg flex items-center space-x-3 will-change-transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Video</span>
              </Link>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-2xl hover:bg-white hover:text-indigo-600 transition-colors duration-300 flex items-center space-x-3 will-change-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Watch Demo</span>
              </button>
              <Link 
                to="/help" 
                className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-2xl hover:bg-indigo-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 will-change-transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Need Help?</span>
              </Link>
            </div>

            {/* Country Flag Language Selector */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="text-white font-semibold">English</span>
                </div>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🇮🇳</span>
                  <span className="text-white font-semibold">Hindi</span>
                </div>
              </div>
              <p className="text-indigo-200 text-sm">Select any of 200+ languages for instant translation</p>
            </div>
          </div>
        </div>

        {/* Animated Global Flag Carousel */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden py-4 bg-white/5 backdrop-blur-sm">
          <div className="flex space-x-8 animate-scroll will-change-transform">
            {[...countryFlags, ...countryFlags].map((flag, index) => (
              <div key={index} className="flex-shrink-0 text-2xl hover:scale-125 transition-transform duration-300 ease-in-out will-change-transform">
                {flag}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Translation Example Block */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch how our AI transforms videos while preserving emotions and lip-sync
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Original Video */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-2xl border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-white">🎬</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Original Video</h3>
                <div className="bg-black rounded-2xl aspect-video flex items-center justify-center mb-4">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🔴</div>
                    <p className="text-sm">English Audio</p>
                  </div>
                </div>
                <p className="text-gray-600">Native language with original voice</p>
              </div>
            </div>

            {/* Translated Video */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 shadow-2xl border border-green-200">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-white">🌟</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Translated Video</h3>
                <div className="bg-black rounded-2xl aspect-video flex items-center justify-center mb-4">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🟢</div>
                    <p className="text-sm">Hindi Audio + Perfect Lip-sync</p>
                  </div>
                </div>
                <p className="text-gray-600">Translated with AI voice cloning & lip-sync</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your videos in just four simple steps
            </p>
          </div>
          
          <div className="relative">
            {/* Animated Gradient Line */}
            <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-2/3 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center group relative will-change-transform">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 ease-in-out border-2 border-indigo-100 will-change-transform">
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-3xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              AI-Powered Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of video translation with our advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300 transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group will-change-transform"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ease-in-out shadow-lg will-change-transform`}>
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-indigo-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Languages Grid */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Supported Languages
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              200+ languages with perfect lip-sync and voice cloning
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {supportedLanguages.map((language, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out border border-gray-100 group cursor-pointer will-change-transform"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300 ease-in-out will-change-transform">
                  {language.code}
                </div>
                <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                  {language.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Powered By
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge AI technologies and frameworks
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {integrations.map((integration, index) => (
              <div 
                key={index} 
                className="text-center group cursor-pointer will-change-transform"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 transition-colors duration-300 grayscale group-hover:grayscale-0 transition-opacity duration-300">
                  <span className="text-3xl">{integration.logo}</span>
                </div>
                <div className="font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
                  {integration.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users are saying about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300 will-change-transform">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="text-2xl">{testimonial.flag}</div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Voice Demo Widget */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">AI Voice Demo</h3>
              <p className="text-indigo-100">Hear the difference between original and AI-translated voice</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex justify-center mb-6">
                <div className="bg-white rounded-full p-1 flex">
                  <button className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold transition-colors duration-300">
                    Before
                  </button>
                  <button className="px-6 py-3 rounded-full text-indigo-600 font-semibold transition-colors duration-300">
                    After
                  </button>
                </div>
              </div>
              
              {/* Waveform Visualization */}
              <div className="bg-black/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-1 h-12">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-indigo-300 rounded-full"
                      style={{ height: `${Math.random() * 30 + 10}px` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <button className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg transition-shadow duration-300 will-change-transform">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Play Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our platform
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer will-change-transform"
                onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">{faq.question}</h3>
                  <svg 
                    className={`w-6 h-6 text-indigo-600 transform transition-transform duration-300 ease-in-out ${
                      activeFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {activeFAQ === index && (
                  <p className="text-gray-600 leading-relaxed mt-4 animate-fadeIn">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Break Language Barriers?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already translating their videos with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/upload" 
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg will-change-transform"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Your Video Now
            </Link>
            <p className="text-indigo-200 text-sm">
              Start free — no login required
            </p>
          </div>
        </div>
      </section>
    </div>
  )


  return (
    <div className={`min-h-screen flex flex-col ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-fast"></div>
      </div>

      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-white/20' 
          : 'bg-transparent'
      } ${isDarkMode ? 'bg-gray-800/95' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group will-change-transform">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300 ease-in-out will-change-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className={`font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${
                  isDarkMode ? 'text-white' : ''
                }`}>
                  Human Video Translator
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>AI-Powered Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === '/'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/upload" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === '/upload'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                Upload
              </Link>
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  location.pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                className="ml-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out will-change-transform"
              >
                Get Started
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className={`md:hidden mt-4 pb-4 space-y-2 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } pt-4`}>
              <Link 
                to="/" 
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/upload" 
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Upload Video
              </Link>
              <Link 
                to="/dashboard" 
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                className="block px-4 py-2 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 z-10 pt-20">
        {location.pathname === '/' ? <HomePage /> : <AppRoutes />}
      </main>

      {/* Footer with Transparency */}
      <footer className={`bg-white/80 backdrop-blur-md border-t ${
        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'border-gray-200'
      } mt-auto`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Human Video Translator
                </span>
              </div>
              <p className={`mb-4 max-w-md ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Advanced AI-powered video translation platform that breaks language barriers with perfect lip-sync and voice cloning technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-indigo-600'
                }`}>
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-indigo-600'
                }`}>
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>Features</a></li>
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>Pricing</a></li>
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>API</a></li>
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>About</a></li>
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>Blog</a></li>
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>Careers</a></li>
                <li><a href="#" className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-indigo-600'
                }`}>Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div
  className={`border-t mt-8 pt-8 text-center ${
    isDarkMode ? 'border-gray-700' : 'border-gray-200'
  }`}
>
  {/* Developed by */}
  <p className="mb-4 text-lg sm:text-xl font-extrabold tracking-widest">
    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
      Developed by{' '}
    </span>

    {/* Name animation */}
    <span
      className="
        inline-flex overflow-hidden whitespace-nowrap
        border-r-2 border-purple-500
        animate-typing-name
        align-middle
      "
      style={{ width: '14ch' }}
    >
      <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
        Abhinek
      </span>
      <span className="ml-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Pandey
      </span>
    </span>
  </p>

  {/* Copyright */}
  <p
    className={`px-4 py-2 inline-block rounded-full text-sm font-semibold ${
      isDarkMode
        ? 'bg-gray-800 text-gray-300'
        : 'bg-indigo-50 text-indigo-700'
    }`}
  >
    © {new Date().getFullYear()} Human Video Translator. All rights reserved.
  </p>

  {/* Animation */}
  <style>{`
    @keyframes typingName {
      from { width: 0 }
      to { width: 14ch }
    }
    @keyframes blink {
      50% { border-color: transparent }
    }
    .animate-typing-name {
      animation:
        typingName 3s steps(14) infinite alternate,
        blink 1s step-end infinite;
    }
  `}</style>
</div>

        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(10px) translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes glow-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes glow-medium {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes count {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-glow-slow { animation: glow-slow 4s ease-in-out infinite; }
        .animate-glow-medium { animation: glow-medium 3s ease-in-out infinite; }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-count { animation: count 0.5s ease-out; }
      `}</style>
    </div>
  )
}
