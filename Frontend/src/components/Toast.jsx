import useToast from '../store/useToast'

export default function Toast() {
  const message = useToast(s => s.message)
  if (!message) return null
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg">
      {message}
    </div>
  )
}
