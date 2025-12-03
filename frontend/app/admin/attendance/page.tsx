'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { attendanceApi, studentApi } from '@/lib/api'
import { PollStatus, Student } from '@/lib/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PollStatusComponent from '@/components/PollStatus'

export default function AttendancePollPage() {
  const [duration, setDuration] = useState('5')
  const [starting, setStarting] = useState(false)
  
  const { data: pollStatus, mutate: mutatePoll } = useSWR<PollStatus>(
    'poll-status',
    () => attendanceApi.getCurrentPoll(),
    { refreshInterval: 2000 }
  )

  const { data: students } = useSWR<Student[]>(
    'students',
    () => studentApi.getAll()
  )

  const { data: presentStudents } = useSWR(
    pollStatus?.is_active ? `attendance-${pollStatus.poll_id}` : null,
    async () => {
      if (pollStatus?.poll_id) {
        const logs = await attendanceApi.getAttendanceLogs(pollStatus.poll_id)
        return logs.records
      }
      return []
    },
    { refreshInterval: 2000 }
  )

  const handleStartPoll = async (e: React.FormEvent) => {
    e.preventDefault()
    setStarting(true)
    try {
      await attendanceApi.startPoll(parseInt(duration))
      await mutatePoll()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start poll'
      alert(errorMessage)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Attendance Poll
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Start Poll Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Start New Poll
            </h2>
            <form onSubmit={handleStartPoll} className="space-y-4">
              <Input
                label="Duration (minutes)"
                type="number"
                min="1"
                max="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={pollStatus?.is_active}
              />
              <Button
                type="submit"
                variant="success"
                size="lg"
                className="w-full"
                disabled={pollStatus?.is_active || starting}
              >
                {starting ? 'Starting...' : 'Start Attendance Poll'}
              </Button>
            </form>
          </div>

          {/* Poll Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Current Status
            </h2>
            {pollStatus && (
              <PollStatusComponent
                status={pollStatus}
                onRefresh={() => mutatePoll()}
              />
            )}
          </div>
        </div>

        {/* Live Attendance */}
        {pollStatus?.is_active && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Live Attendance
              </h2>
              <div className="text-lg font-semibold text-blue-600">
                {presentStudents?.length || 0} / {students?.length || 0} Present
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students?.map((student) => {
                const isPresent = presentStudents?.some(
                  (record) => record.student_id === student.id
                )
                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-lg border-2 ${
                      isPresent
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.roll_no}
                        </p>
                      </div>
                      {isPresent && (
                        <span className="text-green-600 text-2xl">✓</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}