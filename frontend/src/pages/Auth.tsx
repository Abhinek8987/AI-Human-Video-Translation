import { useState } from 'react'
import { login } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'
import HelpButton from '../components/HelpButton'

export default function Auth() {
  const [email, setEmail] = useState('student@example.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { token, user_id } = await login(email, password)
      localStorage.setItem('token', token)
      localStorage.setItem('user_id', user_id)
      navigate('/upload')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-8 bg-white rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border rounded w-full px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded w-full px-3 py-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60">{loading?'Signing in...':'Sign in'}</button>
      </form>
      <HelpButton />
    </div>
  )
}
