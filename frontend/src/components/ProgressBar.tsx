type Props = { value: number }
export default function ProgressBar({ value }: Props) {
  const pct = Math.round(value * 100)
  return (
    <div className="w-full bg-gray-200 rounded h-2">
      <div className="bg-indigo-600 h-2 rounded" style={{ width: `${pct}%` }} />
    </div>
  )
}
