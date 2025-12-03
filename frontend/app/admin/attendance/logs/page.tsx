'use client'

import { useState } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { attendanceApi } from '@/lib/api'
import { AttendancePoll } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function AttendanceLogsPage() {
  const [selectedPollId, setSelectedPollId] = useState<number | null>(null)

  const { data: polls } = useSWR<AttendancePoll[]>('polls', () =>
    attendanceApi.getAllPolls()
  )

  const { data: logs } = useSWR(
    selectedPollId ? `logs-${selectedPollId}` : null,
    () => selectedPollId ? attendanceApi.getAttendanceLogs(selectedPollId) : null
  )

  const handleExport = () => {
    if (!logs) return

    const csv = [
      ['Roll No', 'Name', 'Status', 'Marked At'],
      ...logs.records.map((r) => [
        r.student_roll_no,
        r.student_name,
        'Present',
        formatDateTime(r.marked_at),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${selectedPollId}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Attendance Logs
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Polls List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Poll
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {polls?.map((poll) => (
                  <button
                    key={poll.id}
                    onClick={() => setSelectedPollId(poll.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedPollId === poll.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">
                      Poll #{poll.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(poll.start_time)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {poll.duration_minutes} min
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Poll Details */}
          <div className="lg:col-span-2">
            {logs ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Poll #{logs.poll_id} Details
                  </h2>
                  <Button onClick={handleExport} variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {logs.total_students}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {logs.present_count}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {logs.absent_count}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {logs.attendance_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Records Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Marked At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.records.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.student_roll_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.student_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatDateTime(record.marked_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
                Select a poll to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}