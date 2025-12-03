import Link from 'next/link'
import { Users, Clock, BarChart3, ArrowLeft } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage students, start polls, and view attendance reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Students */}
          <Link href="/admin/students">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Manage Students
              </h2>
              <p className="text-gray-600">
                Add, edit, or remove students from the system
              </p>
            </div>
          </Link>

          {/* Start Attendance Poll */}
          <Link href="/admin/attendance">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Attendance Poll
              </h2>
              <p className="text-gray-600">
                Start a new attendance polling session
              </p>
            </div>
          </Link>

          {/* View Reports */}
          <Link href="/admin/attendance/logs">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Attendance Logs
              </h2>
              <p className="text-gray-600">
                View detailed attendance reports and history
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}