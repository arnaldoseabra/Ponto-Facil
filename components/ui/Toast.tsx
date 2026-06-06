import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { Toast, ToastType } from '../../types'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
}

const styles: Record<ToastType, string> = {
  success: 'border-emerald-500/40 bg-emerald-900/60',
  error: 'border-red-500/40 bg-red-900/60',
  warning: 'border-yellow-500/40 bg-yellow-900/60',
  info: 'border-blue-500/40 bg-blue-900/60',
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl pointer-events-auto animate-slide-down ${styles[toast.type]}`}
        >
          <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
          <p className="text-sm text-white flex-1 leading-relaxed">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 text-slate-400 hover:text-white transition-colors duration-200 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
