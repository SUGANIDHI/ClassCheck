'use client'

import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { attendanceApi, studentApi } from '@/lib/api'
import { PollStatus, Student } from '@/lib/types'
import AttendanceForm from '@/components/AttendanceForm'
import PollStatusComponent from '@/components/PollStatus'

export default function StudentPage() {
  const { data: pollStatus, mutate: mutatePoll } = useSWR<PollStatus>(
    'poll-status',
    () => attendanceApi.getCurrentPoll(),
    { refreshInterval: 3000 }
  )

  const { data: students } = useSWR<Student[]>('students', () =>
    studentApi.getAll()
  )

  const handleMarkAttendance = async (studentId: number) => {
    if (!pollStatus?.poll_id) {
      throw new Error('No active poll')
    }
    await attendanceApi.markAttendance(studentId, pollStatus.poll_id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Attendance
          </h1>
          <p className="text-gray-600">
            Mark your attendance when the poll is active
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Poll Status
          </h2>
          {pollStatus && (
            <PollStatusComponent
              status={pollStatus}
              onRefresh={() => mutatePoll()}
            />
          )}
        </div>

        {pollStatus?.is_active && students ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mark Your Attendance
            </h2>
            <AttendanceForm
              students={students}
              onSubmit={handleMarkAttendance}
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                No Active Poll
              </h3>
              <p className="text-yellow-800">
                There is currently no active attendance poll. Please wait for
                your instructor to start a new session.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}