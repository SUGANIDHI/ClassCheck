'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface TimerProps {
  remainingSeconds: number
  onExpire?: () => void
}

export default function Timer({ remainingSeconds: initialSeconds, onExpire }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.()
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, onExpire])

  const isWarning = seconds <= 60
  const isCritical = seconds <= 30

  return (
    <div
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-2xl ${
        isCritical
          ? 'bg-red-100 text-red-700'
          : isWarning
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      <Clock className="w-6 h-6" />
      <span>{formatDuration(seconds)}</span>
    </div>
  )
}