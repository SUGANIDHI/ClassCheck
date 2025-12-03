'use client'

import { useState } from 'react'
import { Student } from '@/lib/types'
import Input from './ui/Input'
import Button from './ui/Button'

interface AttendanceFormProps {
  students: Student[]
  onSubmit: (studentId: number) => Promise<void>
}

export default function AttendanceForm({ students, onSubmit }: AttendanceFormProps) {
  const [rollNo, setRollNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const student = students.find((s) => s.roll_no === rollNo)
    if (!student) {
      setError('Student not found. Please check your roll number.')
      return
    }

    setLoading(true)
    try {
      await onSubmit(student.id)
      setSuccess(true)
      setRollNo('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Enter Your Roll Number"
        type="text"
        value={rollNo}
        onChange={(e) => setRollNo(e.target.value)}
        placeholder="e.g., CS001"
        error={error}
        required
      />
      
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ Attendance marked successfully!
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading || !rollNo}
      >
        {loading ? 'Marking...' : 'Mark Attendance'}
      </Button>
    </form>
  )
}