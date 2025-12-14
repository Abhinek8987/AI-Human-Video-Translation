import { useEffect, useState } from 'react'
import { getLanguages, type LanguageOption } from '../api/endpoints'

type Props = { value: string; onChange: (v: string) => void }
export default function LanguageSelect({ value, onChange }: Props) {
  const DEFAULT_OPTIONS: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ar', label: 'Arabic' },
  ]
  const [options, setOptions] = useState<LanguageOption[]>(DEFAULT_OPTIONS)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    getLanguages()
      .then(list => { if (mounted && Array.isArray(list) && list.length) setOptions(list) })
      .catch(() => { /* keep defaults */ })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="border rounded px-3 py-2">
      <option value="" disabled>{loading ? 'Loading languages...' : 'Select language'}</option>
      {options.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
    </select>
  )
}
