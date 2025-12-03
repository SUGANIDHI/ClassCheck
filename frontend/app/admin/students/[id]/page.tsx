'use client'

import { use, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { studentApi, attendanceApi } from '@/lib/api'
import { Student, AttendanceRecord } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [student, setStudent] = useState<Student | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await studentApi.getById(parseInt(resolvedParams.id))
        const attendanceData = await attendanceApi.getStudentAttendance(parseInt(resolvedParams.id))
        setStudent(studentData)
        setAttendance(attendanceData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Student not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/admin/students"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {student.name}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Roll Number</p>
              <p className="text-lg font-semibold">{student.roll_no}</p>
            </div>
            <div>
              <p className="text-gray-600">Department</p>
              <p className="text-lg font-semibold">{student.department}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Attendance History
          </h2>
          {attendance.length === 0 ? (
            <p className="text-gray-600">No attendance records found</p>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-600">
                    Poll ID: {record.poll_id}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(record.marked_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}