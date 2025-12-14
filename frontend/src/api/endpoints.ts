import { api } from './client'

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/mock-login', { email, password })
  return data
}

export type LanguageOption = { code: string; label: string }
export const getLanguages = async (): Promise<LanguageOption[]> => {
  const { data } = await api.get('/languages')
  // Prefer options with full labels; otherwise build from codes
  if (Array.isArray(data?.options)) return data.options as LanguageOption[]
  const codes: string[] = Array.isArray(data?.languages) ? data.languages : []
  return codes.map((c: string) => ({ code: c, label: c }))
}

export const uploadVideo = async (
  file: File,
  targetLanguage: string,
  userId: string,
  voiceSample?: File | null,
) => {
  const form = new FormData()
  form.append('file', file)
  form.append('target_language', targetLanguage)
  form.append('user_id', userId)
  if (voiceSample) form.append('voice_sample', voiceSample)
  const { data } = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as { job_id: string; message: string }
}

export const jobStatus = async (jobId: string) => {
  const { data } = await api.get(`/jobs/${jobId}`)
  return data as { job_id: string; status: string; progress: number; message?: string }
}

export const getDashboard = async (userId: string) => {
  const { data } = await api.get(`/dashboard/${userId}`)
  return data
}
