type Props = { src: string }
export default function VideoPlayer({ src }: Props) {
  return (
    <video src={src} controls className="w-full rounded border" />
  )
}
