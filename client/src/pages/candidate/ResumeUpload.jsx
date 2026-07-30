import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ResumeUpload() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/candidate/profile', { replace: true })
  }, [])
  return null
}