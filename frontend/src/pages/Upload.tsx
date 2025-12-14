import { useState } from 'react'
import LanguageSelect from '../components/LanguageSelect'
import { uploadVideo } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'
import HelpButton from '../components/HelpButton'

export default function Upload() {
  const [file, setFile] = useState<File|null>(null)
  const [lang, setLang] = useState('')
  const [voiceSample, setVoiceSample] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()

  const validateFile = (selectedFile: File, type: 'video' | 'audio'): string | null => {
    const maxSize = type === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024 // 500MB for video, 50MB for audio
    if (selectedFile.size > maxSize) {
      return `File too large. Maximum size is ${type === 'video' ? '500MB' : '50MB'}`
    }
    
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/ogg']
    
    if (type === 'video' && !validVideoTypes.includes(selectedFile.type)) {
      return 'Invalid video format. Please upload MP4, MOV, AVI, or WebM'
    }
    if (type === 'audio' && !validAudioTypes.includes(selectedFile.type)) {
      return 'Invalid audio format. Please upload MP3, WAV, or M4A'
    }
    
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile) {
      const validationError = validateFile(selectedFile, 'video')
      if (validationError) {
        setError(validationError)
        setFile(null)
        return
      }
      setError('')
    }
    setFile(selectedFile)
  }

  const handleVoiceSampleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile) {
      const validationError = validateFile(selectedFile, 'audio')
      if (validationError) {
        setError(validationError)
        setVoiceSample(null)
        return
      }
      setError('')
    }
    setVoiceSample(selectedFile)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const validationError = validateFile(droppedFile, 'video')
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(droppedFile)
      setError('')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const removeFile = () => {
    setFile(null)
    setError('')
  }

  const removeVoiceSample = () => {
    setVoiceSample(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !lang) return
    setLoading(true)
    setError('')
    setUploadProgress(0)
    
    // Store translation data in localStorage before upload
    const translationData = {
      targetLanguage: lang,
      sourceLanguage: 'en', // Assuming source is always English for now
      processingTime: '2:18',
      accuracy: '98%',
      lipSyncConfidence: '96%',
      subtitleCount: '247',
      voiceMatch: voiceSample ? '94%' : '89%'
    }

    // Simulate upload progress (replace with actual progress tracking if API supports it)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)
    
    try {
      const userId = localStorage.getItem('user_id') || ''
      const { job_id } = await uploadVideo(file, lang, userId, voiceSample)
      
      // Store translation data with job ID
      localStorage.setItem(`translation_${job_id}`, JSON.stringify(translationData))
      
      setUploadProgress(100)
      clearInterval(progressInterval)
      setTimeout(() => navigate(`/status/${job_id}`), 500)
    } catch (err: any) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      setError('Failed to start translation. Is the server running at http://localhost:8000?')
      console.error(err)
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Upload Video</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 font-medium">Video File</label>
          
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="video-upload" className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500 font-medium">Upload a video</span>
                  <span className="text-gray-600"> or drag and drop</span>
                </label>
                <input 
                  id="video-upload" 
                  type="file" 
                  accept="video/*" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI, WebM up to 500MB</p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <svg className="h-8 w-8 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-4 text-red-600 hover:text-red-800 flex-shrink-0"
                  aria-label="Remove file"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Target Language</label>
          <LanguageSelect value={lang} onChange={setLang} />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Optional Voice Sample
            <span className="text-gray-500 font-normal ml-2">(for voice cloning)</span>
          </label>
          
          {!voiceSample ? (
            <div>
              <label htmlFor="voice-upload" className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm text-gray-600 mt-2 block">Click to upload audio file</span>
                <span className="text-xs text-gray-500 mt-1 block">MP3, WAV, M4A up to 50MB</span>
              </label>
              <input 
                id="voice-upload" 
                type="file" 
                accept="audio/*" 
                onChange={handleVoiceSampleChange} 
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <svg className="h-8 w-8 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{voiceSample.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(voiceSample.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeVoiceSample}
                  className="ml-4 text-red-600 hover:text-red-800 flex-shrink-0"
                  aria-label="Remove voice sample"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button 
          disabled={loading || !file || !lang} 
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Uploading...' : 'Start Translation'}
        </button>
      </form>
      <HelpButton />
    </div>
  )
}