import axios from 'axios'
import type { Student, AttendancePoll, PollStatus, AttendanceRecord, AttendanceLog } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Student API
export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/students/')
    return response.data
  },

  getById: async (id: number): Promise<Student> => {
    const response = await api.get(`/students/${id}`)
    return response.data
  },

  create: async (student: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
    const response = await api.post('/students/', student)
    return response.data
  },

  update: async (id: number, student: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, student)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`)
  },
}

// Attendance API
export const attendanceApi = {
  startPoll: async (duration_minutes: number): Promise<AttendancePoll> => {
    const response = await api.post('/attendance/start', { duration_minutes })
    return response.data
  },

  getCurrentPoll: async (): Promise<PollStatus> => {
    const response = await api.get('/attendance/current')
    return response.data
  },

  markAttendance: async (student_id: number, poll_id: number): Promise<AttendanceRecord> => {
    const response = await api.post('/attendance/mark', { student_id, poll_id })
    return response.data
  },

  getAttendanceLogs: async (poll_id: number): Promise<AttendanceLog> => {
    const response = await api.get(`/attendance/logs/${poll_id}`)
    return response.data
  },

  getAllPolls: async (): Promise<AttendancePoll[]> => {
    const response = await api.get('/attendance/logs')
    return response.data
  },

  getStudentAttendance: async (student_id: number): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/attendance/student/${student_id}`)
    return response.data
  },
}

export default api