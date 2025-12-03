'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { studentApi } from '@/lib/api'
import { Student } from '@/lib/types'
import StudentTable from '@/components/StudentTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    department: '',
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await studentApi.getAll()
      setStudents(data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.id, formData)
      } else {
        await studentApi.create(formData)
      }
      await fetchStudents()
      setShowForm(false)
      setEditingStudent(null)
      setFormData({ name: '', roll_no: '', department: '' })
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save student')
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      roll_no: student.roll_no,
      department: student.department,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    
    try {
      await studentApi.delete(id)
      await fetchStudents()
    } catch (error) {
      alert('Failed to delete student')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Manage Students
              </h1>
              <p className="text-gray-600 mt-2">
                Total Students: {students.length}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingStudent(null)
                setFormData({ name: '', roll_no: '', department: '' })
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                label="Roll Number"
                type="text"
                value={formData.roll_no}
                onChange={(e) =>
                  setFormData({ ...formData, roll_no: e.target.value })
                }
                required
              />
              <Input
                label="Department"
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              />
              <div className="flex gap-2">
                <Button type="submit" variant="primary">
                  {editingStudent ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingStudent(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <StudentTable
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}