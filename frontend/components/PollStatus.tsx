'use client'

import { PollStatus as PollStatusType } from '@/lib/types'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import Timer from './ui/Timer'

interface PollStatusProps {
  status: PollStatusType
  onRefresh?: () => void
}

export default function PollStatus({ status, onRefresh }: PollStatusProps) {
  if (!status.is_active) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-lg">No active attendance poll</p>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-300 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold text-green-800">
            Attendance Poll Active
          </span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Timer
          remainingSeconds={status.remaining_seconds || 0}
          onExpire={onRefresh}
        />
      </div>
    </div>
  )
}