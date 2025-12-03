import Link from 'next/link'
import { UserCircle, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          ClassCheck
        </h1>
        <p className="text-xl text-gray-600">
          Modern Attendance Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        {/* Admin Card */}
        <Link href="/admin">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
                <ShieldCheck className="w-16 h-16 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin</h2>
              <p className="text-gray-600 text-center">
                Manage students, start attendance polls, and view reports
              </p>
            </div>
          </div>
        </Link>

        {/* Student Card */}
        <Link href="/student">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-6 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                <UserCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Student</h2>
              <p className="text-gray-600 text-center">
                Mark your attendance during active polling sessions
              </p>
            </div>
          </div>
        </Link>
      </div>

      <footer className="mt-16 text-gray-500 text-sm">
        <p>© 2024 ClassCheck. All rights reserved.</p>
      </footer>
    </div>
  )
}