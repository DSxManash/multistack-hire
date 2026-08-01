import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ to = '/', label = 'Back', className = '', position = 'top-left' }) {
  const positions = {
    'top-left': 'absolute top-6 left-6',
    'top-right': 'absolute top-6 right-6',
    'inline': 'relative',
  }
  
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white ${positions[position]} ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}
